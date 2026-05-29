import type {
  HrmFrmAssignmentType,
  HrmFrmExceptionCode,
  HrmFrmSyncStatus,
  HrmFrmTravelClass,
  HrmFrmWorksiteType,
} from "../schemas/frm-workflow-state.shared"

export type FrmWorksiteRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly worksiteType: HrmFrmWorksiteType
  readonly countryCode: string | null
  readonly city: string | null
  readonly approvedRemote: boolean
  readonly active: boolean
}

export type FrmAssignmentRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly worksiteId: string
  readonly worksiteLabel: string
  readonly assignmentType: HrmFrmAssignmentType
  readonly startDate: string
  readonly endDate: string | null
  readonly state: string
  readonly managerEmployeeId: string | null
  readonly departmentRef: string | null
  readonly legalEntityRef: string | null
}

export type FrmExceptionRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly exceptionCode: HrmFrmExceptionCode
  readonly exceptionDate: string
  readonly state: string
  readonly assignmentId: string | null
}

export type FrmTravelStatusRow = {
  readonly id: string
  readonly assignmentId: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly travelClass: HrmFrmTravelClass
  readonly startDate: string
  readonly endDate: string | null
  readonly state: string
  readonly destinationCountry: string | null
  readonly destinationCity: string | null
  readonly nonCompliant: boolean
}

export type FrmAttendanceLinkRow = {
  readonly id: string
  readonly assignmentId: string
  readonly eventKind: string
  readonly capturedAt: Date
  readonly syncStatus: HrmFrmSyncStatus
  readonly locationVerificationOutcome: string | null
  readonly worksiteValidated: boolean
}

export type FrmPerDiemReferenceRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly eligibilityDate: string
  readonly dayPortion: string
  readonly approvedAmount: string
  readonly currencyCode: string
  readonly state: string
}
