# RWS ↔ Shift Scheduling (SFT) coexistence

Retail Seasonal & Hourly Workforce Scheduling (RWS) owns **retail scope** — stores, schedule periods, coverage slots, labor demand/budget snapshots, and open-shift offers.

Shift Scheduling (SFT) owns **employee ↔ date shift truth** in `hrm_shift_*` tables.

## Delegation rules

| Concern | Owner | RWS usage |
| --- | --- | --- |
| Assign / conflict detect | SFT | `assignOneShift`, `detectShiftSchedulingConflicts`, `getOrCreateShiftSchedulingPolicy` |
| Roster publication row | SFT | `hrm_shift_roster_publication` inserted on `publishRetailSchedulePeriod` |
| Attendance compare | SFT | `compareScheduledVsAttendance`, `listSftAttendanceReconcileRowsForOrg` via `rws-integration.server.ts` |
| Payroll refs | SFT | `listShiftPayrollReferencesForPeriod` wrapped as `listRwsPayrollScheduleReferences` |
| Swap workflow | SFT UI | `/apps/hrm/shift-scheduling` linked from RWS swaps section |
| Open shift pickup | RWS + SFT | `hrm_rws_open_shift_offer` → `assignOneShift` → `hrm_rws_period_assignment_link` |

## Forbidden

- Duplicate writes to `hrm_shift_assignment` outside SFT assign paths (except period link metadata in `hrm_rws_period_assignment_link`).
- Re-implementing availability, swap approval, or coverage engines under RWS.

## Audit

RWS audit prefix: `erp.hrm.retail_schedule*` (see `rws.contract.ts`). SFT retains `erp.hrm.shift_schedule*`.
