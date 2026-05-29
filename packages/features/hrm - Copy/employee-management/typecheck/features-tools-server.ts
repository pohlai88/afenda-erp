type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const completeSignatureParty: AnyValue = null
export const createSignatureRequest: AnyValue = null
export const getSignatureDeclarationText: AnyValue = null
export const getSignaturePartyByToken: AnyValue = null
export const getSignatureSourceDocumentPreview: AnyValue = null
export const listPendingSignaturePartiesForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly party: LooseRecord
    readonly request: LooseRecord
  }[]
> = null as AnyValue
export const recordSignatureConsentPresented: AnyValue = null
export const recordSignaturePartyView: AnyValue = null
export const rejectSignatureParty: AnyValue = null
