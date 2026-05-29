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

import { createMscWorkRestrictionAction } from "../actions/msc-compliance.actions"
import type { CreateMscWorkRestrictionFormState } from "../data/msc-form-state.shared"
import type {
  MscEmployeeObligationRow,
  MscMachineRow,
} from "../data/msc.types.shared"
import { HRM_MSC_RESTRICTION_SCOPES } from "../schemas/msc-workflow-state.shared"
import type { HrmMscRestrictionScope } from "../schemas/msc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function MscWorkRestrictionCreateDialog({
  obligations,
  machines,
}: {
  obligations: readonly MscEmployeeObligationRow[]
  machines: readonly MscMachineRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const employeeFieldId = useId()
  const obligationFieldId = useId()
  const machineFieldId = useId()
  const scopeFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscWorkRestrictionFormState | undefined,
    FormData
  >(createMscWorkRestrictionAction, undefined)
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
          {t("createWorkRestriction")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createWorkRestrictionTitle")}</DialogTitle>
          <DialogDescription>
            {t("createWorkRestrictionDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={employeeFieldId}>
              {t("colEmployee")}
            </FieldLabel>
            <select
              id={employeeFieldId}
              name="employeeId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("selectEmployee")}</option>
              {employeeChoices.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={obligationFieldId}>
              {t("fieldObligation")}
            </FieldLabel>
            <select
              id={obligationFieldId}
              name="obligationId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anyObligation")}</option>
              {obligations.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.employeeLabel} · {row.complianceStatus}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={machineFieldId}>
              {t("fieldMachine")}
            </FieldLabel>
            <select
              id={machineFieldId}
              name="machineId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anyMachine")}</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.code} · {machine.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={scopeFieldId}>
              {t("colRestrictionScope")}
            </FieldLabel>
            <select
              id={scopeFieldId}
              name="restrictionScope"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_RESTRICTION_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {t(
                    `restrictionScopeLabels.${scope as HrmMscRestrictionScope}`
                  )}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-restriction-from">
              {t("colEffectiveFrom")}
            </FieldLabel>
            <Input
              id="msc-restriction-from"
              name="effectiveFrom"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-restriction-to">
              {t("colEffectiveTo")}
            </FieldLabel>
            <Input
              id="msc-restriction-to"
              name="effectiveTo"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-restriction-reason">
              {t("colReason")}
            </FieldLabel>
            <Textarea
              id="msc-restriction-reason"
              name="reason"
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
              t("saveWorkRestriction")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
