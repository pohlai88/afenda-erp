import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import {
  buildLinkedControlListSurface,
  coverageVerdictBadge,
  linkCell,
  moduleReadinessVerdictBadge,
} from "../overview/sys-control-list.shared";
import type { SystemAdminCapabilityAvailability } from "./sys-capabilities.contract";
import { systemAdminCapabilitiesUiCopy } from "./sys-capabilities-ui.copy.shared";
import { resolveSystemAdminCapabilityRowTrailingAction } from "./sys-capabilities-list-trailing.shared";

export const systemAdminCapabilitiesSurfaceKey =
  "system-admin.capabilities.list";

export function buildCapabilitiesListSurface(input: {
  capabilities: ReadonlyArray<{
    id: string;
    capability: string;
    module: string;
    route: string;
    requiredPermission: string;
    availability: SystemAdminCapabilityAvailability;
    accessCoverage: string;
    auditCoverage: string;
    docsCoverage: string;
    coverageVerdict: string;
    readinessVerdict: string;
    issues: string;
    routeHref?: string;
  }>;
  searchValue?: string;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  return buildLinkedControlListSurface({
    key: systemAdminCapabilitiesSurfaceKey,
    title: systemAdminCapabilitiesUiCopy.list.title,
    object: "capabilities",
    columns: [
      {
        id: "capability",
        header: "Capability",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "module", header: "Module", cellKind: { kind: "link" } },
      { id: "route", header: "Route", cellKind: { kind: "link" } },
      { id: "requiredPermission", header: "Permission", cellKind: { kind: "link" } },
      { id: "availability", header: "Availability", cellKind: { kind: "badge" } },
      { id: "readinessVerdict", header: "Readiness", cellKind: { kind: "badge" } },
      { id: "coverageVerdict", header: "Coverage", cellKind: { kind: "badge" } },
      { id: "accessCoverage", header: "Access" },
      { id: "auditCoverage", header: "Audit" },
      { id: "docsCoverage", header: "Docs" },
      { id: "issues", header: "Issues" },
    ],
    rows: input.capabilities.map((capability) => {
      const routeHref =
        capability.routeHref ??
        (capability.route.startsWith("/") ? capability.route : undefined);

      return {
        id: capability.id,
        cells: {
          capability: capability.capability,
          module: capability.module,
          route: capability.route,
          requiredPermission: capability.requiredPermission,
          availability: capability.availability,
          readinessVerdict: capability.readinessVerdict,
          coverageVerdict: capability.coverageVerdict,
          accessCoverage: capability.accessCoverage,
          auditCoverage: capability.auditCoverage,
          docsCoverage: capability.docsCoverage,
          issues: capability.issues,
        },
        rowHref: routeHref,
        linkColumnId: "capability",
        cellKinds: {
          capability: linkCell(
            routeHref ?? systemAdminControlLinks.capabilities(capability.capability),
          ),
          module: linkCell(systemAdminControlLinks.modules(capability.module)),
          route: routeHref
            ? linkCell(routeHref)
            : { kind: "text" as const },
          requiredPermission: linkCell(
            systemAdminControlLinks.permissions(capability.requiredPermission),
          ),
          availability: coverageVerdictBadge(
            capability.availability === "enabled"
              ? "covered"
              : capability.availability,
          ),
          readinessVerdict: moduleReadinessVerdictBadge(
            capability.readinessVerdict,
          ),
          coverageVerdict: coverageVerdictBadge(capability.coverageVerdict),
        },
        trailingAction: resolveSystemAdminCapabilityRowTrailingAction({
          capabilityKey: capability.id,
          availability: capability.availability,
          canMutate,
        }),
      };
    }),
    emptyTitle: systemAdminCapabilitiesUiCopy.list.emptyTitle,
    emptyDescription: systemAdminCapabilitiesUiCopy.list.emptyDescription,
    searchPlaceholder: systemAdminCapabilitiesUiCopy.list.searchPlaceholder,
    searchValue: input.searchValue,
  });
}
