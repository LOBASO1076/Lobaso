import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  // This file remains the Vercel entrypoint. The application itself is built
  // into one ESM file by `pnpm build`, avoiding runtime module-not-found errors.
  const bundlePath = "../dist/vercel-handler.mjs";
  const { default: appHandler } = await import(bundlePath) as {
    default: (request: Request, response: Response) => Promise<unknown>;
  };
  return appHandler(req, res);
}
