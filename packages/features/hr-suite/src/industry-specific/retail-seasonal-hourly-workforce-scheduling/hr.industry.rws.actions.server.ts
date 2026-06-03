"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../employee-management/compliance-regulatory-tracking/server";
import {
  emitHrIndustryRwsAuditEvent,
  getHrIndustryRwsStore,
  listHrIndustryRwsAttendanceOutcomeRefs,
  listHrIndustryRwsCoverageGapRefs,
  listHrIndustryRwsIntegrationExposureRefs,
  listHrIndustryRwsOpenShiftEligibilityRefs,
  listHrIndustryRwsPayrollScheduleRefs,
} from "./hr.industry.rws-store.shared";
import { hrIndustryRwsAuditActions } from "../events";
import {
  requireHrIndustryRwsApprove,
  requireHrIndustryRwsRead,
  requireHrIndustryRwsWrite,
} from "./hr.industry.rws-access.policy.server";
import {
  hrRwsOpenShiftSchema,
  hrRwsRetailScheduleSchema,
  hrRwsShiftSwapRequestSchema,
  type HrRwsOpenShiftInput,
  type HrRwsRetailScheduleInput,
  type HrRwsShiftSwapRequestInput,
} from "../schemas";

type ScheduleDraftInput = Omit<
  HrRwsRetailScheduleInput,
  "id" | "organizationId" | "status"
>;
type OpenShiftInput = Omit<
  HrRwsOpenShiftInput,
  "id" | "organizationId" | "status"
>;
type SwapRequestInput = Omit<
  HrRwsShiftSwapRequestInput,
  "id" | "organizationId" | "status"
>;

const publishScheduleSchema = z.object({
  scheduleId: z.string().trim().min(1),
});

const claimOpenShiftSchema = z.object({
  openShiftId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  employeeDisplayName: z.string().trim().min(1),
});

const decideSwapSchema = z.object({
  swapId: z.string().trim().min(1),
  decision: z.enum(["approved", "rejected", "returned", "overridden"]),
  reason: z.string().trim().min(1),
});

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrIndustryRwsWorkbenchAction() {
  try {
    const guard = await requireHrIndustryRwsRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Retail Seasonal and Hourly Workforce Scheduling.",
      "hr.rws.refresh_failed",
    );
  }
}

