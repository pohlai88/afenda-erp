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

import { createMscSiteAction } from "../actions/msc-master.actions"
import type { CreateMscSiteFormState } from "../data/msc-form-state.shared"

export function MscSiteCreateDialog() {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const [state, formAction, pending] = useActionState<
    CreateMscSiteFormState | undefined,
    FormData
  >(createMscSiteAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createSite")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createSiteTitle")}</DialogTitle>
          <DialogDescription>{t("createSiteDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="msc-site-code">
              {t("fieldSiteCode")}
            </FieldLabel>
            <Input id="msc-site-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-site-name">
              {t("fieldSiteName")}
            </FieldLabel>
            <Input id="msc-site-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-site-country">
              {t("fieldCountry")}
            </FieldLabel>
            <Input
              id="msc-site-country"
              name="countryCode"
              placeholder={t("fieldCountryPlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              id="msc-site-osha"
              name="oshaRecordkeepingEnabled"
              disabled={pending}
            />
            <FieldLabel htmlFor="msc-site-osha" className="font-normal">
              {t("fieldOshaRecordkeeping")}
            </FieldLabel>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveSite")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
