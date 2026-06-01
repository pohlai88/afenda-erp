import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrTalentRssListRow } from "../contracts/hr.talent.rss.contract";
import { buildHrTalentRssListSurface } from "../surface/hr.talent.rss-lists.surface";
import { buildHrTalentRssOverviewStatGrid } from "../surface/hr.talent.rss-overview-stat.surface";
import {
  hrTalentRssAccessLogSurfaceKey,
  hrTalentRssApplicationsSurfaceKey,
  hrTalentRssApprovalsSurfaceKey,
  hrTalentRssAssessmentsSurfaceKey,
  hrTalentRssAuditTrailSurfaceKey,
  hrTalentRssCandidateProfilesSurfaceKey,
  hrTalentRssCandidateReviewsSurfaceKey,
  hrTalentRssDocumentsSurfaceKey,
  hrTalentRssInterviewsSurfaceKey,
  hrTalentRssInternalApplicationsSurfaceKey,
  hrTalentRssJobPostingsSurfaceKey,
  hrTalentRssNotificationsSurfaceKey,
  hrTalentRssOffersSurfaceKey,
  hrTalentRssPreEmploymentFormsSurfaceKey,
  hrTalentRssPrivacyRecordsSurfaceKey,
  hrTalentRssReportsSurfaceKey,
  hrTalentRssRequisitionRequestsSurfaceKey,
  hrTalentRssRetentionActionsSurfaceKey,
  hrTalentRssRoleTasksSurfaceKey,
  hrTalentRssScorecardsSurfaceKey,
  type HrTalentRssListSurfaceKey,
} from "../surface/hr.talent.rss-surface-metadata.shared";
import { hrTalentRssUiCopy } from "../surface/hr.talent.rss-ui.copy.shared";
import type { HrTalentRssPageModelInput } from "./hr.talent.rss-search-params.parse.shared";
import {
  buildHrTalentRssReportRows,
  filterHrTalentRssRecordsForAccess,
  getHrTalentRssStore,
} from "./hr.talent.rss-store.shared";

const DEFAULT_PAGE_SIZE = 25;

export type HrTalentRssPageModelListSection = {
  readonly surfaceKey: HrTalentRssListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrTalentRssPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrTalentRssPageModelInput["reportGroupBy"];
  readonly status: HrTalentRssPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrTalentRssPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };
type SurfaceRowInput = {
  readonly surfaceKey: HrTalentRssListSurfaceKey;
  readonly rows: readonly HrTalentRssListRow[];
  readonly searchValue?: string;
};

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

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, DEFAULT_PAGE_SIZE);
}

function rowToneForStatus(value: string): HrTalentRssListRow["rowTone"] {
  if (
    [
      "pending",
      "pending_approval",
      "reschedule_requested",
      "closure_requested",
      "retention_review",
      "overdue",
      "returned",
      "clarification_requested",
      "needs_update",
    ].includes(value)
  ) {
    return "attention";
  }
  if (["rejected", "declined", "withdrawn", "expired", "closed", "failed"].includes(value)) {
    return "critical";
  }
  return undefined;
}

function section(input: SurfaceRowInput): HrTalentRssPageModelListSection {
  const copy = hrTalentRssUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrTalentRssListSurface(input),
  };
}

function buildCandidateNameMap(
  rows: readonly { readonly id: string; readonly displayName: string }[],
) {
  return new Map(rows.map((row) => [row.id, row.displayName]));
}

