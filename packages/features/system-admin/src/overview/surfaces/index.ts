import {
  buildSystemAdminOverviewGovernanceStatGrid,
  buildSystemAdminOverviewIdentityStatGrid,
  systemAdminOverviewStatSurfaceKey,
} from "../surfaces/system-admin.overview-stat.surface";
import type { SystemAdminOverviewSnapshot } from "../contracts";

export {
  buildSystemAdminOverviewGovernanceStatGrid,
  buildSystemAdminOverviewIdentityStatGrid,
  systemAdminOverviewStatSurfaceKey,
};

export function buildSystemAdminOverviewStatGroups(input: {
  snapshot: SystemAdminOverviewSnapshot;
}) {
  return [
    {
      groupKey: "identity",
      label: "Identity",
      configuration: buildSystemAdminOverviewIdentityStatGrid(input),
    },
    {
      groupKey: "governance",
      label: "Governance",
      configuration: buildSystemAdminOverviewGovernanceStatGrid(input),
    },
  ] as const;
}
