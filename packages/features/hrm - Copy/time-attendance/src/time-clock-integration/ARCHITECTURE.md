# Time Clock Integration

## Implementation notes

- **Route:** `/{locale}/o/{orgSlug}/apps/hrm/time-clock` — registry segment `time-clock`, audit prefix `erp.hrm.time_clock`.
- **Slice 1–4 (shipped on branch):** Contracts, ERP permissions, HRM registry, thin route, device/mapping CRUD (Pattern C), API ingest + manual CSV, validation + exception inbox (Pattern C), KPI summary.
- **Slice 5 (shipped):** `persistTimeClockPunch` sole `source: device` writer; LAM `regenerateAttendanceDayFromEvents`; read helpers on `@afenda/feature-hrm-time-attendance/server`. Approved exceptions with `resolvedEventId` expose **LAM `AttendanceCorrectionDialog`** on the exception inbox (HRM-TCI-024/025).
- **Slice 6 (shipped):** CSV report export; cron `hrm-time-clock-sync` runs **sync watch** + **scheduled vendor poll** (`runTimeClockCronSyncTick`; credentials `poll:`, `vendor:zebra:`, `vendor:ukg:` via `TCI_VENDOR_ADAPTERS`, HRM-TCI-011). Sync-batch governed list (`hrm:time-clock:sync-batches`). Sync failures notify users with `time_clock_device` **update** ERP permission (`tci-notification.server.ts`).
- **Public doors:** `@afenda/feature-hrm-time-attendance` (RSC + `TimeClockPageLoading`), `@afenda/feature-hrm-time-attendance/client` (forms), `@afenda/feature-hrm-time-attendance/server` (ingest, cron, LAM/OTM reads). No `components2/time-clock/`.
- **Route loading:** `app/.../hrm/time-clock/loading.tsx` re-exports `TimeClockPageLoading` (KPI + Pattern C list + report skeletons — not generic Nexus spinner).
- **Page perf:** `page.tsx` is sync + `export const unstable_instant = { prefetch: "static" }`; Tier A runs in `TimeClockPageGate` (session, access, geo mobile, break capture) inside route `Suspense` with `TimeClockPageLoading` fallback. `TimeClockPage` receives `access`, `organizationId`, and `orgSlug` (no duplicate session gate). Each list/KPI section streams behind `TimeClockStreamSlot` (`Suspense` + skeleton variant) and `time-clock-page-stream-sections.tsx` (Tier B; shared `streamTimeClockTierBReadSection` for parallel query + load-failed copy). Hot reads use `React.cache` on KPI, devices, mappings, punch lists, sync batches, and submitted exceptions (per-request dedupe only — not `use cache`). Governed sections set `resolveConfiguredPermission={false}`. Employee choices load only when `canManageMappings` (inside the mappings stream slot).
- **Section IA:** `TimeClockPageSectionGroup` bands — setup · capture · quality · downstream · operations · admin (see `messages` `pageSections.*`).
- **UI DRY:** LAM day-level findings (missing / duplicate / abnormal) share `renderTimeClockLamDayFindingsSection` + `buildTimeClockLamDayFindingsListSurfaceConfiguration` in `data/tci-surface-builders/findings.server.ts` (barrel: `tci-surface-builders.server.ts`). Tier B stream slots use `streamTimeClockTierBReadSection` (parallel query + load-failed copy, consistent forbidden branch).
- **Cron truth:** `app/api/cron/hrm-time-clock-sync` — `runTimeClockCronSyncTick` (watch + scheduled). Registered in `vercel.json` (`0 */6 * * *`). `integrationCredentialRef` formats: `poll:https://…` (generic `{ punches: [...] }`), `vendor:zebra:https://…` (`transactions[]`), `vendor:ukg:https://…` (`punchExports[]`).
- **Ingest performance (batch):** `ingestTimeClockBatch` defers per-punch LAM regen and layout invalidation — one `regenerateAttendanceDayFromEvents` per unique `(employeeId, attendanceDate)` before the response; `shouldRevalidateTimeClockUi` skips revalidate for `scheduled` / `system` / integration `api` key. HTTP ingest uses `after()` for revalidate only (regen stays blocking). Cron vendor loop exits early when wall time exceeds `TCI_CRON_SAFE_WALL_MS` (50s under route `maxDuration` 60).
- **Cache tags:** Org-scoped list/KPI reads use `unstable_cache` with `hrmTimeClockOrgCacheTag(organizationId)` — devices, mappings, KPI, punch records, break punches, exceptions, sync batches. Mutations call `revalidateTag(tag, "max")` + layout `revalidatePath`; Server Actions also `updateTag` for read-your-own-writes. Batch ingest, manual CSV import rows, and exception approve call `persistTimeClockPunch` with `skipRevalidate: true` and invalidate once at batch end / action completion.
- **P4 durable ingest (WDK):** Batches with `punches.length >= TCI_INGEST_WORKFLOW_PUNCH_THRESHOLD` (50) enqueue `timeClockIngestWorkflow` via `enqueueTimeClockIngestWorkflowRun`; HTTP route returns `{ status: "queued", received, uiRevalidate }`. Smaller batches stay synchronous under route `maxDuration` 60s.
- **API key lookup:** `integrationCredentialSha256` on `hrm_time_clock_device` (indexed with `organizationId`) — Bearer auth queries by hash; legacy rows backfill hash on first successful match.

### HRM-TCI-001 — integration sources (physical + digital)

Canonical manifest: `tci-integration-sources.shared.ts` (exported from `#features/hrm`).

| Class | Mechanism | Examples |
| --- | --- | --- |
| **Physical device types** | Registered terminals on the device registry | `biometric`, `card`, `rfid`, `kiosk` |
| **Digital device types** | Web/API capture endpoints | `web`, `api` |
| **Physical ingest** | Scheduled vendor pull + offline replay batches | `TCI_VENDOR_ADAPTERS` (`zebra`, `ukg`, `http_poll`); `sourceKind: scheduled` / `offline_replay` |
| **Digital ingest** | HTTP + file import | `POST /api/erp/hrm/time-clock/ingest` (`sourceKind: api`); system-admin `hrm_time_clock_import` (`manual_import`) |

Device `integrationCredentialRef`: vendor URL prefixes for **scheduled physical pull**, or opaque secret for **API ingest** (terminals posting directly). GEO/mobile check-in stays out of scope (`source: mobile` is not a TCI writer).

### HRM-TCI-002 — supported clock families

Canonical manifest: `tci-device-types.shared.ts` (exported from `#features/hrm`). Registry enums in `schemas/tci-workflow-state.shared.ts` + DB check `hrm_time_clock_device_type_chk`.

