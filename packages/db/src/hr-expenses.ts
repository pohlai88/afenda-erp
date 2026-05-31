import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { registerTenantDocument } from "./erp";
import { appendHrExpenseAuditEventInTx } from "./hr-expense-audit";
import { HrExpenseCommandError } from "./hr-expense.shared";
import {
  buildExpenseReceiptFingerprint,
  detectDuplicateClaims,
  resolveExpenseEligibilityFromRules,
  sumExpenseClaimsForPeriod,
  validateClaimPolicy,
  type HrExpenseClaimCategory,
  type HrExpenseDuplicateCandidateRow,
  type HrExpenseDuplicateDetectionResult,
  type HrExpenseEligibilityContext,
  type HrExpenseEligibilityResult,
  type HrExpenseEligibilityRuleRow,
  type HrExpensePolicyHeaderRow,
  type HrExpensePolicyValidationResult,
} from "./hr-expenses.shared";
import { createEntityId } from "./ids";
import {
  hrExpenseClaimReceipts,
  hrExpenseClaims,
  hrExpenseEligibilityRules,
  hrExpensePolicies,
  hrExpensePolicyCategoryRules,
} from "./schema/hr-expense";
import { hrEmployees } from "./schema/hr";

export {
  buildExpenseReceiptFingerprint,
  detectDuplicateClaims,
  expenseMatchesEligibilityRule,
  expenseRuleSpecificityScore,
  HRM_EXP_CLAIM_CATEGORIES,
  resolveExpenseEligibilityForSubmit,
  resolveExpenseEligibilityFromRules,
  sumExpenseClaimsForPeriod,
  validateClaimPolicy,
  validateEligibility,
} from "./hr-expenses.shared";

export type {
  HrExpenseClaimCategory,
  HrExpenseClaimPolicyInput,
  HrExpenseDuplicateCandidateRow,
  HrExpenseDuplicateDetectionResult,
  HrExpenseDuplicateMatch,
  HrExpenseEligibilityContext,
  HrExpenseEligibilityResult,
  HrExpenseEligibilityRuleRow,
  HrExpensePolicyCategoryRuleRow,
  HrExpensePolicyHeaderRow,
  HrExpensePolicyValidationResult,
  HrExpensePolicyViolationCode,
} from "./hr-expenses.shared";

function parseClaimAmountCents(value: string | null): number {
  if (!value) {
    return 0;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.round(amount * 100);
}

function resolveClaimExpenseDate(input: {
  primaryExpenseDate: Date | null;
  periodStart: Date | null;
  createdAt: Date;
}): Date {
  return input.primaryExpenseDate ?? input.periodStart ?? input.createdAt;
}

export async function loadHrExpensePolicyHeader(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<HrExpensePolicyHeaderRow | null> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [policy] = await db
      .select({
        id: hrExpensePolicies.id,
        policyGroupCode: hrExpensePolicies.policyGroupCode,
        maxClaimAmountCents: hrExpensePolicies.maxClaimAmountCents,
      })
      .from(hrExpensePolicies)
      .where(
        and(
          eq(hrExpensePolicies.organizationId, input.organizationId),
          eq(hrExpensePolicies.policyGroupCode, policyGroupCode),
          eq(hrExpensePolicies.active, true),
        ),
      )
      .limit(1);

    if (!policy) {
      return null;
    }

    const categoryRules = await db
      .select({
        category: hrExpensePolicyCategoryRules.categoryCode,
        mandatoryReceipt: hrExpensePolicyCategoryRules.mandatoryReceipt,
        perClaimLimitCents: hrExpensePolicyCategoryRules.perClaimLimitCents,
        dailyLimitCents: hrExpensePolicyCategoryRules.dailyLimitCents,
        monthlyLimitCents: hrExpensePolicyCategoryRules.monthlyLimitCents,
      })
      .from(hrExpensePolicyCategoryRules)
      .where(
        and(
          eq(hrExpensePolicyCategoryRules.organizationId, input.organizationId),
          eq(hrExpensePolicyCategoryRules.policyId, policy.id),
        ),
      );

    return {
      policyGroupCode: policy.policyGroupCode,
      maxClaimAmountCents: policy.maxClaimAmountCents,
      categoryRules: categoryRules.map((rule) => ({
        category: rule.category as HrExpenseClaimCategory,
        mandatoryReceipt: rule.mandatoryReceipt,
        perClaimLimitCents: rule.perClaimLimitCents,
        dailyLimitCents: rule.dailyLimitCents,
        monthlyLimitCents: rule.monthlyLimitCents,
      })),
    };
  });
}

