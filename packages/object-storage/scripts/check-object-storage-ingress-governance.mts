/**
 * Fail-closed ingress governance wiring for object-storage ERP routes (ARCH-OS-1001 §19).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.join(packageRoot, "../..");

const problems: string[] = [];

function readRepoFile(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    problems.push(`Missing required file: ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function assertPatterns(relativePath: string, patterns: readonly string[]) {
  const source = readRepoFile(relativePath);
  if (!source) {
    return;
  }

  for (const pattern of patterns) {
    if (!source.includes(pattern)) {
      problems.push(`${relativePath} must include "${pattern}"`);
    }
  }
}

assertPatterns("apps/erp/src/app/api/internal/v1/uploads/route.ts", [
  "createTenantObjectStorageUploadDeps",
  "registerUploadedTenantDocumentCommand",
  "handleObjectStorageUploadPost",
]);

assertPatterns("apps/erp/src/app/api/internal/v1/uploads/config/route.ts", [
  "handleObjectStorageUploadConfigGet",
]);

assertPatterns(
  "apps/erp/src/app/api/documents/[documentId]/download/route.ts",
  [
    "308",
    "/api/internal/v1/documents/",
  ],
);

assertPatterns(
  "apps/erp/src/app/api/internal/v1/documents/[documentId]/download/route.ts",
  [
    "createTenantObjectStorageDownloadDeps",
    "handleObjectStorageDocumentDownloadGet",
  ],
);

assertPatterns(
  "packages/features/system-admin/src/tenant-execution/api/system-admin.object-storage-governance.server.ts",
  [
    "recordTenantDocumentEvidenceEvent",
    "writeExecutionAuditEvent",
    "authorizeTenantDocumentDownload",
    "assertTenantUploadQuota",
    "createTenantObjectStorageUploadDeps",
    "createTenantObjectStorageDownloadDeps",
  ],
);

assertPatterns(
  "apps/erp/src/app/api/internal/v1/cron/document-scan-sweep/route.ts",
  ["executeDocumentScanSweepCommand", "runCronJob"],
);

assertPatterns(
  "apps/erp/src/app/api/internal/v1/cron/document-retention-sweep/route.ts",
  ["executeDocumentRetentionExpirySweepCommand", "runCronJob"],
);

assertPatterns(
  "apps/erp/src/app/api/internal/v1/webhooks/document-scan-result/route.ts",
  ["handleDocumentScanWebhookPost"],
);

assertPatterns(
  "packages/features/system-admin/src/tenant-execution/commands/register-uploaded-tenant-document.command.server.ts",
  ["processTenantDocumentScanCommand"],
);

assertPatterns(
  "packages/features/system-admin/src/audit-viewer/actions/system-admin.audit.actions.server.ts",
  ["cascadeOrganizationLegalHoldCommand"],
);

assertPatterns("apps/erp/src/contracts/erp-http.contract.ts", [
  "ERP_WEBHOOK_HTTP_ROUTES",
  "documentScanResult",
]);

assertPatterns(
  "apps/erp/src/app/api/internal/v1/webhooks/document-scan-result/route.ts",
  ["handleDocumentScanWebhookPost"],
);

if (problems.length > 0) {
  console.error("[object-storage:ingress-governance] violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  "[object-storage:ingress-governance] ERP upload/download governance wiring OK",
);
