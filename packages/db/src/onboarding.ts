import { eq } from "drizzle-orm";
import { insertAuditLog } from "./audit";
import { runWithBootstrapContext } from "./client";
import { seedCoreErpModuleData } from "./erp";
import { createEntityId } from "./ids";
import { organizationMemberships, organizations, userProfiles } from "./schema";
import {
  getUserProfile,
  listOrganizationsForUser,
  setDefaultOrganizationForUser,
  upsertUserProfile,
} from "./session";

function normalizeOrganizationSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function bootstrapOrganizationForUser(input: {
  authUserId: string;
  email: string;
  name: string;
  organizationName: string;
}) {
  const trimmedOrganizationName = input.organizationName.trim();

  await upsertUserProfile({
    authUserId: input.authUserId,
    email: input.email,
    name: input.name,
  });

  const existingOrganizations = await listOrganizationsForUser(input.authUserId);

  if (existingOrganizations.length > 0) {
    const profile = await getUserProfile(input.authUserId);

    if (
      profile?.defaultOrganizationId &&
      existingOrganizations.some(
        (organization) => organization.id === profile.defaultOrganizationId,
      )
    ) {
      return profile.defaultOrganizationId;
    }

    await setDefaultOrganizationForUser({
      authUserId: input.authUserId,
      organizationId: existingOrganizations[0].id,
    });

    return existingOrganizations[0].id;
  }

  const organizationId = createEntityId("org");
  const membershipId = createEntityId("member");
  const baseSlug = normalizeOrganizationSlug(trimmedOrganizationName);

  await runWithBootstrapContext(
    input.authUserId,
    organizationId,
    async (db) => {
      let slug = baseSlug;
      let suffix = 1;

      while (true) {
        try {
          await db.insert(organizations).values({
            id: organizationId,
            name: trimmedOrganizationName,
            slug,
            ownerAuthUserId: input.authUserId,
          });
          break;
        } catch (error) {
          if (!isUniqueViolation(error)) {
            throw error;
          }

          suffix += 1;
          slug = `${baseSlug}-${suffix}`;
        }
      }

      await db.insert(organizationMemberships).values({
        id: membershipId,
        organizationId,
        authUserId: input.authUserId,
        role: "owner",
      });

      await db
        .update(userProfiles)
        .set({
          defaultOrganizationId: organizationId,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.authUserId, input.authUserId));

      await insertAuditLog(db, {
        organizationId,
        actorAuthUserId: input.authUserId,
        entityType: "organization",
        entityId: organizationId,
        action: "organization.bootstrap",
        summary: "Created initial tenant workspace during onboarding.",
        metadata: {
          slug,
          source: "initial-onboarding",
        },
      });
    },
  );

  await seedCoreErpModuleData({
    organizationId,
    actorAuthUserId: input.authUserId,
  });

  await runWithBootstrapContext(
    input.authUserId,
    organizationId,
    async (db) => {
      await insertAuditLog(db, {
        organizationId,
        actorAuthUserId: input.authUserId,
        entityType: "system",
        entityId: organizationId,
        action: "erp.seed-core-modules",
        summary:
          "Seeded initial ERP module records, saved views, and workflow items.",
        metadata: {
          source: "initial-onboarding",
          modules: [
            "finance",
            "sales",
            "purchasing",
            "inventory",
            "hr",
            "crm",
            "approvals",
            "reports",
            "admin",
          ],
        },
      });
    },
  );

  return organizationId;
}
