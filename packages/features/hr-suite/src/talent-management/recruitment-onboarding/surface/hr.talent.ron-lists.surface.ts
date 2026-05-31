import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  hrRonApplicationDetailRoutePath,
  hrRonOfferDetailRoutePath,
  hrRonRequisitionDetailRoutePath,
} from "../contracts/hr.talent.ron-route.contract";
import { hrTalentRonReadPermission } from "../contracts/hr.talent.ron.contract";
import type {
  HrRonApplicationInput,
  HrRonInterviewScheduleInput,
  HrRonJobPostingInput,
  HrRonOfferInput,
  HrRonOnboardingTaskInput,
  HrRonReadinessSnapshotInput,
  HrRonRequisitionInput,
} from "../schemas/hr.talent.ron.schema";
import {
  hrRonApplicationsSearchParam,
  hrRonAuditTrailSearchParam,
  hrRonInterviewsSearchParam,
  hrRonOffersSearchParam,
  hrRonOnboardingTasksSearchParam,
  hrRonPostingsSearchParam,
  hrRonReadinessSearchParam,
  hrRonReportsSearchParam,
  hrRonRequisitionsSearchParam,
  type HrRonListSurfaceKey,
} from "../data/hr.talent.ron-search-params.parse.shared";
import type {
  HrRonAuditEvent,
  HrRonReportRow,
} from "../data/hr.talent.ron-store.shared";
import { HR_RON_LIST_SURFACE_COLUMNS_BY_KEY } from "./hr.talent.ron-surface-metadata.shared";
import { hrRonUiCopy } from "./hr.talent.ron-ui.copy.shared";

type RonListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type RonListRow = ListSurfaceRendererConfigurationInput["rows"][number];

type RonWindow<T> = {
  rows: readonly T[];
  pageSize?: number;
  totalCount?: number;
  hasNextPage?: boolean;
};

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function createSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value ?? "",
    },
  } as const;
}

function buildRonListSurface<T>(input: {
  surfaceKey: HrRonListSurfaceKey;
  primaryColumnId: string;
  searchParam: string;
  searchValue?: string;
  searchPlaceholder: string;
  headerTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: RonListColumn[];
  window: RonWindow<T>;
  rows: RonListRow[];
  presentationProfile?: "erp-operational-table" | "erp-exception-table" | "erp-audit-ledger";
}) {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: input.presentationProfile ?? "erp-operational-table",
    requiresErpPermission: hrTalentRonReadPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      toolbar: createSearchToolbar({
        param: input.searchParam,
        label: "Search",
        placeholder: input.searchPlaceholder,
        value: input.searchValue,
      }),
    },
    pagination: {
      pageSize: input.window.pageSize ?? Math.max(input.rows.length, 25),
      totalCount: input.window.totalCount ?? input.rows.length,
      hasNextPage: input.window.hasNextPage ?? false,
    },
    surface: {
      header: { title: input.headerTitle },
      columnsId: HR_RON_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.emptyTitle,
        description: input.emptyDescription,
      },
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export function buildHrRonRequisitionsListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonRequisitionInput[];
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.requisitions;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "title",
    searchParam: hrRonRequisitionsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search requisitions",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "title", header: "Role", priority: "primary", cellKind: { kind: "text" } },
      { id: "departmentName", header: "Department", cellKind: { kind: "text" } },
      { id: "hiringManagerDisplayName", header: "Hiring manager", cellKind: { kind: "text" } },
      { id: "requisitionType", header: "Type", cellKind: { kind: "badge", tone: "default" } },
      { id: "headcount", header: "Headcount", cellKind: { kind: "text" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrRonRequisitionDetailRoutePath(row.id),
      cells: {
        title: row.title,
        departmentName: row.departmentName,
        hiringManagerDisplayName: row.hiringManagerDisplayName,
        requisitionType: formatEnumLabel(row.requisitionType),
        headcount: row.headcount,
        status: formatEnumLabel(row.status),
      },
    })),
  });
}

