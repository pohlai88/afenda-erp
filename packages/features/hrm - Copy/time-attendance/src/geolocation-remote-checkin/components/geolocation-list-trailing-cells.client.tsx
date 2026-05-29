"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import {
  GeofenceDeprecateButton,
  GeofenceUpsertDialog,
} from "./geofence-form.client"
import { RemoteCheckinDecisionForms } from "./remote-checkin-decision-form.client"
import { RemoteCheckinDeviceRevokeButton } from "./remote-checkin-device-forms.client"
import { RemoteCheckinPolicyDialog } from "./remote-checkin-policy-form.client"

type GeofenceFormScopeKind =
  | "office"
  | "branch"
  | "project_site"
  | "client_site"
  | "field_site"
  | "home_office"

type PolicyFormScope =
  | "org"
  | "department"
  | "position"
  | "employment_type"
  | "policy_group"
  | "employee"

export function GeolocationPendingTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <RemoteCheckinDecisionForms exceptionId={row.id} />
    </GovernedTrailingActionSlot>
  )
}

type GeolocationDeviceTrailingContext = {
  devices: readonly { id: string; deviceLabel: string }[]
}

export function GeolocationDeviceTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const devices = (context as GeolocationDeviceTrailingContext | undefined)
    ?.devices
  const device = devices?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!device || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <RemoteCheckinDeviceRevokeButton
        deviceId={device.id}
        deviceLabel={device.deviceLabel}
      />
    </GovernedTrailingActionSlot>
  )
}

type GeofenceEditDefaults = {
  geofenceId: string
  code: string
  label: string
  scopeKind: GeofenceFormScopeKind
  latitude: string
  longitude: string
  radiusMeters: number
  bufferMeters: number
  countryCode: string | null
  legalEntityCode: string | null
  notes: string | null
}

type GeolocationGeofenceTrailingContext = {
  orgSlug: string
  rows: readonly {
    id: string
    archivedAt: string | null
    defaults: GeofenceEditDefaults
  }[]
}

export function GeolocationGeofenceTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as GeolocationGeofenceTrailingContext | undefined
  const match = ctx?.rows.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !match ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex items-center gap-2">
        <GeofenceUpsertDialog
          orgSlug={ctx.orgSlug}
          mode="edit"
          defaults={match.defaults}
        />
        {match.archivedAt ? null : (
          <GeofenceDeprecateButton geofenceId={match.id} />
        )}
      </div>
    </GovernedTrailingActionSlot>
  )
}

type PolicyEditDefaults = {
  policyId: string
  scopeKind: PolicyFormScope
  scopeRef: string | null
  minGpsAccuracyMeters: number
  allowedRadiusBufferMeters: number
  shiftWindowMinutes: number
  breakWindowMinutes: number
  requireRegisteredDevice: boolean
  requireSelfie: boolean
  detectSpoofing: boolean
  allowEligibilityException: boolean
  isActive: boolean
}

type GeolocationPolicyTrailingContext = {
  orgSlug: string
  scopeRefChoices?: {
    employees: readonly { id: string; label: string }[]
    departments: readonly { id: string; label: string }[]
    positions: readonly { id: string; label: string }[]
  }
  rows: readonly { id: string; defaults: PolicyEditDefaults }[]
}

export function GeolocationPolicyTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as GeolocationPolicyTrailingContext | undefined
  const match = ctx?.rows.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !match ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <RemoteCheckinPolicyDialog
        orgSlug={ctx.orgSlug}
        mode="edit"
        scopeRefChoices={ctx.scopeRefChoices}
        defaults={match.defaults}
      />
    </GovernedTrailingActionSlot>
  )
}
