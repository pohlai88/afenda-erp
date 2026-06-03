/** ERP permission object for document management read surfaces. */
export const hrWorkforceDocumentsReadPermission = {
  module: "hr",
  object: "documents",
  function: "read",
} as const;

export const hrWorkforceDocumentsWritePermission = {
  module: "hr",
  object: "documents",
  function: "update",
} as const;

export const hrWorkforceDocumentsSensitiveReadPermission = {
  module: "hr",
  object: "documents",
  function: "read",
} as const;
