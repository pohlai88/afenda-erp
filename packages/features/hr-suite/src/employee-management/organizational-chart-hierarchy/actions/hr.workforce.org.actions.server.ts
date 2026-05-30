"use server";

import {
  exportHrOrgStructureRows,
  HrOrgCommandError,
  resolveHrManagerApprovalChain,
  upsertHrOrgPosition,
  upsertHrOrgUnit,
  upsertHrReportingRelationship,
} from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";

import { hrOrgRoutePaths } from "../contracts/hr.workforce.org-route.contract";
import { toOrgActionFailure } from "../data/hr.workforce.org-action-result.shared";
import {
  requireHrOrgRead,
  requireHrOrgWrite,
} from "../policies/hr.workforce.org-access.policy.server";
import {
  readOptionalOrgFormField,
  upsertHrOrgPositionFormSchema,
  upsertHrOrgUnitFormSchema,
  upsertHrReportingRelationshipFormSchema,
} from "../schemas/hr.workforce.org-form.shared";

function parseOptionalDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function revalidateOrgWorkbench() {
  revalidatePath(hrOrgRoutePaths.org);
}

export async function upsertHrOrgUnitAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrOrgWrite();
  const parsed = upsertHrOrgUnitFormSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    code: readOptionalOrgFormField(formData, "code"),
    name: readOptionalOrgFormField(formData, "name"),
    unitType: readOptionalOrgFormField(formData, "unitType"),
    parentDepartmentId: readOptionalOrgFormField(formData, "parentDepartmentId"),
    managerEmployeeId: readOptionalOrgFormField(formData, "managerEmployeeId"),
    costCenterCode: readOptionalOrgFormField(formData, "costCenterCode"),
    locationCode: readOptionalOrgFormField(formData, "locationCode"),
    legalEntityCode: readOptionalOrgFormField(formData, "legalEntityCode"),
    orgUnitStatus: readOptionalOrgFormField(formData, "orgUnitStatus"),
    effectiveFrom: readOptionalOrgFormField(formData, "effectiveFrom"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await upsertHrOrgUnit({
      organizationId: guard.organization.id,
      id: parsed.data.id,
      code: parsed.data.code,
      name: parsed.data.name,
      unitType: parsed.data.unitType,
      parentDepartmentId: parsed.data.parentDepartmentId ?? null,
      managerEmployeeId: parsed.data.managerEmployeeId ?? null,
      costCenterCode: parsed.data.costCenterCode ?? null,
      locationCode: parsed.data.locationCode ?? null,
      legalEntityCode: parsed.data.legalEntityCode ?? null,
      orgUnitStatus: parsed.data.orgUnitStatus,
      effectiveFrom: parseOptionalDate(parsed.data.effectiveFrom),
      changedByUserId: guard.session.id,
    });
    revalidateOrgWorkbench();
    return actionSuccess();
  } catch (error) {
    return toOrgActionFailure(error);
  }
}

export async function upsertHrOrgPositionAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrOrgWrite();
  const parsed = upsertHrOrgPositionFormSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    code: readOptionalOrgFormField(formData, "code"),
    title: readOptionalOrgFormField(formData, "title"),
    departmentId: readOptionalOrgFormField(formData, "departmentId"),
    managerEmployeeId: readOptionalOrgFormField(formData, "managerEmployeeId"),
    costCenterCode: readOptionalOrgFormField(formData, "costCenterCode"),
    locationCode: readOptionalOrgFormField(formData, "locationCode"),
    positionStatus: readOptionalOrgFormField(formData, "positionStatus"),
    effectiveFrom: readOptionalOrgFormField(formData, "effectiveFrom"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await upsertHrOrgPosition({
      organizationId: guard.organization.id,
      id: parsed.data.id,
      code: parsed.data.code,
      title: parsed.data.title,
      departmentId: parsed.data.departmentId,
      managerEmployeeId: parsed.data.managerEmployeeId ?? null,
      costCenterCode: parsed.data.costCenterCode ?? null,
      locationCode: parsed.data.locationCode ?? null,
      positionStatus: parsed.data.positionStatus,
      effectiveFrom: parseOptionalDate(parsed.data.effectiveFrom),
      changedByUserId: guard.session.id,
    });
    revalidateOrgWorkbench();
    return actionSuccess();
  } catch (error) {
    return toOrgActionFailure(error);
  }
}

export async function upsertHrReportingRelationshipAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrOrgWrite();
  const parsed = upsertHrReportingRelationshipFormSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    employeeId: readOptionalOrgFormField(formData, "employeeId"),
    managerEmployeeId: readOptionalOrgFormField(formData, "managerEmployeeId"),
    relationshipType: readOptionalOrgFormField(formData, "relationshipType"),
    effectiveFrom: readOptionalOrgFormField(formData, "effectiveFrom"),
    reason: readOptionalOrgFormField(formData, "reason"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await upsertHrReportingRelationship({
      organizationId: guard.organization.id,
      id: parsed.data.id,
      employeeId: parsed.data.employeeId,
      managerEmployeeId: parsed.data.managerEmployeeId,
      relationshipType: parsed.data.relationshipType,
      effectiveFrom: parseOptionalDate(parsed.data.effectiveFrom),
      reason: parsed.data.reason ?? null,
      changedByUserId: guard.session.id,
    });
    revalidateOrgWorkbench();
    return actionSuccess();
  } catch (error) {
    return toOrgActionFailure(error);
  }
}

export async function exportHrOrgStructureAction(): Promise<ActionResult & {
  rows?: Awaited<ReturnType<typeof exportHrOrgStructureRows>>;
}> {
  const guard = await requireHrOrgRead();

  try {
    const rows = await exportHrOrgStructureRows({
      organizationId: guard.organization.id,
    });
    return { ok: true, rows };
  } catch (error) {
    if (error instanceof HrOrgCommandError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Export failed." };
  }
}

export async function resolveHrManagerApprovalChainAction(input: {
  employeeId: string;
}) {
  const guard = await requireHrOrgRead();
  return resolveHrManagerApprovalChain({
    organizationId: guard.organization.id,
    employeeId: input.employeeId,
  });
}
