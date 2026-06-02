import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seedPermissionCatalog } from "../src/permissions";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });
config({ path: resolve(rootDir, ".secret.config"), override: true });

const seedDatabaseUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!seedDatabaseUrl) {
  throw new Error(
    "A database URL is missing. Provide DATABASE_URL, NEON_PREVIEW_DATABASE_URL, or DATABASE_MIGRATION_URL before seeding permissions.",
  );
}

process.env.DATABASE_URL = seedDatabaseUrl;

const permissionCatalog = [
  {
    key: "dashboard.view",
    module: "dashboard",
    label: "View dashboard",
    description: "Read cross-module operating metrics and workspace summaries.",
  },
  {
    key: "finance.view",
    module: "finance",
    label: "View finance",
    description:
      "Read finance controls, receivables, payables, and close state.",
  },
  {
    key: "sales.view",
    module: "sales",
    label: "View sales",
    description:
      "Read quotes, orders, revenue blockers, and commercial handoffs.",
  },
  {
    key: "purchasing.view",
    module: "purchasing",
    label: "View purchasing",
    description:
      "Read supplier, purchase order, receipt, and spend-control state.",
  },
  {
    key: "inventory.view",
    module: "inventory",
    label: "View inventory",
    description:
      "Read stock health, locations, movement exceptions, and replenishment state.",
  },
  {
    key: "hr.view",
    module: "hr",
    label: "View HR",
    description:
      "Read people operations summaries and workforce exception state.",
  },
  {
    key: "hr.employees.read",
    module: "hr",
    label: "View workforce employees",
    description:
      "Read employee master profiles, directory registers, and assignment history.",
  },
  {
    key: "hr.employees.write",
    module: "hr",
    label: "Manage workforce employees",
    description:
      "Create, update, archive employees and record placement assignments.",
  },
  {
    key: "hr.employees.sensitive.read",
    module: "hr",
    label: "View sensitive employee fields",
    description:
      "Read masked-sensitive employee contact and identity fields in master profiles.",
  },
  {
    key: "hr.documents.read",
    module: "hr",
    label: "View HR documents",
    description:
      "Read employee document vault metadata and verification state.",
  },
  {
    key: "hr.documents.write",
    module: "hr",
    label: "Manage HR documents",
    description:
      "Register, verify, and archive employee document metadata in the vault.",
  },
  {
    key: "hr.documents.sensitive.read",
    module: "hr",
    label: "View sensitive HR documents",
    description:
      "Read confidential or restricted document titles and download protected artifacts.",
  },
  {
    key: "hr.lifecycle.read",
    module: "hr",
    label: "View HR lifecycle",
    description:
      "Read employment lifecycle overview, events, and pending transitions.",
  },
  {
    key: "hr.lifecycle.write",
    module: "hr",
    label: "Manage HR lifecycle",
    description:
      "Record status changes, probation outcomes, and employee movements.",
  },
  {
    key: "hr.org.read",
    module: "hr",
    label: "View HR organization",
    description:
      "Read organization units, positions, reporting lines, and org chart structure.",
  },
  {
    key: "hr.org.write",
    module: "hr",
    label: "Manage HR organization",
    description:
      "Create and update organization units, positions, and reporting relationships.",
  },
  {
    key: "hr.offboarding.read",
    module: "hr",
    label: "View HR offboarding",
    description: "Read offboarding cases and exit workflow status.",
  },
  {
    key: "hr.offboarding.write",
    module: "hr",
    label: "Manage HR offboarding",
    description: "Start, complete, and cancel employee offboarding cases.",
  },
  {
    key: "hr.compliance.read",
    module: "hr",
    label: "View HR compliance",
    description: "Read compliance obligations and exception queues.",
  },
  {
    key: "hr.compliance.write",
    module: "hr",
    label: "Manage HR compliance",
    description:
      "Register obligations, log exceptions, and resolve compliance items.",
  },
  {
    key: "hr.compliance.sensitive.read",
    module: "hr",
    label: "View sensitive HR compliance records",
    description:
      "Read identity numbers, restricted evidence titles, and sensitive compliance review notes.",
  },
  {
    key: "hr.benefits.read",
    module: "hr",
    label: "View HR benefits",
    description: "Read benefit plans, enrollments, and coverage status.",
  },
  {
    key: "hr.benefits.write",
    module: "hr",
    label: "Manage HR benefits",
    description:
      "Configure benefit plans, enroll employees, and manage benefit changes.",
  },
  {
    key: "hr.benefits.sensitive.read",
    module: "hr",
    label: "View sensitive HR benefits",
    description:
      "Read employee and employer contribution amounts and payroll deduction values on benefit registers.",
  },
  {
    key: "hr.bonus.read",
    module: "hr",
    label: "View HR bonus and incentives",
    description:
      "Read bonus plans, cycles, payout registers, and eligibility status.",
  },
  {
    key: "hr.bonus.write",
    module: "hr",
    label: "Manage HR bonus and incentives",
    description:
      "Configure plans, calculate payouts, route approvals, and lock approved payouts.",
  },
  {
    key: "hr.bonus.sensitive.read",
    module: "hr",
    label: "View sensitive HR bonus amounts",
    description:
      "Read calculated, adjusted, and final payout amounts and variance detail.",
  },
  {
    key: "hr.bonus.finance.read",
    module: "hr",
    label: "View HR bonus finance allocation",
    description:
      "Read and assign accounting allocation dimensions on bonus and incentive payouts.",
  },
  {
    key: "hr.bonus.audit.read",
    module: "hr",
    label: "View HR bonus audit trail",
    description:
      "Read bonus and incentive audit history for compliance and auditor review.",
  },
  {
    key: "hr.bonus.approve",
    module: "hr",
    label: "Approve HR bonus and incentive payouts",
    description:
      "Approve, reject, return, or adjust bonus and incentive payouts in the approval workflow.",
  },
  {
    key: "hr.expense.read",
    module: "hr",
    label: "View HR expenses",
    description:
      "Read expense claims, reimbursement status, reports, and payment handoff state.",
  },
  {
    key: "hr.expense.write",
    module: "hr",
    label: "Manage HR expenses",
    description:
      "Create claims, attach receipts, maintain claim references, and update expense records.",
  },
  {
    key: "hr.expense.approve",
    module: "hr",
    label: "Approve HR expenses",
    description:
      "Approve, reject, return, or request clarification on submitted expense claims.",
  },
  {
    key: "hr.expense.finance.read",
    module: "hr",
    label: "View HR expense finance handoff",
    description:
      "Read and process expense reimbursement payment and accounting handoff state.",
  },
  {
    key: "hr.expense.audit.read",
    module: "hr",
    label: "View HR expense audit trail",
    description:
      "Read expense claim audit events, approval decisions, payment references, and report exports.",
  },
  {
    key: "hr.expense.sensitive.read",
    module: "hr",
    label: "View sensitive HR expense data",
    description:
      "Read sensitive employee, receipt, merchant, and reimbursement details on expense claims.",
  },
  {
    key: "hr.sbs.read",
    module: "hr",
    label: "View salary benchmarking",
    description:
      "Read salary survey versions, mappings, benchmarking reports, and pay-equity analysis.",
  },
  {
    key: "hr.sbs.write",
    module: "hr",
    label: "Manage salary benchmarking",
    description:
      "Import survey data, maintain mappings, run benchmarking analysis, and update benchmark versions.",
  },
  {
    key: "hr.sbs.approve",
    module: "hr",
    label: "Approve salary benchmarking mappings",
    description:
      "Review and approve salary survey mappings and benchmark version lifecycle changes.",
  },
  {
    key: "hr.leave.read",
    module: "hr",
    label: "View HR leave",
    description: "Read employee leave requests and approval status.",
  },
  {
    key: "hr.leave.write",
    module: "hr",
    label: "Manage HR leave",
    description: "Submit, approve, reject, and cancel leave requests.",
  },
  {
    key: "hr.talent.read",
    module: "hr",
    label: "View career pathing and development plans",
    description:
      "Read career frameworks, development plans, skill gaps, and readiness snapshots.",
  },
  {
    key: "hr.talent.write",
    module: "hr",
    label: "Manage career pathing and development plans",
    description:
      "Create and update frameworks, plans, goals, mentoring, and readiness records.",
  },
  {
    key: "hr.performance.read",
    module: "hr",
    label: "View performance appraisals",
    description:
      "Read performance review cycles, goals, evaluations, outcomes, reports, and authorized history.",
  },
  {
    key: "hr.performance.write",
    module: "hr",
    label: "Manage performance appraisals",
    description:
      "Create cycles, assign employees, maintain goals, submit assessments, and update review workflow state.",
  },
  {
    key: "hr.performance.approve",
    module: "hr",
    label: "Approve performance appraisals",
    description:
      "Approve, return, and finalize performance reviews through the appraisal workflow.",
  },
  {
    key: "hr.performance.calibrate",
    module: "hr",
    label: "Calibrate performance ratings",
    description:
      "Record rating calibration references and leadership review outcomes for performance reviews.",
  },
  {
    key: "hr.performance.compensation.read",
    module: "hr",
    label: "Read performance compensation references",
    description:
      "Read finalized rating and performance outcome references for compensation and bonus planning.",
  },
  {
    key: "hr.performance.audit.read",
    module: "hr",
    label: "Read performance appraisal audit trail",
    description:
      "Read performance appraisal audit events for review, approval, acknowledgment, calibration, and finalization.",
  },
  {
    key: "hr.recruitment.read",
    module: "hr",
    label: "View recruitment and onboarding",
    description:
      "Read requisitions, postings, candidates, applications, offers, onboarding tasks, readiness, and reports.",
  },
  {
    key: "hr.recruitment.write",
    module: "hr",
    label: "Manage recruitment and onboarding",
    description:
      "Create requisitions, publish postings, move candidates, manage offers, and maintain onboarding tasks.",
  },
  {
    key: "hr.recruitment.approve",
    module: "hr",
    label: "Approve recruitment requisitions",
    description:
      "Approve or return job requisitions in the recruitment approval workflow.",
  },
  {
    key: "hr.recruitment.interview.write",
    module: "hr",
    label: "Manage recruitment interviews",
    description:
      "Schedule interviews and submit scorecards for candidates in the hiring pipeline.",
  },
  {
    key: "hr.recruitment.offer.read",
    module: "hr",
    label: "View recruitment offers",
    description: "Read offer proposal terms, conditions, and acceptance state.",
  },
  {
    key: "hr.recruitment.offer.write",
    module: "hr",
    label: "Manage recruitment offers",
    description: "Create offer proposals, link offer letters, and send offers.",
  },
  {
    key: "hr.recruitment.offer.approve",
    module: "hr",
    label: "Approve recruitment offers",
    description:
      "Approve or return offer proposals before they are sent to candidates.",
  },
  {
    key: "hr.recruitment.onboarding.read",
    module: "hr",
    label: "View recruitment onboarding",
    description:
      "Read onboarding task, document, acknowledgment, and readiness state after offer acceptance.",
  },
  {
    key: "hr.recruitment.onboarding.write",
    module: "hr",
    label: "Manage recruitment onboarding",
    description:
      "Generate, assign, complete, waive, or cancel recruitment onboarding tasks.",
  },
  {
    key: "hr.recruitment.finance.read",
    module: "hr",
    label: "Read recruitment finance references",
    description:
      "Read budget, salary, and payroll readiness references for recruitment offers.",
  },
  {
    key: "hr.recruitment.it.read",
    module: "hr",
    label: "Read recruitment IT readiness",
    description: "Read IAM and IT readiness references for onboarding.",
  },
  {
    key: "hr.recruitment.audit.read",
    module: "hr",
    label: "Read recruitment audit trail",
    description:
      "Read audit events for requisitions, applications, interviews, offers, conversion, and onboarding.",
  },
  {
    key: "hr.recruitment.sensitive.read",
    module: "hr",
    label: "Read sensitive recruitment data",
    description:
      "Read restricted candidate, offer, and pre-employment check details.",
  },
  {
    key: "hr.recruitment.convert",
    module: "hr",
    label: "Convert candidates",
    description:
      "Create governed conversion references from accepted candidates into employee records.",
  },
  {
    key: "hr.succession.read",
    module: "hr",
    label: "View succession planning",
    description:
      "Read critical roles, successors, talent pools, readiness, bench strength, and succession reports.",
  },
  {
    key: "hr.succession.write",
    module: "hr",
    label: "Manage succession planning",
    description:
      "Maintain critical roles, successors, readiness assessments, development references, and talent pools.",
  },
  {
    key: "hr.succession.approve",
    module: "hr",
    label: "Approve succession decisions",
    description:
      "Approve succession reviews, planned replacements, and leadership continuity recommendations.",
  },
  {
    key: "hr.succession.audit.read",
    module: "hr",
    label: "Read succession audit trail",
    description:
      "Read succession audit events for critical roles, nominations, readiness, calibration, review, and decisions.",
  },
  {
    key: "hr.succession.restricted.read",
    module: "hr",
    label: "Read restricted succession data",
    description:
      "Read restricted potential, flight risk, readiness gap, and leadership continuity data.",
  },
  {
    key: "hr.succession.lifecycle.expose",
    module: "hr",
    label: "Expose succession recommendations",
    description:
      "Expose approved succession recommendations to employee lifecycle promotion and movement workflows.",
  },
  {
    key: "hr.training.read",
    module: "hr",
    label: "View training and development",
    description:
      "Read training catalog, assignments, enrollment, attendance, completion, skills, certifications, reports, and authorized readiness snapshots.",
  },
  {
    key: "hr.training.write",
    module: "hr",
    label: "Manage training and development",
    description:
      "Maintain courses, providers, requirements, assignments, attendance, completions, assessments, certifications, feedback, and costs.",
  },
  {
    key: "hr.training.approve",
    module: "hr",
    label: "Approve training enrollment",
    description:
      "Approve, reject, or waitlist training enrollment requests when course approval is required.",
  },
  {
    key: "hr.training.audit.read",
    module: "hr",
    label: "Read training audit trail",
    description:
      "Read training audit events for course setup, assignment, enrollment, approval, attendance, completion, assessment, certification, renewal, expiry, and development plans.",
  },
  {
    key: "hr.training.restricted.read",
    module: "hr",
    label: "Read restricted training data",
    description:
      "Read restricted assessment scores, certification evidence references, and employee-level training cost amounts.",
  },
  {
    key: "hr.training.integration.expose",
    module: "hr",
    label: "Expose training readiness",
    description:
      "Expose mandatory training completion and skill or certification readiness references to Compliance, Performance, Lifecycle, and onboarding workflows.",
  },
  {
    key: "hr.frm.read",
    module: "hr",
    label: "View field workforce",
    description:
      "Read field assignments, mobile attendance, GPS validation references, travel status, per diem references, compliance posture, notifications, reports, and authorized exports.",
  },
  {
    key: "hr.frm.write",
    module: "hr",
    label: "Manage field workforce",
    description:
      "Maintain field assignments, mobile attendance captures, offline sync reconciliation, travel status, per diem references, exception handling, and safety confirmations.",
  },
  {
    key: "hr.frm.approve",
    module: "hr",
    label: "Approve field workforce travel",
    description:
      "Approve travel-based field assignments, travel compliance decisions, and per diem references.",
  },
  {
    key: "hr.frm.audit.read",
    module: "hr",
    label: "Read field workforce audit trail",
    description:
      "Read field assignment, mobile check-in, GPS validation, offline sync, travel, per diem, exception, approval, correction, and payroll reference audit events.",
  },
  {
    key: "hr.frm.restricted.read",
    module: "hr",
    label: "Read restricted field workforce data",
    description:
      "Read restricted location references, GPS validation references, travel details, per diem amounts, safety contacts, and payroll-sensitive field data.",
  },
  {
    key: "hr.frm.integration.expose",
    module: "hr",
    label: "Expose field workforce references",
    description:
      "Expose validated attendance, overtime work-hour, payroll, expense, travel allowance, and per diem references to authorized HR downstream modules.",
  },
  {
    key: "hr.fhc.read",
    module: "hr",
    label: "View food handler compliance",
    description:
      "Read food handler requirement rules, permits, health certification status, training completion, alerts, renewal cases, duty restrictions, reports, and authorized exports.",
  },
  {
    key: "hr.fhc.write",
    module: "hr",
    label: "Manage food handler compliance",
    description:
      "Maintain food handler requirement rules, certification evidence submissions, renewal cases, training references, and compliance review records.",
  },
  {
    key: "hr.fhc.approve",
    module: "hr",
    label: "Verify food handler evidence",
    description:
      "Verify or reject submitted food handler permit, health certification, and training evidence, and apply temporary duty restrictions.",
  },
  {
    key: "hr.fhc.audit.read",
    module: "hr",
    label: "Read food handler audit trail",
    description:
      "Read requirement setup, certificate submission, verification, rejection, renewal, expiry alert, duty restriction, integration, and compliance review audit events.",
  },
  {
    key: "hr.fhc.restricted.read",
    module: "hr",
    label: "Read restricted food handler health data",
    description:
      "Read restricted medical fitness provider, screening, health certificate document, rejection reason, and related sensitive food handler compliance references.",
  },
  {
    key: "hr.fhc.integration.expose",
    module: "hr",
    label: "Expose food handler compliance references",
    description:
      "Expose food handling eligibility, duty restrictions, mandatory training completion, and learning requirement references to authorized HR downstream modules.",
  },
  {
    key: "hr.gpg.read",
    module: "hr",
    label: "View government classification pay grades",
    description:
      "Read public-sector classifications, pay grades, salary table versions, locality adjustments, assignments, step eligibility, reports, and authorized exports.",
  },
  {
    key: "hr.gpg.write",
    module: "hr",
    label: "Manage government classification pay grades",
    description:
      "Maintain classification structures, pay grades, salary tables, locality rules, classification assignments, grade movements, and review references.",
  },
  {
    key: "hr.gpg.approve",
    module: "hr",
    label: "Approve government grade movements",
    description:
      "Approve step increases, promotions, reclassifications, downgrades, retention references, and payroll-ready classification changes.",
  },
  {
    key: "hr.gpg.audit.read",
    module: "hr",
    label: "Read government pay grade audit trail",
    description:
      "Read classification setup, salary table setup, grade assignment, step movement, locality adjustment, reclassification, retention, approval, and payroll integration audit events.",
  },
  {
    key: "hr.gpg.restricted.read",
    module: "hr",
    label: "Read restricted government pay grade data",
    description:
      "Read salary rates, locality-adjusted pay, saved pay references, movement reasons, review outcomes, and payroll-sensitive classification data.",
  },
  {
    key: "hr.gpg.integration.expose",
    module: "hr",
    label: "Expose government pay grade references",
    description:
      "Expose approved grade, step, salary table, locality adjustment, allowance, and grade movement references to Payroll Processing and Employee Lifecycle Management.",
  },
  {
    key: "hr.msc.read",
    module: "hr",
    label: "View manufacturing safety compliance",
    description:
      "Read manufacturing safety training requirements, completion status, certifications, hazard assessments, incidents, restrictions, reports, and authorized exports.",
  },
  {
    key: "hr.msc.write",
    module: "hr",
    label: "Manage manufacturing safety compliance",
    description:
      "Maintain safety training assignments, PPE acknowledgments, incident references, hazard assessments, corrective actions, evidence links, and notifications.",
  },
  {
    key: "hr.msc.approve",
    module: "hr",
    label: "Approve manufacturing safety controls",
    description:
      "Approve certification renewals, work restrictions, corrective action closures, and safety compliance reviews.",
  },
  {
    key: "hr.msc.audit.read",
    module: "hr",
    label: "Read manufacturing safety audit trail",
    description:
      "Read audit events for safety requirement setup, assignment, completion, renewal, incidents, hazard assessments, corrective actions, restrictions, reports, and compliance reviews.",
  },
  {
    key: "hr.msc.restricted.read",
    module: "hr",
    label: "Read restricted manufacturing safety data",
    description:
      "Read sensitive incident, health-related, OSHA recordkeeping, certification evidence, document reference, and restriction details.",
  },
  {
    key: "hr.msc.integration.expose",
    module: "hr",
    label: "Expose manufacturing safety references",
    description:
      "Expose safety training completion, learning requirements, eligibility, work restrictions, compliance, and document evidence references to authorized downstream modules.",
  },
  {
    key: "hr.rws.read",
    module: "hr",
    label: "View retail workforce scheduling",
    description:
      "Read retail seasonal and hourly schedules, assignments, coverage, availability, open shifts, swaps, reports, and payroll references.",
  },
  {
    key: "hr.rws.write",
    module: "hr",
    label: "Manage retail workforce scheduling",
    description:
      "Create and update draft schedules, assignments, availability, open shifts, swap requests, and scheduling notifications.",
  },
  {
    key: "hr.rws.approve",
    module: "hr",
    label: "Approve retail workforce scheduling",
    description:
      "Publish schedules, approve or reject open-shift pickups, decide shift swaps, and approve schedule overrides.",
  },
  {
    key: "hr.rws.audit.read",
    module: "hr",
    label: "View retail scheduling audit",
    description:
      "Read audit events for schedule creation, assignment, publication, changes, open shifts, swaps, budget warnings, and payroll references.",
  },
  {
    key: "hr.rws.restricted.read",
    module: "hr",
    label: "View restricted retail scheduling data",
    description:
      "Read restricted availability, blocked-date, minor or student worker, override reason, and compliance finding details.",
  },
  {
    key: "hr.rws.labor-cost.read",
    module: "hr",
    label: "View retail scheduling labor cost",
    description:
      "Read scheduled labor cost, budget amounts, employee cost references, and budget variance details.",
  },
  {
    key: "hr.rws.integration.expose",
    module: "hr",
    label: "Expose retail scheduling integrations",
    description:
      "Expose open-shift eligibility, coverage gaps, attendance outcomes, payroll references, and retail scheduling integration references.",
  },
  {
    key: "hr.ucb.read",
    module: "hr",
    label: "View union management",
    description:
      "Read union records, collective bargaining agreements, bargaining unit assignments, CBA rules, seniority references, grievances, disputes, alerts, and reports.",
  },
  {
    key: "hr.ucb.write",
    module: "hr",
    label: "Manage union management",
    description:
      "Create and update union records, CBA records, bargaining unit assignments, membership updates, grievance cases, representatives, labor meetings, and alerts.",
  },
  {
    key: "hr.ucb.approve",
    module: "hr",
    label: "Approve union management controls",
    description:
      "Approve CBA rule changes, dues references, grievance steps, dispute escalations, seniority updates, and controlled labor-relations changes.",
  },
  {
    key: "hr.ucb.audit.read",
    module: "hr",
    label: "View union management audit",
    description:
      "Read audit events for union setup, membership updates, bargaining unit assignment, CBA setup, rule changes, grievance actions, dispute escalation, seniority updates, dues, renewals, and report exports.",
  },
  {
    key: "hr.ucb.restricted.read",
    module: "hr",
    label: "View restricted union data",
    description:
      "Read restricted union membership, grievance, dispute, dues, seniority, and labor-relations data.",
  },
  {
    key: "hr.ucb.grievance.manage",
    module: "hr",
    label: "Manage union grievances",
    description:
      "Create, classify, advance, escalate, resolve, withdraw, and close grievance cases and process steps.",
  },
  {
    key: "hr.ucb.legal-reference.read",
    module: "hr",
    label: "View union legal references",
    description:
      "Read mediation, arbitration, legal, and external counsel references linked to union disputes.",
  },
  {
    key: "hr.ucb.payroll.expose",
    module: "hr",
    label: "Expose union payroll references",
    description:
      "Expose approved CBA pay, deduction, and union dues references to Payroll Processing without calculating payroll.",
  },
  {
    key: "hr.ucb.integration.expose",
    module: "hr",
    label: "Expose union integrations",
    description:
      "Expose approved CBA rule, seniority, grievance, dues, leave, overtime, scheduling, document, and legal references to authorized downstream modules.",
  },
  {
    key: "hr.ucb.report.export",
    module: "hr",
    label: "Export union reports",
    description:
      "Export governed reports for union membership, bargaining units, CBA coverage, seniority, grievances, disputes, dues references, and agreement renewals.",
  },
  {
    key: "hr.onboarding.read",
    module: "hr",
    label: "View HR onboarding",
    description: "Read onboarding cases and checklist progress.",
  },
  {
    key: "hr.onboarding.write",
    module: "hr",
    label: "Manage HR onboarding",
    description: "Start, complete checklist items, and close onboarding cases.",
  },
  {
    key: "hr.attendance.read",
    module: "hr",
    label: "View HR attendance",
    description: "Read employee clock-in and clock-out punches.",
  },
  {
    key: "hr.attendance.write",
    module: "hr",
    label: "Manage HR attendance",
    description: "Record and void attendance punches with idempotent keys.",
  },
  {
    key: "hr.overtime.read",
    module: "hr",
    label: "View HR overtime",
    description: "Read employee overtime requests and approval status.",
  },
  {
    key: "hr.overtime.write",
    module: "hr",
    label: "Manage HR overtime",
    description: "Submit, approve, reject, and cancel overtime requests.",
  },
  {
    key: "hr.shifts.read",
    module: "hr",
    label: "View HR shifts",
    description: "Read shift templates and employee shift assignments.",
  },
  {
    key: "hr.shifts.write",
    module: "hr",
    label: "Manage HR shifts",
    description:
      "Create templates, schedule shifts, publish, and cancel assignments.",
  },
  {
    key: "crm.view",
    module: "crm",
    label: "View CRM",
    description: "Read accounts, contacts, leads, and activity coverage.",
  },
  {
    key: "approvals.view",
    module: "approvals",
    label: "View approvals",
    description: "Read approval queues, escalations, and decision trails.",
  },
  {
    key: "approvals.decide",
    module: "approvals",
    label: "Decide approvals",
    description: "Approve or reject items in the operator approval queue.",
  },
  {
    key: "approvals.documents.sensitive.read",
    module: "approvals",
    label: "View sensitive approval documents",
    description:
      "Read confidential or restricted document titles and download protected approval artifacts.",
  },
  {
    key: "reports.view",
    module: "reports",
    label: "View reports",
    description:
      "Read saved views, exports, snapshots, and report freshness state.",
  },
  {
    key: "reports.documents.sensitive.read",
    module: "reports",
    label: "View sensitive report documents",
    description:
      "Read confidential or restricted document titles and download protected report artifacts.",
  },
  {
    key: "system-admin.view",
    module: "system-admin",
    label: "View system admin hub",
    description: "Access the tenant governance hub and navigation.",
  },
  {
    key: "system-admin.documents.read",
    module: "system-admin",
    label: "Read system admin documents",
    description:
      "Read governance documents attached to the system-admin module.",
  },
  {
    key: "system-admin.documents.write",
    module: "system-admin",
    label: "Manage system admin documents",
    description: "Upload and update governance documents for system-admin.",
  },
  {
    key: "system-admin.identity.read",
    module: "system-admin",
    label: "Read identity",
    description: "View members, roles, invitations, and permission matrix.",
  },
  {
    key: "system-admin.identity.write",
    module: "system-admin",
    label: "Manage identity",
    description: "Invite members, change roles, and edit role overrides.",
  },
  {
    key: "system-admin.users.read",
    module: "system-admin",
    label: "Read users",
    description: "View user access state and invitation coverage.",
  },
  {
    key: "system-admin.users.manage",
    module: "system-admin",
    label: "Manage users",
    description: "Invite, deactivate, and review organization users.",
  },
  {
    key: "system-admin.memberships.read",
    module: "system-admin",
    label: "Read memberships",
    description: "View organization membership and team assignment state.",
  },
  {
    key: "system-admin.memberships.manage",
    module: "system-admin",
    label: "Manage memberships",
    description: "Update organization membership and access assignments.",
  },
  {
    key: "system-admin.roles.read",
    module: "system-admin",
    label: "Read roles",
    description: "View role catalog, assignments, and role override state.",
  },
  {
    key: "system-admin.roles.manage",
    module: "system-admin",
    label: "Manage roles",
    description: "Assign roles and update tenant role overrides.",
  },
  {
    key: "system-admin.permissions.read",
    module: "system-admin",
    label: "Read permissions",
    description: "View the permission catalog and role coverage matrix.",
  },
  {
    key: "system-admin.permissions.manage",
    module: "system-admin",
    label: "Manage permissions",
    description: "Configure tenant permission overrides and bundles.",
  },
  {
    key: "system-admin.modules.read",
    module: "system-admin",
    label: "Read modules",
    description:
      "View module availability, readiness, and visibility settings.",
  },
  {
    key: "system-admin.modules.manage",
    module: "system-admin",
    label: "Manage modules",
    description: "Update tenant module visibility and readiness settings.",
  },
  {
    key: "system-admin.capabilities.read",
    module: "system-admin",
    label: "Read capabilities",
    description: "Inspect execution capability metadata and route coverage.",
  },
  {
    key: "system-admin.capabilities.manage",
    module: "system-admin",
    label: "Manage capabilities",
    description: "Configure tenant capability visibility and availability.",
  },
  {
    key: "system-admin.data-management.read",
    module: "system-admin",
    label: "Read data management",
    description: "View import jobs, templates, row failures, and export evidence.",
  },
  {
    key: "system-admin.data-management.manage",
    module: "system-admin",
    label: "Manage data imports",
    description:
      "Create and validate staged import jobs from approved data templates.",
  },
  {
    key: "system-admin.data-management.run",
    module: "system-admin",
    label: "Run data imports",
    description:
      "Apply validated import rows through approved adapters and domain service boundaries.",
  },
  {
    key: "system-admin.data-management.cancel",
    module: "system-admin",
    label: "Cancel data imports",
    description:
      "Cancel queued or running import jobs without silently reversing applied domain commands.",
  },
  {
    key: "system-admin.data-management.export",
    module: "system-admin",
    label: "Export data-management evidence",
    description:
      "Download audit-backed data-management job and row-failure evidence.",
  },
  {
    key: "system-admin.policies.read",
    module: "system-admin",
    label: "Read policies",
    description: "View tenant policy rules and enforcement posture.",
  },
  {
    key: "system-admin.policies.review",
    module: "system-admin",
    label: "Review policies",
    description:
      "Inspect policy coverage, readiness, and execution-law detail without mutating rules.",
  },
  {
    key: "system-admin.policies.manage",
    module: "system-admin",
    label: "Manage policies",
    description:
      "Update tenant policy rules evaluated by the execution kernel.",
  },
  {
    key: "system-admin.approvals.read",
    module: "system-admin",
    label: "Read approvals",
    description: "View approval configuration and escalation posture.",
  },
  {
    key: "system-admin.approvals.review",
    module: "system-admin",
    label: "Review approvals",
    description:
      "Inspect approval readiness, policy linkage, and escalation posture without mutating rules.",
  },
  {
    key: "system-admin.approvals.manage",
    module: "system-admin",
    label: "Manage approvals",
    description: "Update tenant approval chains and escalation settings.",
  },
  {
    key: "system-admin.settings.read",
    module: "system-admin",
    label: "Read tenant settings",
    description: "View locale, timezone, branding, and data-handling policy.",
  },
  {
    key: "system-admin.settings.write",
    module: "system-admin",
    label: "Manage tenant settings",
    description: "Update tenant profile and operational settings.",
  },
  {
    key: "system-admin.audit.read",
    module: "system-admin",
    label: "Read audit log",
    description: "Browse tenant audit events and governance trails.",
  },
  {
    key: "system-admin.audit.review",
    module: "system-admin",
    label: "Review audit evidence",
    description:
      "Investigate audit timelines, retention posture, and coverage gaps.",
  },
  {
    key: "system-admin.audit.export",
    module: "system-admin",
    label: "Export audit log",
    description: "Export audit evidence for compliance review.",
  },
  {
    key: "system-admin.security.read",
    module: "system-admin",
    label: "Read security",
    description: "View tenant security posture and sensitive action policy.",
  },
  {
    key: "system-admin.security.manage",
    module: "system-admin",
    label: "Manage security",
    description: "Update tenant MFA, session, and trusted domain policy.",
  },
  {
    key: "system-admin.organization.read",
    module: "system-admin",
    label: "Read organization settings",
    description:
      "View organization profile, locale, calendar, and numbering defaults.",
  },
  {
    key: "system-admin.organization.manage",
    module: "system-admin",
    label: "Manage organization settings",
    description:
      "Update organization operating defaults and document prefixes.",
  },
  {
    key: "system-admin.integrations.read",
    module: "system-admin",
    label: "Read integrations",
    description: "View API credentials, webhooks, and SSO configuration.",
  },
  {
    key: "system-admin.integrations.write",
    module: "system-admin",
    label: "Manage integrations",
    description: "Rotate API keys, register webhooks, and update SSO config.",
  },
  {
    key: "system-admin.lynx.read",
    module: "system-admin",
    label: "Read Lynx governance",
    description: "View AI usage, approvals, sandboxes, and Lynx eval state.",
  },
  {
    key: "system-admin.lynx.approve",
    module: "system-admin",
    label: "Approve Lynx actions",
    description: "Approve or reject AI action sandboxes and proposals.",
  },
  {
    key: "system-admin.reliability.read",
    module: "system-admin",
    label: "Read reliability",
    description: "View cron health, workflow sweeps, and observability drain.",
  },
  {
    key: "system-admin.billing.read",
    module: "system-admin",
    label: "Read billing",
    description: "View marketplace usage and billing posture.",
  },
  {
    key: "system-admin.billing.manage",
    module: "system-admin",
    label: "Manage billing",
    description: "Update billing contacts and commercial metadata.",
  },
  {
    key: "system-admin.billing.export",
    module: "system-admin",
    label: "Export billing",
    description: "Export billing summary for audit and finance review.",
  },
  {
    key: "system-admin.diagnostics.read",
    module: "system-admin",
    label: "Read diagnostics",
    description:
      "View configuration drift, coverage, reliability, and spend posture.",
  },

  {
    key: "hr.rss.read",
    module: "hr",
    label: "Read Candidate Self-Service Portal",
    description: "Allows read access for Candidate Self-Service Portal.",
  },
  {
    key: "hr.rss.write",
    module: "hr",
    label: "Write Candidate Self-Service Portal",
    description: "Allows write access for Candidate Self-Service Portal.",
  },
  {
    key: "hr.rss.approve",
    module: "hr",
    label: "Approve Candidate Self-Service Portal",
    description: "Allows approve access for Candidate Self-Service Portal.",
  },
  {
    key: "hr.rss.audit.read",
    module: "hr",
    label: "Audit Read Candidate Self-Service Portal",
    description: "Allows audit read access for Candidate Self-Service Portal.",
  },
  {
    key: "hr.rss.restricted.read",
    module: "hr",
    label: "Restricted Read Candidate Self-Service Portal",
    description: "Allows restricted read access for Candidate Self-Service Portal.",
  },
  {
    key: "hr.rss.integration.expose",
    module: "hr",
    label: "Integration Expose Candidate Self-Service Portal",
    description: "Allows integration expose access for Candidate Self-Service Portal.",
  },

  {
    key: "hr.ess.read",
    module: "hr",
    label: "Read Employee Self-Service Portal",
    description: "Allows read access for Employee Self-Service Portal.",
  },
  {
    key: "hr.ess.write",
    module: "hr",
    label: "Write Employee Self-Service Portal",
    description: "Allows write access for Employee Self-Service Portal.",
  },
  {
    key: "hr.ess.approve",
    module: "hr",
    label: "Approve Employee Self-Service Portal",
    description: "Allows approve access for Employee Self-Service Portal.",
  },
  {
    key: "hr.ess.audit.read",
    module: "hr",
    label: "Audit Read Employee Self-Service Portal",
    description: "Allows audit read access for Employee Self-Service Portal.",
  },
  {
    key: "hr.ess.restricted.read",
    module: "hr",
    label: "Restricted Read Employee Self-Service Portal",
    description: "Allows restricted read access for Employee Self-Service Portal.",
  },
  {
    key: "hr.ess.integration.expose",
    module: "hr",
    label: "Integration Expose Employee Self-Service Portal",
    description: "Allows integration expose access for Employee Self-Service Portal.",
  },

  {
    key: "hr.eng.read",
    module: "hr",
    label: "Read Employee Engagement Surveys",
    description: "Allows read access for Employee Engagement Surveys.",
  },
  {
    key: "hr.eng.write",
    module: "hr",
    label: "Write Employee Engagement Surveys",
    description: "Allows write access for Employee Engagement Surveys.",
  },
  {
    key: "hr.eng.approve",
    module: "hr",
    label: "Approve Employee Engagement Surveys",
    description: "Allows approve access for Employee Engagement Surveys.",
  },
  {
    key: "hr.eng.audit.read",
    module: "hr",
    label: "Audit Read Employee Engagement Surveys",
    description: "Allows audit read access for Employee Engagement Surveys.",
  },
  {
    key: "hr.eng.restricted.read",
    module: "hr",
    label: "Restricted Read Employee Engagement Surveys",
    description: "Allows restricted read access for Employee Engagement Surveys.",
  },
  {
    key: "hr.eng.integration.expose",
    module: "hr",
    label: "Integration Expose Employee Engagement Surveys",
    description: "Allows integration expose access for Employee Engagement Surveys.",
  },
] as const;

const roleCapabilities = {
  owner: permissionCatalog.map((permission) => permission.key),
  admin: permissionCatalog.map((permission) => permission.key),
  "finance-manager": [
    "dashboard.view",
    "finance.view",
    "sales.view",
    "purchasing.view",
    "reports.view",
    "approvals.view",
    "approvals.decide",
  ],
  "operations-manager": [
    "dashboard.view",
    "sales.view",
    "purchasing.view",
    "inventory.view",
    "crm.view",
    "approvals.view",
    "approvals.decide",
    "reports.view",
  ],
  staff: [
    "dashboard.view",
    "sales.view",
    "purchasing.view",
    "inventory.view",
    "crm.view",
    "approvals.view",
  ],
  viewer: ["dashboard.view", "reports.view"],
} as const;

const rolePermissionRows = Object.entries(roleCapabilities).flatMap(
  ([role, permissionKeys]) =>
    permissionKeys.map((permissionKey) => ({
      role: role as keyof typeof roleCapabilities,
      permissionKey,
    })),
);

await seedPermissionCatalog({
  permissions: permissionCatalog,
  rolePermissions: rolePermissionRows,
});

process.stdout.write("Permission catalog seeded.\n");
