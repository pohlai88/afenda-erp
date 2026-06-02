import { loadAfendaEnv } from "./cloudflare/load-afenda-env.mts";
import {
  createCloudflareClient,
  getCloudflareAccountId,
  getCloudflareApiToken,
} from "./cloudflare/cloudflare-client.shared.mts";
import { listAccountZones } from "./cloudflare/r2-cloudflare-api.shared.mts";

loadAfendaEnv();

const token = getCloudflareApiToken();
const accountId = getCloudflareAccountId();

if (!token) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "Missing CLOUDFLARE_API_TOKEN",
        hints: [
          "Create token: Cloudflare dashboard → My Profile → API Tokens",
          "Permissions: Account R2 Edit + Zone Read (or Zone DNS Edit for custom domains)",
          "Store in `.secret.config`, then `pnpm env:sync:all`",
          "Cloudflare MCP OAuth (Cursor plugin) works without this token for agent checks",
        ],
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

try {
  const client = createCloudflareClient();
  const zones = await listAccountZones(client, accountId);

  console.log(
    JSON.stringify(
      {
        ok: true,
        accountId,
        zoneCount: zones.length,
        zones: zones.map((zone) => ({
          id: zone.id,
          name: zone.name,
          status: zone.status,
        })),
        sdk: "cloudflare-typescript",
        mcp: {
          servers: [
            "cloudflare (execute/search)",
            "cloudflare-bindings (r2_bucket_get)",
          ],
        },
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        accountId,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
