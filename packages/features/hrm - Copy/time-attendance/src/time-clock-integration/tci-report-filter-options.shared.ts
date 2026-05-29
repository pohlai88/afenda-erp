import type { TciReportRowKind } from "./tci-operational-reports.shared"

export type TimeClockReportFilterOption = {
  readonly value: string
  readonly label: string
}

export type TimeClockReportFilterOptions = {
  readonly employees: readonly TimeClockReportFilterOption[]
  readonly devices: readonly TimeClockReportFilterOption[]
  readonly departments: readonly TimeClockReportFilterOption[]
  readonly locations: readonly TimeClockReportFilterOption[]
  readonly detectionOutcomes: readonly TimeClockReportFilterOption[]
  readonly syncStatuses: readonly TimeClockReportFilterOption[]
  readonly rowKinds: readonly {
    readonly value: TciReportRowKind
    readonly label: string
  }[]
}
