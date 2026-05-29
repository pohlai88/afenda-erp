import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Minimal Stripe SDK surface used by root maintenance scripts. */
export type StripeScriptClient = {
  accounts: {
    retrieve(): Promise<{
      id: string;
      settings?: { dashboard?: { display_name?: string } };
    }>;
  };
  prices: {
    retrieve(
      priceId: string,
    ): Promise<{
      id: string;
      type: string;
      currency: string;
      unit_amount: number | null;
    }>;
  };
  customers: {
    create(
      params: Record<string, unknown>,
    ): Promise<{ id: string }>;
  };
  checkout: {
    sessions: {
      create(
        params: Record<string, unknown>,
      ): Promise<{ id: string; url: string | null }>;
    };
  };
};

export function loadStripeScriptClient(secretKey: string): StripeScriptClient {
  const StripeCtor = require(
    "../packages/billing/node_modules/stripe/cjs/stripe.cjs.node.js",
  ).default as new (secretKey: string) => StripeScriptClient;

  return new StripeCtor(secretKey);
}
