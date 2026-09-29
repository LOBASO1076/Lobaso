import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getBrasiliaBusinessDayBounds, isSeafoodBoilSku } from "./commerce";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAuthenticatedContext(): TrpcContext {
  return {
    ...createPublicContext(),
    user: {
      id: 999999,
      openId: "commerce-test-user",
      name: "Commerce Test",
      email: "commerce@example.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

describe("commerce API contracts", () => {
  it("identifies Boil SKUs and calculates the Brasília business day", () => {
    expect(isSeafoodBoilSku("BOIL-6P")).toBe(true);
    expect(isSeafoodBoilSku("CAM-31/35")).toBe(false);
    const bounds = getBrasiliaBusinessDayBounds(new Date("2026-09-28T02:30:00.000Z"));
    expect(bounds.start.toISOString()).toBe("2026-09-27T03:00:00.000Z");
    expect(bounds.end.toISOString()).toBe("2026-09-28T03:00:00.000Z");
  });

  it("exposes a catalog with the required authoritative price fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.commerce.catalog();

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products[0]).toMatchObject({
      id: expect.any(Number),
      sku: expect.any(String),
      name: expect.any(String),
      unit: expect.any(String),
      sellPriceCents: expect.any(Number),
    });
  });

  it("accepts the complete canonical nine-item checkout request without client prices", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const catalog = await caller.commerce.catalog();
    const items = catalog.products.slice(0, 9).map((product) => ({ productId: product.id, quantity: "1.000" }));

    expect(items).toHaveLength(9);
    expect(items.every((item) => !("unitPriceCents" in item))).toBe(true);
    const cartTotal = catalog.products.slice(0, 9).reduce((sum, product) => sum + product.sellPriceCents, 0);
    expect(cartTotal).toBe(182854);
  });

  it("rejects an order creation input without a valid idempotency key", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.commerce.createOrder({
      idempotencyKey: "short",
      channel: "b2c",
      customer: { name: "Cliente Teste", whatsapp: "61999999999" },
      items: [{ productId: 1, quantity: "1.000" }],
    })).rejects.toThrow();
  });

  it("blocks the Control Tower without a tenant membership", async () => {
    const caller = appRouter.createCaller(createAuthenticatedContext());
    await expect(caller.commerce.controlTower()).rejects.toThrow("não possui acesso a um tenant");
  });
});
