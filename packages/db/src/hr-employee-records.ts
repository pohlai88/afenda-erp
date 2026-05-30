import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { alias, unionAll } from "drizzle-orm/pg-core";

import { runWithOrganizationContext } from "./client";
import type { HrEmploymentStatus } from "./hr-lifecycle";
import {
  hrDepartments,
  hrEmployeeAssignments,
  hrEmployeeDocuments,
  hrEmployeeEmergencyContacts,
  hrEmployeeProfiles,
  hrEmployeeRecordEvents,
  hrEmployees,
  hrLifecycleEvents,
  hrPositions,
} from "./schema/hr";

const HR_RECORDS_DEFAULT_PAGE_SIZE = 25;
const HR_RECORDS_MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return HR_RECORDS_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return HR_RECORDS_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_RECORDS_MAX_PAGE_SIZE);
}

function displayName(input: {
  legalName: string;
  preferredName: string | null;
}): string {
  return input.preferredName?.trim() || input.legalName;
}

const managerEmployee = alias(hrEmployees, "manager_employee");
const matrixManagerEmployee = alias(hrEmployees, "matrix_manager_employee");
const hrOwnerEmployee = alias(hrEmployees, "hr_owner_employee");
const rehiredFromEmployee = alias(hrEmployees, "rehired_from_employee");

function employeeIncompleteCondition() {
  return or(
    isNull(hrEmployees.email),
    eq(hrEmployees.email, ""),
    isNull(hrEmployees.currentDepartmentId),
    isNull(hrEmployees.currentPositionId),
    isNull(hrEmployees.employmentStartDate),
    isNull(hrEmployees.employmentType),
    eq(hrEmployees.employmentType, ""),
    isNull(hrEmployeeProfiles.identityNumber),
    eq(hrEmployeeProfiles.identityNumber, ""),
    isNull(hrEmployeeProfiles.phoneNumber),
    eq(hrEmployeeProfiles.phoneNumber, ""),
  )!;
}

export type HrEmployeeIncompleteProfileRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  missingFields: string[];
};

