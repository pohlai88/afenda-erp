import "server-only";

import { getOrganizationContext } from "@afenda/kernel/server";

import { resolveErpCapabilityForPermission } from "./erp-permission-capability.shared";
import type { ErpPermissionRequirement } from "./gov-erp-permission-requirement-schema";
import type { ErpPermissionTuple } from "./gov-erp-permission-shared";

export async function canUseErpPermissionForCurrentOrg(
  permission: ErpPermissionTuple,
): Promise<boolean> {
  const capability = resolveErpCapabilityForPermission(permission);
  if (!capability) {
    return false;
  }

  const { hasCapability } = await getOrganizationContext();
  return hasCapability(capability);
}

export async function resolveGovernedErpPermissionAllowed(
  requirement: ErpPermissionRequirement | undefined,
): Promise<boolean> {
  if (!requirement) {
    return true;
  }

  return canUseErpPermissionForCurrentOrg({
    module: requirement.module,
    object: requirement.object,
    function: requirement.function,
  });
}
