type AnyValue = any

export type RailMemorySavedView = {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly href: string
  readonly [key: string]: any
}

export const listSavedViewsForUser: (
  ...args: readonly AnyValue[]
) => Promise<readonly RailMemorySavedView[]> = null as AnyValue
