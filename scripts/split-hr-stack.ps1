# Split HR vertical work into 10 stacked PR branches from stash snapshot.
$ErrorActionPreference = "Stop"
Set-Location "C:\JackProject\afenda-erp"

$SourceBranch = "feat/hr-compliance-alerts-hrm-cmp-016"
$StashRef = "stash@{0}"

function Invoke-Git {
    param([string[]]$GitArgs)
    & git @GitArgs 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE" }
}

function Restore-FromSnapshot {
    param([string[]]$Paths)
    foreach ($p in $Paths) {
        git checkout $StashRef -- $p
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Could not restore: $p"
        }
    }
}

function Add-Paths {
    param([string[]]$Paths)
    foreach ($p in $Paths) {
        if (Test-Path $p) {
            git add -- $p
        }
    }
}

function New-StackCommit {
    param([string]$Message, [string[]]$Paths)
    Add-Paths $Paths
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git commit -m $Message
    } else {
        Write-Warning "Nothing staged for: $Message"
    }
}

# Save all work including untracked
$existingStash = git stash list
if ($existingStash -notmatch "pre-split-all-work") {
    git stash push -u -m "pre-split-all-work"
}

Invoke-Git @("fetch", "origin", "main")
Invoke-Git @("checkout", "main")
Invoke-Git @("pull", "origin", "main")

# PR1: DB foundation
git checkout -B stack/hr-01-db-foundation main
Restore-FromSnapshot @(
    "packages/db/drizzle/0023_fancy_ted_forrester.sql",
    "packages/db/drizzle/0024_smiling_grey_gargoyle.sql",
    "packages/db/drizzle/0025_bright_rattler.sql",
    "packages/db/drizzle/0026_panoramic_skullbuster.sql",
    "packages/db/drizzle/0027_mute_sauron.sql",
    "packages/db/drizzle/0028_tiny_blonde_phantom.sql",
    "packages/db/drizzle/0029_panoramic_microchip.sql",
    "packages/db/drizzle/0030_solid_wallop.sql",
    "packages/db/drizzle/meta/0023_snapshot.json",
    "packages/db/drizzle/meta/0024_snapshot.json",
    "packages/db/drizzle/meta/0025_snapshot.json",
    "packages/db/drizzle/meta/0026_snapshot.json",
    "packages/db/drizzle/meta/0027_snapshot.json",
    "packages/db/drizzle/meta/0028_snapshot.json",
    "packages/db/drizzle/meta/0029_snapshot.json",
    "packages/db/drizzle/meta/0030_snapshot.json",
    "packages/db/drizzle/meta/_journal.json",
    "packages/db/scripts/seed-permissions.mts",
    "packages/db/src/schema/hr.ts",
    "packages/db/src/hr.ts",
    "packages/db/src/hr-commands.ts",
    "packages/db/src/hr-documents.ts",
    "packages/db/src/hr-documents-overview.ts",
    "packages/db/src/hr-lifecycle.ts",
    "packages/db/src/hr-offboarding.ts",
    "packages/db/src/hr-employee-records.ts",
    "packages/db/src/hr-employee-records-commands.ts",
    "packages/db/src/hr-org.ts",
    "packages/db/src/hr-org-overview.ts",
    "packages/db/src/hr-compliance.ts",
    "packages/db/src/hr-compliance.types.ts",
    "packages/db/src/hr-compliance.shared.ts",
    "packages/db/src/hr-compliance.internal.ts",
    "packages/db/src/hr-compliance-alerts.ts",
    "packages/db/src/hr-compliance-alerts.shared.ts",
    "packages/db/src/hr-compliance-calendar.shared.ts",
    "packages/db/src/hr-compliance-effective-status.shared.ts",
    "packages/db/src/hr-compliance-evidence-links.ts",
    "packages/db/src/hr-compliance-evidence-links.shared.ts",
    "packages/db/src/hr-compliance-exception-sync.ts",
    "packages/db/src/hr-compliance-exception-sync.shared.ts",
    "packages/db/src/hr-compliance-exceptions.ts",
    "packages/db/src/hr-compliance-filings.ts",
    "packages/db/src/hr-compliance-filings.shared.ts",
    "packages/db/src/hr-compliance-labor-law.ts",
    "packages/db/src/hr-compliance-overview.ts",
    "packages/db/src/hr-compliance-overview.shared.ts",
    "packages/db/src/hr-compliance-policy-acknowledgement.ts",
    "packages/db/src/hr-compliance-policy-acknowledgement.shared.ts",
    "packages/db/src/hr-compliance-regulatory-calendar.ts",
    "packages/db/src/hr-compliance-regulatory-calendar.shared.ts",
    "packages/db/src/hr-compliance-review-queue.ts",
    "packages/db/src/hr-compliance-review-queue.shared.ts",
    "packages/db/src/hr-compliance-safety-training.ts",
    "packages/db/src/hr-compliance-safety-training.shared.ts",
    "packages/db/src/hr-compliance-statutory.ts",
    "packages/db/src/hr-compliance-statutory.shared.ts",
    "packages/db/src/hr-compliance-work-auth-documents.ts",
    "packages/db/src/hr-compliance-work-eligibility.ts",
    "packages/db/src/hr-compliance-workplace-safety.ts",
    "packages/db/src/hr-compliance-workplace-safety.shared.ts",
    "packages/db/src/index.ts",
    "packages/db/src/rls.ts",
    "packages/auth/src/index.ts"
)
New-StackCommit "feat(db): HR employee-management schema and commands" @(
    "packages/db",
    "packages/auth/src/index.ts"
)
git push -u origin stack/hr-01-db-foundation --force-with-lease 2>&1

