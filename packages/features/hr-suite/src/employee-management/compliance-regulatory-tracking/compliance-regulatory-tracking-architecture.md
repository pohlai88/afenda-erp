# Compliance & Regulatory Tracking

## Definition

**Compliance & Regulatory Tracking is the HRM function that monitors, records, and controls employee-related compliance obligations, including labor law requirements, workplace safety obligations, statutory employment rules, mandatory filings, work eligibility, policy compliance, and regulatory audit readiness.**

---

# Compliance & Regulatory Tracking Includes


| Area                                | What It Covers                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Labor Law Compliance**            | Employment rules, working hours, rest days, overtime limits, minimum wage references, termination rules |
| **Statutory Employment Compliance** | Required employee registrations, statutory contribution readiness, employment classification compliance |
| **Work Eligibility Tracking**       | Right-to-work status, work permit, visa, passport, foreign worker eligibility                           |
| **Workplace Safety Compliance**     | Safety training, incident reporting reference, safety certification, safety policy acknowledgment       |
| **Mandatory Filing Requirements**   | Government filings, statutory reports, employment declarations, regulatory submissions                  |
| **Policy Compliance**               | Code of conduct, employee handbook, anti-harassment policy, IT policy, safety policy acknowledgment     |
| **Document Compliance Status**      | Missing, expired, pending, verified, rejected, renewed compliance documents                             |
| **Training Compliance**             | Mandatory compliance training, safety training, certification expiry, refresher training requirement    |
| **Audit Readiness**                 | Compliance checklist, evidence reference, filing status, control status                                 |
| **Compliance Alerts**               | Expiring permits, missing filings, overdue training, missing acknowledgments                            |
| **Regulatory Calendar**             | Filing deadlines, renewal dates, statutory submission due dates                                         |
| **Exception Tracking**              | Non-compliance case, waiver, corrective action, escalation status                                       |
| **Corrective Action Tracking**      | Action owner, due date, completion status, evidence reference                                           |
| **Compliance Reporting**            | Compliance overview, exception report, expiry report, filing report                                     |
| **Compliance Audit Trail**          | Created by, reviewed by, approved by, submitted by, timestamp, evidence, reason                         |


---

# Compliance & Regulatory Tracking Does Not Include


| Excluded Area                             | Owned By                              |
| ----------------------------------------- | ------------------------------------- |
| Employee master profile                   | Employee Records Management           |
| Organization structure                    | Organizational Chart & Hierarchy      |
| Employee self-service portal              | Employee Self-Service Portal          |
| Document storage engine                   | Document Management                   |
| Employee lifecycle workflow               | Employee Lifecycle Management         |
| Payroll calculation                       | Payroll                               |
| Statutory contribution calculation        | Payroll                               |
| Leave application                         | Leave Management                      |
| Attendance clocking records               | Time & Attendance                     |
| Workplace incident investigation workflow | Health & Safety / Incident Management |
| Legal case management                     | Legal / Compliance Case Management    |
| Training course content creation          | Learning / Training Management        |
| Offboarding clearance workflow            | Offboarding & Exit Management         |
| Asset recovery                            | Asset Management / Offboarding        |


---

# Compliance & Regulatory Tracking Requirement Statement


| Requirement                          | Description                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Compliance & Regulatory Tracking** | Monitors and tracks employee-related compliance obligations, including labor law adherence, statutory employment requirements, workplace safety obligations, mandatory filings, work eligibility, policy acknowledgments, compliance documents, regulatory deadlines, exceptions, corrective actions, and audit history. |


---

# Enterprise Functional Requirements


| Code            | Requirement                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-CMP-001** | System shall maintain HR compliance obligations by legal entity, country, location, employment type, and worker category.                  |
| **HRM-CMP-002** | System shall track labor law compliance requirements applicable to employees.                                                              |
| **HRM-CMP-003** | System shall track statutory employment compliance requirements.                                                                           |
| **HRM-CMP-004** | System shall track employee work eligibility status.                                                                                       |
| **HRM-CMP-005** | System shall track work permit, visa, passport, and right-to-work document status.                                                         |
| **HRM-CMP-006** | System shall track workplace safety compliance requirements.                                                                               |
| **HRM-CMP-007** | System shall track mandatory safety training and certification requirements.                                                               |
| **HRM-CMP-008** | System shall track mandatory HR policy acknowledgments.                                                                                    |
| **HRM-CMP-009** | System shall track mandatory filing requirements and filing deadlines.                                                                     |
| **HRM-CMP-010** | System shall maintain a regulatory calendar for HR compliance deadlines.                                                                   |
| **HRM-CMP-011** | System shall flag missing compliance documents.                                                                                            |
| **HRM-CMP-012** | System shall flag expired or expiring compliance documents.                                                                                |
| **HRM-CMP-013** | System shall flag overdue compliance training.                                                                                             |
| **HRM-CMP-014** | System shall flag missing mandatory policy acknowledgments.                                                                                |
| **HRM-CMP-015** | System shall classify compliance status as compliant, pending, at risk, overdue, expired, waived, or non-compliant.                        |
| **HRM-CMP-016** | System shall generate alerts for compliance deadlines, renewals, expiries, and overdue actions.                                            |
| **HRM-CMP-017** | System shall create compliance exceptions for missing, expired, overdue, or failed compliance items.                                       |
| **HRM-CMP-018** | System shall assign corrective action owners and due dates.                                                                                |
| **HRM-CMP-019** | System shall track corrective action progress and completion.                                                                              |
| **HRM-CMP-020** | System shall link compliance records to supporting evidence documents.                                                                     |
| **HRM-CMP-021** | System shall support compliance review and approval workflow where required.                                                               |
| **HRM-CMP-022** | System shall provide compliance overview surfaces by legal entity, department, location, employee category, and risk status.               |
| **HRM-CMP-023** | System shall provide compliance reports for filings, expiries, exceptions, training, acknowledgments, and work eligibility.                |
| **HRM-CMP-024** | System shall restrict access to sensitive compliance records based on role and authorization.                                              |
| **HRM-CMP-025** | System shall maintain audit trail for compliance checks, alerts, exceptions, filings, reviews, approvals, waivers, and corrective actions. |


