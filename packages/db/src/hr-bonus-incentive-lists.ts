import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { clampPageSize, formatEmployeeLabel } from "./hr-benefits.shared";
import {
  hrBonusCycles,
  hrBonusDiscretionaryRecommendations,
  hrBonusGuaranteedRules,
  hrBonusManualAdjustments,
  hrBonusPerformanceMultipliers,
  hrBonusPlans,
  hrBonusProrations,
  hrBonusRecoveries,
} from "./hr-bonus-incentive";
import { hrDepartments, hrEmployees } from "./hr";

type ListWindow<T> = {
  rows: T[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function buildWindow<T>(
  rows: T[],
  pageSize: number,
  total: number,
  offset: number,
): ListWindow<T> {
  return {
    rows,
    pageSize,
    totalCount: total,
    hasNextPage: offset + rows.length < total,
  };
}

export async function listHrBonusGuaranteedRulesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<
  ListWindow<{
    id: string;
    planCode: string;
    planName: string;
    label: string;
    minimumAmount: string;
    currencyCode: string;
    active: boolean;
  }>
> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBonusGuaranteedRules.organizationId, input.organizationId),
    ];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusGuaranteedRules.label, pattern),
          ilike(hrBonusPlans.code, pattern),
          ilike(hrBonusPlans.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusGuaranteedRules)
      .innerJoin(hrBonusPlans, eq(hrBonusGuaranteedRules.planId, hrBonusPlans.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusGuaranteedRules.id,
        planCode: hrBonusPlans.code,
        planName: hrBonusPlans.name,
        label: hrBonusGuaranteedRules.label,
        minimumAmount: hrBonusGuaranteedRules.minimumAmount,
        currencyCode: hrBonusGuaranteedRules.currencyCode,
        active: hrBonusGuaranteedRules.active,
      })
      .from(hrBonusGuaranteedRules)
      .innerJoin(hrBonusPlans, eq(hrBonusGuaranteedRules.planId, hrBonusPlans.id))
      .where(whereClause)
      .orderBy(desc(hrBonusGuaranteedRules.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const total = Number(totalRow?.total ?? 0);
    return buildWindow(rows, pageSize, total, offset);
  });
}

export async function listHrBonusPerformanceMultipliersWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<
  ListWindow<{
    id: string;
    planCode: string;
    planName: string;
    scope: string;
    scopeLabel: string;
    multiplier: string;
    active: boolean;
    effectiveFrom: Date;
  }>
> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBonusPerformanceMultipliers.organizationId, input.organizationId),
    ];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusPlans.code, pattern),
          ilike(hrBonusPlans.name, pattern),
          ilike(hrBonusPerformanceMultipliers.scopeRef, pattern),
          ilike(hrDepartments.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusPerformanceMultipliers)
      .innerJoin(
        hrBonusPlans,
        eq(hrBonusPerformanceMultipliers.planId, hrBonusPlans.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrBonusPerformanceMultipliers.departmentId, hrDepartments.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusPerformanceMultipliers.id,
        planCode: hrBonusPlans.code,
        planName: hrBonusPlans.name,
        scope: hrBonusPerformanceMultipliers.scope,
        scopeRef: hrBonusPerformanceMultipliers.scopeRef,
        departmentName: hrDepartments.name,
        multiplier: hrBonusPerformanceMultipliers.multiplier,
        active: hrBonusPerformanceMultipliers.active,
        effectiveFrom: hrBonusPerformanceMultipliers.effectiveFrom,
      })
      .from(hrBonusPerformanceMultipliers)
      .innerJoin(
        hrBonusPlans,
        eq(hrBonusPerformanceMultipliers.planId, hrBonusPlans.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrBonusPerformanceMultipliers.departmentId, hrDepartments.id),
      )
      .where(whereClause)
      .orderBy(desc(hrBonusPerformanceMultipliers.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const total = Number(totalRow?.total ?? 0);
    return buildWindow(
      rows.map((row) => ({
        id: row.id,
        planCode: row.planCode,
        planName: row.planName,
        scope: row.scope,
        scopeLabel:
          row.scope === "company"
            ? "Company"
            : row.scope === "department"
              ? row.departmentName ?? row.scopeRef ?? "Department"
              : row.scopeRef ?? row.scope,
        multiplier: row.multiplier,
        active: row.active,
        effectiveFrom: row.effectiveFrom,
      })),
      pageSize,
      total,
      offset,
    );
  });
}