export type HrEmployeeIncompleteProfilesWindow = {
  rows: HrEmployeeIncompleteProfileRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function resolveMissingMandatoryFields(row: {
  email: string | null;
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  employmentStartDate: Date | null;
  employmentType: string | null;
  identityNumber: string | null;
  phoneNumber: string | null;
}): string[] {
  const missing: string[] = [];
  if (!row.email?.trim()) missing.push("email");
  if (!row.currentDepartmentId) missing.push("department");
  if (!row.currentPositionId) missing.push("position");
  if (!row.employmentStartDate) missing.push("employment_start_date");
  if (!row.employmentType?.trim()) missing.push("employment_type");
  if (!row.identityNumber?.trim()) missing.push("identity_number");
  if (!row.phoneNumber?.trim()) missing.push("phone_number");
  return missing;
}

export async function listHrEmployeeIncompleteProfilesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeIncompleteProfilesWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const incompleteCondition = employeeIncompleteCondition();

    const conditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      isNull(hrEmployees.archivedAt),
      incompleteCondition,
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .leftJoin(
        hrEmployeeProfiles,
        eq(hrEmployees.id, hrEmployeeProfiles.employeeId),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employmentStatus: hrEmployees.employmentStatus,
        email: hrEmployees.email,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        currentPositionId: hrEmployees.currentPositionId,
        employmentStartDate: hrEmployees.employmentStartDate,
        employmentType: hrEmployees.employmentType,
        identityNumber: hrEmployeeProfiles.identityNumber,
        phoneNumber: hrEmployeeProfiles.phoneNumber,
      })
      .from(hrEmployees)
      .leftJoin(
        hrEmployeeProfiles,
        eq(hrEmployees.id, hrEmployeeProfiles.employeeId),
      )
      .where(whereClause)
      .orderBy(desc(hrEmployees.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeIncompleteProfileRow[] = rows.map((row) => ({
      id: row.id,
      employeeNumber: row.employeeNumber,
      displayName: displayName(row),
      employmentStatus: row.employmentStatus,
      missingFields: resolveMissingMandatoryFields({
        email: row.email,
        currentDepartmentId: row.currentDepartmentId,
        currentPositionId: row.currentPositionId,
        employmentStartDate: row.employmentStartDate,
        employmentType: row.employmentType,
        identityNumber: row.identityNumber,
        phoneNumber: row.phoneNumber,
      }),
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrEmployeeAssignmentHistoryRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  displayName: string;
  departmentName: string | null;
  positionTitle: string | null;
  managerDisplayName: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  assignmentStatus: (typeof hrEmployeeAssignments.$inferSelect)["assignmentStatus"];
  reason: string | null;
};

export type HrEmployeeAssignmentHistoryWindow = {
  rows: HrEmployeeAssignmentHistoryRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrEmployeeAssignmentHistoryWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeAssignmentHistoryWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployeeAssignments.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployeeAssignments)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeAssignments.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployeeAssignments.id,
        employeeId: hrEmployeeAssignments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentName: hrDepartments.name,
        positionTitle: hrPositions.title,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        effectiveFrom: hrEmployeeAssignments.effectiveFrom,
        effectiveTo: hrEmployeeAssignments.effectiveTo,
        assignmentStatus: hrEmployeeAssignments.assignmentStatus,
        reason: hrEmployeeAssignments.reason,
      })
      .from(hrEmployeeAssignments)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeAssignments.employeeId, hrEmployees.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrEmployeeAssignments.departmentId, hrDepartments.id),
      )
      .leftJoin(
        hrPositions,
        eq(hrEmployeeAssignments.positionId, hrPositions.id),
      )
      .leftJoin(
        managerEmployee,
        eq(hrEmployeeAssignments.managerEmployeeId, managerEmployee.id),
      )
      .where(whereClause)
      .orderBy(desc(hrEmployeeAssignments.effectiveFrom))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeAssignmentHistoryRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      displayName: displayName(row),
      departmentName: row.departmentName,
      positionTitle: row.positionTitle,
      managerDisplayName: row.managerLegalName
        ? displayName({
            legalName: row.managerLegalName,
            preferredName: row.managerPreferredName,
          })
        : null,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      assignmentStatus: row.assignmentStatus,
      reason: row.reason,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrEmployeeRecordsOverviewSnapshot = {
  activeRosterCount: number;
  incompleteProfileCount: number;
  separatedCount: number;
  assignmentHistoryCount: number;
};

export async function loadHrEmployeeRecordsOverviewSnapshot(input: {
  organizationId: string;
}): Promise<HrEmployeeRecordsOverviewSnapshot> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [activeRow, incompleteRow, separatedRow, assignmentRow] =
      await Promise.all([
        db
          .select({ total: count() })
          .from(hrEmployees)
          .where(
            and(
              eq(hrEmployees.organizationId, input.organizationId),
              isNull(hrEmployees.archivedAt),
            ),
          ),
        db
          .select({ total: count() })
          .from(hrEmployees)
          .leftJoin(
            hrEmployeeProfiles,
            eq(hrEmployees.id, hrEmployeeProfiles.employeeId),
          )
          .where(
            and(
              eq(hrEmployees.organizationId, input.organizationId),
              isNull(hrEmployees.archivedAt),
              employeeIncompleteCondition(),
            ),
          ),
        db
          .select({ total: count() })
          .from(hrEmployees)
          .where(
            and(
              eq(hrEmployees.organizationId, input.organizationId),
              or(
                sql`${hrEmployees.archivedAt} is not null`,
                eq(hrEmployees.employmentStatus, "separated"),
                eq(hrEmployees.employmentStatus, "terminated"),
                eq(hrEmployees.employmentStatus, "retired"),
              )!,
            ),
          ),
        db
          .select({ total: count() })
          .from(hrEmployeeAssignments)
          .where(
            eq(hrEmployeeAssignments.organizationId, input.organizationId),
          ),
      ]);

    return {
      activeRosterCount: Number(activeRow[0]?.total ?? 0),
      incompleteProfileCount: Number(incompleteRow[0]?.total ?? 0),
      separatedCount: Number(separatedRow[0]?.total ?? 0),
      assignmentHistoryCount: Number(assignmentRow[0]?.total ?? 0),
    };
  });
}

