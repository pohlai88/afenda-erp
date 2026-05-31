import { createEntityId } from "@afenda/db";

import type { HrPayrollAdjustmentRecord } from "../schemas/hr.payroll.processing-adjustment.schema";
import type { HrPayrollInputStagingRow } from "../schemas/hr.payroll.processing-input-staging.schema";
import type { HrPayrollValidationResult } from "../schemas/hr.payroll.processing-validation.schema";

type OrgPayrollRunStore = {
  adjustments: HrPayrollAdjustmentRecord[];
  stagedInputs: HrPayrollInputStagingRow[];
  lastValidation: HrPayrollValidationResult | null;
};

const storeByOrg = new Map<string, Map<string, OrgPayrollRunStore>>();

function getRunStore(organizationId: string, payrollRunId: string): OrgPayrollRunStore {
  let orgStore = storeByOrg.get(organizationId);
  if (!orgStore) {
    orgStore = new Map();
    storeByOrg.set(organizationId, orgStore);
  }
  let runStore = orgStore.get(payrollRunId);
  if (!runStore) {
    runStore = {
      adjustments: [],
      stagedInputs: [],
      lastValidation: null,
    };
    orgStore.set(payrollRunId, runStore);
  }
  return runStore;
}

export function insertHrPayrollAdjustmentRecord(input: {
  organizationId: string;
  createdByUserId: string;
  adjustment: Omit<
    HrPayrollAdjustmentRecord,
    "id" | "organizationId" | "status" | "createdAt" | "createdByUserId" | "appliedAt"
  >;
}): HrPayrollAdjustmentRecord {
  const runStore = getRunStore(input.organizationId, input.adjustment.payrollRunId);
  const requiresApproval =
    input.adjustment.kind === "manual" ||
    input.adjustment.kind === "retroactive";
  const record: HrPayrollAdjustmentRecord = {
    ...input.adjustment,
    id: createEntityId("hr_pay_adj"),
    organizationId: input.organizationId,
    status: requiresApproval && !input.adjustment.approvalReference
      ? "pending_approval"
      : "approved",
    createdAt: new Date(),
    createdByUserId: input.createdByUserId,
    appliedAt: null,
  };
  runStore.adjustments.unshift(record);
  return record;
}

export function listHrPayrollAdjustmentsForRun(input: {
  organizationId: string;
  payrollRunId: string;
  limit?: number;
}): readonly HrPayrollAdjustmentRecord[] {
  const runStore = getRunStore(input.organizationId, input.payrollRunId);
  const limit = input.limit ?? 100;
  return runStore.adjustments.slice(0, limit);
}

export function countHrPayrollPendingAdjustments(input: {
  organizationId: string;
  payrollRunId: string;
}): number {
  const runStore = getRunStore(input.organizationId, input.payrollRunId);
  return runStore.adjustments.filter((a) => a.status === "pending_approval")
    .length;
}

export function replaceHrPayrollStagedInputs(input: {
  organizationId: string;
  payrollRunId: string;
  rows: readonly HrPayrollInputStagingRow[];
}): { importedCount: number } {
  const runStore = getRunStore(input.organizationId, input.payrollRunId);
  runStore.stagedInputs = [...input.rows];
  return { importedCount: input.rows.length };
}

export function listHrPayrollStagedInputs(input: {
  organizationId: string;
  payrollRunId: string;
  limit?: number;
}): readonly HrPayrollInputStagingRow[] {
  const runStore = getRunStore(input.organizationId, input.payrollRunId);
  return runStore.stagedInputs.slice(0, input.limit ?? 200);
}

export function saveHrPayrollValidationResult(
  result: HrPayrollValidationResult,
): HrPayrollValidationResult {
  const runStore = getRunStore(result.organizationId, result.payrollRunId);
  runStore.lastValidation = result;
  return result;
}

export function getHrPayrollLastValidationResult(input: {
  organizationId: string;
  payrollRunId: string;
}): HrPayrollValidationResult | null {
  const runStore = getRunStore(input.organizationId, input.payrollRunId);
  return runStore.lastValidation;
}

/** Test-only reset. */
export function resetHrPayrollProcessingStoreForTests(): void {
  storeByOrg.clear();
}
