"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"

import { useFormSuccess } from "@afenda/feature-hrm-core/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"
import {
  cancelPortalEmployeeLeaveAction,
  type CancelLeaveFormState,
} from "@afenda/feature-hrm-employee-management/client"

type EmployeePortalLeaveCancelButtonProps = {
  portalSlug: string
  requestId: string
}

export function EmployeePortalLeaveCancelButton({
  portalSlug,
  requestId,
}: EmployeePortalLeaveCancelButtonProps) {
  const t = useTranslations("Erp.Hrm.leave")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" type="button">
          {t("cancelRequest")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("cancelRequest")}</DialogTitle>
          <DialogDescription>
            {t("cancelAria", { dates: requestId })}
          </DialogDescription>
        </DialogHeader>
        <EmployeePortalLeaveCancelForm
          portalSlug={portalSlug}
          requestId={requestId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function EmployeePortalLeaveCancelForm({
  portalSlug,
  requestId,
  onSuccess,
}: EmployeePortalLeaveCancelButtonProps & { onSuccess?: () => void }) {
  const t = useTranslations("Erp.Hrm.leave")
  const [state, formAction, pending] = useActionState<
    CancelLeaveFormState | undefined,
    FormData
  >(cancelPortalEmployeeLeaveAction, undefined)
  useFormSuccess(state, onSuccess)

  const error = state && !state.ok ? state.errors : null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="portalSlug" value={portalSlug} />
      <input type="hidden" name="requestId" value={requestId} />

      {error?.form || error?.requestId ? (
        <Alert variant="destructive">
          <AlertDescription>{error.form ?? error.requestId}</AlertDescription>
        </Alert>
      ) : null}

      <DialogFooter showCloseButton>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? (
            <>
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
                aria-hidden
              />
              {t("cancelling")}
            </>
          ) : (
            t("cancelRequest")
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
