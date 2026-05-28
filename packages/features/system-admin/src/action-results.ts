import type { ActionResult } from "@afenda/governed-surface/schemas";
import type { z } from "zod";

export type SystemAdminActionResult<T = void> = ActionResult<T>;

export const systemAdminActionSuccess = <T>(
  data: T,
): SystemAdminActionResult<T> => ({
  ok: true,
  data,
});

export const systemAdminActionFailure = <T = void>(
  message: string,
  fieldErrors?: Record<string, string | undefined>,
): SystemAdminActionResult<T> => ({
  ok: false,
  error: message,
  fieldErrors,
});

/** Next.js `<form action>` handlers must return `void`; use with result-returning actions. */
export function assertSystemAdminFormActionResult<T = void>(
  result: SystemAdminActionResult<T>,
): void {
  if (!result.ok) {
    throw new Error(result.error);
  }
}

export function toSystemAdminVoidFormAction<T = void>(
  action: (formData: FormData) => Promise<SystemAdminActionResult<T>>,
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    assertSystemAdminFormActionResult(await action(formData));
  };
}

export function zodActionFailure<T = void>(
  error: z.ZodError,
): SystemAdminActionResult<T> {
  const flattened = error.flatten();
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened.fieldErrors).map(([key, messages]) => [
      key,
      Array.isArray(messages) ? messages[0] : undefined,
    ]),
  );

  return systemAdminActionFailure(
    flattened.formErrors[0] ?? "Check the highlighted fields and try again.",
    fieldErrors,
  );
}
