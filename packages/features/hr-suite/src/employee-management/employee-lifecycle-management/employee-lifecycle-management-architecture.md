# Employee Lifecycle Management

> **Parent doctrine:** [ARCH-002](../../../../../docs/architecture/002-erp-kernel-package-architecture.md) · [ARCH-006](../../../../../docs/architecture/006-metadata-driven-ui-architecture.md) · [ARCH-010](../../../../../docs/architecture/010-hr-feature-package-architecture.md)  
> **Golden reference:** `employee-management/compliance-regulatory-tracking/` · rule `afenda-hr-reference-slice`

## Definition

**Employee Lifecycle Management is the HRM function that tracks, controls, and automates the complete employee journey from pre-boarding, hiring, onboarding, probation, confirmation, movement, promotion, transfer, suspension, resignation, termination, retirement, and post-employment record closure.**

---

# Employee Lifecycle Management Includes

| Area                           | What It Covers                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Pre-Employment Stage**       | Candidate conversion, pre-boarding preparation, employee record initiation                          |
| **Hiring Stage**               | Hiring confirmation, employment start preparation, offer-to-employee transition                     |
| **Onboarding Stage**           | Onboarding checklist, required forms, document submission, policy acknowledgment, orientation tasks |
| **Probation Stage**            | Probation tracking, probation review, extension, confirmation, failed probation outcome             |
| **Confirmation Stage**         | Confirmation approval, confirmation letter trigger, employment status update                        |
| **Active Employment Stage**    | Active employee monitoring, profile readiness, role assignment, HR task tracking                    |
| **Employee Movement**          | Promotion, transfer, demotion, job change, department change, location change                       |
| **Contract Lifecycle**         | Contract start, contract renewal, contract expiry, fixed-term employment review                     |
| **Manager / Reporting Change** | Reporting line change, manager reassignment, approval path update                                   |
| **Employment Status Change**   | Active, probation, confirmed, suspended, notice period, separated, retired                          |
| **Suspension / Hold Stage**    | Suspension tracking, employment restriction, investigation reference                                |
| **Resignation Stage**          | Resignation submission reference, notice period tracking, last working date trigger                 |
| **Termination Stage**          | Termination process trigger, termination reason, approval reference                                 |
| **Retirement Stage**           | Retirement eligibility, retirement notice, retirement workflow trigger                              |
| **Offboarding Trigger**        | Exit workflow initiation, clearance trigger, final access and payroll readiness reference           |
| **Workflow Automation**        | Automatic tasks, approvals, notifications, reminders, status transitions                            |
| **Lifecycle Audit Trail**      | Stage changes, action owner, approval reference, timestamp, reason, evidence reference              |

---

# Employee Lifecycle Management Does Not Include

| Excluded Area                    | Owned By                         |
| -------------------------------- | -------------------------------- |
| Employee master profile          | Employee Records Management      |
| Employee personal information    | Employee Records Management      |
| Organization hierarchy design    | Organizational Chart & Hierarchy |
| Employee document storage engine | Document Management              |
| Employee self-service portal UI  | Employee Self-Service Portal     |
| Payroll calculation              | Payroll                          |
| Final settlement calculation     | Payroll / Offboarding            |
| Leave balance calculation        | Leave Management                 |
| Attendance records               | Time & Attendance                |
| Performance review scoring       | Performance Management           |
| Training course management       | Learning / Training Management   |
| Compliance rule monitoring       | Compliance & Regulatory Tracking |
| Asset inventory ownership        | Asset Management                 |
| Exit interview execution         | Offboarding & Exit Management    |
| Access control permission design | IAM / Access Control             |

---

