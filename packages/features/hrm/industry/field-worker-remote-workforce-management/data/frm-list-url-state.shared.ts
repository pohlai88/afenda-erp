import {
  type AppSearchParams,
  searchParamFirst,
} from "@afenda/platform/i18n/app-search-params.shared"

export const FRM_EXCEPTION_LIST_PARAMS = {
  focus: "focus",
  state: "frmExceptionState",
  code: "frmExceptionCode",
  sort: "frmExceptionSort",
} as const

export const FRM_TRAVEL_LIST_PARAMS = {
  search: "frmTravelSearch",
  compliance: "frmTravelCompliance",
  sort: "frmTravelSort",
} as const

export const FRM_PER_DIEM_LIST_PARAMS = {
  search: "frmPerDiemSearch",
  state: "frmPerDiemState",
  sort: "frmPerDiemSort",
} as const

export const FRM_EXCEPTION_LIST_OWNED_PARAMS = Object.values(
  FRM_EXCEPTION_LIST_PARAMS
)
export const FRM_TRAVEL_LIST_OWNED_PARAMS = Object.values(
  FRM_TRAVEL_LIST_PARAMS
)
export const FRM_PER_DIEM_LIST_OWNED_PARAMS = Object.values(
  FRM_PER_DIEM_LIST_PARAMS
)

export const FRM_EXCEPTION_SORT_VALUES = ["date-desc", "employee-asc"] as const
export const FRM_TRAVEL_SORT_VALUES = ["start-desc", "employee-asc"] as const
export const FRM_PER_DIEM_SORT_VALUES = ["date-desc", "amount-desc"] as const

export type FrmExceptionSortValue = (typeof FRM_EXCEPTION_SORT_VALUES)[number]
export type FrmTravelSortValue = (typeof FRM_TRAVEL_SORT_VALUES)[number]
export type FrmPerDiemSortValue = (typeof FRM_PER_DIEM_SORT_VALUES)[number]

export type FrmListUrlState = {
  readonly focus: string | null
  readonly exceptionState: string | null
  readonly exceptionCode: string | null
  readonly exceptionSort: FrmExceptionSortValue | null
  readonly travelSearch: string | null
  readonly travelCompliance: string | null
  readonly travelSort: FrmTravelSortValue | null
  readonly perDiemSearch: string | null
  readonly perDiemState: string | null
  readonly perDiemSort: FrmPerDiemSortValue | null
}

export const EMPTY_FRM_LIST_URL_STATE: FrmListUrlState = {
  focus: null,
  exceptionState: null,
  exceptionCode: null,
  exceptionSort: null,
  travelSearch: null,
  travelCompliance: null,
  travelSort: null,
  perDiemSearch: null,
  perDiemState: null,
  perDiemSort: null,
}

function scalar(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

function literal<T extends readonly string[]>(
  values: T,
  value: string | undefined
): T[number] | null {
  const trimmed = value?.trim() ?? ""
  const candidate = trimmed as T[number]
  return values.includes(candidate) ? candidate : null
}

export function parseFrmListUrlState(
  searchParams: AppSearchParams
): FrmListUrlState {
  return {
    focus: scalar(
      searchParamFirst(searchParams, FRM_EXCEPTION_LIST_PARAMS.focus)
    ),
    exceptionState: scalar(
      searchParamFirst(searchParams, FRM_EXCEPTION_LIST_PARAMS.state)
    ),
    exceptionCode: scalar(
      searchParamFirst(searchParams, FRM_EXCEPTION_LIST_PARAMS.code)
    ),
    exceptionSort: literal(
      FRM_EXCEPTION_SORT_VALUES,
      searchParamFirst(searchParams, FRM_EXCEPTION_LIST_PARAMS.sort)
    ),
    travelSearch: scalar(
      searchParamFirst(searchParams, FRM_TRAVEL_LIST_PARAMS.search)
    ),
    travelCompliance: scalar(
      searchParamFirst(searchParams, FRM_TRAVEL_LIST_PARAMS.compliance)
    ),
    travelSort: literal(
      FRM_TRAVEL_SORT_VALUES,
      searchParamFirst(searchParams, FRM_TRAVEL_LIST_PARAMS.sort)
    ),
    perDiemSearch: scalar(
      searchParamFirst(searchParams, FRM_PER_DIEM_LIST_PARAMS.search)
    ),
    perDiemState: scalar(
      searchParamFirst(searchParams, FRM_PER_DIEM_LIST_PARAMS.state)
    ),
    perDiemSort: literal(
      FRM_PER_DIEM_SORT_VALUES,
      searchParamFirst(searchParams, FRM_PER_DIEM_LIST_PARAMS.sort)
    ),
  }
}

export function buildFrmListHref(
  pathname: string,
  state: FrmListUrlState,
  ownedParams: readonly string[]
): string {
  const params = new URLSearchParams()
  const entries: Record<string, string | null> = {
    [FRM_EXCEPTION_LIST_PARAMS.focus]: state.focus,
    [FRM_EXCEPTION_LIST_PARAMS.state]: state.exceptionState,
    [FRM_EXCEPTION_LIST_PARAMS.code]: state.exceptionCode,
    [FRM_EXCEPTION_LIST_PARAMS.sort]: state.exceptionSort,
    [FRM_TRAVEL_LIST_PARAMS.search]: state.travelSearch,
    [FRM_TRAVEL_LIST_PARAMS.compliance]: state.travelCompliance,
    [FRM_TRAVEL_LIST_PARAMS.sort]: state.travelSort,
    [FRM_PER_DIEM_LIST_PARAMS.search]: state.perDiemSearch,
    [FRM_PER_DIEM_LIST_PARAMS.state]: state.perDiemState,
    [FRM_PER_DIEM_LIST_PARAMS.sort]: state.perDiemSort,
  }

  for (const param of ownedParams) {
    const value = entries[param]
    if (value) params.set(param, value)
  }

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}
