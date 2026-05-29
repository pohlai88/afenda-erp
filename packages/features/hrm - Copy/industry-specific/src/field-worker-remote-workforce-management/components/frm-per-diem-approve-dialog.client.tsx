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

import { approveFrmPerDiemReferenceAction } from "../actions/frm-per-diem.actions"
import type { ApproveFrmPerDiemFormState } from "@afenda/feature-hrm-core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type TravelChoice = {
  readonly id: string
  readonly label: string
  readonly startDate: string
}

export function FrmPerDiemApproveDialog({
  travels,
}: {
  travels: readonly TravelChoice[]
}) {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    ApproveFrmPerDiemFormState | undefined,
    FormData
  >(approveFrmPerDiemReferenceAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const defaultTravel = travels[0]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("approvePerDiem")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("approvePerDiemTitle")}</DialogTitle>
          <DialogDescription>
            {t("approvePerDiemDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="frm-pd-travel">
              {t("colTravelRecord")}
            </FieldLabel>
            <select
              id="frm-pd-travel"
              name="travelStatusId"
              className={SELECT_CLASS}
              required
              disabled={pending || travels.length === 0}
              defaultValue={defaultTravel?.id ?? ""}
            >
              <option value="">{t("selectTravel")}</option>
              {travels.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-pd-date">
              {t("colEligibilityDate")}
            </FieldLabel>
            <Input
              id="frm-pd-date"
              name="eligibilityDate"
              type="date"
              required
              disabled={pending}
              defaultValue={defaultTravel?.startDate ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-pd-category">
              {t("fieldEmployeeCategory")}
            </FieldLabel>
            <Input
              id="frm-pd-category"
              name="employeeCategoryRef"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-pd-policy">
              {t("fieldPolicyGroup")}
            </FieldLabel>
            <Input
              id="frm-pd-policy"
              name="policyGroupRef"
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending || travels.length === 0}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("savePerDiemApproval")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
