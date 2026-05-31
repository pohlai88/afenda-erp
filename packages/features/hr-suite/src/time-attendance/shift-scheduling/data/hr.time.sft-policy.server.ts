import "@afenda/kernel/server";

import { eq } from "drizzle-orm";
import {
  hrShiftSchedulingPolicies,
  runWithOrganizationContext,
} from "@afenda/db";

import {
  DEFAULT_HR_SFT_SCHEDULING_POLICY,
  hrSftSchedulingPolicySchema,
  type HrSftSchedulingPolicy,
  type HrSftSchedulingPolicyRow,
} from "../schemas/hr.time.sft-policy.schema";

function parsePolicyRow(row: {
  minRestHoursBetweenShifts: string;
  maxWeeklyScheduledHours: string;
  swapRequestsEnabled: boolean;
  employeeScheduleChangeEnabled: boolean;
  validateAvailabilityOnAssign: boolean;
  validateLeaveConflictOnAssign: boolean;
}): HrSftSchedulingPolicy {
  return hrSftSchedulingPolicySchema.parse({
    minRestHoursBetweenShifts: Number(row.minRestHoursBetweenShifts),
    maxWeeklyScheduledHours: Number(row.maxWeeklyScheduledHours),
    swapRequestsEnabled: row.swapRequestsEnabled,
    employeeScheduleChangeEnabled: row.employeeScheduleChangeEnabled,
    validateAvailabilityOnAssign: row.validateAvailabilityOnAssign,
    validateLeaveConflictOnAssign: row.validateLeaveConflictOnAssign,
  });
}

/** HRM-SFT-014/015 — load org scheduling policy (defaults when unset). */
export async function getHrSftSchedulingPolicy(input: {
  organizationId: string;
}): Promise<HrSftSchedulingPolicy> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrShiftSchedulingPolicies)
      .where(
        eq(hrShiftSchedulingPolicies.organizationId, input.organizationId),
      )
      .limit(1);

    if (!row) {
      return DEFAULT_HR_SFT_SCHEDULING_POLICY;
    }

    return parsePolicyRow(row);
  });
}

/** HRM-SFT-014/015 — load org scheduling policy row with metadata. */
export async function getHrSftSchedulingPolicyRow(input: {
  organizationId: string;
}): Promise<HrSftSchedulingPolicyRow> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrShiftSchedulingPolicies)
      .where(
        eq(hrShiftSchedulingPolicies.organizationId, input.organizationId),
      )
      .limit(1);

    if (!row) {
      return {
        organizationId: input.organizationId,
        ...DEFAULT_HR_SFT_SCHEDULING_POLICY,
        updatedByAuthUserId: null,
      };
    }

    return {
      organizationId: input.organizationId,
      ...parsePolicyRow(row),
      updatedByAuthUserId: row.updatedByAuthUserId,
      updatedAt: row.updatedAt,
    };
  });
}

/** HRM-SFT-014/015 — upsert org scheduling policy. */
export async function upsertHrSftSchedulingPolicy(input: {
  organizationId: string;
  policy: HrSftSchedulingPolicy;
  updatedByAuthUserId: string;
}): Promise<HrSftSchedulingPolicyRow> {
  const policy = hrSftSchedulingPolicySchema.parse(input.policy);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(hrShiftSchedulingPolicies)
      .values({
        organizationId: input.organizationId,
        minRestHoursBetweenShifts: String(policy.minRestHoursBetweenShifts),
        maxWeeklyScheduledHours: String(policy.maxWeeklyScheduledHours),
        swapRequestsEnabled: policy.swapRequestsEnabled,
        employeeScheduleChangeEnabled: policy.employeeScheduleChangeEnabled,
        validateAvailabilityOnAssign: policy.validateAvailabilityOnAssign,
        validateLeaveConflictOnAssign: policy.validateLeaveConflictOnAssign,
        updatedByAuthUserId: input.updatedByAuthUserId,
      })
      .onConflictDoUpdate({
        target: hrShiftSchedulingPolicies.organizationId,
        set: {
          minRestHoursBetweenShifts: String(policy.minRestHoursBetweenShifts),
          maxWeeklyScheduledHours: String(policy.maxWeeklyScheduledHours),
          swapRequestsEnabled: policy.swapRequestsEnabled,
          employeeScheduleChangeEnabled: policy.employeeScheduleChangeEnabled,
          validateAvailabilityOnAssign: policy.validateAvailabilityOnAssign,
          validateLeaveConflictOnAssign: policy.validateLeaveConflictOnAssign,
          updatedByAuthUserId: input.updatedByAuthUserId,
        },
      });

    return getHrSftSchedulingPolicyRow({ organizationId: input.organizationId });
  });
}