---

# Enterprise Acceptance Criteria


| No. | Acceptance Criteria                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Compliance obligations can be configured by legal entity, country, location, employment type, and worker category. |
| 2   | Employee compliance status can be viewed from a central compliance overview.                                       |
| 3   | Work eligibility status can be tracked for applicable employees.                                                   |
| 4   | Work permit, visa, passport, and right-to-work expiry dates can be tracked.                                        |
| 5   | Missing compliance documents are flagged.                                                                          |
| 6   | Expiring compliance documents generate alerts before expiry.                                                       |
| 7   | Expired compliance documents are clearly marked as non-compliant or expired.                                       |
| 8   | Mandatory filing deadlines can be recorded and monitored.                                                          |
| 9   | Overdue mandatory filings are flagged.                                                                             |
| 10  | Mandatory policy acknowledgments can be tracked by employee and policy version.                                    |
| 11  | Missing policy acknowledgments are flagged.                                                                        |
| 12  | Mandatory safety or compliance training can be tracked.                                                            |
| 13  | Overdue compliance training is flagged.                                                                            |
| 14  | Compliance exceptions can be created for non-compliant items.                                                      |
| 15  | Corrective action owner, due date, and status can be assigned.                                                     |
| 16  | Compliance evidence can be linked to document records.                                                             |
| 17  | Compliance status can be filtered by company, department, location, employee category, and risk level.             |
| 18  | Sensitive compliance records are hidden from unauthorized users.                                                   |
| 19  | Compliance reports can be exported by authorized users.                                                            |
| 20  | Every compliance status change, filing update, exception, waiver, and corrective action creates an audit event.    |


---

## HRM-CMP-001 As-built

Compliance obligations are stored in `hr_compliance_obligations` with optional scope columns. A null scope value means the obligation applies to all employees for that dimension.


| Column               | HRM-CMP-001 dimension                 |
| -------------------- | ------------------------------------- |
| `country_code`       | Country                               |
| `legal_entity_code`  | Legal entity                          |
| `work_location_code` | Location                              |
| `employment_type`    | Employment type                       |
| `worker_category`    | Worker category                       |
| `department_id`      | Department (org assignment reference) |


Commands live in `@afenda/db` (`hr-compliance.ts` re-exports obligations, filings, regulatory calendar, exceptions, labor-law, policy-acknowledgement, safety-training, workplace-safety, work-eligibility, and work-authorization modules). Feature surfaces and forms live under `packages/features/hr-suite/src/employee-management/compliance-regulatory-tracking/`. Employee applicability uses `appliesComplianceObligationToEmployee()` — every configured dimension must match; unset obligation dimensions are wildcards.

Permissions: `hr.compliance.read`, `hr.compliance.write`. Route revalidation target: `/hr/compliance`.

## HRM-CMP-002 As-built

Employee-level labor law tracking uses `hr_compliance_employee_requirements` joined to active `labor_law` obligations and `hr_employees` scope columns (`country_code`, `legal_entity_code`, `work_location_code`, `employment_type`, `worker_category`, plus `current_department_id` for department matching).


