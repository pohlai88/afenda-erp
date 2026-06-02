import {
  getLynxRunDetail,
  recordLynxRunFeedback,
} from "../data/lynx.run-ledger.repository.server";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  buildLynxRunFeedbackRecordedEventMetadata,
  LYNX_RUN_FEEDBACK_AUDIT_ACTION,
} from "../events/lynx.run-feedback.event";
import type { LynxLiveRunFeedbackRequest } from "../schemas/lynx.run-feedback.schema";

export async function recordLynxRunFeedbackDomain(input: {
  organizationId: string;
  userAuthId: string;
  request: LynxLiveRunFeedbackRequest;
  requestId: string;
}): Promise<{ feedbackId: string } | null> {
  const run = await getLynxRunDetail({
    organizationId: input.organizationId,
    runId: input.request.runId,
  });

  if (!run) {
    return null;
  }

  const metadata = buildLynxRunFeedbackRecordedEventMetadata({
    request: input.request,
    requestId: input.requestId,
    runRoute: run.route,
    workflowId: run.workflowId,
    workflowSessionId: run.workflowSessionId,
  });

  const feedbackId = await recordLynxRunFeedback({
    organizationId: input.organizationId,
    runId: input.request.runId,
    userAuthId: input.userAuthId,
    rating: input.request.rating,
    category: input.request.category,
    note: input.request.note ?? "",
    metadata,
  });

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.userAuthId,
    actorType: "user",
    action: LYNX_RUN_FEEDBACK_AUDIT_ACTION,
    targetType: "system",
    targetId: input.request.runId,
    summary: `Lynx run feedback recorded for ${input.request.runId}.`,
    metadata: {
      feedbackId,
      ...metadata,
    },
  });

  return { feedbackId };
}
