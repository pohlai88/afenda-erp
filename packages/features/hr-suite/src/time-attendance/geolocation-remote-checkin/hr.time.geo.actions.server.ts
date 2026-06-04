"use server";

import { revalidatePath } from "next/cache";

import { decideHrGeoException, submitHrGeoException } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import {
  registerHrGeoDeviceCommand,
  updateHrGeoDeviceStatusCommand,
  upsertHrGeoCheckinPolicyCommand,
  upsertHrGeoEligibilityRuleCommand,
  upsertHrGeoGeofenceCommand,
  HrGeoCommandError,
} from "./hrs-hr-time-geo-admin-server";
import { submitHrGeoRemoteCheckinCapture } from "./hrs-hr-time-geo-capture-server";
import {
  requireHrGeoEmployeeCapture,
  requireHrGeoWrite,
} from "./hr.time.geo-access.policy.server";
import { hrGeoRoutePaths } from "./hr.time.geo-route.contract";
import {
  captureHrGeoRemoteCheckinSchema,
  decideHrGeoExceptionSchema,
  submitHrGeoExceptionSchema,
} from "./hr.time.geo-capture.schema";
import {
  registerHrGeoDeviceSchema,
  updateHrGeoDeviceStatusSchema,
  upsertHrGeoCheckinPolicySchema,
  upsertHrGeoEligibilityRuleSchema,
  upsertHrGeoGeofenceSchema,
} from "./hr.time.geo-admin.schema";
import type { z } from "zod";

export async function captureHrGeoRemoteCheckinAction(
  input: z.infer<typeof captureHrGeoRemoteCheckinSchema>,
) {
  const parsed = captureHrGeoRemoteCheckinSchema.parse(input);
  const guard = await requireHrGeoEmployeeCapture();

  const result = await submitHrGeoRemoteCheckinCapture({
    organizationId: guard.organization.id,
    employeeId: guard.selfEmployeeId,
    actorAuthUserId: guard.session.id,
    action: parsed.action,
    capturedAt: new Date(parsed.capturedAt),
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    accuracyMeters: parsed.accuracyMeters,
    deviceFingerprint: parsed.deviceFingerprint,
    deviceReference: parsed.deviceReference,
    projectSiteRef: parsed.projectSiteRef,
    clientSiteRef: parsed.clientSiteRef,
    selfieBlobUrl: parsed.selfieBlobUrl,
    mockProvider: parsed.mockProvider,
    idempotencyKey: parsed.idempotencyKey,
  });

  revalidatePath(hrGeoRoutePaths.hub);
  return result;
}

export async function submitHrGeoExceptionAction(
  input: z.infer<typeof submitHrGeoExceptionSchema>,
) {
  const parsed = submitHrGeoExceptionSchema.parse(input);
  const guard = await requireHrGeoEmployeeCapture();

  const result = await submitHrGeoException({
    organizationId: guard.organization.id,
    rawCheckinId: parsed.rawCheckinId,
    employeeId: guard.selfEmployeeId,
    submissionReason: parsed.submissionReason,
    actorAuthUserId: guard.session.id,
  });

  revalidatePath(hrGeoRoutePaths.hub);
  return result;
}

export async function decideHrGeoExceptionAction(
  input: z.infer<typeof decideHrGeoExceptionSchema>,
) {
  const parsed = decideHrGeoExceptionSchema.parse(input);
  const guard = await requireHrGeoWrite();

  const result = await decideHrGeoException({
    organizationId: guard.organization.id,
    exceptionId: parsed.exceptionId,
    decision: parsed.decision,
    decisionReason: parsed.decisionReason,
    actorAuthUserId: guard.session.id,
  });

  revalidatePath(hrGeoRoutePaths.hub);
  return result;
}

export async function decideHrGeoExceptionFormAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = decideHrGeoExceptionSchema.safeParse({
    exceptionId: formData.get("exceptionId"),
    decision: formData.get("decision"),
    decisionReason: formData.get("decisionReason")?.toString(),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await decideHrGeoExceptionAction(parsed.data);
    return { ok: true, data: undefined };
  } catch (error) {
    return toGeoAdminActionFailure(error);
  }
}

function toGeoAdminActionFailure(error: unknown): ActionResult<never> {
  if (error instanceof HrGeoCommandError) {
    return actionFailure(error.code);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("hr_geo_action_failed");
}

/** HRM-GEO-004/005 — upsert approved geofence (admin). */
export async function upsertHrGeoGeofenceAction(
  input: z.infer<typeof upsertHrGeoGeofenceSchema>,
): Promise<ActionResult<{ geofenceId: string }>> {
  const parsed = upsertHrGeoGeofenceSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const guard = await requireHrGeoWrite();
    const result = await upsertHrGeoGeofenceCommand({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrGeoRoutePaths.hub);
    return { ok: true, data: result };
  } catch (error) {
    return toGeoAdminActionFailure(error);
  }
}

/** HRM-GEO-008 — upsert remote check-in policy (admin). */
export async function upsertHrGeoCheckinPolicyAction(
  input: z.infer<typeof upsertHrGeoCheckinPolicySchema>,
): Promise<ActionResult<{ policyId: string; policyGroupCode: string }>> {
  const parsed = upsertHrGeoCheckinPolicySchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const guard = await requireHrGeoWrite();
    const result = await upsertHrGeoCheckinPolicyCommand({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrGeoRoutePaths.hub);
    return { ok: true, data: result };
  } catch (error) {
    return toGeoAdminActionFailure(error);
  }
}

/** HRM-GEO-009 — upsert scoped eligibility rule (admin). */
export async function upsertHrGeoEligibilityRuleAction(
  input: z.infer<typeof upsertHrGeoEligibilityRuleSchema>,
): Promise<ActionResult<{ ruleId: string }>> {
  const parsed = upsertHrGeoEligibilityRuleSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const guard = await requireHrGeoWrite();
    const result = await upsertHrGeoEligibilityRuleCommand({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrGeoRoutePaths.hub);
    return { ok: true, data: result };
  } catch (error) {
    return toGeoAdminActionFailure(error);
  }
}

/** HRM-GEO-010 — register employee device (admin). */
export async function registerHrGeoDeviceAction(
  input: z.infer<typeof registerHrGeoDeviceSchema>,
): Promise<ActionResult<{ deviceId: string }>> {
  const parsed = registerHrGeoDeviceSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const guard = await requireHrGeoWrite();
    const result = await registerHrGeoDeviceCommand({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrGeoRoutePaths.hub);
    return { ok: true, data: result };
  } catch (error) {
    return toGeoAdminActionFailure(error);
  }
}

/** HRM-GEO-010/011 — suspend or revoke registered device (admin). */
export async function updateHrGeoDeviceStatusAction(
  input: z.infer<typeof updateHrGeoDeviceStatusSchema>,
): Promise<ActionResult<{ deviceId: string }>> {
  const parsed = updateHrGeoDeviceStatusSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const guard = await requireHrGeoWrite();
    const result = await updateHrGeoDeviceStatusCommand({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrGeoRoutePaths.hub);
    return { ok: true, data: result };
  } catch (error) {
    return toGeoAdminActionFailure(error);
  }
}
