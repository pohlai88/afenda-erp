"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import { Input } from "@afenda/ui/input"

import { resolveFrmExceptionAction } from "../actions/frm-exception.actions"
import type { ResolveFrmExceptionFormState } from "../../../_core/shared"

export function FrmExceptionResolveTrailing({
  exceptionId,
}: {
  exceptionId: string
}) {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    ResolveFrmExceptionFormState | undefined,
    FormData
  >(resolveFrmExceptionAction, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="exceptionId" value={exceptionId} />
      <Input
        name="correctionRef"
        placeholder={t("fieldCorrectionRef")}
        disabled={pending}
        className="h-8"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          t("resolveException")
        )}
      </Button>
      {state && !state.ok && state.errors.form ? (
        <p className="text-xs text-destructive">{state.errors.form}</p>
      ) : null}
    </form>
  )
}
