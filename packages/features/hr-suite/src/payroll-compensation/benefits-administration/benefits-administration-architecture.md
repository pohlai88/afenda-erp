# Benefits Administration

## Definition

**Benefits Administration is the HRM function that manages employee benefit plans, eligibility, enrollment, coverage, dependents, employer contributions, employee deductions, benefit changes, benefit claims references, payroll deduction integration, and benefit compliance records.**

---

# Benefits Administration Includes

| Area                              | What It Covers                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Benefit Plan Management**       | Medical plan, dental plan, insurance plan, retirement plan, wellness plan, allowance plan           |
| **Benefit Category**              | Health, insurance, retirement, welfare, transport, meal, housing, education, wellness               |
| **Eligibility Rules**             | Eligibility by employment type, grade, job level, location, legal entity, tenure, employee category |
| **Enrollment Management**         | Employee enrollment, open enrollment, new hire enrollment, life-event enrollment                    |
| **Dependent Coverage**            | Spouse, children, family members, dependent eligibility, dependent documents                        |
| **Coverage Level**                | Employee only, employee + spouse, employee + children, family coverage                              |
| **Employer Contribution**         | Employer-paid premium, employer contribution amount, company subsidy                                |
| **Employee Contribution**         | Employee-paid portion, payroll deduction amount, deduction frequency                                |
| **Benefit Effective Dates**       | Coverage start date, coverage end date, enrollment date, termination date                           |
| **Benefit Change Management**     | Plan change, coverage change, dependent change, contribution change                                 |
| **Benefit Deduction Integration** | Payroll deduction setup, recurring deduction, benefit-related taxable treatment                     |
| **Benefit Provider Reference**    | Insurance provider, benefit vendor, plan administrator                                              |
| **Benefit Document Reference**    | Policy document, enrollment form, dependent document, approval document                             |
| **Benefit Claims Reference**      | Claim reference, reimbursement reference, approval status, payment reference                        |
| **Benefit Compliance**            | Mandatory benefit eligibility, statutory benefit reference, coverage requirement                    |
| **Benefit Reporting**             | Enrollment report, cost report, deduction report, dependent report, provider report                 |
| **Benefit Audit Trail**           | Enrolled by, changed by, approved by, effective date, previous plan, new plan, timestamp            |

---

# Benefits Administration Does Not Include

| Excluded Area                       | Owned By                                  |
| ----------------------------------- | ----------------------------------------- |
| Employee master profile             | Employee Records Management               |
| Employee dependents master data     | Employee Records / Employee Self-Service  |
| Payroll calculation                 | Payroll Processing                        |
| Payroll run finalization            | Payroll Processing                        |
| Country statutory payroll rules     | Multi-Country Payroll                     |
| Expense claim submission            | Expense Reimbursement                     |
| Medical claim processing workflow   | Expense Reimbursement / Claims Management |
| Insurance provider system ownership | External Provider / Integration           |
| Document storage engine             | Document Management                       |
| Organization hierarchy              | Organizational Chart & Hierarchy          |
| Leave entitlement calculation       | Leave Management                          |
| Attendance records                  | Time & Attendance                         |
| Compensation budgeting              | Compensation Planning & Modeling          |
| Bonus calculation                   | Bonus & Incentive Management              |
| Salary market comparison            | Salary Benchmarking & Surveys             |

---

# Benefits Administration Requirement Statement

