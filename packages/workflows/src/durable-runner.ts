export type DurableWorkflowRunResult<TResult> = {
  result: TResult;
  attempts: number;
  durationMs: number;
};

export class DurableWorkflowRetryError extends Error {
  readonly attempts: number;
  override readonly cause?: unknown;

  constructor(message: string, attempts: number, cause?: unknown) {
    super(message);
    this.name = "DurableWorkflowRetryError";
    this.attempts = attempts;
    this.cause = cause;
  }
}

export async function runWorkflowWithRetry<TResult>(input: {
  execute: () => Promise<TResult>;
  maxAttempts?: number;
  initialBackoffMs?: number;
}): Promise<DurableWorkflowRunResult<TResult>> {
  const maxAttempts = Math.max(1, input.maxAttempts ?? 3);
  const initialBackoffMs = Math.max(0, input.initialBackoffMs ?? 250);
  const startedAt = Date.now();

  let attempts = 0;
  let backoffMs = initialBackoffMs;
  let lastError: unknown;

  while (attempts < maxAttempts) {
    attempts += 1;

    try {
      const result = await input.execute();
      return {
        result,
        attempts,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      lastError = error;
      if (attempts >= maxAttempts) {
        break;
      }

      if (backoffMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
      backoffMs = Math.min(backoffMs * 2 || 500, 5_000);
    }
  }

  throw new DurableWorkflowRetryError(
    lastError instanceof Error
      ? lastError.message
      : "Workflow run failed after retries.",
    attempts,
    lastError,
  );
}
