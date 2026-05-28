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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"

import { createLeaveBlackoutAction } from "../actions/org-calendar.actions"

type LeaveTypeOption = { readonly id: string; readonly code: string }

type PoliciesLeaveBlackoutCreateDialogProps = {
  leaveTypes: readonly LeaveTypeOption[]
}

export function PoliciesLeaveBlackoutCreateDialog({
  leaveTypes,
}: PoliciesLeaveBlackoutCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.policies")
  const [open, setOpen] = useState(false)
  const [leaveTypeId, setLeaveTypeId] = useState<string>("")
  const [state, formAction, pending] = useActionState(
    createLeaveBlackoutAction,
    undefined
  )

  const dialogOpen = open && !state?.ok

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setLeaveTypeId("")
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          <PlusIcon data-icon="inline-start" aria-hidden />
          {t("blackout.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("blackout.createDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("blackout.createDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="blackout-name">{t("blackout.fieldName")}</Label>
            <Input id="blackout-name" name="name" required maxLength={200} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">{t("blackout.fieldStart")}</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">{t("blackout.fieldEnd")}</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("blackout.fieldLeaveType")}</Label>
            <Select
              value={leaveTypeId || "__all__"}
              onValueChange={(value) =>
                setLeaveTypeId(value === "__all__" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("blackout.fieldLeaveTypeAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  {t("blackout.allLeaveTypes")}
                </SelectItem>
                {leaveTypes.map((lt) => (
                  <SelectItem key={lt.id} value={lt.id}>
                    {lt.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="leaveTypeId" value={leaveTypeId} />
          </div>
          {state && !state.ok && state.errors.form ? (
            <p className="text-sm text-destructive" role="alert">
              {state.errors.form}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending
              ? t("blackout.submitCreating")
              : t("blackout.submitCreate")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
