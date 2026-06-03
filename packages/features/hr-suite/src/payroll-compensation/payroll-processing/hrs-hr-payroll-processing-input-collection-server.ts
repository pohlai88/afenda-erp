import {
  listHrBenefitPayrollDeductionRefs,
  listHrBonusPayrollPayoutRefs,
  listHrCompensationPayrollRefs,
  listHrUnpaidLeavePayrollDeductionRefs,
} from "@afenda/db";
import { createEntityId } from "@afenda/db";

import { listApprovedBonusPayrollPayoutRefs } from "../_integration/payroll-bonus-payouts.server";
import { listHrTimeClockPayrollReferenceRows } from "../../time-attendance/time-clock-integration/hr.time.clock-integration-payroll-refs.shared.server";
import type { HrPayrollInputSource } from "./hr.payroll.processing-constants.shared";
import type { HrPayrollInputStagingRow } from "./hr.payroll.processing-input-staging.schema";
import {
  listHrPayrollStagedInputs,
  replaceHrPayrollStagedInputs,
} from "./hr.payroll.processing-store.shared";

export type CollectHrPayrollInputsInput = {
  organizationId: string;
  payrollRunId: string;
  periodStart: Date;
  periodEnd: Date;
  sources?: readonly HrPayrollInputSource[];
  limitPerSource?: number;
};

function defaultSources(): readonly HrPayrollInputSource[] {
  return [
    "attendance",
    "leave",
    "claims",
    "benefits",
    "commissions",
    "employee_records",
  ];
}

/** HRM-PAY-016 — ingest approved upstream payroll inputs. */
export async function collectHrPayrollApprovedInputs(
  input: CollectHrPayrollInputsInput,
): Promise<readonly HrPayrollInputStagingRow[]> {
  const sources = new Set(input.sources ?? defaultSources());
  const limit = input.limitPerSource ?? 200;
  const rows: HrPayrollInputStagingRow[] = [];
  const importedAt = new Date();

  if (sources.has("attendance")) {
    const attendance = await listHrTimeClockPayrollReferenceRows({
      organizationId: input.organizationId,
      limit,
    });
    for (const row of attendance) {
      rows.push({
        id: createEntityId("hr_pay_in"),
        organizationId: input.organizationId,
        payrollRunId: input.payrollRunId,
        source: "attendance",
        externalReference: row.payrollReference ?? row.id,
        employeeId: row.employeeId,
        employeeLabel: row.employeeDisplayName,
        effectiveDate: row.workDate,
        status: "imported",
        importedAt,
        metadata: {
          attendanceStatus: row.attendanceStatus,
          sourceModule: "hr.time.clock-integration",
        },
      });
    }
  }

  if (sources.has("leave")) {
    const leaveRefs = await listHrUnpaidLeavePayrollDeductionRefs({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      limit,
    });
    for (const row of leaveRefs) {
      rows.push({
        id: createEntityId("hr_pay_in"),
        organizationId: input.organizationId,
        payrollRunId: input.payrollRunId,
        source: "leave",
        externalReference: row.payrollDeductionReference,
        employeeId: row.employeeId,
        employeeLabel: row.employeeDisplayName,
        amount: row.durationDays,
        effectiveDate: row.startAt,
        status: "imported",
        importedAt,
        metadata: {
          requestId: row.requestId,
          sourceModule: "hr.leave",
        },
      });
    }
  }

  if (sources.has("benefits")) {
    const benefitRefs = await listHrBenefitPayrollDeductionRefs({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      limit,
    });
    for (const row of benefitRefs) {
      rows.push({
        id: createEntityId("hr_pay_in"),
        organizationId: input.organizationId,
        payrollRunId: input.payrollRunId,
        source: "benefits",
        externalReference: row.payrollDeductionReference,
        employeeId: row.employeeId,
        employeeLabel: row.employeeDisplayName,
        amount: row.amount,
        earningsOrDeductionCode: row.deductionCode,
        effectiveDate: row.effectiveFrom,
        status: "imported",
        importedAt,
        metadata: {
          planCode: row.planCode,
          sourceModule: "hr.payroll.benefits",
        },
      });
    }
  }

  if (sources.has("commissions")) {
    const bonusRefs = await listApprovedBonusPayrollPayoutRefs({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      limit,
    });
    for (const row of bonusRefs) {
      rows.push({
        id: createEntityId("hr_pay_in"),
        organizationId: input.organizationId,
        payrollRunId: input.payrollRunId,
        source: "commissions",
        externalReference: row.payrollPayoutReference,
        employeeId: row.employeeId,
        employeeLabel: row.employeeLabel,
        amount: row.amount,
        currencyCode: row.currencyCode,
        earningsOrDeductionCode: row.earningsCode,
        effectiveDate: row.payoutDueAt ?? input.periodEnd,
        status: row.syncedAt ? "acknowledged" : "imported",
        importedAt,
        metadata: {
          payoutId: row.payoutId,
          planCode: row.planCode,
          sourceModule: "hr.payroll.bonus",
        },
      });
    }

    const dbBonusRefs = await listHrBonusPayrollPayoutRefs({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      limit,
    });
    const seen = new Set(rows.map((r) => r.externalReference));
    for (const row of dbBonusRefs) {
      if (seen.has(row.payrollPayoutReference)) continue;
      rows.push({
        id: createEntityId("hr_pay_in"),
        organizationId: input.organizationId,
        payrollRunId: input.payrollRunId,
        source: "commissions",
        externalReference: row.payrollPayoutReference,
        employeeId: row.employeeId,
        employeeLabel: row.employeeLabel,
        amount: row.amount,
        currencyCode: row.currencyCode,
        earningsOrDeductionCode: row.earningsCode,
        status: row.syncedAt ? "acknowledged" : "imported",
        importedAt,
        metadata: { payoutId: row.payoutId, sourceModule: "hr.payroll.bonus" },
      });
    }
  }

  if (sources.has("employee_records")) {
    const compRefs = await listHrCompensationPayrollRefs({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      limit,
    });
    for (const row of compRefs) {
      rows.push({
        id: createEntityId("hr_pay_in"),
        organizationId: input.organizationId,
        payrollRunId: input.payrollRunId,
        source: "employee_records",
        externalReference: row.payrollReferenceCode,
        employeeId: row.employeeId,
        amount: String(row.amountDelta),
        effectiveDate: row.effectiveDate,
        status: row.syncStatus === "pending" ? "imported" : "acknowledged",
        importedAt,
        metadata: {
          syncStatus: row.syncStatus,
          sourceModule: "hr.compensation.planning",
        },
      });
    }
  }

  if (sources.has("claims")) {
    // Expense claims stage via payroll port when approved; no list API yet — placeholder contract hook.
    void input;
  }

  return rows;
}

export async function importHrPayrollInputsForRun(
  input: CollectHrPayrollInputsInput,
): Promise<{ importedCount: number; rows: readonly HrPayrollInputStagingRow[] }> {
  const rows = await collectHrPayrollApprovedInputs(input);
  const { importedCount } = replaceHrPayrollStagedInputs({
    organizationId: input.organizationId,
    payrollRunId: input.payrollRunId,
    rows,
  });
  return { importedCount, rows };
}

export function listHrPayrollInputStagingWindow(input: {
  organizationId: string;
  payrollRunId: string;
  limit?: number;
}): readonly HrPayrollInputStagingRow[] {
  return listHrPayrollStagedInputs(input);
}
