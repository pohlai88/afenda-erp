import { createModuleFeatureMetadata } from "@afenda/kernel";
import { hrDocumentsSurfaceKey } from "./workforce/documents/surface/hr-documents-ui.copy.shared";
import { hrEmployeesSurfaceKey } from "./workforce/employees/surface/hr-employees-list.surface";
import { hrLifecycleSurfaceKey } from "./workforce/lifecycle/surface/hr-lifecycle-ui.copy.shared";
import {
  hrComplianceExceptionsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
} from "./workforce/compliance/surface/hr-compliance-ui.copy.shared";
import { hrLeaveSurfaceKey } from "./time-attendance/leave/surface/hr-leave-ui.copy.shared";
import { hrAttendanceSurfaceKey } from "./time-attendance/attendance/surface/hr-attendance-ui.copy.shared";
import { hrOvertimeSurfaceKey } from "./time-attendance/overtime/surface/hr-overtime-ui.copy.shared";
import { hrShiftsSurfaceKey } from "./time-attendance/shifts/surface/hr-shifts-ui.copy.shared";
import { hrOnboardingSurfaceKey } from "./workforce/onboarding/surface/hr-onboarding-ui.copy.shared";
import { hrOffboardingSurfaceKey } from "./workforce/offboarding/surface/hr-offboarding-ui.copy.shared";

const kernelMetadata = createModuleFeatureMetadata("hr");

export const {
  moduleId,
  buildRecordListSurface,
  buildWorkItemListSurface,
  buildCountStatGrid,
  buildStatGrid,
  buildOverviewStatGrid,
  buildSavedViewsListSurface,
  buildDocumentRegistryListSurface,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
  buildWorkItemKanbanSurface,
  getOverviewStatSurfaceKey,
  getStatSurfaceKey,
  getWorkItemKanbanSurfaceKey,
} = kernelMetadata;

export function getListSurfaceKeys() {
  return {
    ...kernelMetadata.getListSurfaceKeys(),
    employees: hrEmployeesSurfaceKey,
    workforceDocuments: hrDocumentsSurfaceKey,
    workforceLifecycle: hrLifecycleSurfaceKey,
    workforceOffboarding: hrOffboardingSurfaceKey,
    workforceComplianceObligations: hrComplianceObligationsSurfaceKey,
    workforceComplianceExceptions: hrComplianceExceptionsSurfaceKey,
    timeAttendanceLeave: hrLeaveSurfaceKey,
    workforceOnboarding: hrOnboardingSurfaceKey,
    timeAttendanceAttendance: hrAttendanceSurfaceKey,
    timeAttendanceOvertime: hrOvertimeSurfaceKey,
    timeAttendanceShifts: hrShiftsSurfaceKey,
  };
}

export { hrEmployeesSurfaceKey } from "./workforce/employees/surface/hr-employees-list.surface";
export { hrEmployeesUiCopy } from "./workforce/employees/surface/hr-employees-ui.copy.shared";
export { hrDocumentsSurfaceKey } from "./workforce/documents/surface/hr-documents-ui.copy.shared";
export { hrDocumentsUiCopy } from "./workforce/documents/surface/hr-documents-ui.copy.shared";
export { hrLifecycleSurfaceKey } from "./workforce/lifecycle/surface/hr-lifecycle-ui.copy.shared";
export { hrLifecycleUiCopy } from "./workforce/lifecycle/surface/hr-lifecycle-ui.copy.shared";
export { hrOffboardingSurfaceKey } from "./workforce/offboarding/surface/hr-offboarding-ui.copy.shared";
export { hrOffboardingUiCopy } from "./workforce/offboarding/surface/hr-offboarding-ui.copy.shared";
export {
  hrComplianceExceptionsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceUiCopy,
} from "./workforce/compliance/surface/hr-compliance-ui.copy.shared";
export { hrLeaveSurfaceKey } from "./time-attendance/leave/surface/hr-leave-ui.copy.shared";
export { hrLeaveUiCopy } from "./time-attendance/leave/surface/hr-leave-ui.copy.shared";
export { hrOnboardingSurfaceKey } from "./workforce/onboarding/surface/hr-onboarding-ui.copy.shared";
export { hrOnboardingUiCopy } from "./workforce/onboarding/surface/hr-onboarding-ui.copy.shared";
export { hrAttendanceSurfaceKey } from "./time-attendance/attendance/surface/hr-attendance-ui.copy.shared";
export { hrAttendanceUiCopy } from "./time-attendance/attendance/surface/hr-attendance-ui.copy.shared";
export { hrOvertimeSurfaceKey } from "./time-attendance/overtime/surface/hr-overtime-ui.copy.shared";
export { hrOvertimeUiCopy } from "./time-attendance/overtime/surface/hr-overtime-ui.copy.shared";
export { hrShiftsSurfaceKey } from "./time-attendance/shifts/surface/hr-shifts-ui.copy.shared";
export { hrShiftsUiCopy } from "./time-attendance/shifts/surface/hr-shifts-ui.copy.shared";
