import type {
  SystemAdminImportTemplate,
} from "../contracts/system-admin.import-job.contract";

export type SystemAdminImportRowParseResult =
  | {
      ok: true;
      redactedPreview: Record<string, string>;
    }
  | {
      ok: false;
      code: string;
      message: string;
      redactedPreview: Record<string, string>;
    };

export type SystemAdminImportAdapter = {
  id: string;
  label: string;
  template: SystemAdminImportTemplate;
  parseRow(record: Record<string, string>): SystemAdminImportRowParseResult;
};

function redactRecord(
  record: Record<string, string>,
  sensitiveHeaders: readonly string[],
) {
  const sensitive = new Set(sensitiveHeaders.map((header) => header.toLowerCase()));

  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      sensitive.has(key.toLowerCase()) && value ? "[redacted]" : value,
    ]),
  );
}

function parseAccessReviewRow(
  record: Record<string, string>,
): SystemAdminImportRowParseResult {
  const redactedPreview = redactRecord(record, ["note"]);
  const email = record.userEmail?.trim().toLowerCase();
  const role = record.requestedRole?.trim();
  const reason = record.accessReason?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      ok: false,
      code: "invalid_user_email",
      message: "userEmail must be a valid email address.",
      redactedPreview,
    };
  }

  if (!role) {
    return {
      ok: false,
      code: "missing_requested_role",
      message: "requestedRole is required.",
      redactedPreview,
    };
  }

  if (!reason || reason.length < 8) {
    return {
      ok: false,
      code: "missing_access_reason",
      message: "accessReason must contain at least 8 characters.",
      redactedPreview,
    };
  }

  return { ok: true, redactedPreview };
}

export const systemAdminImportTemplates = [
  {
    id: "system-admin.access-review.v1",
    adapterId: "system-admin.access-review",
    version: "1",
    label: "Access review evidence",
    description:
      "Stages user access review rows with email, requested role, and business reason evidence.",
    targetDomain: "system-admin",
    requiredHeaders: ["userEmail", "requestedRole", "accessReason"],
    sensitiveHeaders: ["note"],
    retrySafe: true,
    requiredCapabilities: [
      "system-admin.data-management.manage",
      "system-admin.data-management.run",
    ],
  },
] as const satisfies readonly SystemAdminImportTemplate[];

export const systemAdminImportAdapters = [
  {
    id: "system-admin.access-review",
    label: "Access review evidence",
    template: systemAdminImportTemplates[0],
    parseRow: parseAccessReviewRow,
  },
] as const satisfies readonly SystemAdminImportAdapter[];

export function listSystemAdminImportTemplates() {
  return [...systemAdminImportTemplates];
}

export function getSystemAdminImportTemplate(templateId: string) {
  return systemAdminImportTemplates.find((template) => template.id === templateId);
}

export function getSystemAdminImportAdapter(adapterId: string) {
  return systemAdminImportAdapters.find((adapter) => adapter.id === adapterId);
}
