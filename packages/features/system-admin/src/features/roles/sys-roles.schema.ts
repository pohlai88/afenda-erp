import { organizationRoles } from "@afenda/kernel";
import { z } from "zod";

export const systemAdminAssignRoleInputSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(organizationRoles),
});

export const systemAdminRemoveRoleAssignmentInputSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(organizationRoles),
});

export const systemAdminUpdateRoleInputSchema = z.object({
  role: z.enum(organizationRoles),
  displayName: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
});

export const systemAdminDeprecateRoleInputSchema = z.object({
  role: z.enum(organizationRoles),
});

export const systemAdminReactivateRoleInputSchema = z.object({
  role: z.enum(organizationRoles),
});

export type SystemAdminAssignRoleInput = z.infer<
  typeof systemAdminAssignRoleInputSchema
>;
export type SystemAdminRemoveRoleAssignmentInput = z.infer<
  typeof systemAdminRemoveRoleAssignmentInputSchema
>;
export type SystemAdminUpdateRoleInput = z.infer<
  typeof systemAdminUpdateRoleInputSchema
>;
