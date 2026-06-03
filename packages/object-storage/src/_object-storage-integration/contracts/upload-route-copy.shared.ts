export const objectStorageRouteCopy = {
  authenticationRequired: "Authentication is required.",
  organizationRequired: "An active organization is required.",
  uploadNotAllowed: "Document upload is not allowed.",
  blobNotConfigured:
    "Document uploads are unavailable. Configure object storage for this environment.",
  storageNotConfigured:
    "Document uploads are unavailable. Configure object storage for this environment.",
  invalidRequest: "Invalid document upload request.",
  uploadFailed: "Document upload failed.",
  missingTokenPayload: "Upload token payload is missing.",
  tokenMismatch: "Upload token does not match the active session.",
  documentNotFound: "Document was not found.",
  downloadNotAllowed: "Document download is not allowed.",
  blobStorageUnavailable: "Document storage is temporarily unavailable.",
} as const;

