import "server-only";

import { getOrganizationContext } from "@afenda/auth/server";
import { isAppCapability } from "@afenda/auth";

import type { ErpPermissionRequirement } from "../schemas/erp-permission-requirement.schema";
import type { ErpPermissionTuple } from "./rbac.shared";

function toViewCapability(module: string) {
  return `${module}.view`;
}

export async function canUseErpPermissionForCurrentOrg(
  permission: ErpPermissionTuple,
): Promise<boolean> {
  const { hasCapability } = await getOrganizationContext();

  if (permission.function === "read") {
    const viewCapability = toViewCapability(permission.module);
    if (isAppCapability(viewCapability)) {
      return hasCapability(viewCapability);
    }
  }

  return true;
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
