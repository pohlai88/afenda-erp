"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { PlusIcon } from "lucide-react"

import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"
import { Input } from "@afenda/ui/input"
import { Label } from "@afenda/ui/label"

import { createOrgHolidayAction } from "../actions/org-calendar.actions"

export function PoliciesOrgHolidayCreateDialog() {
  const t = useTranslations("Erp.Hrm.policies")
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    createOrgHolidayAction,
    undefined
  )
  const dialogOpen = open && !state?.ok

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          <PlusIcon data-icon="inline-start" aria-hidden />
          {t("holidays.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("holidays.createDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("holidays.createDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="holidayDate">{t("holidays.fieldDate")}</Label>
            <Input id="holidayDate" name="holidayDate" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("holidays.fieldName")}</Label>
            <Input id="name" name="name" required maxLength={200} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="regionCode">{t("holidays.fieldRegion")}</Label>
            <Input
              id="regionCode"
              name="regionCode"
              placeholder={t("holidays.fieldRegionPlaceholder")}
              maxLength={32}
            />
          </div>
          {state && !state.ok && state.errors.form ? (
            <p className="text-sm text-destructive" role="alert">
              {state.errors.form}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending
              ? t("holidays.submitCreating")
              : t("holidays.submitCreate")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