export type HrEmployeeProfileDetail = {
  identityDocumentType:
    | (typeof hrEmployeeProfiles.$inferSelect)["identityDocumentType"]
    | null;
  identityNumber: string | null;
  nationality: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  maritalStatus: string | null;
  languagePreference: string | null;
  personalEmail: string | null;
  phoneNumber: string | null;
  residentialAddress: string | null;
  mailingAddress: string | null;
  profilePhotoUrl: string | null;
  payrollReadyAt: Date | null;
  complianceReadyAt: Date | null;
};

export type HrEmployeeEmergencyContactDetail = {
  id: string;
  contactName: string;
  relationship: string;
  phoneNumber: string;
  isPriority: boolean;
  sortOrder: number;
};

export type HrEmployeeRehiredFromReference = {
  employeeId: string;
  employeeNumber: string;
  displayName: string;
};

export type HrEmployeeRecordDetail = {
  id: string;
  employeeNumber: string;
  legalName: string;
  preferredName: string | null;
  displayName: string;
  email: string | null;
  employmentStatus: HrEmploymentStatus;
  employmentStartDate: Date | null;
  probationEndDate: Date | null;
  confirmationDate: Date | null;
  employmentType: string | null;
  workerCategory: string | null;
  grade: string | null;
  level: string | null;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  countryCode: string | null;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  currentDepartmentId: string | null;
  departmentName: string | null;
  currentPositionId: string | null;
  positionTitle: string | null;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  matrixManagerEmployeeId: string | null;
  matrixManagerDisplayName: string | null;
  hrOwnerEmployeeId: string | null;
  hrOwnerDisplayName: string | null;
  profile: HrEmployeeProfileDetail | null;
  emergencyContacts: readonly HrEmployeeEmergencyContactDetail[];
  rehiredFrom: HrEmployeeRehiredFromReference | null;
  archivedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
};

