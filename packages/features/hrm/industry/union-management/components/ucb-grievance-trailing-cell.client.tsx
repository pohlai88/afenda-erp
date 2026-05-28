"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"
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

import { updateUcbGrievanceStatusAction } from "../actions/ucb-replacement.actions"
import { HRM_UCB_GRIEVANCE_STATUSES } from "../schemas/ucb-workflow-state.shared"
import type { UcbMutationFormState } from "../schemas/ucb.schema"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

function UcbGrievanceStatusDialog({
  grievanceId,
  label,
}: {
  grievanceId: string
  label: string
}) {
  const t = useTranslations("Erp.Hrm.unionManagement")
  const [state, formAction, pending] = useActionState<
    UcbMutationFormState | undefined,
    FormData
  >(updateUcbGrievanceStatusAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("updateGrievanceStatusTitle")}</DialogTitle>
          <DialogDescription>{t("updateGrievanceStatusDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="grievanceId" value={grievanceId} />
          <Field>
            <FieldLabel htmlFor={`grievance-status-${grievanceId}`}>
              {t("fieldStatus")}
            </FieldLabel>
            <select
              id={`grievance-status-${grievanceId}`}
              name="status"
              defaultValue="under_review"
              className={SELECT_CLASS}
            >
              {HRM_UCB_GRIEVANCE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(`grievanceStatusLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveGrievanceStatus")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function UcbGrievanceTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }

  const descriptor =
    trailingAction.state === "ready" || trailingAction.state === "disabled"
      ? trailingAction.descriptor
      : undefined
  if (!descriptor) {
    return null
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <UcbGrievanceStatusDialog grievanceId={row.id} label={descriptor.label} />
    </GovernedTrailingActionSlot>
  )
}