| Family (requirement) | TCI `deviceType` / module | UI |
| --- | --- | --- |
| Biometric terminal | `biometric` | Device register (physical group) |
| Card reader | `card` | Device register (physical group) |
| RFID terminal | `rfid` | Device register (physical group) |
| Kiosk clock | `kiosk` | Device register (physical group) |
| Web clock | `web` | Device register (digital group) |
| API / programmatic feed | `api` | Device register (digital group); HRM-TCI-010 ingest |
| **Mobile clock (where enabled)** | **Geolocation** (`/{locale}/o/{orgSlug}/apps/hrm/geolocation`) | Notice on time-clock devices when user can enter GEO; `hrm_attendance_event.source = mobile` |

Device list Pattern C surfaces render **translated** type labels (not raw enum strings). `assertHrmTci002DeviceTypeCoverage()` ties manifest ↔ partition ↔ GEO bridge.

### HRM-TCI-003 — device record maintenance

Canonical manifest: `tci-device-registry.shared.ts` (exported from `#features/hrm`).

| Operation | Door | Symbol |
| --- | --- | --- |
| **List** | `listTimeClockDevicesForOrg` + Pattern C `hrm:time-clock:devices` | Tier B stream on time-clock page |
| **Create** | `upsertTimeClockDeviceAction` (no `id`) | Register device dialog |
| **Update** | `upsertTimeClockDeviceAction` (with `id`) | Edit device dialog; `active` / `inactive` only (not `revoked`) |
| **Revoke** | `revokeTimeClockDeviceAction` | Row action; sets `state: revoked`, blocks future ingest |

Table: `hrm_time_clock_device` (org-scoped, unique `externalDeviceId`). Audits: `HRM_TCI_AUDIT.deviceCreate` · `deviceUpdate` · `deviceRevoke`. ERP permission: `hrm.time_clock_device.update` for mutations. List cells use translated device type, registry state, and sync status labels.

### HRM-TCI-004 — device metadata capture

Canonical manifest: `tci-device-metadata.shared.ts` (exported from `#features/hrm`).

| Requirement field | DB (`hrm_time_clock_device`) | Pattern C column | Notes |
| --- | --- | --- | --- |
| **Device ID** | `external_device_id` | `deviceId` | Vendor identifier used by API ingest and scheduled pull |
| **Device name** | `name` | `name` | Display label in UI and notifications |
| **Device type** | `device_type` | `type` | Translated via `deviceTypeLabels.*` (HRM-TCI-002 enums) |
| **Location** | `location_ref` | `location` | Optional site/plant reference; empty → `—` |
| **Status** | `state` | `status` | Registry lifecycle: `active` · `inactive` · `revoked` |
| **Sync health** | `sync_status` | `sync` | Operational: `idle` · `syncing` · `ok` · `failed` (complements status) |
| **Last sync timestamp** | `last_sync_at` | `lastSync` | Locale-formatted datetime; `—` when never synced |

**Writers for `last_sync_at`:** `persistTimeClockPunch` (successful device punch) · `runTimeClockScheduledSyncTick` (successful vendor poll). Row key `id` (UUID) is stable for edit/revoke but is not a separate list column.

### HRM-TCI-005 — employee ↔ terminal identity mapping

Canonical manifest: `tci-employee-mapping.shared.ts` (exported from `#features/hrm`).

| Requirement identity | DB column | Pattern C column | Ingest resolution |
| --- | --- | --- | --- |
| **Clock / device user ID** | `clock_user_id` | `clockUser` | **Primary** — `findActiveTimeClockMapping` + `resolveTimeClockIngestContext` key on `(org, device, clockUserId)` |
| **Badge ID** | `badge_id` | `badge` | Stored for operator truth; not a substitute ingest key |
| **Biometric ID** | `biometric_ref` | `biometric` | Stored for operator truth; not a substitute ingest key |
| **Employee record** | `employee_id` | `employee` | Joined display name + number |
| **Terminal scope** | `device_id` | `device` | Device display name |
| **Status** | `state` | `status` | `active` · `inactive` |

Table: `hrm_time_clock_employee_mapping` (org-scoped; unique `(organizationId, deviceId, clockUserId)`). Mutations: `upsertTimeClockMappingAction` (ERP `hrm.time_clock_mapping.update`). Audits: `HRM_TCI_AUDIT.mappingCreate` · `mappingUpdate`.

### HRM-TCI-006 — clock-in / clock-out punch capture

Canonical manifest: `tci-clock-punch-capture.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Event types** | `clock_in` · `clock_out` (`TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES`) |
| **Storage** | `hrm_attendance_event` with `source = device` (raw punch ledger — HRM-TCI-029) |
| **Sole writer** | `persistTimeClockPunch` in `data/tci-punch-commands.server.ts` |
| **Batch paths** | `ingestTimeClockBatch` · manual CSV adapter · `POST /api/erp/hrm/time-clock/ingest` |
| **LAM handoff** | Successful accept → `regenerateAttendanceDayFromEvents` (HRM-TCI-021) |
| **Audit** | `HRM_TCI_AUDIT.punchCreate` after commit |
| **Read model** | `listRecentClockInOutPunchesForOrg` (latest 50, org-scoped) |
| **KPI** | `punchesToday` counts only `clock_in` / `clock_out` device punches for UTC day |

Pattern B list `hrm:time-clock:punch-records` (`TimeClockPunchRecordsSection`) — columns: occurred at, employee, device, event type, source ref. Break/correction types are HRM-TCI-007 / HRM-TCI-016 — excluded from this list and KPI.

### HRM-TCI-007 — break start / break end punch capture (where enabled)

Canonical manifest: `tci-break-punch-capture.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Event types** | `break_start` · `break_end` (`TCI_BREAK_PUNCH_EVENT_TYPES`) |
| **Enablement** | `resolveTciBreakPunchCaptureEnabled` — env `AFENDA_TCI_BREAK_PUNCH_CAPTURE` (`1`/`0`) or active Geolocation policy with `breakWindowMinutes > 0` |
| **Gate** | `evaluateTimeClockPunch` rejects break types when disabled (`break_capture_disabled`) |
| **Storage** | Same `hrm_attendance_event` ledger (`source = device`) via `persistTimeClockPunch` |
| **Batch paths** | `ingestTimeClockBatch` · manual CSV · scheduled vendor pull (`BREAK_IN`/`BreakIn` → `break_start`) · HTTP ingest |
| **LAM handoff** | Successful accept → `regenerateAttendanceDayFromEvents` (break pairs in aggregator) |
| **Read model** | `listRecentBreakPunchesForOrg` (latest 50, org-scoped) |
| **UI** | Pattern B `hrm:time-clock:break-punch-records` when enablement is true (Tier B stream) |

Excluded from clock-in/out KPI and `hrm:time-clock:punch-records` list (HRM-TCI-006).

### HRM-TCI-008 — automated punch data synchronization

