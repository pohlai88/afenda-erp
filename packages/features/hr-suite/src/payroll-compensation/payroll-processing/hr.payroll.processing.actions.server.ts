"use server";

import { runWithOrganizationContext } from "@afenda/db";
import {
  approveHrPayrollRun,
  authorizeHrPayrollCorrection,
  calculateHrPayrollRun,
  createHrPayrollPaymentBatch,
  finalizeHrPayrollRun,
  generateHrPayrollJournalRef,
  generateHrPayrollPayslips,
  lockHrPayrollRun,
  listHrPayrollRuns,
  previewHrPayrollRun,
  submitHrPayrollRunForApproval,
  updateHrPayrollPaymentStatus,
  type HrPayrollRunCalculationResult,
} from "@afenda/db";

import { importHrPayrollInputsForRun } from "../data/hr.payroll.processing-input-collection.server";
import {
  approvePayrollRun,
  finalizePayrollRun,
  generatePayrollPreview,
  lockPayrollRun,
  submitPayrollForApproval,
} from "../data/hr.payroll.processing-workflow.server";
import { runHrPayrollProcessingValidation } from "../data/hr.payroll.processing-validation.server";
import {
  runHrPayrollValidationFormSchema,
} from "./hr.payroll.processing-validation.schema";
import {
  requireHrPayrollApprove,
  requireHrPayrollRead,
  requireHrPayrollWrite,
} from "./hr.payroll.processing-access.policy.server";
import {
  payrollApproveSchema,
  payrollCalculateSchema,
  payrollCorrectionSchema,
  payrollCreateRunSchema,
  payrollFinalizeSchema,
  payrollGeneratePayslipsSchema,
  payrollJournalSchema,
  payrollLockSchema,
  payrollPaymentBatchSchema,
  payrollPaymentStatusSchema,
  payrollPreviewSchema,
  payrollSubmitApprovalSchema,
} from "./hr.payroll.processing-mutation.schema";
import { z } from "zod";

const payrollCreatePayGroupSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(120),
  paySchedule: z.enum([
    "monthly",
    "weekly",
    "bi_weekly",
    "semi_monthly",
    "ad_hoc",
  ]),
  currencyCode: z.string().length(3).optional(),
});

const payrollCreateCycleSchema = z.object({
  payGroupId: z.string().min(1),
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(120),
  periodStartAt: z.coerce.date(),
  periodEndAt: z.coerce.date(),
  cutoffAt: z.coerce.date(),
  payDateAt: z.coerce.date(),
  currencyCode: z.string().length(3).optional(),
});

const payrollAssignEmployeeSchema = z.object({
  payrollGroupId: z.string().min(1),
  employeeId: z.string().min(1),
  effectiveFrom: z.coerce.date(),
});

const payrollAdjustmentSchema = z.object({
  payrollRunId: z.string().min(1),
  employeeId: z.string().min(1),
  kind: z.enum([
    "one_time_earning",
    "one_time_deduction",
    "manual",
    "proration",
    "retroactive",
  ]),
  earningsCode: z.string().min(1).max(64).default("ADJ"),
  amount: z.coerce.number().positive(),
  currencyCode: z.string().length(3).default("USD"),
  effectiveDate: z.coerce.date(),
  reason: z.string().min(3).max(500),
  approvalReference: z.string().optional(),
});

export async function createPayrollPayGroupAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollCreatePayGroupSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrPayrollGroupInTx } = await import("@afenda/db");
    return createHrPayrollGroupInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      code: parsed.code,
      name: parsed.name,
      paySchedule: parsed.paySchedule,
      currencyCode: parsed.currencyCode,
    });
  });
}

export async function createPayrollCycleAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollCreateCycleSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrPayrollCycleInTx } = await import("@afenda/db");
    return createHrPayrollCycleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      payGroupId: parsed.payGroupId,
      code: parsed.code,
      name: parsed.name,
      periodStartAt: parsed.periodStartAt,
      periodEndAt: parsed.periodEndAt,
      cutoffAt: parsed.cutoffAt,
      payDateAt: parsed.payDateAt,
      currencyCode: parsed.currencyCode,
    });
  });
}

export async function assignPayrollEmployeeAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollAssignEmployeeSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { assignHrPayrollGroupEmployeeInTx } = await import("@afenda/db");
    return assignHrPayrollGroupEmployeeInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      payrollGroupId: parsed.payrollGroupId,
      employeeId: parsed.employeeId,
      effectiveFrom: parsed.effectiveFrom,
    });
  });
}

