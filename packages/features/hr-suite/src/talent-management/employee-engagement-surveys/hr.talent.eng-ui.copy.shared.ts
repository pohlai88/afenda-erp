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
} from "./hr.talent.eng-surface-metadata.shared";

const listCopy = {
  [hrTalentEngTemplatesSurfaceKey]: [
    "Survey Templates",
    "Reusable templates and question bank coverage for engagement, pulse, satisfaction, wellbeing, culture, and exit feedback surveys.",
  ],
  [hrTalentEngQuestionsSurfaceKey]: [
    "Question Bank",
    "Rating, choice, open-text, yes/no, and comment questions with category and scoring metadata.",
  ],
  [hrTalentEngSurveysSurfaceKey]: [
    "Engagement Surveys",
    "Survey definitions with audience, anonymity, dates, reminders, response rate, and analytics status.",
  ],
  [hrTalentEngAudienceSegmentsSurfaceKey]: [
    "Audience Segments",
    "Audience targeting by legal entity, department, location, manager, grade, tenure, employment type, and employee category.",
  ],
  [hrTalentEngInvitationsSurfaceKey]: [
    "Invitations",
    "Distribution status with anonymous recipient protection before response details reach the UI.",
  ],
  [hrTalentEngResponsesSurfaceKey]: [
    "Responses",
    "Draft and submitted response status without exposing anonymous respondent identity.",
  ],
  [hrTalentEngCompletionTrackingSurfaceKey]: [
    "Completion Tracking",
    "Response completion by audience segment with threshold-aware anonymous visibility.",
  ],
  [hrTalentEngQuestionScoresSurfaceKey]: [
    "Question Scores",
    "Question-level averages, response counts, prior-cycle comparison, and trend movement.",
  ],
  [hrTalentEngCategoryScoresSurfaceKey]: [
    "Category Scores",
    "Leadership, culture, wellbeing, workload, recognition, communication, inclusion, and retention analytics.",
  ],
  [hrTalentEngSegmentScoresSurfaceKey]: [
    "Segment Scores",
    "Department, location, manager, grade, tenure, and employee category views with suppression where required.",
  ],
  [hrTalentEngOpenTextCommentsSurfaceKey]: [
    "Open-Text Comment Analysis",
    "Restricted threshold-safe comment excerpts and manual tags for review workflows.",
  ],
  [hrTalentEngBenchmarksSurfaceKey]: [
    "Benchmarks",
    "Internal and external benchmark references for score and eNPS comparison.",
  ],
  [hrTalentEngCycleHistorySurfaceKey]: [
    "Survey Cycle History",
    "Preserved cycle, response, engagement, eNPS, and trend data across survey periods.",
  ],
  [hrTalentEngImprovementActionsSurfaceKey]: [
    "Improvement Actions",
    "Action plans with owners, due dates, priority, status, progress, and overdue handling.",
  ],
  [hrTalentEngNotificationsSurfaceKey]: [
    "Notifications",
    "Invitation, reminder, and overdue action notifications.",
  ],
  [hrTalentEngReportsSurfaceKey]: [
    "Reports",
    "Engagement reports by survey, category, department, location, manager, and period.",
  ],
  [hrTalentEngAuditTrailSurfaceKey]: [
    "Audit Trail",
    "Survey creation, publishing, response submission, analytics, export, action plan, and completion events.",
  ],
} as const satisfies Record<HrTalentEngListSurfaceKey, readonly [string, string]>;

export const hrTalentEngUiCopy = {
  title: "Employee Engagement Surveys",
  description:
    "Collect, measure, analyze, and act on employee feedback with anonymous thresholds, governed analytics, reporting, and audit history.",
  page: {
    title: "Employee Engagement Surveys",
    description:
      "Engagement, satisfaction, pulse, wellbeing, culture, response tracking, segmentation, trend comparison, action planning, reporting, and audit controls.",
  },
  overview: {
    sectionTitle: "Engagement Control",
    activeSurveys: "Active surveys",
    responseRate: "Response rate",
    lowRiskSegments: "Risk signals",
    openActions: "Open actions",
  },
  listSections: Object.fromEntries(
    Object.entries(listCopy).map(([surfaceKey, [title, description]]) => [
      surfaceKey,
      {
        title,
        description,
        emptyTitle: `No ${title.toLowerCase()} found`,
        emptyDescription:
          "No records match the current filters or access scope.",
      },
    ]),
  ) as Record<
    HrTalentEngListSurfaceKey,
    {
      readonly title: string;
      readonly description: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
    }
  >,
  workbench: {
    title: "Employee Engagement Surveys Workbench",
    description:
      "Metadata-driven engagement operations with bounded server-window rows.",
  },
  accessDenied: {
    title: "Employee Engagement Surveys access required",
    description: "You do not have permission to view this HR workspace.",
  },
} as const;
