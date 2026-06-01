import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrTalentEngListRow } from "../contracts/hr.talent.eng.contract";
import { buildHrTalentEngListSurface } from "../surface/hr.talent.eng-lists.surface";
import { buildHrTalentEngOverviewStatGrid } from "../surface/hr.talent.eng-overview-stat.surface";
import {
  hrTalentEngAudienceSegmentsSurfaceKey,
  hrTalentEngAuditTrailSurfaceKey,
  hrTalentEngBenchmarksSurfaceKey,
  hrTalentEngCategoryScoresSurfaceKey,
  hrTalentEngCompletionTrackingSurfaceKey,
  hrTalentEngCycleHistorySurfaceKey,
  hrTalentEngImprovementActionsSurfaceKey,
  hrTalentEngInvitationsSurfaceKey,
  hrTalentEngNotificationsSurfaceKey,
  hrTalentEngOpenTextCommentsSurfaceKey,
  hrTalentEngQuestionScoresSurfaceKey,
  hrTalentEngQuestionsSurfaceKey,
  hrTalentEngReportsSurfaceKey,
  hrTalentEngResponsesSurfaceKey,
  hrTalentEngSegmentScoresSurfaceKey,
  hrTalentEngSurveysSurfaceKey,
  hrTalentEngTemplatesSurfaceKey,
  type HrTalentEngListSurfaceKey,
} from "../surface/hr.talent.eng-surface-metadata.shared";
import { hrTalentEngUiCopy } from "../surface/hr.talent.eng-ui.copy.shared";
import type { HrTalentEngPageModelInput } from "./hr.talent.eng-search-params.parse.shared";
import {
  buildHrTalentEngReportRows,
  filterHrTalentEngRecordsForAccess,
  getHrTalentEngStore,
  shouldSuppressHrTalentEngAnonymousBucket,
} from "./hr.talent.eng-store.shared";

const DEFAULT_PAGE_SIZE = 25;