export async function createPayrollRunAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollCreateRunSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrPayrollCycleInTx, createHrPayrollRunInTx } = await import(
      "@afenda/db"
    );
    const cycle = await createHrPayrollCycleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      payGroupId: parsed.payrollGroupId,
      code: parsed.runCode,
      name: parsed.runCode,
      periodStartAt: parsed.periodStart,
      periodEndAt: parsed.periodEnd,
      cutoffAt: parsed.cutoffDate,
      payDateAt: parsed.payDate,
    });
    return createHrPayrollRunInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      payrollCycleId: cycle.payrollCycleId,
    });
  });
}

export async function listPayrollRunsAction(input?: { search?: string }) {
  const guard = await requireHrPayrollRead();
  return listHrPayrollRuns({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    search: input?.search,
  });
}

export async function importPayrollInputsAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = z
    .object({
      payrollRunId: z.string().min(1),
      periodStart: z.coerce.date(),
      periodEnd: z.coerce.date(),
    })
    .parse(input);

  return importHrPayrollInputsForRun({
    organizationId: guard.organization.id,
    payrollRunId: parsed.payrollRunId,
    periodStart: parsed.periodStart,
    periodEnd: parsed.periodEnd,
  });
}

export async function createPayrollAdjustmentAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollAdjustmentSchema.parse(input);
  const { insertHrPayrollAdjustmentRecord } = await import(
    "../data/hr.payroll.processing-store.shared"
  );

  return insertHrPayrollAdjustmentRecord({
    organizationId: guard.organization.id,
    createdByUserId: guard.session.id,
    adjustment: {
      payrollRunId: parsed.payrollRunId,
      employeeId: parsed.employeeId,
      kind: parsed.kind,
      earningsCode: parsed.earningsCode,
      amount: parsed.amount.toFixed(2),
      currencyCode: parsed.currencyCode,
      effectiveDate: parsed.effectiveDate,
      reason: parsed.reason,
      approvalReference: parsed.approvalReference,
    },
  });
}

export async function validatePayrollRunAction(input: unknown) {
  const guard = await requireHrPayrollRead();
  const parsed = runHrPayrollValidationFormSchema.parse(input);
  return runHrPayrollProcessingValidation({
    organizationId: guard.organization.id,
    payrollRunId: parsed.payrollRunId,
    periodStart: parsed.periodStart,
    periodEnd: parsed.periodEnd,
    varianceThresholdPercent: parsed.varianceThresholdPercent,
  });
}

export async function calculatePayrollRunAction(
  input: unknown,
): Promise<HrPayrollRunCalculationResult> {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollCalculateSchema.parse(input);
  return calculateHrPayrollRun({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function previewPayrollRunAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollPreviewSchema.parse(input);
  return generatePayrollPreview({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function submitPayrollRunForApprovalAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollSubmitApprovalSchema.parse(input);
  return submitPayrollForApproval({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function approvePayrollRunAction(input: unknown) {
  const guard = await requireHrPayrollApprove();
  const parsed = payrollApproveSchema.parse(input);
  return approvePayrollRun({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function lockPayrollRunAction(input: unknown) {
  const guard = await requireHrPayrollApprove();
  const parsed = payrollLockSchema.parse(input);
  return lockPayrollRun({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function finalizePayrollRunAction(input: unknown) {
  const guard = await requireHrPayrollApprove();
  const parsed = payrollFinalizeSchema.parse(input);
  return finalizePayrollRun({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function generatePayrollPayslipsAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollGeneratePayslipsSchema.parse(input);
  return generateHrPayrollPayslips({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function createPayrollPaymentBatchAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollPaymentBatchSchema.parse(input);
  return createHrPayrollPaymentBatch({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function updatePayrollPaymentStatusAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollPaymentStatusSchema.parse(input);
  return updateHrPayrollPaymentStatus({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    paymentBatchId: parsed.paymentBatchId,
    paymentStatus: parsed.paymentStatus,
    employeeId: parsed.employeeId,
  });
}

export async function generatePayrollJournalAction(input: unknown) {
  const guard = await requireHrPayrollWrite();
  const parsed = payrollJournalSchema.parse(input);
  return generateHrPayrollJournalRef({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
  });
}

export async function authorizePayrollCorrectionAction(input: unknown) {
  const guard = await requireHrPayrollApprove();
  const parsed = payrollCorrectionSchema.parse(input);
  return authorizeHrPayrollCorrection({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payrollRunId: parsed.payrollRunId,
    correctionKind: parsed.correctionKind,
    reason: parsed.reason,
  });
}

// Re-export low-level DB workflow for tests/integration
export {
  calculateHrPayrollRun,
  previewHrPayrollRun,
  submitHrPayrollRunForApproval,
  approveHrPayrollRun,
  lockHrPayrollRun,
  finalizeHrPayrollRun,
};
