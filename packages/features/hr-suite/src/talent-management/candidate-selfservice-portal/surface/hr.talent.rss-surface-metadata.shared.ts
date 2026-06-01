import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../../hr-suite-integration/metadata";

export const hrTalentRssOverviewKpiSurfaceKey =
  "hr.talent.rss.overview.kpi" as const;
export const hrTalentRssCandidateProfilesSurfaceKey =
  "hr.talent.rss.candidate-profiles.list" as const;
export const hrTalentRssJobPostingsSurfaceKey =
  "hr.talent.rss.job-postings.list" as const;
export const hrTalentRssApplicationsSurfaceKey =
  "hr.talent.rss.applications.list" as const;
export const hrTalentRssDocumentsSurfaceKey =
  "hr.talent.rss.documents.list" as const;
export const hrTalentRssInterviewsSurfaceKey =
  "hr.talent.rss.interviews.list" as const;
export const hrTalentRssAssessmentsSurfaceKey =
  "hr.talent.rss.assessments.list" as const;
export const hrTalentRssPreEmploymentFormsSurfaceKey =
  "hr.talent.rss.pre-employment-forms.list" as const;
export const hrTalentRssOffersSurfaceKey =
  "hr.talent.rss.offers.list" as const;
export const hrTalentRssInternalApplicationsSurfaceKey =
  "hr.talent.rss.internal-applications.list" as const;
export const hrTalentRssRequisitionRequestsSurfaceKey =
  "hr.talent.rss.requisition-requests.list" as const;
export const hrTalentRssCandidateReviewsSurfaceKey =
  "hr.talent.rss.candidate-reviews.list" as const;
export const hrTalentRssScorecardsSurfaceKey =
  "hr.talent.rss.scorecards.list" as const;
export const hrTalentRssApprovalsSurfaceKey =
  "hr.talent.rss.approvals.list" as const;
export const hrTalentRssRoleTasksSurfaceKey =
  "hr.talent.rss.role-tasks.list" as const;
export const hrTalentRssNotificationsSurfaceKey =
  "hr.talent.rss.notifications.list" as const;
export const hrTalentRssPrivacyRecordsSurfaceKey =
  "hr.talent.rss.privacy-records.list" as const;
export const hrTalentRssAccessLogSurfaceKey =
  "hr.talent.rss.access-log.list" as const;
export const hrTalentRssRetentionActionsSurfaceKey =
  "hr.talent.rss.retention-actions.list" as const;
export const hrTalentRssReportsSurfaceKey =
  "hr.talent.rss.reports.list" as const;
export const hrTalentRssAuditTrailSurfaceKey =
  "hr.talent.rss.audit-trail.list" as const;

