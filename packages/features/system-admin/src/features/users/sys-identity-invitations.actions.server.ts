"use server";

import { revokeOrganizationInvitation } from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability/server";
import { revalidatePath } from "next/cache";
import {
  assertSystemAdminFormActionResult,
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../tenant-execution/sys-action-result.contract";
import type { InviteMemberActionData } from "../memberships/sys-memberships-action-dtos.contract";
import { requireSystemAdminIdentityWrite } from "../overview/sys-capability.policy.server";
import { dispatchSystemAdminWebhook } from "../integrations/sys-webhook-dispatch.event";
import { systemAdminIdentityInvitationWebhookEvents } from "./sys-identity-invitations.event";
import { systemAdminInviteMemberActionSchema } from "../memberships/sys-memberships-action.schema";
import { assertSystemAdminUserCanBeInvited, createSystemAdminUserInvitation } from "./sys-users.query.server";

function revalidateSystemAdminIdentitySurfaces() {
  revalidatePath("/system-admin");
  revalidatePath("/system-admin/identity");
  revalidatePath("/system-admin/users");
  revalidatePath("/system-admin/memberships");
}

function logIdentityMutation(input: {
  operation: string;
  organizationId: string;
  userId: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
}) {
  logServerEvent(
    input.result === "success" ? "info" : "warn",
    `System admin identity mutation ${input.result}.`,
    {
      organizationId: input.organizationId,
      userId: input.userId,
      module: "system-admin",
      operation: input.operation,
    },
    input.metadata ?? {},
  );
}

export async function inviteMember(
  formData: FormData,
): Promise<SystemAdminActionResult<InviteMemberActionData>> {
  const { context, session, organization } = await requireSystemAdminIdentityWrite();

  const parsed = systemAdminInviteMemberActionSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "staff",
  });
  if (!parsed.success) {
    logIdentityMutation({
      operation: "identity.invite",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: { reason: "validation" },
    });
    return zodActionFailure(parsed.error);
  }

  try {
    await assertSystemAdminUserCanBeInvited({
      organizationId: organization.id,
      email: parsed.data.email,
    });

    const result = await createSystemAdminUserInvitation({
      organizationId: organization.id,
      email: parsed.data.email,
      role: parsed.data.role,
      actorAuthUserId: session.id,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: "system-admin.user.invite",
      targetType: "user_invitation",
      targetId: result.invitationId,
      metadata: {
        email: parsed.data.email,
        roleIds: [parsed.data.role],
        source: "identity.write",
      },
    });

    logIdentityMutation({
      operation: "identity.invite",
      organizationId: organization.id,
      userId: session.id,
      result: "success",
      metadata: { invitationId: result.invitationId, role: parsed.data.role },
    });
    await dispatchSystemAdminWebhook({
      organizationId: organization.id,
      userId: session.id,
      eventType: systemAdminIdentityInvitationWebhookEvents[0],
      payload: {
        invitationId: result.invitationId,
        email: parsed.data.email,
        role: parsed.data.role,
      },
    });

    revalidateSystemAdminIdentitySurfaces();
    return systemAdminActionSuccess(result);
  } catch (error) {
    logIdentityMutation({
      operation: "identity.invite",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Member invitation failed.",
    );
  }
}

export async function inviteMemberAction(
  _previous: SystemAdminActionResult<InviteMemberActionData> | undefined,
  formData: FormData,
) {
  return inviteMember(formData);
}

export async function inviteMemberForm(formData: FormData): Promise<void> {
  assertSystemAdminFormActionResult(await inviteMember(formData));
}

export async function revokeInvitation(
  invitationId: string,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireSystemAdminIdentityWrite();

  if (!invitationId.trim()) {
    return systemAdminActionFailure("Invitation id is required.", {
      invitationId: "Invitation id is required.",
    });
  }

  try {
    await revokeOrganizationInvitation({
      organizationId: organization.id,
      invitationId,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    logIdentityMutation({
      operation: "identity.invitation.revoke",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        invitationId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Invitation revoke failed.",
    );
  }

  logIdentityMutation({
    operation: "identity.invitation.revoke",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: { invitationId },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminIdentityInvitationWebhookEvents[1],
    payload: { invitationId },
  });

  revalidateSystemAdminIdentitySurfaces();
  return systemAdminActionSuccess(undefined);
}

export async function revokeInvitationForm(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "").trim();

  return revokeInvitation(invitationId);
}

export async function revokeInvitationFormAction(
  formData: FormData,
): Promise<void> {
  assertSystemAdminFormActionResult(await revokeInvitationForm(formData));
}
