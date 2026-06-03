"use server";

import {
  archiveHrEmployeeRecord,
  createHrEmployeeRecord,
  rehireHrEmployee,
  type HrEmployeeEmergencyContactInput,
  type HrEmployeePlacementInput,
  type HrEmployeeProfileInput,
  updateHrEmployeeRecord,
} from "@afenda/db";
import {
  actionFailure,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrRecordsAuditActions } from "./hr.workforce.records.event";
import { requireHrRecordsWrite } from "./hr.workforce.records-access.policy.server";
import {
  parseHrRecordsArchiveEmployeeForm,
  parseHrRecordsAssignmentForm,
  parseHrRecordsCreateEmployeeForm,
  parseHrRecordsRehireEmployeeForm,
  parseHrRecordsUpdateEmployeeForm,
  type HrRecordsCreateEmployeeInput,
  type HrRecordsRehireEmployeeInput,
  type HrRecordsUpdateEmployeeInput,
} from "./hr.workforce.records-form.shared";
import { finalizeRecordsMutation } from "./hr.workforce.records.mutation.shared.server";

const sensitiveWriteDenied = () =>
  actionFailure("Sensitive employee fields require additional authorization.");

function createInputHasSensitiveFields(input: HrRecordsCreateEmployeeInput) {
  return Boolean(
    input.email ||
      input.identityDocumentType ||
      input.identityNumber ||
      input.nationality ||
      input.dateOfBirth ||
      input.gender ||
      input.maritalStatus ||
      input.languagePreference ||
      input.phoneNumber ||
      input.personalEmail ||
      input.residentialAddress ||
      input.mailingAddress ||
      input.emergencyContactPhoneNumber,
  );
}

function updateInputHasSensitiveFields(input: HrRecordsUpdateEmployeeInput) {
  return createInputHasSensitiveFields(input as HrRecordsCreateEmployeeInput);
}

function rehireInputHasSensitiveFields(input: HrRecordsRehireEmployeeInput) {
  return Boolean(input.email);
}

function hasRecordsInputValue(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function buildRecordsProfileInput(
  input: HrRecordsCreateEmployeeInput | HrRecordsUpdateEmployeeInput,
): HrEmployeeProfileInput | undefined {
  const profile = {
    identityDocumentType: input.identityDocumentType,
    identityNumber: input.identityNumber,
    nationality: input.nationality,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    maritalStatus: input.maritalStatus,
    languagePreference: input.languagePreference,
    personalEmail: input.personalEmail,
    phoneNumber: input.phoneNumber,
    residentialAddress: input.residentialAddress,
    mailingAddress: input.mailingAddress,
  } satisfies HrEmployeeProfileInput;

  return Object.values(profile).some(hasRecordsInputValue) ? profile : undefined;
}

function buildRecordsPlacementInput(
  input: HrRecordsCreateEmployeeInput,
): HrEmployeePlacementInput | undefined {
  const placement = {
    currentDepartmentId: input.currentDepartmentId || null,
    currentPositionId: input.currentPositionId || null,
    managerEmployeeId: input.managerEmployeeId || null,
  } satisfies HrEmployeePlacementInput;

  return [
    input.currentDepartmentId,
    input.currentPositionId,
    input.managerEmployeeId,
  ].some(hasRecordsInputValue)
    ? placement
    : undefined;
}

function buildRecordsEmergencyContactsInput(
  input: HrRecordsCreateEmployeeInput | HrRecordsUpdateEmployeeInput,
): readonly HrEmployeeEmergencyContactInput[] | undefined {
  if (
    !input.emergencyContactName ||
    !input.emergencyContactRelationship ||
    !input.emergencyContactPhoneNumber
  ) {
    return undefined;
  }

  return [
    {
      contactName: input.emergencyContactName,
      relationship: input.emergencyContactRelationship,
      phoneNumber: input.emergencyContactPhoneNumber,
      isPriority: true,
    },
  ];
}

export async function createHrEmployeeRecordAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrRecordsWrite();
  const { session, organization } = guard;
  const parsed = parseHrRecordsCreateEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }
  if (createInputHasSensitiveFields(parsed.data) && !guard.canViewSensitive) {
    return sensitiveWriteDenied();
  }

  return finalizeRecordsMutation(organization.id, async () => {
    const profile = buildRecordsProfileInput(parsed.data);
    const placement = buildRecordsPlacementInput(parsed.data);
    const emergencyContacts = buildRecordsEmergencyContactsInput(parsed.data);

    const result = await createHrEmployeeRecord({
      organizationId: organization.id,
      employeeNumber: parsed.data.employeeNumber,
      legalName: parsed.data.legalName,
      preferredName: parsed.data.preferredName ?? null,
      email: parsed.data.email || null,
      employmentStartDate: parsed.data.employmentStartDate ?? new Date(),
      employmentType: parsed.data.employmentType ?? null,
      workerCategory: parsed.data.workerCategory ?? null,
      grade: parsed.data.grade ?? null,
      level: parsed.data.level ?? null,
      legalEntityCode: parsed.data.legalEntityCode ?? null,
      workLocationCode: parsed.data.workLocationCode ?? null,
      countryCode: parsed.data.countryCode ?? null,
      contractStartDate: parsed.data.contractStartDate ?? null,
      contractEndDate: parsed.data.contractEndDate ?? null,
      matrixManagerEmployeeId: parsed.data.matrixManagerEmployeeId ?? null,
      hrOwnerEmployeeId: parsed.data.hrOwnerEmployeeId ?? null,
      placement,
      profile,
      emergencyContacts,
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
  const guard = await requireHrRecordsWrite();
  const { session, organization } = guard;
  const parsed = parseHrRecordsUpdateEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }
  if (updateInputHasSensitiveFields(parsed.data) && !guard.canViewSensitive) {
    return sensitiveWriteDenied();
  }

  return finalizeRecordsMutation(
    organization.id,
    async () => {
      const profile = buildRecordsProfileInput(parsed.data);
      const emergencyContacts = buildRecordsEmergencyContactsInput(parsed.data);
      const result = await updateHrEmployeeRecord({
        organizationId: organization.id,
        employeeId: parsed.data.employeeId,
        employeeNumber: parsed.data.employeeNumber,
        legalName: parsed.data.legalName,
        ...(parsed.data.preferredName !== undefined
          ? { preferredName: parsed.data.preferredName ?? null }
          : {}),
        ...(parsed.data.email !== undefined
          ? { email: parsed.data.email || null }
          : {}),
        employmentStatus: parsed.data.employmentStatus,
        employmentStartDate: parsed.data.employmentStartDate,
        employmentType: parsed.data.employmentType,
        workerCategory: parsed.data.workerCategory,
        grade: parsed.data.grade,
        level: parsed.data.level,
        legalEntityCode: parsed.data.legalEntityCode,
        workLocationCode: parsed.data.workLocationCode,
        countryCode: parsed.data.countryCode,
        contractStartDate: parsed.data.contractStartDate,
        contractEndDate: parsed.data.contractEndDate,
        matrixManagerEmployeeId: parsed.data.matrixManagerEmployeeId,
        hrOwnerEmployeeId: parsed.data.hrOwnerEmployeeId,
        profile,
        emergencyContacts,
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
  const guard = await requireHrRecordsWrite();
  const { session, organization } = guard;
  const parsed = parseHrRecordsRehireEmployeeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }
  if (rehireInputHasSensitiveFields(parsed.data) && !guard.canViewSensitive) {
    return sensitiveWriteDenied();
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
