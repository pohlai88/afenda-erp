import type { OrganizationRole } from "@afenda/auth";
import {
  isSystemAdminDeprecatedPermissionKey,
  isSystemAdminProtectedAdminPermission,
  requiresHighRiskPermissionConfirmation,
} from "../contracts/system-admin.permission-risk.shared";

export function assertRolePermissionBundleChangeAllowed(input: {
  role: OrganizationRole;
  permissionKey: string;
  enabled: boolean;
  confirmHighRisk?: boolean;
}) {
  if (input.enabled && isSystemAdminDeprecatedPermissionKey(input.permissionKey)) {
    throw new Error("Deprecated permissions cannot be newly assigned.");
  }

  if (
    requiresHighRiskPermissionConfirmation(input.permissionKey, input.enabled) &&
    input.confirmHighRisk !== true
  ) {
    throw new Error(
      "High-risk permission grants require explicit confirmation.",
    );
  }

  if (
    !input.enabled &&
    (input.role === "owner" || input.role === "admin") &&
    isSystemAdminProtectedAdminPermission(input.permissionKey)
  ) {
    throw new Error(
      "Cannot remove protected admin authority from owner or admin roles.",
    );
  }
}
