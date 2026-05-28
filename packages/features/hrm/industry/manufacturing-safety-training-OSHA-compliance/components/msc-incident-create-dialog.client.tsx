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

import { createMscIncidentFormAction } from "../actions/msc-operational.actions"
import type { CreateMscIncidentFormState } from "../data/msc-form-state.shared"
import type {
  MscEmployeeObligationRow,
  MscSiteChoiceRow,
} from "../data/msc.types.shared"
import { HRM_MSC_INCIDENT_TYPES } from "../schemas/msc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function MscIncidentCreateDialog({
  sites,
  obligations,
}: {
  sites: readonly MscSiteChoiceRow[]
  obligations: readonly MscEmployeeObligationRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const siteFieldId = useId()
  const employeeFieldId = useId()
  const typeFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscIncidentFormState | undefined,
    FormData
  >(createMscIncidentFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  const employeeChoices = [
    ...new Map(
      obligations.map((row) => [row.employeeId, row.employeeLabel] as const)
    ).entries(),
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createIncident")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createIncidentTitle")}</DialogTitle>
          <DialogDescription>
            {t("createIncidentDescription")}
          </DialogDescription>
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
            <FieldLabel htmlFor={employeeFieldId}>
              {t("colEmployee")}
            </FieldLabel>
            <select
              id={employeeFieldId}
              name="employeeId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("notRecorded")}</option>
              {employeeChoices.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-incident-date">
              {t("colIncidentDate")}
            </FieldLabel>
            <Input
              id="msc-incident-date"
              name="incidentDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={typeFieldId}>{t("colType")}</FieldLabel>
            <select
              id={typeFieldId}
              name="incidentType"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_INCIDENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`incidentTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-incident-severity">
              {t("colSeverity")}
            </FieldLabel>
            <Input
              id="msc-incident-severity"
              name="severity"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-incident-desc">
              {t("fieldDescription")}
            </FieldLabel>
            <Textarea
              id="msc-incident-desc"
              name="description"
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
              t("saveIncident")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
