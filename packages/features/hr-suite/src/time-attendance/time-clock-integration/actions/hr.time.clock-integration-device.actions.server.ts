"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import {
  registerHrTimeClockDeviceCommand,
  updateHrTimeClockDeviceCommand,
  HrTimeClockCommandError,
} from "../data/hr.time.clock-integration-devices.shared.server";
import {
  archiveHrTimeClockEmployeeMappingCommand,
  upsertHrTimeClockEmployeeMappingCommand,
} from "../data/hr.time.clock-integration-mappings.shared.server";
import { hrTimeClockRoutePaths } from "../contracts/hr.time.clock-integration.contract";
import { hrTimeClockAuditActions } from "../events/hr.time.clock-integration.event";
import {
  requireHrTimeClockAdmin,
} from "../policies/hr.time.clock-integration-access.policy.server";
import {
  archiveHrTimeClockEmployeeMappingSchema,
  upsertHrTimeClockEmployeeMappingSchema,
} from "../schemas/hr.time.clock-integration-mapping.schema";
import {
  registerHrTimeClockDeviceSchema,
  updateHrTimeClockDeviceSchema,
} from "../schemas/hr.time.clock-integration-device.schema";

function mapHrTimeClockCommandError(error: unknown): ActionResult {
  if (error instanceof HrTimeClockCommandError) {
    return actionFailure(error.code);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("hr_time_clock_mutation_failed");
}

async function finalizeHrTimeClockAdminMutation(
  organizationId: string,
  actorId: string,
  auditAction: string,
  run: () => Promise<unknown>,
): Promise<ActionResult> {
  try {
    const data = await run();
    await writeExecutionAuditEvent({
      organizationId,
      actorId,
      actorType: "user",
      action: auditAction,
      targetType: "hr_time_clock",
      targetId: organizationId,
      metadata: { data },
    });
    revalidatePath(hrTimeClockRoutePaths.hub);
    return actionSuccess();
  } catch (error) {
    return mapHrTimeClockCommandError(error);
  }
}

export async function registerHrTimeClockDeviceAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = registerHrTimeClockDeviceSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockAdmin();

  return finalizeHrTimeClockAdminMutation(
    guard.organization.id,
    guard.session.id,
    hrTimeClockAuditActions.device.registered,
    () =>
      registerHrTimeClockDeviceCommand({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        payload: parsed.data,
      }),
  );
}

export async function updateHrTimeClockDeviceAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = updateHrTimeClockDeviceSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockAdmin();

  return finalizeHrTimeClockAdminMutation(
    guard.organization.id,
    guard.session.id,
    hrTimeClockAuditActions.device.updated,
    () =>
      updateHrTimeClockDeviceCommand({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        payload: parsed.data,
      }),
  );
}

export async function upsertHrTimeClockEmployeeMappingAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = upsertHrTimeClockEmployeeMappingSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockAdmin();
  const auditAction = parsed.data.mappingId
    ? hrTimeClockAuditActions.mapping.updated
    : hrTimeClockAuditActions.mapping.created;

  return finalizeHrTimeClockAdminMutation(
    guard.organization.id,
    guard.session.id,
    auditAction,
    () =>
      upsertHrTimeClockEmployeeMappingCommand({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        payload: parsed.data,
      }),
  );
}

export async function archiveHrTimeClockEmployeeMappingAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = archiveHrTimeClockEmployeeMappingSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockAdmin();

  return finalizeHrTimeClockAdminMutation(
    guard.organization.id,
    guard.session.id,
    hrTimeClockAuditActions.mapping.archived,
    () =>
      archiveHrTimeClockEmployeeMappingCommand({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        payload: parsed.data,
      }),
  );
}
