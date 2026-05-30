import {
  enqueueHrAatNotification,
  listHrAatHrOperatorAuthUserIds,
  listHrAatNotificationsWindow,
  resolveAuthUserIdForHrEmployee,
  hrEmployees,
  runWithOrganizationContext,
} from "@afenda/db";
import { and, eq } from "drizzle-orm";

import type { HrAatAbsenceRiskIndicator } from "../schemas/hr.time.aat-risk.schema";
import { formatHrAatAbsenceRiskLevelLabel } from "../schemas/hr.time.aat-risk.schema";
import { emitHrAatAuditEvent } from "./hr.time.aat-audit.server";
import { hrTimeAatAuditActions } from "../events/hr.time.aat.event";

export type HrAatNotificationWindow = Awaited<
  ReturnType<typeof listHrAatNotificationsWindow>
>;

const AAT_RISK_SUBJECT_TYPE = "hr_aat_employee_risk" as const;

function buildRiskSubjectId(input: {
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  riskLevel: string;
}): string {
  return [
    input.employeeId,
    input.periodStart.toISOString().slice(0, 10),
    input.periodEnd.toISOString().slice(0, 10),
    input.riskLevel,
  ].join(":");
}

function buildRiskNotificationCopy(indicator: HrAatAbsenceRiskIndicator): {
  title: string;
  body: string;
} {
  const levelLabel = formatHrAatAbsenceRiskLevelLabel(indicator.riskLevel);
  return {
    title: `${levelLabel} absence risk — ${indicator.employeeDisplayName}`,
    body: `${indicator.employeeDisplayName} (${indicator.employeeNumber}) is classified as ${levelLabel} with ${indicator.absenceRatePercent}% absence rate and ${indicator.absenceFrequency} absence episodes in the selected period.`,
  };
}

/** HRM-AAT-027 — notify HR operators and direct managers when risk exceeds thresholds. */
export async function syncHrAatRiskThresholdNotifications(input: {
  organizationId: string;
  actorAuthUserId: string;
  indicators: readonly HrAatAbsenceRiskIndicator[];
}): Promise<{ enqueuedCount: number }> {
  const elevated = input.indicators.filter(
    (indicator) => indicator.riskLevel !== "normal",
  );

  if (elevated.length === 0) {
    return { enqueuedCount: 0 };
  }

  const hrOperatorIds = await listHrAatHrOperatorAuthUserIds({
    organizationId: input.organizationId,
  });

  let enqueuedCount = 0;

  for (const indicator of elevated) {
    const copy = buildRiskNotificationCopy(indicator);
    const subjectId = buildRiskSubjectId({
      employeeId: indicator.employeeId,
      periodStart: indicator.periodStart,
      periodEnd: indicator.periodEnd,
      riskLevel: indicator.riskLevel,
    });

    const managerAuthUserId = await resolveManagerAuthUserId({
      organizationId: input.organizationId,
      employeeId: indicator.employeeId,
    });

    const recipients: Array<{
      authUserId: string;
      role: "hr" | "manager";
    }> = hrOperatorIds.map((authUserId) => ({
      authUserId,
      role: "hr" as const,
    }));

    if (managerAuthUserId) {
      recipients.push({ authUserId: managerAuthUserId, role: "manager" });
    }

    const uniqueRecipients = dedupeRecipients(recipients);

    for (const recipient of uniqueRecipients) {
      const result = await enqueueHrAatNotification({
        organizationId: input.organizationId,
        recipientAuthUserId: recipient.authUserId,
        recipientRole: recipient.role,
        kind: "risk_threshold_exceeded",
        subjectType: AAT_RISK_SUBJECT_TYPE,
        subjectId,
        employeeId: indicator.employeeId,
        riskLevel: indicator.riskLevel,
        title: copy.title,
        body: copy.body,
      });

      if (result.created) {
        enqueuedCount += 1;
        await emitHrAatAuditEvent({
          organizationId: input.organizationId,
          actorAuthUserId: input.actorAuthUserId,
          action: hrTimeAatAuditActions.notification.enqueued,
          targetType: AAT_RISK_SUBJECT_TYPE,
          targetId: result.notificationId,
          summary: copy.title,
          metadata: {
            employeeId: indicator.employeeId,
            riskLevel: indicator.riskLevel,
            recipientRole: recipient.role,
            recipientAuthUserId: recipient.authUserId,
          },
        });
      }
    }
  }

  return { enqueuedCount };
}

/** HRM-AAT-029 — audit risk review acknowledgement. */
export async function recordHrAatRiskReview(input: {
  organizationId: string;
  actorAuthUserId: string;
  employeeId: string;
  riskLevel: string;
  notes?: string;
}): Promise<void> {
  await emitHrAatAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeAatAuditActions.risk.reviewed,
    targetType: "hr_aat_employee_risk",
    targetId: input.employeeId,
    summary: input.notes ?? "Absence risk reviewed.",
    metadata: {
      employeeId: input.employeeId,
      riskLevel: input.riskLevel,
    },
  });
}

/** HRM-AAT-027 — list risk notifications for workbench. */
export async function listHrAatRiskNotifications(input: {
  organizationId: string;
  recipientAuthUserId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrAatNotificationWindow> {
  return listHrAatNotificationsWindow({
    organizationId: input.organizationId,
    recipientAuthUserId: input.recipientAuthUserId,
    limit: input.limit,
    offset: input.offset,
    search: input.search,
  });
}

async function resolveManagerAuthUserId(input: {
  organizationId: string;
  employeeId: string;
}): Promise<string | null> {
  const managerEmployeeId = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select({ managerEmployeeId: hrEmployees.managerEmployeeId })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            eq(hrEmployees.id, input.employeeId),
          ),
        )
        .limit(1);
      return row?.managerEmployeeId ?? null;
    },
  );

  if (!managerEmployeeId) {
    return null;
  }

  return resolveAuthUserIdForHrEmployee({
    organizationId: input.organizationId,
    employeeId: managerEmployeeId,
  });
}

function dedupeRecipients(
  recipients: readonly { authUserId: string; role: "hr" | "manager" }[],
): Array<{ authUserId: string; role: "hr" | "manager" }> {
  const seen = new Set<string>();
  const unique: Array<{ authUserId: string; role: "hr" | "manager" }> = [];
  for (const recipient of recipients) {
    if (seen.has(recipient.authUserId)) {
      continue;
    }
    seen.add(recipient.authUserId);
    unique.push(recipient);
  }
  return unique;
}