Canonical manifest: `tci-automated-sync.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Automated `sourceKind`** | `api` · `scheduled` · `offline_replay` (`TCI_AUTOMATED_SYNC_SOURCE_KINDS`) — excludes `manual_import` (HRM-TCI-009) |
| **Cron orchestrator** | `GET /api/cron/hrm-time-clock-sync` → `runTimeClockCronSyncTick` (Bearer `CRON_SECRET`) |
| **Scheduled pull** | `runTimeClockScheduledSyncTick` — vendor adapters + `ingestTimeClockBatch` (`sourceKind: scheduled`) — see HRM-TCI-011 |
| **Push ingest** | `POST /api/erp/hrm/time-clock/ingest` → `ingestTimeClockBatch` (`sourceKind: api`) — see HRM-TCI-010 |
| **Offline replay** | `ingestTimeClockBatch` with `sourceKind: offline_replay` after device reconnect — see HRM-TCI-012 |
| **Sync evidence** | `hrm_time_clock_sync_batch` rows + `HRM_TCI_AUDIT.syncRun` on each batch |
| **Device health** | `sync_status` / `last_sync_at` on `hrm_time_clock_device`; watch tick (HRM-TCI-026) alerts on `failed` / stale `syncing` |
| **Read model** | `listTimeClockSyncBatchesForOrg` · Pattern B `hrm:time-clock:sync-batches` |
| **Interval** | `HRM_TIME_CLOCK_SYNC_INTERVAL_MINUTES` env (default 360) via `tci-scheduled-sync.shared.ts` |

### HRM-TCI-009 — manual attendance data import

Canonical manifest: `tci-manual-import.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **`sourceKind`** | `manual_import` only (`TCI_MANUAL_IMPORT_SOURCE_KIND`) — not automated sync (HRM-TCI-008) |
| **System-admin door** | Adapter `hrm_time_clock_import` (`timeClockManualImportAdapter`) on **Integrations → Imports** |
| **CSV contract** | Required: `external_device_id`, `clock_user_id`, `event_type`, `occurred_at_iso` · optional `source_ref` (`timeClockManualImportRowSchema`) |
| **Writer** | Each row → `persistTimeClockPunch` (`source: device` on `hrm_attendance_event`) + LAM day regeneration |
| **Sync evidence** | Durable import workflow creates `hrm_time_clock_sync_batch` (`manual_import`), links `import_job.metadata.timeClockSyncBatchId`, increments counts per row, finalizes on job complete |
| **Visibility** | Pattern B `hrm:time-clock:sync-batches` (localized `sourceKindLabels.manual_import`) |

### HRM-TCI-010 — API-based attendance data ingestion

Canonical manifest: `tci-api-ingest.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **`sourceKind`** | `api` (`TCI_API_INGEST_SOURCE_KIND`) via `timeClockIngestBatchSchema` |
| **Route** | `POST /api/erp/hrm/time-clock/ingest` — Zod batch body, `maxDuration` 60s |
| **Auth** | Trusted org session **or** `Authorization: Bearer` + `x-afenda-organization-id` (`resolveTimeClockIngestActor`) |
| **Platform key** | `HRM_TIME_CLOCK_INGEST_API_KEY` + `HRM_TIME_CLOCK_INGEST_ACTOR_USER_ID` (env) |
| **Device key** | Active device `integrationCredentialRef` matched with Bearer token |
| **Where enabled** | `resolveTciApiIngestEnabled` — `AFENDA_TCI_API_INGEST` override; platform key pair; or active `api` device / credential ref |
| **Bearer gate** | Integration key calls return **403** when disabled; require `sourceKind: api` |
| **Writer** | `ingestTimeClockBatch` → `persistTimeClockPunch` per punch + `hrm_time_clock_sync_batch` + `HRM_TCI_AUDIT.syncRun` |
| **UI** | Pattern B `hrm:time-clock:sync-batches` (`sourceKindLabels.api`) |

### HRM-TCI-011 — scheduled sync from external time clock systems

Canonical manifest: `tci-scheduled-sync.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **`sourceKind`** | `scheduled` (`TCI_SCHEDULED_SYNC_SOURCE_KIND`) |
| **Cron** | `GET /api/cron/hrm-time-clock-sync` — Bearer `CRON_SECRET`; Sentry monitor `0 */6 * * *` |
| **Orchestrator** | `runTimeClockCronSyncTick` → `runTimeClockScheduledSyncTick` + sync watch (HRM-TCI-026) |
| **Vendor pull** | Device `integrationCredentialRef`: `poll:https://…` · `vendor:zebra:https://…` · `vendor:ukg:https://…` (`TCI_VENDOR_ADAPTERS`) |
| **Interval** | `HRM_TIME_CLOCK_SYNC_INTERVAL_MINUTES` (min 15, default 360) · per-device `lastSyncAt` gate |
| **Where enabled** | `resolveTciScheduledSyncEnabled` — `AFENDA_TCI_SCHEDULED_SYNC` override; or active device with vendor poll credential |
| **Writer** | `ingestTimeClockBatch` (`sourceKind: scheduled`) → punches + `hrm_time_clock_sync_batch` + `HRM_TCI_AUDIT.syncRun` |
| **Failure UX** | `sync_status` on device; notifications `scheduled_poll` / `scheduled_ingest` (HRM-TCI-026) |
| **UI** | Pattern B `hrm:time-clock:sync-batches` (`sourceKindLabels.scheduled`); device form credential hint |

Composes with HRM-TCI-008 automated sync plane; distinct from HRM-TCI-009 `manual_import` and HRM-TCI-010 push `api` ingest.

### HRM-TCI-012 — offline punch synchronization

Canonical manifest: `tci-offline-replay.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **`sourceKind`** | `offline_replay` (`TCI_OFFLINE_REPLAY_SOURCE_KIND`) |
| **HTTP** | Same route as API ingest: `POST /api/erp/hrm/time-clock/ingest` with `sourceKind: offline_replay` |
| **ERP action** | `replayOfflineTimeClockPunchBatchAction` — JSON `batchJson` field (`timeClockIngestBatchSchema`) |
| **Auth** | Org session or device Bearer + org header (`resolveTimeClockIngestActor`) |
| **Where enabled** | `resolveTciOfflineReplayEnabled` — `AFENDA_TCI_OFFLINE_REPLAY` override; or active terminal device (`biometric` · `card` · `rfid` · `kiosk` · `web`) |
| **Dedup** | `resolveTimeClockPunchPayloadHash` (HRM-TCI-013) — same key on validation and persist |
| **Writer** | `ingestTimeClockBatch` → sync batch + audit; updates device `sync_status` / `last_sync_at` on reconnect when `deviceId` resolved |
| **UI** | Pattern B `hrm:time-clock:sync-batches` (`sourceKindLabels.offline_replay`) |

Distinct from HRM-TCI-010 live `api` push and HRM-TCI-011 server-initiated `scheduled` vendor pull.

### HRM-TCI-013 — duplicate prevention on repeated sync

Canonical manifest: `tci-deduplication.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Idempotency key** | `resolveTimeClockPunchPayloadHash` in `tci-punch-deduplication.shared.ts` — device `rawPayloadHash` when sent, else canonical SHA-256 over org + device + employee + event + occurredAt + sourceRef |
| **Lookup** | `evaluateTimeClockPunch` queries `hrm_attendance_event.rawPayloadHash` per organization before insert |
| **Outcome** | `duplicate_punch` → `persistTimeClockPunch` returns `{ status: "duplicate" }` (no second `hrm_attendance_event` row) |
| **Batch tallies** | `ingestTimeClockBatch` increments `duplicateCount` on `hrm_time_clock_sync_batch` |
| **UI** | Pattern B `hrm:time-clock:sync-batches` — `colDuplicates` column (received / accepted / duplicates / rejected) |