# Employee Lifecycle Management Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Employee Lifecycle Management** | Tracks and controls the complete employee journey from hire to retire, including pre-boarding, onboarding, probation, confirmation, employee movement, contract renewal, suspension, resignation, termination, retirement, and offboarding trigger, with automated workflows, notifications, approvals, status transitions, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-LCY-001** | System shall define employee lifecycle stages.                                                                                                                                   |
| **HRM-LCY-002** | System shall track each employee’s current lifecycle stage.                                                                                                                      |
| **HRM-LCY-003** | System shall support lifecycle stages including pre-boarding, onboarding, probation, confirmed, active, suspended, notice period, offboarding, separated, retired, and archived. |
| **HRM-LCY-004** | System shall trigger onboarding workflow when a candidate is converted or an employee is created.                                                                                |
| **HRM-LCY-005** | System shall trigger required onboarding tasks based on employment type, legal entity, department, location, and role.                                                           |
| **HRM-LCY-006** | System shall track onboarding task completion status.                                                                                                                            |
| **HRM-LCY-007** | System shall trigger probation review before probation end date.                                                                                                                 |
| **HRM-LCY-008** | System shall support probation outcomes including confirmation, extension, or termination recommendation.                                                                        |
| **HRM-LCY-009** | System shall trigger confirmation workflow after probation approval.                                                                                                             |
| **HRM-LCY-010** | System shall trigger employee status update after confirmed lifecycle actions.                                                                                                   |
| **HRM-LCY-011** | System shall support promotion workflow.                                                                                                                                         |
| **HRM-LCY-012** | System shall support transfer workflow.                                                                                                                                          |
| **HRM-LCY-013** | System shall support demotion workflow.                                                                                                                                          |
| **HRM-LCY-014** | System shall support job, grade, manager, department, and location change workflows.                                                                                             |
| **HRM-LCY-015** | System shall support contract renewal workflow before contract expiry.                                                                                                           |
| **HRM-LCY-016** | System shall notify responsible users of upcoming contract expiry.                                                                                                               |
| **HRM-LCY-017** | System shall support suspension lifecycle state with reason, effective date, and approval reference.                                                                             |
| **HRM-LCY-018** | System shall support resignation lifecycle initiation.                                                                                                                           |
| **HRM-LCY-019** | System shall track notice period and last working date.                                                                                                                          |
| **HRM-LCY-020** | System shall trigger offboarding workflow after resignation, termination, retirement, or end of contract.                                                                        |
| **HRM-LCY-021** | System shall support termination lifecycle initiation with reason and approval reference.                                                                                        |
| **HRM-LCY-022** | System shall support retirement lifecycle initiation.                                                                                                                            |
| **HRM-LCY-023** | System shall prevent invalid lifecycle transitions.                                                                                                                              |
| **HRM-LCY-024** | System shall support effective-dated lifecycle transitions.                                                                                                                      |
| **HRM-LCY-025** | System shall preserve lifecycle history for every employee.                                                                                                                      |
| **HRM-LCY-026** | System shall send notifications and reminders for lifecycle tasks, approvals, and overdue actions.                                                                               |
| **HRM-LCY-027** | System shall expose lifecycle status to Employee Records, Payroll, Leave, Attendance, IAM, Compliance, and Offboarding modules.                                                  |
| **HRM-LCY-028** | System shall maintain audit trail for lifecycle stage changes, approvals, rejections, and automated triggers.                                                                    |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                         |
| --: | --------------------------------------------------------------------------------------------------------------------------- |
|   1 | Employee lifecycle stage can be assigned and viewed.                                                                        |
|   2 | Employee lifecycle stage changes are historically traceable.                                                                |
|   3 | Onboarding workflow is triggered when an employee enters onboarding stage.                                                  |
|   4 | Onboarding tasks are generated based on employee attributes.                                                                |
|   5 | Probation review is triggered before probation end date.                                                                    |
|   6 | Probation can result in confirmation, extension, or termination recommendation.                                             |
|   7 | Confirmation approval updates the employee lifecycle stage.                                                                 |
|   8 | Promotion, transfer, demotion, department change, manager change, and location change can be processed as lifecycle events. |
|   9 | Contract expiry triggers renewal review before expiry date.                                                                 |
|  10 | Suspension lifecycle state requires reason, effective date, and authorization.                                              |
|  11 | Resignation creates notice period and last working date tracking.                                                           |
|  12 | Termination requires reason, approval reference, and effective date.                                                        |
|  13 | Retirement can be tracked as a lifecycle event.                                                                             |
|  14 | Offboarding workflow is triggered when employee enters resignation, termination, retirement, or contract-end stage.         |
|  15 | Invalid lifecycle transitions are blocked.                                                                                  |
|  16 | Future-dated lifecycle changes can be scheduled.                                                                            |
|  17 | Lifecycle status is available to payroll, leave, attendance, compliance, IAM, and offboarding modules.                      |
|  18 | Automated notifications are sent for pending, overdue, and completed lifecycle actions.                                     |
|  19 | Every lifecycle transition creates an audit event.                                                                          |
|  20 | Separated or retired employees retain lifecycle history after record archival.                                              |

---

## Implementation plan (10 slices)

Golden path: clone `compliance-regulatory-tracking`. Domain prefix: **`hr.workforce.lifecycle`**. Capabilities: `hr.lifecycle.read`, `hr.lifecycle.write`.

| Slice | Goal | HRM codes (primary) |
| ----- | ---- | ------------------- |
| **1** | Vertical scaffold + architecture matrix | — |
| **2** | Access policy + package door wiring | LCY-001, 027 |
| **3** | Surface registry + search params + metadata tests | LCY-002, 003 |
| **4** | Page model + Pattern B overview + roster Pattern C | LCY-002, 003, 025 (read) |
| **5** | Pending transitions + status mutations | LCY-023, 024, 025, 028 |
| **6** | Probation + confirmation forms/actions | LCY-007–010 |
| **7** | Employee movement workflows | LCY-011–014 |
| **8** | Suspension, notice, separation paths | LCY-017–019, 021–022 |
| **9** | Audit trail + module exposure + notifications (minimal) | LCY-026, 027, 028 |
| **10** | `SHIPPED_CAPABILITIES`, E2E, remove root stubs | all → Shipped or Deferred |

