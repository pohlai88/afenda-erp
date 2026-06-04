import type {
  SystemAdminDataExportJobStatus,
  SystemAdminDataImportJobStatus,
  SystemAdminDataImportRowStatus,
} from "@afenda/db";
import type { AppCapability } from "@afenda/kernel";

export type SystemAdminImportJobStatus = SystemAdminDataImportJobStatus;
export type SystemAdminImportRowStatus = SystemAdminDataImportRowStatus;
export type SystemAdminExportJobStatus = SystemAdminDataExportJobStatus;

export type SystemAdminImportTemplate = {
  id: string;
  adapterId: string;
  version: string;
  label: string;
  description: string;
  targetDomain: string;
  requiredHeaders: readonly string[];
  sensitiveHeaders: readonly string[];
  retrySafe: boolean;
  requiredCapabilities: readonly AppCapability[];
};

export type SystemAdminImportJobListRow = {
  id: string;
  adapterId: string;
  templateId: string;
  templateLabel: string;
  sourceLabel: string;
  filename: string;
  inputDigest: string;
  status: SystemAdminImportJobStatus;
  statusLabel: string;
  totalRows: number;
  validatedRows: number;
  appliedRows: number;
  failedRows: number;
  skippedRows: number;
  createdByAuthUserId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  canRun: boolean;
  canCancel: boolean;
};

export type SystemAdminImportRowFailure = {
  id: string;
  jobId: string;
  rowNumber: number;
  status: SystemAdminImportRowStatus;
  statusLabel: string;
  rowDigest: string;
  validationCode: string;
  validationMessage: string;
  redactedPreview: Record<string, string>;
  createdAt: Date;
};

export type SystemAdminExportJobListRow = {
  id: string;
  exportType: string;
  sourceLabel: string;
  status: SystemAdminExportJobStatus;
  statusLabel: string;
  rowCount: number;
  packageDigest: string;
  createdByAuthUserId: string;
  createdAt: Date;
};

export type SystemAdminDataManagementSummary = {
  totalJobs: number;
  readyJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  totalRows: number;
  failedRows: number;
  exportCount: number;
};

export type CreateSystemAdminImportJobActionData = {
  jobId: string;
  status: SystemAdminImportJobStatus;
  totalRows: number;
  failedRows: number;
};

export type ExportSystemAdminDataManagementActionData = {
  csv: string;
  rowCount: number;
  exportId: string;
  truncated: boolean;
};
