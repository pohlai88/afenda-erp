import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { describeAiGatewayCredentialSources } from "../packages/config/src/env.ts";
import { getGatewaySpendReport } from "../packages/ai/src/gateway.ts";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.config", ".env.local", "apps/erp/.env.local"]) {
  config({ path: resolve(rootDir, file), override: false });
}

const credentials = describeAiGatewayCredentialSources();
const report = await getGatewaySpendReport({
  organizationId: "org_env_verify",
});

const keyPresence = {
  AI_GATEWAY_API_KEY: Boolean(process.env.AI_GATEWAY_API_KEY?.trim()),
  VERCEL_API_TOKEN: Boolean(process.env.VERCEL_API_TOKEN?.trim()),
  VERCEL_TOKEN: Boolean(process.env.VERCEL_TOKEN?.trim()),
  VERCEL_OIDC_TOKEN: Boolean(process.env.VERCEL_OIDC_TOKEN?.trim()),
};

console.log(
  JSON.stringify(
    {
      filesLoaded: [".env.config", ".env.local", "apps/erp/.env.local"],
      keyPresence,
      credentials,
      spendReport: {
        available: report.available,
        authenticationFailed: report.authenticationFailed ?? false,
        entryCount: report.entries.length,
      },
      hints:
        !keyPresence.AI_GATEWAY_API_KEY && !keyPresence.VERCEL_API_TOKEN
          ? [
              "Set AI_GATEWAY_API_KEY in `.env.config`, then run `pnpm env:sync`.",
            ]
          : report.authenticationFailed
            ? [
                "Gateway rejected the API key (401). Create or refresh a key in Vercel → AI Gateway → API keys.",
                "https://vercel.com/docs/ai-gateway/capabilities/custom-reporting",
              ]
            : !report.available
              ? [
                  "Credentials are set but no spend data returned for this period (empty or API error).",
                ]
              : [],
    },
    null,
    2,
  ),
);

if (!credentials.reportApiKeyConfigured) {
  process.exitCode = 1;
}