Applies to automated ingest channels (`api`, `scheduled`, `offline_replay`) and manual import via the same persist path. **HRM-TCI-018** surfaces detected duplicates in the exception inbox and LAM day findings (see below).

### HRM-TCI-014 — active employee validation

Canonical manifest: `tci-active-employee-validation.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Rule** | Only `hrm_employee.employmentStatus === "active"` may ingest device punches |
| **Gate** | `resolveTimeClockEmployeeStatusValidation` — `unknown_employee` when row missing, `inactive_employee` otherwise |
| **Enforcement** | `evaluateTimeClockPunch` (first check after employee load) → `persistTimeClockPunch` / `ingestTimeClockBatch` / manual import adapter |
| **Exception inbox** | Rejected punches persist `detectionOutcome: inactive_employee` on `hrm_time_clock_punch_exception` |
| **UI** | Pattern C `hrm:time-clock:exceptions` — `detectionOutcomeLabels.inactive_employee` (and sibling outcomes) |

Distinct from HRM-TCI-015 (device-user mapping) and HRM-TCI-018 (duplicate punch detection semantics).

### HRM-TCI-015 — employee-device mapping validation

Canonical manifest: `tci-device-mapping-validation.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Rule** | Punch `(clockUserId, deviceId)` must resolve to an **active** row on `hrm_time_clock_employee_mapping` whose `employee_id` matches the punch employee |
| **Gate** | `resolveTimeClockDeviceMappingValidation` after `findActiveTimeClockMapping` — outcome `unmapped_device_user` when missing or mismatched |
| **Maintenance** | HRM-TCI-005 — `upsertTimeClockMappingAction` + Pattern C `hrm:time-clock:mappings` |
| **Enforcement** | `evaluateTimeClockPunch` → `persistTimeClockPunch` / `ingestTimeClockBatch` / manual import; ingest preflight via `resolveTimeClockIngestContext` |
| **Exception inbox** | Rejected punches persist `detectionOutcome: unmapped_device_user` |
| **UI** | Pattern C mappings (`mappingStateLabels`) + exceptions (`detectionOutcomeLabels.unmapped_device_user`) |

Distinct from HRM-TCI-014 (employment status) and HRM-TCI-018 (duplicate detection semantics in the inbox).

### HRM-TCI-016 — punch classification

Canonical manifest: `tci-punch-classification.shared.ts` (exported from `#features/hrm`).

| Requirement label | Wire `eventType` | Lists / capture |
| --- | --- | --- |
| Clock-in | `clock_in` | Pattern B `hrm:time-clock:punch-records` (HRM-TCI-006) |
| Clock-out | `clock_out` | Pattern B `hrm:time-clock:punch-records` |
| Break-in | `break_start` | Pattern B `hrm:time-clock:break-punch-records` (HRM-TCI-007) |
| Break-out | `break_end` | Pattern B `hrm:time-clock:break-punch-records` |
| Transfer punch | `transfer` | Ingest + exceptions (no dedicated list surface in v1) |
| Correction punch | `correction` | Exception inbox + LAM correction (HRM-TCI-024) |

| Concern | Implementation |
| --- | --- |
| **Enum** | `TCI_PUNCH_EVENT_TYPES` in `schemas/tci-workflow-state.shared.ts` |
| **Ingest gate** | `timeClockIngestPunchSchema` / `timeClockManualImportRowSchema` — `z.enum(TCI_PUNCH_EVENT_TYPES)` |
| **Vendor maps** | Zebra / UKG poll parsers → canonical wire values (`tci-vendor-payload.shared.ts`) |
| **Persistence** | `persistTimeClockPunch` writes `hrm_attendance_event.eventType` unchanged |
| **UI** | Shared `classifiedEventTypeLabels` on punch, break, and exception Pattern B/C sections |

### HRM-TCI-017 — missing punch detection

Canonical manifest: `tci-missing-punch-detection.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Codes** | `missing_clock_in` · `missing_clock_out` · `missing_break_end` (`TCI_MISSING_PUNCH_CODES`) — aligned with LAM `AttendanceExceptionCode` |
| **Stream detector** | `detectMissingPunchesInDeviceEventSequence` — open clock-in / break-start pairs on ordered device events |
| **LAM authority** | After each accepted device punch → `regenerateAttendanceDayFromEvents` → `aggregateAttendanceDay` writes exceptions into `hrm_attendance_day.calculationSnapshot` (includes scheduled `missing_clock_in`) |
| **Read model** | `listMissingPunchDayFindingsForOrg` — days in last 14d whose snapshot contains missing-punch codes |
| **KPI** | `missingPunchDays` — count of such days in last 7d on `hrm:time-clock:kpi-summary` |
| **UI** | Pattern B `hrm:time-clock:missing-punch-findings` (`TimeClockMissingPunchFindingsSection`) |
| **Report** | CSV `row_kind: missing_punch` with `detection_outcome` column listing codes (`HRM-TCI-028`) |
| **Corrections** | HRM-TCI-024 — LAM `AttendanceCorrectionDialog` on approved exception rows |

Distinct from HRM-TCI-018 (duplicate punch detection) and AAT `missing_punch` trend buckets (downstream analytics).

### HRM-TCI-018 — duplicate punch detection

Canonical manifest: `tci-duplicate-detection.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Payload replay** | Same hash gate as HRM-TCI-013 — `evaluateTimeClockPunch` → outcome `duplicate_punch` |
| **Inbox** | `persistTimeClockPunch` writes `hrm_time_clock_punch_exception` when `recordExceptionOnDuplicate !== false` (default), while still returning `{ status: "duplicate" }` for batch counters |
| **Sequence** | `duplicate_clock_in` on LAM `calculationSnapshot.exceptions` after regeneration; stream helper `detectDuplicatePunchesInDeviceEventSequence` |
| **Read model** | `listDuplicatePunchDayFindingsForOrg` (LAM days, 14d) · `countSubmittedDuplicatePunchExceptionsForOrg` (inbox KPI) |
| **KPI** | `duplicatePunchInbox` on `hrm:time-clock:kpi-summary` |
| **UI** | Pattern C `hrm:time-clock:exceptions` (`detectionOutcomeLabels.duplicate_punch`) · Pattern B `hrm:time-clock:duplicate-punch-findings` |
| **Report** | CSV `row_kind: duplicate_punch` for snapshot sequence codes; exception rows include `duplicate_punch` outcomes |

