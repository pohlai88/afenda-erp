import { and, asc, eq } from "drizzle-orm";
import { runWithAuthUserContext } from "./client";
import { organizationMemberships, organizations, userProfiles } from "./schema";

export type UserOrganizationRecord = {
  membershipId: string;
  id: string;
  name: string;
  slug: string;
  role:
    | "owner"
    | "admin"
    | "finance-manager"
    | "operations-manager"
    | "staff"
    | "viewer";
};

export type UserProfileSnapshot = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  defaultOrganizationId: string | null;
};

export async function upsertUserProfile(input: {
  authUserId: string;
  email: string;
  name: string;
}) {
  return runWithAuthUserContext(input.authUserId, async (db) => {
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.authUserId, input.authUserId),
    });

    if (!existing) {
      const createdProfile = {
        id: `profile_${input.authUserId}`,
        authUserId: input.authUserId,
        email: input.email,
        name: input.name,
        defaultOrganizationId: null,
      };

      await db.insert(userProfiles).values(createdProfile);

      return createdProfile;
    }

    await db
      .update(userProfiles)
      .set({
        email: input.email,
        name: input.name,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.authUserId, input.authUserId));

    return {
      id: existing.id,
      authUserId: existing.authUserId,
      email: input.email,
      name: input.name,
      defaultOrganizationId: existing.defaultOrganizationId,
    };
  });
}

export async function getUserProfile(authUserId: string) {
  return runWithAuthUserContext(authUserId, async (db) =>
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.authUserId, authUserId),
    }),
  );
}

export async function listOrganizationsForUser(authUserId: string) {
  return runWithAuthUserContext(authUserId, async (db) => {
    const records = await db
      .select({
        membershipId: organizationMemberships.id,
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        role: organizationMemberships.role,
      })
      .from(organizationMemberships)
      .innerJoin(
        organizations,
        eq(organizationMemberships.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationMemberships.authUserId, authUserId),
          eq(organizationMemberships.status, "active"),
        ),
      )
      .orderBy(asc(organizations.name));

    return records satisfies UserOrganizationRecord[];
  });
}

export async function setDefaultOrganizationForUser(input: {
  authUserId: string;
  organizationId: string;
}) {
  return runWithAuthUserContext(input.authUserId, async (db) => {
    await db
      .update(userProfiles)
      .set({
        defaultOrganizationId: input.organizationId,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.authUserId, input.authUserId));
  });
}

export async function userHasOrganizationMembership(input: {
  authUserId: string;
  organizationId: string;
}) {
  return runWithAuthUserContext(input.authUserId, async (db) => {
    const membership = await db.query.organizationMemberships.findFirst({
      where: and(
        eq(organizationMemberships.authUserId, input.authUserId),
        eq(organizationMemberships.organizationId, input.organizationId),
        eq(organizationMemberships.status, "active"),
      ),
    });

    return Boolean(membership);
  });
}
