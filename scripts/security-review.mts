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
    name: "Workspace header exposes sign-out action",
    file: "apps/erp/src/workspace-routes/workspace-shell-header.server.tsx",
    patterns: ["signOutAction", "WorkspaceCommandHeader"],
  },
  {
    name: "Uploads validate capability and content policy",
    file: "apps/erp/src/app/api/uploads/route.ts",
    patterns: [
      "assertBlobConfigured",
      "requireBlobModuleAccess",
      "assertUploadPathnameMatchesTenant",
      "documentUploadContentTypes",
      "registerTenantDocument",
    ],
  },
  {
    name: "AI routes require auth and usage logging",
    file: "apps/erp/src/app/api/ai/chat/route.ts",
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
    file: "apps/erp/src/app/api/ai/extract/route.ts",
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
