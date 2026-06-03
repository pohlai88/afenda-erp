import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";

import type { ActionResult } from "../schemas/action-result.shared";
import { governedTestId } from "../utils/governed-identity.shared";

export type ActionFormErrorKind =
  | "validation"
  | "business-rule"
  | "permission"
  | "system";

export type ActionFormErrorsProps<T = void> = {
  result:
    | (ActionResult<T> & {
        errorKind?: ActionFormErrorKind;
      })
    | null
    | undefined;
  title?: string;
  testId?: string;
};

/**
 * RSC helper — renders expected Server Action failures without throwing.
 */
export function ActionFormErrors<T>({
  result,
  title,
  testId,
}: ActionFormErrorsProps<T>) {
  if (!result || result.ok) return null;

  const errorKind = result.errorKind ?? "business-rule";

  const entries = result.fieldErrors
    ? Object.entries(result.fieldErrors).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].length > 0,
      )
    : [];

  return (
    <Alert
      variant="destructive"
      className="w-full max-w-xl"
      role="alert"
      aria-live="polite"
      data-action-error-kind={errorKind}
      {...(result.code ? { "data-action-error-code": result.code } : {})}
      data-testid={testId ?? governedTestId("action-form-errors", errorKind)}
    >
      <AlertTitle>{title ?? result.error}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        {title ? <p>{result.error}</p> : null}

        {result.code ? (
          <p className="type-mono-cell text-critical/90">{result.code}</p>
        ) : null}

        {entries.length > 0 ? (
          <ul
            className="flex list-inside list-disc flex-col gap-1 type-body"
            aria-label="Field errors"
          >
            {entries.map(([field, message]) => (
              <li key={field} data-field-error={field}>
                <span className="font-medium">{field}</span>
                {": "}
                {message}
              </li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
