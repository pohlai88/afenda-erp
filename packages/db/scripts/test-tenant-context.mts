import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { strict as assert } from "node:assert";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { erpWorkItems } from "../src/schema";
import {
  ORGANIZATION_GUC_KEY,
  readOrganizationGuc,
  runWithOrganizationContext,
} from "../src/tenant-context";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });
config({ path: resolve(rootDir, ".secret.config"), override: true });

const databaseUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.DATABASE_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL;

if (!databaseUrl) {
  process.stdout.write(
    "Skipping tenant context integration test (no DATABASE_URL).\n",
  );
  process.exit(0);
}

process.env.DATABASE_URL = databaseUrl;

const primaryOrganizationId = "org_tenant_context_test";
const secondaryOrganizationId = "org_tenant_context_other";

await runWithOrganizationContext(primaryOrganizationId, async (db) => {
  const activeOrganizationId = await readOrganizationGuc(db);
  assert.equal(activeOrganizationId, primaryOrganizationId);
});

const scopedRows = await runWithOrganizationContext(
  primaryOrganizationId,
  async (db) =>
    db
      .select({
        id: erpWorkItems.id,
        organizationId: erpWorkItems.organizationId,
      })
      .from(erpWorkItems)
      .where(eq(erpWorkItems.organizationId, secondaryOrganizationId))
      .limit(5),
);

assert.equal(
  scopedRows.length,
  0,
  "RLS must block cross-tenant reads when organization GUC is set.",
);

process.stdout.write(
  `Tenant context integration passed for ${ORGANIZATION_GUC_KEY} with cross-tenant isolation.\n`,
);