**Deferred (explicit owner, no half-ship):** LCY-004…006 onboarding tasks → Onboarding; LCY-015…016 contract renewal → schema slice; pre-boarding stage → Employee Records / enum migration.

**Verification each slice:** `check-hr-feature-vertical-naming.mts` (after Slice 10), `@afenda/feature-hr-suite test`, `architecture:check`, `lint:governed-renderers` when surfaces change.

---

## As-built summary (code-verified)

**Route:** `/hr/lifecycle` · **Module:** `@afenda/feature-hr-suite` · **Capabilities:** `hr.lifecycle.read`, `hr.lifecycle.write`

| Layer | Location |
| ----- | -------- |
| App adapter | `apps/erp/src/lib/hr-sections/lifecycle.server.tsx` |
| Workbench | `components/hr.workforce.lifecycle-section.component.server.tsx` |
| Page model | `data/hr.workforce.lifecycle.page-model.server.ts` |
| DB commands | `@afenda/db` → `hr-lifecycle.ts` |
| Export doors | `server.ts`, `client.ts`, `metadata.ts` |

### HRM-LCY shipment matrix

| Code | Status |
| ---- | ------ |
| HRM-LCY-001 | **Shipped** (schemas + `hr_employment_status` enum alignment) |
| HRM-LCY-002 | **Shipped** (overview roster + KPI snapshot) |
| HRM-LCY-003 | **Partial** — filter via `lifecycleEmploymentStatus`; pre-boarding **Deferred** |
| HRM-LCY-023 | **Shipped** — `changeHrEmploymentStatus` + Zod stored-status guard |
| HRM-LCY-024 | **Shipped** — future-dated queue + pending transitions list |
| HRM-LCY-007 | **Shipped** — probation-due list + derived review posture |
| HRM-LCY-008 | **Shipped** — `recordHrProbationOutcome` + trailing form |
| HRM-LCY-009 | **Shipped** — confirmation via probation outcome / `confirmHrEmployment` |
| HRM-LCY-010 | **Shipped** — status updates via `@afenda/db` commands |
| HRM-LCY-011 … HRM-LCY-014 | **Shipped** — movement panel + `recordHrEmployeeMovement` |
| HRM-LCY-004 … HRM-LCY-006 | **Partial** — onboarding cases queue + `startHrOnboarding` action |
| HRM-LCY-017 … HRM-LCY-022 | **Shipped** — exit panel + notice period + offboarding case start |
| HRM-LCY-018 … HRM-LCY-020 | **Partial** — offboarding cases list; clearance UI Slice 12 |
| HRM-LCY-019 | **Shipped** — notice period register + last working from case |
| HRM-LCY-025 | **Shipped** — org audit trail Pattern C list |
| HRM-LCY-027 | **Shipped** — `resolveHrEmployeeLifecycleStage` read helper |
| HRM-LCY-028 | **Shipped** — execution audit on all lifecycle mutations |
| HRM-LCY-015 … HRM-LCY-016 | **Deferred** — contract renewal (schema) |
| HRM-LCY-026 | **Deferred** — notifications |

**Workbench surfaces:** pending → probation → onboarding cases → notice period → offboarding cases → exit panel → movement → roster → audit trail.

**Slice 10:** `SHIPPED_CAPABILITIES`, `apps/erp/tests/e2e/hr-lifecycle.spec.ts`.

---

## Implementation plan — phase 2 (slice 11+)

| Slice | Goal | HRM codes |
| ----- | ---- | --------- |
| **11** | Onboarding/offboarding queues + notice period + exit panel | LCY-004–006, 017–020, 021–022 (partial) |
| **12** | Checklist/clearance item completion UI | LCY-006, 020 (execution) |
| **13** | Contract renewal horizon | LCY-015–016 (schema + list) |
| **14** | Lifecycle reminders (minimal) | LCY-026 |

---

### Slice 11 as-built (code-verified)

| Code | Status |
| ---- | ------ |
| HRM-LCY-004 … HRM-LCY-006 | **Partial** — `listHrOnboardingCasesWindow`, `startHrOnboardingCaseAction`, onboarding cases list |
| HRM-LCY-017 … HRM-LCY-022 | **Shipped** — notice period list, exit panel, `initiateHrNoticePeriodAction`, `startHrOffboardingCaseAction` |
| HRM-LCY-018 … HRM-LCY-020 | **Partial** — offboarding cases list + `startHrOffboarding` wiring; clearance completion Slice 12 |
| HRM-LCY-019 | **Shipped** — `listHrLifecycleNoticePeriodWindow` + last working date from active case |

**Workbench order:** scheduled transitions → probation → onboarding cases → notice period → offboarding cases → exit pathways → movement → roster → audit trail.
