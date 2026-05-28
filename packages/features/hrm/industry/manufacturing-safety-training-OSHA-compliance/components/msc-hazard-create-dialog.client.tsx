"use client"

import { useActionState, useId } from "react"
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
import { Textarea } from "@afenda/ui/textarea"

import { createMscHazardFormAction } from "../actions/msc-operational.actions"
import type { CreateMscHazardFormState } from "../data/msc-form-state.shared"
import type { MscSiteChoiceRow } from "../data/msc.types.shared"
import { HRM_MSC_HAZARD_ASSESSMENT_TYPES } from "../schemas/msc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function MscHazardCreateDialog({
  sites,
}: {
  sites: readonly MscSiteChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const siteFieldId = useId()
  const typeFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscHazardFormState | undefined,
    FormData
  >(createMscHazardFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createHazard")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createHazardTitle")}</DialogTitle>
          <DialogDescription>{t("createHazardDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={siteFieldId}>{t("fieldSite")}</FieldLabel>
            <select
              id={siteFieldId}
              name="siteId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anySite")}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.code} · {site.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={typeFieldId}>{t("colType")}</FieldLabel>
            <select
              id={typeFieldId}
              name="assessmentType"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_HAZARD_ASSESSMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`hazardTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-hazard-title">{t("colTitle")}</FieldLabel>
            <Input
              id="msc-hazard-title"
              name="title"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-hazard-task">
              {t("fieldTaskDescription")}
            </FieldLabel>
            <Textarea
              id="msc-hazard-task"
              name="taskDescription"
              rows={3}
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveHazard")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
