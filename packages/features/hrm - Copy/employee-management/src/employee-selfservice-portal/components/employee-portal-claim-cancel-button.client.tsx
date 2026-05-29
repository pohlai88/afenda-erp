"use client"

import { useActionState, useEffect, useId, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import {
  cancelPortalEmployeeClaimAction,
  type CancelClaimFormState,
} from "@afenda/feature-hrm-employee-management/client"

type EmployeePortalClaimCancelButtonProps = {
  portalSlug: string
  claimId: string
  label: string
}

export function EmployeePortalClaimCancelButton({
  portalSlug,
  claimId,
  label,
}: EmployeePortalClaimCancelButtonProps) {
  const router = useRouter()
  const formId = useId()
  const [state, formAction, pending] = useActionState<
    CancelClaimFormState | undefined,
    FormData
  >(cancelPortalEmployeeClaimAction, undefined)

  const refreshed = useRef(false)
  useEffect(() => {
    if (state?.ok && !refreshed.current) {
      refreshed.current = true
      router.refresh()
    }
  }, [state, router])

  const disabled = useMemo(() => pending, [pending])

  return (
    <form id={formId} action={formAction} className="inline">
      <input type="hidden" name="portalSlug" value={portalSlug} />
      <input type="hidden" name="claimId" value={claimId} />
      <Button type="submit" variant="outline" size="sm" disabled={disabled}>
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ÔÇª
          </>
        ) : (
          label
        )}
      </Button>
    </form>
  )
}
