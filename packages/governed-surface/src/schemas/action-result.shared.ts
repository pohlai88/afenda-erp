import type { z } from "zod";

/** Field-level validation messages keyed by form field name. */
export type ActionFieldErrors = Record<string, string | undefined>;

/**
 * Canonical Server Action return envelope for forms — expected failures are
 * data, not thrown exceptions (see Next.js App Router mutation guidance).
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: ActionFieldErrors;
      code?: string;
    };

export function isActionResultSuccess<T>(
  result: ActionResult<T>,
): result is { ok: true; data?: T } {
  return result.ok === true;
}

export function isActionFailure<T>(
  result: ActionResult<T> | null | undefined,
): result is Extract<ActionResult<T>, { ok: false }> {
  return result?.ok === false;
}

export function actionSuccess<T>(data: T): ActionResult<T>;
export function actionSuccess(): ActionResult<void>;
export function actionSuccess<T>(data?: T): ActionResult<T> {
  if (data === undefined) {
    return { ok: true };
  }

  return { ok: true, data };
}

export function actionFailure<T = void>(
  message: string,
  fieldErrors?: ActionFieldErrors,
  code?: string,
): ActionResult<T> {
  return {
    ok: false,
    error: message,
    ...(fieldErrors ? { fieldErrors } : {}),
    ...(code ? { code } : {}),
  };
}

export function zodActionFailure<T = void>(error: z.ZodError): ActionResult<T> {
  const flattened = error.flatten();
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened.fieldErrors).map(([key, messages]) => [
      key,
      Array.isArray(messages) ? messages[0] : undefined,
    ]),
  );

  return actionFailure(
    flattened.formErrors[0] ?? "Check the highlighted fields and try again.",
    fieldErrors,
  );
}

/** Next.js `<form action>` handlers must return `void`; use with result-returning actions. */
export function assertFormActionResult<T = void>(result: ActionResult<T>): void {
  if (!result.ok) {
    throw new Error(result.error);
  }
}

export function toVoidFormAction<T = void>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    assertFormActionResult(await action(formData));
  };
}
