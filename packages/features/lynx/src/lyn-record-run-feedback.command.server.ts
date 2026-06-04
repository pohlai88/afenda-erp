import { recordLynxRunFeedbackDomain } from "./lyn-record-run-feedback.domain.server";
import { assertLynxRunFeedbackAccess } from "./lyn-run-feedback-access.policy.server";
import type { LynxLiveRunFeedbackRequest } from "./lyn-run-feedback.schema";

export async function executeLynxRecordRunFeedbackCommand(input: {
  organizationId: string;
  userAuthId: string;
  capabilities: readonly string[];
  request: LynxLiveRunFeedbackRequest;
  requestId: string;
}): Promise<{ feedbackId: string } | null> {
  assertLynxRunFeedbackAccess({
    capabilities: input.capabilities,
  });

  return recordLynxRunFeedbackDomain({
    organizationId: input.organizationId,
    userAuthId: input.userAuthId,
    request: input.request,
    requestId: input.requestId,
  });
}
