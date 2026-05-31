import { and, eq, isNull, ne } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  archiveHrEmployeeInTx,
  HrEmployeeCommandError,
  type CreateHrEmployeeInput,
  type HrEmployeePlacementInput,
  updateHrEmployeeCoreInTx,
  upsertHrEmployeeEffectiveAssignmentInTx,
} from "./hr-commands";
import {
  hrEmployeeEmergencyContacts,
  hrEmployeeProfiles,
  hrEmployeeRecordEvents,
  hrEmployees,
} from "./schema/hr";

export { HrEmployeeCommandError };

export type HrEmployeeProfileInput = {
  identityDocumentType?:
    | (typeof hrEmployeeProfiles.$inferInsert)["identityDocumentType"]
    | null;
  identityNumber?: string | null;
  nationality?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  maritalStatus?: string | null;
  languagePreference?: string | null;
  personalEmail?: string | null;
  phoneNumber?: string | null;
  residentialAddress?: string | null;
  mailingAddress?: string | null;
};

export type HrEmployeeEmergencyContactInput = {
  contactName: string;
  relationship: string;
  phoneNumber: string;
  isPriority?: boolean;
};

export type CreateHrEmployeeRecordInput = CreateHrEmployeeInput & {
  employmentStartDate?: Date | null;
  employmentType?: string | null;
  workerCategory?: string | null;
  grade?: string | null;
  level?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  countryCode?: string | null;
  contractStartDate?: Date | null;
  contractEndDate?: Date | null;
  matrixManagerEmployeeId?: string | null;
  hrOwnerEmployeeId?: string | null;
  profile?: HrEmployeeProfileInput;
  emergencyContacts?: readonly HrEmployeeEmergencyContactInput[];
  actorUserId?: string | null;
  reason?: string | null;
};

export type UpdateHrEmployeeRecordInput = {
  organizationId: string;
  employeeId: string;
  employeeNumber?: string;
  legalName?: string;
  preferredName?: string | null;
  email?: string | null;
  employmentStatus?: (typeof hrEmployees.$inferInsert)["employmentStatus"];
  employmentStartDate?: Date | null;
  employmentType?: string | null;
  workerCategory?: string | null;
  grade?: string | null;
  level?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  countryCode?: string | null;
  contractStartDate?: Date | null;
  contractEndDate?: Date | null;
  matrixManagerEmployeeId?: string | null;
  hrOwnerEmployeeId?: string | null;
  placement?: HrEmployeePlacementInput;
  assignmentReason?: string | null;
  assignmentEffectiveFrom?: Date;
  profile?: HrEmployeeProfileInput;
  emergencyContacts?: readonly HrEmployeeEmergencyContactInput[];
  actorUserId?: string | null;
  reason?: string | null;
  approvalReference?: string | null;
};

export type RehireHrEmployeeInput = {
  organizationId: string;
  priorEmployeeId: string;
  employeeNumber: string;
  legalName: string;
  preferredName?: string | null;
  email?: string | null;
  employmentStartDate?: Date | null;
  placement?: HrEmployeePlacementInput;
  profile?: HrEmployeeProfileInput;
  actorUserId?: string | null;
  reason?: string | null;
};

async function assertNoDuplicateProfileIdentity(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    identityNumber?: string | null;
    phoneNumber?: string | null;
    excludeEmployeeId?: string;
  },
) {
  const trimmedIdentity = input.identityNumber?.trim();
  const trimmedPhone = input.phoneNumber?.trim();

  if (trimmedIdentity) {
    const conditions = [
      eq(hrEmployeeProfiles.organizationId, input.organizationId),
      eq(hrEmployeeProfiles.identityNumber, trimmedIdentity),
    ];
    if (input.excludeEmployeeId) {
      conditions.push(ne(hrEmployeeProfiles.employeeId, input.excludeEmployeeId));
    }
    const [duplicate] = await db
      .select({ employeeId: hrEmployeeProfiles.employeeId })
      .from(hrEmployeeProfiles)
      .innerJoin(hrEmployees, eq(hrEmployeeProfiles.employeeId, hrEmployees.id))
      .where(
        and(...conditions, isNull(hrEmployees.archivedAt)),
      )
      .limit(1);
    if (duplicate) {
      throw new HrEmployeeCommandError(
        "duplicate_identity_number",
        "Identity number already in use.",
      );
    }
  }

  if (trimmedPhone) {
    const phoneConditions = [
      eq(hrEmployeeProfiles.organizationId, input.organizationId),
      eq(hrEmployeeProfiles.phoneNumber, trimmedPhone),
    ];
    if (input.excludeEmployeeId) {
      phoneConditions.push(ne(hrEmployeeProfiles.employeeId, input.excludeEmployeeId));
    }
    const [duplicatePhone] = await db
      .select({ employeeId: hrEmployeeProfiles.employeeId })
      .from(hrEmployeeProfiles)
      .innerJoin(hrEmployees, eq(hrEmployeeProfiles.employeeId, hrEmployees.id))
      .where(and(...phoneConditions, isNull(hrEmployees.archivedAt)))
      .limit(1);
    if (duplicatePhone) {
      throw new HrEmployeeCommandError(
        "duplicate_phone",
        "Phone number already in use.",
      );
    }
  }
}

export async function insertHrEmployeeRecordEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    kind: (typeof hrEmployeeRecordEvents.$inferInsert)["kind"];
    eventId?: string;
    fieldName?: string | null;
    previousValue?: string | null;
    newValue?: string | null;
    effectiveDate?: Date;
    reason?: string | null;
    approvalReference?: string | null;
    actorUserId?: string | null;
  },
): Promise<{ eventId: string }> {
  const eventId = input.eventId ?? createEntityId("hr_rec_evt");

  await db.insert(hrEmployeeRecordEvents).values({
    id: eventId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    kind: input.kind,
    fieldName: input.fieldName ?? null,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
    effectiveDate: input.effectiveDate ?? new Date(),
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    actorUserId: input.actorUserId ?? null,
  });

  return { eventId };
}

async function upsertEmployeeProfileInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    profile?: HrEmployeeProfileInput;
    excludeEmployeeId?: string;
  },
) {
  if (!input.profile) return;

  await assertNoDuplicateProfileIdentity(db, {
    organizationId: input.organizationId,
    identityNumber: input.profile.identityNumber,
    phoneNumber: input.profile.phoneNumber,
    excludeEmployeeId: input.excludeEmployeeId ?? input.employeeId,
  });

  const [existing] = await db
    .select({ employeeId: hrEmployeeProfiles.employeeId })
    .from(hrEmployeeProfiles)
    .where(eq(hrEmployeeProfiles.employeeId, input.employeeId))
    .limit(1);

  const values = {
    identityDocumentType: input.profile.identityDocumentType ?? null,
    identityNumber: input.profile.identityNumber?.trim() || null,
    nationality: input.profile.nationality?.trim() || null,
    dateOfBirth: input.profile.dateOfBirth ?? null,
    gender: input.profile.gender?.trim() || null,
    maritalStatus: input.profile.maritalStatus?.trim() || null,
    languagePreference: input.profile.languagePreference?.trim() || null,
    personalEmail: input.profile.personalEmail?.trim() || null,
    phoneNumber: input.profile.phoneNumber?.trim() || null,
    residentialAddress: input.profile.residentialAddress?.trim() || null,
    mailingAddress: input.profile.mailingAddress?.trim() || null,
  };

  if (existing) {
    await db
      .update(hrEmployeeProfiles)
      .set(values)
      .where(eq(hrEmployeeProfiles.employeeId, input.employeeId));
  } else {
    await db.insert(hrEmployeeProfiles).values({
      employeeId: input.employeeId,
      organizationId: input.organizationId,
      ...values,
    });
  }
}

async function replaceEmergencyContactsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    contacts?: readonly HrEmployeeEmergencyContactInput[];
  },
) {
  if (!input.contacts) return;

  await db
    .delete(hrEmployeeEmergencyContacts)
    .where(
      and(
        eq(hrEmployeeEmergencyContacts.organizationId, input.organizationId),
        eq(hrEmployeeEmergencyContacts.employeeId, input.employeeId),
      ),
    );

  if (input.contacts.length === 0) return;

  await db.insert(hrEmployeeEmergencyContacts).values(
    input.contacts.map((contact, index) => ({
      id: createEntityId("hr_emg"),
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      contactName: contact.contactName.trim(),
      relationship: contact.relationship.trim(),
      phoneNumber: contact.phoneNumber.trim(),
      isPriority: contact.isPriority ?? index === 0,
      sortOrder: index,
    })),
  );
}