| Requirement                 | Description                                                                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Benefits Administration** | Manages employee benefit plans including eligibility, enrollment, dependent coverage, employer contributions, employee contributions, payroll deduction integration, benefit effective dates, provider references, benefit documents, benefit changes, reporting, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-BEN-001** | System shall create and maintain benefit plans.                                                                                                        |
| **HRM-BEN-002** | System shall classify benefit plans by benefit category.                                                                                               |
| **HRM-BEN-003** | System shall configure benefit eligibility rules by legal entity, country, location, employment type, grade, job level, employee category, and tenure. |
| **HRM-BEN-004** | System shall determine employee eligibility for benefit plans.                                                                                         |
| **HRM-BEN-005** | System shall support new hire benefit enrollment.                                                                                                      |
| **HRM-BEN-006** | System shall support open enrollment periods.                                                                                                          |
| **HRM-BEN-007** | System shall support life-event enrollment changes.                                                                                                    |
| **HRM-BEN-008** | System shall allow eligible employees to enroll in available benefit plans.                                                                            |
| **HRM-BEN-009** | System shall support dependent enrollment where applicable.                                                                                            |
| **HRM-BEN-010** | System shall validate dependent eligibility.                                                                                                           |
| **HRM-BEN-011** | System shall support coverage levels including employee only, employee plus spouse, employee plus children, and family coverage.                       |
| **HRM-BEN-012** | System shall maintain benefit effective start date and end date.                                                                                       |
| **HRM-BEN-013** | System shall calculate or store employer contribution amount for benefit plans.                                                                        |
| **HRM-BEN-014** | System shall calculate or store employee contribution amount for benefit plans.                                                                        |
| **HRM-BEN-015** | System shall create payroll deduction references for employee-paid benefit contributions.                                                              |
| **HRM-BEN-016** | System shall integrate approved benefit deductions with Payroll Processing.                                                                            |
| **HRM-BEN-017** | System shall support recurring benefit deductions.                                                                                                     |
| **HRM-BEN-018** | System shall support benefit plan change, coverage change, dependent change, and contribution change.                                                  |
| **HRM-BEN-019** | System shall support benefit enrollment approval workflow where required.                                                                              |
| **HRM-BEN-020** | System shall maintain benefit provider and vendor references.                                                                                          |
| **HRM-BEN-021** | System shall link benefit records to supporting documents.                                                                                             |
| **HRM-BEN-022** | System shall track benefit coverage status including pending, active, waived, suspended, terminated, and expired.                                      |
| **HRM-BEN-023** | System shall terminate or adjust benefit coverage when employee employment status changes.                                                             |
| **HRM-BEN-024** | System shall support benefit cost reporting by employee, department, legal entity, country, provider, and plan.                                        |
| **HRM-BEN-025** | System shall support benefit enrollment reporting.                                                                                                     |
| **HRM-BEN-026** | System shall support payroll deduction reporting for benefit contributions.                                                                            |
| **HRM-BEN-027** | System shall restrict access to sensitive benefit information based on role and permission.                                                            |
| **HRM-BEN-028** | System shall maintain audit trail for benefit eligibility, enrollment, waiver, approval, change, termination, deduction, and provider update actions.  |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                     |
| --: | --------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Benefit plan can be created with category, provider, eligibility rules, contribution rules, and effective dates.                        |
|   2 | Benefit plans can be classified by health, insurance, retirement, welfare, transport, meal, housing, education, or wellness category.   |
|   3 | Employee eligibility can be determined based on employment type, grade, legal entity, country, location, tenure, and employee category. |
|   4 | Eligible employees can be enrolled into benefit plans.                                                                                  |
|   5 | Ineligible employees are prevented from enrolling unless authorized override is approved.                                               |
|   6 | New hire enrollment can be triggered after employee onboarding or employment activation.                                                |
|   7 | Open enrollment period can be configured and controlled.                                                                                |
|   8 | Life-event benefit changes can be recorded.                                                                                             |
|   9 | Dependents can be added to benefit coverage where the plan allows it.                                                                   |
|  10 | Dependent eligibility can be validated before coverage activation.                                                                      |
|  11 | Coverage level can be selected and stored.                                                                                              |
|  12 | Benefit coverage start date and end date are recorded.                                                                                  |
|  13 | Employer contribution amount can be calculated or stored.                                                                               |
|  14 | Employee contribution amount can be calculated or stored.                                                                               |
|  15 | Employee-paid benefit contribution can be sent to Payroll Processing as a recurring deduction.                                          |
|  16 | Benefit coverage status can be tracked as pending, active, waived, suspended, terminated, or expired.                                   |
|  17 | Benefit coverage can be adjusted or terminated when employee status changes.                                                            |
|  18 | Supporting benefit documents can be linked to the benefit record.                                                                       |
|  19 | Benefit cost and enrollment reports can be generated.                                                                                   |
|  20 | Sensitive benefit information is hidden from unauthorized users.                                                                        |
|  21 | Every benefit enrollment, waiver, change, termination, approval, and deduction integration creates an audit event.                      |