export async function listHrBonusProrationsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<
  ListWindow<{
    id: string;
    employeeLabel: string;
    planCode: string;
    cycleCode: string;
    reason: string;
    prorationFactor: string;
    periodStartAt: Date | null;
    periodEndAt: Date | null;
  }>
> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrBonusProrations.organizationId, input.organizationId)];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrBonusPlans.code, pattern),
          ilike(hrBonusCycles.code, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusProrations)
      .innerJoin(hrEmployees, eq(hrBonusProrations.employeeId, hrEmployees.id))
      .innerJoin(hrBonusPlans, eq(hrBonusProrations.planId, hrBonusPlans.id))
      .innerJoin(hrBonusCycles, eq(hrBonusProrations.cycleId, hrBonusCycles.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusProrations.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planCode: hrBonusPlans.code,
        cycleCode: hrBonusCycles.code,
        reason: hrBonusProrations.reason,
        prorationFactor: hrBonusProrations.prorationFactor,
        periodStartAt: hrBonusProrations.periodStartAt,
        periodEndAt: hrBonusProrations.periodEndAt,
      })
      .from(hrBonusProrations)
      .innerJoin(hrEmployees, eq(hrBonusProrations.employeeId, hrEmployees.id))
      .innerJoin(hrBonusPlans, eq(hrBonusProrations.planId, hrBonusPlans.id))
      .innerJoin(hrBonusCycles, eq(hrBonusProrations.cycleId, hrBonusCycles.id))
      .where(whereClause)
      .orderBy(desc(hrBonusProrations.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const total = Number(totalRow?.total ?? 0);
    return buildWindow(
      rows.map((row) => ({
        id: row.id,
        employeeLabel: formatEmployeeLabel(row),
        planCode: row.planCode,
        cycleCode: row.cycleCode,
        reason: row.reason,
        prorationFactor: row.prorationFactor,
        periodStartAt: row.periodStartAt,
        periodEndAt: row.periodEndAt,
      })),
      pageSize,
      total,
      offset,
    );
  });
}

export async function listHrBonusManualAdjustmentsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<
  ListWindow<{
    id: string;
    employeeLabel: string;
    planCode: string;
    adjustmentAmount: string;
    currencyCode: string;
    justification: string;
    approvalReference: string;
    status: string;
  }>
> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBonusManualAdjustments.organizationId, input.organizationId),
    ];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrBonusManualAdjustments.justification, pattern),
          ilike(hrBonusManualAdjustments.approvalReference, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusManualAdjustments)
      .innerJoin(hrEmployees, eq(hrBonusManualAdjustments.employeeId, hrEmployees.id))
      .innerJoin(hrBonusPlans, eq(hrBonusManualAdjustments.planId, hrBonusPlans.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusManualAdjustments.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planCode: hrBonusPlans.code,
        adjustmentAmount: hrBonusManualAdjustments.adjustmentAmount,
        currencyCode: hrBonusManualAdjustments.currencyCode,
        justification: hrBonusManualAdjustments.justification,
        approvalReference: hrBonusManualAdjustments.approvalReference,
        status: hrBonusManualAdjustments.status,
      })
      .from(hrBonusManualAdjustments)
      .innerJoin(hrEmployees, eq(hrBonusManualAdjustments.employeeId, hrEmployees.id))
      .innerJoin(hrBonusPlans, eq(hrBonusManualAdjustments.planId, hrBonusPlans.id))
      .where(whereClause)
      .orderBy(desc(hrBonusManualAdjustments.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const total = Number(totalRow?.total ?? 0);
    return buildWindow(
      rows.map((row) => ({
        id: row.id,
        employeeLabel: formatEmployeeLabel(row),
        planCode: row.planCode,
        adjustmentAmount: row.adjustmentAmount,
        currencyCode: row.currencyCode,
        justification: row.justification,
        approvalReference: row.approvalReference,
        status: row.status,
      })),
      pageSize,
      total,
      offset,
    );
  });
}

