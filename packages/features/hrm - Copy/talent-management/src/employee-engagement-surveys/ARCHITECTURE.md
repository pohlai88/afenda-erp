# Employee Engagement Surveys

## Definition

**Employee Engagement Surveys is the HRM function that collects, measures, analyzes, and tracks employee feedback on engagement, satisfaction, workplace experience, leadership, culture, communication, wellbeing, retention risk, and improvement actions.**

---

## Implementation notes

- **Route:** `/{locale}/o/{orgSlug}/apps/hrm/employee-engagement` — registry segment `employee-engagement`, capability id `employeeEngagement`, audit prefix `erp.hrm.employee_engagement`, ERP object `employee_engagement`.
- **Sub-routes:** `…/employee-engagement/[surveyId]` (config vs distribution router by survey state), `…/employee-engagement/respond/[invitationId]` (employee submit/draft).
- **Slices shipped (branch):** Foundation (contracts, schema, registry, routes) · design (HRM-ENG-001–005) · audience/schedule (006–011, 031–032) · distribution/response (012–017) · analytics/reporting (018–024, 029–033) · improvement actions (025–028). Delivery ledger: `employee-engagement-spec-status.shared.ts` (**30 complete**, **4 partial** — see [Delivery status](#delivery-status)).
- **Three-layer contract (ADR-0035):** Layer 1 thin `app/(main)/[locale]/o/[orgSlug]/apps/hrm/employee-engagement/**` · Layer 2 `lib/features/hrm/talent-management/employee-engagement-surveys/**` · no `components2/employee-engagement/`.
- **Public doors:** `@afenda/feature-hrm-talent-management` (RSC pages, `resolveEmployeeEngagementSurfaceAccess`, spec map/status exports) · `@afenda/feature-hrm-talent-management/client` (design/config/distribution/response/improvement/analytics forms and actions) · `@afenda/feature-hrm-talent-management/server` (cron ticks: `runEngagementSurveyReminderTick`, `runEngagementImprovementOverdueTick`).
- **Route loading:** `app/.../employee-engagement/loading.tsx` re-exports generic `nexus-route-loading` — not engagement-shaped skeletons (see [Future hardening](#future-hardening-vs-time-clock-integration)).
- **Page wiring:** Index and sub-routes call `getOrgTenantContext()` + `resolveEmployeeEngagementSurfaceAccess()` in `page.tsx`, then pass `access` into feature RSC pages (no dedicated `*PageGate` yet).
- **UI patterns (ADR-0026):** Pattern A/B on index (`EmployeeEngagementSurveysPage`) and survey config; Pattern C on completion tracking and improvement actions; Pattern B stat cards and segmented lists on distribution analytics. Central builders: `data/engagement-surface-builders.server.ts`.
- **Survey detail router:** `EmployeeEngagementSurveyDetailRouterPage` — `draft` / `scheduled` → config page; `published` / `closed` → distribution + analytics + improvement page.
- **Persistence:** `hrm_engagement_survey_template`, `hrm_engagement_survey`, `hrm_engagement_survey_question`, `hrm_engagement_survey_invitation`, `hrm_engagement_survey_response`, `hrm_engagement_response_answer`, `hrm_engagement_survey_cycle`, `hrm_engagement_improvement_action`. Frozen aggregates: `hrm_engagement_survey.analytics_snapshot` (JSON) + `analytics_generated_at`.
- **Cron:** `app/api/cron/hrm-engagement-reminder-watch` → `runEngagementSurveyReminderTick` · `app/api/cron/hrm-engagement-improvement-overdue-watch` → `runEngagementImprovementOverdueTick`.
- **Notifications (v1):** In-app notices via `data/engagement-notification.server.ts` and invitation publish/resend helpers — **not** transactional email (product “email invitation” deferred; deep links target org ERP apps).
- **Employee response (v1):** `respond/[invitationId]` under org apps — not portal `/p`. Duplicate guard: unique `(surveyId, employeeId)` on invitations; one submitted response per invitation.
- **Spec map:** `employee-engagement-spec-map.shared.ts` (`HRM-ENG-001` … `034` area keys). **Audit contract:** `employee-engagement.contract.ts` · **Emitted audits:** `employee-engagement-audit-emitted.shared.ts` (18 runtime emitters; see HRM-ENG-034).
- **Tests:** `tests/unit/hrm-employee-engagement-contract.test.ts`, `hrm-employee-engagement-slice{1,2,3,4,5}.test.ts`, `hrm-employee-engagement-notifications-export.test.ts`.

### Stable governed surfaceKeys

| surfaceKey | Pattern | Primary section |
| --- | --- | --- |
| `hrm:employee-engagement:templates` | B | `EngagementTemplatesSection` |
| `hrm:employee-engagement:template-questions` | B | `EngagementTemplateQuestionsSection` |
| `hrm:employee-engagement:surveys-draft` | B | `EngagementDraftSurveysSection` |
| `hrm:employee-engagement:surveys-configurable` | B | `EngagementConfigurableSurveysSection` |
| `hrm:employee-engagement:audience-segments` | B | `EngagementAudienceSegmentsSection` |
| `hrm:employee-engagement:completion-tracking` | C | `EngagementCompletionTrackingSection` |
| `hrm:employee-engagement:overview` | B (stat-card) | `EngagementAnalyticsOverviewSection` |
| `hrm:employee-engagement:segment-scores` | B | `EngagementSegmentScoresSection` |
| `hrm:employee-engagement:category-scores` | B | `EngagementCategoryScoresSection` |
| `hrm:employee-engagement:cycle-history` | B | `EngagementCycleHistorySection` |
| `hrm:employee-engagement:improvement-actions` | C | `EngagementImprovementActionsSection` |

### ERP permissions (HRM-ENG-031)

Resolved in `data/engagement-access.server.ts` via `canUseErpPermission({ module: "hrm", object: "employee_engagement", function })`:

| Function | Typical use |
| --- | --- |
| `search` | Enter workbench / nav |
| `read` | Read-only org surfaces |
| `create` | Templates, draft surveys, improvement actions |
| `update` | Schedule, publish, config, analytics generate, improvement status |
| `audit` | CSV export, invitation remind (cron), overdue notify |

---

## Delivery status

Authoritative ledger: `employee-engagement-spec-status.shared.ts` (kept in sync with unit tests).

| Slice | Codes | Status |
| --- | --- | --- |
| 0 — Foundation | Setup for 001–034 | **Shipped** (schema, registry, routes, contracts) |
| 1 — Design | 001–005 | **Complete** |
| 2 — Audience | 006–011, 031, 032 | **Complete** |
| 3 — Response | 012–017 | **Complete** |
| 4 — Analytics | 018–020, 022–023, 029–030, 032 + **021, 024, 033 partial** | **Mostly complete** |
| 5 — Actions | 025–028 + **034 partial** | **Mostly complete** |

**Summary:** 30 requirements **complete**, 4 **partial** (documented v1 boundaries below).

| Code | Status | Shipped behavior | v1 boundary / gap |
| --- | --- | --- | --- |
| **HRM-ENG-021** | partial | Prior-cycle deltas in analytics snapshot; overview stat cards show engagement/eNPS/response-rate deltas vs one prior closed survey (`findPriorEngagementSnapshotSummary`) | No multi-cycle trend **chart** across full history — single prior comparison only |
| **HRM-ENG-024** | partial | Internal benchmark: prior survey engagement index / eNPS in `snapshot.benchmark`; optional `externalReference` on generate analytics | No external benchmark API or feed — reference field + prior-cycle compare only |
| **HRM-ENG-033** | partial | `listEngagementCycleHistoryForOrganization` + Pattern B `hrm:employee-engagement:cycle-history` on distribution page | History = org survey rows + frozen snapshots per close/generate — not a separate analytics warehouse |
| **HRM-ENG-034** | partial | 18 audit actions emitted after successful commits/crons (`HRM_EMPLOYEE_ENGAGEMENT_EMITTED_AUDIT_ACTIONS`) | Contract also defines `invitation.create`; publish emits `survey.publish` with `invitationBatch` metadata instead of per-row `invitation.create` |

All other codes (001–020, 022–023, 025–032) are **complete** per ledger and slice unit tests.

---

## Integration map

| ARCHITECTURE **Includes** | **Does Not Include** (owner) | Integration door |
| --- | --- | --- |
| Survey CRUD, templates, responses | Employee master profile | `#features/hrm` employee/org queries (`engagement-audience.server.ts`) |
| Audience by dept/location/manager | Org hierarchy ownership | Read org structure via existing HRM queries — no new hierarchy engine |
| Distribution / reminders | Payroll, leave, performance scoring | None — reference only in UI copy |
| Analytics / NPS / trends | Training course surveys | `training` module owns `HRM-TRN-*` |
| Action plans | Grievance / medical records | ER/compliance — link by id only if needed later |
| In-app invitations + ERP respond path | Portal `/p` employee apps (v1) | `respond/[invitationId]` under org apps |
| In-app + cron reminders | Transactional email provider (v1) | `engagement-notification.server.ts`, cron watches |

**Cache / revalidation:** `data/engagement-revalidate.server.ts` — `toLocaleOrgAppsRevalidatePattern("/hrm/employee-engagement")` and survey-scoped patterns.

---

# Employee Engagement Surveys Includes

| Area                                  | What It Covers                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Survey Management**                 | Engagement survey, pulse survey, satisfaction survey, wellbeing survey, culture survey          |
| **Survey Templates**                  | Standard question bank, custom questions, rating scale, open-text questions                     |
| **Survey Audience**                   | All employees, department group, location group, role group, manager group, employment category |
| **Anonymous Feedback**                | Anonymous response collection, privacy threshold, confidentiality control                       |
| **Employee Satisfaction Measurement** | Job satisfaction, manager satisfaction, workload satisfaction, workplace satisfaction           |
| **Engagement Measurement**            | Motivation, commitment, belonging, recognition, purpose, advocacy                               |
| **Leadership Feedback**               | Manager effectiveness, communication quality, trust, support, clarity                           |
| **Culture Feedback**                  | Inclusion, collaboration, psychological safety, company values, work environment                |
| **Wellbeing Feedback**                | Workload, stress, burnout risk, work-life balance, support needs                                |
| **Retention Risk Signal**             | Intent to stay, likelihood to recommend, dissatisfaction indicator, flight-risk reference       |
| **Survey Distribution**               | Email invitation, portal notification, reminder, survey link                                    |
| **Response Tracking**                 | Response rate, completion status, pending response, submitted response                          |
| **Survey Analytics**                  | Average score, question score, category score, trend score, participation rate                  |
| **Segmentation Analysis**             | Results by department, location, manager, grade, tenure, employee category                      |
| **Benchmark Comparison**              | Previous survey comparison, internal benchmark, external benchmark reference                    |
| **Action Planning**                   | Improvement action, action owner, due date, progress status, follow-up survey                   |
| **Reporting**                         | Engagement report, satisfaction report, participation report, trend report                      |
| **Audit Trail**                       | Created by, published by, submitted by, analyzed by, reviewed by, timestamp                     |

---

# Employee Engagement Surveys Does Not Include

| Excluded Area                       | Owned By                                          |
| ----------------------------------- | ------------------------------------------------- |
| Employee master profile             | Employee Records Management                       |
| Performance appraisal scoring       | Performance Appraisals                            |
| Disciplinary case management        | Employee Relations / Compliance                   |
| Training course management          | Training & Development                            |
| Compensation planning               | Compensation Planning & Modeling                  |
| Payroll calculation                 | Payroll Processing                                |
| Leave and attendance records        | Leave & Attendance Management                     |
| Absence analytics ownership         | Absence Analytics & Trends                        |
| Organization hierarchy ownership    | Organizational Chart & Hierarchy                  |
| Formal grievance investigation      | Employee Relations / Compliance                   |
| Health diagnosis or medical records   | Occupational Health / Compliance                  |
| Legal compliance case handling      | Compliance & Regulatory Tracking                  |
| Workforce hiring plan               | Workforce Planning                                |
| Anonymous identity disclosure       | Not allowed unless policy/legal exception applies |

---

# Employee Engagement Surveys Requirement Statement

| Requirement                     | Description                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Employee Engagement Surveys** | Collects and analyzes employee feedback through engagement, satisfaction, pulse, wellbeing, and culture surveys, with anonymous response controls, survey distribution, response tracking, score analytics, segmentation, trend comparison, improvement action planning, reporting, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-ENG-001** | System shall create and manage employee engagement surveys.                                                                                                        |
| **HRM-ENG-002** | System shall support survey types including engagement survey, pulse survey, satisfaction survey, wellbeing survey, culture survey, and exit feedback survey.      |
| **HRM-ENG-003** | System shall support reusable survey templates and question banks.                                                                                                 |
| **HRM-ENG-004** | System shall support question types including rating scale, multiple choice, single choice, open text, yes/no, and comment fields.                                 |
| **HRM-ENG-005** | System shall support survey categories such as leadership, culture, wellbeing, workload, recognition, communication, inclusion, and retention.                     |
| **HRM-ENG-006** | System shall define survey audience by legal entity, department, location, manager, grade, tenure, employment type, and employee category.                         |
| **HRM-ENG-007** | System shall support anonymous survey mode.                                                                                                                        |
| **HRM-ENG-008** | System shall enforce minimum response threshold before showing segmented anonymous results.                                                                        |
| **HRM-ENG-009** | System shall prevent unauthorized users from identifying anonymous respondents.                                                                                    |
| **HRM-ENG-010** | System shall support named survey mode where anonymity is not required.                                                                                            |
| **HRM-ENG-011** | System shall configure survey open date, close date, reminder schedule, and response deadline.                                                                     |
| **HRM-ENG-012** | System shall publish survey invitations to selected employees.                                                                                                     |
| **HRM-ENG-013** | System shall allow employees to submit survey responses.                                                                                                           |
| **HRM-ENG-014** | System shall prevent duplicate survey submissions by the same employee.                                                                                            |
| **HRM-ENG-015** | System shall allow employees to save draft responses where enabled.                                                                                                |
| **HRM-ENG-016** | System shall track survey response rate.                                                                                                                           |
| **HRM-ENG-017** | System shall track completion status by audience without exposing anonymous response details.                                                                      |
| **HRM-ENG-018** | System shall calculate average score by question, category, department, location, manager, and survey period.                                                      |
| **HRM-ENG-019** | System shall calculate engagement index or satisfaction score where configured.                                                                                    |
| **HRM-ENG-020** | System shall calculate employee net promoter score where configured.                                                                                               |
| **HRM-ENG-021** | System shall analyze trend movement against previous survey cycles.                                                                                                |
| **HRM-ENG-022** | System shall identify low-scoring categories and high-risk segments.                                                                                               |
| **HRM-ENG-023** | System shall support open-text comment analysis and tagging where enabled.                                                                                         |
| **HRM-ENG-024** | System shall support benchmark comparison against internal or external benchmarks where available.                                                                 |
| **HRM-ENG-025** | System shall create improvement action plans from survey findings.                                                                                                 |
| **HRM-ENG-026** | System shall assign action owners, due dates, priorities, and status for improvement actions.                                                                      |
| **HRM-ENG-027** | System shall track improvement action progress.                                                                                                                    |
| **HRM-ENG-028** | System shall notify action owners of overdue improvement actions.                                                                                                  |
| **HRM-ENG-029** | System shall provide engagement analytics views by survey, category, department, location, manager, and period.                                                         |
| **HRM-ENG-030** | System shall provide survey reports including response rate, score summary, trend comparison, segment analysis, comments, and action progress.                     |
| **HRM-ENG-031** | System shall restrict survey creation, publishing, analytics, export, and comment visibility based on role and permission.                                         |
| **HRM-ENG-032** | System shall mask or suppress segmented results when response count is below anonymity threshold.                                                                  |
| **HRM-ENG-033** | System shall preserve survey history and trend data by survey cycle.                                                                                               |
| **HRM-ENG-034** | System shall maintain audit trail for survey creation, publishing, response submission, analytics generation, export, action plan creation, and action completion. |

---

# Implementation anchors (disk truth)

Selective mapping for non-obvious behavior. Status values mirror `HRM_ENGAGEMENT_SPEC_DELIVERY_STATUS`.

### HRM-ENG-001–005 — Survey design and templates (complete)

| Concern | Implementation |
| --- | --- |
| **Templates / question bank** | `data/engagement-template.queries.server.ts`, `data/engagement.mutations.server.ts`, `actions/engagement-design.actions.ts` |
| **Draft surveys** | `actions/engagement-design.actions.ts` — create/update/delete draft |
| **Enums** | `schemas/engagement-workflow.shared.ts` — survey types, question types, categories, template/survey states |
| **UI** | `components/engagement-design-sections.tsx`, `engagement-design-forms.client.tsx` — Pattern A forms + Pattern B lists |
| **Audits** | `template.create` · `template.update` · `template.deprecate` · `survey.create` · `survey.update` |

### HRM-ENG-006–011, 031–032 — Audience, anonymity, schedule (complete)

| Concern | Implementation |
| --- | --- |
| **Audience resolution** | `data/engagement-audience.server.ts` — employee ids from HRM employee queries (no PII in audit metadata) |
| **Anonymity** | `schemas/engagement-anonymity.shared.ts` — `applyAnonymousSegmentSuppression`, `resolveEffectiveMinSegmentResponses` |
| **Config / schedule** | `data/engagement-survey-config.queries.server.ts`, `engagement-survey-config.mutations.server.ts`, `actions/engagement-survey-config.actions.ts` |
| **Reminder schedule** | `schemas/engagement-reminder.shared.ts` — parsed on config save; enforced by `engagement-reminder-watch.server.ts` |
| **Permissions** | `data/engagement-access.server.ts` — `canCreate`, `canSchedule`, `canManage`, `canExportAnalytics` |
| **UI** | `components/engagement-config-sections.tsx`, `engagement-config-forms.client.tsx` — audience builder, anonymity panel, schedule |
| **Segment suppression (032)** | Applied in analytics engine + segment list builder; enforced before UI exposes segment rows |

Publish-time audience snapshot: `publishEngagementSurveyMutation` in `engagement-distribution.mutations.server.ts` materializes invitation rows.

### HRM-ENG-012–017 — Distribution and employee response (complete)

| Concern | Implementation |
| --- | --- |
| **Publish** | `publishEngagementSurveyMutation` + `publishEngagementSurveyAction` — invitations + `survey.publish` audit (`invitationBatch: true`) |
| **Close** | `closeEngagementSurveyMutation` + `survey.close` audit |
| **Respond** | `EmployeeEngagementRespondPage`, `engagement-response-form.client.tsx`, `actions/engagement-response.actions.ts` |
| **Draft / submit** | `engagement-response.mutations.server.ts` — `response.draft` · `response.submit` audits |
| **Duplicate prevention (014)** | Unique index `hrm_engagement_survey_invitation_survey_emp_uidx`; response unique per invitation |
| **Completion (017)** | Pattern C `hrm:employee-engagement:completion-tracking` — admin sees status/rate, not anonymous answer bodies |
| **Remind** | `resendEngagementInvitationMutation`, cron `runEngagementSurveyReminderTick` — `invitation.remind` audit |

### HRM-ENG-018–032, 029–030 — Analytics and reporting (021, 024, 033 partial)

| Concern | Implementation |
| --- | --- |
| **Engine** | `data/engagement-analytics-engine.shared.ts` — `buildEngagementAnalyticsSnapshot` (indexes, eNPS, segments, risk, trend, benchmark) |
| **Persist** | `data/engagement-analytics.server.ts` — `computeAndPersistEngagementAnalytics`; snapshot on `hrm_engagement_survey` |
| **Prior cycle (021)** | `findPriorEngagementSnapshotSummary` — latest closed survey same cycle or same type |
| **Suppression (032)** | `applyAnonymousSegmentSuppression` in `engagement-anonymity.shared.ts` |
| **Open text (023)** | Named reviews in snapshot; `actions/engagement-analytics.actions.ts` — `openText.tag` (manual tags, no NLP) |
| **Overview (029)** | `EngagementAnalyticsOverviewSection` — Pattern B stat-card `hrm:employee-engagement:overview` |
| **Export (030)** | `engagement-analytics-report-export.shared.ts` + `exportEngagementAnalyticsReportAction` — `analytics.export` audit |
| **Cycle history (033)** | `listEngagementCycleHistoryForOrganization` + `EngagementCycleHistorySection` |
| **Actions** | `actions/engagement-analytics.actions.ts` — generate, export, tag |

### HRM-ENG-025–028 — Improvement actions (complete)

| Concern | Implementation |
| --- | --- |
| **CRUD** | `data/engagement-improvement.mutations.server.ts`, `actions/engagement-improvement.actions.ts` |
| **Transitions** | `schemas/engagement-improvement.shared.ts` — `canTransitionEngagementImprovementStatus`, `isEngagementImprovementActionOverdue` |
| **UI** | `components/engagement-improvement-section.tsx` (Pattern C), `engagement-improvement-forms.client.tsx` |
| **Overdue (028)** | `engagement-improvement-overdue-watch.server.ts` + cron — in-app notify, `improvementAction.overdueNotify` audit |
| **Audits** | `improvementAction.create` · `update` · `complete` |

### HRM-ENG-034 — Audit trail (partial)

| Concern | Implementation |
| --- | --- |
| **Contract catalog** | `employee-engagement.contract.ts` — `HRM_EMPLOYEE_ENGAGEMENT_AUDIT_ACTIONS` (19 strings including `invitation.create`) |
| **Runtime emitters** | `employee-engagement-audit-emitted.shared.ts` — 18 actions; `writeEngagementIamAuditAfterCommit` in `data/engagement-audit.server.ts` |
| **Gap** | `invitation.create` defined but not emitted — batch publish uses `survey.publish` with metadata instead |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                    |
| --: | -------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Engagement survey can be created with title, type, audience, open date, close date, and survey questions.                              |
|   2 | Survey can use reusable templates and question banks.                                                                                  |
|   3 | Survey supports rating, multiple choice, single choice, open text, yes/no, and comment questions.                                      |
|   4 | Survey audience can be selected by department, location, manager, legal entity, grade, tenure, employment type, and employee category. |
|   5 | Anonymous survey mode can be enabled.                                                                                                  |
|   6 | Anonymous survey results are only shown when minimum response threshold is met.                                                        |
|   7 | Unauthorized users cannot identify anonymous respondents.                                                                              |
|   8 | Survey invitations can be sent to selected employees.                                                                                  |
|   9 | Employees can submit survey responses online.                                                                                          |
|  10 | Duplicate responses from the same employee are prevented.                                                                              |
|  11 | Response rate is calculated.                                                                                                           |
|  12 | Completion status can be tracked without exposing anonymous response details.                                                          |
|  13 | Average scores are calculated by question and category.                                                                                |
|  14 | Engagement index or satisfaction score can be calculated where configured.                                                             |
|  15 | Employee net promoter score can be calculated where configured.                                                                        |
|  16 | Survey results can be segmented by department, location, manager, grade, tenure, and employee category.                                |
|  17 | Segmented anonymous results are suppressed when response count is below threshold.                                                     |
|  18 | Low-scoring categories and high-risk segments are flagged.                                                                             |
|  19 | Trend comparison against previous survey cycles is available.                                                                          |
|  20 | Open-text comments can be reviewed and tagged where enabled.                                                                           |
|  21 | Improvement action plans can be created from survey findings.                                                                          |
|  22 | Action owner, due date, priority, and status can be assigned.                                                                          |
|  23 | Overdue improvement actions generate notifications.                                                                                    |
|  24 | Engagement survey reports can be generated by survey, category, department, location, manager, and period.                             |
|  25 | Unauthorized users cannot view restricted survey analytics or comments.                                                                |
|  26 | Survey history and trend data remain available by survey cycle.                                                                        |
|  27 | Every survey creation, publishing, response submission, analytics, export, action plan, and action completion creates an audit event.  |

**AC mapping note:** AC 19 (trend) and AC 26 (cycle history) align with **partial** HRM-ENG-021 and HRM-ENG-033 — single prior-cycle compare and survey-row history are shipped; full multi-cycle analytics warehouse is not. AC 27 aligns with **partial** HRM-ENG-034 — see invitation batch audit note above.

---

## Future hardening (vs Time Clock Integration)

Not required for v1 functional completeness; documented to align with [time-clock-integration/ARCHITECTURE.md](../time-attendance/time-clock-integration/ARCHITECTURE.md) quality bar:

- **`EmployeeEngagementPageGate`** + **`EmployeeEngagementPageLoading`** — move Tier A session/access out of `page.tsx`; engagement-shaped skeletons (not generic Nexus spinner).
- **Tier B streaming** — `Suspense` stream slots per heavy list/KPI section (parallel queries + load-failed copy).
- **`React.cache`** on hot read paths (templates, distribution summary, analytics snapshot) for per-request dedupe.
- **Split** `engagement-surface-builders.server.ts` into `engagement-surface-builders/` folder (TCI uses `tci-surface-builders/`).
- **Transactional email** for HRM-ENG-012 when product approves `#lib/auth` mail integration.
- **Portal `/p`** distribution surface with deep links from notifications.
- **Dedicated E2E** spec — `pnpm e2e:preflight:*` + targeted Playwright (human pre-PR).
- **Audit:** emit `invitation.create` per batch or document contract deprecation of duplicate string.
