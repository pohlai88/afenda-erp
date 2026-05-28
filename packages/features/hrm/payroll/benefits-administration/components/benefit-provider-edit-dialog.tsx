"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"

import {
  BenefitProviderForm,
  type BenefitProviderFormRow,
} from "./benefit-provider-form"

type BenefitProviderEditDialogProps = {
  provider: BenefitProviderFormRow
}

export function BenefitProviderEditDialog({
  provider,
}: BenefitProviderEditDialogProps) {
  const t = useTranslations("Erp.Hrm.benefits")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          {t("editProvider")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editProviderDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("editProviderDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <BenefitProviderForm
          mode="edit"
          provider={provider}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
