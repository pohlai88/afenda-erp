import {
  cancelHrFwaRequest,
  decideHrFwaRequest,
  renewHrFwaArrangement,
  suspendHrFwaArrangement,
  terminateHrFwaArrangement,
  type HrFwaRequestDecision,
} from "@afenda/db";

export type HrFwaApprovalDecisionInput = {
  organizationId: string;
  requestId: string;
  decision: HrFwaRequestDecision;
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
  actorCanDepartmentApprove?: boolean;
  actorManagerEmployeeIds?: readonly string[];
  rejectionReason?: string | null;
  decisionNote?: string | null;
  returnedNote?: string | null;
  exceptionReason?: string | null;
};

export async function decideHrFwaApprovalRequest(
  input: HrFwaApprovalDecisionInput,
): Promise<{ requestId: string; status: string; arrangementId?: string }> {
  const decisionNote =
    input.decision === "exception_approve"
      ? input.exceptionReason?.trim() || input.decisionNote?.trim() || null
      : input.decisionNote?.trim() || null;

  return decideHrFwaRequest({
    organizationId: input.organizationId,
    requestId: input.requestId,
    decision: input.decision,
    actorAuthUserId: input.actorAuthUserId,
    actorCanHrApprove: input.actorCanHrApprove,
    actorCanDepartmentApprove: input.actorCanDepartmentApprove,
    actorManagerEmployeeIds: input.actorManagerEmployeeIds,
    rejectionReason: input.rejectionReason,
    decisionNote,
    returnedNote: input.returnedNote,
  });
}

export async function suspendHrFwaApprovedArrangement(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  suspensionReason: string;
}): Promise<{ arrangementId: string }> {
  return suspendHrFwaArrangement(input);
}

export async function terminateHrFwaApprovedArrangement(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  terminationReason: string;
}): Promise<{ arrangementId: string }> {
  return terminateHrFwaArrangement(input);
}

export async function renewHrFwaApprovedArrangement(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  newEffectiveTo: Date;
  renewalReason?: string | null;
}): Promise<{ arrangementId: string }> {
  return renewHrFwaArrangement(input);
}

export async function cancelHrFwaPendingRequest(input: {
  organizationId: string;
  requestId: string;
}): Promise<{ requestId: string }> {
  return cancelHrFwaRequest(input);
}
