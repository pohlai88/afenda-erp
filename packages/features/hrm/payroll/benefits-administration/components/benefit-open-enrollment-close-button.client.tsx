"use client"

import { useActionState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import { useRouter } from "next/navigation"

import { closeBenefitOpenEnrollmentAction } from "../actions/benefit-open-enrollment.actions"

type BenefitOpenEnrollmentCloseButtonProps = {
  windowId: string
}

export function BenefitOpenEnrollmentCloseButton({
  windowId,
}: BenefitOpenEnrollmentCloseButtonProps) {
  const t = useTranslations("Erp.Hrm.benefits")
  const [state, formAction, pending] = useActionState(
    closeBenefitOpenEnrollmentAction,
    undefined
  )
  const router = useRouter()
  const did = useRef(false)

  useEffect(() => {
    if (state?.ok && !did.current) {
      did.current = true
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction}>
      <input type="hidden" name="windowId" value={windowId} />
      <Button size="sm" type="submit" variant="outline" disabled={pending}>
        {pending ? t("openEnrollment.closing") : t("openEnrollment.close")}
      </Button>
    </form>
  )
}
