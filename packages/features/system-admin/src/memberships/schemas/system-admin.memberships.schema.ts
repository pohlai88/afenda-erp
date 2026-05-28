import { z } from "zod";

export const systemAdminMembershipStatusInputSchema = z.object({
  membershipId: z.string().min(1),
  status: z.enum(["active", "suspended", "removed"]),
});

export type SystemAdminMembershipStatusInput = z.infer<
  typeof systemAdminMembershipStatusInputSchema
>;
