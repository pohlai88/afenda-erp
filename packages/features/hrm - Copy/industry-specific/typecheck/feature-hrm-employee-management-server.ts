type AnyValue = any

export type HrmDocumentType = string

export const hrmDocumentTypeLabelKey: (
  documentType: HrmDocumentType
) => `documentTypes.${HrmDocumentType}` = null as AnyValue
export const isHrmDocumentType: (value: unknown) => value is HrmDocumentType =
  null as AnyValue
export const listHrmDocumentsForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly title: string
    readonly documentType: unknown
    readonly [key: string]: any
  }[]
> = null as AnyValue