# PR2: HR suite infra
git checkout -B stack/hr-02-suite-infra stack/hr-01-db-foundation
Restore-FromSnapshot @(
    "packages/features/hr-suite/AGENTS.md",
    "packages/features/hr-suite/docs/hr-reference-slice-checklist.md",
    "packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts",
    "packages/features/hr-suite/src/components/hr-module-nav.component.client.tsx",
    "packages/features/hr-suite/src/contracts/hr-module-nav.contract.ts",
    "packages/features/hr-suite/src/navigation/hr-module-nav.contract.ts",
    "packages/features/hr-suite/src/client.ts",
    "packages/features/hr-suite/src/server.ts",
    "packages/features/hr-suite/src/metadata.ts",
    "packages/_scaffold/scripts/validate-feature-shape.mts",
    "packages/kernel/src/execution-kernel/capabilities/execution-capabilities.ts",
    "packages/kernel/src/execution-kernel/audit/execution-audit.ts",
    "packages/governed-surface/src/metadata/renderers/list-surface-table.client.tsx"
)
New-StackCommit "feat(hr-suite): module metadata, nav, and vertical guardrails" @(
    "packages/features/hr-suite/AGENTS.md",
    "packages/features/hr-suite/docs",
    "packages/features/hr-suite/scripts",
    "packages/features/hr-suite/src/components",
    "packages/features/hr-suite/src/contracts",
    "packages/features/hr-suite/src/navigation",
    "packages/features/hr-suite/src/client.ts",
    "packages/features/hr-suite/src/server.ts",
    "packages/features/hr-suite/src/metadata.ts",
    "packages/_scaffold/scripts/validate-feature-shape.mts",
    "packages/kernel/src/execution-kernel",
    "packages/governed-surface/src/metadata/renderers/list-surface-table.client.tsx"
)
git push -u origin stack/hr-02-suite-infra --force-with-lease 2>&1

# PR3: Compliance
git checkout -B stack/hr-03-compliance stack/hr-02-suite-infra
Restore-FromSnapshot @("packages/features/hr-suite/src/employee-management/compliance-regulatory-tracking")
Restore-FromSnapshot @(
    "packages/features/hr-suite/tests/unit/compliance-action-failure.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-alerts.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-audit-trail.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-enum-guard.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-evidence-links.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-exception-sync.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-exception-trailing-config.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-filing.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-form-schema.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-list-eui-contract.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-list-load.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-list-tone.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-list.surface.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-mutation.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-overview.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-page-model-serialization.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-page-model-sync.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-policy-acknowledgement.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-regulatory-calendar.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-requirement-sync.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-review-queue.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-route.contract.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-safety-training.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-search-params.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-sensitive-access.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-status.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-statutory.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-surface-metadata.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-trailing-serialization.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-work-auth-documents.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-work-eligibility.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-workbench-metadata.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-workbench-order.test.ts",
    "packages/features/hr-suite/tests/unit/compliance-workplace-safety.test.ts",
    "packages/features/hr-suite/tests/unit/hr-compliance-commands.integration.test.ts"
)
git push -u origin stack/hr-03-compliance --force-with-lease 2>&1