export const HR_TALENT_RSS_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrTalentRssCandidateProfilesSurfaceKey,
      param: "hrTalentRssCandidateProfilesSearch",
      modelField: "candidateProfilesSearch",
      label: "Search candidate profiles",
      placeholder:
        "Search candidate reference, name, role, account, privacy, consent, or retention status",
      columns: [
        { id: "candidate", header: "Candidate", priority: "primary" },
        { id: "candidateRef", header: "Reference" },
        { id: "role", header: "Role" },
        { id: "profileStatus", header: "Profile" },
        { id: "accountStatus", header: "Account" },
        { id: "consentStatus", header: "Consent" },
        { id: "retentionStatus", header: "Retention" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssJobPostingsSurfaceKey,
      param: "hrTalentRssJobPostingsSearch",
      modelField: "jobPostingsSearch",
      label: "Search open job postings",
      placeholder:
        "Search posting reference, title, department, location, visibility, or status",
      columns: [
        { id: "title", header: "Job posting", priority: "primary" },
        { id: "postingRef", header: "Reference" },
        { id: "department", header: "Department" },
        { id: "visibility", header: "Visibility" },
        { id: "status", header: "Status" },
        { id: "applicationsCount", header: "Applications" },
        { id: "closingAt", header: "Closing" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssApplicationsSurfaceKey,
      param: "hrTalentRssApplicationsSearch",
      modelField: "applicationsSearch",
      label: "Search applications",
      placeholder:
        "Search application reference, candidate, posting, stage, status, or owner",
      columns: [
        { id: "application", header: "Application", priority: "primary" },
        { id: "candidate", header: "Candidate" },
        { id: "posting", header: "Posting" },
        { id: "internal", header: "Internal" },
        { id: "status", header: "Status" },
        { id: "stage", header: "Stage" },
        { id: "submittedAt", header: "Submitted" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssDocumentsSurfaceKey,
      param: "hrTalentRssDocumentsSearch",
      modelField: "documentsSearch",
      label: "Search candidate documents",
      placeholder:
        "Search document title, type, candidate, status, privacy tier, or submission date",
      columns: [
        { id: "title", header: "Document", priority: "primary" },
        { id: "candidate", header: "Candidate" },
        { id: "documentType", header: "Type" },
        { id: "status", header: "Status" },
        { id: "privacyTier", header: "Privacy" },
        { id: "submittedAt", header: "Submitted" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssInterviewsSurfaceKey,
      param: "hrTalentRssInterviewsSearch",
      modelField: "interviewsSearch",
      label: "Search interviews",
      placeholder:
        "Search candidate, interview type, status, schedule, instructions, or interviewer",
      columns: [
        { id: "candidate", header: "Candidate", priority: "primary" },
        { id: "interviewType", header: "Type" },
        { id: "status", header: "Status" },
        { id: "scheduledAt", header: "Scheduled" },
        { id: "rescheduleEnabled", header: "Reschedule" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssAssessmentsSurfaceKey,
      param: "hrTalentRssAssessmentsSearch",
      modelField: "assessmentsSearch",
      label: "Search assessments",
      placeholder:
        "Search assessment name, access reference, candidate, status, assignment, or expiry",
      columns: [
        { id: "assessment", header: "Assessment", priority: "primary" },
        { id: "candidate", header: "Candidate" },
        { id: "status", header: "Status" },
        { id: "accessRef", header: "Access ref" },
        { id: "assignedAt", header: "Assigned" },
        { id: "expiresAt", header: "Expires" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssPreEmploymentFormsSurfaceKey,
      param: "hrTalentRssFormsSearch",
      modelField: "formsSearch",
      label: "Search pre-employment forms",
      placeholder:
        "Search form type, candidate, application, status, submission, or review date",
      columns: [
        { id: "formType", header: "Form", priority: "primary" },
        { id: "candidate", header: "Candidate" },
        { id: "application", header: "Application" },
        { id: "status", header: "Status" },
        { id: "submittedAt", header: "Submitted" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssOffersSurfaceKey,
      param: "hrTalentRssOffersSearch",
      modelField: "offersSearch",
      label: "Search offers",
      placeholder:
        "Search offer reference, candidate, application, status, acknowledgement, or approver",
      columns: [
        { id: "offer", header: "Offer", priority: "primary" },
        { id: "candidate", header: "Candidate" },
        { id: "status", header: "Status" },
        { id: "documentAcknowledged", header: "Acknowledged" },
        { id: "candidateRespondedAt", header: "Responded" },
        { id: "approver", header: "Approver" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssInternalApplicationsSurfaceKey,
      param: "hrTalentRssInternalApplicationsSearch",
      modelField: "internalApplicationsSearch",
      label: "Search internal applications",
      placeholder:
        "Search internal application reference, employee candidate, posting, status, or stage",
      columns: [
        { id: "application", header: "Application", priority: "primary" },
        { id: "candidate", header: "Employee candidate" },
        { id: "posting", header: "Posting" },
        { id: "status", header: "Status" },
        { id: "stage", header: "Stage" },
        { id: "submittedAt", header: "Submitted" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssRequisitionRequestsSurfaceKey,
      param: "hrTalentRssRequisitionRequestsSearch",
      modelField: "requisitionRequestsSearch",
      label: "Search requisition requests",
      placeholder:
        "Search request reference, title, manager, status, submission, or decision date",
      columns: [
        { id: "request", header: "Request", priority: "primary" },
        { id: "title", header: "Role" },
        { id: "hiringManager", header: "Manager" },
        { id: "status", header: "Status" },
        { id: "submittedAt", header: "Submitted" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssCandidateReviewsSurfaceKey,
      param: "hrTalentRssCandidateReviewsSearch",
      modelField: "candidateReviewsSearch",
      label: "Search candidate reviews",
      placeholder:
        "Search candidate, application, reviewer, decision, comment, or review date",
      columns: [
        { id: "candidate", header: "Candidate", priority: "primary" },
        { id: "decision", header: "Decision" },
        { id: "reviewer", header: "Reviewer" },
        { id: "reviewerRole", header: "Role" },
        { id: "comment", header: "Comment" },
        { id: "reviewedAt", header: "Reviewed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssScorecardsSurfaceKey,
      param: "hrTalentRssScorecardsSearch",
      modelField: "scorecardsSearch",
      label: "Search scorecards",
      placeholder:
        "Search interview, application, reviewer, status, rating, recommendation, or comments",
      columns: [
        { id: "reviewer", header: "Reviewer", priority: "primary" },
        { id: "application", header: "Application" },
        { id: "status", header: "Status" },
        { id: "rating", header: "Rating" },
        { id: "recommendation", header: "Recommendation" },
        { id: "submittedAt", header: "Submitted" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssApprovalsSurfaceKey,
      param: "hrTalentRssApprovalsSearch",
      modelField: "approvalsSearch",
      label: "Search approvals",
      placeholder:
        "Search approval type, target, approver, status, decision, or request date",
      columns: [
        { id: "approval", header: "Approval", priority: "primary" },
        { id: "target", header: "Target" },
        { id: "approver", header: "Approver" },
        { id: "status", header: "Status" },
        { id: "requestedAt", header: "Requested" },
        { id: "decidedAt", header: "Decided" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssRoleTasksSurfaceKey,
      param: "hrTalentRssRoleTasksSearch",
      modelField: "roleTasksSearch",
      label: "Search role tasks",
      placeholder:
        "Search task type, owner role, title, candidate, application, status, or due date",
      columns: [
        { id: "task", header: "Task", priority: "primary" },
        { id: "taskType", header: "Type" },
        { id: "ownerRole", header: "Owner role" },
        { id: "status", header: "Status" },
        { id: "dueAt", header: "Due" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssNotificationsSurfaceKey,
      param: "hrTalentRssNotificationsSearch",
      modelField: "notificationsSearch",
      label: "Search notifications",
      placeholder:
        "Search notification event, recipient, channel, status, or sent timestamp",
      columns: [
        { id: "event", header: "Event", priority: "primary" },
        { id: "recipient", header: "Recipient" },
        { id: "recipientRole", header: "Role" },
        { id: "channel", header: "Channel" },
        { id: "status", header: "Status" },
        { id: "sentAt", header: "Sent" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssPrivacyRecordsSurfaceKey,
      param: "hrTalentRssPrivacyRecordsSearch",
      modelField: "privacyRecordsSearch",
      label: "Search privacy records",
      placeholder:
        "Search candidate, privacy tier, consent, retention policy, status, or closure request",
      columns: [
        { id: "candidate", header: "Candidate", priority: "primary" },
        { id: "privacyTier", header: "Privacy" },
        { id: "consentStatus", header: "Consent" },
        { id: "retentionStatus", header: "Retention" },
        { id: "retentionPolicyRef", header: "Policy" },
        { id: "closureRequestedAt", header: "Closure requested" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssAccessLogSurfaceKey,
      param: "hrTalentRssAccessLogSearch",
      modelField: "accessLogSearch",
      label: "Search access log",
      placeholder:
        "Search actor, role, target, privacy tier, reason, or access timestamp",
      columns: [
        { id: "target", header: "Target", priority: "primary" },
        { id: "actor", header: "Actor" },
        { id: "actorRole", header: "Role" },
        { id: "privacyTier", header: "Privacy" },
        { id: "accessReason", header: "Reason" },
        { id: "accessedAt", header: "Accessed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssRetentionActionsSurfaceKey,
      param: "hrTalentRssRetentionActionsSearch",
      modelField: "retentionActionsSearch",
      label: "Search retention actions",
      placeholder:
        "Search candidate, action, policy, status, performer, or timestamp",
      columns: [
        { id: "candidate", header: "Candidate", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "policyRef", header: "Policy" },
        { id: "status", header: "Status" },
        { id: "performedBy", header: "Performed by" },
        { id: "performedAt", header: "Performed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssReportsSurfaceKey,
      param: "hrTalentRssReportsSearch",
      modelField: "reportsSearch",
      label: "Search RSS reports",
      placeholder:
        "Search report group, grouping dimension, count, pending tasks, restricted records, or activity",
      columns: [
        { id: "group", header: "Group", priority: "primary" },
        { id: "groupBy", header: "Grouped by" },
        { id: "count", header: "Records" },
        { id: "pendingTasks", header: "Pending tasks" },
        { id: "restrictedRecords", header: "Restricted" },
        { id: "lastActivityAt", header: "Last activity" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTalentRssAuditTrailSurfaceKey,
      param: "hrTalentRssAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search RSS audit trail",
      placeholder:
        "Search audit action, actor, target, candidate, application, summary, or occurrence timestamp",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "target", header: "Target" },
        { id: "candidateId", header: "Candidate" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const HR_TALENT_RSS_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_TALENT_RSS_LIST_SURFACE_REGISTRY);

export type HrTalentRssListSurfaceKey =
  (typeof HR_TALENT_RSS_LIST_SURFACE_KEYS)[number];

export const HR_TALENT_RSS_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(
    HR_TALENT_RSS_LIST_SURFACE_REGISTRY,
  );

export const HR_TALENT_RSS_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(
    HR_TALENT_RSS_LIST_SURFACE_REGISTRY,
  );

export const HR_TALENT_RSS_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_TALENT_RSS_LIST_SURFACE_REGISTRY);

export const HR_TALENT_RSS_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(
    HR_TALENT_RSS_LIST_SURFACE_REGISTRY,
  );

export const HR_TALENT_RSS_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrTalentRssCandidateProfilesSurfaceKey]: "erp-operational-table",
  [hrTalentRssJobPostingsSurfaceKey]: "erp-operational-table",
  [hrTalentRssApplicationsSurfaceKey]: "erp-operational-table",
  [hrTalentRssDocumentsSurfaceKey]: "erp-operational-table",
  [hrTalentRssInterviewsSurfaceKey]: "erp-operational-table",
  [hrTalentRssAssessmentsSurfaceKey]: "erp-operational-table",
  [hrTalentRssPreEmploymentFormsSurfaceKey]: "erp-operational-table",
  [hrTalentRssOffersSurfaceKey]: "erp-operational-table",
  [hrTalentRssInternalApplicationsSurfaceKey]: "erp-operational-table",
  [hrTalentRssRequisitionRequestsSurfaceKey]: "erp-operational-table",
  [hrTalentRssCandidateReviewsSurfaceKey]: "erp-operational-table",
  [hrTalentRssScorecardsSurfaceKey]: "erp-operational-table",
  [hrTalentRssApprovalsSurfaceKey]: "erp-operational-table",
  [hrTalentRssRoleTasksSurfaceKey]: "erp-operational-table",
  [hrTalentRssNotificationsSurfaceKey]: "erp-operational-table",
  [hrTalentRssPrivacyRecordsSurfaceKey]: "erp-operational-table",
  [hrTalentRssAccessLogSurfaceKey]: "erp-audit-ledger",
  [hrTalentRssRetentionActionsSurfaceKey]: "erp-operational-table",
  [hrTalentRssReportsSurfaceKey]: "erp-operational-table",
  [hrTalentRssAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrTalentRssListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrTalentRssListSurfaceKeys(): readonly HrTalentRssListSurfaceKey[] {
  return HR_TALENT_RSS_LIST_SURFACE_KEYS;
}
