import { organizationRoles } from "@afenda/auth";
import { z } from "zod";

export const systemAdminInviteUserInputSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  role: z.enum(organizationRoles).default("staff"),
});

export const systemAdminUserStatusInputSchema = z.object({
  membershipId: z.string().min(1),
  status: z.enum(["suspended", "active"]),
});

export type SystemAdminInviteUserInput = z.infer<
  typeof systemAdminInviteUserInputSchema
>;
export type SystemAdminUserStatusInput = z.infer<
  typeof systemAdminUserStatusInputSchema
>;
