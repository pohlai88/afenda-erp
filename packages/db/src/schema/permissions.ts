import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { organizationRoleEnum, timestampColumns } from "./common";

export const permissions = pgTable("permissions", {
  key: text("key").primaryKey(),
  module: text("module").notNull(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  ...timestampColumns,
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    role: organizationRoleEnum("role").notNull(),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => permissions.key, { onDelete: "cascade" }),
    ...timestampColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.role, table.permissionKey],
      name: "role_permissions_pk",
    }),
    index("role_permissions_permission_idx").on(table.permissionKey),
  ],
);

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  permission: one(permissions, {
    fields: [rolePermissions.permissionKey],
    references: [permissions.key],
  }),
}));