Distinct from HRM-TCI-013 (idempotent **prevention** — no second attendance event) and HRM-TCI-017 (missing punch pairing).

### HRM-TCI-019 — abnormal punch detection

Canonical manifest: `tci-abnormal-punch-detection.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Taxonomy** | `TCI_ABNORMAL_PUNCH_TAXONOMY` — early clock-in → `outside_shift_window` (ingest); late clock-in → `late_arrival`; early clock-out → `early_out`; unmatched punch → `clock_out_without_clock_in` (LAM) |
| **Ingest** | `evaluateTimeClockPunch` → `outside_shift_window` when punch is outside assigned shift ± `TCI_SHIFT_WINDOW_MS` (see HRM-TCI-020); exception inbox row on reject |
| **LAM** | `late_arrival`, `early_out`, `clock_out_without_clock_in` on `calculationSnapshot.exceptions` after `regenerateAttendanceDayFromEvents` |
| **Stream** | `detectAbnormalPunchesInDeviceEventSequence` — clock-out without open clock-in |
| **Read model** | `listAbnormalPunchDayFindingsForOrg` (LAM days, 14d) · `countSubmittedAbnormalPunchExceptionsForOrg` (shift-window inbox) |
| **KPI** | `abnormalPunchDays` · `abnormalPunchInbox` on `hrm:time-clock:kpi-summary` |
| **UI** | Pattern C `hrm:time-clock:exceptions` (`detectionOutcomeLabels.outside_shift_window`) · Pattern B `hrm:time-clock:abnormal-punch-findings` |
| **Report** | CSV `row_kind: abnormal_punch` for LAM codes; exception rows include `outside_shift_window` |

Distinct from HRM-TCI-017 (missing pair codes) and HRM-TCI-018 (duplicate sequence).

### HRM-TCI-020 — shift matching

Canonical manifest: `tci-shift-matching.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Assignment lookup** | `findShiftAssignmentForTimeClockPunch` → `hrm_shift_assignment` by `(organizationId, employeeId, attendanceDate)` |
| **Window** | `isTimeClockPunchWithinShiftWindow` — ± `TCI_SHIFT_WINDOW_MS` (1h) around scheduled start/end |
| **Ingest gate** | `evaluateTimeClockPunch` — skip window check when no assignment; reject with `outside_shift_window` when assignment exists and punch is outside window |
| **HR override** | `persistTimeClockPunch` `hrOverrideShiftWindow` allows approved outside-window punches (HRM-TCI-024) |
| **Read model** | `listShiftMatchRowsForOrg` — recent device punches with `no_assignment` · `within_window` · `outside_window` |
| **KPI** | `shiftEvaluatedToday` — today's clock punches where a shift assignment was on file |
| **UI** | Pattern B `hrm:time-clock:shift-match-findings` · Pattern C exceptions for `outside_shift_window` |
| **Report** | CSV `row_kind: shift_match` for punches with an assignment (status in `detection_outcome` column) |

Where no shift assignment exists, punches are not blocked by shift matching (requirement: **where available**).

### HRM-TCI-021 — LAM attendance handoff

Canonical manifest: `tci-attendance-handoff.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Writer** | `persistTimeClockPunch` inserts `hrm_attendance_event` with `source = device`, then calls `regenerateAttendanceDayFromEvents` |
| **Regenerate outcomes** | `skipped` · `updated` · `locked` on `hrm_attendance_day` (payroll-locked days skip mutation) |
| **Bulk import** | `attendanceImportAdapter` — same handoff after CSV rows (HRM-TCI-009) |
| **LAM read API** | `@afenda/feature-hrm-time-attendance/server` — `listDevicePunchesForEmployeeDate`, `hasDevicePunchOnDate`, `getDeviceAttendanceHoursForEmployeeDateRange` via `tci-integration.server.ts` |
| **Read model** | `listAttendanceHandoffRowsForOrg` — per employee+date: device punch count, `hrm_attendance_day` state, worked minutes, exposure status |
| **KPI** | `lamExposedToday` — distinct employee+dates with device punches today that have a materialized LAM day row |
| **UI** | Pattern B `hrm:time-clock:attendance-handoff-findings` |
| **Report** | CSV `row_kind: attendance_handoff` (`detection_outcome` = exposure status; worked minutes in adjacent columns) |

Detection modules (017–019) consume LAM snapshot codes **after** this handoff; they re-export `TCI_LAM_HANDOFF_SYMBOL` from the TCI-021 manifest — do not duplicate handoff ownership.

### HRM-TCI-022 — Overtime Management work-hour reference

Canonical manifest: `tci-overtime-reference.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Source of truth** | `hrm_attendance_day.workedMinutes` and `overtimeMinutes` after LAM `aggregateAttendanceDay` (fed by device events via TCI-021) |
| **OTM compare** | `calculateOtmPayableForApproval` reads `hrmAttendanceDay.overtimeMinutes` when `compareAttendanceEnabled` on org policy |
| **Range API** | `getDeviceAttendanceHoursForEmployeeDateRange` in `tci-integration.server.ts` — sums worked/overtime minutes for OTM and integrations (`@afenda/feature-hrm-time-attendance/server`) |
| **Read model** | `listOvertimeReferenceRowsForOrg` — per employee+date with device punches: worked minutes, overtime minutes, OTM exposure status |
| **KPI** | `workHourDaysToday` — today’s employee+dates with device punches and non-zero worked or overtime minutes on the LAM day row |
| **UI** | Pattern B `hrm:time-clock:overtime-reference-findings` |
| **Report** | CSV `row_kind: overtime_reference` (skips `not_exposed` rows; worked + OT minutes in trailing columns) |

Depends on HRM-TCI-021 (day materialization). Overtime Management does not read raw device punches directly for validation — it compares against LAM-derived minutes.

### HRM-TCI-023 — Payroll Processing attendance reference

