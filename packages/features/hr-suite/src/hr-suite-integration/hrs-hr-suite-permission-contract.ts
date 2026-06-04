import type {
  ErpFunction,
  ErpPermissionRequirement,
} from "@afenda/governed-surface";

import { HR_MODULE_ID, type HrModuleId } from "./hrs-hr-suite-module-contract";

export type HrSuiteErpPermissionDescriptor = Omit<
  ErpPermissionRequirement,
  "module"
> & {
  readonly module: HrModuleId;
};

export type DefineHrSuiteErpPermissionInput = {
  readonly object: string;
  readonly function: ErpFunction;
};

function normalizePermissionObject(object: string): string {
  const normalized = object.trim();
  if (normalized.length === 0) {
    throw new Error("HR permission object must not be empty.");
  }
  return normalized;
}

export function defineHrSuiteErpPermission(
  input: DefineHrSuiteErpPermissionInput,
): HrSuiteErpPermissionDescriptor {
  return {
    module: HR_MODULE_ID,
    object: normalizePermissionObject(input.object),
    function: input.function,
  };
}

export function defineHrSuiteReadPermission(
  object: string,
): HrSuiteErpPermissionDescriptor {
  return defineHrSuiteErpPermission({ object, function: "read" });
}

