"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Textarea } from "@afenda/ui/textarea"

import { archiveEmployeeAction } from "../../../employees/client"

type EmployeeArchiveFormProps = {
  orgSlug: string
  employeeId: string
}

export function EmployeeArchiveForm({
  orgSlug,
  employeeId,
}: EmployeeArchiveFormProps) {
  const t = useTranslations("Erp.Hrm.workforce")
  const [state, formAction, pending] = useActionState(
    archiveEmployeeAction,
    undefined
  )

  const reasonInvalid = Boolean(
    state && !state.ok && state.errors.archivedReason
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="employeeId" value={employeeId} />

      <p className="text-sm text-muted-foreground">{t("archiveDescription")}</p>

      {state && !state.ok && state.errors.form ? (
        <Alert variant="destructive">
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription>{state.errors.form}</AlertDescription>
        </Alert>
      ) : null}

      <Field data-invalid={reasonInvalid ? true : undefined}>
        <FieldLabel htmlFor="archive-reason">
          {t("archiveReasonLabel")}{" "}
          <span className="font-normal text-muted-foreground">
            ({t("archiveReasonHint")})
          </span>
        </FieldLabel>
        <Textarea
          id="archive-reason"
          name="archivedReason"
          rows={3}
          aria-invalid={reasonInvalid}
        />
        {reasonInvalid && state && !state.ok ? (
          <FieldError>{state.errors.archivedReason}</FieldError>
        ) : null}
      </Field>

      <Button
        type="submit"
        variant="destructive"
        disabled={pending}
        className="self-start"
      >
        {pending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
            {t("archiving")}
          </>
        ) : (
          t("archiveSubmit")
        )}
      </Button>
    </form>
  )
}