Canonical manifest: `tci-payroll-reference.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Source of truth** | `hrm_attendance_day` after LAM regeneration (TCI-021) — not raw `hrm_attendance_event` (TCI-029) |
| **Readiness gate** | `isAttendanceDayReadyForPayroll` in `leave-attendance-management/data/attendance-display.shared.ts` — `computed` or `locked` with no payroll-blocking exceptions in `calculationSnapshot` |
| **Payroll consume** | `getPayrollRunInputSnapshot` filters `listAttendanceDaysForEmployee` rows via `isReadyForPayrollRow` → `isAttendanceDayReadyForPayroll` |
| **Period lock** | `lockPayrollPeriodAndRunsMutation` sets matching `hrm_attendance_day.state` to `locked` for the payroll period date range |
| **Read model** | `listPayrollReferenceRowsForOrg` — per employee+date with device punches: LAM day state, worked minutes, payroll exposure status |
| **KPI** | `payrollReadyDaysToday` — today’s employee+dates with device punches where exposure status is `payroll_ready` |
| **UI** | Pattern B `hrm:time-clock:payroll-reference-findings` |
| **Report** | CSV `row_kind: payroll_reference` (skips `not_materialized`; worked minutes + punch count in trailing columns) |

Payroll Processing authority stays in `lib/features/hrm/payroll-compensation/payroll-processing/` — TCI-023 manifests and surfaces the LAM → payroll boundary only.

### HRM-TCI-024 — Punch correction workflow

Canonical manifest: `tci-correction-workflow.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Invalid punches** | Rejected ingest outcomes (`unknown_employee`, `inactive_employee`, `unmapped_device_user`, `outside_shift_window`, …) → `hrm_time_clock_punch_exception` |
| **Duplicate punches** | `duplicate_punch` exception inbox + LAM `duplicate_clock_in` snapshot |
| **Missing punches** | LAM `missing_clock_in` / `missing_clock_out` / `missing_break_end` on day snapshot |
| **Unmatched punches** | LAM `clock_out_without_clock_in` on day snapshot |
| **HR approve** | `decideTimeClockPunchException` — `hrOverrideShiftWindow` on approve (HRM-TCI-020 outside-window) |
| **LAM correct** | `AttendanceCorrectionDialog` → `submitAttendanceCorrectionForApproval` on approved `resolvedEventId` or snapshot anchor punch |
| **Access** | HRM-TCI-025 — see dedicated section below |
| **Read model** | `listCorrectionWorkflowRowsForOrg` — submitted exceptions, approved+resolved, LAM snapshot days with device anchor |
| **KPI** | `correctionQueueOpen` — actionable rows in the unified queue |
| **UI** | Pattern C `hrm:time-clock:correction-workflow` (decide + LAM trailing) · Pattern C `hrm:time-clock:exceptions` (full inbox) |
| **Report** | CSV `row_kind: correction_workflow` |

### HRM-TCI-025 — Correction access control

Canonical manifest: `tci-correction-access.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Exception decide** | ERP `hrm.time_clock_punch.update` — `canDecideExceptions` via `resolveTimeClockSurfaceAccess`; `requireTimeClockExceptionDecisionPermission` on `decideTimeClockPunchExceptionAction` and `decideTimeClockPunchException` |
| **LAM attendance correct** | ERP `hrm.attendance.update` — `canCorrectAttendance`; LAM `correctAttendanceEventAction` (unchanged) |
| **UI** | Pattern C trailing actions omitted when flags false; list surfaces still readable with `time_clock_punch.read` |
| **Defense in depth** | Command layer re-checks session permission before mutating exceptions |

### HRM-TCI-026 — Device sync monitoring and failure alerts

Canonical manifest: `tci-sync-monitoring.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Watch tick** | `runTimeClockSyncWatchTick` — marks `failed` or stale `syncing` (>24h since `lastSyncAt`); audit `HRM_TCI_AUDIT.syncFail` |
| **Cron compose** | `runTimeClockCronSyncTick` runs scheduled vendor pull then sync watch (HRM-TCI-011 + HRM-TCI-026) |
| **Alerts** | `notifyTimeClockDeviceSyncFailure` / `createTimeClockNotificationDispatcher` — in-app warning to users with `hrm.time_clock_device.update` |
| **Scheduled failures** | `scheduled_poll` / `scheduled_ingest` reasons on vendor sync errors (same dispatcher) |
| **Read model** | `listSyncMonitoringRowsForOrg` — devices currently needing attention |
| **KPI** | `failedSyncDevices` — count of failed or stale-syncing devices (same predicate as watch) |
| **UI** | Pattern B `hrm:time-clock:sync-monitoring-findings` · Pattern B `hrm:time-clock:sync-batches` (batch history) |
| **Report** | CSV `row_kind: sync_monitoring` |

### HRM-TCI-027 — Device configuration and integration credentials (admin only)

Canonical manifest: `tci-device-admin-access.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **ERP permission** | `hrm.time_clock_device.update` — `TCI_DEVICE_ADMIN_PERMISSION` |
| **Read model** | `resolveTimeClockSurfaceAccess` → `canManageDevices` (list remains readable with `time_clock_punch.read`) |
| **Server Actions** | `upsertTimeClockDeviceAction` / `revokeTimeClockDeviceAction` → `requireTimeClockDeviceAdminPermission` |
| **Commands** | `upsertTimeClockDevice` / `revokeTimeClockDevice` re-check admin permission (defense in depth) |
| **Credentials** | Form field `integrationCredentialRef` on register/edit only — not on Pattern C list columns |
| **Ingest** | `resolveTimeClockIngestActor` reads stored credential; mutation path stays admin-gated (HRM-TCI-010 + 027) |
| **Alerts** | Sync failure notifications use the same `time_clock_device.update` holders (HRM-TCI-026) |

### HRM-TCI-028 — Operational reports (dynamic CSV slices)

Canonical manifest: `tci-operational-reports.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Permission** | `hrm.time_clock.audit` — `exportTimeClockReportAction` |
| **Builder** | `buildTimeClockReportCsv` — unified CSV with `row_kind` sections |
| **Filter dimensions** | Employee, device, department (`currentDepartmentId`), location (`locationRef`), date range, exception type (`detectionOutcome`), device `syncStatus` |
| **Dynamic scope** | Optional `rowKinds[]` checkboxes — omit to export all sections; `onlyExceptions` limits to exception rows |
| **CSV columns** | `TCI_REPORT_CSV_COLUMNS` — adds `location_ref`, `department_code`, `device_sync_status` |
| **UI** | `TimeClockReportExportSection` loads `listTimeClockReportFilterOptions` and renders governed selects |

### HRM-TCI-029 — Raw punch ledger vs approved attendance outcomes

