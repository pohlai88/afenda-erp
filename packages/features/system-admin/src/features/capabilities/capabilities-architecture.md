**Parent:** [`docs/architecture/1006-control-plane.md`](../../../../docs/architecture/1006-control-plane.md)

**Vertical supplement:** this file.

### 9.6 Capabilities

## Definition

Capabilities represent governed ERP execution entry points declared by **ARCH-1002 §5**.

A capability answers:

```txt
What ERP function exists?
Which permission unlocks it?
Which module owns it?
Is it covered by route, audit, and documentation contracts?
Is it available for this organization?
```

Capabilities are not ad hoc feature flags. Definitions come from `listExecutionCapabilities()` in the execution kernel; System Admin owns visibility, org-level availability, coverage review, and readiness signals.

## Owns

Capabilities owns:

* capability catalog display (kernel-sourced)
* org-level availability (`enabled` | `disabled` | `preview`)
* coverage verdict review (permission, route, audit, docs)
* readiness verdict for rollout
* capability metadata inspection
* granular audit actions for availability changes
* row trailing enable/disable (Pattern C)

## Does Not Own

Capabilities does not own:

* capability definition authoring (kernel catalog)
* permission catalog definition
* runtime access enforcement
* module enablement
* role assignment
* policy evaluation

Those belong to:

```txt
Execution Kernel (ARCH-1002 §5)
Permissions
Modules
Roles
Memberships
Policies
```

## Example Permission

```txt
system-admin.capabilities.manage
```

Phase 2 minimum:

```txt
system-admin.capabilities.read
system-admin.capabilities.manage
```

Audit action keys use hyphenated `system-admin.*` convention (not underscore).

## Capabilities Page

Route:

```txt
/system-admin/capabilities
```

Route adapter: `apps/erp/src/lib/system-admin-sections/capabilities.server.tsx`

Test IDs:

```txt
system-admin-capabilities-page
system-admin-capabilities-access-denied
system-admin-capabilities-catalog
system-admin-capabilities-role-matrix
system-admin-capabilities-settings
system-admin-capabilities-settings-form
system-admin-capabilities-settings-submit
governed:list-section:system-admin.capabilities.list
governed:list-section:system-admin.capabilities.role-matrix
```

EUI: section titles use `headingLevel={2}` under the System Admin shell; list surfaces use governed Pattern C metadata with serializable trailing cells.

E2E: `apps/erp/tests/e2e/system-admin-capabilities.spec.ts` (project `chromium-system-admin-capabilities`).

Search params:

```txt
capabilities — list search (via resolveSystemAdminListSearch)
matrixRole   — role matrix filter (owner | admin | ...)
```

Next.js MCP verification (dev server `:3000`):

```txt
get_errors → 0 config/session errors after browser session connected
/system-admin/capabilities → pageRoot, catalog, role matrix, settings form visible
/system-admin/capabilities?matrixRole=owner → role matrix filtered, URL preserved
governed list surfaces → system-admin.capabilities.list + .role-matrix render ready
React duplicate-key warnings → deduped via listUniqueExecutionCapabilities()
```

## Package Layout (as-built)

```txt
packages/features/system-admin/src/capabilities/
  actions/          # Availability mutations + settings form action
  components/       # Access denied, settings dialog, trailing cells
  contracts/        # Row types, safety guards, query limits
  data/             # Page model, coverage evaluation, role matrix, list surface
  events/           # Audit action registry + transition resolver
  policies/         # requireSystemAdminCapabilitiesRead | Manage
  schemas/          # Zod settings form validation
  surface/          # UI copy, role matrix surface, trailing bridge
```

Shared helpers (DRY, testable without server context):

```txt
data/system-admin.capabilities-catalog.shared.ts      → listUniqueExecutionCapabilities
data/system-admin.capabilities-matrix-role.shared.ts   → parseSystemAdminCapabilityMatrixRole
data/system-admin.capabilities-org-settings.shared.ts    → org availability + module disabled checks
data/system-admin.capability-settings-form.shared.ts     → parseSystemAdminCapabilitySettingsFormData
contracts/system-admin.capabilities.limits.shared.ts     → query limits, capability key max length
contracts/system-admin.capability-safety.contract.ts       → SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION
events/system-admin.capabilities.event.ts                → resolveSystemAdminCapabilityAuditAction
surface/system-admin.capabilities-list-trailing.shared.ts  → row trailing enable/disable metadata
```

## Mutation Correctness

Capability settings mutations enforce:

1. **Kernel registration** — unknown capability keys are rejected before write.
2. **Protected bootstrap permission** — `SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION` cannot be disabled.
3. **Deprecated enable guard** — deprecated capabilities cannot be enabled via trailing actions (settings form only).
4. **Idempotent no-op** — when requested availability matches the resolved previous value, skip DB upsert, audit, and webhook.
5. **Truncation safety** — when the tenant settings query hits `SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT` and the target key is not in the loaded window, reject the mutation instead of assuming no prior setting exists.
6. **Safe form parsing** — settings form uses `parseSystemAdminCapabilitySettingsFormData` with trimmed `FormData` values and Zod `safeParse`.