| Layer         | Responsibility                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@afenda/db`  | `syncHrEmployeeLaborLawRequirements`, `listHrEmployeeLaborLawRequirementsWindow`, `updateHrEmployeeLaborLawRequirementStatus`                                                                    |
| Applicability | `appliesComplianceObligationToEmployee()` in `hr-compliance-scope.shared.ts`                                                                                                                     |
| Status model  | HRM-CMP-015 enum on requirement rows; `deriveEffectiveLaborLawRequirementStatus()` derives overdue/at_risk from due dates                                                                        |
| Governed UI   | Pattern C surface `hr.workforce.compliance.labor-law-requirements.list`, search param `complianceLaborLawSearch`; serialized `effectiveStatusValue` and `trailingStatusValue` for trailing cells |
| Search        | Matches employee, requirement, stored status, or derived posture tokens `overdue` / `at risk`                                                                                                    |
| Mutations     | `syncHrEmployeeLaborLawRequirementsAction`, `updateHrEmployeeLaborLawRequirementAction` with audit events                                                                                        |


Page load runs idempotent sync (inserts new rows, removes stale scope mismatches, updates due dates); write users can also sync manually from the workbench.

## HRM-CMP-008 As-built

Mandatory HR policy acknowledgment tracking uses `hr_compliance_employee_requirements` joined to active `policy_acknowledgement` obligations and `hr_employees` scope columns. Policy version is represented by obligation `code`; policy title by obligation `title`.


| Layer         | Responsibility                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@afenda/db`  | `syncHrEmployeePolicyAcknowledgements`, `listHrEmployeePolicyAcknowledgementsWindow`, `updateHrEmployeePolicyAcknowledgementStatus`                                            |
| Applicability | `appliesComplianceObligationToEmployee()` in `hr-compliance-scope.shared.ts`                                                                                                   |
| Status model  | HRM-CMP-015 enum; `deriveEffectivePolicyAcknowledgementStatus()` derives overdue/at_risk from acknowledgment due dates (HRM-CMP-014 flags missing via pending/overdue posture) |
| Governed UI   | Pattern C surface `hr.workforce.compliance.policy-acknowledgements.list`, search param `compliancePolicyAcknowledgementSearch`                                                 |
| Mutations     | `syncHrEmployeePolicyAcknowledgementsAction`, `updateHrEmployeePolicyAcknowledgementAction` with audit events                                                                  |


Page load runs idempotent sync; write users can re-run sync manually from the workbench. Trailing row actions record acknowledgment status and review notes; `completedAt` is set when status becomes `compliant`.

## HRM-CMP-012 As-built

Expired and expiring compliance documents are flagged on work authorization document rows (`hr_compliance_work_authorization_documents`).


| Layer        | Responsibility                                                                                                                                                                                                                                                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db` | `deriveWorkAuthEffectiveStatus()` read-time derivation; `buildWorkAuthDocumentExpiredSearchCondition` and `buildWorkAuthDocumentExpiringSearchCondition`; list window sorts expired → expiring → missing first via `buildWorkAuthDocumentFlaggedFirstOrderBy`; search tokens `expired` / `expiring` (alias `at risk`)                                      |
| Derivation   | `deriveWorkAuthEffectiveStatus()` marks verified/pending rows **expired** when `expiresAt` is past and **expiring** within the 14-day at-risk window; feature door `deriveEffectiveWorkAuthDocumentStatus()` delegates to the same function; `isWorkAuthDocumentExpiring()` exposes the HRM-CMP-012 expiring predicate                                                                                                                            |
| Governed UI  | Pattern C surface `hr.workforce.compliance.work-auth-documents.list` — expired uses critical badge/row tone; expiring uses attention badge/row tone; serialized `effectiveStatusValue` and `trailingStatusValue` for trailing cells                                                                                                                                 |
| Search       | `complianceWorkAuthDocumentSearch` matches employee, document number, type, stored status, or derived posture tokens `missing` / `expiring` / `expired`                                                                                                                                                                                                              |
| Calendar     | HRM-CMP-010 regulatory calendar `work_auth_renewal` entries align derived source status with the work-auth list surface                                                                                                                                                                                                                                              |


## HRM-CMP-013 As-built

Overdue compliance training is flagged on employee safety training requirement rows (`hr_compliance_employee_requirements` joined to `training` obligations).


| Layer         | Responsibility                                                                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`  | `listHrEmployeeSafetyTrainingRequirementsWindow` sorts overdue and expired rows first via `buildEmployeeRequirementOverdueFirstOrderBy`; derived search tokens `overdue` / `at risk` via `appendEmployeeRequirementWindowSearchCondition`                        |
| Derivation    | `deriveEffectiveSafetyTrainingRequirementStatus()` marks pending rows **overdue** when training due date is past; `isSafetyTrainingOverdue()` exposes the HRM-CMP-013 flag predicate                                                                           |
| Governed UI   | Pattern C surface `hr.workforce.compliance.safety-training-requirements.list` — overdue posture uses critical badge/row tone; serialized `effectiveStatusValue` and `trailingStatusValue` for trailing cells                                                     |
| Search        | `complianceSafetyTrainingSearch` matches employee, requirement, stored status, or derived posture tokens `overdue` / `at risk` / `expired`                                                                                                                   |
| Calendar      | HRM-CMP-010 regulatory calendar includes `employee_requirement` rows for safety training via shared requirement feed                                                                                                                                           |


## HRM-CMP-014 As-built

Missing mandatory policy acknowledgments are flagged on employee policy acknowledgement requirement rows (`hr_compliance_employee_requirements` joined to `policy_acknowledgement` obligations).