export async function createHrEmployeeRecordInTx(
  db: AfendaTransaction,
  input: CreateHrEmployeeRecordInput,
): Promise<{ employeeId: string; assignmentId: string | null }> {
  await assertNoDuplicateProfileIdentity(db, {
    organizationId: input.organizationId,
    identityNumber: input.profile?.identityNumber,
    phoneNumber: input.profile?.phoneNumber,
  });

  const employeeId = createEntityId("hr_emp");
  const employeeNumber = input.employeeNumber.trim();
  const legalName = input.legalName.trim();

  const numberConditions = [
    eq(hrEmployees.organizationId, input.organizationId),
    eq(hrEmployees.employeeNumber, employeeNumber),
    isNull(hrEmployees.archivedAt),
  ];
  const [duplicateNumber] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(and(...numberConditions))
    .limit(1);
  if (duplicateNumber) {
    throw new HrEmployeeCommandError("duplicate_employee_number");
  }

  const trimmedEmail = input.email?.trim();
  if (trimmedEmail) {
    const [duplicateEmail] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.email, trimmedEmail),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);
    if (duplicateEmail) {
      throw new HrEmployeeCommandError("duplicate_email");
    }
  }

  await db.insert(hrEmployees).values({
    id: employeeId,
    organizationId: input.organizationId,
    employeeNumber,
    legalName,
    preferredName: input.preferredName?.trim() || null,
    email: trimmedEmail || null,
    employmentStatus: "active",
    employmentStartDate: input.employmentStartDate ?? new Date(),
    employmentType: input.employmentType?.trim() || null,
    workerCategory: input.workerCategory?.trim() || null,
    grade: input.grade?.trim() || null,
    level: input.level?.trim() || null,
    legalEntityCode: input.legalEntityCode?.trim() || null,
    workLocationCode: input.workLocationCode?.trim() || null,
    countryCode: input.countryCode?.trim() || null,
    contractStartDate: input.contractStartDate ?? null,
    contractEndDate: input.contractEndDate ?? null,
    matrixManagerEmployeeId: input.matrixManagerEmployeeId ?? null,
    hrOwnerEmployeeId: input.hrOwnerEmployeeId ?? null,
    currentDepartmentId: null,
    currentPositionId: null,
    managerEmployeeId: null,
  });

  await upsertEmployeeProfileInTx(db, {
    organizationId: input.organizationId,
    employeeId,
    profile: input.profile,
  });
  await replaceEmergencyContactsInTx(db, {
    organizationId: input.organizationId,
    employeeId,
    contacts: input.emergencyContacts,
  });

  let assignmentId: string | null = null;
  if (input.placement) {
    const assignment = await upsertHrEmployeeEffectiveAssignmentInTx(db, {
      organizationId: input.organizationId,
      employeeId,
      placement: input.placement,
      reason: input.assignmentReason ?? "initial_placement",
    });
    assignmentId = assignment.assignmentId;
  }

  await insertHrEmployeeRecordEventInTx(db, {
    organizationId: input.organizationId,
    employeeId,
    kind: "created",
    newValue: JSON.stringify({ employeeNumber, legalName }),
    reason: input.reason ?? "employee_created",
    actorUserId: input.actorUserId ?? null,
  });

  return { employeeId, assignmentId };
}

export async function createHrEmployeeRecord(
  input: CreateHrEmployeeRecordInput,
): Promise<{ employeeId: string; assignmentId: string | null }> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrEmployeeRecordInTx(db, input),
  );
}

