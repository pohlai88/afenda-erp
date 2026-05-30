# Employee Records Management

## Definition

**Employee Records Management is the HRM function that maintains the official employee master profile, including employee identity, personal details, contact information, employment information, job assignment, organization assignment reference, employment history, document references, profile completeness status, and audit trail.**

---

# Employee Records Management Includes

| Area                       | What It Covers                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Employee Identity**      | Employee ID, legal name, preferred name, profile photo, identity type, identity number, nationality                          |
| **Personal Information**   | Date of birth, gender, marital status, language preference                                                                   |
| **Contact Information**    | Personal email, company email, phone number, residential address, mailing address                                            |
| **Emergency Contact**      | Emergency contact name, relationship, phone number, priority contact                                                         |
| **Employment Information** | Employment type, employment status, hire date, confirmation date, probation end date, contract start date, contract end date |
| **Organization Reference** | Legal entity, business unit, department, team, branch, work location, cost center                                            |
| **Manager Reference**      | Reporting manager, matrix manager, HR owner                                                                                  |
| **Job Assignment**         | Job title, job code, position ID, grade, level, worker category                                                              |
| **Employment History**     | Hire, rehire, confirmation, transfer, promotion, demotion, manager change, location change, employment type change           |
| **Document References**    | Identity document reference, contract reference, appointment letter reference, certificate reference, work permit reference  |
| **Profile Readiness**      | Missing mandatory data, incomplete profile status, payroll readiness reference, compliance readiness reference               |
| **Audit Trail**            | Created by, updated by, previous value, new value, effective date, reason, timestamp, approval reference                     |

---

# Employee Records Management Does Not Include

| Excluded Area                    | Owned By                         |
| -------------------------------- | -------------------------------- |
| Organization hierarchy design    | Organizational Chart & Hierarchy |
| Employee self-service portal     | Employee Self-Service            |
| Document upload/version workflow | Document Management              |
| Lifecycle workflow automation    | Employee Lifecycle Management    |
| Compliance case tracking         | Compliance & Regulatory Tracking |
| Offboarding workflow             | Offboarding & Exit Management    |
| Payroll calculation              | Payroll                          |
| Leave application                | Leave Management                 |
| Attendance logs                  | Time & Attendance                |
| Performance review               | Performance Management           |
| Training records                 | Learning / Training Management   |
| Asset recovery                   | Asset Management / Offboarding   |

---

# Employee Records Management Requirement Statement

| Requirement                     | Description                                                                                                                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Employee Records Management** | Maintains the official employee master profile, including personal data, employment data, job and organization assignment references, employment history, linked document references, data completeness status, and auditable change history. |

---

# Enterprise Functional Requirements

| Code                | Requirement                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| **HRM-EMP-REC-001** | System shall create and maintain a unique employee master record.                 |
| **HRM-EMP-REC-002** | System shall assign or validate a unique employee ID.                             |
| **HRM-EMP-REC-003** | System shall store employee identity information.                                 |
| **HRM-EMP-REC-004** | System shall store employee personal information.                                 |
| **HRM-EMP-REC-005** | System shall store employee contact information.                                  |
| **HRM-EMP-REC-006** | System shall store employee emergency contact information.                        |
| **HRM-EMP-REC-007** | System shall store employee employment information.                               |
| **HRM-EMP-REC-008** | System shall store employee job assignment information.                           |
| **HRM-EMP-REC-009** | System shall store employee organization assignment references.                   |
| **HRM-EMP-REC-010** | System shall store employee manager reference.                                    |
| **HRM-EMP-REC-011** | System shall maintain employee employment history.                                |
| **HRM-EMP-REC-012** | System shall maintain employee status history.                                    |
| **HRM-EMP-REC-013** | System shall link employee records to related HR documents.                       |
| **HRM-EMP-REC-014** | System shall track employee profile completeness.                                 |
| **HRM-EMP-REC-015** | System shall prevent duplicate employee records.                                  |
| **HRM-EMP-REC-016** | System shall support rehire without overwriting previous employment history.      |
| **HRM-EMP-REC-017** | System shall support effective-dated employee assignment changes.                 |
| **HRM-EMP-REC-018** | System shall restrict access to sensitive employee fields.                        |
| **HRM-EMP-REC-019** | System shall maintain audit trail for all employee record changes.                |
| **HRM-EMP-REC-020** | System shall archive separated employee records while preserving historical data. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                              |
| --: | ------------------------------------------------------------------------------------------------ |
|   1 | Employee record can be created with mandatory identity and employment data.                      |
|   2 | Employee ID is unique.                                                                           |
|   3 | Duplicate employees are detected using identity number, passport number, email, or phone number. |
|   4 | Employee personal information can be viewed and edited only by authorized users.                 |
|   5 | Employee employment status is recorded and historically traceable.                               |
|   6 | Employee department, job, grade, manager, and location references are recorded.                  |
|   7 | Employee assignment changes support effective dates.                                             |
|   8 | Employee history preserves previous values and new values.                                       |
|   9 | Employee documents are linked as references.                                                     |
|  10 | Missing mandatory employee data is clearly flagged.                                              |
|  11 | Sensitive fields are masked or hidden based on role.                                             |
|  12 | Every employee record change creates an audit event.                                             |
|  13 | Rehired employees retain previous employment history.                                            |
|  14 | Separated employees remain available as read-only historical records.                            |

---

## As-built summary (code-verified)

