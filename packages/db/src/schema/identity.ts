import { uniqueIndex, pgTable, text } from "drizzle-orm/pg-core";
import { timestampColumns } from "./common";

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: text("id").primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    defaultOrganizationId: text("default_organization_id"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("user_profiles_auth_user_id_idx").on(table.authUserId),
    uniqueIndex("user_profiles_email_idx").on(table.email),
  ],
);