| Layer         | Responsibility                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`  | `listHrEmployeePolicyAcknowledgementsWindow` sorts missing rows first (overdue → at_risk → other non-compliant) via `buildEmployeeRequirementMissingFirstOrderBy`; derived search tokens `missing` / `overdue` / `at risk`         |
| Derivation    | `deriveEffectivePolicyAcknowledgementStatus()` marks pending rows **overdue** / **at_risk** from acknowledgment due dates; `isPolicyAcknowledgementMissing()` — true when effective posture is not `compliant` or `waived`       |
| Governed UI   | Pattern C surface `hr.workforce.compliance.policy-acknowledgements.list` — missing/overdue posture uses attention/critical badge and row tone; serialized `effectiveStatusValue` and `trailingStatusValue` for trailing cells       |
| Search        | `compliancePolicyAcknowledgementSearch` matches employee, policy code/title, stored status, or derived posture tokens `missing` / `overdue` / `at risk`                                                                            |
| Calendar      | HRM-CMP-010 regulatory calendar includes `employee_requirement` rows for policy acknowledgments via shared requirement feed                                                                                                        |
| Writes        | Derived-only statuses (`overdue`, `at_risk`) normalize to `pending` on mutation — same pattern as filing overdue storage                                                                                                           |


## HRM-CMP-015 As-built

Employee-level compliance posture uses the `hr_compliance_requirement_status` enum on `hr_compliance_employee_requirements.status`. Effective posture is derived at read time; trailing actions persist only stored workflow values.


| Token           | Stored | Derived | Applies to                                                                 |
| --------------- | ------ | ------- | -------------------------------------------------------------------------- |
| `compliant`     | Yes    | —       | Labor law, policy acknowledgments, safety training, workplace safety       |
| `pending`       | Yes    | —       | Same requirement registers; base posture before due-date derivation        |
| `at_risk`       | No     | Yes     | Pending/compliant rows within 14-day due or certification expiry window    |
| `overdue`       | No     | Yes     | Pending rows past due date (labor law, policy ack, training due dates)     |
| `expired`       | Yes    | Yes     | Stored terminal status; also derived when compliant certification is past  |
| `waived`        | Yes    | —       | Operator-recorded waiver on requirement rows                               |
| `non_compliant` | Yes    | —       | Operator-recorded failure posture                                          |


| Layer         | Responsibility                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`  | `hr_compliance_requirement_status` enum; `normalizeStoredRequirementStatusForMutation()` coerces derived-only writes to `pending`; search helpers match derived tokens `overdue` / `at risk` / `missing`         |
| Feature data  | `HRM_COMPLIANCE_REQUIREMENT_*` constants and thin wrappers over `@afenda/db` `deriveRequirementEffectiveStatus()` in `hr.workforce.compliance-status.shared.ts`; filing/work-auth/eligibility wrappers delegate to `hr-compliance-effective-status.shared.ts`; `toEnumMember()` in `hr.workforce.compliance-enum-guard.shared.ts` rejects unexpected derivation output |
| Zod           | Trailing schemas accept `HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES` only — derived tokens rejected at the form boundary                                                                                       |
| Governed UI   | Status column displays `effectiveStatusValue`; trailing selects prefill `trailingStatusValue` (stored posture); badge/row tones via `resolve*RequirementListBadgeTone()` on all seven effective tokens          |
| Surfaces      | Labor law, policy acknowledgments, safety training, workplace safety Pattern C lists; regulatory calendar `employee_requirement` rows reuse the same derivation for `effectiveSourceStatusValue`                 |


Related domains use dedicated enums mapped to HRM-CMP-015 display posture where applicable: filings derive `overdue`; work authorization documents derive `missing` / `expired` / `expiring`; work eligibility derives `expired`. Those registers keep domain-specific stored enums and trailing options.

## HRM-CMP-016 As-built

Compliance alerts aggregate derived deadline, renewal, expiry, and overdue-action signals from filings, employee requirements, work eligibility renewals, work authorization renewals, missing work-auth evidence, and open corrective actions into a single read-only register.


