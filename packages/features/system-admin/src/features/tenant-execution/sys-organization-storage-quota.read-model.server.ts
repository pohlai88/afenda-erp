import { getOrganizationDocumentStorageBytes } from "@afenda/db";

const DEFAULT_ORG_STORAGE_QUOTA_BYTES = 50 * 1024 * 1024 * 1024;
const QUOTA_WARN_RATIO = 0.8;
const QUOTA_ALERT_RATIO = 0.9;

function resolveOrganizationStorageQuotaBytes(): number {
  const configured = process.env.OBJECT_STORAGE_ORG_QUOTA_BYTES?.trim();
  if (!configured) {
    return DEFAULT_ORG_STORAGE_QUOTA_BYTES;
  }

  const parsed = Number.parseInt(configured, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ORG_STORAGE_QUOTA_BYTES;
}

function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export type OrganizationStorageQuotaSnapshot = {
  consumedBytes: number;
  quotaBytes: number;
  usageRatio: number;
  consumedLabel: string;
  quotaLabel: string;
  usagePercentLabel: string;
  tone: "default" | "attention" | "critical";
};

export async function loadOrganizationStorageQuotaSnapshot(input: {
  organizationId: string;
}): Promise<OrganizationStorageQuotaSnapshot> {
  const quotaBytes = resolveOrganizationStorageQuotaBytes();
  const consumedBytes = await getOrganizationDocumentStorageBytes({
    organizationId: input.organizationId,
  });
  const usageRatio = quotaBytes > 0 ? consumedBytes / quotaBytes : 0;

  let tone: OrganizationStorageQuotaSnapshot["tone"] = "default";
  if (usageRatio >= QUOTA_ALERT_RATIO) {
    tone = "critical";
  } else if (usageRatio >= QUOTA_WARN_RATIO) {
    tone = "attention";
  }

  return {
    consumedBytes,
    quotaBytes,
    usageRatio,
    consumedLabel: formatStorageBytes(consumedBytes),
    quotaLabel: formatStorageBytes(quotaBytes),
    usagePercentLabel: `${Math.min(100, Math.round(usageRatio * 100))}%`,
    tone,
  };
}