export async function listHrExpenseEligibilityRules(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<HrExpenseEligibilityRuleRow[]> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrExpenseEligibilityRules.id,
        policyGroupCode: hrExpenseEligibilityRules.policyGroupCode,
        category: hrExpenseEligibilityRules.categoryCode,
        legalEntityCode: hrExpenseEligibilityRules.legalEntityCode,
        workLocationCode: hrExpenseEligibilityRules.workLocationCode,
        departmentId: hrExpenseEligibilityRules.departmentId,
        grade: hrExpenseEligibilityRules.grade,
        employmentType: hrExpenseEligibilityRules.employmentType,
        employeeCategory: hrExpenseEligibilityRules.employeeCategory,
        eligible: hrExpenseEligibilityRules.eligible,
        requiresExceptionApproval:
          hrExpenseEligibilityRules.requiresExceptionApproval,
        effectiveFrom: hrExpenseEligibilityRules.effectiveFrom,
        effectiveTo: hrExpenseEligibilityRules.effectiveTo,
      })
      .from(hrExpenseEligibilityRules)
      .where(
        and(
          eq(hrExpenseEligibilityRules.organizationId, input.organizationId),
          eq(hrExpenseEligibilityRules.policyGroupCode, policyGroupCode),
        ),
      );

    return rows.map((row) => ({
      ...row,
      category: row.category as HrExpenseClaimCategory | null,
    }));
  });
}

export async function loadHrExpenseEmployeeContext(input: {
  organizationId: string;
  employeeId: string;
}): Promise<{
  legalEntityCode: string | null;
  workLocationCode: string | null;
  departmentId: string | null;
  grade: string | null;
  employmentType: string | null;
  employeeCategory: string | null;
} | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        departmentId: hrEmployees.currentDepartmentId,
        grade: hrEmployees.grade,
        employmentType: hrEmployees.employmentType,
        employeeCategory: hrEmployees.workerCategory,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    return employee ?? null;
  });
}

export async function validateHrExpenseClaimPolicy(input: {
  organizationId: string;
  employeeId: string;
  claimId: string;
  policyGroupCode?: string;
}): Promise<HrExpensePolicyValidationResult> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [claim] = await db
      .select({
        id: hrExpenseClaims.id,
        categoryCode: hrExpenseClaims.categoryCode,
        claimAmount: hrExpenseClaims.claimAmount,
        primaryExpenseDate: hrExpenseClaims.primaryExpenseDate,
        periodStart: hrExpenseClaims.periodStart,
        createdAt: hrExpenseClaims.createdAt,
        claimStatus: hrExpenseClaims.claimStatus,
        policyGroupCode: hrExpenseClaims.policyGroupCode,
      })
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.id, input.claimId),
          eq(hrExpenseClaims.employeeId, input.employeeId),
        ),
      )
      .limit(1);

    if (!claim) {
      throw new HrExpenseCommandError("claim_not_found");
    }

    const [receiptCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(hrExpenseClaimReceipts)
      .where(
        and(
          eq(hrExpenseClaimReceipts.organizationId, input.organizationId),
          eq(hrExpenseClaimReceipts.claimId, claim.id),
        ),
      );

    const policy = await loadHrExpensePolicyHeader({
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode ?? claim.policyGroupCode,
    });

    const expenseDate = resolveClaimExpenseDate({
      primaryExpenseDate: claim.primaryExpenseDate,
      periodStart: claim.periodStart,
      createdAt: claim.createdAt,
    });

    const peerClaims = await db
      .select({
        claimId: hrExpenseClaims.id,
        category: hrExpenseClaims.categoryCode,
        amountCents: sql<number>`0`,
        expenseDate: hrExpenseClaims.primaryExpenseDate,
        periodStart: hrExpenseClaims.periodStart,
        createdAt: hrExpenseClaims.createdAt,
        claimAmount: hrExpenseClaims.claimAmount,
        status: hrExpenseClaims.claimStatus,
      })
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.employeeId, input.employeeId),
          eq(hrExpenseClaims.categoryCode, claim.categoryCode),
        ),
      );

    const periodTotals = sumExpenseClaimsForPeriod({
      claims: peerClaims.map((row) => ({
        claimId: row.claimId,
        category: row.category as HrExpenseClaimCategory,
        amountCents: parseClaimAmountCents(row.claimAmount),
        expenseDate: resolveClaimExpenseDate({
          primaryExpenseDate: row.expenseDate,
          periodStart: row.periodStart,
          createdAt: row.createdAt,
        }),
        status: row.status,
      })),
      category: claim.categoryCode as HrExpenseClaimCategory,
      expenseDate,
      excludeClaimId: claim.id,
    });

    return validateClaimPolicy({
      policy,
      claim: {
        category: claim.categoryCode as HrExpenseClaimCategory,
        amountCents: parseClaimAmountCents(claim.claimAmount),
        expenseDate,
        receiptCount: receiptCountRow?.count ?? 0,
      },
      employeePeriodTotals: periodTotals,
    });
  });
}

