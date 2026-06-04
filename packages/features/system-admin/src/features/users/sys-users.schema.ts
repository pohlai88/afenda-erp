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
