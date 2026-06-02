import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { organizationRoleEnum, timestampColumns } from "./common";
import { userProfiles } from "./identity";

export const objectStorageProviderEnum = pgEnum("object_storage_provider", [
  "vercel-blob",
  "r2",
]);

export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    ownerAuthUserId: text("owner_auth_user_id").notNull(),
    /** Per-org object storage provider override; null uses deployment default. */
    objectStorageProvider: objectStorageProviderEnum("object_storage_provider"),
    ...timestampColumns,
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

export const organizationMembershipStatusEnum = pgEnum(
  "organization_membership_status",
  ["active", "suspended", "removed"],
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    authUserId: text("auth_user_id").notNull(),
    role: organizationRoleEnum("role").notNull(),
    status: organizationMembershipStatusEnum("status").notNull().default("active"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("organization_memberships_org_user_idx").on(
      table.organizationId,
      table.authUserId,
    ),
    index("organization_memberships_user_idx").on(table.authUserId),
  ],
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(organizationMemberships),
}));

export const organizationMembershipsRelations = relations(
  organizationMemberships,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMemberships.organizationId],
      references: [organizations.id],
    }),
    userProfile: one(userProfiles, {
      fields: [organizationMemberships.authUserId],
      references: [userProfiles.authUserId],
    }),
  }),
);
