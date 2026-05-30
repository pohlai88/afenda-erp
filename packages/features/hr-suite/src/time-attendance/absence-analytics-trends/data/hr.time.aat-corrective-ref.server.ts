import "@afenda/kernel/server";

import { and, eq, gte, inArray, lte } from "drizzle-orm";
import {
  createEntityId,
  hrAatCorrectiveActionRefs,
  hrEmployees,
  runWithOrganizationContext,
} from "@afenda/db";

import {
  formatHrAatCorrectiveActionKindLabel,
  hrAatCorrectiveActionRefRowSchema,
  linkHrAatCorrectiveActionRefFormSchema,
  type HrAatCorrectiveActionRefRow,
  type LinkHrAatCorrectiveActionRefInput,
} from "../schemas/hr.time.aat-risk.schema";

function displayName(input: {
  preferredName: string | null;
  legalName: string;
}): string {
  return input.preferredName?.trim() || input.legalName;
}

export class HrAatCorrectiveRefError extends Error {
  readonly code:
    | "aat_invalid_corrective_ref"
    | "aat_employee_not_visible"
    | "aat_employee_not_found";

  constructor(code: HrAatCorrectiveRefError["code"], message: string) {
    super(message);
    this.name = "HrAatCorrectiveRefError";
    this.code = code;
  }
}

function parseLinkInput(input: unknown): LinkHrAatCorrectiveActionRefInput {
  const parsed = linkHrAatCorrectiveActionRefFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new HrAatCorrectiveRefError(
      "aat_invalid_corrective_ref",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }
  return parsed.data;
}

/** HRM-AAT-021 — list corrective action references for period and scope. */
export async function listHrAatCorrectiveActionRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
  insightKind?: string;
  visibleEmployeeIds: readonly string[] | null;
}): Promise<readonly HrAatCorrectiveActionRefRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAatCorrectiveActionRefs.organizationId, input.organizationId),
      lte(hrAatCorrectiveActionRefs.periodStart, input.periodEnd),
      gte(hrAatCorrectiveActionRefs.periodEnd, input.periodStart),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrAatCorrectiveActionRefs.employeeId, input.employeeId));
    }
    if (input.insightKind) {
      conditions.push(eq(hrAatCorrectiveActionRefs.insightKind, input.insightKind));
    }
    if (input.visibleEmployeeIds) {
      if (input.visibleEmployeeIds.length === 0) {
        return [];
      }
      conditions.push(
        inArray(hrAatCorrectiveActionRefs.employeeId, [...input.visibleEmployeeIds]),
      );
    }

    const rows = await db
      .select({
        id: hrAatCorrectiveActionRefs.id,
        employeeId: hrAatCorrectiveActionRefs.employeeId,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        insightKind: hrAatCorrectiveActionRefs.insightKind,
        insightRef: hrAatCorrectiveActionRefs.insightRef,
        actionKind: hrAatCorrectiveActionRefs.actionKind,
        externalReference: hrAatCorrectiveActionRefs.externalReference,
        periodStart: hrAatCorrectiveActionRefs.periodStart,
        periodEnd: hrAatCorrectiveActionRefs.periodEnd,
        notes: hrAatCorrectiveActionRefs.notes,
        createdAt: hrAatCorrectiveActionRefs.createdAt,
      })
      .from(hrAatCorrectiveActionRefs)
      .innerJoin(hrEmployees, eq(hrAatCorrectiveActionRefs.employeeId, hrEmployees.id))
      .where(and(...conditions))
      .orderBy(hrAatCorrectiveActionRefs.createdAt);

    return rows.map((row) => {
      const mapped = {
        id: row.id,
        employeeId: row.employeeId,
        employeeDisplayName: displayName(row),
        insightKind: row.insightKind,
        insightRef: row.insightRef,
        actionKind: row.actionKind,
        actionKindLabel: formatHrAatCorrectiveActionKindLabel(row.actionKind),
        externalReference: row.externalReference,
        periodStart: row.periodStart,
        periodEnd: row.periodEnd,
        notes: row.notes,
        createdAt: row.createdAt,
      };
      return hrAatCorrectiveActionRefRowSchema.parse(mapped);
    });
  });
}

/** HRM-AAT-021 — link an absence insight to a corrective action reference. */
export async function linkHrAatCorrectiveActionRef(input: {
  organizationId: string;
  payload: unknown;
  createdByAuthUserId: string;
  visibleEmployeeIds: readonly string[] | null;
}): Promise<HrAatCorrectiveActionRefRow> {
  const payload = parseLinkInput(input.payload);

  if (
    input.visibleEmployeeIds &&
    !input.visibleEmployeeIds.includes(payload.employeeId)
  ) {
    throw new HrAatCorrectiveRefError(
      "aat_employee_not_visible",
      "Employee is outside the resolved visibility scope",
    );
  }

  const id = createEntityId("hr_aat_corrective");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({
        employeeId: hrEmployees.id,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, payload.employeeId),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrAatCorrectiveRefError(
        "aat_employee_not_found",
        "Employee not found in organization",
      );
    }

    await db.insert(hrAatCorrectiveActionRefs).values({
      id,
      organizationId: input.organizationId,
      employeeId: payload.employeeId,
      insightKind: payload.insightKind,
      insightRef: payload.insightRef ?? null,
      actionKind: payload.actionKind,
      externalReference: payload.externalReference,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      notes: payload.notes ?? null,
      createdByAuthUserId: input.createdByAuthUserId,
    });
  });

  const rows = await listHrAatCorrectiveActionRefs({
    organizationId: input.organizationId,
    periodStart: payload.periodStart,
    periodEnd: payload.periodEnd,
    employeeId: payload.employeeId,
    visibleEmployeeIds: null,
  });
  const created = rows.find((row) => row.id === id);
  if (!created) {
    throw new HrAatCorrectiveRefError(
      "aat_invalid_corrective_ref",
      "Corrective reference was not persisted",
    );
  }
  return created;
}
