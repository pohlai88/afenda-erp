import type { OrganizationRole } from "@afenda/auth";

export type SystemAdminRoleStatus = "active" | "deprecated";

export type SystemAdminRoleDefinition = {
  id: OrganizationRole;
  key: OrganizationRole;
  name: string;
  description: string;
  status: SystemAdminRoleStatus;
};

export type SystemAdminRoleRow = SystemAdminRoleDefinition & {
  assignedMembers: number;
  permissionCount?: number;
};

export const systemAdminSeedRoles = [
  {
    id: "owner",
    key: "owner",
    name: "Owner",
    description: "Highest organization authority. Cannot be removed casually.",
    status: "active",
  },
  {
    id: "admin",
    key: "admin",
    name: "Admin",
    description: "Can manage system settings, users, and control evidence.",
    status: "active",
  },
  {
    id: "finance-manager",
    key: "finance-manager",
    name: "Manager",
    description: "Can manage operational teams and assigned module work.",
    status: "active",
  },
  {
    id: "operations-manager",
    key: "operations-manager",
    name: "Operations Manager",
    description:
      "Can manage operational workflows across sales, purchasing, inventory, and CRM.",
    status: "active",
  },
  {
    id: "staff",
    key: "staff",
    name: "Operator",
    description: "Can execute day-to-day ERP work.",
    status: "active",
  },
  {
    id: "viewer",
    key: "viewer",
    name: "Viewer",
    description: "Read-only business access.",
    status: "active",
  },
] as const satisfies readonly SystemAdminRoleDefinition[];