Parent doctrine: [ARCH-010](../../../../docs/architecture/010-hr-feature-package-architecture.md) · Golden path: `compliance-regulatory-tracking`.

| Layer | Path | Status |
| ----- | ---- | ------ |
| Schema & queries | `packages/db/src/schema/hr.ts` (`hr_employee_profiles`, `hr_employee_emergency_contacts`, `hr_employee_record_events`), `hr-employee-records.ts`, `hr-employee-records-commands.ts`, `hr-commands.ts` | Shipped |
| Access policy | `policies/hr.workforce.records-access.policy.server.ts` | Shipped |
| Surface registry | `surface/hr.workforce.records-surface-metadata.shared.ts` | Shipped (7 Pattern C lists) |
| Search params | `data/hr.workforce.records-search-params.parse.shared.ts` | Shipped |
| Page models | `data/hr.workforce.records.page-model.server.ts`, `data/hr.workforce.records.detail.page-model.server.ts` | Shipped |
| Workbench UI | `components/hr.workforce.records-section.component.server.tsx` | Shipped |
| Detail UI | `components/hr.workforce.records-detail-section.component.server.tsx` | Shipped |
| App adapters | `records.server.tsx` (`/hr/records`), `records-detail.server.tsx` (`/hr/records/[id]`), `employees.server.tsx` (alias) | Shipped |

### HRM shipment matrix (HRM-EMP-REC-001 – 020)

| Code | Status | Implementation |
| ---- | ------ | -------------- |
| HRM-EMP-REC-001 | Shipped | `createHrEmployeeRecord` + workbench create form; detail page model |
| HRM-EMP-REC-002 | Shipped | Unique `employee_number` per org (`hr_employees_org_number_uidx`) |
| HRM-EMP-REC-003 | Shipped | Profile table: identity type/number, nationality; directory + detail |
| HRM-EMP-REC-004 | Shipped | Profile: DOB, gender, marital status, language preference |
| HRM-EMP-REC-005 | Shipped | Profile: personal email, phone, addresses; company email on `hr_employees` |
| HRM-EMP-REC-006 | Shipped | `hr_employee_emergency_contacts` + detail/update actions |
| HRM-EMP-REC-007 | Shipped | Employment status, dates, type, worker category on `hr_employees` |
| HRM-EMP-REC-008 | Shipped | Grade, level, position assignment on employee + assignments |
| HRM-EMP-REC-009 | Shipped | Legal entity, location, department refs on employee + assignments |
| HRM-EMP-REC-010 | Shipped | Manager, matrix manager, HR owner refs |
| HRM-EMP-REC-011 | Shipped | Assignment history list + effective-dated `hr_employee_assignments` |
| HRM-EMP-REC-012 | Shipped | Status history list (lifecycle events ∪ record status events) |
| HRM-EMP-REC-013 | Shipped | Document references list (read `hr_employee_documents` — vault owned by Documents) |
| HRM-EMP-REC-014 | Shipped | Incomplete profiles register with expanded mandatory field checks |
| HRM-EMP-REC-015 | Shipped | Duplicate detection: employee number, email, identity number, phone |
| HRM-EMP-REC-016 | Shipped | `rehireHrEmployee` preserves prior record; links via `rehired_from_employee_id` |
| HRM-EMP-REC-017 | Shipped | Assignment mutation with `assignmentEffectiveFrom` |
| HRM-EMP-REC-018 | Shipped | Sensitive masking (email, identity, phone, address, DOB) without `hr.employees.sensitive.read` |
| HRM-EMP-REC-019 | Shipped | `hr_employee_record_events` + IAM audit via `finalizeRecordsMutation` |
| HRM-EMP-REC-020 | Shipped | Separated roster (read-only) + `archiveHrEmployeeRecord` |

### Enterprise acceptance criteria

| No. | Status | Evidence |
| --: | ------ | -------- |
| 1 | Met | Create with identity + employment start date defaults |
| 2 | Met | Org-scoped unique employee number |
| 3 | Met | `findHrEmployeeDuplicateCandidates` + command guards |
| 4 | Met | Detail/update gated by `hr.employees.write`; read by `hr.employees.read` |
| 5 | Met | Status history register |
| 6 | Met | Directory + detail show dept, job, grade, manager, location |
| 7 | Met | Assignment action accepts effective date |
| 8 | Met | Assignment rows preserve superseded placements; record events store prev/new |
| 9 | Met | Document references list (FK read to document vault) |
| 10 | Met | Incomplete profiles list with missing field labels |
| 11 | Met | Sensitive field masking in list + detail page models |
| 12 | Met | Record events + IAM audit on every mutation |
| 13 | Met | Rehire creates new employee row; prior history retained |
| 14 | Met | Separated list + archived employees remain queryable |

### Governed surface keys

- `hr.workforce.records.overview.stats` (Pattern B)
- `hr.workforce.records.incomplete.list`
- `hr.workforce.records.directory.list`
- `hr.workforce.records.assignments.list`
- `hr.workforce.records.audit-trail.list`
- `hr.workforce.records.status-history.list`
- `hr.workforce.records.document-references.list`
- `hr.workforce.records.separated.list`

Read-only workbench lists: assignments, audit trail, status history, document references.

### Capabilities

- `hr.employees.read` — workbench + detail read
- `hr.employees.write` — create, update, assignment, rehire, archive
- `hr.employees.sensitive.read` — unmasked PII in directory and detail