export async function getHrEmployeeRecordDetail(input: {
  organizationId: string;
  employeeId: string;
}): Promise<HrEmployeeRecordDetail | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        email: hrEmployees.email,
        employmentStatus: hrEmployees.employmentStatus,
        employmentStartDate: hrEmployees.employmentStartDate,
        probationEndDate: hrEmployees.probationEndDate,
        confirmationDate: hrEmployees.confirmationDate,
        employmentType: hrEmployees.employmentType,
        workerCategory: hrEmployees.workerCategory,
        grade: hrEmployees.grade,
        level: hrEmployees.level,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        countryCode: hrEmployees.countryCode,
        contractStartDate: hrEmployees.contractStartDate,
        contractEndDate: hrEmployees.contractEndDate,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        departmentName: hrDepartments.name,
        currentPositionId: hrEmployees.currentPositionId,
        positionTitle: hrPositions.title,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        matrixManagerEmployeeId: hrEmployees.matrixManagerEmployeeId,
        matrixManagerLegalName: matrixManagerEmployee.legalName,
        matrixManagerPreferredName: matrixManagerEmployee.preferredName,
        hrOwnerEmployeeId: hrEmployees.hrOwnerEmployeeId,
        hrOwnerLegalName: hrOwnerEmployee.legalName,
        hrOwnerPreferredName: hrOwnerEmployee.preferredName,
        rehiredFromEmployeeId: hrEmployees.rehiredFromEmployeeId,
        rehiredFromNumber: rehiredFromEmployee.employeeNumber,
        rehiredFromLegalName: rehiredFromEmployee.legalName,
        rehiredFromPreferredName: rehiredFromEmployee.preferredName,
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
        profilePhotoUrl: hrEmployeeProfiles.profilePhotoUrl,
        payrollReadyAt: hrEmployeeProfiles.payrollReadyAt,
        complianceReadyAt: hrEmployeeProfiles.complianceReadyAt,
        archivedAt: hrEmployees.archivedAt,
        updatedAt: hrEmployees.updatedAt,
        createdAt: hrEmployees.createdAt,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .leftJoin(
        managerEmployee,
        eq(hrEmployees.managerEmployeeId, managerEmployee.id),
      )
      .leftJoin(
        matrixManagerEmployee,
        eq(hrEmployees.matrixManagerEmployeeId, matrixManagerEmployee.id),
      )
      .leftJoin(
        hrOwnerEmployee,
        eq(hrEmployees.hrOwnerEmployeeId, hrOwnerEmployee.id),
      )
      .leftJoin(
        rehiredFromEmployee,
        eq(hrEmployees.rehiredFromEmployeeId, rehiredFromEmployee.id),
      )
      .leftJoin(
        hrEmployeeProfiles,
        eq(hrEmployees.id, hrEmployeeProfiles.employeeId),
      )
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    if (!row) return null;

    const emergencyContacts = await db
      .select({
        id: hrEmployeeEmergencyContacts.id,
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

    const hasProfile =
      row.identityNumber !== null ||
      row.phoneNumber !== null ||
      row.identityDocumentType !== null;

    return {
      id: row.id,
      employeeNumber: row.employeeNumber,
      legalName: row.legalName,
      preferredName: row.preferredName,
      displayName: displayName(row),
      email: row.email,
      employmentStatus: row.employmentStatus,
      employmentStartDate: row.employmentStartDate,
      probationEndDate: row.probationEndDate,
      confirmationDate: row.confirmationDate,
      employmentType: row.employmentType,
      workerCategory: row.workerCategory,
      grade: row.grade,
      level: row.level,
      legalEntityCode: row.legalEntityCode,
      workLocationCode: row.workLocationCode,
      countryCode: row.countryCode,
      contractStartDate: row.contractStartDate,
      contractEndDate: row.contractEndDate,
      currentDepartmentId: row.currentDepartmentId,
      departmentName: row.departmentName,
      currentPositionId: row.currentPositionId,
      positionTitle: row.positionTitle,
      managerEmployeeId: row.managerEmployeeId,
      managerDisplayName: row.managerLegalName
        ? displayName({
            legalName: row.managerLegalName,
            preferredName: row.managerPreferredName,
          })
        : null,
      matrixManagerEmployeeId: row.matrixManagerEmployeeId,
      matrixManagerDisplayName: row.matrixManagerLegalName
        ? displayName({
            legalName: row.matrixManagerLegalName,
            preferredName: row.matrixManagerPreferredName,
          })
        : null,
      hrOwnerEmployeeId: row.hrOwnerEmployeeId,
      hrOwnerDisplayName: row.hrOwnerLegalName
        ? displayName({
            legalName: row.hrOwnerLegalName,
            preferredName: row.hrOwnerPreferredName,
          })
        : null,
      profile: hasProfile
        ? {
            identityDocumentType: row.identityDocumentType,
            identityNumber: row.identityNumber,
            nationality: row.nationality,
            dateOfBirth: row.dateOfBirth,
            gender: row.gender,
            maritalStatus: row.maritalStatus,
            languagePreference: row.languagePreference,
            personalEmail: row.personalEmail,
            phoneNumber: row.phoneNumber,
            residentialAddress: row.residentialAddress,
            mailingAddress: row.mailingAddress,
            profilePhotoUrl: row.profilePhotoUrl,
            payrollReadyAt: row.payrollReadyAt,
            complianceReadyAt: row.complianceReadyAt,
          }
        : null,
      emergencyContacts,
      rehiredFrom: row.rehiredFromEmployeeId
        ? {
            employeeId: row.rehiredFromEmployeeId,
            employeeNumber: row.rehiredFromNumber ?? "",
            displayName: displayName({
              legalName: row.rehiredFromLegalName ?? "",
              preferredName: row.rehiredFromPreferredName,
            }),
          }
        : null,
      archivedAt: row.archivedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    };
  });
}

export type HrEmployeeRecordEventRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  displayName: string;
  kind: (typeof hrEmployeeRecordEvents.$inferSelect)["kind"];
  fieldName: string | null;
  previousValue: string | null;
  newValue: string | null;
  effectiveDate: Date;
  reason: string | null;
  approvalReference: string | null;
  actorUserId: string | null;
  createdAt: Date;
};

