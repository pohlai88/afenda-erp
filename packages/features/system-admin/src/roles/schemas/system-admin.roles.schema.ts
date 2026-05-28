import { organizationRoles } from "@afenda/auth";
import { z } from "zod";

export const systemAdminAssignRoleInputSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(organizationRoles),
});

export const systemAdminRemoveRoleAssignmentInputSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(organizationRoles),
});

export type SystemAdminAssignRoleInput = z.infer<
  typeof systemAdminAssignRoleInputSchema
>;
export type SystemAdminRemoveRoleAssignmentInput = z.infer<
  typeof systemAdminRemoveRoleAssignmentInputSchema
>;
