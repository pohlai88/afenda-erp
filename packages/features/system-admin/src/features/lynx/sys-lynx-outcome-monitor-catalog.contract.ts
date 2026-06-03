export const systemAdminLynxOutcomeMonitorThresholdCatalog = [
  {
    monitorId: "finance-control-watch",
    label: "Finance control watch",
    fields: [
      {
        key: "blockedRecordsWatchAbove",
        label: "Blocked records watch above",
        defaultValue: 0,
      },
      {
        key: "closeControlsWatchAbove",
        label: "Close controls watch above",
        defaultValue: 0,
      },
      {
        key: "highPriorityWorkWatchAbove",
        label: "High-priority work watch above",
        defaultValue: 0,
      },
    ],
  },
  {
    monitorId: "approval-throughput-watch",
    label: "Approval throughput watch",
    fields: [
      {
        key: "escalatedWorkWatchAbove",
        label: "Escalated work watch above",
        defaultValue: 0,
      },
      {
        key: "openProposalsWatchAbove",
        label: "Open proposals watch above",
        defaultValue: 0,
      },
      {
        key: "pendingSandboxesWatchAbove",
        label: "Pending sandboxes watch above",
        defaultValue: 0,
      },
    ],
  },
  {
    monitorId: "audit-readiness-watch",
    label: "Audit readiness watch",
    fields: [
      {
        key: "minimumEvidenceDocuments",
        label: "Minimum evidence documents",
        defaultValue: 1,
      },
    ],
  },
] as const;

export type SystemAdminLynxOutcomeMonitorId =
  (typeof systemAdminLynxOutcomeMonitorThresholdCatalog)[number]["monitorId"];

export type SystemAdminLynxOutcomeMonitorThresholdKey =
  (typeof systemAdminLynxOutcomeMonitorThresholdCatalog)[number]["fields"][number]["key"];

export function getSystemAdminLynxOutcomeMonitorThresholdCatalog(
  monitorId: string,
) {
  return systemAdminLynxOutcomeMonitorThresholdCatalog.find(
    (entry) => entry.monitorId === monitorId,
  );
}
