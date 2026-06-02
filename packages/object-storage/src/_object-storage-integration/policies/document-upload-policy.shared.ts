export const documentUploadMaxSizeBytes = 25 * 1024 * 1024;

export const documentUploadContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const documentUploadAccept = documentUploadContentTypes.join(",");

export function formatUploadLimit(bytes = documentUploadMaxSizeBytes) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(0)} MB`;
}
