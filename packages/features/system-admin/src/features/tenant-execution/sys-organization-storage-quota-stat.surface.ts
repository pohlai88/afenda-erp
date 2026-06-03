import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { OrganizationStorageQuotaSnapshot } from "../data/system-admin.organization-storage-quota.read-model.server";

export const systemAdminOrganizationStorageQuotaSurfaceKey =
  "system-admin.organization-storage-quota";

export function buildSystemAdminOrganizationStorageQuotaStatGrid(input: {
  snapshot: OrganizationStorageQuotaSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: "Storage consumed",
        value: snapshot.consumedLabel,
        tone: snapshot.tone,
      },
      {
        label: "Storage quota",
        value: snapshot.quotaLabel,
        tone: "default",
      },
      {
        label: "Quota utilization",
        value: snapshot.usagePercentLabel,
        tone: snapshot.tone,
      },
    ],
  });
}

export function buildSystemAdminOrganizationStorageQuotaStatGroups(input: {
  snapshot: OrganizationStorageQuotaSnapshot;
}) {
  return [
    {
      groupKey: "organization-storage-quota",
      configuration: buildSystemAdminOrganizationStorageQuotaStatGrid(input),
    },
  ] as const;
}
