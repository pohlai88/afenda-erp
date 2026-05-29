import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, runWithBootstrapContext } from "../src/client";
import { listOrganizationsForCoreErpSeed } from "../src/erp";
import { createEntityId } from "../src/ids";
import { seedHrWorkforceFoundation } from "../src/hr";
import { organizations, userProfiles } from "../src/schema";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });
config({ path: resolve(rootDir, ".secret.config"), override: true });

const seedDatabaseUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.DATABASE_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL;

if (!seedDatabaseUrl) {
  throw new Error(
    "A database URL is missing. Provide DATABASE_MIGRATION_URL, DATABASE_URL, or NEON_PREVIEW_DATABASE_URL before seeding HR workforce data (same order as db:migrate).",
  );
}

process.env.DATABASE_URL = seedDatabaseUrl;

const DEMO_ORG_ID = "org_afenda_demo";
const DEMO_USER_ID = "user_demo_owner";
const DEMO_ORG_NAME = "Afenda Operations";
const DEMO_USER_EMAIL = "owner@afenda.local";
const DEMO_USER_NAME = "Demo Operator";

function allowDemoBootstrap() {
  return (
    process.env.HR_SEED_BOOTSTRAP_DEMO !== "0" &&
    process.env.NODE_ENV !== "production"
  );
}

async function ensureDemoTenantForHrSeed() {
  const db = getDb();
  const [existing] = await db
    .select({
      id: organizations.id,
      ownerAuthUserId: organizations.ownerAuthUserId,
    })
    .from(organizations)
    .where(eq(organizations.id, DEMO_ORG_ID))
    .limit(1);

  if (existing) {
    return existing;
  }

  await runWithBootstrapContext(DEMO_USER_ID, DEMO_ORG_ID, async (tx) => {
    await tx
      .insert(userProfiles)
      .values({
        id: createEntityId("usr"),
        authUserId: DEMO_USER_ID,
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME,
        defaultOrganizationId: DEMO_ORG_ID,
      })
      .onConflictDoNothing();

    await tx
      .insert(organizations)
      .values({
        id: DEMO_ORG_ID,
        slug: "afenda-operations",
        name: DEMO_ORG_NAME,
        ownerAuthUserId: DEMO_USER_ID,
      })
      .onConflictDoNothing();

    const membershipId = createEntityId("mbr");
    await tx.execute(sql`
      INSERT INTO organization_memberships (id, organization_id, auth_user_id, role)
      VALUES (${membershipId}, ${DEMO_ORG_ID}, ${DEMO_USER_ID}, 'owner')
      ON CONFLICT DO NOTHING
    `);
  });

  process.stdout.write(
    `HR workforce seed: bootstrapped demo tenant ${DEMO_ORG_ID} for local dev.\n`,
  );

  return { id: DEMO_ORG_ID, ownerAuthUserId: DEMO_USER_ID };
}

async function resolveHrSeedTargets() {
  const listed = await listOrganizationsForCoreErpSeed();
  if (listed.length > 0) {
    return listed;
  }

  const explicitOrgId = process.env.HR_SEED_ORGANIZATION_ID?.trim();
  const fallbackOrgId = explicitOrgId || DEMO_ORG_ID;
  const db = getDb();
  const [demoOrg] = await db
    .select({
      id: organizations.id,
      ownerAuthUserId: organizations.ownerAuthUserId,
    })
    .from(organizations)
    .where(eq(organizations.id, fallbackOrgId))
    .limit(1);

  if (demoOrg) {
    return [demoOrg];
  }

  if (allowDemoBootstrap()) {
    return [await ensureDemoTenantForHrSeed()];
  }

  return [];
}

const seedTargets = await resolveHrSeedTargets();
let seededOrganizations = 0;
let skippedOrganizations = 0;

if (seedTargets.length === 0) {
  process.stderr.write(
    "HR workforce seed: no organizations found. Sign in to the ERP once, set HR_SEED_ORGANIZATION_ID, or allow local bootstrap (default in non-production):\n  pnpm exec tsx packages/db/scripts/seed-hr-workforce.mts\n  HR_SEED_BOOTSTRAP_DEMO=0  # disable demo tenant bootstrap\n",
  );
  process.exit(0);
}

for (const organization of seedTargets) {
  const result = await seedHrWorkforceFoundation({
    organizationId: organization.id,
  });

  if (result.seeded) {
    seededOrganizations += 1;
    process.stdout.write(
      `HR workforce seeded for ${organization.id} (${result.employeeCount} employees).\n`,
    );
  } else {
    skippedOrganizations += 1;
    process.stdout.write(
      `HR workforce skipped for ${organization.id} (${result.employeeCount} existing employees).\n`,
    );
  }
}

process.stdout.write(
  `HR workforce seed complete: ${seededOrganizations} seeded, ${skippedOrganizations} skipped (${seedTargets.length} organizations checked).\n`,
);
