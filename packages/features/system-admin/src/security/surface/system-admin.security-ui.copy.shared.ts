import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";

export const systemAdminSecurityUiCopy = {
  page: {
    title: "Security",
    description:
      "Organization-level security posture. Sensitive changes are guarded, scoped, and audited.",
  },
  posture: {
    title: "Security posture",
    searchPlaceholder: "Search posture rows by category or setting",
    emptyTitle: "Security settings are not initialized.",
    emptyDescription:
      "Initialize security settings using the form below when you have system-admin.security.manage.",
  },
  readiness: {
    title: "Security readiness",
  },
  categories: {
    authentication: "Authentication governance",
    session: "Session governance",
    domain: "Domain governance",
    administrative: "Administrative protection",
    sensitive: "Sensitive action protection",
    metadata: "Configuration metadata",
  },
  storage: {
    title: "Document storage quota",
    description:
      "ERP and HR registry bytes counted toward the organization upload quota gate.",
  },
  objectStorageProvider: {
    title: "Object storage provider",
    description:
      "Override the deployment default provider for this organization. Upload and download ingress honor the effective provider.",
    fieldLabel: "Provider preference",
    helperText:
      "Use deployment default unless this organization requires an explicit Blob, R2, or S3 (SSE-KMS) cutover. Envelope BYOK uses R2 with server-mediated upload.",
    submitLabel: "Save provider preference",
    postureSetting: "Object storage provider",
    postureCategory: "Document evidence",
  },
  objectStorageEncryption: {
    title: "Object storage encryption (BYOK)",
    description:
      "Customer-managed envelope encryption uses Vault Transit or AWS KMS before objects are stored. Uploads use server-mediated encryption; downloads are proxied through the app.",
    modeFieldLabel: "Encryption mode",
    adapterFieldLabel: "KMS adapter",
    keyRefFieldLabel: "Key reference",
    keyRefPlaceholder: "Vault key path or arn:aws:kms:…",
    helperText:
      "PDPA: prefer ap-southeast-1 / ap-southeast-3 CMKs. Existing plaintext objects stay readable; new uploads encrypt forward-only.",
    submitLabel: "Save encryption settings",
    postureSetting: "Object storage encryption",
    kmsAdapterPostureSetting: "KMS adapter",
    postureCategory: "Document evidence",
  },
  recentChanges: {
    title: "Recent security changes",
    description: `Latest audited security configuration events. Open the audit viewer (${systemAdminRoutePaths.audit}) for full search and export.`,
    searchPlaceholder: "Search security changes by action or target",
    emptyTitle: "No recent security configuration changes recorded.",
    emptyDescription:
      "Changes appear here after security settings are updated for this organization.",
  },
  form: {
    title: "Update security settings",
    description:
      "Dangerous downgrades require explicit confirmation. Domain and session values are validated server-side.",
  },
  accessDenied: {
    title: "Security settings unavailable",
    description:
      "You need system-admin.security.read or system-admin.settings.read to review security posture.",
  },
} as const;
