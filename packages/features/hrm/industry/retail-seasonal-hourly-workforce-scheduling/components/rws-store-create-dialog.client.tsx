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

import { createRwsStoreAction } from "../actions/rws-store.actions"
import type { CreateRwsStoreFormState } from "../../../_core/shared"

export function RwsStoreCreateDialog() {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    CreateRwsStoreFormState | undefined,
    FormData
  >(createRwsStoreAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createStore")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createStoreTitle")}</DialogTitle>
          <DialogDescription>{t("createStoreDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-store-code">{t("fieldCode")}</FieldLabel>
            <Input id="rws-store-code" name="code" required />
            {error?.form ? <FieldError>{error.form}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-store-name">{t("fieldName")}</FieldLabel>
            <Input id="rws-store-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-store-branch">{t("fieldBranch")}</FieldLabel>
            <Input id="rws-store-branch" name="branchRef" />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveStore")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
