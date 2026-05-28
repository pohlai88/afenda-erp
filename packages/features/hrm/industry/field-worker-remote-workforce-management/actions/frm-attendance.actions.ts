"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  FrmAttendanceReconcileFormState,
  FrmAttendanceSyncFormState,
} from "../../../_core/shared"
import {
  findActiveFrmAssignmentForEmployee,
  listFrmAssignmentsForOrg,
} from "../data/frm-assignments.server"
import {
  reconcileFrmOfflineAttendanceLinks,
  syncFrmAttendanceFromGeolocationForDate,
} from "../data/frm-attendance.server"
import { z } from "zod"

const syncFrmAttendanceFormSchema = z.object({
  assignmentId: z.string().uuid(),
  workDate: z.string().min(1).max(32),
})

export async function syncFrmAttendanceFromGeolocationAction(
  _prev: FrmAttendanceSyncFormState | undefined,
  formData: FormData
): Promise<FrmAttendanceSyncFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "field_workforce",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to sync field attendance.",
    })
  }

  const parsed = syncFrmAttendanceFormSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    workDate: formData.get("workDate"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const assignments = await listFrmAssignmentsForOrg(organizationId)
  const assignment = assignments.find(
    (row) => row.id === parsed.data.assignmentId
  )
  if (!assignment) {
    return hrmActionFailure({ form: "Assignment not found." })
  }

  const active = await findActiveFrmAssignmentForEmployee({
    organizationId,
    employeeId: assignment.employeeId,
    asOfDate: parsed.data.workDate,
  })
  if (!active || active.id !== assignment.id) {
    return hrmActionFailure({
      form: "Assignment is not active on the selected work date.",
    })
  }

  const result = await syncFrmAttendanceFromGeolocationForDate({
    organizationId,
    userId,
    employeeId: assignment.employeeId,
    workDate: parsed.data.workDate,
    assignmentId: parsed.data.assignmentId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, linked: result.linked }
}

export async function reconcileFrmOfflineAttendanceAction(
  _prev: FrmAttendanceReconcileFormState | undefined,
  _formData: FormData
): Promise<FrmAttendanceReconcileFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "field_workforce",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to reconcile offline attendance.",
    })
  }

  const result = await reconcileFrmOfflineAttendanceLinks({
    organizationId,
    userId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, reconciled: result.reconciled }
}
