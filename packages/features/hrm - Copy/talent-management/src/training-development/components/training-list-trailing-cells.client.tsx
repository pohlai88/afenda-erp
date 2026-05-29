"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { TrainingAssignmentRowActions } from "./training-assignment-row-actions.client"
import { TrainingCourseArchiveButton } from "./training-course-archive-button.client"
import { TrainingMarkPresentButton } from "./training-mark-present-button.client"
import { TrainingPrerequisiteRemoveButton } from "./training-prerequisite-remove-button.client"
import { TrainingRecordVerifyButton } from "./training-record-verify-button.client"

type TrainingCatalogTrailingContext = {
  organizationId: string
  orgSlug: string
  archiveAction: (formData: FormData) => void | Promise<void>
  archiveLabel: string
  courses: readonly { id: string; state: string }[]
}

export function TrainingCatalogTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TrainingCatalogTrailingContext | undefined
  const course = ctx?.courses.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !course ||
    course.state !== "active" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <TrainingCourseArchiveButton
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        courseId={course.id}
        archiveAction={ctx.archiveAction}
        label={ctx.archiveLabel}
      />
    </GovernedTrailingActionSlot>
  )
}

type TrainingPrerequisiteTrailingContext = {
  organizationId: string
  orgSlug: string
  removeAction: (formData: FormData) => void | Promise<void>
  removeLabel: string
}

export function TrainingPrerequisiteTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TrainingPrerequisiteTrailingContext | undefined
  const trailingAction = row.trailingAction
  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <TrainingPrerequisiteRemoveButton
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        prerequisiteId={row.id}
        removeAction={ctx.removeAction}
        label={ctx.removeLabel}
      />
    </GovernedTrailingActionSlot>
  )
}

type TrainingRecordTrailingContext = {
  organizationId: string
  orgSlug: string
  verifyLabel: string
  records: readonly { id: string; verificationState: string }[]
}

export function TrainingRecordTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TrainingRecordTrailingContext | undefined
  const record = ctx?.records.find((entry) => entry.id === row.id)
  if (!ctx || !record || record.verificationState !== "self_attested") {
    return null
  }
  return (
    <TrainingRecordVerifyButton
      organizationId={ctx.organizationId}
      orgSlug={ctx.orgSlug}
      recordId={record.id}
      label={ctx.verifyLabel}
    />
  )
}

type TrainingAssignmentTrailingContext = {
  organizationId: string
  orgSlug: string
  completedAt: string
  completeAction: (formData: FormData) => void | Promise<void>
  waiveAction: (formData: FormData) => void | Promise<void>
  cancelAction: (formData: FormData) => void | Promise<void>
  labels: {
    complete: string
    waive: string
    cancel: string
  }
  assignments: readonly {
    id: string
    courseId: string
    employeeId: string
  }[]
}

export function TrainingAssignmentTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TrainingAssignmentTrailingContext | undefined
  const assignment = ctx?.assignments.find((entry) => entry.id === row.id)
  if (!ctx || !assignment) {
    return null
  }
  return (
    <TrainingAssignmentRowActions
      organizationId={ctx.organizationId}
      orgSlug={ctx.orgSlug}
      assignmentId={assignment.id}
      courseId={assignment.courseId}
      employeeId={assignment.employeeId}
      completedAt={ctx.completedAt}
      completeAction={ctx.completeAction}
      waiveAction={ctx.waiveAction}
      cancelAction={ctx.cancelAction}
      labels={ctx.labels}
    />
  )
}

type TrainingSessionRosterTrailingContext = {
  organizationId: string
  orgSlug: string
  attendanceAction: (formData: FormData) => void | Promise<void>
  presentLabel: string
  roster: readonly { id: string }[]
}

export function TrainingSessionRosterTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TrainingSessionRosterTrailingContext | undefined
  const rosterRow = ctx?.roster.find((entry) => entry.id === row.id)
  if (!ctx || !rosterRow) {
    return null
  }
  return (
    <TrainingMarkPresentButton
      organizationId={ctx.organizationId}
      orgSlug={ctx.orgSlug}
      assignmentId={rosterRow.id}
      attendanceAction={ctx.attendanceAction}
      label={ctx.presentLabel}
    />
  )
}
