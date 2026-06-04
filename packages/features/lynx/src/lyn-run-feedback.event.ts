import { LYNX_AUDIT_ACTIONS } from "./lyn-core-contract";
import type {
  LynxLiveRunFeedbackRequest,
  LynxRunFeedbackCategory,
  LynxRunFeedbackRating,
} from "./lyn-run-feedback-schema";

export const LYNX_RUN_FEEDBACK_AUDIT_ACTION = LYNX_AUDIT_ACTIONS.runFeedback;

export const LYNX_RUN_FEEDBACK_SOURCE_ROUTE = "lynx.live-message" as const;

export type LynxRunFeedbackRecordedEventMetadata = {
  route: typeof LYNX_RUN_FEEDBACK_SOURCE_ROUTE;
  runRoute: string;
  requestId: string;
  rating: LynxRunFeedbackRating;
  category: LynxRunFeedbackCategory;
  messageId?: string;
  workflowId?: string;
  workflowSessionId?: string;
};

export function buildLynxRunFeedbackRecordedEventMetadata(input: {
  request: LynxLiveRunFeedbackRequest;
  requestId: string;
  runRoute: string;
  workflowId?: string | null;
  workflowSessionId?: string | null;
}): LynxRunFeedbackRecordedEventMetadata {
  return {
    route: LYNX_RUN_FEEDBACK_SOURCE_ROUTE,
    runRoute: input.runRoute,
    requestId: input.requestId,
    rating: input.request.rating,
    category: input.request.category,
    ...(input.request.messageId ? { messageId: input.request.messageId } : {}),
    ...(input.workflowId ? { workflowId: input.workflowId } : {}),
    ...(input.workflowSessionId
      ? { workflowSessionId: input.workflowSessionId }
      : {}),
  };
}
