export const hrDocumentsRoutePaths = {
  hub: "/hr",
  documents: "/hr/documents",
} as const;

export type HrDocumentsRoutePath =
  (typeof hrDocumentsRoutePaths)[keyof typeof hrDocumentsRoutePaths];

export function hrEmployeeDetailRoutePath(employeeId: string): `/hr/records/${string}` {
  return `/hr/records/${employeeId}`;
}

export function hrTenantDocumentDownloadPath(documentId: string): string {
  return `/api/internal/v1/documents/${documentId}/download?moduleId=hr`;
}
