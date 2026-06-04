import { z } from "zod";
import { systemAdminMembershipStatuses } from "./sys-memberships.contract";

export const systemAdminMembershipStatusFilterSchema = z.enum(
  systemAdminMembershipStatuses,
);

export const systemAdminMembershipStatusInputSchema = z.object({
  membershipId: z.string().min(1),
  status: systemAdminMembershipStatusFilterSchema,
});

export type SystemAdminMembershipStatusInput = z.infer<
  typeof systemAdminMembershipStatusInputSchema
>;
