import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListColumn,
  type HrSuiteListSurfaceProfile,
} from "../../../hr-suite-integration/metadata";

export const hrTalentEngOverviewKpiSurfaceKey =
  "hr.talent.eng.overview.kpi" as const;
export const hrTalentEngTemplatesSurfaceKey =
  "hr.talent.eng.templates.list" as const;
export const hrTalentEngQuestionsSurfaceKey =
  "hr.talent.eng.questions.list" as const;
export const hrTalentEngSurveysSurfaceKey =
  "hr.talent.eng.surveys.list" as const;
export const hrTalentEngAudienceSegmentsSurfaceKey =
  "hr.talent.eng.audience-segments.list" as const;
export const hrTalentEngInvitationsSurfaceKey =
  "hr.talent.eng.invitations.list" as const;
export const hrTalentEngResponsesSurfaceKey =
  "hr.talent.eng.responses.list" as const;
export const hrTalentEngCompletionTrackingSurfaceKey =
  "hr.talent.eng.completion-tracking.list" as const;
export const hrTalentEngQuestionScoresSurfaceKey =
  "hr.talent.eng.question-scores.list" as const;
export const hrTalentEngCategoryScoresSurfaceKey =
  "hr.talent.eng.category-scores.list" as const;
export const hrTalentEngSegmentScoresSurfaceKey =
  "hr.talent.eng.segment-scores.list" as const;
export const hrTalentEngOpenTextCommentsSurfaceKey =
  "hr.talent.eng.open-text-comments.list" as const;
export const hrTalentEngBenchmarksSurfaceKey =
  "hr.talent.eng.benchmarks.list" as const;
export const hrTalentEngCycleHistorySurfaceKey =
  "hr.talent.eng.cycle-history.list" as const;
export const hrTalentEngImprovementActionsSurfaceKey =
  "hr.talent.eng.improvement-actions.list" as const;
export const hrTalentEngNotificationsSurfaceKey =
  "hr.talent.eng.notifications.list" as const;
export const hrTalentEngReportsSurfaceKey =
  "hr.talent.eng.reports.list" as const;
export const hrTalentEngAuditTrailSurfaceKey =
  "hr.talent.eng.audit-trail.list" as const;

function col(
  id: string,
  header: string,
  priority?: HrSuiteListColumn["priority"],
): HrSuiteListColumn {
  return priority ? { id, header, priority } : { id, header };
}

