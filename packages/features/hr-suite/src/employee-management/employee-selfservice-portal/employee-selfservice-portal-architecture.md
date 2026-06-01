# Employee Self-Service Portal

## Definition

**Employee Self-Service Portal is the HRM function that allows employees to securely access their own HR information, submit HR requests, update permitted personal information, view payroll and leave information, access HR documents/resources, and track request status without requiring manual HR intervention.**

---

# Employee Self-Service Portal Includes

| Area                            | What It Covers                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Employee Profile View**       | View own employee profile, employment status, department, manager, job title, work location              |
| **Personal Information Update** | Request update for address, phone number, personal email, marital status, dependents, emergency contacts |
| **Pay Stub Access**             | View and download payslips, salary statements, tax forms, payroll summaries                              |
| **Leave Request**               | Apply for leave, view leave balance, cancel leave, view leave history                                    |
| **Attendance View**             | View attendance records, clock-in/out records, lateness, overtime, shift schedule                        |
| **Claims Submission**           | Submit expense claims, upload receipts, track reimbursement status                                       |
| **Document Access**             | View/download HR letters, employment contracts, policies, certificates, forms                            |
| **HR Resource Center**          | Access employee handbook, company policies, HR FAQs, benefits information                                |
| **Request Tracking**            | Track approval status for leave, claims, profile updates, document requests                              |
| **Approval Inbox**              | For managers to approve employee requests where applicable                                               |
| **Notification Center**         | Alerts for approvals, rejected requests, expiring documents, pending tasks                               |
| **Benefits View**               | View assigned benefits, insurance, dependents, entitlement information                                   |
| **Training Access**             | View assigned training, certificates, learning history, required courses                                 |
| **Onboarding Tasks**            | Complete assigned onboarding forms, acknowledgements, document submission                                |
| **Offboarding Tasks**           | Complete exit forms, clearance tasks, handover confirmations                                             |
| **Consent & Acknowledgement**   | Acknowledge policies, consent forms, HR notices, compliance documents                                    |
| **Audit Trail**                 | Created by, submitted by, approved by, rejected by, timestamp, reason, status history                    |

---

# Employee Self-Service Portal Does Not Include

| Excluded Area                       | Owned By                         |
| ----------------------------------- | -------------------------------- |
| Employee master record authority    | Employee Records Management      |
| Organization structure management   | Organizational Chart & Hierarchy |
| Payroll calculation                 | Payroll                          |
| Payroll run processing              | Payroll                          |
| Leave policy configuration          | Leave Management                 |
| Attendance device integration       | Time & Attendance                |
| Claims policy configuration         | Claims / Expense Management      |
| Document storage engine             | Document Management              |
| Performance review configuration    | Performance Management           |
| Training course management          | Learning / Training Management   |
| Compliance rule tracking            | Compliance & Regulatory Tracking |
| Offboarding workflow design         | Offboarding & Exit Management    |
| User role and permission governance | IAM / Access Control             |
| Finance posting                     | Finance / Accounting             |

---

# Employee Self-Service Portal Requirement Statement

