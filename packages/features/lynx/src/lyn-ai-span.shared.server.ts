import { SpanStatusCode, trace, type Span } from "@opentelemetry/api";

const tracer = trace.getTracer("afenda.feature-lynx.ai");

export type LynxAiSpanAttributes = {
  feature: string;
  model: string;
  moduleId?: string;
  organizationId: string;
  requestId?: string;
  workflowSessionId?: string;
};

export async function withAiSpan<T>(
  spanName: string,
  attributes: LynxAiSpanAttributes,
  fn: () => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(spanName, async (span: Span) => {
    span.setAttributes({
      "ai.feature": attributes.feature,
      "ai.model": attributes.model,
      "ai.module": attributes.moduleId ?? "global",
      "organization.id": attributes.organizationId,
      ...(attributes.requestId
        ? { "http.request.id": attributes.requestId }
        : {}),
      ...(attributes.workflowSessionId
        ? { "lynx.workflow_session.id": attributes.workflowSessionId }
        : {}),
    });

    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    } finally {
      span.end();
    }
  });
}
