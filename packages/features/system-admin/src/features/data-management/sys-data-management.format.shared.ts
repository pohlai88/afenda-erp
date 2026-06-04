import type {
  SystemAdminExportJobStatus,
  SystemAdminImportJobStatus,
  SystemAdminImportRowStatus,
} from "./sys-import-job.contract";

export function formatSystemAdminImportJobStatusLabel(
  status: SystemAdminImportJobStatus,
) {
  return status
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSystemAdminImportRowStatusLabel(
  status: SystemAdminImportRowStatus,
) {
  return status[0]?.toUpperCase() + status.slice(1);
}

export function formatSystemAdminExportJobStatusLabel(
  status: SystemAdminExportJobStatus,
) {
  return status[0]?.toUpperCase() + status.slice(1);
}