---

## Shipment (HRM-BEN-001..007)

**Route:** `/hr/benefits` · **Module:** `@afenda/feature-hr-suite` · **Capabilities:** `hr.benefits.read`, `hr.benefits.write`

Pattern C registry order: benefit plans → eligibility rules → open enrollment windows → enrollments → providers → audit trail (read-only).

### HRM-BEN shipment matrix

| Code | Status |
| ---- | ------ |
| HRM-BEN-001 | **Shipped** — plan upsert/archive via `upsertHrBenefitPlanAction` / `archiveHrBenefitPlanAction`; `hr_benefit_plans` |
| HRM-BEN-002 | **Shipped** — `hr_benefit_category` enum + plan schema `category` |
| HRM-BEN-003 | **Shipped** — `hr_benefit_eligibility_rules` + `upsertHrBenefitEligibilityRuleAction` |
| HRM-BEN-004 | **Shipped** — `determineHrBenefitEligibility` / `determineHrBenefitEligibilityAction`; `appliesBenefitEligibilityRuleToEmployee()` |
| HRM-BEN-005 | **Shipped** — `createNewHireBenefitEnrollmentAction` + `HrBenefitsNewHireEnrollmentForm` (`enrollment_channel = new_hire`) |
| HRM-BEN-006 | **Shipped** — `hr_benefit_open_enrollment_windows` + open enrollment guard on `createHrBenefitEnrollmentAction` |
| HRM-BEN-007 | **Shipped** — `recordHrBenefitLifeEventAction` + `HrBenefitsLifeEventRecordForm`; life-event enroll via `createHrBenefitEnrollmentAction` with `lifeEventId` |

Enterprise acceptance criteria **1–3, 6–8** are covered by the above (plan create with category/rules; eligibility determination; new hire / open enrollment / life-event enrollment paths).

| AC | Covered by |
| -- | ---------- |
| 1 | BEN-001 plan upsert with category, provider, eligibility rules, contributions, effective dates |
| 2 | BEN-002 category enum on plans |
| 3 | BEN-004 eligibility determination across scope + tenure |
| 6 | BEN-005 new hire enrollment action |
| 7 | BEN-006 open enrollment window configuration + active window guard |
| 8 | BEN-007 life event record + life-event enrollment |

**App adapter:** `apps/erp/src/lib/hr-sections/benefits.server.tsx` · **DB:** `@afenda/db` `hr-benefits.ts` · **Feature slice:** `packages/features/hr-suite/src/payroll-compensation/benefits-administration/`

---

## Shipment (HRM-BEN-008..014)

| Code | Status | As-built |
| ---- | ------ | -------- |
| HRM-BEN-008 | **Shipped** | `createHrBenefitEnrollmentInTx` + `createHrBenefitEnrollmentAction`; enrollments Pattern C list (`listHrBenefitEnrollmentsWindow`) |
| HRM-BEN-009 | **Shipped** | `addHrBenefitEnrollmentDependentInTx` + enrollment `dependents[]`; trailing **Add dependent** |
| HRM-BEN-010 | **Shipped** | `validateEnrollmentDependents` + `verifyHrBenefitEnrollmentDependentsInTx`; trailing **Verify dependents** |
| HRM-BEN-011 | **Shipped** | `hr_benefit_coverage_level` enum; `assertCoverageLevelAllowedForPlan` / `validateEnrollmentDependents` |
| HRM-BEN-012 | **Shipped** | `coverage_start_date` / `coverage_end_date` on enrollments and dependents; `assertBenefitCoverageDatesValid` |
| HRM-BEN-013 | **Shipped** | `resolveEnrollmentContributionRows` → `hr_benefit_enrollment_contributions` (employer payer) |
| HRM-BEN-014 | **Shipped** | Same helper persists employee payer rows from plan `employee_contribution_amount` |