| Layer           | Responsibility                                                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`    | `listHrComplianceAlertsWindow` — bounded in-memory merge (cap 1000); `classifyComplianceAlert()` in `hr-compliance-alerts.shared.ts` using `hr-compliance-effective-status.shared.ts` for posture alignment with list surfaces                      |
| Alert kinds     | `deadline`, `renewal`, `expiry`, `overdue_action`                                                                                                                                                                                                   |
| Severities      | `critical`, `attention` — `at_risk` / `expiring` alone surface as attention alerts; expired/overdue/missing work-auth evidence as critical where applicable                                                                                         |
| Sources         | Filings; dated employee requirements; **undated** pending policy acknowledgments and safety training rows (HRM-CMP-014); work eligibility renewals; work authorization renewals and missing documents; open corrective actions with due dates          |
| Governed UI     | Read-only Pattern C surface `hr.workforce.compliance.alerts.list`, search param `complianceAlertsSearch`; serialized `alertKindValue`, `severityValue`, `effectiveSourceStatusValue`, `storedSourceStatusValue`, optional `postureValue`; rendered first on the compliance workbench |
| Materialization | Page load runs after idempotent sync/ensure steps; alerts are derived at read time (not persisted)                                                                                                                                                  |


## HRM-CMP-017 As-built

Compliance exceptions are auto-materialized from detected obligation gaps and remain idempotent via `hr_compliance_exceptions.source_reference_id`.


| Layer         | Responsibility                                                                                                                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`  | `syncHrComplianceExceptions` / `syncHrComplianceExceptionsInTx`; gap classifiers in `hr-compliance-exception-sync.shared.ts`; shared effective-status derivation in `hr-compliance-effective-status.shared.ts` (aligned with HRM-CMP-016 alerts)                             |
| Gap kinds     | `missing`, `expired`, `overdue`, `failed` — **not** `at_risk` / `expiring` alone (those remain alert-only per HRM-CMP-016)                                                                                                                                                    |
| Sources       | Employee requirements (policy acknowledgments, safety training, workplace safety, labor law `overdue` / `non_compliant` / `expired`), filings (`overdue`), work authorization documents (`missing` / `expired` / `rejected`), work eligibility (`expired` / `ineligible`)   |
| Idempotency   | `sourceReferenceId` format `exception:{sourceKind}:{sourceId}:{gapKind}` with org-scoped unique index; open auto exceptions refresh title/severity/employee when posture changes; cleared gaps auto-resolve with `HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE`; recurring gaps reopen auto-resolved rows only (manual resolve/waive are not reopened) |
| Materialization | Page load runs `runHrComplianceSourceSyncSteps` first, then `syncHrComplianceExceptions` via `runHrCompliancePageLoadSync` in `buildHrCompliancePageModel` — exception gap detection reads fresh requirement/filing/eligibility rows |
| Verification    | Unit: `compliance-exception-sync.test.ts`, `compliance-page-model-sync.test.ts`, `compliance-exception-trailing-config.test.ts`; integration (when `DATABASE_URL` set): `hr-compliance-commands.integration.test.ts` — filing overdue auto-resolve/reopen cycle |
| Governed UI   | Pattern C surface `hr.workforce.compliance.exceptions.list` lists open exceptions (`openOnly`); serializes `gapKind` (falls back to `itemType` for manual rows); search matches `gap_kind`; empty copy documents auto-detection plus manual create                             |
| Mutations     | Manual `createHrComplianceExceptionAction` unchanged (no `sourceReferenceId`); corrective action / resolve / waive workflows unchanged                                                                                                                                        |


## HRM-CMP-007 As-built

Mandatory safety training and certification tracking uses `hr_compliance_employee_requirements` joined to active `training` obligations (`requirementKind = training`) and `hr_employees` scope columns.


| Layer         | Responsibility                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`  | `syncHrEmployeeSafetyTrainingRequirements`, `listHrEmployeeSafetyTrainingRequirementsWindow`, `updateHrEmployeeSafetyTrainingRequirementStatus`                                                |
| Applicability | `appliesComplianceObligationToEmployee()` in `hr-compliance-scope.shared.ts`                                                                                                                   |
| Status model  | HRM-CMP-015 enum; `deriveEffectiveSafetyTrainingRequirementStatus()` derives overdue/at_risk from due dates and marks compliant rows **expired** when certification expiry (`dueDate`) is past |
| Governed UI   | Pattern C surface `hr.workforce.compliance.safety-training-requirements.list`, search param `complianceSafetyTrainingSearch`                                                                   |
| Mutations     | `syncHrEmployeeSafetyTrainingRequirementsAction`, `updateHrEmployeeSafetyTrainingRequirementAction` (optional `certificationExpiresAt`) with audit events                                      |


Page load runs idempotent sync; write users can re-run sync manually. Trailing row updates capture certification expiry on the requirement `dueDate` column. Sync updates obligation template due dates only while the row remains `pending`; operator-set certification expiry is preserved after status changes.

## HRM-CMP-004 As-built

Employee work eligibility tracking uses `hr_compliance_work_eligibility` — one row per active employee per organization.


| Layer        | Responsibility                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@afenda/db` | `ensureHrWorkEligibilityTracking`, `listHrWorkEligibilityWindow`, `updateHrWorkEligibilityStatus`                                                                                                                        |
| Status model | Dedicated enum (`not_applicable`, `pending_verification`, `eligible`, `conditional`, `ineligible`, `expired`); `deriveEffectiveWorkEligibilityStatus()` marks eligible/conditional rows expired when `expiresAt` is past |
| Governed UI  | Pattern C surface `hr.workforce.compliance.work-eligibility.list`, search param `complianceWorkEligibilitySearch`                                                                                                        |
| Mutations    | `ensureHrWorkEligibilityTrackingAction`, `updateHrWorkEligibilityAction` with audit events                                                                                                                               |