export type HrEmployeeRecordEventsWindow = {
  rows: readonly HrEmployeeRecordEventRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrEmployeeRecordEventsWindow(input: {
  organizationId: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeRecordEventsWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployeeRecordEvents.organizationId, input.organizationId),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrEmployeeRecordEvents.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(sql`${hrEmployeeRecordEvents.kind}::text`, pattern),
          ilike(hrEmployeeRecordEvents.fieldName, pattern),
          ilike(hrEmployeeRecordEvents.reason, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployeeRecordEvents)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeRecordEvents.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployeeRecordEvents.id,
        employeeId: hrEmployeeRecordEvents.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        kind: hrEmployeeRecordEvents.kind,
        fieldName: hrEmployeeRecordEvents.fieldName,
        previousValue: hrEmployeeRecordEvents.previousValue,
        newValue: hrEmployeeRecordEvents.newValue,
        effectiveDate: hrEmployeeRecordEvents.effectiveDate,
        reason: hrEmployeeRecordEvents.reason,
        approvalReference: hrEmployeeRecordEvents.approvalReference,
        actorUserId: hrEmployeeRecordEvents.actorUserId,
        createdAt: hrEmployeeRecordEvents.createdAt,
      })
      .from(hrEmployeeRecordEvents)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeRecordEvents.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(
        desc(hrEmployeeRecordEvents.effectiveDate),
        desc(hrEmployeeRecordEvents.createdAt),
      )
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeRecordEventRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      displayName: displayName(row),
      kind: row.kind,
      fieldName: row.fieldName,
      previousValue: row.previousValue,
      newValue: row.newValue,
      effectiveDate: row.effectiveDate,
      reason: row.reason,
      approvalReference: row.approvalReference,
      actorUserId: row.actorUserId,
      createdAt: row.createdAt,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrEmployeeStatusHistoryRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  displayName: string;
  source: "lifecycle" | "record";
  kind: string;
  previousStatus: HrEmploymentStatus | null;
  newStatus: HrEmploymentStatus | null;
  effectiveDate: Date;
  reason: string | null;
  approvalReference: string | null;
  createdAt: Date;
};

