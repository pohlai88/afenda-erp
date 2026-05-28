import { organizationRoles } from "@afenda/auth";
import { z } from "zod";
import { isSystemAdminPermissionKey } from "../contracts";

export const systemAdminInviteMemberActionSchema = z.object({
  email: z.email(),
  role: z.enum(organizationRoles),
});

export const systemAdminRoleChangeActionSchema = z.object({
  authUserId: z.string().min(1),
  role: z.enum(organizationRoles),
});

export const systemAdminRoleOverrideActionSchema = z.object({
  role: z.enum(organizationRoles),
  permissionKey: z
    .string()
    .min(1)
    .refine(isSystemAdminPermissionKey, "Select a catalog capability."),
  enabled: z.boolean(),
});
