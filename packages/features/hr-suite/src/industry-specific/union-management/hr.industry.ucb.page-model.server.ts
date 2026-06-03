import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrIndustryUcbListRow } from "./hr.industry.ucb.contract";
import type { HrUcbStatusFilter } from "./hr.industry.ucb-constants.shared";
import { buildHrIndustryUcbListSurface } from "./hr.industry.ucb-lists.surface";
import { buildHrIndustryUcbOverviewStatGrid } from "./hr.industry.ucb-overview-stat.surface";
import {
  hrIndustryUcbAgreementsSurfaceKey,
  hrIndustryUcbAlertsSurfaceKey,
  hrIndustryUcbAssignmentsSurfaceKey,
  hrIndustryUcbAuditTrailSurfaceKey,
  hrIndustryUcbDisputesSurfaceKey,
  hrIndustryUcbDuesReferencesSurfaceKey,
  hrIndustryUcbGrievancesSurfaceKey,
  hrIndustryUcbIntegrationExposuresSurfaceKey,
  hrIndustryUcbLaborMeetingsSurfaceKey,
  hrIndustryUcbMembershipsSurfaceKey,
  hrIndustryUcbRepresentativesSurfaceKey,
  hrIndustryUcbReportsSurfaceKey,
  hrIndustryUcbRuleConflictsSurfaceKey,
  hrIndustryUcbRuleReferencesSurfaceKey,
  hrIndustryUcbSenioritySurfaceKey,
  hrIndustryUcbUnionsSurfaceKey,
  type HrIndustryUcbListSurfaceKey,
} from "./hr.industry.ucb-surface-metadata.shared";
import { hrIndustryUcbUiCopy } from "./hr.industry.ucb-ui.copy.shared";
import type { HrIndustryUcbPageModelInput } from "./hr.industry.ucb-search-params.parse.shared";
import {
  buildHrIndustryUcbReportRows,
  filterHrIndustryUcbRecordsForAccess,
  getHrIndustryUcbStore,
  type HrIndustryUcbStore,
} from "./hr.industry.ucb-store.shared";

const UCB_DEFAULT_PAGE_SIZE = 25;

export type HrIndustryUcbPageModelListSection = {
  readonly surfaceKey: HrIndustryUcbListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrIndustryUcbPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canManageGrievances: boolean;
  readonly canReadLegalReferences: boolean;
  readonly canExposePayroll: boolean;
  readonly canExposeIntegrations: boolean;
  readonly canExportReports: boolean;
  readonly reportGroupBy: HrIndustryUcbPageModelInput["reportGroupBy"];
  readonly status: HrIndustryUcbPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrIndustryUcbPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };

function formatEnumLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Not recorded";
}

function formatList(values: readonly string[] | null | undefined) {
  if (!values || values.length === 0) return "None";
  return values.map(formatEnumLabel).join(", ");
}

function redact(value: string | undefined, canRead: boolean) {
  if (!value) return "Not recorded";
  return canRead ? value : "Restricted";
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, UCB_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, UCB_DEFAULT_PAGE_SIZE);
}

function rowMatchesStatus(
  row: {
    readonly status?: unknown;
    readonly membershipStatus?: unknown;
    readonly approvalStatus?: unknown;
    readonly payrollExposureStatus?: unknown;
    readonly negotiationStatus?: unknown;
    readonly severity?: unknown;
  },
  status: HrUcbStatusFilter,
) {
  if (status === "all") return true;
  return (
    row.status === status ||
    row.membershipStatus === status ||
    row.approvalStatus === status ||
    row.payrollExposureStatus === status ||
    row.negotiationStatus === status ||
    row.severity === status
  );
}

function toneForStatus(
  value: string | undefined,
): HrIndustryUcbListRow["rowTone"] {
  if (!value) return undefined;
  if (
    [
      "blocked",
      "blocker",
      "critical",
      "expired",
      "overdue",
      "rejected",
      "escalated",
      "stalled",
    ].includes(value)
  ) {
    return "critical";
  }
  if (
    [
      "draft",
      "expiring",
      "pending",
      "pending_approval",
      "under_review",
      "meeting_scheduled",
      "pending_decision",
      "warning",
      "preparing",
      "in_negotiation",
      "open",
      "action_pending",
    ].includes(value)
  ) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  readonly surfaceKey: HrIndustryUcbListSurfaceKey;
  readonly rows: readonly HrIndustryUcbListRow[];
  readonly searchValue?: string;
}): HrIndustryUcbPageModelListSection {
  const copy = hrIndustryUcbUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrIndustryUcbListSurface(input),
  };
}