export async function listHrBonusDiscretionaryRecommendationsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<
  ListWindow<{
    id: string;
    employeeLabel: string;
    planCode: string | null;
    recommendedAmount: string;
    currencyCode: string;
    recommendationStatus: string;
    recommenderUserId: string;
  }>
> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(
        hrBonusDiscretionaryRecommendations.organizationId,
        input.organizationId,
      ),
    ];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrBonusDiscretionaryRecommendations.rationale, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusDiscretionaryRecommendations)
      .innerJoin(
        hrEmployees,
        eq(
          hrBonusDiscretionaryRecommendations.employeeId,
          hrEmployees.id,
        ),
      )
      .leftJoin(
        hrBonusPlans,
        eq(hrBonusDiscretionaryRecommendations.planId, hrBonusPlans.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusDiscretionaryRecommendations.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planCode: hrBonusPlans.code,
        recommendedAmount: hrBonusDiscretionaryRecommendations.recommendedAmount,
        currencyCode: hrBonusDiscretionaryRecommendations.currencyCode,
        recommendationStatus:
          hrBonusDiscretionaryRecommendations.recommendationStatus,
        recommenderUserId:
          hrBonusDiscretionaryRecommendations.recommenderUserId,
      })
      .from(hrBonusDiscretionaryRecommendations)
      .innerJoin(
        hrEmployees,
        eq(
          hrBonusDiscretionaryRecommendations.employeeId,
          hrEmployees.id,
        ),
      )
      .leftJoin(
        hrBonusPlans,
        eq(hrBonusDiscretionaryRecommendations.planId, hrBonusPlans.id),
      )
      .where(whereClause)
      .orderBy(desc(hrBonusDiscretionaryRecommendations.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const total = Number(totalRow?.total ?? 0);
    return buildWindow(
      rows.map((row) => ({
        id: row.id,
        employeeLabel: formatEmployeeLabel(row),
        planCode: row.planCode,
        recommendedAmount: row.recommendedAmount,
        currencyCode: row.currencyCode,
        recommendationStatus: row.recommendationStatus,
        recommenderUserId: row.recommenderUserId,
      })),
      pageSize,
      total,
      offset,
    );
  });
}

export async function listHrBonusRecoveriesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<
  ListWindow<{
    id: string;
    employeeLabel: string;
    recoveryKind: string;
    recoveryAmount: string;
    currencyCode: string;
    referenceCode: string;
    clawbackReference: string | null;
    recordedAt: Date;
  }>
> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrBonusRecoveries.organizationId, input.organizationId)];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrBonusRecoveries.referenceCode, pattern),
          ilike(hrBonusRecoveries.clawbackReference, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusRecoveries)
      .innerJoin(hrEmployees, eq(hrBonusRecoveries.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusRecoveries.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        recoveryKind: hrBonusRecoveries.recoveryKind,
        recoveryAmount: hrBonusRecoveries.recoveryAmount,
        currencyCode: hrBonusRecoveries.currencyCode,
        referenceCode: hrBonusRecoveries.referenceCode,
        clawbackReference: hrBonusRecoveries.clawbackReference,
        recordedAt: hrBonusRecoveries.recordedAt,
      })
      .from(hrBonusRecoveries)
      .innerJoin(hrEmployees, eq(hrBonusRecoveries.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrBonusRecoveries.recordedAt))
      .limit(pageSize)
      .offset(offset);

    const total = Number(totalRow?.total ?? 0);
    return buildWindow(
      rows.map((row) => ({
        id: row.id,
        employeeLabel: formatEmployeeLabel(row),
        recoveryKind: row.recoveryKind,
        recoveryAmount: row.recoveryAmount,
        currencyCode: row.currencyCode,
        referenceCode: row.referenceCode,
        clawbackReference: row.clawbackReference,
        recordedAt: row.recordedAt,
      })),
      pageSize,
      total,
      offset,
    );
  });
}