Canonical manifest: `tci-raw-vs-approved.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Raw ledger** | Immutable `hrm_attendance_event` rows with `source = device` — sole writer `persistTimeClockPunch` (HRM-TCI-006) |
| **Approved outcomes** | `hrm_attendance_day` materialized by LAM `regenerateAttendanceDayFromEvents` after each accepted punch (HRM-TCI-021) |
| **Separation** | Payroll/OTM consume `hrm_attendance_day` via `isAttendanceDayReadyForPayroll` — not raw punch rows alone (HRM-TCI-023) |
| **Read model** | `listRawVsApprovedFindingsForOrg` — per employee+date: device punch count, LAM day state, `relationship` |
| **Relationships** | `raw_without_approved_day` · `approved_day_open` · `approved_day_computed` · `approved_day_locked` |
| **UI** | Pattern B `hrm:time-clock:raw-vs-approved-findings` (after punch records on the workbench) |
| **Report** | CSV `row_kind: raw_vs_approved` — `detection_outcome` = relationship; `exception_state` = LAM day state |

Distinct from HRM-TCI-021 (LAM handoff exposure labels) and HRM-TCI-028 (operational export slices). Punch list surfaces (`hrm:time-clock:punch-records`) show the raw ledger only; this section compares raw volume to the approved day aggregate.

### HRM-TCI-030 — Audit trail (device, mapping, punch, sync, validation, correction, deletion)

Canonical manifest: `tci-audit-trail.shared.ts` (exported from `#features/hrm`).

| Concern | Implementation |
| --- | --- |
| **Ledger** | `iam_audit_event` rows with `action` prefix `erp.hrm.time_clock` (production origin only in read model) |
| **Device setup** | `deviceCreate` · `deviceUpdate` · `deviceRevoke` — `tci-device-commands.server.ts` |
| **Employee mapping** | `mappingCreate` · `mappingUpdate` (inactive mapping = update, not a separate delete verb) |
| **Punch capture** | `punchCreate` after accepted `hrm_attendance_event` insert |
| **Sync / import** | `syncRun` on batch ingest (`ingestTimeClockBatch`, manual import adapter) |
| **Sync failure** | `syncFail` — `runTimeClockSyncWatchTick` |
| **Validation** | `exceptionSubmit` when `hrm_time_clock_punch_exception` is inserted (reject + duplicate ingest paths) |
| **Exception handling** | `exceptionApprove` · `exceptionReject` — `tci-exception-commands.server.ts` |
| **Correction** | LAM `submitAttendanceCorrectionForApproval` → `erp.hrm.attendance.correction.submit` (delegated; not duplicated on TCI contract) |
| **Deletion** | `deviceRevoke` for retired devices |
| **Reporting** | `reportExport` — `exportTimeClockReportAction` |
| **Read model** | `listTimeClockAuditTrailForOrg` — Pattern B `hrm:time-clock:audit-trail` (requires `hrm.time_clock.audit`) |
| **CSV** | `row_kind: audit_trail` in `buildTimeClockReportCsv` (HRM-TCI-028 slice) |

`punchSearch` is reserved on the contract for future read/search surfaces; ingest paths do not emit it today.

### Governed surface keys

