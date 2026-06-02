# HR reference slice checklist

Canonical architecture: `docs/architecture/1002-backend.md`.

Run `pnpm scaffold:hr-slice <category> <capability-slug> <domain-key>` for every
new scaffold-only HR capability. Use **`employee-management/compliance-regulatory-tracking`**
as the shipped reference before moving a slice to `shipped`. Agents: rule
**`afenda-hr-reference-slice`**; enforcement:
`scripts/check-hr-feature-vertical-naming.mts`.

ARCH-1002 defines the slice lifecycle states: `scaffold-only`, `repair`,
`shipped`, and `deprecated`. This checklist applies when a slice is moving to
or changing while in `shipped`.

## Reference paths

| Artifact                               | Compliance path                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Architecture (requirements + as-built) | `src/employee-management/compliance-regulatory-tracking/compliance-regulatory-tracking-architecture.md` |
| Surface registry                       | `surface/hr.workforce.compliance-surface-metadata.shared.ts`                                            |
| Search params                          | `data/hr.workforce.compliance-search-params.parse.shared.ts`                                            |
| Page model                             | `data/hr.workforce.compliance.page-model.server.ts`                                                     |
| Access policy                          | `policies/hr.workforce.compliance-access.policy.server.ts`                                              |
| Workbench                              | `components/hr.workforce.compliance-section.component.server.tsx`                                       |
| App adapter                            | `apps/erp/src/lib/hr-sections/compliance.server.tsx`                                                    |
| Manifest                               | `apps/erp/src/lib/hr-sections/manifest.shared.ts`                                                       |

Replace domain segment `compliance` → your capability (e.g. `documents` → `hr.workforce.documents.*`).

## Scaffold output contract

The scaffold now creates a stronger compile-safe enterprise baseline:

- slice buckets and doors under `src/<category>/<capability-slug>/`;
- constants, schemas, tenant-scoped seeded store, search-param parser, page model, access policy, actions, events, list surfaces, overview KPI surface, and section component;
- package-level unit tests under `tests/unit/*<slug-without-hyphens>*`, which is the same location checked by the vertical naming guard;
- workbench and audit-trail governed list surfaces with bounded server-window rows;
- scaffold-only coverage rows that must remain `TBD` until the architecture requirements are implemented.

`--repair` overwrites only obvious scaffold placeholders (`TBD` scaffold coverage,
scaffold-only schemas, and generated scaffold workbench copy). It should not
overwrite shipped slices or manually implemented files.

## Wiring command

After a slice has real metadata/server doors, run the AST-based wiring command:

```bash
pnpm wire:hr-slice <category> <capability-slug> <domain-key> --dry-run
pnpm wire:hr-slice <category> <capability-slug> <domain-key>
```

The command updates the app HR manifest and registry, package `metadata.ts` and
`server.ts` doors, HR navigation, auth capability catalog, kernel capability
routes, seed permissions, and the thin app adapter. It is idempotent for shipped
slices and resolves compatibility route-path aliases from the slice route
contract when they already exist.

Defaults:

- capability prefix: `hr.<last-domain-segment>` with `-` converted to `_`;
- permission set: `read`, `write`, `approve`, `audit.read`,
  `restricted.read`, and `integration.expose`;
- label: title-cased capability slug.

Use `--capability-prefix <prefix>`, `--label "Human Label"`, or
`--no-adapter` when a shipped slice needs a non-scaffold permission namespace or
a hand-written app adapter.

## Pre-ship checklist

- [ ] Buckets: `actions/`, `components/`, `contracts/`, `data/`, `events/`, `policies/`, `schemas/`, `surface/`
- [ ] Slice doors: `server.ts`, `client.ts`, `metadata.ts`
- [ ] Governed surface keys: `hr.workforce.<domain>.<purpose>.list` (and overview keys if Pattern B)
- [ ] `*_LIST_SURFACE_KEYS` + search-param map + columns registry in `surface/*-surface-metadata.shared.ts`
- [ ] Vitest: registry ↔ page-model fields; search-param round-trip; at least one list/EUI contract test
- [ ] `*-architecture.md` includes `## As-built summary` and HRM shipment matrix
- [ ] Capability added to `SHIPPED_CAPABILITIES` in `check-hr-feature-vertical-naming.mts`
- [ ] `hrSectionManifest` entry + thin `*.server.tsx` adapter
- [ ] Package `server.ts` / `metadata.ts` re-export slice (no permanent root stubs)
- [ ] Auth/kernel/permission seed capability keys added when replacing scaffold `hr.view` with granular `hr.<capability>.*`
- [ ] `pnpm architecture:check` · `pnpm --filter @afenda/feature-hr-suite test` · `pnpm lint:governed-renderers` (if surfaces changed)

## Shipped capabilities (today)

- `employee-management/compliance-regulatory-tracking` (golden reference)
- `employee-management/documents-management`
- `employee-management/employee-lifecycle-management` (route `/hr/lifecycle`)
- `employee-management/offboarding-exit-management` (route `/hr/offboarding`)
- `employee-management/employee-records-management` (routes `/hr/records`, `/hr/employees`, detail `/hr/records/[id]`)

## Scaffold-only capabilities

Folders with placeholder `index.ts` only stay out of `SHIPPED_CAPABILITIES` until the checklist above is satisfied.

Use `--repair` to fill missing scaffold files without overwriting existing
implementation:

```bash
pnpm scaffold:hr-slice talent-management succession-planning hr.talent.succession --repair
```
