"use server";

import { hrSuiteActionFailure } from "../../employee-management/compliance-regulatory-tracking/server";
import {
  emitHrIndustryFrmAuditEvent,
  getHrIndustryFrmStore,
  listHrIndustryFrmAttendanceOutcomeRefs,
  listHrIndustryFrmOvertimeWorkHourRefs,
  listHrIndustryFrmPayrollReferences,
} from "./hr.industry.frm-store.shared";
import { hrIndustryFrmAuditActions } from "../events";
import {
  requireHrIndustryFrmApprove,
  requireHrIndustryFrmRead,
  requireHrIndustryFrmWrite,
} from "./hr.industry.frm-access.policy.server";
import type {
  HrFrmAssignmentInput,
  HrFrmMobileAttendanceInput,
  HrFrmOfflineSyncInput,
  HrFrmPerDiemReferenceInput,
  HrFrmTravelStatusInput,
} from "../schemas";

type AssignmentActionInput = Omit<
  HrFrmAssignmentInput,
  "id" | "organizationId"
>;
type MobileAttendanceActionInput = Omit<
  HrFrmMobileAttendanceInput,
  "id" | "organizationId"
>;
type OfflineSyncActionInput = Omit<
  HrFrmOfflineSyncInput,
  "id" | "organizationId"
>;
type TravelStatusActionInput = Omit<
  HrFrmTravelStatusInput,
  "id" | "organizationId" | "status"
>;
type PerDiemActionInput = Omit<
  HrFrmPerDiemReferenceInput,
  "id" | "organizationId" | "approvalStatus"
>;

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrIndustryFrmWorkbenchAction() {
  try {
    const guard = await requireHrIndustryFrmRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Field Workforce.",
      "hr.frm.refresh_failed",
    );
  }
}

export async function createHrIndustryFrmAssignmentAction(
  input: AssignmentActionInput,
) {
  try {
    const guard = await requireHrIndustryFrmWrite();
    const store = getHrIndustryFrmStore(guard.organization.id);
    const row: HrFrmAssignmentInput = {
      ...input,
      id: `assign-field-${store.assignments.length + 1}`,
      organizationId: guard.organization.id,
    };
    store.assignments.unshift(row);
    emitHrIndustryFrmAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFrmAuditActions.assignmentCreated,
      actorId: guard.session.id,
      targetType: "assignment",
      targetId: row.id,
      summary: `Created field assignment for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create field assignment.",
      "hr.frm.assignment_create_failed",
    );
  }
}

export async function captureHrIndustryFrmMobileAttendanceAction(
  input: MobileAttendanceActionInput,
) {
  try {
    const guard = await requireHrIndustryFrmWrite();
    const store = getHrIndustryFrmStore(guard.organization.id);
    const row: HrFrmMobileAttendanceInput = {
      ...input,
      id: `att-field-${store.mobileAttendance.length + 1}`,
      organizationId: guard.organization.id,
    };
    store.mobileAttendance.unshift(row);
    emitHrIndustryFrmAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        row.eventType === "clock_out" || row.eventType === "offline_clock_out"
          ? hrIndustryFrmAuditActions.mobileCheckOutCaptured
          : hrIndustryFrmAuditActions.mobileCheckInCaptured,
      actorId: guard.session.id,
      targetType: "attendance",
      targetId: row.id,
      summary: `Captured ${row.eventType} for ${row.employeeDisplayName}.`,
    });
    emitHrIndustryFrmAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFrmAuditActions.gpsValidationReferenced,
      actorId: guard.session.id,
      targetType: "gps_validation",
      targetId: row.gpsValidationRef,
      summary: `Referenced GPS validation ${row.gpsValidationResult}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to capture mobile attendance.",
      "hr.frm.mobile_attendance_failed",
    );
  }
}

export async function reconcileHrIndustryFrmOfflineSyncAction(
  input: OfflineSyncActionInput,
) {
  try {
    const guard = await requireHrIndustryFrmWrite();
    const store = getHrIndustryFrmStore(guard.organization.id);
    const row: HrFrmOfflineSyncInput = {
      ...input,
      id: `sync-field-${store.offlineSync.length + 1}`,
      organizationId: guard.organization.id,
      status: "reconciled",
      syncedAt: input.syncedAt ?? new Date().toISOString(),
    };
    store.offlineSync.unshift(row);
    emitHrIndustryFrmAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFrmAuditActions.offlineSyncReconciled,
      actorId: guard.session.id,
      targetType: "offline_sync",
      targetId: row.id,
      summary: `Reconciled offline record for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to reconcile offline attendance.",
      "hr.frm.offline_reconcile_failed",
    );
  }
}

export async function approveHrIndustryFrmTravelAction(
  input: TravelStatusActionInput,
) {
  try {
    const guard = await requireHrIndustryFrmApprove();
    const store = getHrIndustryFrmStore(guard.organization.id);
    const row: HrFrmTravelStatusInput = {
      ...input,
      id: `travel-field-${store.travelStatuses.length + 1}`,
      organizationId: guard.organization.id,
      status: "approved",
      approvalRef: input.approvalRef ?? `travel-approval-${Date.now()}`,
    };
    store.travelStatuses.unshift(row);
    emitHrIndustryFrmAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFrmAuditActions.travelApproved,
      actorId: guard.session.id,
      targetType: "approval",
      targetId: row.approvalRef ?? row.id,
      summary: `Approved travel for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to approve field travel.",
      "hr.frm.travel_approval_failed",
    );
  }
}

export async function approveHrIndustryFrmPerDiemAction(
  input: PerDiemActionInput,
) {
  try {
    const guard = await requireHrIndustryFrmApprove();
    const store = getHrIndustryFrmStore(guard.organization.id);
    const row: HrFrmPerDiemReferenceInput = {
      ...input,
      id: `perdiem-field-${store.perDiemReferences.length + 1}`,
      organizationId: guard.organization.id,
      approvalStatus: "approved",
    };
    store.perDiemReferences.unshift(row);
    emitHrIndustryFrmAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFrmAuditActions.perDiemReferenced,
      actorId: guard.session.id,
      targetType: "per_diem",
      targetId: row.id,
      summary: `Approved per diem reference for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to approve per diem reference.",
      "hr.frm.per_diem_approval_failed",
    );
  }
}

export async function exportHrIndustryFrmIntegrationRefsAction() {
  try {
    const guard = await requireHrIndustryFrmRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Field Workforce integration export access is required.",
        "hr.frm.integration_forbidden",
      );
    }
    const store = getHrIndustryFrmStore(guard.organization.id);
    return {
      ok: true as const,
      data: {
        attendance: listHrIndustryFrmAttendanceOutcomeRefs(store),
        overtime: listHrIndustryFrmOvertimeWorkHourRefs(store),
        payroll: listHrIndustryFrmPayrollReferences(store),
      },
    };
  } catch {
    return actionFailure(
      "Unable to export field workforce integration refs.",
      "hr.frm.integration_export_failed",
    );
  }
}
