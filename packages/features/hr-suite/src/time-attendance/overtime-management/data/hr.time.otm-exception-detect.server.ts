import {
  calculateOtmPayableForApproval,
  deriveOtmDayCategoryFromType,
  getHrOvertimePolicy,
  hrAttendanceDays,
  hrEmployees,
  hrOvertimeRequests,
  hrShiftAssignments,
  hrShiftTemplates,
  listHrOvertimeRateRules,
  runWithOrganizationContext,
  sumHrOvertimeApprovedMinutesForEmployee,
  syncHrOvertimeExceptions,
} from "@afenda/db";
import { and, eq, isNull } from "drizzle-orm";

/** HRM-OTM-009/010/014 — detect policy exceptions and persist open rows. */
export async function detectAndSyncHrTimeOtmExceptions(input: {
  organizationId: string;
  requestId: string;
}): Promise<{ exceptionCount: number }> {
  const context = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select({
          employeeId: hrOvertimeRequests.employeeId,
          overtimeType: hrOvertimeRequests.overtimeType,
          policyGroupCode: hrOvertimeRequests.policyGroupCode,
          workDate: hrOvertimeRequests.workDate,
          startTime: hrOvertimeRequests.startTime,
          endTime: hrOvertimeRequests.endTime,
          hours: hrOvertimeRequests.hours,
          dayCategory: hrOvertimeRequests.dayCategory,
          countryCode: hrEmployees.countryCode,
          employeeCategory: hrEmployees.workerCategory,
        })
        .from(hrOvertimeRequests)
        .innerJoin(
          hrEmployees,
          eq(hrOvertimeRequests.employeeId, hrEmployees.id),
        )
        .where(
          and(
            eq(hrOvertimeRequests.organizationId, input.organizationId),
            eq(hrOvertimeRequests.id, input.requestId),
            isNull(hrEmployees.archivedAt),
          ),
        )
        .limit(1);

      if (!row) {
        return null;
      }

      let attendanceOvertimeMinutes: number | null = null;
      const [attendanceDay] = await db
        .select({ calculationSnapshot: hrAttendanceDays.calculationSnapshot })
        .from(hrAttendanceDays)
        .where(
          and(
            eq(hrAttendanceDays.organizationId, input.organizationId),
            eq(hrAttendanceDays.employeeId, row.employeeId),
            eq(hrAttendanceDays.workDate, row.workDate),
          ),
        )
        .limit(1);

      const snapshot = attendanceDay?.calculationSnapshot as
        | { overtimeMinutes?: number }
        | undefined;
      attendanceOvertimeMinutes = snapshot?.overtimeMinutes ?? null;

      let scheduledShift: {
        shiftStartTime: string;
        shiftEndTime: string;
        workingMinutes: number;
      } | null = null;
      let shiftCategory: string | null = null;

      const [assignment] = await db
        .select({
          templateStart: hrShiftTemplates.startTime,
          templateEnd: hrShiftTemplates.endTime,
          workingMinutes: hrShiftTemplates.workingHoursMinutes,
          shiftCategory: hrShiftTemplates.shiftCategory,
        })
        .from(hrShiftAssignments)
        .innerJoin(
          hrShiftTemplates,
          eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
        )
        .where(
          and(
            eq(hrShiftAssignments.organizationId, input.organizationId),
            eq(hrShiftAssignments.employeeId, row.employeeId),
            eq(hrShiftAssignments.shiftDate, row.workDate),
          ),
        )
        .limit(1);

      if (assignment) {
        scheduledShift = {
          shiftStartTime: assignment.templateStart,
          shiftEndTime: assignment.templateEnd,
          workingMinutes: assignment.workingMinutes,
        };
        shiftCategory = assignment.shiftCategory;
      }

      return {
        ...row,
        attendanceOvertimeMinutes,
        scheduledShift,
        shiftCategory,
      };
    },
  );

  if (!context) {
    return { exceptionCount: 0 };
  }

  const policy = await getHrOvertimePolicy({
    organizationId: input.organizationId,
    policyGroupCode: context.policyGroupCode,
  });

  const rateRules = await listHrOvertimeRateRules({
    organizationId: input.organizationId,
    policyGroupCode: context.policyGroupCode,
  });

  const periodUsage = await sumHrOvertimeApprovedMinutesForEmployee({
    organizationId: input.organizationId,
    employeeId: context.employeeId,
    workDate: context.workDate,
  });

  const dayCategory =
    context.dayCategory ?? deriveOtmDayCategoryFromType(context.overtimeType);

  const result = calculateOtmPayableForApproval({
    policy,
    rateRules,
    rateContext: {
      overtimeType: context.overtimeType,
      dayCategory,
      shiftCategory: context.shiftCategory,
      employeeCategory: context.employeeCategory,
      countryCode: context.countryCode,
      asOf: context.workDate,
    },
    periodUsage,
    hours: context.hours,
    startTime: context.startTime,
    endTime: context.endTime,
    attendanceOvertimeMinutes: context.attendanceOvertimeMinutes,
    scheduledShift: context.scheduledShift,
  });

  const { exceptionIds } = await syncHrOvertimeExceptions({
    organizationId: input.organizationId,
    requestId: input.requestId,
    exceptions: result.exceptions,
  });

  return { exceptionCount: exceptionIds.length };
}
