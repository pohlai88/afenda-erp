import {
  actionFailure,
  assertFormActionResult,
  toVoidFormAction,
  zodActionFailure,
  type ActionFieldErrors,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { z } from "zod";

const DEFAULT_HR_SUITE_ACTION_FAILURE_MESSAGE =
  "The HR Suite action could not be completed.";

export type HrSuiteActionFailureMapper<T = void> = (
  error: unknown,
) => ActionResult<T> | undefined;

export type HrSuiteActionFailureOptions<T = void> = {
  readonly fallbackMessage?: string;
  readonly fallbackCode?: string;
  readonly fieldErrors?: ActionFieldErrors;
  readonly exposeUnexpectedErrorMessage?: boolean;
  readonly mappers?: readonly HrSuiteActionFailureMapper<T>[];
};

export type HrSuiteActionStateHandler<T = void> = (
  previous: ActionResult<T> | undefined,
  formData: FormData,
) => Promise<ActionResult<T>>;

export function hrSuiteActionFailure<T = void>(
  message: string,
  options?: {
    readonly fieldErrors?: ActionFieldErrors;
    readonly code?: string;
  },
): ActionResult<T> {
  return actionFailure<T>(message, options?.fieldErrors, options?.code);
}

export function toHrSuiteActionFailure<T = void>(
  error: unknown,
  options: HrSuiteActionFailureOptions<T> = {},
): ActionResult<T> {
  for (const mapper of options.mappers ?? []) {
    const mapped = mapper(error);
    if (mapped) {
      return mapped;
    }
  }

  if (error instanceof z.ZodError) {
    return zodActionFailure<T>(error);
  }

  const fallbackMessage =
    options.fallbackMessage ?? DEFAULT_HR_SUITE_ACTION_FAILURE_MESSAGE;
  const message =
    options.exposeUnexpectedErrorMessage && error instanceof Error
      ? error.message || fallbackMessage
      : fallbackMessage;

  return actionFailure<T>(
    message,
    options.fieldErrors,
    options.fallbackCode,
  );
}

export function toHrSuiteResultFormAction<T = void>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
): (formData: FormData) => Promise<void> {
  return toVoidFormAction(action);
}

export function toHrSuiteNativeFormAction<T = void>(
  action: HrSuiteActionStateHandler<T>,
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    assertFormActionResult(await action(undefined, formData));
  };
}

