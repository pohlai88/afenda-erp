import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import {
  hrEmployeeDetailRoutePath,
  hrRecordsRoutePaths,
} from "./hr.workforce.records-route.contract";
import type { HrRecordsAuditAction } from "./hr.workforce.records.event";
import { toRecordsActionFailure } from "./hr.workforce.records-action-result.shared";

const RECORDS_REVALIDATE_PATHS = [
  hrRecordsRoutePaths.records,
  hrRecordsRoutePaths.employees,
] as const;

export type RecordsMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrRecordsAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeRecordsMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<RecordsMutationAudit>,
  options?: { employeeId?: string },
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_employee",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toRecordsActionFailure(error);
  }

  for (const path of RECORDS_REVALIDATE_PATHS) {
    revalidatePath(path);
  }

  if (options?.employeeId) {
    revalidatePath(hrEmployeeDetailRoutePath(options.employeeId));
  }

  return actionSuccess(undefined);
}