| AC | Covered by |
| -- | ---------- |
| 4 | BEN-008 eligible employee enrollment |
| 5 | BEN-008 `employee_ineligible` unless `eligibilityOverrideReference` (audit `hr.benefits.eligibility.override.approve`) |
| 9 | BEN-009 dependent add on enrollment create and trailing |
| 10 | BEN-010 dependent validation + verify action |
| 11 | BEN-011 coverage level enum stored on enrollment |
| 12 | BEN-012 coverage effective dates on enrollment and dependents |
| 13 | BEN-013 employer contribution rows from plan amounts |
| 14 | BEN-014 employee contribution rows from plan amounts |

**Governed UI:** `buildHrBenefitsEnrollmentsListSurface` with `resolveBenefitsEnrollmentTrailingAction`; client trailing via `HrBenefitsEnrollmentsTrailingCell` (`@afenda/governed-surface/client`). Write users see `HrBenefitsEnrollmentCreateForm` when `hr.benefits.write`.

**Tests:** `tests/unit/benefits-enrollment.shared.test.ts` (eligibility guard, coverage enum, contribution storage).

---

## Shipment (HRM-BEN-022..028)

**Route:** `/hr/benefits` · **Capabilities:** `hr.benefits.read`, `hr.benefits.write`, `hr.benefits.sensitive.read`

Pattern C registry order: benefit plans → eligibility rules → open enrollment windows → enrollments (masked contribution columns without sensitive read) → providers → benefit reports (CSV export) → audit trail (read-only).

| Code | Status | As-built |
| ---- | ------ | -------- |
| HRM-BEN-022 | **Shipped** | `hr_benefit_coverage_status` enum; `assertHrBenefitCoverageStatusTransition` / `updateHrBenefitCoverageStatusInTx` |
| HRM-BEN-023 | **Shipped** | `adjustHrBenefitCoverageForEmploymentStatusInTx`; `hr-lifecycle.ts` employment status hook |
| HRM-BEN-024 | **Shipped** | `buildHrBenefitReportCsv` (`kind = cost`) |
| HRM-BEN-025 | **Shipped** | `buildHrBenefitReportCsv` (`kind = enrollment`) + `HrBenefitsReportsExportPanel` |
| HRM-BEN-026 | **Shipped** | `buildHrBenefitReportCsv` (`kind = payroll_deduction`) |
| HRM-BEN-027 | **Shipped** | `hr.benefits.sensitive.read`; masked list columns and report CSV |
| HRM-BEN-028 | **Shipped** | `hr_benefit_audit_events`; Pattern C audit trail; verbs for enrollment, coverage, reports, provider |

| AC | Covered by |
| -- | ---------- |
| 16 | BEN-022 coverage status enum + transitions |
| 17 | BEN-023 employment-driven coverage adjust/terminate |
| 19 | BEN-024–026 CSV report export |
| 20 | BEN-027 sensitive read + masking |
| 21 | BEN-028 audit events on mutations |

**Tests:** `benefitsadministration-coverage-status.test.ts`, `benefitsadministration-access.policy.test.ts`, `benefitsadministration-enrollment-audit.test.ts`.

---

## As-built summary (code-verified)

**Route:** `/hr/benefits` · **Module:** `@afenda/feature-hr-suite` · **Capabilities:** `hr.benefits.read`, `hr.benefits.write`, `hr.benefits.sensitive.read`

| Layer | Location |
| ----- | -------- |
| Schema | `@afenda/db` → `packages/db/src/schema/hr-benefits.ts` |
| Enrollment commands | `hr-benefits-enrollment-create.ts`, `hr-benefits-enrollment.shared.ts` |
| Slice | `packages/features/hr-suite/src/payroll-compensation/benefits-administration/` |
| Export doors | `server.ts`, `client.ts` (enrollment form + trailing), `metadata.ts` |
| Access policy | `policies/hr.payroll.benefits-access.policy.server.ts` |
| Audit verbs | `events/hr.payroll.benefits.event.ts` (`hrPayrollBenefitsAuditActions`) |
| Page model | `data/hr.payroll.benefits.page-model.server.ts` (`Promise.all` list loaders) |
| Coverage / employment | `packages/db/src/hr-benefits-coverage.ts`; lifecycle hook in `hr-lifecycle.ts` |
| Reports | `HrBenefitsReportsExportPanel` + `exportHrBenefitReportAction` |

### HRM-BEN shipment matrix (BEN-015..021)

