# Time Clock Integration

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

# Validation pipeline (TCI-014–020, 024–025, 029)

After ingest (`ingestHrTimeClockPunchBatch`), each inserted raw punch runs `runHrTimeClockPunchValidationPipeline`:

1. **TCI-014** — `hr_employees.employment_status` must be in `active`, `probation`, `confirmed`, or `notice_period`; otherwise `invalid_employee`.
2. **TCI-015** — resolve `hr_time_clock_employee_mappings` (or flag `unmapped_device`).
3. **TCI-016** — classify via device alias + same-day sequence (`classifyHrTimeClockPunchSequence`).
4. **TCI-017–019** — persist flags in `hr_time_clock_punch_exceptions` (`missing_punch`, `duplicate`, `early_in`, `late_in`, `early_out`, `unmatched`).
5. **TCI-020** — shift match: `hr_shift_assignments` when scheduled; else `hr_attendance_policies.standardStartMinutes` / `standardEndMinutes` (see `matchHrTimeClockPunchToShift`).
6. Update `hr_time_clock_raw_punches.validation_status` (`pending` → `valid` | `invalid` | `duplicate` | `unmatched`).

**TCI-024/025** — corrections use `hr.timeClock.write`; `createHrTimeClockCorrectionPunch` inserts `punch_type=correction` linked via `raw_payload.correctedRawPunchId`.

**TCI-029** — `promoteValidatedHrTimeClockPunchToLam` writes `hr_attendance_records` with `source=time_clock` and idempotency `time_clock:{rawPunchId}`; raw rows stay in `hr_time_clock_raw_punches`.

---

# Enterprise Acceptance Criteria

|  No. | Acceptance Criteria                                                                                                                      |
| ---: | ---------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | Time clock device can be registered with device ID, device type, location, status, and sync configuration.                               |
|    2 | Employee can be mapped to device user ID, badge ID, biometric ID, or clock ID.                                                           |
|    3 | Clock-in and clock-out punch records can be captured from connected devices.                                                             |
|    4 | Break start and break end punch records can be captured where enabled.                                                                   |
|    5 | Attendance punch data can be synchronized automatically.                                                                                 |
|    6 | Attendance punch data can be imported manually where required.                                                                           |
|    7 | API-based punch ingestion can be supported where enabled.                                                                                |
|    8 | Offline punch records can be synchronized after device reconnection.                                                                     |
|    9 | Duplicate punch records are prevented or flagged.                                                                                        |
|   10 | Punch records are validated against active employee records.                                                                             |
|   11 | Punch records are validated against employee-device mapping.                                                                             |
|   12 | Punch records are classified as clock-in, clock-out, break-in, break-out, transfer, or correction punch.                                 |
|   13 | Missing punch records are flagged.                                                                                                       |
|   14 | Unmatched punch records are flagged.                                                                                                     |
|   15 | Early clock-in, late clock-in, and early clock-out are flagged based on policy reference.                                                |
|   16 | Punch records can be matched against assigned shift schedules.                                                                           |
|   17 | Validated punch records are available to Leave & Attendance Management.                                                                  |
|   18 | Actual work-hour records are available to Overtime Management for overtime validation.                                                   |
|   19 | Raw punch records are preserved separately from approved attendance outcomes.                                                            |
|   20 | Invalid or missing punch records can be corrected only by authorized users.                                                              |
|   21 | Device sync failures generate alerts for responsible administrators.                                                                     |
|   22 | Time clock reports can be generated by employee, device, location, department, date, exception, and sync status.                         |
|   23 | Unauthorized users cannot modify device configuration, employee-device mapping, or punch records.                                        |
|   24 | Every device setup, mapping, punch capture, sync, import, validation, correction, deletion, and exception action creates an audit event. |

---

## As-built summary (code-verified)

Governed workbench ships at **`/hr/time-clock`** via `apps/erp/src/lib/hr-sections/time-clock.server.tsx` → `@afenda/feature-hr-suite` slice `time-attendance/time-clock-integration`.

| Layer | Location |
| ----- | -------- |
| Schema | `packages/db/src/schema/hr-time-clock.ts` |
| Query windows | `packages/db/src/hr-time-clock-*.ts` |
| Page model | `data/hr.time.clock-integration.page-model.server.ts` (`Promise.all`) |
| Surfaces | `surface/hr.time.clock-integration-*-list.surface.ts` |
| Integration read models | `data/hr.time.clock-integration-{lam-export,overtime-refs,payroll-refs,sync-alerts}.shared.server.ts` |
| Reports CSV | `actions/hr.time.clock-integration.actions.server.ts` + `HrTimeClockReportsExportPanel` |
| Capabilities | `hr.timeClock.read`, `hr.timeClock.write`, `hr.timeClock.admin` |

Pattern B overview stats (`hr.time.clock-integration.overview.stats`) cover device count, active devices, open exceptions, failed sync batches, valid punches (24h), and pending validation.

### HRM-TCI shipment matrix (001–030)

| Code | Status | Notes |
| ---- | ------ | ----- |
| HRM-TCI-001 | Shipped | Multi-source device types in schema + registry |
| HRM-TCI-002 | Shipped | Biometric, card, RFID, kiosk, web, mobile, desktop enums |
| HRM-TCI-003 | Shipped | Device registry list + commands |
| HRM-TCI-004 | Shipped | Device columns include type, location, status, last sync |
| HRM-TCI-005 | Shipped | Employee mapping list + admin policy |
| HRM-TCI-006 | Shipped | Raw punch list |
| HRM-TCI-007 | Shipped | Break punch types in schema |
| HRM-TCI-008 | Shipped | Sync batch ledger |
| HRM-TCI-009 | Deferred | Manual import UI (schema hooks only) |
| HRM-TCI-010 | Deferred | API ingest route (future slice) |
| HRM-TCI-011 | Shipped | Sync config on devices + batch window |
| HRM-TCI-012 | Deferred | Offline replay workflow |
| HRM-TCI-013 | Shipped | Idempotency key on raw punches |
| HRM-TCI-014 | Shipped | Validation status + exception codes |
| HRM-TCI-015 | Shipped | Mapping validation via DB layer |
| HRM-TCI-016 | Shipped | Punch type enum |
| HRM-TCI-017 | Shipped | Missing punch exception code |
| HRM-TCI-018 | Shipped | Duplicate exception code |
| HRM-TCI-019 | Shipped | Early/late/unmatched exception codes |
| HRM-TCI-020 | Deferred | Shift match (depends on shift-scheduling) |
| HRM-TCI-021 | Shipped | LAM export list + `listHrTimeClockValidatedPunchesForLamWindow` |
| HRM-TCI-022 | Shipped | Overtime refs list from validated punch pairs |
| HRM-TCI-023 | Shipped | Payroll refs via LAM computed/locked attendance days |
| HRM-TCI-024 | Deferred | Correction workflow UI |
| HRM-TCI-025 | Shipped | Admin/write capability gates |
| HRM-TCI-026 | Shipped | Failed sync alerts + sync batch list + overview stat |
| HRM-TCI-027 | Shipped | `requireHrTimeClockAdmin` for device/mapping mutations |
| HRM-TCI-028 | Shipped | Reports list + CSV export panel |
| HRM-TCI-029 | Shipped | Raw punch list separate from LAM/payroll refs |
| HRM-TCI-030 | Shipped | Audit trail list + `hr_time_clock_audit_events` |