# PR4: Documents
git checkout -B stack/hr-04-documents stack/hr-03-compliance
Restore-FromSnapshot @("packages/features/hr-suite/src/employee-management/documents-management")
New-StackCommit "feat(hr): documents management workbench" @(
    "packages/features/hr-suite/src/employee-management/documents-management",
    "packages/features/hr-suite/tests/unit/documentsmanagement-list-eui-contract.test.ts",
    "packages/features/hr-suite/tests/unit/documentsmanagement-search-params.test.ts",
    "packages/features/hr-suite/tests/unit/documentsmanagement-search-sql.integration.test.ts",
    "packages/features/hr-suite/tests/unit/documentsmanagement-trailing-serialization.test.ts",
    "packages/features/hr-suite/tests/unit/documentsmanagement-workbench-metadata.test.ts"
)
git push -u origin stack/hr-04-documents --force-with-lease 2>&1

# PR5: Records
git checkout -B stack/hr-05-records stack/hr-04-documents
Restore-FromSnapshot @("packages/features/hr-suite/src/employee-management/employee-records-management")
New-StackCommit "feat(hr): employee records management workbench" @(
    "packages/features/hr-suite/src/employee-management/employee-records-management",
    "packages/features/hr-suite/tests/unit/employeerecordsmanagement-list-eui-contract.test.ts",
    "packages/features/hr-suite/tests/unit/employeerecordsmanagement-search-params.test.ts",
    "packages/features/hr-suite/tests/unit/employeerecordsmanagement-workbench-metadata.test.ts"
)
git push -u origin stack/hr-05-records --force-with-lease 2>&1

# PR6: Lifecycle
git checkout -B stack/hr-06-lifecycle stack/hr-05-records
Restore-FromSnapshot @("packages/features/hr-suite/src/employee-management/employee-lifecycle-management")
New-StackCommit "feat(hr): employee lifecycle management workbench" @(
    "packages/features/hr-suite/src/employee-management/employee-lifecycle-management",
    "packages/features/hr-suite/tests/unit/employeelifecyclemanagement-list-eui-contract.test.ts",
    "packages/features/hr-suite/tests/unit/employeelifecyclemanagement-search-params.test.ts",
    "packages/features/hr-suite/tests/unit/employeelifecyclemanagement-workbench-metadata.test.ts",
    "packages/features/hr-suite/tests/unit/lifecycle-access.policy.test.ts",
    "packages/features/hr-suite/tests/unit/lifecycle-mutation-schema.test.ts",
    "packages/features/hr-suite/tests/unit/lifecycle-probation-posture.test.ts",
    "packages/features/hr-suite/tests/unit/lifecycle-status-transitions.test.ts",
    "packages/features/hr-suite/tests/unit/lifecycle-transition-posture.test.ts"
)
git push -u origin stack/hr-06-lifecycle --force-with-lease 2>&1

# PR7: Org
git checkout -B stack/hr-07-org stack/hr-06-lifecycle
Restore-FromSnapshot @("packages/features/hr-suite/src/employee-management/organizational-chart-hierarchy")
New-StackCommit "feat(hr): organizational chart hierarchy workbench" @(
    "packages/features/hr-suite/src/employee-management/organizational-chart-hierarchy",
    "packages/features/hr-suite/tests/unit/organizationalcharthierarchy-list-eui-contract.test.ts",
    "packages/features/hr-suite/tests/unit/organizationalcharthierarchy-occupancy.test.ts",
    "packages/features/hr-suite/tests/unit/organizationalcharthierarchy-search-params.test.ts",
    "packages/features/hr-suite/tests/unit/organizationalcharthierarchy-workbench-metadata.test.ts"
)
git push -u origin stack/hr-07-org --force-with-lease 2>&1

