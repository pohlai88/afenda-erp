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

import { createMscCorrectiveFormAction } from "../actions/msc-operational.actions"
import type { CreateMscCorrectiveFormState } from "../data/msc-form-state.shared"
import type {
  MscHazardAssessmentRow,
  MscIncidentRow,
} from "../data/msc.types.shared"
import {
  HRM_MSC_CORRECTIVE_PRIORITIES,
  HRM_MSC_CORRECTIVE_SOURCE_KINDS,
} from "../schemas/msc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function MscCorrectiveCreateDialog({
  incidents,
  hazards,
}: {
  incidents: readonly MscIncidentRow[]
  hazards: readonly MscHazardAssessmentRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const sourceKindFieldId = useId()
  const sourceIdFieldId = useId()
  const priorityFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscCorrectiveFormState | undefined,
    FormData
  >(createMscCorrectiveFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createCorrective")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createCorrectiveTitle")}</DialogTitle>
          <DialogDescription>
            {t("createCorrectiveDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={sourceKindFieldId}>
              {t("colSource")}
            </FieldLabel>
            <select
              id={sourceKindFieldId}
              name="sourceKind"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_CORRECTIVE_SOURCE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`correctiveSourceLabels.${kind}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={sourceIdFieldId}>
              {t("fieldSourceRecord")}
            </FieldLabel>
            <select
              id={sourceIdFieldId}
              name="sourceId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("fieldSourceRecordPlaceholder")}</option>
              <optgroup label={t("incidentsTitle")}>
                {incidents.map((row) => (
                  <option key={`incident-${row.id}`} value={row.id}>
                    {row.incidentDate} · {row.incidentType}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t("hazardsTitle")}>
                {hazards.map((row) => (
                  <option key={`hazard-${row.id}`} value={row.id}>
                    {row.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-corrective-title">
              {t("colTitle")}
            </FieldLabel>
            <Input
              id="msc-corrective-title"
              name="title"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={priorityFieldId}>
              {t("colPriority")}
            </FieldLabel>
            <select
              id={priorityFieldId}
              name="priority"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_CORRECTIVE_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {t(`correctivePriorityLabels.${priority}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-corrective-due">
              {t("colDueDate")}
            </FieldLabel>
            <Input
              id="msc-corrective-due"
              name="dueDate"
              type="date"
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
              t("saveCorrective")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
