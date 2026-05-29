export const HR_DOCUMENT_TYPES = [
  "identity",
  "contract",
  "certification",
  "compliance",
  "policy_acknowledgement",
  "other",
] as const;

export type HrDocumentType = (typeof HR_DOCUMENT_TYPES)[number];

export type HrEmployeeDocumentRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  documentType: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  classification: "internal" | "confidential" | "restricted";
  verificationStatus: "pending" | "verified" | "rejected";
  lifecycleStatus: "active" | "archived";
  effectiveFrom: Date;
  effectiveTo: Date | null;
  uploadedAt: Date;
};

export type HrEmployeeDocumentWindow = {
  rows: readonly HrEmployeeDocumentRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
