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
import { Input } from "@afenda/ui/input"

import { updateSuccessionNominationReadinessAction } from "../actions/succession-nomination.actions"
import { HRM_SUCCESSION_READINESS_LEVELS } from "../schemas/succession-workflow-state.shared"
import type { SuccessionMutationFormState } from "../schemas/succession.schema"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

function SuccessionNominationReadinessDialog({
  nominationId,
  label,
}: {
  nominationId: string
  label: string
}) {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(updateSuccessionNominationReadinessAction, undefined)

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
          <DialogTitle>{t("updateReadinessTitle")}</DialogTitle>
          <DialogDescription>{t("updateReadinessDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="nominationId" value={nominationId} />
          <Field>
            <FieldLabel htmlFor={`readiness-${nominationId}`}>
              {t("fieldReadinessLevel")}
            </FieldLabel>
            <select
              id={`readiness-${nominationId}`}
              name="readinessLevel"
              defaultValue="ready_1y"
              className={SELECT_CLASS}
            >
              {HRM_SUCCESSION_READINESS_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {t(`readinessLevelLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`potential-${nominationId}`}>
              {t("fieldPotentialRating")}
            </FieldLabel>
            <Input id={`potential-${nominationId}`} name="potentialRating" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`grid-${nominationId}`}>{t("fieldGridCell")}</FieldLabel>
            <Input
              id={`grid-${nominationId}`}
              name="performancePotentialGrid"
              placeholder="high-high"
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveReadiness")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SuccessionNominationReadinessTrailingCell({
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
      <SuccessionNominationReadinessDialog
        nominationId={row.id}
        label={descriptor.label}
      />
    </GovernedTrailingActionSlot>
  )
}
