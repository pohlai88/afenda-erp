"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@afenda/ui/button"
import { FieldError } from "@afenda/ui/field"

import { recomputeMscObligationsAction } from "../actions/msc-recompute.actions"
import type { RecomputeMscObligationsFormState } from "../data/msc-form-state.shared"

export function MscRecomputeObligationsButton() {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const [state, formAction, pending] = useActionState<
    RecomputeMscObligationsFormState | undefined,
    FormData
  >(recomputeMscObligationsAction, undefined)

  const error = state && !state.ok ? state.errors.form : null
  const success =
    state?.ok === true
      ? t("recomputeSuccess", {
          created: state.created,
          updated: state.updated,
          removed: state.removed,
        })
      : null

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
        {t("recomputeObligations")}
      </Button>
      {error ? (
        <FieldError className="max-w-xs text-end">{error}</FieldError>
      ) : null}
      {success ? (
        <p className="max-w-xs text-end text-xs text-muted-foreground">
          {success}
        </p>
      ) : null}
    </form>
  )
}