Page load runs idempotent ensure (creates pending rows for active employees without existing tracking; historical rows for separated staff are retained but excluded from the active-employee list window); write users can re-run ensure manually from the workbench.

## HRM-CMP-005 As-built

Work authorization document tracking uses `hr_compliance_work_authorization_documents` — one row per active employee per document type (`work_permit`, `visa`, `passport`, `right_to_work`).


| Layer        | Responsibility                                                                                                                                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db` | `ensureHrWorkAuthorizationDocuments`, `listHrWorkAuthorizationDocumentsWindow`, `updateHrWorkAuthorizationDocument`                                                                                                                                                     |
| Status model | Dedicated enum (`missing`, `pending_verification`, `verified`, `rejected`, `waived`); `normalizeWorkAuthDocumentStatus()` and `deriveWorkAuthEffectiveStatus()` flag missing when evidence is absent; verified/pending rows past `expiresAt` derive **expired**; rows within 14 days of expiry derive **expiring** (HRM-CMP-012) |
| Governed UI  | Pattern C surface `hr.workforce.compliance.work-auth-documents.list`, search param `complianceWorkAuthDocumentSearch`                                                                                                                                                   |
| Mutations    | `ensureHrWorkAuthorizationDocumentsAction`, `updateHrWorkAuthorizationDocumentAction` with audit events                                                                                                                                                                 |


Page load runs idempotent ensure (insert-only for active employees × four document types; historical rows for separated staff are retained but excluded from the active-employee list window). Write users can re-run ensure manually from the workbench. Document number, issued date, expiry date, and review notes are editable via trailing row actions.

## HRM-CMP-011 As-built

Missing compliance documents are flagged on work authorization document rows (`hr_compliance_work_authorization_documents`).


| Layer        | Responsibility                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db` | `ensureHrWorkAuthorizationDocuments` inserts rows with `status: missing` and reconciles stale pending/verified rows without document numbers; `normalizeWorkAuthDocumentStatus()` coerces the same posture on update; list window sorts flagged rows first via `buildWorkAuthDocumentFlaggedFirstOrderBy` (see HRM-CMP-012) and supports derived search tokens `missing` / `expiring` / `expired` |
| Derivation   | `deriveEffectiveWorkAuthDocumentStatus()` applies normalization at read time; `isWorkAuthDocumentMissing()` exposes the HRM-CMP-011 flag predicate                                                                                                                                                                                                                                                  |
| Governed UI  | Pattern C surface `hr.workforce.compliance.work-auth-documents.list` — missing posture uses attention badge/row tone; serialized `effectiveStatusValue` and `trailingStatusValue` for trailing cells                                                                                                                                                                                                  |
| Search       | `complianceWorkAuthDocumentSearch` matches employee, document number, type, stored status, or derived posture tokens `missing` / `expiring` / `expired`                                                                                                                                                                                                                                             |


New active employees receive four document rows (work permit, visa, passport, right-to-work) with `missing` status until evidence is recorded. Clearing document number on a pending or verified row re-flags the document as missing.

## HRM-CMP-006 As-built

Employee workplace safety compliance tracking uses `hr_compliance_employee_requirements` joined to active `safety` obligations (`requirement_kind = safety`) and `hr_employees` scope columns.


| Layer         | Responsibility                                                                                                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`  | `syncHrEmployeeWorkplaceSafetyRequirements`, `listHrEmployeeWorkplaceSafetyRequirementsWindow`, `updateHrEmployeeWorkplaceSafetyRequirementStatus`                                                                                  |
| Applicability | `appliesComplianceObligationToEmployee()` in `hr-compliance-scope.shared.ts`                                                                                                                                                        |
| Status model  | HRM-CMP-015 enum on requirement rows; `deriveEffectiveWorkplaceSafetyRequirementStatus()` (alias of certification-aware derivation) derives overdue/at_risk/expired from due dates                                                  |
| Governed UI   | Pattern C surface `hr.workforce.compliance.workplace-safety-requirements.list`, search param `complianceWorkplaceSafetySearch`                                                                                                      |
| Mutations     | `syncHrEmployeeWorkplaceSafetyRequirementsAction`, `updateHrEmployeeWorkplaceSafetyRequirementAction` (optional `certificationExpiresAt` on requirement `dueDate`; audit metadata includes expiry when submitted) with audit events |


Page load runs idempotent sync (inserts new rows, removes stale scope mismatches, updates obligation template due dates for pending rows only); write users can also sync manually from the workbench. Operator-set certification expiry on `dueDate` is preserved after status leaves `pending`. Safety obligations configured via the obligation register use `requirementKind: safety` and typically `complianceArea: safety`.

## HRM-CMP-009 As-built

Mandatory filing requirements and filing deadlines use `hr_compliance_filings` — one row per active filing obligation per organization.


| Layer        | Responsibility                                                                                                                                                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db` | `syncHrComplianceFilings`, `listHrComplianceFilingsWindow`, `updateHrComplianceFiling`                                                                                                                                                                                            |
| Status model | Dedicated enum (`pending`, `submitted`, `confirmed`, `waived`); `deriveEffectiveFilingStatus()` marks pending rows **overdue** when `filingDeadline` is past (acceptance criteria 8–9)                                                                                            |
| List window  | `listHrComplianceFilingsWindow` sorts by `filingDeadline` ascending (soonest deadline first), then `updatedAt` descending                                                                                                                                                         |
| Governed UI  | Pattern C surface `hr.workforce.compliance.filings.list`, search param `complianceFilingSearch`; deadline-first columns (`primaryColumnId: filingDeadline`, pinned start); serialized `trailingStatusValue`, `effectiveStatusValue`, and `filingDeadlineInput` for trailing cells |
| Mutations    | `syncHrComplianceFilingsAction`, `updateHrComplianceFilingAction` with audit events                                                                                                                                                                                               |


