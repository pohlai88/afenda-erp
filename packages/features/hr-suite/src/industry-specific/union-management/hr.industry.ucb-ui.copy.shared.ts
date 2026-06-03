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

export const hrIndustryUcbUiCopy = {
  title: "Union & Collective Bargaining Management",
  description:
    "Manage union records, collective bargaining agreements, bargaining-unit assignments, membership, CBA rules, seniority, dues references, grievances, disputes, labor meetings, renewals, reports, integrations, and audit history.",
  page: {
    title: "Union & Collective Bargaining Management",
    description:
      "Labor-relations control workspace for union membership, CBA coverage, seniority rules, grievances, disputes, dues references, renewal alerts, downstream exposures, and governed audit readiness.",
  },
  overview: {
    sectionTitle: "Collective Bargaining Control",
    unions: "Unions",
    agreements: "Agreements",
    memberships: "Memberships",
    grievances: "Grievances",
    conflicts: "Conflicts",
    alerts: "Alerts",
  },
  listSections: {
    [hrIndustryUcbUnionsSurfaceKey]: {
      title: "Union Records",
      description:
        "Union name, code, status, representative reference, primary representative, and active membership totals.",
      emptyTitle: "No union records",
      emptyDescription:
        "Create union records before assigning bargaining units or agreements.",
    },
    [hrIndustryUcbAgreementsSurfaceKey]: {
      title: "Collective Bargaining Agreements",
      description:
        "Agreement title, version, effective and expiry dates, applicable workforce, clauses, renewal date, negotiation status, and agreement status.",
      emptyTitle: "No collective bargaining agreements",
      emptyDescription:
        "Agreement records anchor rule references, seniority, grievances, dues, and renewal alerts.",
    },
    [hrIndustryUcbAssignmentsSurfaceKey]: {
      title: "Bargaining Unit Assignments",
      description:
        "Employee-to-bargaining-unit coverage by role, department, location, union, covered workforce, and assignment date.",
      emptyTitle: "No bargaining unit assignments",
      emptyDescription:
        "Assignments determine union coverage and applicable CBA rules for employees.",
    },
    [hrIndustryUcbMembershipsSurfaceKey]: {
      title: "Union Membership Tracking",
      description:
        "Restricted employee membership status, start date, end date, union reference, bargaining unit reference, and dues eligibility.",
      emptyTitle: "No membership records",
      emptyDescription:
        "Membership data is visible only to users authorized for restricted union data.",
    },
    [hrIndustryUcbRuleReferencesSurfaceKey]: {
      title: "CBA Rule References",
      description:
        "Pay, overtime, leave, work hours, rest days, holidays, allowances, benefits, and scheduling rule references with downstream targets.",
      emptyTitle: "No CBA rule references",
      emptyDescription:
        "Rule references expose CBA intent without owning payroll, leave, overtime, or scheduling engines.",
    },
    [hrIndustryUcbSenioritySurfaceKey]: {
      title: "Seniority Rankings",
      description:
        "Seniority dates, service length, ranking scopes, bargaining unit rank, and seniority-based decision references.",
      emptyTitle: "No seniority rankings",
      emptyDescription:
        "Seniority rows support shift preference, overtime priority, layoff, recall, vacation bidding, and promotion consideration.",
    },
    [hrIndustryUcbRuleConflictsSurfaceKey]: {
      title: "CBA and Seniority Conflicts",
      description:
        "Actions flagged for CBA or seniority conflicts with rule reference, severity, blocking status, due date, employee, and resolution state.",
      emptyTitle: "No CBA conflicts",
      emptyDescription:
        "Conflict rows appear when downstream actions breach applicable CBA or seniority rules.",
    },
    [hrIndustryUcbDuesReferencesSurfaceKey]: {
      title: "Union Dues References",
      description:
        "Dues eligibility, deduction reference, amount reference, approval state, effective date, and Payroll Processing exposure status.",
      emptyTitle: "No dues references",
      emptyDescription:
        "Approved dues references can be exposed to Payroll Processing without calculating payroll here.",
    },
    [hrIndustryUcbGrievancesSurfaceKey]: {
      title: "Grievance Cases",
      description:
        "Grievance cases linked to employee, department, location, bargaining unit, agreement clause, category, severity, process step, deadline, hearing, decision, escalation, and status.",
      emptyTitle: "No grievance cases",
      emptyDescription:
        "Create grievance cases to track submitted, review, meeting, decision, escalated, resolved, withdrawn, and closed states.",
    },
    [hrIndustryUcbDisputesSurfaceKey]: {
      title: "Dispute References",
      description:
        "Mediation, arbitration, legal, unresolved issue, grievance, employee, owner, reference, summary, and dispute status.",
      emptyTitle: "No dispute references",
      emptyDescription:
        "Dispute rows reference labor-relations escalation without owning legal case litigation.",
    },
    [hrIndustryUcbRepresentativesSurfaceKey]: {
      title: "Representatives and Stewards",
      description:
        "Union representative and steward records by role, assigned department, assigned site, union, and active status.",
      emptyTitle: "No representatives",
      emptyDescription:
        "Representatives and stewards are maintained for bargaining units and labor-relations workflows.",
    },
    [hrIndustryUcbLaborMeetingsSurfaceKey]: {
      title: "Labor-Relations Meetings",
      description:
        "Meeting schedule, participants, minutes reference, action items, overdue action count, union, agreement, and meeting status.",
      emptyTitle: "No labor-relations meetings",
      emptyDescription:
        "Meeting records keep action items and minutes references attached to labor-relations work.",
    },
    [hrIndustryUcbAlertsSurfaceKey]: {
      title: "Labor-Relations Alerts",
      description:
        "Expiring agreements, grievance deadlines, unresolved disputes, and overdue labor-relations actions with due dates and severity.",
      emptyTitle: "No alerts",
      emptyDescription:
        "Alerts are generated from agreement expiry, grievance deadlines, unresolved disputes, and overdue actions.",
    },
    [hrIndustryUcbReportsSurfaceKey]: {
      title: "Union and CBA Reports",
      description:
        "Reports for union membership, bargaining units, CBA coverage, seniority, grievances, disputes, dues references, and renewals.",
      emptyTitle: "No report rows",
      emptyDescription:
        "Reports are generated from tenant-scoped union, CBA, membership, grievance, dispute, dues, and renewal records.",
    },
    [hrIndustryUcbIntegrationExposuresSurfaceKey]: {
      title: "Integration Exposures",
      description:
        "Approved CBA rule, dues, seniority, payroll, overtime, leave, attendance, shift scheduling, document, and legal reference exposures.",
      emptyTitle: "No integration exposures",
      emptyDescription:
        "Integration references are visible only to authorized users and never replace downstream module ownership.",
    },
    [hrIndustryUcbAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Trace union setup, membership updates, bargaining unit assignment, CBA setup, rule reference changes, grievance actions, dispute escalation, seniority updates, dues references, renewals, and report exports.",
      emptyTitle: "No audit events",
      emptyDescription:
        "Controlled union and collective bargaining actions write auditable labor-relations events.",
    },
  } satisfies Record<
    HrIndustryUcbListSurfaceKey,
    {
      readonly title: string;
      readonly description: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
    }
  >,
  workbench: {
    title: "Grievance Cases",
    description:
      "Active grievance cases with employee, clause, process step, deadline, escalation, status, and restricted labor-relations details.",
  },
  accessDenied: {
    title: "Union management access required",
    description:
      "You do not have permission to view this union and collective bargaining workspace.",
  },
} as const;
