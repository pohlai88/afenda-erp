import { z } from "zod";

export const systemAdminPermissionKeySchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/);
