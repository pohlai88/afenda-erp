"use client"

import { useActionState, useId, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"
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
  revokeTimeClockDeviceAction,
  upsertTimeClockDeviceAction,
} from "../actions/tci-device.actions"
import type { TimeClockDeviceMutationFormState } from "../tci-action-state.shared"
import { formatScheduledSyncCredentialHint } from "../data/tci-scheduled-sync.shared"
import { upsertTimeClockMappingAction } from "../actions/tci-mapping.actions"
import {
  TCI_DIGITAL_DEVICE_TYPES,
  TCI_PHYSICAL_DEVICE_TYPES,
} from "../tci-integration-sources.shared"
import type {
  TciDeviceRegistryState,
  TciDeviceType,
} from "../schemas/tci-workflow-state.shared"
import { TCI_DEVICE_REGISTRY_STATES } from "../schemas/tci-workflow-state.shared"

export type TimeClockDeviceFormSeed = {
  readonly id: string
  readonly externalDeviceId: string
  readonly name: string
  readonly deviceType: TciDeviceType
  readonly locationRef: string | null
  readonly integrationCredentialRef: string | null
  readonly state: TciDeviceRegistryState
}

type DeviceFormCopy = {
  formErrorTitle: string
  externalDeviceId: string
  name: string
  deviceType: string
  location: string
  integrationCredential: string
  integrationCredentialPlaceholder: string
  registryState: string
  deviceTypeGroupPhysical: string
  deviceTypeGroupDigital: string
  deviceTypeLabels: (type: TciDeviceType) => string
  registryStateLabels: (state: TciDeviceRegistryState) => string
}

