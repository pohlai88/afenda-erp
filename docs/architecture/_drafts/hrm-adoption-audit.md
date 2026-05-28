# HRM Adoption Audit

## Phase 0 — Directory Normalization

Date: 2026-05-28
Scope: `packages/features/hrm` legacy directory normalization only

### What was completed

- Flattened the legacy 7-wrapper layout into a single maintainable tree under:
  - `packages/features/hrm/_core`
  - `packages/features/hrm/employees`
  - `packages/features/hrm/organization`
  - `packages/features/hrm/documents`
  - `packages/features/hrm/compliance`
  - `packages/features/hrm/offboarding`
  - `packages/features/hrm/portal`
  - `packages/features/hrm/time-attendance`
  - `packages/features/hrm/payroll`
  - `packages/features/hrm/talent`
  - `packages/features/hrm/industry`
- Removed obsolete wrapper door files (`index.ts`, `server.ts`, `client.ts`, `schemas.ts`, `shared.ts`, `app.ts`, `testing.ts`) from legacy wrapper roots.
- Removed legacy wrapper directories:
  - `packages/features/hrm/core`
  - `packages/features/hrm/employee-management`
  - `packages/features/hrm/industry-specific`
  - `packages/features/hrm/payroll-compensation`
  - `packages/features/hrm/route-composition`
  - `packages/features/hrm/talent-management`
  - `packages/features/hrm/time-attendance/src`

### Residue after Phase 0

- Files under `packages/features/hrm`: ~1998
- Files importing `@afenda/feature-hrm-*`: 563
- Files importing `@afenda/platform/*`: 761

---

## Phase 0-B — Intra-Package Import Codemod

Date: 2026-05-28
Scope: Replace all `@afenda/feature-hrm-*` pseudo-package imports with intra-package relative paths

### What was completed

1. **Fixed broken internal paths** in `_core/governance/index.ts` (`../_module-governance/` → `./`).
2. **Created missing `_core` compat barrel files:**
   - `_core/shared.ts` — routing constants, form-state types, nav helpers (was `@afenda/feature-hrm-core/shared`)
   - `_core/app.ts` — landing and shell components (was `@afenda/feature-hrm-core/app`)
   - `_core/server.ts` — server-only org FK guard (was `@afenda/feature-hrm-core/server`)
   - `_core/client.ts` — `useFormSuccess` hook (was `@afenda/feature-hrm-core/client`)
3. **Created missing domain barrel files:**
   - `compliance/server.ts` — 24 data files aggregated
   - `organization/server.ts`, `organization/client.ts`
   - `documents/server.ts`
   - `portal/server.ts`
   - `employees/server.ts` — aggregates records, lifecycle, compliance, org, documents, offboarding, portal
   - `employees/client.ts` — aggregates lifecycle, compliance, documents, offboarding, portal clients
   - `employees/schemas.ts`
   - `time-attendance/server.ts`, `time-attendance/client.ts`, `time-attendance/schemas.ts`
4. **Ran systematic codemod** — 567 files updated; 6 additional `/schemas` imports fixed manually.

### Residue after Phase 0-B

- Files importing `@afenda/feature-hrm-*` (any import line): **0**
- Files importing `@afenda/platform/*`: **~761** (deferred to Phase 3 — platform shim alignment)
- `_core/contracts/hrm-bounded-context-plan.shared.ts`: contains string literals referencing package names — these are data, not imports; intentionally left as-is.

## Risks (updated)

- **Import drift risk:** ✅ RESOLVED — all intra-package pseudo imports replaced.
- **Platform alias risk (high):** `@afenda/platform/*` imports still need codemod to real packages (`@afenda/db`, `@afenda/auth`, etc.) — Phase 3.
- **Schema dependency risk (high):** HRM tables not yet modeled in `@afenda/db` — Phase 2 (big-bang schema port).
- **Barrel completeness risk (medium):** compat barrels aggregate broadly with `export *`; name collisions across domains possible. Resolve when adding `package.json` + `tsconfig.json`.

## PROCEED decision

Decision: **PROCEED**

Rationale:
- `@afenda/feature-hrm-*` import surface is now zero; the next codemod stage (platform shims) is isolated.
- Compat barrel files are intentionally coarse and will be tightened when the package door is formalized.
- Structural integrity of `packages/features/hrm` is sound.

Next steps (per plan):
  - PR A: this audit file + Phase 0 structural changes
  - PR B: schema port (`packages/db/src/schema/hrm/`)
  - PR C: platform shim codemod (`@afenda/platform/*` → real packages)
  - PR D: `package.json` + `tsconfig.json` promotion → `@afenda/feature-hrm`
  - PR E: app route integration and e2e verification
