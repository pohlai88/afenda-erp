import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { getGatewaySpendReport } from "../packages/ai/src/ai-gateway.repository.server.ts";
import { describeAiGatewayCredentialSources } from "../packages/config/src/env.ts";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.config", ".env.local", "apps/erp/.env.local"]) {
  config({ path: resolve(rootDir, file), override: false });
}
config({ path: resolve(rootDir, ".secret.config"), override: true });

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
      filesLoaded: [
        ".env.config",
        ".env.local",
        "apps/erp/.env.local",
        ".secret.config",
      ],
      keyPresence,
      credentials,
      spendReport: {
        available: report.available,
        authenticationFailed: report.authenticationFailed ?? false,
        entryCount: report.entries.length,
      },
      hints:
        !credentials.hasAiGatewayRuntimeCredentials
          ? [
              "Set AI_GATEWAY_API_KEY in `.secret.config` and run `pnpm env:sync`, or run `vercel env pull` to refresh VERCEL_OIDC_TOKEN.",
            ]
          : report.authenticationFailed
            ? [
                "Gateway rejected the runtime credential (401). Create or refresh an AI Gateway API key, or refresh VERCEL_OIDC_TOKEN with `vercel env pull`.",
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

if (!credentials.hasAiGatewayRuntimeCredentials) {
  process.exitCode = 1;
}