export const HR_TALENT_ENG_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrTalentEngTemplatesSurfaceKey,
      param: "hrTalentEngTemplatesSearch",
      modelField: "templatesSearch",
      label: "Search survey templates",
      placeholder:
        "Search template reference, title, type, status, categories, owner, or update date",
      columns: [
        col("template", "Template", "primary"),
        col("type", "Type"),
        col("categories", "Categories"),
        col("questions", "Questions"),
        col("status", "Status"),
        col("updatedAt", "Updated"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngQuestionsSurfaceKey,
      param: "hrTalentEngQuestionsSearch",
      modelField: "questionsSearch",
      label: "Search question bank",
      placeholder:
        "Search question reference, text, type, category, scoring, options, or requirement status",
      columns: [
        col("question", "Question", "primary"),
        col("type", "Type"),
        col("category", "Category"),
        col("required", "Required"),
        col("comment", "Comment"),
        col("weight", "Weight"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngSurveysSurfaceKey,
      param: "hrTalentEngSurveysSearch",
      modelField: "surveysSearch",
      label: "Search engagement surveys",
      placeholder:
        "Search survey reference, title, type, status, anonymity, dates, period, or response rate",
      columns: [
        col("survey", "Survey", "primary"),
        col("type", "Type"),
        col("status", "Status"),
        col("anonymity", "Anonymity"),
        col("openAt", "Open"),
        col("closeAt", "Close"),
        col("responseRate", "Response rate"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngAudienceSegmentsSurfaceKey,
      param: "hrTalentEngAudienceSearch",
      modelField: "audienceSegmentsSearch",
      label: "Search audience segments",
      placeholder:
        "Search dimension, value, eligible count, invited count, response count, or threshold",
      columns: [
        col("segment", "Segment", "primary"),
        col("dimension", "Dimension"),
        col("eligible", "Eligible"),
        col("invited", "Invited"),
        col("responses", "Responses"),
        col("threshold", "Threshold"),
        col("visibility", "Visibility"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngInvitationsSurfaceKey,
      param: "hrTalentEngInvitationsSearch",
      modelField: "invitationsSearch",
      label: "Search survey invitations",
      placeholder:
        "Search survey, audience member, status, sent date, reminder date, or deadline",
      columns: [
        col("survey", "Survey", "primary"),
        col("recipient", "Recipient"),
        col("status", "Status"),
        col("sentAt", "Sent"),
        col("reminderAt", "Reminder"),
        col("deadline", "Deadline"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngResponsesSurfaceKey,
      param: "hrTalentEngResponsesSearch",
      modelField: "responsesSearch",
      label: "Search survey responses",
      placeholder:
        "Search survey, response status, anonymity, score band, comment count, draft date, or submission date",
      columns: [
        col("survey", "Survey", "primary"),
        col("respondent", "Respondent"),
        col("status", "Status"),
        col("score", "Score"),
        col("enps", "eNPS"),
        col("comments", "Comments"),
        col("submittedAt", "Submitted"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngCompletionTrackingSurfaceKey,
      param: "hrTalentEngCompletionSearch",
      modelField: "completionSearch",
      label: "Search completion tracking",
      placeholder:
        "Search survey, segment, invited count, response count, completion rate, or anonymity visibility",
      columns: [
        col("survey", "Survey", "primary"),
        col("segment", "Segment"),
        col("invited", "Invited"),
        col("responses", "Responses"),
        col("completionRate", "Completion"),
        col("visibility", "Visibility"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngQuestionScoresSurfaceKey,
      param: "hrTalentEngQuestionScoresSearch",
      modelField: "questionScoresSearch",
      label: "Search question scores",
      placeholder:
        "Search question, category, score, response count, previous score, or trend",
      columns: [
        col("question", "Question", "primary"),
        col("category", "Category"),
        col("averageScore", "Average"),
        col("responses", "Responses"),
        col("previousScore", "Previous"),
        col("trend", "Trend"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngCategoryScoresSurfaceKey,
      param: "hrTalentEngCategoryScoresSearch",
      modelField: "categoryScoresSearch",
      label: "Search category scores",
      placeholder:
        "Search category, score, response count, benchmark, previous score, low scoring flag, or trend",
      columns: [
        col("category", "Category", "primary"),
        col("averageScore", "Average"),
        col("responses", "Responses"),
        col("benchmark", "Benchmark"),
        col("previousScore", "Previous"),
        col("trend", "Trend"),
        col("risk", "Risk"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngSegmentScoresSurfaceKey,
      param: "hrTalentEngSegmentScoresSearch",
      modelField: "segmentScoresSearch",
      label: "Search segment scores",
      placeholder:
        "Search dimension, segment, average score, response count, threshold, high risk, or suppression",
      columns: [
        col("segment", "Segment", "primary"),
        col("dimension", "Dimension"),
        col("averageScore", "Average"),
        col("responses", "Responses"),
        col("threshold", "Threshold"),
        col("risk", "Risk"),
        col("visibility", "Visibility"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngOpenTextCommentsSurfaceKey,
      param: "hrTalentEngCommentsSearch",
      modelField: "commentsSearch",
      label: "Search open-text comment analysis",
      placeholder:
        "Search category, sentiment, tag, threshold-safe excerpt, response count, or reviewer",
      columns: [
        col("excerpt", "Excerpt", "primary"),
        col("category", "Category"),
        col("tag", "Tag"),
        col("sentiment", "Sentiment"),
        col("responses", "Responses"),
        col("reviewedBy", "Reviewed by"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngBenchmarksSurfaceKey,
      param: "hrTalentEngBenchmarksSearch",
      modelField: "benchmarksSearch",
      label: "Search benchmarks",
      placeholder:
        "Search benchmark label, type, period, engagement index, eNPS, or average score",
      columns: [
        col("benchmark", "Benchmark", "primary"),
        col("type", "Type"),
        col("period", "Period"),
        col("engagementIndex", "Engagement"),
        col("enps", "eNPS"),
        col("averageScore", "Average"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngCycleHistorySurfaceKey,
      param: "hrTalentEngCycleHistorySearch",
      modelField: "cycleHistorySearch",
      label: "Search survey cycle history",
      placeholder:
        "Search cycle, period, status, engagement index, eNPS, response rate, or trend",
      columns: [
        col("cycle", "Cycle", "primary"),
        col("period", "Period"),
        col("status", "Status"),
        col("engagementIndex", "Engagement"),
        col("enps", "eNPS"),
        col("responseRate", "Response rate"),
        col("trend", "Trend"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngImprovementActionsSurfaceKey,
      param: "hrTalentEngActionsSearch",
      modelField: "actionsSearch",
      label: "Search improvement actions",
      placeholder:
        "Search action reference, title, owner, category, priority, status, due date, or progress",
      columns: [
        col("action", "Action", "primary"),
        col("owner", "Owner"),
        col("category", "Category"),
        col("segment", "Segment"),
        col("priority", "Priority"),
        col("status", "Status"),
        col("dueAt", "Due"),
        col("progress", "Progress"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngNotificationsSurfaceKey,
      param: "hrTalentEngNotificationsSearch",
      modelField: "notificationsSearch",
      label: "Search notifications",
      placeholder:
        "Search event, recipient, channel, status, message, sent date, survey, or action",
      columns: [
        col("event", "Event", "primary"),
        col("recipient", "Recipient"),
        col("channel", "Channel"),
        col("status", "Status"),
        col("message", "Message"),
        col("sentAt", "Sent"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngReportsSurfaceKey,
      param: "hrTalentEngReportsSearch",
      modelField: "reportsSearch",
      label: "Search engagement reports",
      placeholder:
        "Search report group, group by value, response rate, score, eNPS, risk count, actions, or suppression",
      columns: [
        col("group", "Group", "primary"),
        col("groupBy", "Grouped by"),
        col("surveys", "Surveys"),
        col("responseRate", "Response rate"),
        col("averageScore", "Average"),
        col("enps", "eNPS"),
        col("risk", "Risks"),
        col("actions", "Actions"),
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentEngAuditTrailSurfaceKey,
      param: "hrTalentEngAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search engagement audit trail",
      placeholder:
        "Search audit action, actor, target, summary, or occurrence timestamp",
      columns: [
        col("summary", "Summary", "primary"),
        col("action", "Action"),
        col("actorId", "Actor"),
        col("target", "Target"),
        col("occurredAt", "Occurred"),
      ],
      readOnly: true,
    },
  ] as const);

export const HR_TALENT_ENG_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_TALENT_ENG_LIST_SURFACE_REGISTRY);

export type HrTalentEngListSurfaceKey =
  (typeof HR_TALENT_ENG_LIST_SURFACE_KEYS)[number];

export const HR_TALENT_ENG_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(
    HR_TALENT_ENG_LIST_SURFACE_REGISTRY,
  );

export const HR_TALENT_ENG_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(
    HR_TALENT_ENG_LIST_SURFACE_REGISTRY,
  );

export const HR_TALENT_ENG_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_TALENT_ENG_LIST_SURFACE_REGISTRY);

export const HR_TALENT_ENG_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(
    HR_TALENT_ENG_LIST_SURFACE_REGISTRY,
  );

export const HR_TALENT_ENG_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrTalentEngTemplatesSurfaceKey]: "erp-operational-table",
  [hrTalentEngQuestionsSurfaceKey]: "erp-operational-table",
  [hrTalentEngSurveysSurfaceKey]: "erp-operational-table",
  [hrTalentEngAudienceSegmentsSurfaceKey]: "erp-operational-table",
  [hrTalentEngInvitationsSurfaceKey]: "erp-operational-table",
  [hrTalentEngResponsesSurfaceKey]: "erp-operational-table",
  [hrTalentEngCompletionTrackingSurfaceKey]: "erp-operational-table",
  [hrTalentEngQuestionScoresSurfaceKey]: "erp-analytical-table",
  [hrTalentEngCategoryScoresSurfaceKey]: "erp-analytical-table",
  [hrTalentEngSegmentScoresSurfaceKey]: "erp-analytical-table",
  [hrTalentEngOpenTextCommentsSurfaceKey]: "erp-exception-table",
  [hrTalentEngBenchmarksSurfaceKey]: "erp-analytical-table",
  [hrTalentEngCycleHistorySurfaceKey]: "erp-analytical-table",
  [hrTalentEngImprovementActionsSurfaceKey]: "erp-exception-table",
  [hrTalentEngNotificationsSurfaceKey]: "erp-operational-table",
  [hrTalentEngReportsSurfaceKey]: "erp-analytical-table",
  [hrTalentEngAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrTalentEngListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrTalentEngListSurfaceKeys(): readonly HrTalentEngListSurfaceKey[] {
  return HR_TALENT_ENG_LIST_SURFACE_KEYS;
}