function TimeClockDeviceUpsertFields({
  copy,
  device,
  showRegistryState,
  errors,
}: {
  copy: DeviceFormCopy
  device?: TimeClockDeviceFormSeed
  showRegistryState: boolean
  errors?: Record<string, string | undefined>
}) {
  const externalId = useId()
  const nameId = useId()
  const typeId = useId()
  const locationId = useId()
  const credentialId = useId()
  const stateId = useId()

  return (
    <>
      {device ? <input type="hidden" name="id" value={device.id} /> : null}
      <Field>
        <FieldLabel htmlFor={externalId}>{copy.externalDeviceId}</FieldLabel>
        <Input
          id={externalId}
          name="externalDeviceId"
          required
          maxLength={120}
          defaultValue={device?.externalDeviceId}
        />
        {errors?.externalDeviceId ? (
          <FieldError>{errors.externalDeviceId}</FieldError>
        ) : null}
      </Field>
      <Field>
        <FieldLabel htmlFor={nameId}>{copy.name}</FieldLabel>
        <Input
          id={nameId}
          name="name"
          required
          maxLength={200}
          defaultValue={device?.name}
        />
        {errors?.name ? <FieldError>{errors.name}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor={typeId}>{copy.deviceType}</FieldLabel>
        <Select
          name="deviceType"
          required
          defaultValue={device?.deviceType ?? "kiosk"}
        >
          <SelectTrigger id={typeId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{copy.deviceTypeGroupPhysical}</SelectLabel>
              {TCI_PHYSICAL_DEVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {copy.deviceTypeLabels(type)}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{copy.deviceTypeGroupDigital}</SelectLabel>
              {TCI_DIGITAL_DEVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {copy.deviceTypeLabels(type)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.deviceType ? (
          <FieldError>{errors.deviceType}</FieldError>
        ) : null}
      </Field>
      {showRegistryState ? (
        <Field>
          <FieldLabel htmlFor={stateId}>{copy.registryState}</FieldLabel>
          <Select name="state" defaultValue={device?.state ?? "active"}>
            <SelectTrigger id={stateId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TCI_DEVICE_REGISTRY_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {copy.registryStateLabels(state)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}
      <Field>
        <FieldLabel htmlFor={locationId}>{copy.location}</FieldLabel>
        <Input
          id={locationId}
          name="locationRef"
          maxLength={200}
          defaultValue={device?.locationRef ?? ""}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={credentialId}>
          {copy.integrationCredential}
        </FieldLabel>
        <Input
          id={credentialId}
          name="integrationCredentialRef"
          maxLength={200}
          placeholder={copy.integrationCredentialPlaceholder}
          defaultValue={device?.integrationCredentialRef ?? ""}
        />
        {errors?.integrationCredentialRef ? (
          <FieldError>{errors.integrationCredentialRef}</FieldError>
        ) : null}
      </Field>
    </>
  )
}

type Choice = { readonly id: string; readonly label: string }

function useDeviceFormCopy(): DeviceFormCopy {
  const t = useTranslations("Erp.Hrm.timeClock.devices")
  return {
    formErrorTitle: t("registerDialogTitle"),
    externalDeviceId: t("fieldExternalId"),
    name: t("fieldName"),
    deviceType: t("fieldDeviceType"),
    location: t("fieldLocation"),
    integrationCredential: t("fieldIntegrationCredential"),
    integrationCredentialPlaceholder: formatScheduledSyncCredentialHint(),
    registryState: t("fieldRegistryState"),
    deviceTypeGroupPhysical: t("deviceTypeGroupPhysical"),
    deviceTypeGroupDigital: t("deviceTypeGroupDigital"),
    deviceTypeLabels: (type) => t(`deviceTypeLabels.${type}`),
    registryStateLabels: (state) => t(`registryStateLabels.${state}`),
  }
}

export function TimeClockDeviceRegisterDialog() {
  const t = useTranslations("Erp.Hrm.timeClock.devices")
  const copy = useDeviceFormCopy()
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<
    TimeClockDeviceMutationFormState | undefined,
    FormData
  >(async (prev, formData) => {
    const next = await upsertTimeClockDeviceAction(prev, formData)
    if (next?.ok) setOpen(false)
    return next
  }, undefined)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("registerOpen")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("registerDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("registerDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {!state?.ok && state?.errors?.form ? (
            <Alert variant="destructive">
              <AlertTitle>{copy.formErrorTitle}</AlertTitle>
              <AlertDescription>{state.errors.form}</AlertDescription>
            </Alert>
          ) : null}
          <TimeClockDeviceUpsertFields
            copy={copy}
            showRegistryState={false}
            errors={state?.ok ? undefined : state?.errors}
          />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("submitting")}
                </>
              ) : (
                t("submitRegister")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TimeClockDeviceEditDialog({
  device,
}: {
  device: TimeClockDeviceFormSeed
}) {
  const t = useTranslations("Erp.Hrm.timeClock.devices")
  const copy = useDeviceFormCopy()
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<
    TimeClockDeviceMutationFormState | undefined,
    FormData
  >(async (prev, formData) => {
    const next = await upsertTimeClockDeviceAction(prev, formData)
    if (next?.ok) setOpen(false)
    return next
  }, undefined)

  const registryState: TciDeviceRegistryState =
    device.state === "inactive" ? "inactive" : "active"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {t("editOpen")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editDialogTitle")}</DialogTitle>
          <DialogDescription>{t("editDialogDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {!state?.ok && state?.errors?.form ? (
            <Alert variant="destructive">
              <AlertTitle>{t("editDialogTitle")}</AlertTitle>
              <AlertDescription>{state.errors.form}</AlertDescription>
            </Alert>
          ) : null}
          <TimeClockDeviceUpsertFields
            copy={copy}
            device={{ ...device, state: registryState }}
            showRegistryState
            errors={state?.ok ? undefined : state?.errors}
          />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("submitting")}
                </>
              ) : (
                t("submitSave")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TimeClockMappingUpsertDialog({
  employees,
  devices,
}: {
  employees: ReadonlyArray<Choice>
  devices: ReadonlyArray<Choice>
}) {
  const t = useTranslations("Erp.Hrm.timeClock.mappings")
  const tCommon = useTranslations("Erp.Hrm.timeClock.devices")
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<
    TimeClockDeviceMutationFormState | undefined,
    FormData
  >(async (prev, formData) => {
    const next = await upsertTimeClockMappingAction(prev, formData)
    if (next?.ok) setOpen(false)
    return next
  }, undefined)

  const employeeId = useId()
  const deviceId = useId()
  const clockUserId = useId()
  const badgeId = useId()
  const biometricRef = useId()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {t("createOpen")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createDialogTitle")}</DialogTitle>
          <DialogDescription>{t("createDialogDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {!state?.ok && state?.errors?.form ? (
            <Alert variant="destructive">
              <AlertTitle>{t("createDialogTitle")}</AlertTitle>
              <AlertDescription>{state.errors.form}</AlertDescription>
            </Alert>
          ) : null}
          <Field>
            <FieldLabel htmlFor={employeeId}>{t("fieldEmployee")}</FieldLabel>
            <Select name="employeeId" required>
              <SelectTrigger id={employeeId} className="w-full">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((choice) => (
                  <SelectItem key={choice.id} value={choice.id}>
                    {choice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!state?.ok && state?.errors?.employeeId ? (
              <FieldError>{state.errors.employeeId}</FieldError>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor={deviceId}>{t("fieldDevice")}</FieldLabel>
            <Select name="deviceId" required>
              <SelectTrigger id={deviceId} className="w-full">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((choice) => (
                  <SelectItem key={choice.id} value={choice.id}>
                    {choice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!state?.ok && state?.errors?.deviceId ? (
              <FieldError>{state.errors.deviceId}</FieldError>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor={clockUserId}>{t("fieldClockUser")}</FieldLabel>
            <Input
              id={clockUserId}
              name="clockUserId"
              required
              maxLength={120}
            />
            {!state?.ok && state?.errors?.clockUserId ? (
              <FieldError>{state.errors.clockUserId}</FieldError>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor={badgeId}>{t("fieldBadge")}</FieldLabel>
            <Input id={badgeId} name="badgeId" maxLength={120} />
          </Field>
          <Field>
            <FieldLabel htmlFor={biometricRef}>
              {t("fieldBiometric")}
            </FieldLabel>
            <Input id={biometricRef} name="biometricRef" maxLength={120} />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {tCommon("submitting")}
                </>
              ) : (
                t("submitCreate")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TimeClockDeviceRevokeButton({
  deviceId,
}: {
  deviceId: string
}) {
  const t = useTranslations("Erp.Hrm.timeClock.devices")
  const [state, action, pending] = useActionState<
    TimeClockDeviceMutationFormState | undefined,
    FormData
  >(revokeTimeClockDeviceAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="deviceId" value={deviceId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? t("revoking") : t("revoke")}
      </Button>
      {state && !state.ok && state.errors.form ? (
        <p className="text-xs text-destructive">{state.errors.form}</p>
      ) : null}
    </form>
  )
}