export async function updateHrEmployeeRecord(
  input: UpdateHrEmployeeRecordInput,
): Promise<{ employeeId: string; changedFields: string[]; assignmentId: string | null }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const core = await updateHrEmployeeCoreInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      employeeNumber: input.employeeNumber,
      legalName: input.legalName,
      preferredName: input.preferredName,
      email: input.email,
      employmentStatus: input.employmentStatus,
      placement:
        input.placement && !input.assignmentEffectiveFrom
          ? input.placement
          : undefined,
      assignmentReason: input.assignmentReason,
    });

    const employmentPatch: Partial<(typeof hrEmployees.$inferInsert)> = {};
    const changedFields = [...core.changedFields];

    if (input.employmentStartDate !== undefined) {
      employmentPatch.employmentStartDate = input.employmentStartDate;
      changedFields.push("employmentStartDate");
    }
    if (input.employmentType !== undefined) {
      employmentPatch.employmentType = input.employmentType?.trim() || null;
      changedFields.push("employmentType");
    }
    if (input.workerCategory !== undefined) {
      employmentPatch.workerCategory = input.workerCategory?.trim() || null;
      changedFields.push("workerCategory");
    }
    if (input.grade !== undefined) {
      employmentPatch.grade = input.grade?.trim() || null;
      changedFields.push("grade");
    }
    if (input.level !== undefined) {
      employmentPatch.level = input.level?.trim() || null;
      changedFields.push("level");
    }
    if (input.legalEntityCode !== undefined) {
      employmentPatch.legalEntityCode = input.legalEntityCode?.trim() || null;
      changedFields.push("legalEntityCode");
    }
    if (input.workLocationCode !== undefined) {
      employmentPatch.workLocationCode = input.workLocationCode?.trim() || null;
      changedFields.push("workLocationCode");
    }
    if (input.countryCode !== undefined) {
      employmentPatch.countryCode = input.countryCode?.trim() || null;
      changedFields.push("countryCode");
    }
    if (input.contractStartDate !== undefined) {
      employmentPatch.contractStartDate = input.contractStartDate;
      changedFields.push("contractStartDate");
    }
    if (input.contractEndDate !== undefined) {
      employmentPatch.contractEndDate = input.contractEndDate;
      changedFields.push("contractEndDate");
    }
    if (input.matrixManagerEmployeeId !== undefined) {
      employmentPatch.matrixManagerEmployeeId = input.matrixManagerEmployeeId;
      changedFields.push("matrixManagerEmployeeId");
    }
    if (input.hrOwnerEmployeeId !== undefined) {
      employmentPatch.hrOwnerEmployeeId = input.hrOwnerEmployeeId;
      changedFields.push("hrOwnerEmployeeId");
    }

    if (Object.keys(employmentPatch).length > 0) {
      await db
        .update(hrEmployees)
        .set(employmentPatch)
        .where(eq(hrEmployees.id, input.employeeId));
    }

    let assignmentId = core.assignmentId;
    if (input.placement && input.assignmentEffectiveFrom) {
      const assignment = await upsertHrEmployeeEffectiveAssignmentInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        effectiveFrom: input.assignmentEffectiveFrom,
        placement: input.placement,
        reason: input.assignmentReason ?? "scheduled_assignment",
      });
      assignmentId = assignment.assignmentId;
      if (assignment.assignmentId) {
        await insertHrEmployeeRecordEventInTx(db, {
          organizationId: input.organizationId,
          employeeId: input.employeeId,
          kind: "assignment_changed",
          newValue: JSON.stringify(input.placement),
          effectiveDate: input.assignmentEffectiveFrom,
          reason: input.reason ?? null,
          approvalReference: input.approvalReference ?? null,
          actorUserId: input.actorUserId ?? null,
        });
      }
    }

    if (input.profile) {
      await upsertEmployeeProfileInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        profile: input.profile,
        excludeEmployeeId: input.employeeId,
      });
      changedFields.push("profile");
    }

    if (input.emergencyContacts) {
      await replaceEmergencyContactsInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        contacts: input.emergencyContacts,
      });
      changedFields.push("emergencyContacts");
      await insertHrEmployeeRecordEventInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        kind: "emergency_contact_updated",
        reason: input.reason ?? null,
        actorUserId: input.actorUserId ?? null,
      });
    }

    if (changedFields.length > 0) {
      await insertHrEmployeeRecordEventInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        kind: input.employmentStatus ? "status_changed" : "updated",
        newValue: JSON.stringify(changedFields),
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        actorUserId: input.actorUserId ?? null,
      });
    }

    return {
      employeeId: input.employeeId,
      changedFields,
      assignmentId,
    };
  });
}

export async function rehireHrEmployee(
  input: RehireHrEmployeeInput,
): Promise<{ employeeId: string; priorEmployeeId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [prior] = await db
      .select({
        id: hrEmployees.id,
        archivedAt: hrEmployees.archivedAt,
        employmentStatus: hrEmployees.employmentStatus,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.priorEmployeeId),
        ),
      )
      .limit(1);

    if (!prior) {
      throw new HrEmployeeCommandError("employee_not_found");
    }

    const isSeparated = Boolean(
      prior.archivedAt ||
        prior.employmentStatus === "separated" ||
        prior.employmentStatus === "terminated" ||
        prior.employmentStatus === "retired",
    );
    if (!isSeparated) {
      throw new HrEmployeeCommandError(
        "employee_archived",
        "Only separated employees can be rehired.",
      );
    }

    const created = await createHrEmployeeRecordInTx(db, {
      organizationId: input.organizationId,
      employeeNumber: input.employeeNumber,
      legalName: input.legalName,
      preferredName: input.preferredName,
      email: input.email,
      employmentStartDate: input.employmentStartDate ?? new Date(),
      placement: input.placement,
      profile: input.profile,
      actorUserId: input.actorUserId,
      reason: input.reason ?? "rehire",
    });

    await db
      .update(hrEmployees)
      .set({ rehiredFromEmployeeId: input.priorEmployeeId })
      .where(eq(hrEmployees.id, created.employeeId));

    await insertHrEmployeeRecordEventInTx(db, {
      organizationId: input.organizationId,
      employeeId: created.employeeId,
      kind: "rehired",
      newValue: JSON.stringify({ priorEmployeeId: input.priorEmployeeId }),
      reason: input.reason ?? "rehire",
      actorUserId: input.actorUserId ?? null,
    });

    return {
      employeeId: created.employeeId,
      priorEmployeeId: input.priorEmployeeId,
    };
  });
}

export async function archiveHrEmployeeRecord(input: {
  organizationId: string;
  employeeId: string;
  actorUserId?: string | null;
  reason?: string | null;
  approvalReference?: string | null;
}): Promise<{ employeeId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const result = await archiveHrEmployeeInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
    });

    await insertHrEmployeeRecordEventInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: "archived",
      reason: input.reason ?? "employee_archived",
      approvalReference: input.approvalReference ?? null,
      actorUserId: input.actorUserId ?? null,
    });

    return result;
  });
}
