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

import { createFrmWorksiteAction } from "../actions/frm-worksite.actions"
import type { CreateFrmWorksiteFormState } from "../../../_core/shared"
import { HRM_FRM_WORKSITE_TYPES } from "../schemas/frm-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function FrmWorksiteCreateDialog() {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    CreateFrmWorksiteFormState | undefined,
    FormData
  >(createFrmWorksiteAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createWorksite")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createWorksiteTitle")}</DialogTitle>
          <DialogDescription>
            {t("createWorksiteDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="frm-ws-code">{t("fieldCode")}</FieldLabel>
            <Input id="frm-ws-code" name="code" required disabled={pending} />
            {error?.form ? <FieldError>{error.form}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-ws-name">{t("fieldName")}</FieldLabel>
            <Input id="frm-ws-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-ws-type">{t("colType")}</FieldLabel>
            <select
              id="frm-ws-type"
              name="worksiteType"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="project"
            >
              {HRM_FRM_WORKSITE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`worksiteTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-ws-country">
              {t("fieldCountry")}
            </FieldLabel>
            <Input id="frm-ws-country" name="countryCode" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-ws-city">{t("fieldCity")}</FieldLabel>
            <Input id="frm-ws-city" name="city" disabled={pending} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="approvedRemote" disabled={pending} />
            {t("fieldApprovedRemote")}
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveWorksite")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
