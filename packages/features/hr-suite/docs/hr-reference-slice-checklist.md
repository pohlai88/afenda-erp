# HR reference slice checklist

Copy **`employee-management/compliance-regulatory-tracking`** for every new shipped HR capability. Agents: rule **`afenda-hr-reference-slice`** · enforcement: `scripts/check-hr-feature-vertical-naming.mts`.

## Reference paths

| Artifact | Compliance path |
| -------- | ----------------- |
| Architecture (requirements + as-built) | `src/employee-management/compliance-regulatory-tracking/compliance-regulatory-tracking-architecture.md` |
| Surface registry | `surface/hr.workforce.compliance-surface-metadata.shared.ts` |
| Search params | `data/hr.workforce.compliance-search-params.parse.shared.ts` |
| Page model | `data/hr.workforce.compliance.page-model.server.ts` |
| Access policy | `policies/hr.workforce.compliance-access.policy.server.ts` |
| Workbench | `components/hr.workforce.compliance-section.component.server.tsx` |
| App adapter | `apps/erp/src/lib/hr-sections/compliance.server.tsx` |
| Manifest | `apps/erp/src/lib/hr-sections/manifest.shared.ts` |

Replace domain segment `compliance` → your capability (e.g. `documents` → `hr.workforce.documents.*`).

## Pre-ship checklist

- [ ] Buckets: `actions/`, `components/`, `contracts/`, `data/`, `events/`, `policies/`, `schemas/`, `surface/`
- [ ] Slice doors: `server.ts`, `client.ts`, `metadata.ts`
- [ ] Governed surface keys: `hr.workforce.<domain>.<purpose>.list` (and overview keys if Pattern B)
- [ ] `*_LIST_SURFACE_KEYS` + search-param map + columns registry in `surface/*-surface-metadata.shared.ts`
- [ ] Vitest: registry ↔ page-model fields; search-param round-trip; at least one list/EUI contract test
- [ ] `*-architecture.md` includes `## As-built summary (code-verified)` and HRM shipment matrix
- [ ] Capability added to `SHIPPED_CAPABILITIES` in `check-hr-feature-vertical-naming.mts`
- [ ] `hrSectionManifest` entry + thin `*.server.tsx` adapter
- [ ] Package `server.ts` / `metadata.ts` re-export slice (no permanent root stubs)
- [ ] `pnpm architecture:check` · `pnpm --filter @afenda/feature-hr-suite test` · `pnpm lint:governed-renderers` (if surfaces changed)

## Shipped capabilities (today)

- `employee-management/compliance-regulatory-tracking` (golden reference)
- `employee-management/documents-management`
- `employee-management/employee-lifecycle-management` (route `/hr/lifecycle`)
- `employee-management/offboarding-exit-management` (route `/hr/offboarding`)
- `employee-management/employee-records-management` (routes `/hr/records`, `/hr/employees`, detail `/hr/records/[id]`)

## Scaffold-only capabilities

Folders with placeholder `index.ts` only stay out of `SHIPPED_CAPABILITIES` until the checklist above is satisfied.
