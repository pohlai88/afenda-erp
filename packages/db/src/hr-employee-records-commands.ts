import { and, eq, ne, sql } from "drizzle-orm";
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

function normalizeHrEmployeeRecordEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

function normalizeHrEmployeeRecordPhone(phoneNumber: string | null | undefined) {
  return phoneNumber?.replace(/\D/g, "") || null;
}

async function assertNoDuplicateProfileIdentity(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    identityNumber?: string | null;
    personalEmail?: string | null;
    phoneNumber?: string | null;
    excludeEmployeeId?: string;
  },
) {
  const trimmedIdentity = input.identityNumber?.trim();
  const normalizedPersonalEmail = normalizeHrEmployeeRecordEmail(
    input.personalEmail,
  );
  const normalizedPhone = normalizeHrEmployeeRecordPhone(input.phoneNumber);

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
      .where(and(...conditions))
      .limit(1);
    if (duplicate) {
      throw new HrEmployeeCommandError(
        "duplicate_identity_number",
        "Identity number already in use.",
      );
    }
  }

  if (normalizedPersonalEmail) {
    const emailConditions = [
      eq(hrEmployeeProfiles.organizationId, input.organizationId),
      sql`lower(${hrEmployeeProfiles.personalEmail}) = ${normalizedPersonalEmail}`,
    ];
    if (input.excludeEmployeeId) {
      emailConditions.push(
        ne(hrEmployeeProfiles.employeeId, input.excludeEmployeeId),
      );
    }
    const [duplicatePersonalEmail] = await db
      .select({ employeeId: hrEmployeeProfiles.employeeId })
      .from(hrEmployeeProfiles)
      .innerJoin(hrEmployees, eq(hrEmployeeProfiles.employeeId, hrEmployees.id))
      .where(and(...emailConditions))
      .limit(1);
    if (duplicatePersonalEmail) {
      throw new HrEmployeeCommandError(
        "duplicate_email",
        "Personal email already in use.",
      );
    }
  }

  if (normalizedPhone) {
    const phoneConditions = [
      eq(hrEmployeeProfiles.organizationId, input.organizationId),
      sql`regexp_replace(coalesce(${hrEmployeeProfiles.phoneNumber}, ''), '[^0-9]', '', 'g') = ${normalizedPhone}`,
    ];
    if (input.excludeEmployeeId) {
      phoneConditions.push(ne(hrEmployeeProfiles.employeeId, input.excludeEmployeeId));
    }
    const [duplicatePhone] = await db
      .select({ employeeId: hrEmployeeProfiles.employeeId })
      .from(hrEmployeeProfiles)
      .innerJoin(hrEmployees, eq(hrEmployeeProfiles.employeeId, hrEmployees.id))
      .where(and(...phoneConditions))
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

function hasOwnRecordField(
  input: object,
  key: PropertyKey,
): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function toHrEmployeeRecordAuditValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map((entry) => toHrEmployeeRecordAuditValue(entry));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        toHrEmployeeRecordAuditValue(entry),
      ]),
    );
  }
  return value;
}

function serializeHrEmployeeRecordAuditValue(value: unknown): string | null {
  const prepared = toHrEmployeeRecordAuditValue(value);
  if (prepared === null || prepared === undefined) return null;
  if (typeof prepared === "string") return prepared;
  return JSON.stringify(prepared);
}

function hrEmployeeRecordAuditValuesEqual(
  previousValue: unknown,
  newValue: unknown,
): boolean {
  return (
    serializeHrEmployeeRecordAuditValue(previousValue) ===
    serializeHrEmployeeRecordAuditValue(newValue)
  );
}

async function loadHrEmployeeRecordAuditBaselineInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
  },
) {
  const [employee] = await db
    .select({
      employeeNumber: hrEmployees.employeeNumber,
      legalName: hrEmployees.legalName,
      preferredName: hrEmployees.preferredName,
      email: hrEmployees.email,
      employmentStatus: hrEmployees.employmentStatus,
      currentDepartmentId: hrEmployees.currentDepartmentId,
      currentPositionId: hrEmployees.currentPositionId,
      managerEmployeeId: hrEmployees.managerEmployeeId,
      employmentStartDate: hrEmployees.employmentStartDate,
      employmentType: hrEmployees.employmentType,
      workerCategory: hrEmployees.workerCategory,
      grade: hrEmployees.grade,
      level: hrEmployees.level,
      legalEntityCode: hrEmployees.legalEntityCode,
      workLocationCode: hrEmployees.workLocationCode,
      countryCode: hrEmployees.countryCode,
      contractStartDate: hrEmployees.contractStartDate,
      contractEndDate: hrEmployees.contractEndDate,
      matrixManagerEmployeeId: hrEmployees.matrixManagerEmployeeId,
      hrOwnerEmployeeId: hrEmployees.hrOwnerEmployeeId,
    })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrEmployeeCommandError("employee_not_found");
  }

  return employee;
}

async function loadHrEmployeeProfileAuditBaselineInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
  },
) {
  const [profile] = await db
    .select({
      identityDocumentType: hrEmployeeProfiles.identityDocumentType,
      identityNumber: hrEmployeeProfiles.identityNumber,
      nationality: hrEmployeeProfiles.nationality,
      dateOfBirth: hrEmployeeProfiles.dateOfBirth,
      gender: hrEmployeeProfiles.gender,
      maritalStatus: hrEmployeeProfiles.maritalStatus,
      languagePreference: hrEmployeeProfiles.languagePreference,
      personalEmail: hrEmployeeProfiles.personalEmail,
      phoneNumber: hrEmployeeProfiles.phoneNumber,
      residentialAddress: hrEmployeeProfiles.residentialAddress,
      mailingAddress: hrEmployeeProfiles.mailingAddress,
    })
    .from(hrEmployeeProfiles)
    .where(
      and(
        eq(hrEmployeeProfiles.organizationId, input.organizationId),
        eq(hrEmployeeProfiles.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  return profile ?? null;
}

async function loadHrEmployeeEmergencyContactsAuditBaselineInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
  },
) {
  return db
    .select({
      contactName: hrEmployeeEmergencyContacts.contactName,
      relationship: hrEmployeeEmergencyContacts.relationship,
      phoneNumber: hrEmployeeEmergencyContacts.phoneNumber,
      isPriority: hrEmployeeEmergencyContacts.isPriority,
      sortOrder: hrEmployeeEmergencyContacts.sortOrder,
    })
    .from(hrEmployeeEmergencyContacts)
    .where(
      and(
        eq(hrEmployeeEmergencyContacts.organizationId, input.organizationId),
        eq(hrEmployeeEmergencyContacts.employeeId, input.employeeId),
      ),
    )
    .orderBy(hrEmployeeEmergencyContacts.sortOrder);
}

function normalizeHrEmployeeProfileAuditValue(
  profile: HrEmployeeProfileInput | null | undefined,
) {
  if (!profile) return null;

  return {
    identityDocumentType: profile.identityDocumentType ?? null,
    identityNumber: profile.identityNumber?.trim() || null,
    nationality: profile.nationality?.trim() || null,
    dateOfBirth: profile.dateOfBirth ?? null,
    gender: profile.gender?.trim() || null,
    maritalStatus: profile.maritalStatus?.trim() || null,
    languagePreference: profile.languagePreference?.trim() || null,
    personalEmail: profile.personalEmail?.trim() || null,
    phoneNumber: profile.phoneNumber?.trim() || null,
    residentialAddress: profile.residentialAddress?.trim() || null,
    mailingAddress: profile.mailingAddress?.trim() || null,
  };
}

function normalizeHrEmployeeEmergencyContactsAuditValue(
  contacts:
    | readonly HrEmployeeEmergencyContactInput[]
    | readonly {
        contactName: string;
        relationship: string;
        phoneNumber: string;
        isPriority: boolean;
        sortOrder: number;
      }[],
) {
  return contacts.map((contact, index) => ({
    contactName: contact.contactName.trim(),
    relationship: contact.relationship.trim(),
    phoneNumber: contact.phoneNumber.trim(),
    isPriority: contact.isPriority ?? index === 0,
    sortOrder: "sortOrder" in contact ? contact.sortOrder : index,
  }));
}

function normalizeHrEmployeePlacementAuditValue(input: {
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  managerEmployeeId: string | null;
}) {
  return {
    currentDepartmentId: input.currentDepartmentId,
    currentPositionId: input.currentPositionId,
    managerEmployeeId: input.managerEmployeeId,
  };
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
    personalEmail: input.profile.personalEmail,
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
    personalEmail: input.profile?.personalEmail,
    phoneNumber: input.profile?.phoneNumber,
  });

  const employeeId = createEntityId("hr_emp");
  const employeeNumber = input.employeeNumber.trim();
  const legalName = input.legalName.trim();

  const numberConditions = [
    eq(hrEmployees.organizationId, input.organizationId),
    eq(hrEmployees.employeeNumber, employeeNumber),
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
  const normalizedEmail = normalizeHrEmployeeRecordEmail(input.email);
  if (normalizedEmail) {
    const [duplicateEmail] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          sql`lower(${hrEmployees.email}) = ${normalizedEmail}`,
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
    const baseline = await loadHrEmployeeRecordAuditBaselineInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
    });
    const profileBaseline = input.profile
      ? await loadHrEmployeeProfileAuditBaselineInTx(db, {
          organizationId: input.organizationId,
          employeeId: input.employeeId,
        })
      : null;
    const emergencyContactsBaseline = input.emergencyContacts
      ? await loadHrEmployeeEmergencyContactsAuditBaselineInTx(db, {
          organizationId: input.organizationId,
          employeeId: input.employeeId,
        })
      : [];
    const previousRecordValues: Record<string, unknown> = {};
    const newRecordValues: Record<string, unknown> = {};
    const trackRecordChange = (
      fieldName: string,
      previousValue: unknown,
      newValue: unknown,
    ) => {
      if (hrEmployeeRecordAuditValuesEqual(previousValue, newValue)) {
        return false;
      }
      previousRecordValues[fieldName] =
        toHrEmployeeRecordAuditValue(previousValue);
      newRecordValues[fieldName] = toHrEmployeeRecordAuditValue(newValue);
      return true;
    };
    const nextPlacement = normalizeHrEmployeePlacementAuditValue({
      currentDepartmentId:
        input.placement && hasOwnRecordField(input.placement, "currentDepartmentId")
          ? input.placement.currentDepartmentId ?? null
          : baseline.currentDepartmentId,
      currentPositionId:
        input.placement && hasOwnRecordField(input.placement, "currentPositionId")
          ? input.placement.currentPositionId ?? null
          : baseline.currentPositionId,
      managerEmployeeId:
        input.placement && hasOwnRecordField(input.placement, "managerEmployeeId")
          ? input.placement.managerEmployeeId ?? null
          : baseline.managerEmployeeId,
    });
    const previousPlacement = normalizeHrEmployeePlacementAuditValue({
      currentDepartmentId: baseline.currentDepartmentId,
      currentPositionId: baseline.currentPositionId,
      managerEmployeeId: baseline.managerEmployeeId,
    });

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
    const nextCoreValues = {
      employeeNumber: input.employeeNumber?.trim() ?? baseline.employeeNumber,
      legalName: input.legalName?.trim() ?? baseline.legalName,
      preferredName:
        input.preferredName !== undefined
          ? input.preferredName?.trim() || null
          : baseline.preferredName,
      email:
        input.email !== undefined ? input.email?.trim() || null : baseline.email,
      employmentStatus: input.employmentStatus ?? baseline.employmentStatus,
    };

    for (const fieldName of core.changedFields) {
      if (fieldName === "employeeNumber") {
        trackRecordChange(
          fieldName,
          baseline.employeeNumber,
          nextCoreValues.employeeNumber,
        );
      } else if (fieldName === "legalName") {
        trackRecordChange(fieldName, baseline.legalName, nextCoreValues.legalName);
      } else if (fieldName === "preferredName") {
        trackRecordChange(
          fieldName,
          baseline.preferredName,
          nextCoreValues.preferredName,
        );
      } else if (fieldName === "email") {
        trackRecordChange(fieldName, baseline.email, nextCoreValues.email);
      } else if (fieldName === "employmentStatus") {
        trackRecordChange(
          fieldName,
          baseline.employmentStatus,
          nextCoreValues.employmentStatus,
        );
      } else if (fieldName === "currentDepartmentId") {
        trackRecordChange(
          fieldName,
          baseline.currentDepartmentId,
          nextPlacement.currentDepartmentId,
        );
      } else if (fieldName === "currentPositionId") {
        trackRecordChange(
          fieldName,
          baseline.currentPositionId,
          nextPlacement.currentPositionId,
        );
      } else if (fieldName === "managerEmployeeId") {
        trackRecordChange(
          fieldName,
          baseline.managerEmployeeId,
          nextPlacement.managerEmployeeId,
        );
      }
    }

    if (input.employmentStartDate !== undefined) {
      employmentPatch.employmentStartDate = input.employmentStartDate;
      if (
        trackRecordChange(
          "employmentStartDate",
          baseline.employmentStartDate,
          input.employmentStartDate,
        )
      ) {
        changedFields.push("employmentStartDate");
      }
    }
    if (input.employmentType !== undefined) {
      const nextValue = input.employmentType?.trim() || null;
      employmentPatch.employmentType = nextValue;
      if (trackRecordChange("employmentType", baseline.employmentType, nextValue)) {
        changedFields.push("employmentType");
      }
    }
    if (input.workerCategory !== undefined) {
      const nextValue = input.workerCategory?.trim() || null;
      employmentPatch.workerCategory = nextValue;
      if (
        trackRecordChange("workerCategory", baseline.workerCategory, nextValue)
      ) {
        changedFields.push("workerCategory");
      }
    }
    if (input.grade !== undefined) {
      const nextValue = input.grade?.trim() || null;
      employmentPatch.grade = nextValue;
      if (trackRecordChange("grade", baseline.grade, nextValue)) {
        changedFields.push("grade");
      }
    }
    if (input.level !== undefined) {
      const nextValue = input.level?.trim() || null;
      employmentPatch.level = nextValue;
      if (trackRecordChange("level", baseline.level, nextValue)) {
        changedFields.push("level");
      }
    }
    if (input.legalEntityCode !== undefined) {
      const nextValue = input.legalEntityCode?.trim() || null;
      employmentPatch.legalEntityCode = nextValue;
      if (
        trackRecordChange("legalEntityCode", baseline.legalEntityCode, nextValue)
      ) {
        changedFields.push("legalEntityCode");
      }
    }
    if (input.workLocationCode !== undefined) {
      const nextValue = input.workLocationCode?.trim() || null;
      employmentPatch.workLocationCode = nextValue;
      if (
        trackRecordChange(
          "workLocationCode",
          baseline.workLocationCode,
          nextValue,
        )
      ) {
        changedFields.push("workLocationCode");
      }
    }
    if (input.countryCode !== undefined) {
      const nextValue = input.countryCode?.trim() || null;
      employmentPatch.countryCode = nextValue;
      if (trackRecordChange("countryCode", baseline.countryCode, nextValue)) {
        changedFields.push("countryCode");
      }
    }
    if (input.contractStartDate !== undefined) {
      employmentPatch.contractStartDate = input.contractStartDate;
      if (
        trackRecordChange(
          "contractStartDate",
          baseline.contractStartDate,
          input.contractStartDate,
        )
      ) {
        changedFields.push("contractStartDate");
      }
    }
    if (input.contractEndDate !== undefined) {
      employmentPatch.contractEndDate = input.contractEndDate;
      if (
        trackRecordChange(
          "contractEndDate",
          baseline.contractEndDate,
          input.contractEndDate,
        )
      ) {
        changedFields.push("contractEndDate");
      }
    }
    if (input.matrixManagerEmployeeId !== undefined) {
      employmentPatch.matrixManagerEmployeeId = input.matrixManagerEmployeeId;
      if (
        trackRecordChange(
          "matrixManagerEmployeeId",
          baseline.matrixManagerEmployeeId,
          input.matrixManagerEmployeeId,
        )
      ) {
        changedFields.push("matrixManagerEmployeeId");
      }
    }
    if (input.hrOwnerEmployeeId !== undefined) {
      employmentPatch.hrOwnerEmployeeId = input.hrOwnerEmployeeId;
      if (
        trackRecordChange(
          "hrOwnerEmployeeId",
          baseline.hrOwnerEmployeeId,
          input.hrOwnerEmployeeId,
        )
      ) {
        changedFields.push("hrOwnerEmployeeId");
      }
    }

    if (Object.keys(employmentPatch).length > 0) {
      await db
        .update(hrEmployees)
        .set(employmentPatch)
        .where(eq(hrEmployees.id, input.employeeId));
    }

    let assignmentId = core.assignmentId;
    if (input.placement && !input.assignmentEffectiveFrom && core.assignmentId) {
      await insertHrEmployeeRecordEventInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        kind: "assignment_changed",
        previousValue: serializeHrEmployeeRecordAuditValue(previousPlacement),
        newValue: serializeHrEmployeeRecordAuditValue(nextPlacement),
        reason: input.reason ?? input.assignmentReason ?? null,
        approvalReference: input.approvalReference ?? null,
        actorUserId: input.actorUserId ?? null,
      });
    }

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
          previousValue: serializeHrEmployeeRecordAuditValue(previousPlacement),
          newValue: serializeHrEmployeeRecordAuditValue(nextPlacement),
          effectiveDate: input.assignmentEffectiveFrom,
          reason: input.reason ?? null,
          approvalReference: input.approvalReference ?? null,
          actorUserId: input.actorUserId ?? null,
        });
      }
    }

    if (input.profile) {
      const previousProfile =
        normalizeHrEmployeeProfileAuditValue(profileBaseline);
      const newProfile = normalizeHrEmployeeProfileAuditValue(input.profile);
      await upsertEmployeeProfileInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        profile: input.profile,
        excludeEmployeeId: input.employeeId,
      });
      if (!hrEmployeeRecordAuditValuesEqual(previousProfile, newProfile)) {
        changedFields.push("profile");
        await insertHrEmployeeRecordEventInTx(db, {
          organizationId: input.organizationId,
          employeeId: input.employeeId,
          kind: "profile_updated",
          fieldName: "profile",
          previousValue: serializeHrEmployeeRecordAuditValue(previousProfile),
          newValue: serializeHrEmployeeRecordAuditValue(newProfile),
          reason: input.reason ?? null,
          approvalReference: input.approvalReference ?? null,
          actorUserId: input.actorUserId ?? null,
        });
      }
    }

    if (input.emergencyContacts) {
      const previousContacts =
        normalizeHrEmployeeEmergencyContactsAuditValue(emergencyContactsBaseline);
      const newContacts = normalizeHrEmployeeEmergencyContactsAuditValue(
        input.emergencyContacts,
      );
      await replaceEmergencyContactsInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        contacts: input.emergencyContacts,
      });
      if (!hrEmployeeRecordAuditValuesEqual(previousContacts, newContacts)) {
        changedFields.push("emergencyContacts");
        await insertHrEmployeeRecordEventInTx(db, {
          organizationId: input.organizationId,
          employeeId: input.employeeId,
          kind: "emergency_contact_updated",
          fieldName: "emergencyContacts",
          previousValue: serializeHrEmployeeRecordAuditValue(previousContacts),
          newValue: serializeHrEmployeeRecordAuditValue(newContacts),
          reason: input.reason ?? null,
          approvalReference: input.approvalReference ?? null,
          actorUserId: input.actorUserId ?? null,
        });
      }
    }

    if (changedFields.includes("employmentStatus")) {
      await insertHrEmployeeRecordEventInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        kind: "status_changed",
        fieldName: "employmentStatus",
        previousValue: serializeHrEmployeeRecordAuditValue(
          baseline.employmentStatus,
        ),
        newValue: serializeHrEmployeeRecordAuditValue(
          nextCoreValues.employmentStatus,
        ),
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        actorUserId: input.actorUserId ?? null,
      });
    }

    const dedicatedAuditFields = new Set([
      "employmentStatus",
      "currentDepartmentId",
      "currentPositionId",
      "managerEmployeeId",
      "profile",
      "emergencyContacts",
    ]);
    const recordChangedFields = changedFields.filter(
      (fieldName) => !dedicatedAuditFields.has(fieldName),
    );

    if (recordChangedFields.length > 0) {
      const previousValue = Object.fromEntries(
        recordChangedFields.map((fieldName) => [
          fieldName,
          previousRecordValues[fieldName] ?? null,
        ]),
      );
      const newValue = Object.fromEntries(
        recordChangedFields.map((fieldName) => [
          fieldName,
          newRecordValues[fieldName] ?? null,
        ]),
      );

      await insertHrEmployeeRecordEventInTx(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        kind: "updated",
        fieldName:
          recordChangedFields.length === 1
            ? recordChangedFields[0]
            : "employeeRecord",
        previousValue: serializeHrEmployeeRecordAuditValue(previousValue),
        newValue: serializeHrEmployeeRecordAuditValue(newValue),
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