export type HrEmployeeStatusHistoryWindow = {
  rows: readonly HrEmployeeStatusHistoryRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrEmployeeStatusHistoryWindow(input: {
  organizationId: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeStatusHistoryWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const lifecycleConditions = [
      eq(hrLifecycleEvents.organizationId, input.organizationId),
    ];
    const recordConditions = [
      eq(hrEmployeeRecordEvents.organizationId, input.organizationId),
      eq(hrEmployeeRecordEvents.kind, "status_changed"),
    ];

    if (input.employeeId) {
      lifecycleConditions.push(eq(hrLifecycleEvents.employeeId, input.employeeId));
      recordConditions.push(
        eq(hrEmployeeRecordEvents.employeeId, input.employeeId),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      lifecycleConditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrLifecycleEvents.kind, pattern),
          ilike(hrLifecycleEvents.reason, pattern),
        )!,
      );
      recordConditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrEmployeeRecordEvents.reason, pattern),
        )!,
      );
    }

    const lifecycleWhere = and(...lifecycleConditions);
    const recordWhere = and(...recordConditions);

    const [lifecycleTotalRow, recordTotalRow] = await Promise.all([
      db
        .select({ total: count() })
        .from(hrLifecycleEvents)
        .innerJoin(
          hrEmployees,
          eq(hrLifecycleEvents.employeeId, hrEmployees.id),
        )
        .where(lifecycleWhere),
      db
        .select({ total: count() })
        .from(hrEmployeeRecordEvents)
        .innerJoin(
          hrEmployees,
          eq(hrEmployeeRecordEvents.employeeId, hrEmployees.id),
        )
        .where(recordWhere),
    ]);

    const actualTotal =
      Number(lifecycleTotalRow[0]?.total ?? 0) +
      Number(recordTotalRow[0]?.total ?? 0);

    const lifecycleQuery = db
      .select({
        id: hrLifecycleEvents.id,
        employeeId: hrLifecycleEvents.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        source: sql<"lifecycle" | "record">`'lifecycle'`.as("source"),
        kind: hrLifecycleEvents.kind,
        previousStatus: hrLifecycleEvents.previousStatus,
        newStatus: hrLifecycleEvents.newStatus,
        effectiveDate: hrLifecycleEvents.effectiveDate,
        reason: hrLifecycleEvents.reason,
        approvalReference: hrLifecycleEvents.approvalReference,
        createdAt: hrLifecycleEvents.createdAt,
      })
      .from(hrLifecycleEvents)
      .innerJoin(
        hrEmployees,
        eq(hrLifecycleEvents.employeeId, hrEmployees.id),
      )
      .where(lifecycleWhere);

    const recordQuery = db
      .select({
        id: hrEmployeeRecordEvents.id,
        employeeId: hrEmployeeRecordEvents.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        source: sql<"lifecycle" | "record">`'record'`.as("source"),
        kind: sql<string>`${hrEmployeeRecordEvents.kind}::text`.as("kind"),
        previousStatus: sql<HrEmploymentStatus | null>`null`.as(
          "previous_status",
        ),
        newStatus: sql<HrEmploymentStatus | null>`null`.as("new_status"),
        effectiveDate: hrEmployeeRecordEvents.effectiveDate,
        reason: hrEmployeeRecordEvents.reason,
        approvalReference: hrEmployeeRecordEvents.approvalReference,
        createdAt: hrEmployeeRecordEvents.createdAt,
      })
      .from(hrEmployeeRecordEvents)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeRecordEvents.employeeId, hrEmployees.id),
      )
      .where(recordWhere);

    const statusHistory = unionAll(lifecycleQuery, recordQuery).as(
      "status_history",
    );

    const rows = await db
      .select()
      .from(statusHistory)
      .orderBy(desc(statusHistory.effectiveDate), desc(statusHistory.createdAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeStatusHistoryRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      displayName: displayName(row),
      source: row.source,
      kind: row.kind,
      previousStatus: row.previousStatus,
      newStatus: row.newStatus,
      effectiveDate: row.effectiveDate,
      reason: row.reason,
      approvalReference: row.approvalReference,
      createdAt: row.createdAt,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrEmployeeDocumentReferenceRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  documentType: string;
  documentGroup: string | null;
  title: string;
  verificationStatus: (typeof hrEmployeeDocuments.$inferSelect)["verificationStatus"];
  lifecycleStatus: (typeof hrEmployeeDocuments.$inferSelect)["lifecycleStatus"];
  effectiveFrom: Date;
  effectiveTo: Date | null;
  versionNumber: number;
  isLatestActive: boolean;
};

export type HrEmployeeDocumentReferencesWindow = {
  rows: readonly HrEmployeeDocumentReferenceRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrEmployeeDocumentReferencesWindow(input: {
  organizationId: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeDocumentReferencesWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployeeDocuments.organizationId, input.organizationId),
      eq(hrEmployeeDocuments.lifecycleStatus, "active"),
      eq(hrEmployeeDocuments.isLatestActive, true),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrEmployeeDocuments.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployeeDocuments.title, pattern),
          ilike(hrEmployeeDocuments.documentType, pattern),
          ilike(hrEmployeeDocuments.documentGroup, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployeeDocuments)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeDocuments.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployeeDocuments.id,
        employeeId: hrEmployeeDocuments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        documentType: hrEmployeeDocuments.documentType,
        documentGroup: hrEmployeeDocuments.documentGroup,
        title: hrEmployeeDocuments.title,
        verificationStatus: hrEmployeeDocuments.verificationStatus,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
        effectiveFrom: hrEmployeeDocuments.effectiveFrom,
        effectiveTo: hrEmployeeDocuments.effectiveTo,
        versionNumber: hrEmployeeDocuments.versionNumber,
        isLatestActive: hrEmployeeDocuments.isLatestActive,
      })
      .from(hrEmployeeDocuments)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeDocuments.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrEmployeeDocuments.createdAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeDocumentReferenceRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: displayName(row),
      documentType: row.documentType,
      documentGroup: row.documentGroup,
      title: row.title,
      verificationStatus: row.verificationStatus,
      lifecycleStatus: row.lifecycleStatus,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      versionNumber: row.versionNumber,
      isLatestActive: row.isLatestActive,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrEmployeeSeparatedRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  archivedAt: Date | null;
  departmentName: string | null;
  positionTitle: string | null;
  employmentStartDate: Date | null;
  updatedAt: Date;
};

