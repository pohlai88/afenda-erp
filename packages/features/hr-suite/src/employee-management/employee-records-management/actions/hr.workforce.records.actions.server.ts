"use server";

import {
  archiveHrEmployeeRecord,
  createHrEmployeeRecord,
  rehireHrEmployee,
  updateHrEmployeeRecord,
} from "@afenda/db";
import { zodActionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { hrRecordsAuditActions } from "../events/hr.workforce.records.event";
import { requireHrRecordsWrite } from "../policies/hr.workforce.records-access.policy.server";
import {
  parseHrRecordsArchiveEmployeeForm,
  parseHrRecordsAssignmentForm,
  parseHrRecordsCreateEmployeeForm,
  parseHrRecordsRehireEmployeeForm,
  parseHrRecordsUpdateEmployeeForm,
} from "../schemas/hr.workforce.records-form.shared";
import { finalizeRecordsMutation } from "./hr.workforce.records.mutation.shared.server";

export async function createHrEmployeeRecordAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrRecordsWrite();
  const parsed = parseHrRecordsCreateEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeRecordsMutation(organization.id, async () => {
    const profileFields = {
      ...(parsed.data.identityNumber
        ? { identityNumber: parsed.data.identityNumber }
        : {}),
      ...(parsed.data.phoneNumber ? { phoneNumber: parsed.data.phoneNumber } : {}),
      ...(parsed.data.personalEmail
        ? { personalEmail: parsed.data.personalEmail }
        : {}),
    };
    const hasProfile = Object.keys(profileFields).length > 0;

    const result = await createHrEmployeeRecord({
      organizationId: organization.id,
      employeeNumber: parsed.data.employeeNumber,
      legalName: parsed.data.legalName,
      preferredName: parsed.data.preferredName ?? null,
      email: parsed.data.email || null,
      employmentStartDate: parsed.data.employmentStartDate ?? new Date(),
      employmentType: parsed.data.employmentType ?? null,
      profile: hasProfile ? profileFields : undefined,
      actorUserId: session.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrRecordsAuditActions.employee.created,
      targetId: result.employeeId,
      summary: `Created employee ${parsed.data.employeeNumber}`,
      metadata: {
        employeeNumber: parsed.data.employeeNumber,
        legalName: parsed.data.legalName,
      },
    };
  });
}

export async function updateHrEmployeeRecordAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrRecordsWrite();
  const parsed = parseHrRecordsUpdateEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeRecordsMutation(
    organization.id,
    async () => {
      const result = await updateHrEmployeeRecord({
        organizationId: organization.id,
        employeeId: parsed.data.employeeId,
        employeeNumber: parsed.data.employeeNumber,
        legalName: parsed.data.legalName,
        preferredName: parsed.data.preferredName ?? null,
        email: parsed.data.email || null,
        employmentStatus: parsed.data.employmentStatus,
        actorUserId: session.id,
        reason: parsed.data.reason ?? null,
        approvalReference: parsed.data.approvalReference ?? null,
      });

      return {
        organizationId: organization.id,
        actorId: session.id,
        action: hrRecordsAuditActions.employee.updated,
        targetId: result.employeeId,
        summary: `Updated employee ${parsed.data.employeeId}`,
        reason: parsed.data.reason,
        metadata: { changedFields: result.changedFields },
      };
    },
    { employeeId: parsed.data.employeeId },
  );
}

export async function recordHrEmployeeAssignmentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrRecordsWrite();
  const parsed = parseHrRecordsAssignmentForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const placement = {
    ...(parsed.data.currentDepartmentId !== undefined
      ? { currentDepartmentId: parsed.data.currentDepartmentId || null }
      : {}),
    ...(parsed.data.currentPositionId !== undefined
      ? { currentPositionId: parsed.data.currentPositionId || null }
      : {}),
    ...(parsed.data.managerEmployeeId !== undefined
      ? { managerEmployeeId: parsed.data.managerEmployeeId || null }
      : {}),
  };

  return finalizeRecordsMutation(
    organization.id,
    async () => {
      const result = await updateHrEmployeeRecord({
        organizationId: organization.id,
        employeeId: parsed.data.employeeId,
        placement,
        assignmentEffectiveFrom:
          parsed.data.assignmentEffectiveFrom ?? new Date(),
        assignmentReason: parsed.data.assignmentReason ?? null,
        actorUserId: session.id,
        reason: parsed.data.reason ?? parsed.data.assignmentReason ?? null,
      });

      return {
        organizationId: organization.id,
        actorId: session.id,
        action: hrRecordsAuditActions.assignment.recorded,
        targetId: result.employeeId,
        summary: `Recorded assignment for ${parsed.data.employeeId}`,
        reason: parsed.data.reason,
        metadata: { assignmentId: result.assignmentId },
      };
    },
    { employeeId: parsed.data.employeeId },
  );
}

export async function rehireHrEmployeeRecordAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrRecordsWrite();
  const parsed = parseHrRecordsRehireEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeRecordsMutation(
    organization.id,
    async () => {
      const result = await rehireHrEmployee({
        organizationId: organization.id,
        priorEmployeeId: parsed.data.priorEmployeeId,
        employeeNumber: parsed.data.employeeNumber,
        legalName: parsed.data.legalName,
        preferredName: parsed.data.preferredName ?? null,
        email: parsed.data.email || null,
        employmentStartDate: parsed.data.employmentStartDate ?? new Date(),
        actorUserId: session.id,
        reason: parsed.data.reason ?? "rehire",
      });

      return {
        organizationId: organization.id,
        actorId: session.id,
        action: hrRecordsAuditActions.employee.rehired,
        targetId: result.employeeId,
        summary: `Rehired employee from ${parsed.data.priorEmployeeId}`,
        reason: parsed.data.reason,
        metadata: {
          priorEmployeeId: result.priorEmployeeId,
          employeeNumber: parsed.data.employeeNumber,
        },
      };
    },
    { employeeId: parsed.data.priorEmployeeId },
  );
}

export async function archiveHrEmployeeRecordAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrRecordsWrite();
  const parsed = parseHrRecordsArchiveEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeRecordsMutation(
    organization.id,
    async () => {
      await archiveHrEmployeeRecord({
        organizationId: organization.id,
        employeeId: parsed.data.employeeId,
        actorUserId: session.id,
        reason: parsed.data.reason,
        approvalReference: parsed.data.approvalReference ?? null,
      });

      return {
        organizationId: organization.id,
        actorId: session.id,
        action: hrRecordsAuditActions.employee.archived,
        targetId: parsed.data.employeeId,
        summary: `Archived employee ${parsed.data.employeeId}`,
        reason: parsed.data.reason,
      };
    },
    { employeeId: parsed.data.employeeId },
  );
}
