import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listOrganizationsForCoreErpSeed,
  seedCoreErpModuleData,
} from "../src/erp";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });
config({ path: resolve(rootDir, ".secret.config"), override: true });

const seedDatabaseUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!seedDatabaseUrl) {
  throw new Error(
    "A database URL is missing. Provide DATABASE_URL, NEON_PREVIEW_DATABASE_URL, or DATABASE_MIGRATION_URL before seeding core ERP data.",
  );
}

process.env.DATABASE_URL = seedDatabaseUrl;

const organizations = await listOrganizationsForCoreErpSeed();

for (const organization of organizations) {
  await seedCoreErpModuleData({
    organizationId: organization.id,
    actorAuthUserId: organization.ownerAuthUserId,
  });
}

process.stdout.write(
  `Core ERP module data seeded for ${organizations.length} organizations.\n`,
);
