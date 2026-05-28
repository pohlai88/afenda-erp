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

import { claimRwsOpenShiftAction } from "../actions/rws-open-shift.actions"
import type { ClaimRwsOpenShiftFormState } from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsOpenShiftClaimFormProps = {
  openShiftOfferId: string
  employees: readonly {
    readonly id: string
    readonly employeeNumber: string | null
    readonly legalName: string
  }[]
  templates: readonly {
    readonly id: string
    readonly code: string
    readonly name: string
  }[]
}

export function RwsOpenShiftClaimForm({
  openShiftOfferId,
  employees,
  templates,
}: RwsOpenShiftClaimFormProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    ClaimRwsOpenShiftFormState | undefined,
    FormData
  >(claimRwsOpenShiftAction, undefined)

  const error = state && !state.ok ? state.errors : null

  if (employees.length === 0 || templates.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">{t("openShiftClaimSetupRequired")}</p>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {t("openShiftClaimAction")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("openShiftClaimTitle")}</DialogTitle>
          <DialogDescription>{t("openShiftClaimDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="openShiftOfferId" value={openShiftOfferId} />
          <Field>
            <FieldLabel htmlFor={`claim-emp-${openShiftOfferId}`}>
              {t("fieldEmployee")}
            </FieldLabel>
            <select
              id={`claim-emp-${openShiftOfferId}`}
              name="employeeId"
              required
              className={SELECT_CLASS}
              defaultValue=""
            >
              <option value="" disabled>
                {t("selectEmployee")}
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employeeNumber
                    ? `${employee.legalName} · ${employee.employeeNumber}`
                    : employee.legalName}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`claim-tpl-${openShiftOfferId}`}>
              {t("fieldShiftTemplate")}
            </FieldLabel>
            <select
              id={`claim-tpl-${openShiftOfferId}`}
              name="shiftTemplateId"
              required
              className={SELECT_CLASS}
              defaultValue=""
            >
              <option value="" disabled>
                {t("selectShiftTemplate")}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.code} · {template.name}
                </option>
              ))}
            </select>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          {state?.ok ? (
            <p className="text-sm text-muted-foreground">{t("openShiftClaimSuccess")}</p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("openShiftClaimSubmit")}
              </>
            ) : (
              t("openShiftClaimSubmit")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
