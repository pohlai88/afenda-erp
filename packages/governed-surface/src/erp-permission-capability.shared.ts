import {
  appCapabilities,
  documentReadCapability,
  documentWriteCapability,
  isAppCapability,
  type AppCapability,
} from "@afenda/kernel";

import type { ErpPermissionTuple } from "./gov-erp-permission-shared";

/**
 * Maps governed `requiresErpPermission` tuples to kernel capabilities.
 * Returns `null` when no known capability applies (caller must deny).
 */
export function resolveErpCapabilityForPermission(
  permission: ErpPermissionTuple,
): AppCapability | null {
  const { module, object, function: fn } = permission;

  if (module === "system-admin" && fn === "read") {
    const objectRead = `${module}.${object}.read`;
    if (isAppCapability(objectRead)) {
      return objectRead;
    }
  }

  switch (fn) {
    case "read": {
      const view = `${module}.view`;
      if (isAppCapability(view)) {
        return view;
      }
      return documentReadCapability(module);
    }
    case "search": {
      const docRead = documentReadCapability(module);
      if (docRead) {
        return docRead;
      }
      const view = `${module}.view`;
      return isAppCapability(view) ? view : null;
    }
    case "create":
    case "update":
    case "delete":
      return documentWriteCapability(module);
    case "audit": {
      const auditRead = `${module}.audit.read`;
      if (isAppCapability(auditRead)) {
        return auditRead;
      }
      return documentReadCapability(module);
    }
    case "predict": {
      const lynxRead = `${module}.lynx.read`;
      if ((appCapabilities as readonly string[]).includes(lynxRead)) {
        return lynxRead as AppCapability;
      }
      return null;
    }
    default: {
      const _exhaustive: never = fn;
      void _exhaustive;
      return null;
    }
  }
}
