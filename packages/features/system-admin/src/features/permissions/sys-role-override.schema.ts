import { organizationRoles } from "@afenda/kernel";
import { z } from "zod";
import { isSystemAdminPermissionKey } from "./sys-permission-catalog.contract";
import {
  requiresElevatedPermissionConfirmation,
  requiresHighRiskPermissionConfirmation,
} from "./sys-permission-risk.shared";
import { systemAdminPermissionKeySchema } from "./sys-permission-key.schema";

export const systemAdminRoleOverrideActionSchema = z
  .object({
    role: z.enum(organizationRoles),
    permissionKey: systemAdminPermissionKeySchema.refine(
      isSystemAdminPermissionKey,
      "Select a catalog permission.",
    ),
    enabled: z.boolean(),
    confirmHighRisk: z.enum(["true", "false"]).optional(),
  })
  .superRefine((value, context) => {
    if (
      requiresHighRiskPermissionConfirmation(value.permissionKey, value.enabled) &&
      value.confirmHighRisk !== "true"
    ) {
      context.addIssue({
        code: "custom",
        message: requiresElevatedPermissionConfirmation(
          value.permissionKey,
          value.enabled,
        )
          ? "Critical permission grants require elevated confirmation."
          : "High-risk permission grants require explicit confirmation.",
        path: ["confirmHighRisk"],
      });
    }
  });

export const updateRolePermissionBundleInputSchema = z.object({
  roleId: z.string().min(1),
  permissionKeys: z.array(systemAdminPermissionKeySchema),
});
