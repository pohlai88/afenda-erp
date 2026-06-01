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
} from "./hr.talent.rss-surface-metadata.shared";

type ListCopy = {
  readonly title: string;
  readonly description: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
};

export const hrTalentRssUiCopy = {
  title: "Candidate Self-Service Portal",
  description:
    "Role-based recruitment self-service for candidates, employees, hiring managers, interviewers, recruiters, and approvers.",
  page: {
    title: "Candidate Self-Service Portal",
    description:
      "Governed recruitment self-service workspace for candidate profiles, applications, interviews, assessments, offers, role tasks, privacy controls, and audit history.",
  },
  overview: {
    sectionTitle: "Recruitment Self-Service Control",
    candidates: "Candidates",
    activeApplications: "Active applications",
    pendingTasks: "Pending tasks",
    privacyActions: "Privacy actions",
  },
  listSections: {
    [hrTalentRssCandidateProfilesSurfaceKey]: {
      title: "Candidate Profiles",
      description:
        "Candidate and internal applicant portal accounts with profile, consent, account, and retention state.",
      emptyTitle: "No candidate profiles",
      emptyDescription:
        "Candidate profiles appear after account registration or internal application access.",
    },
    [hrTalentRssJobPostingsSurfaceKey]: {
      title: "Job Postings",
      description:
        "Open internal and external postings exposed to the self-service portal from recruitment.",
      emptyTitle: "No visible job postings",
      emptyDescription:
        "Open postings appear after recruitment publishes portal-visible vacancies.",
    },
    [hrTalentRssApplicationsSurfaceKey]: {
      title: "Applications",
      description:
        "Portal-submitted applications with status tracking, stage visibility, and withdrawal state.",
      emptyTitle: "No applications",
      emptyDescription:
        "Applications appear after candidates submit or save job applications.",
    },
    [hrTalentRssDocumentsSurfaceKey]: {
      title: "Candidate Documents",
      description:
        "Resume, certificate, portfolio, eligibility, and pre-employment evidence references with privacy masking.",
      emptyTitle: "No submitted documents",
      emptyDescription:
        "Candidate document references appear after controlled portal upload.",
    },
    [hrTalentRssInterviewsSurfaceKey]: {
      title: "Interview Self-Service",
      description:
        "Interview invitations, confirmations, reschedule requests, and candidate-facing instructions.",
      emptyTitle: "No interview invitations",
      emptyDescription:
        "Interview rows appear after recruitment assigns interview activity.",
    },
    [hrTalentRssAssessmentsSurfaceKey]: {
      title: "Assessment Access",
      description:
        "Assigned assessment links, access state, submission status, and expiry controls.",
      emptyTitle: "No assessments",
      emptyDescription:
        "Assessment access appears when an enabled assessment is assigned.",
    },
    [hrTalentRssPreEmploymentFormsSurfaceKey]: {
      title: "Pre-Employment Forms",
      description:
        "Right-to-work, reference, medical declaration, and candidate information form status.",
      emptyTitle: "No form requirements",
      emptyDescription:
        "Pre-employment forms appear when required by the recruitment workflow.",
    },
    [hrTalentRssOffersSurfaceKey]: {
      title: "Offer Self-Service",
      description:
        "Candidate offer viewing, acknowledgement, acceptance, decline, and approval state.",
      emptyTitle: "No offer actions",
      emptyDescription:
        "Offer actions appear after an approved offer is released to a candidate.",
    },
    [hrTalentRssInternalApplicationsSurfaceKey]: {
      title: "Internal Applications",
      description:
        "Existing employee applications for internal vacancies with stage and status tracking.",
      emptyTitle: "No internal applications",
      emptyDescription:
        "Internal applications appear when employees apply for internal postings.",
    },
    [hrTalentRssRequisitionRequestsSurfaceKey]: {
      title: "Requisition Requests",
      description:
        "Hiring-manager self-service requisition requests and approval outcomes.",
      emptyTitle: "No requisition requests",
      emptyDescription:
        "Requisition requests appear after hiring managers submit role requests.",
    },
    [hrTalentRssCandidateReviewsSurfaceKey]: {
      title: "Candidate Reviews",
      description:
        "Hiring-manager shortlist, rejection, hold, and comment activity on assigned candidates.",
      emptyTitle: "No candidate reviews",
      emptyDescription:
        "Candidate review rows appear after authorized manager decisions.",
    },
    [hrTalentRssScorecardsSurfaceKey]: {
      title: "Interview Scorecards",
      description:
        "Interviewer ratings, comments, and hiring recommendations submitted through the portal.",
      emptyTitle: "No scorecards",
      emptyDescription:
        "Scorecards appear after interviewers submit hiring feedback.",
    },
    [hrTalentRssApprovalsSurfaceKey]: {
      title: "Approver Workspace",
      description:
        "Requisition, offer, and exception approval tasks with decision status.",
      emptyTitle: "No approval tasks",
      emptyDescription:
        "Approvals appear when requisitions, offers, or exceptions need a decision.",
    },
    [hrTalentRssRoleTasksSurfaceKey]: {
      title: "Role Task Queue",
      description:
        "Role-filtered recruitment tasks across pending applications, interviews, feedback, approvals, offers, documents, assessments, and privacy follow-up.",
      emptyTitle: "No pending tasks",
      emptyDescription:
        "Role tasks appear when recruitment self-service users have pending work.",
    },
    [hrTalentRssNotificationsSurfaceKey]: {
      title: "Portal Notifications",
      description:
        "Application updates, interview reminders, assessments, offers, approvals, rejections, and pending-task notices.",
      emptyTitle: "No notifications",
      emptyDescription:
        "Notifications appear after recruitment self-service events are queued or sent.",
    },
    [hrTalentRssPrivacyRecordsSurfaceKey]: {
      title: "Privacy & Consent",
      description:
        "Candidate privacy tier, consent capture, retention policy, account closure, and data handling state.",
      emptyTitle: "No privacy records",
      emptyDescription:
        "Privacy records appear after consent or retention policy evaluation.",
    },
    [hrTalentRssAccessLogSurfaceKey]: {
      title: "Access Log",
      description:
        "Sensitive candidate, application, document, scorecard, offer, and approval access history.",
      emptyTitle: "No access log rows",
      emptyDescription:
        "Access events appear when restricted candidate data is viewed.",
    },
    [hrTalentRssRetentionActionsSurfaceKey]: {
      title: "Retention & Account Actions",
      description:
        "Candidate account closure, retention review, legal hold, and data closure actions.",
      emptyTitle: "No retention actions",
      emptyDescription:
        "Retention actions appear when account closure or data retention policy is applied.",
    },
    [hrTalentRssReportsSurfaceKey]: {
      title: "Self-Service Reports",
      description:
        "Grouped recruitment self-service report rows for status, stage, posting, privacy, consent, role, and period analysis.",
      emptyTitle: "No report rows",
      emptyDescription:
        "Report rows appear after portal activity is grouped for operational review.",
    },
    [hrTalentRssAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Audit events for profile, application, document, interview, assessment, scorecard, offer, approval, withdrawal, consent, retention, and account actions.",
      emptyTitle: "No audit events",
      emptyDescription:
        "Audit rows appear after controlled recruitment self-service actions are recorded.",
    },
  } satisfies Record<HrTalentRssListSurfaceKey, ListCopy>,
  accessDenied: {
    title: "Candidate self-service access required",
    description:
      "You do not have permission to view recruitment self-service records.",
  },
} as const;
