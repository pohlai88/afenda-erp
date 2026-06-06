import { organizationRoles } from "@afenda/kernel";
import { z } from "zod";

export const systemAdminInviteUserInputSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  role: z.enum(organizationRoles).default("staff"),
});

export const systemAdminUserStatusInputSchema = z.object({
  membershipId: z.string().min(1),
  status: z.enum(["active", "suspended", "removed"]),
});

export const systemAdminResendInvitationInputSchema = z.object({
  invitationId: z.string().min(1),
});

export const systemAdminCancelInvitationInputSchema = z.object({
  invitationId: z.string().min(1),
});

export const systemAdminInspectUserAccessInputSchema = z.object({
  membershipId: z.string().min(1),
});

export const systemAdminNeonAuthIdentityInputSchema = z.object({
  membershipId: z.string().min(1),
});

export const systemAdminCreateNeonAuthUserInputSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(8).max(256).optional(),
  role: z.string().trim().min(1).max(64).optional(),
});

export type SystemAdminInviteUserInput = z.infer<
  typeof systemAdminInviteUserInputSchema
>;
export type SystemAdminUserStatusInput = z.infer<
  typeof systemAdminUserStatusInputSchema
>;
export type SystemAdminResendInvitationInput = z.infer<
  typeof systemAdminResendInvitationInputSchema
>;
export type SystemAdminInspectUserAccessInput = z.infer<
  typeof systemAdminInspectUserAccessInputSchema
>;
export type SystemAdminNeonAuthIdentityInput = z.infer<
  typeof systemAdminNeonAuthIdentityInputSchema
>;
export type SystemAdminCreateNeonAuthUserInput = z.infer<
  typeof systemAdminCreateNeonAuthUserInputSchema
>;
