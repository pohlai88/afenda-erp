import { organizationRoles } from "@afenda/auth";
import { z } from "zod";

export const systemAdminInviteMemberActionSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  role: z.enum(organizationRoles).default("staff"),
});