# PR8: Offboarding
git checkout -B stack/hr-08-offboarding stack/hr-07-org
Restore-FromSnapshot @("packages/features/hr-suite/src/employee-management/offboarding-exit-management")
New-StackCommit "feat(hr): offboarding exit management workbench" @(
    "packages/features/hr-suite/src/employee-management/offboarding-exit-management",
    "packages/features/hr-suite/tests/unit/offboardingexitmanagement-list-eui-contract.test.ts",
    "packages/features/hr-suite/tests/unit/offboardingexitmanagement-search-params.test.ts",
    "packages/features/hr-suite/tests/unit/offboardingexitmanagement-workbench-metadata.test.ts"
)
git push -u origin stack/hr-08-offboarding --force-with-lease 2>&1

# PR9: ERP wiring
git checkout -B stack/hr-09-erp-wiring stack/hr-08-offboarding
Restore-FromSnapshot @(
    "apps/erp/src/lib/hr-sections",
    "apps/erp/src/app-route-state/route-states.tsx",
    "apps/erp/src/app/(workspace)/[moduleId]/[...section]/page.tsx",
    "apps/erp/src/workspace-routes/hr-section-nav.server.tsx",
    "apps/erp/src/workspace-routes/module-screen-sections.server.tsx",
    "apps/erp/src/workspace-routes/record-detail-route.sections.server.tsx",
    "apps/erp/tests/e2e/hr-compliance.spec.ts",
    "apps/erp/tests/e2e/hr-documents.spec.ts",
    "apps/erp/tests/e2e/hr-lifecycle.spec.ts",
    "apps/erp/tests/e2e/hr-org.spec.ts",
    "apps/erp/tests/e2e/hr-records.spec.ts",
    "apps/erp/tests/unit/lib/hr-compliance-adapter.test.ts",
    "apps/erp/tests/unit/lib/hr-section-registry.test.ts",
    "apps/erp/playwright.config.cjs",
    "apps/erp/vitest.config.ts"
)
New-StackCommit "feat(erp): HR section registry, routes, and E2E harness" @(
    "apps/erp/src/lib/hr-sections",
    "apps/erp/src/app-route-state/route-states.tsx",
    "apps/erp/src/app/(workspace)/[moduleId]/[...section]/page.tsx",
    "apps/erp/src/workspace-routes/hr-section-nav.server.tsx",
    "apps/erp/src/workspace-routes/module-screen-sections.server.tsx",
    "apps/erp/src/workspace-routes/record-detail-route.sections.server.tsx",
    "apps/erp/tests/e2e/hr-compliance.spec.ts",
    "apps/erp/tests/e2e/hr-documents.spec.ts",
    "apps/erp/tests/e2e/hr-lifecycle.spec.ts",
    "apps/erp/tests/e2e/hr-org.spec.ts",
    "apps/erp/tests/e2e/hr-records.spec.ts",
    "apps/erp/tests/unit/lib/hr-compliance-adapter.test.ts",
    "apps/erp/tests/unit/lib/hr-section-registry.test.ts",
    "apps/erp/playwright.config.cjs",
    "apps/erp/vitest.config.ts"
)
git push -u origin stack/hr-09-erp-wiring --force-with-lease 2>&1

# PR10: Tooling and docs
git checkout -B stack/hr-10-tooling-docs stack/hr-09-erp-wiring
Restore-FromSnapshot @(
    ".cursor/hooks/afenda-architecture-routing.md",
    ".cursor/hooks/post-edit-architecture-hints.mjs",
    ".cursor/rules/afenda-hr-feature-vertical.mdc",
    ".cursor/rules/afenda-hr-reference-slice.mdc",
    "docs/architecture/1002-backend.md",
    "packages/governed-surface/scripts/audit-design-system-tokens.mts",
    "scripts/check-directory-architecture.mts"
)
New-StackCommit "chore: HR vertical cursor rules and architecture docs" @(
    ".cursor/hooks/afenda-architecture-routing.md",
    ".cursor/hooks/post-edit-architecture-hints.mjs",
    ".cursor/rules/afenda-hr-feature-vertical.mdc",
    ".cursor/rules/afenda-hr-reference-slice.mdc",
    "docs/architecture/1002-backend.md",
    "packages/governed-surface/scripts/audit-design-system-tokens.mts",
    "scripts/check-directory-architecture.mts"
)
git push -u origin stack/hr-10-tooling-docs --force-with-lease 2>&1

Write-Host "Stack branches created. Restore original branch with: git checkout $SourceBranch && git stash pop"