export type HrTalentEngPageModelListSection = {
  readonly surfaceKey: HrTalentEngListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrTalentEngPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrTalentEngPageModelInput["reportGroupBy"];
  readonly status: HrTalentEngPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrTalentEngPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = {
  readonly id: string;
  readonly cells?: Record<string, unknown>;
};

type SurfaceRowInput = {
  readonly surfaceKey: HrTalentEngListSurfaceKey;
  readonly rows: readonly HrTalentEngListRow[];
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

function formatScore(value: number | null | undefined) {
  if (value == null) return "Not recorded";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}/5`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return "Not recorded";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
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
    .filter((row) =>
      Object.values(row.cells ?? row)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    )
    .slice(0, DEFAULT_PAGE_SIZE);
}

function rowToneForStatus(value: string): HrTalentEngListRow["rowTone"] {
  if (
    [
      "draft",
      "scheduled",
      "queued",
      "sent",
      "reminded",
      "opened",
      "open",
      "in_progress",
      "overdue",
      "blocked",
    ].includes(value)
  ) {
    return "attention";
  }
  if (["archived", "expired"].includes(value)) {
    return "critical";
  }
  return undefined;
}

function section(input: SurfaceRowInput): HrTalentEngPageModelListSection {
  const copy = hrTalentEngUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrTalentEngListSurface(input),
  };
}

function visibleStatus(
  statusFilter: HrTalentEngPageModelInput["status"],
  status: string,
) {
  return statusFilter === "all" || status === statusFilter;
}

function average(values: readonly number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function buildHrTalentEngPageModel(
  input: HrTalentEngPageModelInput,
): Promise<HrTalentEngPageModel> {
  const store = getHrTalentEngStore(input.organizationId);
  const visibleStore = filterHrTalentEngRecordsForAccess({
    store,
    access: {
      actorUserId: input.actorUserId,
      canWrite: input.canWrite,
      canApprove: input.canApprove,
      canReadRestricted: input.canReadRestricted,
      visibleEmployeeIds: input.visibleEmployeeIds,
    },
  });
  const surveys = new Map(visibleStore.surveys.map((row) => [row.id, row]));
  const selectedSurveyId = input.surveyId;

  const surveyFilter = (surveyId: string) =>
    !selectedSurveyId || surveyId === selectedSurveyId;

  const templateRows: HrTalentEngListRow[] = visibleStore.templates.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      template: `${row.templateRef} - ${row.title}`,
      type: formatEnumLabel(row.surveyType),
      categories: row.categories.map(formatEnumLabel).join(", "),
      questions: row.questionBankSize,
      status: formatEnumLabel(row.status),
      updatedAt: formatDate(row.updatedAt),
    },
  }));

  const questionRows: HrTalentEngListRow[] = visibleStore.questions.map((row) => ({
    id: row.id,
    cells: {
      question: `${row.questionRef} - ${row.label}`,
      type: formatEnumLabel(row.questionType),
      category: formatEnumLabel(row.category),
      required: formatBoolean(row.required),
      comment: formatBoolean(row.allowComment),
      weight: row.scoringWeight,
    },
  }));

  const surveyRows: HrTalentEngListRow[] = visibleStore.surveys
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        survey: `${row.surveyRef} - ${row.title}`,
        type: formatEnumLabel(row.surveyType),
        status: formatEnumLabel(row.status),
        anonymity: formatEnumLabel(row.anonymityMode),
        openAt: formatDate(row.openAt),
        closeAt: formatDate(row.closeAt),
        responseRate: formatPercent(row.responseRate),
      },
    }));

  const audienceRows: HrTalentEngListRow[] = visibleStore.audienceSegments
    .filter((row) => surveyFilter(row.surveyId))
    .map((row) => {
      const survey = surveys.get(row.surveyId);
      const suppressed =
        survey?.anonymityMode === "anonymous" &&
        shouldSuppressHrTalentEngAnonymousBucket({
          totalResponses: survey.responseCount,
          bucketResponses: row.responseCount,
          minThreshold: row.minThreshold,
        });
      return {
        id: row.id,
        rowTone: suppressed ? "attention" : undefined,
        cells: {
          segment: `${formatEnumLabel(row.dimension)} - ${row.value}`,
          dimension: formatEnumLabel(row.dimension),
          eligible: row.eligibleCount,
          invited: row.invitedCount,
          responses: suppressed ? "Suppressed" : row.responseCount,
          threshold: row.minThreshold,
          visibility: suppressed ? "Suppressed" : "Visible",
        },
      };
    });

  const invitationRows: HrTalentEngListRow[] = visibleStore.invitations
    .filter((row) => surveyFilter(row.surveyId))
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        survey: surveys.get(row.surveyId)?.surveyRef ?? row.surveyId,
        recipient: row.employeeDisplayName,
        status: row.employeeId === "anonymous" ? "Protected" : formatEnumLabel(row.status),
        sentAt: formatDate(row.sentAt),
        reminderAt: formatDate(row.reminderAt),
        deadline: formatDate(row.responseDeadlineAt),
      },
    }));

  const responseRows: HrTalentEngListRow[] = visibleStore.responses
    .filter((row) => surveyFilter(row.surveyId))
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        survey: surveys.get(row.surveyId)?.surveyRef ?? row.surveyId,
        respondent: row.anonymous ? "Anonymous" : row.employeeId,
        status: formatEnumLabel(row.status),
        score: row.anonymous && !input.canReadRestricted
          ? "Protected"
          : formatScore(row.scoreAverage),
        enps: row.anonymous && !input.canReadRestricted
          ? "Protected"
          : row.enpsScore ?? "Not recorded",
        comments: row.commentCount,
        submittedAt: formatDate(row.submittedAt ?? row.draftSavedAt),
      },
    }));

  const completionRows: HrTalentEngListRow[] = audienceRows.map((row) => {
    const invited = Number(row.cells.invited);
    const responses =
      typeof row.cells.responses === "number" ? row.cells.responses : null;
    return {
      id: `${row.id}-completion`,
      rowTone: row.rowTone,
      cells: {
        survey: "ENG",
        segment: String(row.cells.segment ?? "Not recorded"),
        invited,
        responses: responses ?? "Suppressed",
        completionRate:
          responses == null || invited === 0
            ? String(row.cells.visibility ?? "Not recorded")
            : formatPercent((responses / invited) * 100),
        visibility: String(row.cells.visibility ?? "Not recorded"),
      },
    };
  });

  const questionScoreRows: HrTalentEngListRow[] = visibleStore.questionScores
    .filter((row) => surveyFilter(row.surveyId))
    .map((row) => ({
      id: row.id,
      rowTone: row.trend < 0 ? "attention" : undefined,
      cells: {
        question: row.questionLabel,
        category: formatEnumLabel(row.category),
        averageScore: formatScore(row.averageScore),
        responses: row.responseCount,
        previousScore: formatScore(row.previousScore),
        trend: row.trend,
      },
    }));

  const categoryScoreRows: HrTalentEngListRow[] = visibleStore.categoryScores
    .filter((row) => surveyFilter(row.surveyId))
    .map((row) => ({
      id: row.id,
      rowTone: row.lowScoring ? "attention" : undefined,
      cells: {
        category: formatEnumLabel(row.category),
        averageScore: formatScore(row.averageScore),
        responses: row.responseCount,
        benchmark: formatScore(row.benchmarkScore),
        previousScore: formatScore(row.previousScore),
        trend: row.trend,
        risk: row.lowScoring ? "Low scoring" : "On track",
      },
    }));

  const segmentScoreRows: HrTalentEngListRow[] = visibleStore.segmentScores
    .filter((row) => surveyFilter(row.surveyId))
    .filter(
      (row) =>
        input.segmentDimension === "all" ||
        row.dimension === input.segmentDimension,
    )
    .map((row) => {
      const survey = surveys.get(row.surveyId);
      const suppressed =
        survey?.anonymityMode === "anonymous" &&
        shouldSuppressHrTalentEngAnonymousBucket({
          totalResponses: survey.responseCount,
          bucketResponses: row.responseCount,
          minThreshold: row.minThreshold,
        });
      return {
        id: row.id,
        rowTone: row.highRisk || suppressed ? "attention" : undefined,
        cells: {
          segment: suppressed ? "Suppressed anonymous segment" : row.value,
          dimension: formatEnumLabel(row.dimension),
          averageScore: suppressed ? "Suppressed" : formatScore(row.averageScore),
          responses: suppressed ? "Suppressed" : row.responseCount,
          threshold: row.minThreshold,
          risk: suppressed ? "Suppressed" : row.highRisk ? "High risk" : "On track",
          visibility: suppressed ? "Suppressed" : "Visible",
        },
      };
    });

  const commentRows: HrTalentEngListRow[] = visibleStore.openTextComments
    .filter((row) => surveyFilter(row.surveyId))
    .map((row) => ({
      id: row.id,
      rowTone: row.sentiment === "negative" ? "attention" : undefined,
      cells: {
        excerpt: row.excerpt,
        category: formatEnumLabel(row.category),
        tag: formatEnumLabel(row.tag),
        sentiment: formatEnumLabel(row.sentiment),
        responses: row.excerpt.includes("Suppressed")
          ? "Suppressed"
          : row.responseCount,
        reviewedBy: row.reviewedByUserId ?? "Not reviewed",
      },
    }));

  const benchmarkRows: HrTalentEngListRow[] = visibleStore.benchmarks
    .filter((row) => surveyFilter(row.surveyId))
    .map((row) => ({
      id: row.id,
      cells: {
        benchmark: row.label,
        type: formatEnumLabel(row.benchmarkType),
        period: row.period,
        engagementIndex: formatPercent(row.engagementIndex),
        enps: row.enps,
        averageScore: formatScore(row.averageScore),
      },
    }));

  const cycleRows: HrTalentEngListRow[] = visibleStore.surveyCycles
    .filter((row) => surveyFilter(row.surveyId))
    .map((row) => ({
      id: row.id,
      rowTone: row.trendFromPrevious < 0 ? "attention" : undefined,
      cells: {
        cycle: row.cycleRef,
        period: row.period,
        status: formatEnumLabel(row.status),
        engagementIndex: formatPercent(row.engagementIndex),
        enps: row.enps,
        responseRate: formatPercent(row.responseRate),
        trend: row.trendFromPrevious,
      },
    }));

  const actionRows: HrTalentEngListRow[] = visibleStore.improvementActions
    .filter((row) => surveyFilter(row.surveyId))
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        action: `${row.actionRef} - ${row.title}`,
        owner: row.ownerName,
        category: formatEnumLabel(row.sourceCategory),
        segment: row.sourceSegment ?? "Not recorded",
        priority: formatEnumLabel(row.priority),
        status: formatEnumLabel(row.status),
        dueAt: formatDate(row.dueAt),
        progress: formatPercent(row.progressPercent),
      },
    }));

  const notificationRows: HrTalentEngListRow[] = visibleStore.notifications
    .filter((row) => !selectedSurveyId || row.surveyId === selectedSurveyId)
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        event: formatEnumLabel(row.event),
        recipient: row.recipientUserId,
        channel: formatEnumLabel(row.channel),
        status: formatEnumLabel(row.status),
        message: row.message,
        sentAt: formatDate(row.sentAt),
      },
    }));

  const reportRows: HrTalentEngListRow[] = buildHrTalentEngReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  }).map((row) => ({
    id: row.id,
    rowTone: row.suppressed || row.lowRiskCount > 0 ? "attention" : undefined,
    cells: {
      group: row.group,
      groupBy: formatEnumLabel(row.groupBy),
      surveys: row.surveyCount,
      responseRate: row.responseRate,
      averageScore: row.averageScore,
      enps: row.enps,
      risk: row.lowRiskCount,
      actions: row.openActions,
    },
  }));

  const auditRows: HrTalentEngListRow[] = visibleStore.auditEvents.map((row) => ({
    id: row.id,
    cells: {
      summary: row.summary,
      action: row.action,
      actorId: row.actorId,
      target: `${formatEnumLabel(row.targetType)} ${row.targetId}`,
      occurredAt: formatDate(row.occurredAt),
    },
  }));

  const sections: HrTalentEngPageModelListSection[] = [
    section({
      surfaceKey: hrTalentEngTemplatesSurfaceKey,
      searchValue: input.templatesSearch,
      rows: filterRows(templateRows, input.templatesSearch),
    }),
    section({
      surfaceKey: hrTalentEngQuestionsSurfaceKey,
      searchValue: input.questionsSearch,
      rows: filterRows(questionRows, input.questionsSearch),
    }),
    section({
      surfaceKey: hrTalentEngSurveysSurfaceKey,
      searchValue: input.surveysSearch,
      rows: filterRows(surveyRows, input.surveysSearch),
    }),
    section({
      surfaceKey: hrTalentEngAudienceSegmentsSurfaceKey,
      searchValue: input.audienceSegmentsSearch,
      rows: filterRows(audienceRows, input.audienceSegmentsSearch),
    }),
    section({
      surfaceKey: hrTalentEngInvitationsSurfaceKey,
      searchValue: input.invitationsSearch,
      rows: filterRows(invitationRows, input.invitationsSearch),
    }),
    section({
      surfaceKey: hrTalentEngResponsesSurfaceKey,
      searchValue: input.responsesSearch,
      rows: filterRows(responseRows, input.responsesSearch),
    }),
    section({
      surfaceKey: hrTalentEngCompletionTrackingSurfaceKey,
      searchValue: input.completionSearch,
      rows: filterRows(completionRows, input.completionSearch),
    }),
    section({
      surfaceKey: hrTalentEngQuestionScoresSurfaceKey,
      searchValue: input.questionScoresSearch,
      rows: filterRows(questionScoreRows, input.questionScoresSearch),
    }),
    section({
      surfaceKey: hrTalentEngCategoryScoresSurfaceKey,
      searchValue: input.categoryScoresSearch,
      rows: filterRows(categoryScoreRows, input.categoryScoresSearch),
    }),
    section({
      surfaceKey: hrTalentEngSegmentScoresSurfaceKey,
      searchValue: input.segmentScoresSearch,
      rows: filterRows(segmentScoreRows, input.segmentScoresSearch),
    }),
  ];

  if (input.canReadRestricted) {
    sections.push(
      section({
        surfaceKey: hrTalentEngOpenTextCommentsSurfaceKey,
        searchValue: input.commentsSearch,
        rows: filterRows(commentRows, input.commentsSearch),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrTalentEngBenchmarksSurfaceKey,
      searchValue: input.benchmarksSearch,
      rows: filterRows(benchmarkRows, input.benchmarksSearch),
    }),
    section({
      surfaceKey: hrTalentEngCycleHistorySurfaceKey,
      searchValue: input.cycleHistorySearch,
      rows: filterRows(cycleRows, input.cycleHistorySearch),
    }),
    section({
      surfaceKey: hrTalentEngImprovementActionsSurfaceKey,
      searchValue: input.actionsSearch,
      rows: filterRows(actionRows, input.actionsSearch),
    }),
    section({
      surfaceKey: hrTalentEngNotificationsSurfaceKey,
      searchValue: input.notificationsSearch,
      rows: filterRows(notificationRows, input.notificationsSearch),
    }),
    section({
      surfaceKey: hrTalentEngReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch),
    }),
  );

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrTalentEngAuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(auditRows, input.auditTrailSearch),
      }),
    );
  }

  const activeSurveyCount = visibleStore.surveys.filter((row) =>
    ["scheduled", "published"].includes(row.status),
  ).length;
  const averageResponseRate = average(
    visibleStore.surveys
      .filter((row) => row.invitedCount > 0)
      .map((row) => row.responseRate),
  );
  const lowRiskSignalCount =
    visibleStore.categoryScores.filter((row) => row.lowScoring).length +
    visibleStore.segmentScores.filter((row) => row.highRisk).length;
  const openActionCount = visibleStore.improvementActions.filter(
    (row) => row.status !== "completed",
  ).length;

  const overview = buildHrTalentEngOverviewStatGrid({
    snapshot: {
      activeSurveyCount,
      averageResponseRate,
      lowRiskSignalCount,
      openActionCount,
    },
  });

  return {
    title: hrTalentEngUiCopy.page.title,
    description: hrTalentEngUiCopy.page.description,
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
        (candidate) => candidate.surfaceKey === hrTalentEngSurveysSurfaceKey,
      )?.listConfiguration ??
      buildHrTalentEngListSurface({
        surfaceKey: hrTalentEngSurveysSurfaceKey,
        rows: [],
      }),
  };
}