| Code | Status | As-built |
| ---- | ------ | -------- |
| HRM-BEN-015 | **Shipped** | `createHrBenefitDeductionReferenceInTx` — employee-paid payroll deduction refs on active enrollment |
| HRM-BEN-016 | **Shipped** | `_integration/payroll-deductions.server.ts` + `listHrBenefitPayrollDeductionRefs` (reference-only; Payroll Processing consumes, does not recalc) |
| HRM-BEN-017 | **Shipped** | Recurring `frequency` on `hr_benefit_deduction_references`; `updateHrBenefitDeductionReferenceInTx` on contribution change |
| HRM-BEN-018 | **Shipped** | `applyHrBenefitEnrollmentChangeInTx` — plan, coverage, dependent, contribution changes persisted to `hr_benefit_enrollment_changes` |
| HRM-BEN-019 | **Shipped** | `approveHrBenefitEnrollmentInTx` — `pending` → `active`; deduction ref when employee contribution exists |
| HRM-BEN-020 | **Shipped** | `hr_benefit_providers` + `upsertHrBenefitProviderInTx` |
| HRM-BEN-021 | **Shipped** | `linkHrBenefitDocumentInTx` — `employeeDocumentId` or `externalReference` (no storage engine) |

### Mutations & audit (HRM-BEN-028)

Server Actions call `finalizeBenefitsMutation()` — domain `*InTx` command plus `writeExecutionAuditEventInTransaction()` (`targetType: hr_benefits`) in one transaction. Domain rows also append to `hr_benefit_audit_events` via `appendHrBenefitAuditEventInTx`. Audit verbs in `events/hr.payroll.benefits.event.ts`.

| Action | Requirement | Audit verb |
| ------ | ----------- | ---------- |
| `upsertHrBenefitProviderAction` | HRM-BEN-020 | `hr.benefits.provider.create` |
| `approveHrBenefitEnrollmentAction` | HRM-BEN-019, HRM-BEN-015 | `hr.benefits.enrollment.approve`, `hr.benefits.deduction.reference.create` |
| `applyHrBenefitEnrollmentChangeAction` | HRM-BEN-018, HRM-BEN-017 | `hr.benefits.enrollment.change` |
| `linkHrBenefitDocumentAction` / `unlinkHrBenefitDocumentAction` | HRM-BEN-021 | `hr.benefits.document.link` / `unlink` |
| `exportHrBenefitPayrollDeductionRefsAction` | HRM-BEN-016 | `hr.benefits.deduction.payroll.integrate` |
| `exportHrBenefitReportAction` | HRM-BEN-024–026 | `hr.benefits.report.export` |
| `createHrBenefitEnrollmentAction` | HRM-BEN-008, AC 4–5 | `hr.benefits.enrollment.create`, optional `hr.benefits.eligibility.override.approve` |
| `addHrBenefitEnrollmentDependentAction` | HRM-BEN-009 | `hr.benefits.dependent.add` |
| `verifyHrBenefitEnrollmentDependentsAction` | HRM-BEN-010 | `hr.benefits.dependent.eligibility.verify` |

### Payroll Processing integration boundary

| Layer | Path | Role |
| ----- | ---- | ---- |
| DB export | `packages/db/src/hr-benefits-deductions.ts` | `listHrBenefitPayrollDeductionRefs` — active approved enrollments with recurring deduction refs |
| Feature bridge | `payroll-compensation/_integration/payroll-deductions.server.ts` | `listApprovedBenefitPayrollDeductionRefs`, `acknowledgeBenefitPayrollDeductionSync` |
| Benefits action | `actions/hr.payroll.benefits.actions.server.ts` | `exportHrBenefitPayrollDeductionRefsAction` marks `syncedAt` after export |
| Payroll Processing | `payroll-compensation/payroll-processing/` | **Consumer** — reads refs; owns calculation and run finalization (not implemented here) |

Benefits Administration **does not** calculate net pay, apply statutory rules, or finalize payroll runs.

Per-code as-built detail for HRM-BEN-015 … HRM-BEN-028 is code-verified in `data/hr.payroll.benefits-acceptance-coverage.shared.ts`.