export async function createHrIndustryRwsScheduleDraftAction(
  input: ScheduleDraftInput,
) {
  try {
    const guard = await requireHrIndustryRwsWrite();
    const store = getHrIndustryRwsStore(guard.organization.id);
    const row = hrRwsRetailScheduleSchema.parse({
      ...input,
      id: `rws-sch-${store.retailSchedules.length + 1}`,
      organizationId: guard.organization.id,
      status: "draft",
    });
    store.retailSchedules.unshift(row);
    emitHrIndustryRwsAuditEvent({
      store,
      action: hrIndustryRwsAuditActions.scheduleDraftCreated,
      actorId: guard.session.id,
      targetType: "schedule",
      targetId: row.id,
      summary: `Created draft schedule ${row.scheduleCode} for ${row.storeName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create retail schedule draft.",
      "hr.rws.schedule_create_failed",
    );
  }
}

export async function publishHrIndustryRwsScheduleAction(input: {
  readonly scheduleId: string;
}) {
  try {
    const parsed = publishScheduleSchema.parse(input);
    const guard = await requireHrIndustryRwsApprove();
    const store = getHrIndustryRwsStore(guard.organization.id);
    const schedule = store.retailSchedules.find(
      (row) => row.id === parsed.scheduleId,
    );
    if (!schedule) {
      return actionFailure(
        "Retail schedule was not found.",
        "hr.rws.schedule_missing",
      );
    }
    Object.assign(schedule, {
      ...schedule,
      status: "published",
      publishedAt: new Date().toISOString().slice(0, 10),
    } satisfies HrRwsRetailScheduleInput);
    emitHrIndustryRwsAuditEvent({
      store,
      action: hrIndustryRwsAuditActions.schedulePublished,
      actorId: guard.session.id,
      targetType: "schedule",
      targetId: schedule.id,
      summary: `Published schedule ${schedule.scheduleCode} for ${schedule.storeName}.`,
    });
    return { ok: true as const, data: schedule };
  } catch {
    return actionFailure(
      "Unable to publish retail schedule.",
      "hr.rws.schedule_publish_failed",
    );
  }
}

export async function createHrIndustryRwsOpenShiftAction(input: OpenShiftInput) {
  try {
    const guard = await requireHrIndustryRwsWrite();
    const store = getHrIndustryRwsStore(guard.organization.id);
    const row = hrRwsOpenShiftSchema.parse({
      ...input,
      id: `rws-open-${store.openShifts.length + 1}`,
      organizationId: guard.organization.id,
      status: "posted",
    });
    store.openShifts.unshift(row);
    emitHrIndustryRwsAuditEvent({
      store,
      action: hrIndustryRwsAuditActions.openShiftCreated,
      actorId: guard.session.id,
      targetType: "open_shift",
      targetId: row.id,
      summary: `Posted ${row.roleName} open shift for ${row.storeName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create retail open shift.",
      "hr.rws.open_shift_failed",
    );
  }
}

export async function claimHrIndustryRwsOpenShiftAction(input: {
  readonly openShiftId: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
}) {
  try {
    const parsed = claimOpenShiftSchema.parse(input);
    const guard = await requireHrIndustryRwsWrite();
    const store = getHrIndustryRwsStore(guard.organization.id);
    const shift = store.openShifts.find((row) => row.id === parsed.openShiftId);
    if (!shift) {
      return actionFailure(
        "Retail open shift was not found.",
        "hr.rws.open_shift_missing",
      );
    }
    if (!shift.eligibleEmployeeIds.includes(parsed.employeeId)) {
      return actionFailure(
        "Employee is not eligible for this open shift.",
        "hr.rws.open_shift_ineligible",
      );
    }
    Object.assign(shift, {
      ...shift,
      claimantEmployeeId: parsed.employeeId,
      claimantDisplayName: parsed.employeeDisplayName,
      status: shift.approvalRequired ? "pending_approval" : "claimed",
    } satisfies HrRwsOpenShiftInput);
    emitHrIndustryRwsAuditEvent({
      store,
      action: hrIndustryRwsAuditActions.openShiftClaimed,
      actorId: guard.session.id,
      targetType: "open_shift",
      targetId: shift.id,
      employeeId: parsed.employeeId,
      summary: `${parsed.employeeDisplayName} claimed open shift ${shift.id}.`,
    });
    return { ok: true as const, data: shift };
  } catch {
    return actionFailure(
      "Unable to claim retail open shift.",
      "hr.rws.open_shift_claim_failed",
    );
  }
}

export async function requestHrIndustryRwsShiftSwapAction(
  input: SwapRequestInput,
) {
  try {
    const guard = await requireHrIndustryRwsWrite();
    const store = getHrIndustryRwsStore(guard.organization.id);
    const row = hrRwsShiftSwapRequestSchema.parse({
      ...input,
      id: `rws-swap-${store.shiftSwapRequests.length + 1}`,
      organizationId: guard.organization.id,
      status: input.approvalWorkflowRef ? "pending_approval" : "requested",
    });
    store.shiftSwapRequests.unshift(row);
    emitHrIndustryRwsAuditEvent({
      store,
      action: hrIndustryRwsAuditActions.swapRequested,
      actorId: guard.session.id,
      targetType: "shift_swap",
      targetId: row.id,
      employeeId: row.requesterEmployeeId,
      summary: `${row.requesterDisplayName} requested shift swap with ${row.replacementDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to request retail shift swap.",
      "hr.rws.shift_swap_failed",
    );
  }
}

export async function decideHrIndustryRwsShiftSwapAction(input: {
  readonly swapId: string;
  readonly decision: "approved" | "rejected" | "returned" | "overridden";
  readonly reason: string;
}) {
  try {
    const parsed = decideSwapSchema.parse(input);
    const guard = await requireHrIndustryRwsApprove();
    const store = getHrIndustryRwsStore(guard.organization.id);
    const swap = store.shiftSwapRequests.find((row) => row.id === parsed.swapId);
    if (!swap) {
      return actionFailure(
        "Retail shift swap was not found.",
        "hr.rws.shift_swap_missing",
      );
    }

    const actionByDecision = {
      approved: hrIndustryRwsAuditActions.swapApproved,
      rejected: hrIndustryRwsAuditActions.swapRejected,
      returned: hrIndustryRwsAuditActions.swapReturned,
      overridden: hrIndustryRwsAuditActions.swapOverridden,
    } as const;

    Object.assign(swap, {
      ...swap,
      status: parsed.decision,
      decisionReason: parsed.reason,
      decidedBy: guard.session.id,
    } satisfies HrRwsShiftSwapRequestInput);
    emitHrIndustryRwsAuditEvent({
      store,
      action: actionByDecision[parsed.decision],
      actorId: guard.session.id,
      targetType: "shift_swap",
      targetId: swap.id,
      employeeId: swap.requesterEmployeeId,
      summary: `${formatDecision(parsed.decision)} shift swap ${swap.id}: ${parsed.reason}`,
    });
    return { ok: true as const, data: swap };
  } catch {
    return actionFailure(
      "Unable to decide retail shift swap.",
      "hr.rws.shift_swap_decision_failed",
    );
  }
}

function formatDecision(decision: string) {
  return decision.charAt(0).toUpperCase() + decision.slice(1).replace("_", " ");
}

export async function exportHrIndustryRwsIntegrationRefsAction() {
  try {
    const guard = await requireHrIndustryRwsRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Retail scheduling integration export access is required.",
        "hr.rws.integration_forbidden",
      );
    }
    const store = getHrIndustryRwsStore(guard.organization.id);
    return {
      ok: true as const,
      data: {
        openShiftEligibility: listHrIndustryRwsOpenShiftEligibilityRefs(store),
        coverageGaps: listHrIndustryRwsCoverageGapRefs(store),
        attendanceOutcomes: listHrIndustryRwsAttendanceOutcomeRefs(store),
        payrollReferences: listHrIndustryRwsPayrollScheduleRefs(store),
        integrationExposures: listHrIndustryRwsIntegrationExposureRefs(store),
      },
    };
  } catch {
    return actionFailure(
      "Unable to export retail scheduling integration references.",
      "hr.rws.integration_export_failed",
    );
  }
}