| `surfaceKey` | Section | Pattern |
| --- | --- | --- |
| `hrm:time-clock:kpi-summary` | KPI stat cards | B-stat (`GovernedPatternBStatSection` + `governed:stat-card`) |
| `hrm:time-clock:devices` | Device registry | C (list + **row** trailing: edit/revoke via `GovernedTrailingActionSlot`; register in header) |
| `hrm:time-clock:mappings` | Employee mappings | C (list read-only rows; **header** upsert dialog — no row trailing) |
| `hrm:time-clock:punch-records` | Recent clock-in/out punches | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:break-punch-records` | Recent break start/end punches (when enabled) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:exceptions` | Exception inbox | C (row trailing: decide when `submitted`; LAM correct when `approved` + `resolvedEventId`) |
| `hrm:time-clock:missing-punch-findings` | Missing punch days (LAM snapshot) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:duplicate-punch-findings` | Duplicate sequence days (LAM snapshot) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:abnormal-punch-findings` | Abnormal punch days (late/early/unmatched LAM snapshot) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:shift-match-findings` | Punch vs assigned shift window (per punch) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:attendance-handoff-findings` | Validated device punches exposed to LAM (per employee+day) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:overtime-reference-findings` | Work-hour minutes exposed to Overtime Management (per employee+day) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:payroll-reference-findings` | Approved LAM day outcomes exposed to Payroll Processing (per employee+day) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:correction-workflow` | Unified correction queue (invalid / missing / duplicate / unmatched) | C (row trailing: decide / LAM correct per `workflowStep`) |
| `hrm:time-clock:sync-batches` | Ingest batch history | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:sync-monitoring-findings` | Devices with failed or stale sync (admin alerts) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:raw-vs-approved-findings` | Raw device punches vs LAM day outcomes (HRM-TCI-029) | B (`GovernedPatternBListSection`) |
| `hrm:time-clock:audit-trail` | IAM audit events for time clock mutations (HRM-TCI-030) | B (`GovernedPatternBListSection`) |

---

## Definition

**Time Clock Integration is the HRM function that connects physical, digital, biometric, web, mobile, kiosk, and third-party time clock systems to automatically capture employee clock-in, clock-out, break, attendance, and work-hour records for attendance processing, exception handling, overtime validation, and payroll readiness.**

---

# Time Clock Integration Includes

| Area                                | What It Covers                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| **Physical Time Clock Integration** | Biometric device, fingerprint scanner, face recognition terminal, card reader, RFID terminal |
| **Digital Time Clock Integration**  | Web clock, mobile clock, tablet kiosk, desktop clock-in, browser-based attendance capture    |
| **Clock-In / Clock-Out Capture**    | Start work, end work, break start, break end, meal break, shift start, shift end             |
| **Device Management**               | Device ID, device name, location, status, assigned site, connectivity status                 |
| **Employee Device Mapping**         | Employee badge ID, biometric ID, device user ID, employee reference                          |
| **Attendance Data Import**          | Automated sync, manual import, API import, file import, scheduled data pull                  |
| **Real-Time Attendance Sync**       | Near real-time punch capture, sync status, last sync timestamp                               |
| **Offline Punch Handling**          | Offline device storage, delayed sync, duplicate prevention, sync reconciliation              |
| **Punch Validation**                | Valid employee check, active employment check, shift match, duplicate punch check            |
| **Punch Classification**            | Clock-in, clock-out, break-in, break-out, transfer punch, correction punch                   |
| **Exception Detection**             | Missing punch, duplicate punch, early clock-in, late clock-in, early clock-out               |
| **Device Location Reference**       | Office, branch, site, plant, warehouse, project location                                     |
| **Shift Matching Reference**        | Match punch record against scheduled shift                                                   |
| **Attendance Integration**          | Send validated punch records to Leave & Attendance Management                                |
| **Overtime Reference**              | Provide actual work time for overtime validation                                             |
| **Payroll Readiness Reference**     | Provide approved attendance data for payroll processing                                      |
| **Security Control**                | Device authorization, API key, sync credential, tamper detection                             |
| **Audit Trail**                     | Captured by device, imported by system, edited by user, sync timestamp, correction reason    |

---

# Time Clock Integration Does Not Include

| Excluded Area                     | Owned By                           |
| --------------------------------- | ---------------------------------- |
| Employee master profile           | Employee Records Management        |
| Leave application workflow        | Leave & Attendance Management      |
| Leave balance calculation         | Leave & Attendance Management      |
| Attendance policy ownership       | Leave & Attendance Management      |
| Shift pattern creation            | Shift Scheduling                   |
| Overtime approval and calculation | Overtime Management                |
| Payroll calculation               | Payroll Processing                 |
| GPS-based mobile verification     | Geolocation & Remote Check-In      |
| Absence trend analytics           | Absence Analytics & Trends         |
| Flexible work arrangement policy  | Flexible Work Arrangement Tracking |
| Biometric legal compliance policy | Compliance & Regulatory Tracking   |
| Physical security access control  | IAM / Physical Access Control      |
| Device hardware procurement       | IT / Facilities                    |
| Device maintenance contract       | IT / Vendor Management             |

---

# Time Clock Integration Requirement Statement

| Requirement                | Description                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time Clock Integration** | Integrates with physical and digital time clock systems to automatically capture employee clock-in, clock-out, break, and attendance punch data, with device mapping, automated sync, offline handling, validation, exception detection, attendance integration, overtime reference, payroll readiness, security control, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-TCI-001** | System shall integrate with physical and digital time clock sources.                                                                                         |
| **HRM-TCI-002** | System shall support biometric terminals, card readers, RFID devices, kiosk clocks, web clocks, and mobile clocks where enabled.                             |
| **HRM-TCI-003** | System shall maintain time clock device records.                                                                                                             |
| **HRM-TCI-004** | System shall capture device ID, device name, device type, location, status, and last sync timestamp.                                                         |
| **HRM-TCI-005** | System shall map device user IDs, badge IDs, biometric IDs, or clock IDs to employee records.                                                                |
| **HRM-TCI-006** | System shall capture clock-in and clock-out punch records.                                                                                                   |
| **HRM-TCI-007** | System shall capture break start and break end punch records where enabled.                                                                                  |
| **HRM-TCI-008** | System shall support automated punch data synchronization.                                                                                                   |
| **HRM-TCI-009** | System shall support manual attendance data import where required.                                                                                           |
| **HRM-TCI-010** | System shall support API-based attendance data ingestion where enabled.                                                                                      |
| **HRM-TCI-011** | System shall support scheduled sync from external time clock systems.                                                                                        |
| **HRM-TCI-012** | System shall support offline punch synchronization from devices that temporarily lose connection.                                                            |
| **HRM-TCI-013** | System shall prevent duplicate punch records from repeated sync.                                                                                             |
| **HRM-TCI-014** | System shall validate punch records against active employee status.                                                                                          |
| **HRM-TCI-015** | System shall validate punch records against employee-device mapping.                                                                                         |
| **HRM-TCI-016** | System shall classify punch records as clock-in, clock-out, break-in, break-out, transfer punch, or correction punch.                                        |
| **HRM-TCI-017** | System shall detect missing punch records.                                                                                                                   |
| **HRM-TCI-018** | System shall detect duplicate punch records.                                                                                                                 |
| **HRM-TCI-019** | System shall detect abnormal punch records such as early clock-in, late clock-in, early clock-out, and unmatched punch.                                      |
| **HRM-TCI-020** | System shall match punch records against assigned shift schedules where available.                                                                           |
| **HRM-TCI-021** | System shall expose validated punch records to Leave & Attendance Management.                                                                                |
| **HRM-TCI-022** | System shall expose actual work-hour records to Overtime Management for overtime validation.                                                                 |
| **HRM-TCI-023** | System shall expose approved attendance outcomes to Payroll Processing through Leave & Attendance Management.                                                |
| **HRM-TCI-024** | System shall support correction workflow for invalid, missing, duplicate, or unmatched punch records.                                                        |
| **HRM-TCI-025** | System shall restrict punch record correction to authorized users.                                                                                           |
| **HRM-TCI-026** | System shall support device sync monitoring and failure alerts.                                                                                              |
| **HRM-TCI-027** | System shall restrict device configuration and integration credentials to authorized administrators.                                                         |
| **HRM-TCI-028** | System shall provide time clock reports by employee, device, location, department, date, exception type, and sync status.                                    |
| **HRM-TCI-029** | System shall maintain raw punch records separately from approved attendance outcomes.                                                                        |
| **HRM-TCI-030** | System shall maintain audit trail for device setup, employee mapping, punch capture, sync, import, validation, correction, deletion, and exception handling. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                      |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Time clock device can be registered with device ID, device type, location, status, and sync configuration.                               |
|   2 | Employee can be mapped to device user ID, badge ID, biometric ID, or clock ID.                                                           |
|   3 | Clock-in and clock-out punch records can be captured from connected devices.                                                             |
|   4 | Break start and break end punch records can be captured where enabled.                                                                   |
|   5 | Attendance punch data can be synchronized automatically.                                                                                 |
|   6 | Attendance punch data can be imported manually where required.                                                                           |
|   7 | API-based punch ingestion can be supported where enabled.                                                                                |
|   8 | Offline punch records can be synchronized after device reconnection.                                                                     |
|   9 | Duplicate punch records are prevented or flagged.                                                                                        |
|  10 | Punch records are validated against active employee records.                                                                             |
|  11 | Punch records are validated against employee-device mapping.                                                                             |
|  12 | Punch records are classified as clock-in, clock-out, break-in, break-out, transfer, or correction punch.                                 |
|  13 | Missing punch records are flagged.                                                                                                       |
|  14 | Unmatched punch records are flagged.                                                                                                     |
|  15 | Early clock-in, late clock-in, and early clock-out are flagged based on policy reference.                                                |
|  16 | Punch records can be matched against assigned shift schedules.                                                                           |
|  17 | Validated punch records are available to Leave & Attendance Management.                                                                  |
|  18 | Actual work-hour records are available to Overtime Management for overtime validation.                                                   |
|  19 | Raw punch records are preserved separately from approved attendance outcomes.                                                            |
|  20 | Invalid or missing punch records can be corrected only by authorized users.                                                              |
|  21 | Device sync failures generate alerts for responsible administrators.                                                                     |
|  22 | Time clock reports can be generated by employee, device, location, department, date, exception, and sync status.                         |
|  23 | Unauthorized users cannot modify device configuration, employee-device mapping, or punch records.                                        |
|  24 | Every device setup, mapping, punch capture, sync, import, validation, correction, deletion, and exception action creates an audit event. |
