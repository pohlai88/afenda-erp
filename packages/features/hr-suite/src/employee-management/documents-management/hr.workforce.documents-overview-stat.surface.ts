import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { HrDocumentsOverviewSnapshot } from "@afenda/db";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export const hrDocumentsOverviewStatSurfaceKey =
  "hr.workforce.documents.overview.stats";

function formatSnapshotCount(count: number, label: string): string {
  return `${count.toLocaleString("en-US")} ${label}`;
}

function buildOverviewStatGridBase(
  stats: StatCardConfigurationResolvedInput["stats"],
): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats,
  });
}

export function buildHrDocumentsOverviewVaultStatGrid(input: {
  snapshot: HrDocumentsOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Active documents",
      value: formatSnapshotCount(snapshot.activeDocumentCount, "active"),
      tone: "default",
    },
    {
      label: "Pending verification",
      value: formatSnapshotCount(
        snapshot.pendingVerificationCount,
        "pending",
      ),
      tone: snapshot.pendingVerificationCount > 0 ? "attention" : "default",
    },
  ]);
}

export function buildHrDocumentsOverviewExpiryStatGrid(input: {
  snapshot: HrDocumentsOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Expiring soon",
      value: formatSnapshotCount(snapshot.expiringSoonCount, "expiring"),
      tone: snapshot.expiringSoonCount > 0 ? "attention" : "default",
    },
    {
      label: "Expired on file",
      value: formatSnapshotCount(snapshot.expiredActiveCount, "expired"),
      tone: snapshot.expiredActiveCount > 0 ? "critical" : "default",
    },
  ]);
}

export function buildHrDocumentsOverviewStatGroups(input: {
  snapshot: HrDocumentsOverviewSnapshot;
}) {
  const copy = hrDocumentsUiCopy.overview;

  return [
    {
      groupKey: "vault",
      label: copy.riskGroupLabel,
      configuration: buildHrDocumentsOverviewVaultStatGrid(input),
    },
    {
      groupKey: "expiry",
      label: copy.followUpGroupLabel,
      configuration: buildHrDocumentsOverviewExpiryStatGrid(input),
    },
  ] as const;
}
