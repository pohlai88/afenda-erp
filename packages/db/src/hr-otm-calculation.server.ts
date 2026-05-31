import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import {
  appendHrOvertimeAuditEvent,
  HrOtmCommandError,
} from "./hr-otm";
import { buildOtmCalculationSnapshot } from "./hr-otm-calculation.shared";
import type { HrOvertimeType } from "./hr-otm.shared";
import { hrOvertimeRequests } from "./schema/hr";

export { buildOtmCalculationSnapshot } from "./hr-otm-calculation.shared";
export * from "./hr-otm-calculation.shared";

export async function applyHrOvertimeCalculationSnapshot(input: {
  organizationId: string;
  requestId: string;
  rawMinutes: number;
  overtimeType: HrOvertimeType;
  hourlyRateCents?: number;
  payMultiplier?: number;
  earningCode?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{
  payableMinutes: number;
  amountCents: number;
  earningCode: string;
}> {
  const snapshot = buildOtmCalculationSnapshot({
    rawMinutes: input.rawMinutes,
    overtimeType: input.overtimeType,
    hourlyRateCents: input.hourlyRateCents,
    payMultiplier: input.payMultiplier,
    earningCode: input.earningCode,
  });

  await runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(hrOvertimeRequests)
      .set({
        payableMinutes: snapshot.payableMinutes,
        amountCents: snapshot.amountCents,
        earningCode: snapshot.earningCode,
      })
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.id, input.requestId),
        ),
      )
      .returning({ id: hrOvertimeRequests.id });

    if (!updated) {
      throw new HrOtmCommandError("request_not_found");
    }
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    action: "calculation_apply",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime calculation snapshot applied",
    metadata: {
      payableMinutes: snapshot.payableMinutes,
      amountCents: snapshot.amountCents,
      earningCode: snapshot.earningCode,
      payMultiplier: snapshot.payMultiplier,
      hourlyRateCents: snapshot.hourlyRateCents,
    },
  });

  return {
    payableMinutes: snapshot.payableMinutes,
    amountCents: snapshot.amountCents,
    earningCode: snapshot.earningCode,
  };
}
