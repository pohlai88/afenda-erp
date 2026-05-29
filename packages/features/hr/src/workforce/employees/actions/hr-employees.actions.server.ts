"use server";

import {
  archiveHrEmployee,
  createHrEmployee,
  HrEmployeeCommandError,
  updateHrEmployeeCore,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { hrWorkforceRoutes } from "../../../contracts/hr-workforce-routes.shared";
import { revalidatePath } from "next/cache";
import { hrEmployeeAuditActions } from "../events/hr-employees.event";
import { requireHrEmployeesWrite } from "../policies/hr-employees.policy.server";
import {
  hrArchiveEmployeeActionSchema,
  hrCreateEmployeeActionSchema,
  hrUpdateEmployeeActionSchema,
} from "../schemas/hr-employee-mutation.schema";

function revalidateHrWorkforceSurfaces(employeeId?: string) {
  revalidatePath(hrWorkforceRoutes.hub);
  revalidatePath(hrWorkforceRoutes.employees);
  revalidatePath("/hr/org-chart");
  if (employeeId) {
    revalidatePath(hrWorkforceRoutes.employeeDetail(employeeId));
  }
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrEmployeeCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR workforce mutation failed.",
    undefined,
    "unknown",
  );
}

export async function createHrEmployeeAction(
  formData: FormData,
): Promise<ActionResult<{ employeeId: string }>> {
  const { context } = await requireHrEmployeesWrite();

  const parsed = hrCreateEmployeeActionSchema.safeParse({
    employeeNumber: formData.get("employeeNumber"),
    legalName: formData.get("legalName"),
    preferredName: formData.get("preferredName"),
    email: formData.get("email"),
    currentDepartmentId: formData.get("currentDepartmentId"),
    currentPositionId: formData.get("currentPositionId"),
    managerEmployeeId: formData.get("managerEmployeeId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const placement =
    parsed.data.currentDepartmentId !== undefined ||
    parsed.data.currentPositionId !== undefined ||
    parsed.data.managerEmployeeId !== undefined
      ? {
          currentDepartmentId: parsed.data.currentDepartmentId ?? null,
          currentPositionId: parsed.data.currentPositionId ?? null,
          managerEmployeeId: parsed.data.managerEmployeeId ?? null,
        }
      : undefined;

  try {
    const result = await createHrEmployee({
      organizationId: context.organizationId,
      employeeNumber: parsed.data.employeeNumber,
      legalName: parsed.data.legalName,
      preferredName: parsed.data.preferredName,
      email:
        parsed.data.email === "" ? null : (parsed.data.email ?? undefined),
      placement,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrEmployeeAuditActions.create,
      targetType: "hr_employee",
      targetId: result.employeeId,
      metadata: {
        employeeNumber: parsed.data.employeeNumber,
        assignmentId: result.assignmentId,
      },
    });

    revalidateHrWorkforceSurfaces(result.employeeId);
    return actionSuccess({ employeeId: result.employeeId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function updateHrEmployeeAction(
  formData: FormData,
): Promise<ActionResult<{ employeeId: string; changedFields: string[] }>> {
  const { context } = await requireHrEmployeesWrite();

  const parsed = hrUpdateEmployeeActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    employeeNumber: formData.get("employeeNumber"),
    legalName: formData.get("legalName"),
    preferredName: formData.get("preferredName"),
    email: formData.get("email"),
    currentDepartmentId: formData.get("currentDepartmentId"),
    currentPositionId: formData.get("currentPositionId"),
    managerEmployeeId: formData.get("managerEmployeeId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const placement =
    parsed.data.currentDepartmentId !== undefined ||
    parsed.data.currentPositionId !== undefined ||
    parsed.data.managerEmployeeId !== undefined
      ? {
          currentDepartmentId: parsed.data.currentDepartmentId,
          currentPositionId: parsed.data.currentPositionId,
          managerEmployeeId: parsed.data.managerEmployeeId,
        }
      : undefined;

  try {
    const result = await updateHrEmployeeCore({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      employeeNumber: parsed.data.employeeNumber,
      legalName: parsed.data.legalName,
      preferredName: parsed.data.preferredName,
      email:
        parsed.data.email === "" ? null : parsed.data.email,
      placement,
    });

    if (result.changedFields.length > 0) {
      await writeExecutionAuditEvent({
        organizationId: context.organizationId,
        actorId: context.userId,
        actorType: context.actorType,
        action: hrEmployeeAuditActions.update,
        targetType: "hr_employee",
        targetId: result.employeeId,
        metadata: {
          changedFields: result.changedFields,
          assignmentId: result.assignmentId,
        },
      });
    }

    revalidateHrWorkforceSurfaces(result.employeeId);
    return actionSuccess({
      employeeId: result.employeeId,
      changedFields: result.changedFields,
    });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function archiveHrEmployeeAction(
  formData: FormData,
): Promise<ActionResult<{ employeeId: string }>> {
  const { context } = await requireHrEmployeesWrite();

  const parsed = hrArchiveEmployeeActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await archiveHrEmployee({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrEmployeeAuditActions.archive,
      targetType: "hr_employee",
      targetId: result.employeeId,
    });

    revalidateHrWorkforceSurfaces(result.employeeId);
    return actionSuccess({ employeeId: result.employeeId });
  } catch (error) {
    return mapCommandError(error);
  }
}