function buildReferenceMaps(store: HrIndustryUcbStore) {
  return {
    unionNameById: new Map(store.unions.map((row) => [row.id, row.name])),
    agreementTitleById: new Map(
      store.agreements.map((row) => [row.id, `${row.agreementCode} - ${row.title}`]),
    ),
    bargainingUnitNameById: new Map(
      store.bargainingUnitAssignments.map((row) => [
        row.bargainingUnitId,
        row.bargainingUnitName,
      ]),
    ),
  };
}

function buildUnionRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.unions
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        union: row.name,
        code: row.unionCode,
        representative: row.representativeRef,
        members: row.activeMemberCount,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildAgreementRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.agreements
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status) ?? toneForStatus(row.negotiationStatus),
      cells: {
        agreement: `${row.agreementCode} v${row.version} - ${row.title}`,
        workforce: row.applicableWorkforce,
        period: `${formatDate(row.effectiveDate)} to ${formatDate(row.expiryDate)}`,
        renewal: formatDate(row.renewalDate),
        negotiation: formatEnumLabel(row.negotiationStatus),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildAssignmentRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.bargainingUnitAssignments
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        employee: row.employeeDisplayName,
        bargainingUnit: row.bargainingUnitName,
        departmentLocation: `${row.departmentName} / ${row.locationName}`,
        role: row.roleName,
        coveredWorkforce: row.coveredWorkforce,
        assigned: formatDate(row.assignmentDate),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildMembershipRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  const maps = buildReferenceMaps(store);
  return store.memberships
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.membershipStatus),
      cells: {
        employee: redact(row.employeeDisplayName, input.canReadRestricted),
        unionRef: maps.unionNameById.get(row.unionId) ?? row.unionId,
        bargainingUnit:
          maps.bargainingUnitNameById.get(row.bargainingUnitId) ??
          row.bargainingUnitId,
        membershipDates: `${formatDate(row.startDate)} to ${formatDate(row.endDate)}`,
        duesEligible: row.duesEligible,
        restrictedReason: redact(
          row.restrictedReason,
          input.canReadRestricted,
        ),
        status: formatEnumLabel(row.membershipStatus),
      },
    }));
}

function buildRuleReferenceRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  const maps = buildReferenceMaps(store);
  return store.ruleReferences
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status) ?? toneForStatus(row.approvalStatus),
      cells: {
        rule: `${formatEnumLabel(row.ruleType)} - ${row.summary}`,
        agreement: maps.agreementTitleById.get(row.agreementId) ?? row.agreementId,
        source: row.sourceRef,
        targets: formatList(row.downstreamTargets),
        approval: formatEnumLabel(row.approvalStatus),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildSeniorityRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.seniorityRankings
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        employee: row.employeeDisplayName,
        rank: row.rank,
        seniorityDate: formatDate(row.seniorityDate),
        scope: row.rankingScope,
        decisionTypes: formatList(row.decisionTypes),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildConflictRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.ruleConflicts
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.severity) ?? toneForStatus(row.status),
      cells: {
        conflict: redact(row.summary, input.canReadRestricted),
        employee: redact(row.employeeDisplayName, input.canReadRestricted),
        rule: `${formatEnumLabel(row.conflictType)} / ${row.ruleRef}`,
        deadline: formatDate(row.deadlineDate),
        blocking: row.actionBlocked ? "Blocking" : "Advisory",
        severity: formatEnumLabel(row.severity),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildDuesRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  const maps = buildReferenceMaps(store);
  return store.duesReferences
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone:
        toneForStatus(row.status) ??
        toneForStatus(row.approvalStatus) ??
        toneForStatus(row.payrollExposureStatus),
      cells: {
        employee: redact(row.employeeDisplayName, input.canReadRestricted),
        unionRef: maps.unionNameById.get(row.unionId) ?? row.unionId,
        deductionRef: row.deductionRef,
        amountRef: input.canExposePayroll ? row.amountRef : "Restricted",
        approval: formatEnumLabel(row.approvalStatus),
        payroll: formatEnumLabel(row.payrollExposureStatus),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildGrievanceRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.grievances
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.severity) ?? toneForStatus(row.status),
      cells: {
        case: row.caseCode,
        employee: redact(
          row.employeeDisplayName,
          input.canReadRestricted || input.canManageGrievances,
        ),
        clause: redact(
          row.agreementClause,
          input.canReadRestricted || input.canManageGrievances,
        ),
        classification: `${formatEnumLabel(row.category)} / ${formatEnumLabel(row.severity)}`,
        process: `Step ${row.stepLevel}, escalation ${row.escalationLevel}`,
        deadline: `${formatDate(row.deadlineDate)} / hearing ${formatDate(row.hearingDate)}`,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildDisputeRows(
  store: HrIndustryUcbStore,
  input: HrIndustryUcbPageModelInput,
): HrIndustryUcbListRow[] {
  return store.disputes
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        dispute: formatEnumLabel(row.disputeType),
        reference: input.canReadLegalReferences ? row.referenceRef : "Restricted",
        owner: row.owner,
        employee: redact(
          row.employeeId,
          input.canReadRestricted || input.canReadLegalReferences,
        ),
        summary: redact(row.summary, input.canReadLegalReferences),
        status: formatEnumLabel(row.status),
      },
    }));
}

