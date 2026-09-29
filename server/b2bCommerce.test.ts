import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return { user: undefined, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("B2B Cabral checkout policy", () => {
  it("keeps a qualified 5 kg B2B request in demo and returns separated terms", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.commerce.createOrder({
      idempotencyKey: "b2b-cabral-demo-0001",
      channel: "b2b",
      b2bPackageWeightKg: 5,
      b2bDiscountPercent: 5,
      b2bCommissionPercent: 5,
      customer: { name: "Restaurante Teste LTDA", document: "12345678000195", whatsapp: "61999999999" },
      items: [{ productId: 1, quantity: "5.000" }],
    });
    expect(result).toMatchObject({ mode: "demo", persisted: false, productsTotalCents: 99_250, totalCents: 111_259 });
    expect(result.commercialTerms).toMatchObject({ tableValueCents: 99_250, commercialReferenceCents: 117_115, discountCents: 5_856, finalPriceCents: 111_259, packageWeightKg: 5, status: "reference_blocked" });
  });

  it("rejects a B2B request without a CNPJ or a package weight matching the item total", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.commerce.createOrder({
      idempotencyKey: "b2b-cabral-demo-0002",
      channel: "b2b",
      b2bPackageWeightKg: 5,
      customer: { name: "Restaurante Teste", whatsapp: "61999999999" },
      items: [{ productId: 1, quantity: "5.000" }],
    })).rejects.toThrow(/CNPJ/);
    await expect(caller.commerce.createOrder({
      idempotencyKey: "b2b-cabral-demo-0003",
      channel: "b2b",
      b2bPackageWeightKg: 5,
      customer: { name: "Restaurante Teste LTDA", document: "12345678000195", whatsapp: "61999999999" },
      items: [{ productId: 1, quantity: "4.000" }],
    })).rejects.toThrow(/pacote fechado|peso declarado/);
  });
});
