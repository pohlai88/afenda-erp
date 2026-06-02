import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Check = {
  name: string;
  file: string;
  patterns: readonly string[];
};

const root = process.cwd();
const checks: readonly Check[] = [
  {
    name: "Workspace shell resolves organization context",
    file: "apps/erp/src/workspace-routes/workspace-route-cache.ts",
    patterns: ["getOrganizationContext", "organization", "accessibleModules"],
  },
  {
    name: "Uploads validate capability and content policy",
    file: "packages/object-storage/src/handlers/object-storage-handlers.server.ts",
    patterns: [
      "assertObjectStorageConfigured",
      "requireUploadModuleAccess",
      "assertUploadPathnameMatchesTenant",
      "documentUploadContentTypes",
      "registerUploadedDocument",
    ],
  },
  {
    name: "Document download validates tenant scope",
    file: "packages/object-storage/src/handlers/object-storage-handlers.server.ts",
    patterns: [
      "handleObjectStorageDocumentDownloadGet",
      "requireUploadModuleAccess",
      "getTenantDocument",
      "assertUploadPathnameMatchesTenant",
      "getSignedDownloadUrl",
    ],
  },
  {
    name: "ERP upload route wires tenant document registration",
    file: "apps/erp/src/app/api/internal/v1/uploads/route.ts",
    patterns: [
      "handleObjectStorageUploadPost",
      "registerUploadedTenantDocumentCommand",
      "registerUploadedDocument",
    ],
  },
  {
    name: "ERP document download delegates to object-storage handler",
    file: "apps/erp/src/app/api/internal/v1/documents/[documentId]/download/route.ts",
    patterns: ["handleObjectStorageDocumentDownloadGet"],
  },
  {
    name: "Legacy document download redirects to internal route",
    file: "apps/erp/src/app/api/documents/[documentId]/download/route.ts",
    patterns: ["OBJECT_STORAGE_HTTP_ROUTES", "308"],
  },
  {
    name: "Upload auth resolves session org",
    file: "packages/object-storage/src/auth/upload-route-auth.server.ts",
    patterns: [
      "getSession",
      "getActiveOrganization",
      "hasDocumentWriteAccess",
      "hasDocumentReadAccess",
    ],
  },
  {
    name: "AI routes require auth and usage logging",
    file: "apps/erp/src/app/api/internal/v1/ai/queries/erp-assistant/route.ts",
    patterns: [
      "getApiAuthContext",
      "createAiUsageEvent",
      "createErpAssistantTools",
    ],
  },
  {
    name: "AI approval tools require human approval",
    file: "packages/ai/src/tools/ai.erp-tools.tool.server.ts",
    patterns: [
      "needsApproval: true",
      "registerApprovalProposal",
      "assertCapabilityAllowed",
    ],
  },
  {
    name: "Document extraction is schema constrained",
    file: "apps/erp/src/app/api/internal/v1/ai/commands/extract-document/route.ts",
    patterns: [
      "Output.object",
      "documentExtractionSchema",
      "requireCapability",
    ],
  },
  {
    name: "Cron routes require CRON_SECRET",
    file: "apps/erp/src/lib/cron.ts",
    // getCronSecret reads CRON_SECRET; authorizeCronRequest checks Bearer header
    patterns: ["getCronSecret", "authorization", "Bearer"],
  },
  {
    name: "Drain endpoint verifies Vercel signature",
    file: "apps/erp/src/app/api/observability/drain/route.ts",
    // getVercelDrainSecret reads VERCEL_DRAIN_SECRET; verifyVercelSignature validates
    patterns: ["getVercelDrainSecret", "verifyVercelSignature"],
  },
  {
    name: "Tenant tables carry organization scope",
    file: "packages/db/src/schema/erp.ts",
    patterns: ["organizationReference", "organizationId"],
  },
  {
    name: "AI persistence carries organization scope",
    file: "packages/db/src/schema/ai.ts",
    patterns: ["organizationReference", "aiUsageEvents", "aiApprovalProposals"],
  },
];

const failures = checks.flatMap((check) => {
  const filePath = join(root, check.file);

  if (!existsSync(filePath)) {
    return [`${check.name}: missing ${check.file}`];
  }

  const source = readFileSync(filePath, "utf8");
  const missingPatterns = check.patterns.filter(
    (pattern) => !source.includes(pattern),
  );

  return missingPatterns.map(
    (pattern) => `${check.name}: missing pattern ${pattern} in ${check.file}`,
  );
});

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exit(1);
}

process.stdout.write("Security review checks passed.\n");