export async function buildHrIndustryUcbPageModel(
  input: HrIndustryUcbPageModelInput,
): Promise<HrIndustryUcbPageModel> {
  const store = getHrIndustryUcbStore(input.organizationId);
  const visibleStore = filterHrIndustryUcbRecordsForAccess({
    store,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
  const maps = buildReferenceMaps(visibleStore);
  const reportRows = buildHrIndustryUcbReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrIndustryUcbOverviewStatGrid({
    snapshot: {
      unionCount: visibleStore.unions.filter((row) => row.status === "active")
        .length,
      agreementCount: visibleStore.agreements.length,
      membershipCount: input.canReadRestricted
        ? visibleStore.memberships.length
        : 0,
      grievanceCount: visibleStore.grievances.filter(
        (row) => row.status !== "closed" && row.status !== "withdrawn",
      ).length,
      conflictCount: visibleStore.ruleConflicts.filter(
        (row) => row.status === "open" || row.status === "blocked",
      ).length,
      alertCount: visibleStore.alerts.filter(
        (row) => row.status === "open" || row.status === "overdue",
      ).length,
    },
  });

  const sections: HrIndustryUcbPageModelListSection[] = [
    section({
      surfaceKey: hrIndustryUcbUnionsSurfaceKey,
      searchValue: input.unionsSearch,
      rows: filterRows(buildUnionRows(visibleStore, input), input.unionsSearch),
    }),
    section({
      surfaceKey: hrIndustryUcbAgreementsSurfaceKey,
      searchValue: input.agreementsSearch,
      rows: filterRows(
        buildAgreementRows(visibleStore, input),
        input.agreementsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryUcbAssignmentsSurfaceKey,
      searchValue: input.assignmentsSearch,
      rows: filterRows(
        buildAssignmentRows(visibleStore, input),
        input.assignmentsSearch,
      ),
    }),
  ];

  if (input.canReadRestricted) {
    sections.push(
      section({
        surfaceKey: hrIndustryUcbMembershipsSurfaceKey,
        searchValue: input.membershipsSearch,
        rows: filterRows(
          buildMembershipRows(visibleStore, input),
          input.membershipsSearch,
        ),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrIndustryUcbRuleReferencesSurfaceKey,
      searchValue: input.ruleReferencesSearch,
      rows: filterRows(
        buildRuleReferenceRows(visibleStore, input),
        input.ruleReferencesSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryUcbSenioritySurfaceKey,
      searchValue: input.senioritySearch,
      rows: filterRows(
        buildSeniorityRows(visibleStore, input),
        input.senioritySearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryUcbRuleConflictsSurfaceKey,
      searchValue: input.ruleConflictsSearch,
      rows: filterRows(
        buildConflictRows(visibleStore, input),
        input.ruleConflictsSearch,
      ),
    }),
  );

  if (input.canExposePayroll) {
    sections.push(
      section({
        surfaceKey: hrIndustryUcbDuesReferencesSurfaceKey,
        searchValue: input.duesReferencesSearch,
        rows: filterRows(
          buildDuesRows(visibleStore, input),
          input.duesReferencesSearch,
        ),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrIndustryUcbGrievancesSurfaceKey,
      searchValue: input.grievancesSearch,
      rows: filterRows(
        buildGrievanceRows(visibleStore, input),
        input.grievancesSearch,
      ),
    }),
  );

  if (input.canReadLegalReferences || input.canReadRestricted) {
    sections.push(
      section({
        surfaceKey: hrIndustryUcbDisputesSurfaceKey,
        searchValue: input.disputesSearch,
        rows: filterRows(
          buildDisputeRows(visibleStore, input),
          input.disputesSearch,
        ),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrIndustryUcbRepresentativesSurfaceKey,
      searchValue: input.representativesSearch,
      rows: filterRows(
        visibleStore.representatives.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.representativesSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          representative: row.displayName,
          role: formatEnumLabel(row.representativeRole),
          unionRef: maps.unionNameById.get(row.unionId) ?? row.unionId,
          assignment: `${row.assignedDepartment} / ${row.assignedSite}`,
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryUcbLaborMeetingsSurfaceKey,
      searchValue: input.laborMeetingsSearch,
      rows: filterRows(
        visibleStore.laborMeetings.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.laborMeetingsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone:
          toneForStatus(row.status) ??
          (row.overdueActionCount > 0 ? "attention" : undefined),
        cells: {
          meeting: row.meetingCode,
          scheduled: formatDate(row.scheduledDate),
          participants: row.participants.join(", "),
          minutes: row.minutesRef ?? "Pending",
          actionItems: row.actionItems.join(", "),
          overdue: row.overdueActionCount,
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryUcbAlertsSurfaceKey,
      searchValue: input.alertsSearch,
      rows: filterRows(
        visibleStore.alerts.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.alertsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.severity) ?? toneForStatus(row.status),
        cells: {
          alert: `${formatEnumLabel(row.alertType)} - ${row.summary}`,
          target: row.targetRef,
          dueDate: formatDate(row.dueDate),
          severity: formatEnumLabel(row.severity),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryUcbReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone:
          row.grievanceCount + row.disputeCount + row.openAlertCount > 0
            ? "attention"
            : undefined,
        cells: {
          groupLabel: row.groupLabel,
          unionCount: row.unionCount,
          agreementCount: row.agreementCount,
          membershipCount: input.canReadRestricted
            ? row.membershipCount
            : "Restricted",
          grievanceCount: row.grievanceCount,
          disputeCount: input.canReadLegalReferences
            ? row.disputeCount
            : "Restricted",
          duesReferenceCount: input.canExposePayroll
            ? row.duesReferenceCount
            : "Restricted",
          openAlertCount: row.openAlertCount,
        },
      })),
    }),
  );

  if (input.canExposeIntegrations) {
    sections.push(
      section({
        surfaceKey: hrIndustryUcbIntegrationExposuresSurfaceKey,
        searchValue: input.integrationExposuresSearch,
        rows: filterRows(
          visibleStore.integrationExposures.filter((row) =>
            rowMatchesStatus(row, input.status),
          ),
          input.integrationExposuresSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.status),
          cells: {
            integrationTarget: formatEnumLabel(row.integrationTarget),
            employee: row.employeeDisplayName ?? "Shared reference",
            sourceRef: row.sourceRef,
            summary: row.summary,
            exposedAt: formatDate(row.exposedAt),
            status: formatEnumLabel(row.status),
          },
        })),
      }),
    );
  }

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrIndustryUcbAuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch).map(
          (event) => ({
            id: event.id,
            cells: {
              summary: event.summary,
              action: event.action,
              actorId: event.actorId,
              targetType: formatEnumLabel(event.targetType),
              employeeId: event.employeeId ?? "System",
              occurredAt: formatDate(event.occurredAt),
            },
          }),
        ),
      }),
    );
  }

  return {
    title: hrIndustryUcbUiCopy.page.title,
    description: hrIndustryUcbUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canManageGrievances: input.canManageGrievances,
    canReadLegalReferences: input.canReadLegalReferences,
    canExposePayroll: input.canExposePayroll,
    canExposeIntegrations: input.canExposeIntegrations,
    canExportReports: input.canExportReports,
    reportGroupBy: input.reportGroupBy,
    status: input.status,
    overview,
    sections,
    workbenchList:
      sections.find(
        (candidate) =>
          candidate.surfaceKey === hrIndustryUcbGrievancesSurfaceKey,
      )?.listConfiguration ??
      buildHrIndustryUcbListSurface({
        surfaceKey: hrIndustryUcbGrievancesSurfaceKey,
        rows: [],
      }),
  };
}