Page load runs idempotent sync (inserts filing rows for active filing obligations, removes stale rows, updates pending deadlines from obligation templates); write users can re-run sync manually from the workbench. Operator-set filing deadlines are preserved after status leaves `pending`. Filing obligations configured via the obligation register use `requirementKind: filing` and typically `complianceArea: filing`.

## HRM-CMP-010 As-built

The regulatory calendar aggregates org-scoped compliance deadlines from filings, employee requirements, work eligibility renewals, work authorization expiries, and open corrective actions into a single deadline-sorted read window.


| Layer           | Responsibility                                                                                                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/db`    | `listHrComplianceRegulatoryCalendarWindow` — merges bounded sources (cap 1000), sorts by `deadlineAt` ascending; sets `mergeTruncated` when sources exceed cap                                                                                                                                      |
| Entry kinds     | `filing`, `employee_requirement`, `work_eligibility_renewal`, `work_auth_renewal`, `corrective_action`                                                                                                                                                                                              |
| Posture model   | `@afenda/db` `deriveComplianceDeadlinePosture()` → `upcoming`, `due_today`, `overdue` (UTC calendar-day boundaries); feature door `deriveRegulatoryCalendarPosture()` delegates to the same function                                                                                                |
| Source status   | Feature `deriveRegulatoryCalendarEffectiveSourceStatus()` aligns displayed status with sibling list surfaces (filing overdue, requirement at_risk/overdue, eligibility/auth expiry); work authorization renewals pass `documentNumber` for HRM-CMP-011 evidence alignment                                   |
| Governed UI     | Read-only Pattern C surface `hr.workforce.compliance.regulatory-calendar.list`, search param `complianceRegulatoryCalendarSearch`; serialized `postureValue`, `effectiveSourceStatusValue`, and `storedSourceStatusValue`; per-row badge tones on deadline type, posture, and derived source status |
| Materialization | Page load `syncHrComplianceFilings`, employee sync/ensure steps, and `syncHrComplianceExceptions` feed calendar sources                                                                                                                                                                            |


Employee-linked rows link to `/hr/records/[recordId]` via `rowHref` when `employeeId` is present (requirements, eligibility, work authorization, and employee-scoped exceptions). Organization-wide filing rows show an org-wide subject label.

### Governed UI (Pattern C)

List surfaces use `buildGovernedListSurface` with `erp-operational-table` profile and `dataNature: "table"`. Every builder sets `requiresErpPermission: hr.compliance.read`, `surface.rowKey: "id"`, and a governed `columnsId` registry value (enforced by `compliance-list-eui-contract.test.ts`). ERP composition uses `HrComplianceWorkbenchSection` (`components/hr.workforce.compliance-section.component.server.tsx`) — **eleven** embedded `GovernedPatternCListSection` blocks with `layout="embedded"` (alerts and regulatory calendar are read-only — no trailing column). The workbench imports surface keys and UI copy via explicit `.shared` paths — not the surface builder barrel — to keep the RSC bundle lean.


| Surface key                                                  | Section                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| `hr.workforce.compliance.alerts.list`                        | Compliance alerts (HRM-CMP-016)                            |
| `hr.workforce.compliance.obligations.list`                   | Compliance obligations register                            |
| `hr.workforce.compliance.filings.list`                       | Mandatory filing requirements and deadlines (HRM-CMP-009)  |
| `hr.workforce.compliance.regulatory-calendar.list`           | Regulatory calendar (HRM-CMP-010)                          |
| `hr.workforce.compliance.policy-acknowledgements.list`       | Mandatory HR policy acknowledgments (HRM-CMP-008)          |
| `hr.workforce.compliance.labor-law-requirements.list`        | Employee labor law requirements                            |
| `hr.workforce.compliance.safety-training-requirements.list`  | Mandatory safety training and certifications (HRM-CMP-007) |
| `hr.workforce.compliance.workplace-safety-requirements.list` | Employee workplace safety requirements (HRM-CMP-006)       |
| `hr.workforce.compliance.work-eligibility.list`              | Employee work eligibility register                         |
| `hr.workforce.compliance.work-auth-documents.list`           | Work authorization documents                               |
| `hr.workforce.compliance.exceptions.list`                    | Open exceptions                                            |


Trailing row actions use `GovernedTrailingActionSlot` via list-specific trailing cells when `hr.compliance.write` is granted. Per-list query failures surface through `GovernedPatternCListSection` `loadError` (embedded error empty state) without failing the entire workbench; page load runs source sync/ensure via `runHrComplianceSourceSyncSteps` then exception materialization via `runHrCompliancePageLoadSync` (each step uses `Promise.allSettled` so one failure does not block siblings). Trailing selects and datetime fields prefill from serialized row cells (`statusValue`, `trailingStatusValue`, `effectiveStatusValue`, `filingDeadlineInput`, `dueDateInput`, `correctiveActionDueDateInput`, `expiresAtInput`, `reviewNotesValue`, etc.) — never from display-formatted badge text.

Search params: `complianceAlertsSearch`, `complianceObligationSearch`, `complianceFilingSearch`, `complianceRegulatoryCalendarSearch`, `compliancePolicyAcknowledgementSearch`, `complianceLaborLawSearch`, `complianceSafetyTrainingSearch`, `complianceWorkplaceSafetySearch`, `complianceWorkEligibilitySearch`, `complianceWorkAuthDocumentSearch`, `complianceExceptionSearch`. Fallback order per list: list-specific param → legacy `complianceSearch` → shared `search`. `HR_COMPLIANCE_LIST_SURFACE_KEYS` registry order matches workbench section order above. UI copy lives in `surface/hr.workforce.compliance-ui.copy.shared.ts`; surface keys live in each `*.surface.ts` file; governed `columnsId` values live in `surface/hr.workforce.compliance-surface-columns.shared.ts` and are exported from the metadata door.

### Mutations & audit (HRM-CMP-025)

Server Actions call `finalizeComplianceMutation()` — domain `*InTx` command plus `writeExecutionAuditEventInTransaction()` in one `runWithOrganizationContext` transaction. Action failures map through `toComplianceActionFailure()` without leaking internal errors. Audit action strings live in `events/hr.workforce.compliance.event.ts`.

### ERP route wiring


| Layer               | Path                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| App catch-all       | `apps/erp/src/app/(workspace)/[moduleId]/[...section]/page.tsx` (`moduleId=hr`, `section=compliance`)            |
| App adapter         | `apps/erp/src/lib/hr-sections/compliance.server.tsx`                                                             |
| Section registry    | `apps/erp/src/lib/hr-sections/registry.server.ts`                                                                |
| Module nav          | `apps/erp/src/workspace-routes/hr-section-nav.server.tsx`                                                        |
| Route contract      | `contracts/hr.workforce.compliance-route.contract.ts` (`/hr/compliance`)                                         |
| Search param parser | `data/hr.workforce.compliance-search-params.parse.shared.ts` (exported from `@afenda/feature-hr-suite/metadata`) |
| Execution routes    | `hr.compliance.read` / `hr.compliance.write` → `/hr/compliance` in `@afenda/kernel` execution capabilities       |


Next.js 16 runtime: the app adapter is an async Server Component; it resolves `searchParams` (Promise) and `requireHrComplianceRead()` in parallel via `Promise.all`, then calls `parseHrComplianceSearchParams` and passes a serializable page model to `HrComplianceWorkbenchSection` (no client copy of list rows). Client trailing/forms use `useActionState` against feature `"use server"` actions; mutations revalidate `/hr/compliance` via `revalidatePath` in `finalizeComplianceMutation`. The catch-all route streams section content through nested `Suspense` boundaries with `HrCompliancePageSkeleton` as the HR fallback; `searchParams` opts the page into request-time dynamic rendering under Cache Components.

Access guards use `@afenda/kernel/execution` (`requireExecutionPermission`); denied reads render `HrComplianceAccessDeniedPanel` in the app adapter. The app adapter resolves auth once and passes `canWrite` into `buildHrCompliancePageModel`; page-model loaders do not re-fetch execution context.

### Not yet shipped (enterprise backlog)

| Code | Requirement | Current posture |
| ---- | ----------- | --------------- |
| **HRM-CMP-021** | Compliance review and approval workflow | Trailing status updates + audit events only; no dedicated review/approval queue |
| **HRM-CMP-022** | Compliance overview by legal entity, department, location, category, risk | Workbench is flat Pattern C registers; no cross-dimension overview dashboard |
| **HRM-CMP-023** | Exportable compliance reports | No report/export surfaces; lists are read-only windows with search only |

### Naming & layout (system-admin mirror)

Shipped implementation files use the prefix `hr.workforce.compliance.`* and standard buckets (`actions/`, `data/`, `events/`, `policies/`, `schemas/`, `surface/`, `components/`). List surfaces and UI copy live under `surface/`; audit strings live in `events/hr.workforce.compliance.event.ts`. Slice doors: `server.ts` (I/O), `client.ts` (components), `metadata.ts` (surfaces only). Enforced by `pnpm exec tsx packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts` and rule `afenda-hr-feature-vertical`.