# ARCH-011 (supplement) · System Admin — Capabilities

**Parent:** [011-system-admin-enterprise-architecture.md](011-system-admin-enterprise-architecture.md)

### 9.6 Capabilities

## Definition

Capabilities represent governed ERP execution entry points declared by **ARCH-012**.

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
Execution Kernel (ARCH-012)
Permissions
Modules
Roles
Memberships
Policies
```

## Example Permission

```txt
system_admin.capabilities.manage
```

Phase 2 minimum:

```txt
system-admin.capabilities.read
system-admin.capabilities.manage
```

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
3. `system-admin.settings.read` cannot be disabled at org level (bootstrap read path).
4. Deprecated capabilities cannot be newly enabled.
5. Critical execution capabilities (sensitive permission suffixes) require manage permission for disable.
6. Availability changes write granular audit events (`enable` / `disable` / `preview` / `setting.update`).
7. Mutations revalidate the capabilities route and may dispatch webhooks.

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
system-admin.capabilities.test.ts — schema, coverage, readiness, audit, trailing, list surface
surfaces.test.ts — capabilities list configuration contract
phase2-verticals.test.ts — cross-vertical readiness integration
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
| Protected keys | Done | `system-admin.settings.read` guard in actions |
| Parallel fetch | Done | `Promise.all` module + capability settings in page model |