| Requirement                      | Description                                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Employee Self-Service Portal** | Allows employees to securely view their own HR information, access pay stubs and HR documents, submit leave and claims requests, update permitted personal information, access HR resources, complete assigned tasks, and track request status online. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| **HRM-ESS-001** | System shall allow employees to securely access their own self-service portal.                                  |
| **HRM-ESS-002** | System shall display employee profile information from Employee Records Management.                             |
| **HRM-ESS-003** | System shall allow employees to request updates to permitted personal information.                              |
| **HRM-ESS-004** | System shall route sensitive profile update requests for HR approval before updating the master record.         |
| **HRM-ESS-005** | System shall allow employees to view leave balances.                                                            |
| **HRM-ESS-006** | System shall allow employees to submit leave applications.                                                      |
| **HRM-ESS-007** | System shall allow employees to cancel or amend leave requests based on policy.                                 |
| **HRM-ESS-008** | System shall allow employees to view leave application history and approval status.                             |
| **HRM-ESS-009** | System shall allow employees to view pay stubs and payroll statements.                                          |
| **HRM-ESS-010** | System shall allow employees to download authorized payroll documents.                                          |
| **HRM-ESS-011** | System shall allow employees to view attendance records.                                                        |
| **HRM-ESS-012** | System shall allow employees to view shift schedules and work calendars.                                        |
| **HRM-ESS-013** | System shall allow employees to submit expense claims where enabled.                                            |
| **HRM-ESS-014** | System shall allow employees to upload supporting receipts or documents for requests.                           |
| **HRM-ESS-015** | System shall allow employees to access HR policies, handbooks, forms, and FAQs.                                 |
| **HRM-ESS-016** | System shall allow employees to acknowledge policies and required HR notices.                                   |
| **HRM-ESS-017** | System shall display assigned onboarding, offboarding, compliance, or HR tasks.                                 |
| **HRM-ESS-018** | System shall allow employees to track the status of submitted requests.                                         |
| **HRM-ESS-019** | System shall notify employees of approvals, rejections, pending actions, and required tasks.                    |
| **HRM-ESS-020** | System shall provide managers with approval inbox access for employee requests where applicable.                |
| **HRM-ESS-021** | System shall restrict employees to their own HR records unless manager permissions apply.                       |
| **HRM-ESS-022** | System shall mask sensitive information based on user role and access rights.                                   |
| **HRM-ESS-023** | System shall maintain audit trail for all self-service submissions, approvals, rejections, and document access. |
| **HRM-ESS-024** | System shall support mobile-friendly access for employee self-service functions.                                |
| **HRM-ESS-025** | System shall support multilingual self-service labels, policies, and employee communications where required.    |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                         |
| --: | ----------------------------------------------------------------------------------------------------------- |
|   1 | Employee can log in and view their own HR profile.                                                          |
|   2 | Employee cannot view another employee’s private HR data unless authorized.                                  |
|   3 | Employee can request updates to permitted personal information.                                             |
|   4 | Sensitive profile updates require HR approval before becoming official master data.                         |
|   5 | Employee can view leave balance and leave history.                                                          |
|   6 | Employee can submit leave request online.                                                                   |
|   7 | Employee can track leave approval status.                                                                   |
|   8 | Employee can view and download authorized pay stubs.                                                        |
|   9 | Employee can view attendance records and shift schedule where enabled.                                      |
|  10 | Employee can submit claims with supporting documents where enabled.                                         |
|  11 | Employee can access HR policies, employee handbook, forms, and FAQs.                                        |
|  12 | Employee can acknowledge required HR policies or notices.                                                   |
|  13 | Employee can view assigned onboarding, offboarding, or HR tasks.                                            |
|  14 | Manager can approve or reject employee requests from the self-service portal where authorized.              |
|  15 | Employee receives notification when a request is submitted, approved, rejected, or returned for correction. |
|  16 | System records audit trail for every self-service submission and approval decision.                         |
|  17 | Sensitive payroll, identity, and personal fields are masked based on access rights.                         |
|  18 | Portal remains usable on desktop, tablet, and mobile screen sizes.                                          |
|  19 | Downloaded HR documents are limited to authorized document types.                                           |
|  20 | Rejected requests show rejection reason and correction guidance.                                            |

## As-built summary (code-verified)

The employee self-service portal is implemented as the `hr.workforce.ess`
feature slice at `/hr/employee-selfservice-portal`. The shipped slice uses
granular `hr.ess.*` capabilities for read, write, approve, audit, restricted
read, and integration exposure.

The metadata-driven UI includes governed server-window list surfaces for
employee profile, profile update requests, leave balances and requests, pay
documents, attendance, shifts, expense claims, HR documents, resource center
items, acknowledgements, assigned tasks, request tracking, notifications,
manager approvals, benefits, training, onboarding/offboarding tasks, consent
records, restricted access logs, reports, and audit trail.

Authority is resolved server-side from the HR execution guard. The page model
uses visible employee IDs for self and manager scope, masks payroll-sensitive,
identity-sensitive, and restricted personal/document fields without restricted
read access, and hides approval, access-log, and audit surfaces unless matching
capabilities are present.

Server actions cover profile update requests, leave submission/amend/cancel,
claim submission, supporting document upload, authorized document access,
policy acknowledgement, task completion, notification read status, approval
decisions, consent capture, and governed integration reference export. These
actions emit ESS audit events and do not directly mutate employee master data.

Coverage is tracked in `data/hr.workforce.ess-coverage.shared.ts` for
HRM-ESS-001 through HRM-ESS-025 and AC-01 through AC-20, with focused unit
tests for coverage, search-param normalization, Pattern C list contracts,
masking, and gated section behavior.

**Route:** `/hr/employee-selfservice-portal` · **Module:**
`@afenda/feature-hr-suite` · **Capabilities:** `hr.ess.read`,
`hr.ess.write`, `hr.ess.approve`, `hr.ess.audit.read`,
`hr.ess.restricted.read`, `hr.ess.integration.expose`

| Layer | Location |
| ----- | -------- |
| App adapter | `apps/erp/src/lib/hr-sections/employee-selfservice-portal.server.tsx` |
| Workbench | `components/hr.workforce.ess-section.component.server.tsx` |
| Page model | `data/hr.workforce.ess.page-model.server.ts` |
| Surface registry | `surface/hr.workforce.ess-surface-metadata.shared.ts` |
| Export doors | `server.ts` (I/O), `client.ts` (components), `metadata.ts` (keys, copy, search params) |