## Row Model (as-built)

```ts
export type SystemAdminCapabilityListRow = {
  id: string
  capability: string
  module: string
  route: string
  routeHref?: string
  requiredPermission: string
  availability: "enabled" | "disabled" | "preview"
  accessCoverage: string
  auditCoverage: string
  docsCoverage: string
  coverageVerdict: CapabilityCoverageVerdict
  readinessVerdict: SystemAdminCapabilityReadinessVerdict
  issues: string
}
```

Coverage verdicts include: `covered`, `disabled`, `missing_permission`, `missing_route`, `missing_audit`, `missing_docs`.

Readiness verdicts include: `ready`, `warning`, `blocked` — derived from coverage + org availability + issue list.

## Coverage Evaluation

`evaluateCapabilityCoverage()` inspects each kernel capability for:

* deprecated catalog status
* required permission presence in the permission catalog
* route registration
* audit area mapping
* documentation linkage

Org settings may override availability per capability key in tenant capability settings.

## Safety Rules

1. Capability keys must exist in the execution catalog.
2. UI cannot invent capability keys.
3. `SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION` (`system-admin.settings.read`) cannot be disabled at org level (bootstrap read path).
4. Deprecated capabilities cannot be newly enabled.
5. Critical execution capabilities (sensitive permission suffixes) require manage permission for disable.
6. Availability changes write granular audit events (`enable` / `disable` / `preview` / `setting.update`).
7. Mutations revalidate the capabilities route and may dispatch webhooks.
8. Unchanged availability requests are idempotent and must not emit audit noise.
9. Truncated tenant settings reads must not produce false "first enable" audits.

## Governed Surface (Pattern C)

| Concern | Implementation |
| ------- | -------------- |
| List builder | `buildCapabilitiesListSurface` → `@afenda/feature-system-admin/metadata` |
| Section | `GovernedPatternCListSection` in ERP `capabilities.server.tsx` |
| Trailing cell | `SystemAdminCapabilityTrailingCell` (`@afenda/feature-system-admin/client`) |
| Serializable bridge | `system-admin.capabilities-list-trailing.shared.ts` |
| Bulk form | `SystemAdminCapabilitySettingsDialog` + `updateSystemAdminCapabilitySettingsAction` |

Columns: capability, module, route, required permission, availability, readiness, coverage, issues.

## Definition of Done (Phase 1 — implemented)

Capabilities Phase 1 is done when:

* administrators can browse the kernel capability catalog with search
* coverage and readiness columns are visible
* org availability can be updated via form and row trailing actions
* protected capability keys cannot be disabled
* changes are audited with granular action names
* list surface is metadata-driven (Pattern C) with serializable trailing cells
* unit tests cover schema, coverage, readiness, audit resolution, and list surface keys

## Deferred (Phase 2+)

* per-role capability availability matrix
* policy/approval coverage as dedicated columns (issues string today)
* capability detail route
* navigation hides disabled capabilities (E2E)

## Minimum Tests (as-built)

```txt
non-admin cannot view capabilities
capability disable writes granular audit event
unchanged availability skips write and audit
truncated settings query blocks unsafe mutation
protected bootstrap capability cannot be disabled
organization scope enforced on settings mutations
```

Unit coverage:

```txt
tests/unit/system-admin.capabilities.test.ts           — schema, coverage, readiness, audit, trailing, list surface
tests/unit/system-admin.capabilities.shared.test.ts    — matrix role parser, audit keys, protected permission constant
tests/unit/system-admin.capabilities-role-matrix.test.ts — role matrix builder
surfaces.test.ts                                       — capabilities list configuration contract
phase2-verticals.test.ts                               — cross-vertical readiness integration
```

## Final Architecture Statement

Capabilities answer:

```txt
What ERP functions exist and are they safe to expose for this tenant?
```

Permissions answer:

```txt
What atomic access exists?
```

Modules answer:

```txt
Which business domains are enabled and ready?
```

Execution Kernel answers:

```txt
Can this action execute right now?
```

## As-built (Phase 1)

| Capability | Status | Implementation |
| ---------- | ------ | -------------- |
| Catalog list | Done | `buildCapabilitiesListSurface` + `GovernedPatternCListSection` |
| Readiness column | Done | `resolveSystemAdminCapabilityReadinessVerdict` |
| Row trailing enable/disable | Done | `SystemAdminCapabilityTrailingCell` |
| Org settings form | Done | `updateSystemAdminCapabilitySettingsAction` |
| Granular audit | Done | `resolveSystemAdminCapabilityAuditAction` |
| Protected keys | Done | `SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION` guard in actions + trailing |
| Parallel fetch | Done | `Promise.all` module + capability settings in page model |

