"use client"

import { useState } from "react"
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

import type { LeaveEmployeeChoiceRow } from "../../../time-attendance/server"
import type { DependentRow } from "../../../employees/server"

import {
  BenefitEnrollmentForm,
  type BenefitPlanChoiceRow,
} from "./benefit-enrollment-form"

type BenefitEnrollmentDialogProps = {
  employees: ReadonlyArray<LeaveEmployeeChoiceRow>
  plans: ReadonlyArray<BenefitPlanChoiceRow>
  dependents: ReadonlyArray<DependentRow>
}

export function BenefitEnrollmentDialog({
  employees,
  plans,
  dependents,
}: BenefitEnrollmentDialogProps) {
  const t = useTranslations("Erp.Hrm.benefits")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          <PlusIcon data-icon="inline-start" aria-hidden />
          {t("enrollEmployee")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("enrollDialogTitle")}</DialogTitle>
          <DialogDescription>{t("enrollDialogDescription")}</DialogDescription>
        </DialogHeader>
        <BenefitEnrollmentForm
          employees={employees}
          plans={plans}
          dependents={dependents}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
