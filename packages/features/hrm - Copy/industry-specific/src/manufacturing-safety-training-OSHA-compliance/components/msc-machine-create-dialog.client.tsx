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

import { createMscMachineAction } from "../actions/msc-master.actions"
import type { CreateMscMachineFormState } from "../data/msc-form-state.shared"
import type { MscSiteChoiceRow } from "../data/msc.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function MscMachineCreateDialog({
  sites,
}: {
  sites: readonly MscSiteChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const siteFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscMachineFormState | undefined,
    FormData
  >(createMscMachineAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createMachine")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createMachineTitle")}</DialogTitle>
          <DialogDescription>{t("createMachineDescription")}</DialogDescription>
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
            <FieldLabel htmlFor="msc-machine-code">
              {t("fieldMachineCode")}
            </FieldLabel>
            <Input
              id="msc-machine-code"
              name="code"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-machine-name">
              {t("fieldMachineName")}
            </FieldLabel>
            <Input
              id="msc-machine-name"
              name="name"
              required
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
              t("saveMachine")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