export type HrEmployeeSeparatedWindow = {
  rows: readonly HrEmployeeSeparatedRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function separatedEmployeeCondition() {
  return or(
    sql`${hrEmployees.archivedAt} is not null`,
    eq(hrEmployees.employmentStatus, "separated"),
    eq(hrEmployees.employmentStatus, "terminated"),
    eq(hrEmployees.employmentStatus, "retired"),
    eq(hrEmployees.employmentStatus, "archived"),
  )!;
}

export async function listHrEmployeeSeparatedWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeSeparatedWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      separatedEmployeeCondition(),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employmentStatus: hrEmployees.employmentStatus,
        archivedAt: hrEmployees.archivedAt,
        departmentName: hrDepartments.name,
        positionTitle: hrPositions.title,
        employmentStartDate: hrEmployees.employmentStartDate,
        updatedAt: hrEmployees.updatedAt,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .where(whereClause)
      .orderBy(desc(hrEmployees.archivedAt), desc(hrEmployees.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeSeparatedRow[] = rows.map((row) => ({
      id: row.id,
      employeeNumber: row.employeeNumber,
      displayName: displayName(row),
      employmentStatus: row.employmentStatus,
      archivedAt: row.archivedAt,
      departmentName: row.departmentName,
      positionTitle: row.positionTitle,
      employmentStartDate: row.employmentStartDate,
      updatedAt: row.updatedAt,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export async function findHrEmployeeDuplicateCandidates(input: {
  organizationId: string;
  identityNumber?: string;
  email?: string;
  phoneNumber?: string;
  excludeEmployeeId?: string;
}): Promise<string[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const candidateIds = new Set<string>();

    const trimmedIdentity = input.identityNumber?.trim();
    if (trimmedIdentity) {
      const identityConditions = [
        eq(hrEmployeeProfiles.organizationId, input.organizationId),
        eq(hrEmployeeProfiles.identityNumber, trimmedIdentity),
      ];
      if (input.excludeEmployeeId) {
        identityConditions.push(
          ne(hrEmployeeProfiles.employeeId, input.excludeEmployeeId),
        );
      }
      const identityMatches = await db
        .select({ employeeId: hrEmployeeProfiles.employeeId })
        .from(hrEmployeeProfiles)
        .innerJoin(hrEmployees, eq(hrEmployeeProfiles.employeeId, hrEmployees.id))
        .where(and(...identityConditions, isNull(hrEmployees.archivedAt)));
      for (const match of identityMatches) {
        candidateIds.add(match.employeeId);
      }
    }

    const trimmedEmail = input.email?.trim();
    if (trimmedEmail) {
      const emailConditions = [
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.email, trimmedEmail),
        isNull(hrEmployees.archivedAt),
      ];
      if (input.excludeEmployeeId) {
        emailConditions.push(ne(hrEmployees.id, input.excludeEmployeeId));
      }
      const emailMatches = await db
        .select({ id: hrEmployees.id })
        .from(hrEmployees)
        .where(and(...emailConditions));
      for (const match of emailMatches) {
        candidateIds.add(match.id);
      }
    }

    const trimmedPhone = input.phoneNumber?.trim();
    if (trimmedPhone) {
      const phoneConditions = [
        eq(hrEmployeeProfiles.organizationId, input.organizationId),
        eq(hrEmployeeProfiles.phoneNumber, trimmedPhone),
      ];
      if (input.excludeEmployeeId) {
        phoneConditions.push(
          ne(hrEmployeeProfiles.employeeId, input.excludeEmployeeId),
        );
      }
      const phoneMatches = await db
        .select({ employeeId: hrEmployeeProfiles.employeeId })
        .from(hrEmployeeProfiles)
        .innerJoin(hrEmployees, eq(hrEmployeeProfiles.employeeId, hrEmployees.id))
        .where(and(...phoneConditions, isNull(hrEmployees.archivedAt)));
      for (const match of phoneMatches) {
        candidateIds.add(match.employeeId);
      }
    }

    return [...candidateIds];
  });
}