export function buildHrRonPostingsListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  requisitions: readonly HrRonRequisitionInput[];
  rows: readonly HrRonJobPostingInput[];
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.postings;
  const requisitionById = new Map(input.requisitions.map((row) => [row.id, row]));
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "title",
    searchParam: hrRonPostingsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search postings",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "title", header: "Posting", priority: "primary", cellKind: { kind: "text" } },
      { id: "requisition", header: "Requisition", cellKind: { kind: "text" } },
      { id: "channel", header: "Channel", cellKind: { kind: "badge", tone: "default" } },
      { id: "integrationTarget", header: "Target", cellKind: { kind: "text" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
      { id: "publishedAt", header: "Published", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrRonRequisitionDetailRoutePath(row.requisitionId),
      cells: {
        title: row.title,
        requisition: requisitionById.get(row.requisitionId)?.title ?? row.requisitionId,
        channel: formatEnumLabel(row.channel),
        integrationTarget: row.integrationTarget ?? "Not configured",
        status: formatEnumLabel(row.status),
        publishedAt: row.publishedAt ? formatDate(row.publishedAt) : "Not published",
      },
    })),
  });
}

export function buildHrRonApplicationsListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  requisitions: readonly HrRonRequisitionInput[];
  rows: readonly HrRonApplicationInput[];
  candidateNames: ReadonlyMap<string, string>;
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.applications;
  const requisitionById = new Map(input.requisitions.map((row) => [row.id, row]));
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "candidate",
    searchParam: hrRonApplicationsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search applications",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "candidate", header: "Candidate", priority: "primary", cellKind: { kind: "text" } },
      { id: "requisition", header: "Requisition", cellKind: { kind: "text" } },
      { id: "source", header: "Source", cellKind: { kind: "badge", tone: "default" } },
      { id: "stage", header: "Stage", cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
      { id: "submittedAt", header: "Submitted", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrRonApplicationDetailRoutePath(row.id),
      cells: {
        candidate: input.candidateNames.get(row.candidateId) ?? row.candidateId,
        requisition: requisitionById.get(row.requisitionId)?.title ?? row.requisitionId,
        source: formatEnumLabel(row.source),
        stage: formatEnumLabel(row.stage),
        status: formatEnumLabel(row.status),
        submittedAt: formatDate(row.submittedAt),
      },
    })),
  });
}

export function buildHrRonInterviewsListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonInterviewScheduleInput[];
  candidateNames: ReadonlyMap<string, string>;
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.interviews;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "candidate",
    searchParam: hrRonInterviewsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search interviews",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "candidate", header: "Candidate", priority: "primary", cellKind: { kind: "text" } },
      { id: "interviewType", header: "Type", cellKind: { kind: "badge", tone: "default" } },
      { id: "interviewerCount", header: "Interviewers", cellKind: { kind: "text" } },
      { id: "scheduledAt", header: "Scheduled", cellKind: { kind: "text" } },
      { id: "confirmation", header: "Notification", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrRonApplicationDetailRoutePath(row.applicationId),
      cells: {
        candidate: input.candidateNames.get(row.candidateId) ?? row.candidateId,
        interviewType: formatEnumLabel(row.interviewType),
        interviewerCount: row.interviewerUserIds.length,
        scheduledAt: formatDate(row.scheduledAt),
        confirmation: row.confirmationSentAt ? "Sent" : "Pending",
      },
    })),
  });
}

export function buildHrRonOffersListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonOfferInput[];
  candidateNames: ReadonlyMap<string, string>;
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.offers;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "candidate",
    searchParam: hrRonOffersSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search offers",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "candidate", header: "Candidate", priority: "primary", cellKind: { kind: "text" } },
      { id: "proposedRole", header: "Role", cellKind: { kind: "text" } },
      { id: "salary", header: "Salary", cellKind: { kind: "text" } },
      { id: "startDate", header: "Start", cellKind: { kind: "text" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
      { id: "letter", header: "Letter", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrRonOfferDetailRoutePath(row.id),
      cells: {
        candidate: input.candidateNames.get(row.candidateId) ?? row.candidateId,
        proposedRole: row.proposedRole,
        salary: `${row.salaryCurrency} ${row.salaryAmount.toLocaleString("en-US")}`,
        startDate: row.startDate,
        status: formatEnumLabel(row.status),
        letter: row.offerLetterDocumentId ?? "Not linked",
      },
    })),
  });
}

export function buildHrRonOnboardingTasksListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonOnboardingTaskInput[];
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.onboardingTasks;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "title",
    searchParam: hrRonOnboardingTasksSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search onboarding tasks",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-exception-table",
    columns: [
      { id: "title", header: "Task", priority: "primary", cellKind: { kind: "text" } },
      { id: "ownerRole", header: "Owner", cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
      { id: "mandatory", header: "Mandatory", cellKind: { kind: "text" } },
      { id: "blocking", header: "Blocking", cellKind: { kind: "text" } },
      { id: "dueDate", header: "Due", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone:
        row.status === "blocked" || row.status === "overdue" ? "critical" : undefined,
      cells: {
        title: row.title,
        ownerRole: formatEnumLabel(row.ownerRole),
        status: formatEnumLabel(row.status),
        mandatory: row.mandatory ? "Yes" : "No",
        blocking: row.blocking ? "Yes" : "No",
        dueDate: row.dueDate,
      },
    })),
  });
}

export function buildHrRonReadinessListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonReadinessSnapshotInput[];
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.readiness;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "employeeReferenceId",
    searchParam: hrRonReadinessSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search readiness",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-exception-table",
    columns: [
      { id: "employeeReferenceId", header: "Employee ref", priority: "primary", cellKind: { kind: "text" } },
      { id: "domain", header: "Domain", cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
      { id: "missingItems", header: "Missing", cellKind: { kind: "text" } },
      { id: "updatedAt", header: "Updated", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone: row.status === "completed" ? undefined : "attention",
      cells: {
        employeeReferenceId: row.employeeReferenceId,
        domain: formatEnumLabel(row.domain),
        status: formatEnumLabel(row.status),
        missingItems: row.missingItems.join(", ") || "None",
        updatedAt: formatDate(row.updatedAt),
      },
    })),
  });
}

export function buildHrRonReportsListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonReportRow[];
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.reports;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "groupLabel",
    searchParam: hrRonReportsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search report rows",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "groupLabel", header: "Group", priority: "primary", cellKind: { kind: "text" } },
      { id: "applicationCount", header: "Applications", cellKind: { kind: "text" } },
      { id: "hiredCount", header: "Hired", cellKind: { kind: "text" } },
      { id: "offerAcceptedCount", header: "Accepted offers", cellKind: { kind: "text" } },
      { id: "onboardingBlockedCount", header: "Blocked onboarding", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        groupLabel: row.groupLabel,
        applicationCount: row.applicationCount,
        hiredCount: row.hiredCount,
        offerAcceptedCount: row.offerAcceptedCount,
        onboardingBlockedCount: row.onboardingBlockedCount,
      },
    })),
  });
}

export function buildHrRonAuditTrailListSurface(input: {
  surfaceKey: HrRonListSurfaceKey;
  rows: readonly HrRonAuditEvent[];
  searchValue?: string;
}) {
  const copy = hrRonUiCopy.audit;
  return buildRonListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "summary",
    searchParam: hrRonAuditTrailSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search audit events",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-audit-ledger",
    columns: [
      { id: "summary", header: "Summary", priority: "primary", cellKind: { kind: "text" } },
      { id: "action", header: "Action", cellKind: { kind: "text" } },
      { id: "actorId", header: "Actor", cellKind: { kind: "text" } },
      { id: "targetType", header: "Target", cellKind: { kind: "badge", tone: "default" } },
      { id: "occurredAt", header: "Occurred", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        summary: row.summary,
        action: row.action,
        actorId: row.actorId,
        targetType: formatEnumLabel(row.targetType),
        occurredAt: formatDate(row.occurredAt),
      },
    })),
  });
}
