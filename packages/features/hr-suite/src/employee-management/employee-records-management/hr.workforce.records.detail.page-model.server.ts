import { getHrEmployeeRecordDetail } from "@afenda/db";

import { formatRecordsEmploymentStatusLabel } from "./hr.workforce.records-list.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";
import {
  maskHrEmployeeSensitiveAddress,
  maskHrEmployeeSensitiveDateOfBirth,
  maskHrEmployeeSensitiveEmail,
  maskHrEmployeeSensitiveIdentity,
  maskHrEmployeeSensitivePhone,
} from "./hr.workforce.records-sensitive-access.shared";

function formatRecordsOptionalDate(value: Date | null | undefined): string {
  return value ? value.toLocaleDateString() : "";
}

function formatRecordsOptionalDateTime(value: Date | null | undefined): string {
  return value ? value.toLocaleString() : "";
}

function formatRecordsCodeLabel(value: string | null | undefined): string {
  return value?.replace(/_/g, " ") ?? "";
}

export type HrEmployeeRecordDetailPageModelInput = {
  organizationId: string;
  employeeId: string;
  canViewSensitive: boolean;
};

export type HrEmployeeRecordDetailPageModel = {
  copy: typeof hrRecordsUiCopy;
  canViewSensitive: boolean;
  employee: {
    id: string;
    employeeNumber: string;
    displayName: string;
    legalName: string;
    preferredName: string | null;
    email: string;
    identityNumber: string;
    identityDocumentType: string;
    nationality: string;
    phoneNumber: string;
    personalEmail: string;
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    languagePreference: string;
    residentialAddress: string;
    mailingAddress: string;
    employmentStatus: string;
    employmentStartDate: string;
    probationEndDate: string;
    confirmationDate: string;
    employmentType: string;
    workerCategory: string;
    grade: string;
    level: string;
    legalEntityCode: string;
    workLocationCode: string;
    countryCode: string;
    contractStartDate: string;
    contractEndDate: string;
    departmentName: string | null;
    positionTitle: string | null;
    managerDisplayName: string | null;
    matrixManagerDisplayName: string | null;
    hrOwnerDisplayName: string | null;
    emergencyContacts: readonly {
      id: string;
      contactName: string;
      relationship: string;
      phoneNumber: string;
      isPriority: boolean;
    }[];
    rehiredFrom: {
      employeeNumber: string;
      displayName: string;
    } | null;
    payrollReadyAt: string;
    complianceReadyAt: string;
    archivedAt: Date | null;
    createdAt: string;
    updatedAt: string;
  };
};

export async function buildHrEmployeeRecordDetailPageModel(
  input: HrEmployeeRecordDetailPageModelInput,
): Promise<HrEmployeeRecordDetailPageModel | null> {
  const detail = await getHrEmployeeRecordDetail({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });

  if (!detail) {
    return null;
  }

  const profile = detail.profile;
  const canViewSensitive = input.canViewSensitive;

  return {
    copy: hrRecordsUiCopy,
    canViewSensitive,
    employee: {
      id: detail.id,
      employeeNumber: detail.employeeNumber,
      displayName: detail.displayName,
      legalName: detail.legalName,
      preferredName: detail.preferredName,
      email: maskHrEmployeeSensitiveEmail(detail.email, canViewSensitive),
      identityDocumentType: formatRecordsCodeLabel(
        profile?.identityDocumentType,
      ),
      identityNumber: maskHrEmployeeSensitiveIdentity(
        profile?.identityNumber,
        canViewSensitive,
      ),
      nationality: profile?.nationality ?? "",
      phoneNumber: maskHrEmployeeSensitivePhone(
        profile?.phoneNumber,
        canViewSensitive,
      ),
      personalEmail: maskHrEmployeeSensitiveEmail(
        profile?.personalEmail,
        canViewSensitive,
      ),
      dateOfBirth: maskHrEmployeeSensitiveDateOfBirth(
        profile?.dateOfBirth,
        canViewSensitive,
      ),
      gender: formatRecordsCodeLabel(profile?.gender),
      maritalStatus: formatRecordsCodeLabel(profile?.maritalStatus),
      languagePreference: profile?.languagePreference ?? "",
      residentialAddress: maskHrEmployeeSensitiveAddress(
        profile?.residentialAddress,
        canViewSensitive,
      ),
      mailingAddress: maskHrEmployeeSensitiveAddress(
        profile?.mailingAddress,
        canViewSensitive,
      ),
      employmentStatus: formatRecordsEmploymentStatusLabel(
        detail.employmentStatus,
      ),
      employmentStartDate: formatRecordsOptionalDate(
        detail.employmentStartDate,
      ),
      probationEndDate: formatRecordsOptionalDate(detail.probationEndDate),
      confirmationDate: formatRecordsOptionalDate(detail.confirmationDate),
      employmentType: detail.employmentType ?? "",
      workerCategory: detail.workerCategory ?? "",
      grade: detail.grade ?? "",
      level: detail.level ?? "",
      legalEntityCode: detail.legalEntityCode ?? "",
      workLocationCode: detail.workLocationCode ?? "",
      countryCode: detail.countryCode ?? "",
      contractStartDate: formatRecordsOptionalDate(detail.contractStartDate),
      contractEndDate: formatRecordsOptionalDate(detail.contractEndDate),
      departmentName: detail.departmentName,
      positionTitle: detail.positionTitle,
      managerDisplayName: detail.managerDisplayName,
      matrixManagerDisplayName: detail.matrixManagerDisplayName,
      hrOwnerDisplayName: detail.hrOwnerDisplayName,
      emergencyContacts: detail.emergencyContacts.map((contact) => ({
        id: contact.id,
        contactName: contact.contactName,
        relationship: contact.relationship,
        phoneNumber: maskHrEmployeeSensitivePhone(
          contact.phoneNumber,
          canViewSensitive,
        ),
        isPriority: contact.isPriority,
      })),
      rehiredFrom: detail.rehiredFrom
        ? {
            employeeNumber: detail.rehiredFrom.employeeNumber,
            displayName: detail.rehiredFrom.displayName,
          }
        : null,
      payrollReadyAt: formatRecordsOptionalDateTime(profile?.payrollReadyAt),
      complianceReadyAt: formatRecordsOptionalDateTime(
        profile?.complianceReadyAt,
      ),
      archivedAt: detail.archivedAt,
      createdAt: formatRecordsOptionalDateTime(detail.createdAt),
      updatedAt: formatRecordsOptionalDateTime(detail.updatedAt),
    },
  };
}

export function toHrEmployeeRecordDetailPageModelInput(input: {
  organizationId: string;
  employeeId: string;
  canViewSensitive: boolean;
}): HrEmployeeRecordDetailPageModelInput {
  return {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    canViewSensitive: input.canViewSensitive,
  };
}