export async function validateHrExpenseEligibilityForClaim(input: {
  organizationId: string;
  employeeId: string;
  category: HrExpenseClaimCategory;
  policyGroupCode?: string;
  asOf?: Date;
  eligibilityExceptionReason?: string | null;
}): Promise<HrExpenseEligibilityResult> {
  const employee = await loadHrExpenseEmployeeContext({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });

  if (!employee) {
    throw new HrExpenseCommandError("employee_not_found");
  }

  const rules = await listHrExpenseEligibilityRules({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });

  const context: HrExpenseEligibilityContext = {
    category: input.category,
    legalEntityCode: employee.legalEntityCode,
    workLocationCode: employee.workLocationCode,
    departmentId: employee.departmentId,
    grade: employee.grade,
    employmentType: employee.employmentType,
    employeeCategory: employee.employeeCategory,
    asOf: input.asOf ?? new Date(),
  };

  const result = resolveExpenseEligibilityFromRules({ rules, context });

  if (
    !result.eligible &&
    result.requiresExceptionApproval &&
    input.eligibilityExceptionReason?.trim()
  ) {
    return {
      ...result,
      eligible: true,
      reason: "Authorized expense eligibility override",
    };
  }

  return result;
}

export async function detectHrExpenseDuplicateClaims(input: {
  organizationId: string;
  claimId: string;
}): Promise<HrExpenseDuplicateDetectionResult> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [claim] = await db
      .select({
        id: hrExpenseClaims.id,
        employeeId: hrExpenseClaims.employeeId,
        claimNumber: hrExpenseClaims.claimNumber,
        primaryExpenseDate: hrExpenseClaims.primaryExpenseDate,
        periodStart: hrExpenseClaims.periodStart,
        createdAt: hrExpenseClaims.createdAt,
        claimAmount: hrExpenseClaims.claimAmount,
        merchantName: hrExpenseClaims.merchantName,
        claimStatus: hrExpenseClaims.claimStatus,
      })
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.id, input.claimId),
        ),
      )
      .limit(1);

    if (!claim) {
      throw new HrExpenseCommandError("claim_not_found");
    }

    const expenseDate = resolveClaimExpenseDate({
      primaryExpenseDate: claim.primaryExpenseDate,
      periodStart: claim.periodStart,
      createdAt: claim.createdAt,
    });

    const receipts = await db
      .select({ fingerprint: hrExpenseClaimReceipts.receiptFingerprint })
      .from(hrExpenseClaimReceipts)
      .where(
        and(
          eq(hrExpenseClaimReceipts.organizationId, input.organizationId),
          eq(hrExpenseClaimReceipts.claimId, claim.id),
        ),
      );

    const candidates = await db
      .select({
        claimId: hrExpenseClaims.id,
        claimNumber: hrExpenseClaims.claimNumber,
        claimStatus: hrExpenseClaims.claimStatus,
        primaryExpenseDate: hrExpenseClaims.primaryExpenseDate,
        periodStart: hrExpenseClaims.periodStart,
        createdAt: hrExpenseClaims.createdAt,
        claimAmount: hrExpenseClaims.claimAmount,
        merchantName: hrExpenseClaims.merchantName,
      })
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.employeeId, claim.employeeId),
          ne(hrExpenseClaims.id, claim.id),
        ),
      );

    const candidateIds = candidates.map((row) => row.claimId);
    const receiptRows =
      candidateIds.length === 0
        ? []
        : await db
            .select({
              claimId: hrExpenseClaimReceipts.claimId,
              fingerprint: hrExpenseClaimReceipts.receiptFingerprint,
            })
            .from(hrExpenseClaimReceipts)
            .where(
              and(
                eq(hrExpenseClaimReceipts.organizationId, input.organizationId),
                inArray(hrExpenseClaimReceipts.claimId, candidateIds),
              ),
            );

    const fingerprintsByClaim = new Map<string, string[]>();
    for (const row of receiptRows) {
      const existing = fingerprintsByClaim.get(row.claimId) ?? [];
      existing.push(row.fingerprint);
      fingerprintsByClaim.set(row.claimId, existing);
    }

    const candidateRows: HrExpenseDuplicateCandidateRow[] = candidates.map(
      (row) => ({
        claimId: row.claimId,
        claimReference: row.claimNumber,
        status: row.claimStatus,
        expenseDate: resolveClaimExpenseDate({
          primaryExpenseDate: row.primaryExpenseDate,
          periodStart: row.periodStart,
          createdAt: row.createdAt,
        }),
        amountCents: parseClaimAmountCents(row.claimAmount),
        merchantName: row.merchantName,
        receiptFingerprints: fingerprintsByClaim.get(row.claimId) ?? [],
      }),
    );

    return detectDuplicateClaims({
      claimId: claim.id,
      claimReference: claim.claimNumber,
      expenseDate,
      amountCents: parseClaimAmountCents(claim.claimAmount),
      merchantName: claim.merchantName,
      receiptFingerprints: receipts.map((row) => row.fingerprint),
      candidates: candidateRows,
    });
  });
}