export async function buildHrTalentRssPageModel(
  input: HrTalentRssPageModelInput,
): Promise<HrTalentRssPageModel> {
  const store = getHrTalentRssStore(input.organizationId);
  const visibleStore = filterHrTalentRssRecordsForAccess({
    store,
    access: {
      role: "hr",
      canWrite: input.canWrite,
      canApprove: input.canApprove,
      canReadRestricted: input.canReadRestricted,
      visibleCandidateIds: input.visibleCandidateIds,
    },
  });
  const candidateNames = buildCandidateNameMap(visibleStore.candidateProfiles);
  const applications = visibleStore.applications.filter(
    (row) => input.status === "all" || row.status === input.status,
  );
  const reports = buildHrTalentRssReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });

  const candidateRows: HrTalentRssListRow[] =
    visibleStore.candidateProfiles.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.profileStatus),
      cells: {
        candidate: row.displayName,
        candidateRef: row.candidateRef,
        role: formatEnumLabel(row.role),
        profileStatus: formatEnumLabel(row.profileStatus),
        accountStatus: formatEnumLabel(row.accountStatus),
        consentStatus: formatEnumLabel(row.consentStatus),
        retentionStatus: formatEnumLabel(row.retentionStatus),
      },
    }));

  const jobPostingRows: HrTalentRssListRow[] =
    visibleStore.jobPostings.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        title: row.title,
        postingRef: row.postingRef,
        department: row.department,
        visibility: formatEnumLabel(row.visibility),
        status: formatEnumLabel(row.status),
        applicationsCount: row.applicationsCount,
        closingAt: formatDate(row.closingAt),
      },
    }));

  const applicationRows: HrTalentRssListRow[] = applications.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      application: row.applicationRef,
      candidate: row.candidateDisplayName,
      posting: row.postingTitle,
      internal: formatBoolean(row.internalApplication),
      status: formatEnumLabel(row.status),
      stage: row.currentStage,
      submittedAt: formatDate(row.submittedAt),
    },
  }));

  const documentRows: HrTalentRssListRow[] = visibleStore.documents.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      title: row.title,
      candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
      documentType: formatEnumLabel(row.documentType),
      status: formatEnumLabel(row.status),
      privacyTier: formatEnumLabel(row.privacyTier),
      submittedAt: formatDate(row.submittedAt),
    },
  }));

  const interviewRows: HrTalentRssListRow[] =
    visibleStore.interviews.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        candidate: row.candidateDisplayName,
        interviewType: formatEnumLabel(row.interviewType),
        status: formatEnumLabel(row.status),
        scheduledAt: formatDate(row.scheduledAt),
        rescheduleEnabled: formatBoolean(row.rescheduleEnabled),
      },
    }));

  const assessmentRows: HrTalentRssListRow[] =
    visibleStore.assessments.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        assessment: row.assessmentName,
        candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
        status: formatEnumLabel(row.status),
        accessRef: row.accessRef,
        assignedAt: formatDate(row.assignedAt),
        expiresAt: formatDate(row.expiresAt),
      },
    }));

  const formRows: HrTalentRssListRow[] =
    visibleStore.preEmploymentForms.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        formType: formatEnumLabel(row.formType),
        candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
        application: row.applicationId,
        status: formatEnumLabel(row.status),
        submittedAt: formatDate(row.submittedAt),
      },
    }));

  const offerRows: HrTalentRssListRow[] = visibleStore.offers.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      offer: row.offerRef,
      candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
      status: formatEnumLabel(row.status),
      documentAcknowledged: formatBoolean(row.documentAcknowledged),
      candidateRespondedAt: formatDate(row.candidateRespondedAt),
      approver: row.approverUserId,
    },
  }));

  const internalApplicationRows = applicationRows.filter((row) =>
    row.cells.internal === "Yes",
  );

  const requisitionRows: HrTalentRssListRow[] =
    visibleStore.requisitionRequests.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        request: row.requestRef,
        title: row.title,
        hiringManager: row.hiringManagerUserId,
        status: formatEnumLabel(row.status),
        submittedAt: formatDate(row.submittedAt),
      },
    }));

  const reviewRows: HrTalentRssListRow[] =
    visibleStore.candidateReviews.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.decision),
      cells: {
        candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
        decision: formatEnumLabel(row.decision),
        reviewer: row.reviewerUserId,
        reviewerRole: formatEnumLabel(row.reviewerRole),
        comment: row.comment,
        reviewedAt: formatDate(row.reviewedAt),
      },
    }));

  const scorecardRows: HrTalentRssListRow[] =
    visibleStore.scorecards.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        reviewer: row.reviewerUserId,
        application: row.applicationId,
        status: formatEnumLabel(row.status),
        rating: row.rating ?? "Not recorded",
        recommendation: formatEnumLabel(row.recommendation),
        submittedAt: formatDate(row.submittedAt),
      },
    }));

  const approvalRows: HrTalentRssListRow[] =
    visibleStore.approvals.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        approval: formatEnumLabel(row.approvalType),
        target: row.targetId,
        approver: row.approverUserId,
        status: formatEnumLabel(row.status),
        requestedAt: formatDate(row.requestedAt),
        decidedAt: formatDate(row.decidedAt),
      },
    }));

  const taskRows: HrTalentRssListRow[] = visibleStore.roleTasks.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      task: row.title,
      taskType: formatEnumLabel(row.taskType),
      ownerRole: formatEnumLabel(row.ownerRole),
      status: formatEnumLabel(row.status),
      dueAt: formatDate(row.dueAt),
    },
  }));

  const notificationRows: HrTalentRssListRow[] =
    visibleStore.notifications.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        event: formatEnumLabel(row.event),
        recipient: row.recipientRef,
        recipientRole: formatEnumLabel(row.recipientRole),
        channel: formatEnumLabel(row.channel),
        status: formatEnumLabel(row.status),
        sentAt: formatDate(row.sentAt),
      },
    }));

  const privacyRows: HrTalentRssListRow[] =
    visibleStore.privacyRecords.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.retentionStatus),
      cells: {
        candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
        privacyTier: formatEnumLabel(row.privacyTier),
        consentStatus: formatEnumLabel(row.consentStatus),
        retentionStatus: formatEnumLabel(row.retentionStatus),
        retentionPolicyRef: row.retentionPolicyRef,
        closureRequestedAt: formatDate(row.accountClosureRequestedAt),
      },
    }));

  const accessLogRows: HrTalentRssListRow[] =
    visibleStore.accessLogs.map((row) => ({
      id: row.id,
      rowTone: row.privacyTier === "restricted" ? "attention" : undefined,
      cells: {
        target: `${formatEnumLabel(row.targetType)} ${row.targetId}`,
        actor: row.actorUserId,
        actorRole: formatEnumLabel(row.actorRole),
        privacyTier: formatEnumLabel(row.privacyTier),
        accessReason: row.accessReason,
        accessedAt: formatDate(row.accessedAt),
      },
    }));

  const retentionRows: HrTalentRssListRow[] =
    visibleStore.retentionActions.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        candidate: candidateNames.get(row.candidateId) ?? row.candidateId,
        action: formatEnumLabel(row.action),
        policyRef: row.policyRef,
        status: formatEnumLabel(row.status),
        performedBy: row.performedByUserId,
        performedAt: formatDate(row.performedAt),
      },
    }));

  const reportRows: HrTalentRssListRow[] = reports.map((row) => ({
    id: row.id,
    cells: {
      group: row.group,
      groupBy: formatEnumLabel(row.groupBy),
      count: row.count,
      pendingTasks: row.pendingTasks,
      restrictedRecords: row.restrictedRecords,
      lastActivityAt: formatDate(row.lastActivityAt),
    },
  }));

  const auditRows: HrTalentRssListRow[] = visibleStore.auditEvents.map((row) => ({
    id: row.id,
    cells: {
      summary: row.summary,
      action: row.action,
      actorId: row.actorId,
      target: `${formatEnumLabel(row.targetType)} ${row.targetId}`,
      candidateId: row.candidateId ?? "Not recorded",
      occurredAt: formatDate(row.occurredAt),
    },
  }));

  const sections: HrTalentRssPageModelListSection[] = [
    section({
      surfaceKey: hrTalentRssCandidateProfilesSurfaceKey,
      searchValue: input.candidateProfilesSearch,
      rows: filterRows(candidateRows, input.candidateProfilesSearch),
    }),
    section({
      surfaceKey: hrTalentRssJobPostingsSurfaceKey,
      searchValue: input.jobPostingsSearch,
      rows: filterRows(jobPostingRows, input.jobPostingsSearch),
    }),
    section({
      surfaceKey: hrTalentRssApplicationsSurfaceKey,
      searchValue: input.applicationsSearch,
      rows: filterRows(applicationRows, input.applicationsSearch),
    }),
    section({
      surfaceKey: hrTalentRssDocumentsSurfaceKey,
      searchValue: input.documentsSearch,
      rows: filterRows(documentRows, input.documentsSearch),
    }),
    section({
      surfaceKey: hrTalentRssInterviewsSurfaceKey,
      searchValue: input.interviewsSearch,
      rows: filterRows(interviewRows, input.interviewsSearch),
    }),
    section({
      surfaceKey: hrTalentRssAssessmentsSurfaceKey,
      searchValue: input.assessmentsSearch,
      rows: filterRows(assessmentRows, input.assessmentsSearch),
    }),
    section({
      surfaceKey: hrTalentRssPreEmploymentFormsSurfaceKey,
      searchValue: input.formsSearch,
      rows: filterRows(formRows, input.formsSearch),
    }),
    section({
      surfaceKey: hrTalentRssOffersSurfaceKey,
      searchValue: input.offersSearch,
      rows: filterRows(offerRows, input.offersSearch),
    }),
    section({
      surfaceKey: hrTalentRssInternalApplicationsSurfaceKey,
      searchValue: input.internalApplicationsSearch,
      rows: filterRows(
        internalApplicationRows,
        input.internalApplicationsSearch,
      ),
    }),
  ];

  if (input.canWrite || input.canApprove) {
    sections.push(
      section({
        surfaceKey: hrTalentRssRequisitionRequestsSurfaceKey,
        searchValue: input.requisitionRequestsSearch,
        rows: filterRows(requisitionRows, input.requisitionRequestsSearch),
      }),
      section({
        surfaceKey: hrTalentRssCandidateReviewsSurfaceKey,
        searchValue: input.candidateReviewsSearch,
        rows: filterRows(reviewRows, input.candidateReviewsSearch),
      }),
      section({
        surfaceKey: hrTalentRssScorecardsSurfaceKey,
        searchValue: input.scorecardsSearch,
        rows: filterRows(scorecardRows, input.scorecardsSearch),
      }),
    );
  }

  if (input.canApprove) {
    sections.push(
      section({
        surfaceKey: hrTalentRssApprovalsSurfaceKey,
        searchValue: input.approvalsSearch,
        rows: filterRows(approvalRows, input.approvalsSearch),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrTalentRssRoleTasksSurfaceKey,
      searchValue: input.roleTasksSearch,
      rows: filterRows(taskRows, input.roleTasksSearch),
    }),
    section({
      surfaceKey: hrTalentRssNotificationsSurfaceKey,
      searchValue: input.notificationsSearch,
      rows: filterRows(notificationRows, input.notificationsSearch),
    }),
  );

  if (input.canReadRestricted) {
    sections.push(
      section({
        surfaceKey: hrTalentRssPrivacyRecordsSurfaceKey,
        searchValue: input.privacyRecordsSearch,
        rows: filterRows(privacyRows, input.privacyRecordsSearch),
      }),
      section({
        surfaceKey: hrTalentRssAccessLogSurfaceKey,
        searchValue: input.accessLogSearch,
        rows: filterRows(accessLogRows, input.accessLogSearch),
      }),
      section({
        surfaceKey: hrTalentRssRetentionActionsSurfaceKey,
        searchValue: input.retentionActionsSearch,
        rows: filterRows(retentionRows, input.retentionActionsSearch),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrTalentRssReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch),
    }),
  );

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrTalentRssAuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(auditRows, input.auditTrailSearch),
      }),
    );
  }

  const overview = buildHrTalentRssOverviewStatGrid({
    snapshot: {
      candidateCount: visibleStore.candidateProfiles.length,
      activeApplicationsCount: applications.filter(
        (row) => !["rejected", "withdrawn", "hired"].includes(row.status),
      ).length,
      pendingTasksCount: visibleStore.roleTasks.filter(
        (row) => row.status !== "completed",
      ).length,
      privacyActionsCount:
        visibleStore.privacyRecords.filter(
          (row) =>
            row.privacyTier !== "standard" ||
            row.retentionStatus !== "active",
        ).length + visibleStore.retentionActions.length,
    },
  });

  return {
    title: hrTalentRssUiCopy.page.title,
    description: hrTalentRssUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canExposeIntegrations: input.canExposeIntegrations,
    reportGroupBy: input.reportGroupBy,
    status: input.status,
    overview,
    sections,
    workbenchList:
      sections.find(
        (candidate) =>
          candidate.surfaceKey === hrTalentRssApplicationsSurfaceKey,
      )?.listConfiguration ??
      buildHrTalentRssListSurface({
        surfaceKey: hrTalentRssApplicationsSurfaceKey,
        rows: [],
      }),
  };
}
