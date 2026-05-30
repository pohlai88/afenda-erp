import { getHrEmployeeRecordDetail } from "@afenda/db";

import { formatRecordsEmploymentStatusLabel } from "../surface/hr.workforce.records-list.shared";
import { hrRecordsUiCopy } from "../surface/hr.workforce.records-ui.copy.shared";
import {
  maskHrEmployeeSensitiveAddress,
  maskHrEmployeeSensitiveDateOfBirth,
  maskHrEmployeeSensitiveEmail,
  maskHrEmployeeSensitiveIdentity,
  maskHrEmployeeSensitivePhone,
} from "./hr.workforce.records-sensitive-access.shared";

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
    phoneNumber: string;
    dateOfBirth: string;
    residentialAddress: string;
    employmentStatus: string;
    departmentName: string | null;
    positionTitle: string | null;
    managerDisplayName: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
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
      identityNumber: maskHrEmployeeSensitiveIdentity(
        profile?.identityNumber,
        canViewSensitive,
      ),
      phoneNumber: maskHrEmployeeSensitivePhone(
        profile?.phoneNumber,
        canViewSensitive,
      ),
      dateOfBirth: maskHrEmployeeSensitiveDateOfBirth(
        profile?.dateOfBirth,
        canViewSensitive,
      ),
      residentialAddress: maskHrEmployeeSensitiveAddress(
        profile?.residentialAddress,
        canViewSensitive,
      ),
      employmentStatus: formatRecordsEmploymentStatusLabel(
        detail.employmentStatus,
      ),
      departmentName: detail.departmentName,
      positionTitle: detail.positionTitle,
      managerDisplayName: detail.managerDisplayName,
      archivedAt: detail.archivedAt,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
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