export async function attachHrExpenseClaimReceipt(input: {
  organizationId: string;
  claimId: string;
  employeeId: string;
  uploadedByAuthUserId: string;
  kind: (typeof hrExpenseClaimReceipts.$inferInsert)["kind"];
  title: string;
  blobUrl: string;
  pathname?: string | null;
  contentType: string;
  sizeBytes: number;
  blobEtag?: string | null;
  lineItemId?: string | null;
  receiptDate?: Date | null;
  merchantName?: string | null;
  amountCents?: number | null;
  currencyCode?: string | null;
  externalReference?: string | null;
  registerErpDocument?: boolean;
}): Promise<{ receiptId: string; documentId: string | null }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [claim] = await db
      .select({
        id: hrExpenseClaims.id,
        employeeId: hrExpenseClaims.employeeId,
        claimStatus: hrExpenseClaims.claimStatus,
      })
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.id, input.claimId),
          eq(hrExpenseClaims.employeeId, input.employeeId),
        ),
      )
      .limit(1);

    if (!claim) {
      throw new HrExpenseCommandError("claim_not_found");
    }

    if (claim.claimStatus !== "draft" && claim.claimStatus !== "returned") {
      throw new HrExpenseCommandError("invalid_claim_status");
    }

    const fingerprint = buildExpenseReceiptFingerprint({
      blobUrl: input.blobUrl,
      blobEtag: input.blobEtag,
      pathname: input.pathname,
    });

    const [existingFingerprint] = await db
      .select({ id: hrExpenseClaimReceipts.id })
      .from(hrExpenseClaimReceipts)
      .where(
        and(
          eq(hrExpenseClaimReceipts.organizationId, input.organizationId),
          eq(hrExpenseClaimReceipts.claimId, input.claimId),
          eq(hrExpenseClaimReceipts.receiptFingerprint, fingerprint),
        ),
      )
      .limit(1);

    if (existingFingerprint) {
      throw new HrExpenseCommandError("receipt_already_attached");
    }

    let documentId: string | null = null;
    if (input.registerErpDocument !== false && input.pathname?.trim()) {
      documentId = await registerTenantDocument({
        organizationId: input.organizationId,
        moduleId: "hr",
        ownerEntityId: input.claimId,
        title: input.title.trim(),
        blobUrl: input.blobUrl.trim(),
        pathname: input.pathname.trim(),
        contentType: input.contentType.trim(),
        sizeBytes: input.sizeBytes,
        access: "private",
        blobEtag: input.blobEtag ?? null,
        uploadedByAuthUserId: input.uploadedByAuthUserId,
        metadata: {
          source: "hr-expense-receipt",
          claimId: input.claimId,
          kind: input.kind,
        },
      });
    }

    const receiptId = createEntityId("hr_exp_rcp");
    await db.insert(hrExpenseClaimReceipts).values({
      id: receiptId,
      organizationId: input.organizationId,
      claimId: input.claimId,
      lineItemId: input.lineItemId ?? null,
      kind: input.kind,
      title: input.title.trim(),
      erpDocumentId: documentId,
      blobUrl: input.blobUrl.trim(),
      contentType: input.contentType.trim(),
      sizeBytes: input.sizeBytes,
      receiptFingerprint: fingerprint,
      receiptDate: input.receiptDate ?? null,
      merchantName: input.merchantName?.trim() || null,
      amountCents: input.amountCents ?? null,
      currencyCode: input.currencyCode?.trim().toUpperCase() || null,
      externalReference: input.externalReference?.trim() || null,
      uploadedByAuthUserId: input.uploadedByAuthUserId,
    });

    await appendHrExpenseAuditEventInTx(db, {
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: input.employeeId,
      action: "hr.expense.receipt.upload",
      actorUserId: input.uploadedByAuthUserId,
      summary: `Attached ${input.kind} to expense claim`,
      metadata: {
        receiptId,
        documentId,
        fingerprint,
      },
    });

    return { receiptId, documentId };
  });
}

