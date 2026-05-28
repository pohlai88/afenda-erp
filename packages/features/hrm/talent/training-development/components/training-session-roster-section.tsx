import {
  GovernedEmpty,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server"
import { Button } from "@afenda/ui/button"
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select"

import { buildTrainingSessionRosterListSurfaceConfiguration } from "../data/training-list-surface.server"
import type {
  HrmTrainingAssignmentRow,
  HrmTrainingSessionRow,
} from "../data/training.types.shared"

import { TrainingSessionRosterTrailingCell } from "./training-list-trailing-cells.client"
import { TrainingSessionCloseButton } from "./training-session-close-button.client"

type EmployeeChoice = {
  readonly id: string
  readonly employeeNumber: string
  readonly legalName: string
}

type TrainingSessionRosterSectionProps = {
  sessions: readonly HrmTrainingSessionRow[]
  assignments: readonly HrmTrainingAssignmentRow[]
  orgSlug: string
  organizationId: string
  employees: readonly EmployeeChoice[]
  formatDateTime: (value: Date) => string
  assignAction: (formData: FormData) => void | Promise<void>
  attendanceAction: (formData: FormData) => void | Promise<void>
  closeAction: (formData: FormData) => void | Promise<void>
  labels: {
    colEmployee: string
    colAttendance: string
    colState: string
    closeSession: string
    markPresent: string
    assignToSession: string
    empty: string
  }
}

export async function TrainingSessionRosterSection({
  sessions,
  assignments,
  orgSlug,
  organizationId,
  employees,
  formatDateTime,
  assignAction,
  attendanceAction,
  closeAction,
  labels,
}: TrainingSessionRosterSectionProps) {
  if (sessions.length === 0) {
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: labels.empty,
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session) => (
        <TrainingSessionRosterBlock
          key={session.id}
          session={session}
          assignments={assignments}
          orgSlug={orgSlug}
          organizationId={organizationId}
          employees={employees}
          formatDateTime={formatDateTime}
          assignAction={assignAction}
          attendanceAction={attendanceAction}
          closeAction={closeAction}
          labels={labels}
        />
      ))}
    </div>
  )
}

type TrainingSessionRosterBlockProps = {
  session: HrmTrainingSessionRow
  assignments: readonly HrmTrainingAssignmentRow[]
  orgSlug: string
  organizationId: string
  employees: readonly EmployeeChoice[]
  formatDateTime: (value: Date) => string
  assignAction: (formData: FormData) => void | Promise<void>
  attendanceAction: (formData: FormData) => void | Promise<void>
  closeAction: (formData: FormData) => void | Promise<void>
  labels: TrainingSessionRosterSectionProps["labels"]
}

async function TrainingSessionRosterBlock({
  session,
  assignments,
  orgSlug,
  organizationId,
  employees,
  formatDateTime,
  assignAction,
  attendanceAction,
  closeAction,
  labels,
}: TrainingSessionRosterBlockProps) {
  const roster = assignments.filter(
    (assignment) => assignment.sessionId === session.id
  )
  const open = session.state === "scheduled" || session.state === "in_progress"
  const listConfiguration = buildTrainingSessionRosterListSurfaceConfiguration(
    roster,
    orgSlug,
    {
      colEmployee: labels.colEmployee,
      colAttendance: labels.colAttendance,
      colState: labels.colState,
    }
  )
  const assignForm = open ? (
    <form action={assignAction} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="courseId" value={session.courseId} />
      <input type="hidden" name="sessionId" value={session.id} />
      <input type="hidden" name="sourceKind" value="session_roster" />
      <NativeSelect name="employeeId" required className="min-w-[12rem]">
        {employees.map((employee) => (
          <NativeSelectOption key={employee.id} value={employee.id}>
            {employee.employeeNumber} — {employee.legalName}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Button type="submit" size="sm">
        {labels.assignToSession}
      </Button>
    </form>
  ) : null

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">
            {session.code} — {session.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {session.courseName} · {session.location}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(session.scheduledStartAt)} —{" "}
            {formatDateTime(session.scheduledEndAt)} · {session.state} ·{" "}
            {roster.length} enrolled
          </p>
        </div>
        {open ? (
          <TrainingSessionCloseButton
            organizationId={organizationId}
            orgSlug={orgSlug}
            sessionId={session.id}
            closeAction={closeAction}
            label={labels.closeSession}
          />
        ) : null}
      </div>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={listConfiguration}
        surfaceKey={`hrm:training:session-roster:${session.id}`}
        contentAfterList={assignForm}
        trailingColumn={
          open
            ? {
                header: "",
                Cell: TrainingSessionRosterTrailingCell,
                context: {
                  organizationId,
                  orgSlug,
                  attendanceAction,
                  presentLabel: labels.markPresent,
                  roster: roster.map((row) => ({ id: row.id })),
                },
              }
            : undefined
        }
      />
    </div>
  )
}
