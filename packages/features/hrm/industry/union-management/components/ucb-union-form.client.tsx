"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"

import { createUcbUnionAction } from "../actions/ucb-union.actions"
import { HRM_UCB_UNION_STATUSES } from "../schemas/ucb-workflow-state.shared"
import type { UcbMutationFormState } from "../schemas/ucb.schema"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

export function UcbUnionFormDialog() {
  const t = useTranslations("Erp.Hrm.unionManagement")
  const [state, formAction, pending] = useActionState<
    UcbMutationFormState | undefined,
    FormData
  >(createUcbUnionAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createUnion")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createUnionTitle")}</DialogTitle>
          <DialogDescription>{t("createUnionDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="ucb-union-code">{t("fieldCode")}</FieldLabel>
            <Input id="ucb-union-code" name="code" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="ucb-union-name">{t("fieldName")}</FieldLabel>
            <Input id="ucb-union-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="ucb-union-status">{t("fieldStatus")}</FieldLabel>
            <select
              id="ucb-union-status"
              name="status"
              defaultValue="active"
              className={SELECT_CLASS}
            >
              {HRM_UCB_UNION_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveUnion")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