export async function upsertHrExpensePolicyCategoryRule(input: {
  organizationId: string;
  policyGroupCode?: string;
  category: HrExpenseClaimCategory;
  mandatoryReceipt: boolean;
  perClaimLimitCents?: number | null;
  dailyLimitCents?: number | null;
  monthlyLimitCents?: number | null;
}): Promise<{ ruleId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    let [policy] = await db
      .select({ id: hrExpensePolicies.id })
      .from(hrExpensePolicies)
      .where(
        and(
          eq(hrExpensePolicies.organizationId, input.organizationId),
          eq(hrExpensePolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    if (!policy) {
      const policyId = createEntityId("hr_exp_pol");
      await db.insert(hrExpensePolicies).values({
        id: policyId,
        organizationId: input.organizationId,
        policyGroupCode,
        name: "Default expense policy",
        active: true,
      });
      policy = { id: policyId };
    }

    const [existing] = await db
      .select({ id: hrExpensePolicyCategoryRules.id })
      .from(hrExpensePolicyCategoryRules)
      .where(
        and(
          eq(hrExpensePolicyCategoryRules.organizationId, input.organizationId),
          eq(hrExpensePolicyCategoryRules.policyId, policy.id),
          eq(hrExpensePolicyCategoryRules.categoryCode, input.category),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrExpensePolicyCategoryRules)
        .set({
          mandatoryReceipt: input.mandatoryReceipt,
          perClaimLimitCents: input.perClaimLimitCents ?? null,
          dailyLimitCents: input.dailyLimitCents ?? null,
          monthlyLimitCents: input.monthlyLimitCents ?? null,
        })
        .where(eq(hrExpensePolicyCategoryRules.id, existing.id));

      return { ruleId: existing.id };
    }

    const ruleId = createEntityId("hr_exp_pcr");
    await db.insert(hrExpensePolicyCategoryRules).values({
      id: ruleId,
      organizationId: input.organizationId,
      policyId: policy.id,
      categoryCode: input.category,
      mandatoryReceipt: input.mandatoryReceipt,
      perClaimLimitCents: input.perClaimLimitCents ?? null,
      dailyLimitCents: input.dailyLimitCents ?? null,
      monthlyLimitCents: input.monthlyLimitCents ?? null,
    });

    return { ruleId };
  });
}
