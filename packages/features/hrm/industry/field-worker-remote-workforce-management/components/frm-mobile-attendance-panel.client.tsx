"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import Link from "next/link"
import type { Route } from "next"

import {
  reconcileFrmOfflineAttendanceAction,
  syncFrmAttendanceFromGeolocationAction,
} from "../actions/frm-attendance.actions"
import { FrmSafetyCheckinDialog } from "./frm-safety-checkin-dialog.client"
import type {
  FrmAttendanceReconcileFormState,
  FrmAttendanceSyncFormState,
} from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type AssignmentChoice = { readonly id: string; readonly label: string }

export function FrmMobileAttendancePanel({
  assignments,
  geolocationHref,
  canManage,
}: {
  assignments: readonly AssignmentChoice[]
  geolocationHref: string
  canManage: boolean
}) {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const today = new Date().toISOString().slice(0, 10)

  const [syncState, syncAction, syncPending] = useActionState<
    FrmAttendanceSyncFormState | undefined,
    FormData
  >(syncFrmAttendanceFromGeolocationAction, undefined)

  const [reconcileState, reconcileAction, reconcilePending] = useActionState<
    FrmAttendanceReconcileFormState | undefined,
    FormData
  >(reconcileFrmOfflineAttendanceAction, undefined)

  const syncError = syncState && !syncState.ok ? syncState.errors.form : null
  const reconcileError =
    reconcileState && !reconcileState.ok ? reconcileState.errors.form : null

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-muted-foreground">{t("mobileCaptureBody")}</p>
      <Link
        href={geolocationHref as Route}
        className="text-primary underline-offset-4 hover:underline"
        prefetch={false}
      >
        {t("mobileCaptureGeolocationLink")}
      </Link>

      {canManage ? (
        <div className="flex flex-col gap-4 rounded-md border border-border p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                {t("safetyCheckinTitle")}
              </p>
              <p className="text-muted-foreground">
                {t("safetyCheckinPanelHint")}
              </p>
            </div>
            <FrmSafetyCheckinDialog assignments={assignments} />
          </div>

          <p className="font-medium text-foreground">{t("mobileSyncTitle")}</p>
          <p className="text-muted-foreground">{t("mobileSyncDescription")}</p>

          <form action={syncAction} className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="frm-sync-asg">
                {t("colAssignment")}
              </FieldLabel>
              <select
                id="frm-sync-asg"
                name="assignmentId"
                className={SELECT_CLASS}
                required
                disabled={syncPending || assignments.length === 0}
              >
                <option value="">{t("selectAssignment")}</option>
                {assignments.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="frm-sync-date">
                {t("colWorkDate")}
              </FieldLabel>
              <Input
                id="frm-sync-date"
                name="workDate"
                type="date"
                required
                defaultValue={today}
                disabled={syncPending}
              />
            </Field>
            {syncError ? <FieldError>{syncError}</FieldError> : null}
            {syncState?.ok ? (
              <p className="text-xs text-muted-foreground">
                {t("mobileSyncSuccess", { count: syncState.linked })}
              </p>
            ) : null}
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={syncPending || assignments.length === 0}
            >
              {syncPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                t("syncFromGeolocation")
              )}
            </Button>
          </form>

          <form action={reconcileAction} className="flex flex-col gap-2">
            {reconcileError ? <FieldError>{reconcileError}</FieldError> : null}
            {reconcileState?.ok ? (
              <p className="text-xs text-muted-foreground">
                {t("mobileReconcileSuccess", {
                  count: reconcileState.reconciled,
                })}
              </p>
            ) : null}
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={reconcilePending}
            >
              {reconcilePending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                t("reconcileOffline")
              )}
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
