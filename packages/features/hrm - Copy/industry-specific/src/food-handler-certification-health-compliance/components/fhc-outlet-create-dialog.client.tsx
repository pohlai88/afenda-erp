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

import { createFhcOutletAction } from "../actions/fhc-outlet.actions"
import type { CreateFhcOutletFormState } from "@afenda/feature-hrm-core/shared"

export function FhcOutletCreateDialog() {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    CreateFhcOutletFormState | undefined,
    FormData
  >(createFhcOutletAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createOutlet")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createOutletTitle")}</DialogTitle>
          <DialogDescription>{t("createOutletDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="fhc-outlet-code">
              {t("fieldOutletCode")}
            </FieldLabel>
            <Input
              id="fhc-outlet-code"
              name="code"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-outlet-name">
              {t("fieldOutletName")}
            </FieldLabel>
            <Input
              id="fhc-outlet-name"
              name="name"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-outlet-country">
              {t("fieldCountry")}
            </FieldLabel>
            <Input
              id="fhc-outlet-country"
              name="countryCode"
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
              t("saveOutlet")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
