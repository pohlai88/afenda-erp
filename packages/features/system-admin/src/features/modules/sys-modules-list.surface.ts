import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { ModuleId } from "@afenda/config/module-ids";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
  moduleReadinessVerdictBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminModuleAvailability } from "../contracts";
import { systemAdminModulesUiCopy } from "../surface/system-admin.modules-ui.copy.shared";
import { resolveSystemAdminModuleRowTrailingAction } from "../surface/system-admin.modules-list-trailing.shared";

export const systemAdminModulesSurfaceKey = "system-admin.modules.list";

export function buildModulesListSurface(input: {
  modules: ReadonlyArray<{
    id: string;
    module: string;
    category: string;
    status: string;
    availability: SystemAdminModuleAvailability;
    visibility: string;
    capabilities: string;
    permissions: string;
    policies: string;
    readinessVerdict: string;
    lastChanged: string;
    href?: string;
  }>;
  searchValue?: string;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  const listCopy = systemAdminModulesUiCopy.listSurface;

  return buildLinkedControlListSurface({
    key: systemAdminModulesSurfaceKey,
    title: listCopy.title,
    object: "modules",
    columns: [
      {
        id: "module",
        header: "Module",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "category", header: "Category" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "availability", header: "Availability", cellKind: { kind: "badge" } },
      { id: "visibility", header: "Visibility" },
      { id: "capabilities", header: "Capabilities", cellKind: { kind: "link" } },
      { id: "permissions", header: "Permission", cellKind: { kind: "link" } },
      { id: "policies", header: "Policies", cellKind: { kind: "link" } },
      { id: "readinessVerdict", header: "Readiness", cellKind: { kind: "badge" } },
      { id: "lastChanged", header: "Last updated" },
    ],
    rows: input.modules.map((module) => ({
      id: module.id,
      cells: {
        module: module.module,
        category: module.category,
        status: module.status,
        availability: module.availability,
        visibility: module.visibility,
        capabilities: module.capabilities,
        permissions: module.permissions,
        policies: module.policies,
        readinessVerdict: module.readinessVerdict,
        lastChanged: module.lastChanged,
      },
      rowHref: systemAdminControlLinks.capabilities(module.id),
      linkColumnId: "module",
      cellKinds: {
        module: linkCell(
          module.href ?? systemAdminControlLinks.capabilities(module.id),
        ),
        status: catalogStatusBadge(module.status),
        availability: catalogStatusBadge(module.availability),
        readinessVerdict: moduleReadinessVerdictBadge(module.readinessVerdict),
        capabilities: linkCell(systemAdminControlLinks.capabilities(module.id)),
        permissions: linkCell(
          systemAdminControlLinks.permissions(module.permissions),
        ),
        policies: linkCell(systemAdminControlLinks.policies(module.id)),
      },
      trailingAction: resolveSystemAdminModuleRowTrailingAction({
        moduleKey: module.id as ModuleId,
        availability: module.availability,
        canMutate,
        lifecycleStatus: module.status,
      }),
    })),
    emptyTitle: listCopy.emptyTitle,
    emptyDescription: listCopy.emptyDescription,
    searchPlaceholder: listCopy.searchPlaceholder,
    searchValue: input.searchValue,
  });
}
