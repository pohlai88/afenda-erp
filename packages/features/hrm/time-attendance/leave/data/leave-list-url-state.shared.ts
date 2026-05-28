import {
  type AppSearchParams,
  searchParamFirst,
} from "@afenda/platform/i18n/app-search-params.shared"

export const LEAVE_PENDING_LIST_PARAMS = {
  focus: "focus",
  type: "leavePendingType",
  sort: "leavePendingSort",
} as const

export const LEAVE_PENDING_LIST_OWNED_PARAMS = Object.values(
  LEAVE_PENDING_LIST_PARAMS
)

export const LEAVE_PENDING_SORT_VALUES = [
  "requested-desc",
  "employee-asc",
] as const

export type LeavePendingSortValue = (typeof LEAVE_PENDING_SORT_VALUES)[number]

export type LeaveListUrlState = {
  readonly focus: string | null
  readonly pendingType: string | null
  readonly pendingSort: LeavePendingSortValue | null
}

function scalar(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

function parsePendingSort(
  value: string | undefined
): LeavePendingSortValue | null {
  const trimmed = value?.trim() ?? ""
  const candidate = trimmed as LeavePendingSortValue
  return LEAVE_PENDING_SORT_VALUES.includes(candidate) ? candidate : null
}

export function buildLeavePendingListHref(
  pathname: string,
  state: LeaveListUrlState
): string {
  const params = new URLSearchParams()
  if (state.focus) params.set(LEAVE_PENDING_LIST_PARAMS.focus, state.focus)
  if (state.pendingType) {
    params.set(LEAVE_PENDING_LIST_PARAMS.type, state.pendingType)
  }
  if (state.pendingSort) {
    params.set(LEAVE_PENDING_LIST_PARAMS.sort, state.pendingSort)
  }
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function parseLeaveListUrlState(
  searchParams: AppSearchParams
): LeaveListUrlState {
  return {
    focus: scalar(
      searchParamFirst(searchParams, LEAVE_PENDING_LIST_PARAMS.focus)
    ),
    pendingType: scalar(
      searchParamFirst(searchParams, LEAVE_PENDING_LIST_PARAMS.type)
    ),
    pendingSort: parsePendingSort(
      searchParamFirst(searchParams, LEAVE_PENDING_LIST_PARAMS.sort)
    ),
  }
}
