import {
  buildSystemAdminOverviewStatGrid,
  systemAdminOverviewStatSurfaceKey,
} from "../surfaces/system-admin.overview-stat.surface";
import type { SystemAdminOverviewSnapshot } from "../contracts";

export {
  buildSystemAdminOverviewStatGrid,
  systemAdminOverviewStatSurfaceKey,
};

export function buildSystemAdminOverviewStatGroups(input: {
  snapshot: SystemAdminOverviewSnapshot;
}) {
  return [
    {
      groupKey: "overview",
      configuration: buildSystemAdminOverviewStatGrid(input),
    },
  ] as const;
}
