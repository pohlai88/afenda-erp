# @afenda/metadata-ui — enterprise hardening implementation slices

This plan defines the hard implementation path for `@afenda/metadata-ui` to
overtake `@afenda/governed-surface` while preserving the metadata-ui runtime law.

The target is not feature parity by copying legacy code. The target is a cleaner
runtime with stronger enterprise behavior, stricter boundaries, and enough
renderer maturity to replace governed-surface feature by feature.

Controlling law: [architecture.md](./architecture.md).

Existing completed foundation: [implementation-slices.md](./implementation-slices.md).

---

## Enterprise Target

Target readiness score: **9.6 / 10**.

Hardness threshold: every slice must clear at least **7 hardness gates** before it
is considered production-grade:

1. runtime suffix and door purity
2. metadata contract validation
3. server-window ownership, no full-dataset client assumption
4. accessibility and keyboard behavior
5. deterministic diagnostics and test ids
6. failure states: loading, empty, error, forbidden, disabled, pending
7. visual consistency through `@afenda/ui` and design-system tokens
8. focused tests and guard validation
9. migration parity evidence against governed-surface
10. no ERP domain logic, data access, workflow policy, or tenant policy

---

## Dependency And Tool Posture

Dependencies should be added to `@afenda/metadata-ui` only in the slice that
first consumes them. Do not add a dependency for future intent.

| Integration | Intended use | Runtime | Dependency posture |
| --- | --- | --- | --- |
| `@tanstack/react-table` | enterprise list mechanics: column model, sort state, selection, pinning | client island only | add in Slice E01 |
| `@tanstack/react-virtual` | large server-window row virtualization | client island only | add in Slice E02 only if needed |
| `recharts` | common ERP chart bodies | client island only | add in Slice E05 |
| `@number-flow/react` | animated stat values with reduced-motion handling | client island only | add in Slice E06 |
| `motion` | constrained transitions for disclosure, kanban hints, and lifecycle states | client island only | add in Slice E07 |
| `lucide-react` | icon affordances when `@afenda/ui` does not expose the needed icon primitive | server/client as needed | prefer `@afenda/ui`; direct dependency only if unavoidable |
| `cmdk` via `@afenda/ui` | command/search palette primitives for dense ERP filters | client island only | consume through `@afenda/ui` first |
| `sonner` via `@afenda/ui` | action lifecycle toast outlet if host opts in | client host only | do not make metadata-ui own global notifications |
| `vaul` via `@afenda/ui` | drawer/detail panel primitives | client island only | consume through `@afenda/ui` first |
| Playwright visual tests | parity and accessibility smoke verification | tooling | run from host app or artifact harness |
| Vitest | contract, source-boundary, adapter, and fixture tests | tooling | already present |

Hard dependency rule: metadata-ui may integrate UI mechanics, but feature
packages still own data fetching, commands, tenant policy, workflow policy, and
domain decisions.

---

## Slice E01 — Enterprise TanStack Table Core

Purpose: make list rendering stronger than governed-surface while keeping
server-window data ownership.

Target roots:

```txt
src/schemas/list.schema.ts
src/runtime/table-state.shared.ts
src/primitives/data-table.server.tsx
src/sections/list/list-table.client.tsx
src/sections/list/list-renderer.server.tsx
src/tests/
package.json
```

Integrations:

* `@tanstack/react-table`
* `@afenda/ui` table, checkbox, dropdown, button, and badge primitives

Work:

* add a metadata table-state contract for sort, visibility, pinning, selection,
  and row action affordances
* keep row data as the current server window only
* build TanStack column definitions from parsed metadata, not feature code
* preserve deterministic column order and a stable trailing action column
* expose row selection only as UI state; bulk command execution remains host-owned
* render empty, error, loading, forbidden, disabled, and pending states through
  existing metadata-ui primitives
* add source-boundary tests proving TanStack is imported only by client islands

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| dependency | `@tanstack/react-table` is scoped to `@afenda/metadata-ui` for the client table island | `package.json` |
| table-state contract | serializable table model carries columns, hidden state, pinning, selection mode, default sorting, row actions, and server-window metadata | `src/runtime/table-state.shared.ts` |
| client island | TanStack mechanics live in the list client island and render only the provided server window | `src/sections/list/list-table.client.tsx` |
| server fallback | non-interactive lists continue to render through the server table primitive | `src/sections/list/list-renderer.server.tsx` |
| row action safety | row action affordances remain disabled until host features provide execution | `src/runtime/table-state.shared.ts`, `src/sections/list/list-table.client.tsx` |
| door purity | table-state is shared-door safe; TanStack table is client-door only | `src/index.ts`, `src/client.ts` |
| regression tests | model serialization and TanStack source-boundary tests are covered | `src/tests/table-state-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* client-side full dataset filtering
* feature read-model calls
* ERP command execution
* governed-surface imports

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E02 — Virtualized Server Window

Purpose: support dense ERP list windows without making the client own all data.

Target roots:

```txt
src/runtime/table-state.shared.ts
src/sections/list/list-table.client.tsx
src/sections/list/list-virtual-window.client.tsx
src/tests/
package.json
```

Integrations:

* `@tanstack/react-virtual`
* Playwright visual smoke harness when host page is available

Work:

* add opt-in virtualization metadata with row estimate and overscan limits
* virtualize only the current server window
* preserve sticky header and trailing action column affordances
* keep keyboard navigation and row selection accessible
* add guard tests that virtualization cannot imply full-dataset ownership

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| dependency | `@tanstack/react-virtual` is scoped to `@afenda/metadata-ui` for the virtual window island | `package.json` |
| virtualization contract | list metadata carries explicit `enabled`, `rowEstimate`, `overscan`, and `maxHeight` bounds | `src/schemas/list.schema.ts` |
| server-window model | table model marks virtualization as owning the current server window only | `src/runtime/table-state.shared.ts` |
| virtual island | virtual row rendering lives in a dedicated client runtime file | `src/sections/list/list-virtual-window.client.tsx` |
| list integration | TanStack table uses the virtual window only when metadata opts in | `src/sections/list/list-table.client.tsx` |
| no data fetching | virtual window performs no API calls, infinite scroll, or feature reads | `src/sections/list/list-virtual-window.client.tsx` |
| regression tests | virtualization model and source-boundary isolation are covered | `src/tests/table-state-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* infinite-scroll data fetching inside metadata-ui
* browser calls to ERP APIs
* row height hacks that break density profiles

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E03 — Enterprise List Toolbar

Purpose: overtake governed-surface list toolbar behavior with cleaner metadata
contracts and shadcn-backed controls.

Target roots:

```txt
src/schemas/list.schema.ts
src/builders/list.builder.ts
src/primitives/list-toolbar.server.tsx
src/sections/list/list-toolbar.client.tsx
src/tests/
```

Integrations:

* `cmdk` through `@afenda/ui` if available
* `@afenda/ui` dropdown, popover, input, command, badge, button primitives

Work:

* add search, filters, saved views, sort selector, density selector, export, and
  bulk action metadata
* expose canonical href/action descriptors supplied by host features
* make reset and clear states deterministic
* keep URL/query ownership in the host unless explicit metadata is supplied
* add parity fixtures for governed-surface list toolbar behavior

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| toolbar contract | list metadata carries bounded search, filter, saved-view, sort, density, export, and reset descriptors | `src/schemas/list.schema.ts` |
| toolbar model | table client model serializes toolbar filters, saved views, sort options, export affordance, and deterministic defaults | `src/runtime/table-state.shared.ts` |
| client toolbar | toolbar state is local to the list client island and filters only the current server window | `src/sections/list/list-toolbar.client.tsx`, `src/sections/list/list-table.client.tsx` |
| server primitive | server toolbar frame exists for server composition without client imports | `src/primitives/list-toolbar.server.tsx` |
| builder support | toolbar builder helpers preserve schema validation and typed construction | `src/builders/list.builder.ts` |
| door purity | toolbar client exports through the client door; server primitive exports through the server door | `src/client.ts`, `src/server.ts` |
| regression tests | toolbar model and source-boundary behavior are covered | `src/tests/table-state-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* route/query parsing inside metadata-ui
* feature-owned saved-view persistence
* direct server actions for export

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E04 — Action Lifecycle And Feedback

Purpose: make metadata-ui actions production-grade without owning ERP mutation
execution.

Target roots:

```txt
src/contracts/action.contract.ts
src/server-actions/
src/primitives/action-button.server.tsx
src/sections/action-bar/
src/tests/
```

Integrations:

* `@afenda/ui` alert-dialog, dropdown, button, tooltip, alert primitives
* optional host-owned `sonner` outlet through `@afenda/ui`

Work:

* add lifecycle states: idle, pending, succeeded, failed, blocked
* render disabled and blocked reasons accessibly
* render destructive confirmation with explicit irreversible copy
* support host-provided feedback descriptors without global toast ownership
* preserve fail-closed action registry behavior
* add regression tests for hidden, disabled, confirmation, pending, failed, and
  blocked states

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| lifecycle contract | action metadata supports idle, pending, succeeded, failed, and blocked states with host-owned feedback descriptors | `src/contracts/action.contract.ts` |
| accessible action rendering | disabled, pending, failed, and blocked states expose reasons and feedback through ARIA descriptors/live regions | `src/primitives/action-button.server.tsx`, `src/sections/action-bar/action-bar-renderer.server.tsx` |
| confirmation safety | destructive confirmation always renders explicit irreversible fallback copy when metadata omits a description | `src/primitives/action-button.server.tsx` |
| registry safety | blocked lifecycle actions fail closed before handler execution; missing handlers remain fail-closed | `src/server-actions/action-policy.server.ts`, `src/server-actions/action-registry.server.ts` |
| host-owned feedback | lifecycle resolver is shared and side-effect free; no global toast/sonner ownership is introduced | `src/server-actions/action-lifecycle.shared.ts` |
| regression tests | hidden, disabled, confirmation, pending, failed, blocked, and source-boundary behavior are covered | `src/tests/metadata-ui-contracts-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* domain audit execution
* workflow approval policy
* global notification side effects in metadata-ui

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E05 — Chart Runtime Upgrade

Purpose: give metadata-ui mature chart rendering without importing governed chart
contracts.

Target roots:

```txt
src/schemas/chart.schema.ts
src/builders/chart.builder.ts
src/sections/chart/chart-renderer.server.tsx
src/sections/chart/chart-body.client.tsx
src/tests/
package.json
```

Integrations:

* `recharts`
* `@afenda/ui` chart container primitives where available

Work:

* support line, bar, area, pie, and composed chart metadata
* preserve accessible titles, descriptions, empty states, and table fallback copy
* keep chart data bounded and passed as explicit metadata
* add reduced-motion and tooltip formatting contracts
* add fixture parity against governed chart states

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| dependency | `recharts` is scoped to `@afenda/metadata-ui` and imported only by the chart client island | `package.json`, `src/sections/chart/chart-body.client.tsx` |
| chart contract | chart metadata supports bar, line, area, pie, donut, stacked-bar, and composed rendering with bounded rows and series | `src/schemas/chart.schema.ts` |
| display contract | chart metadata carries height, legend, tooltip, reduced-motion, and table fallback controls | `src/schemas/chart.schema.ts` |
| client island | Recharts mechanics render through `@afenda/ui` chart primitives and receive only parsed metadata props | `src/sections/chart/chart-body.client.tsx` |
| server boundary | server renderer parses metadata, handles empty state, and never imports Recharts directly | `src/sections/chart/chart-renderer.server.tsx` |
| builder ergonomics | helpers create composed charts and attach display metadata without feature-side schema assembly | `src/builders/chart.builder.ts` |
| regression tests | chart metadata invariants and Recharts source boundaries are covered | `src/tests/metadata-ui-contracts-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* chart data fetching
* domain metric calculation
* custom Visx usage unless Recharts cannot satisfy a required chart kind

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E06 — Stat Animation And Metric Parity

Purpose: exceed governed stat-card polish while respecting accessibility and
reduced-motion.

Target roots:

```txt
src/schemas/stat.schema.ts
src/primitives/stat-value.client.tsx
src/sections/stat/stat-renderer.server.tsx
src/migration/stat-card-migration.shared.ts
src/tests/
package.json
```

Integrations:

* `@number-flow/react`
* optional `lucide-react` only if `@afenda/ui` does not expose icon support

Work:

* add animated numeric values behind a client island
* support reduced-motion and static server fallback
* map governed icons/progress/sparkline parity notes into explicit metadata gaps
* add metric formatting contracts for numbers, currency, percent, and compact
  values
* keep stat computation in host features

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| dependency | `@number-flow/react` is scoped to `@afenda/metadata-ui` and imported only by the stat value client island | `package.json`, `src/primitives/stat-value.client.tsx` |
| display contract | stat metadata carries animation, fraction digits, currency, locale, icon key, progress, and sparkline fields | `src/schemas/stat.schema.ts` |
| formatting contract | stat items support number, currency, percentage, compact, duration, ratio, and custom formats | `src/schemas/stat.schema.ts`, `src/builders/stat.builder.ts` |
| client island | animated numeric values render through NumberFlow only when metadata and reduced-motion support allow it | `src/primitives/stat-value.client.tsx` |
| server fallback | stat cards, badges, comparison, progress, sparkline, and static layout remain server-rendered | `src/sections/stat/stat-renderer.server.tsx` |
| governed parity | governed icon, progress, sparkline, and animation preferences are carried as explicit display metadata plus parity notes | `src/migration/stat-card-migration.shared.ts` |
| regression tests | display contracts, invalid progress/fraction metadata, adapter parity, and source boundaries are covered | `src/tests/metadata-ui-contracts-test.shared.ts`, `src/tests/stat-card-adapter-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* domain calculations
* client recomputation of metrics
* uncontrolled visual-only metadata that cannot be tested

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E07 — Kanban Interaction Runtime

Purpose: provide enterprise kanban mechanics without embedding workflow policy.

Target roots:

```txt
src/schemas/kanban.schema.ts
src/builders/kanban.builder.ts
src/sections/kanban/
src/runtime/kanban-state.shared.ts
src/tests/
package.json
```

Integrations:

* `motion` for constrained transition hints and reduced-motion behavior
* `@afenda/ui` card, badge, tooltip, scroll-area primitives

Work:

* support read-only and draggable board modes
* render transition availability supplied by host metadata
* carry move intent payloads without executing commands
* expose disabled drop reasons accessibly
* add source tests proving workflow graph validation is not in metadata-ui

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| dependency | `motion` is scoped to `@afenda/metadata-ui` and imported only by the kanban client island | `package.json`, `src/sections/kanban/kanban-drag-board.client.tsx` |
| interaction contract | kanban metadata supports read-only/draggable modes, reduced-motion policy, cards, transitions, and disabled drop reasons | `src/schemas/kanban.schema.ts` |
| move intent model | host-owned move payloads are serialized without executing mutations or importing feature packages | `src/runtime/kanban-state.shared.ts` |
| builder ergonomics | helpers create cards, transitions, movement settings, and board mode safely | `src/builders/kanban.builder.ts` |
| client island | local card position state and constrained motion hints live behind the client door only | `src/sections/kanban/kanban-drag-board.client.tsx` |
| server boundary | server renderer parses metadata, creates the serializable client model, and never imports `motion` | `src/sections/kanban/kanban-renderer.server.tsx` |
| regression tests | transition availability, invalid card placement, disabled reasons, and source boundaries are covered | `src/tests/metadata-ui-contracts-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* workflow edge policy
* organization role matrices
* mutation execution
* direct feature package imports

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E08 — Enterprise Form Runtime

Purpose: move forms beyond static rendering into production ERP form UX.

Target roots:

```txt
src/schemas/form.schema.ts
src/builders/form.builder.ts
src/primitives/field.server.tsx
src/sections/form/form.client.tsx
src/sections/form/form-renderer.server.tsx
src/tests/
```

Integrations:

* `@afenda/ui` field, input, textarea, select, checkbox, switch, alert, tooltip
* optional `vaul` through `@afenda/ui` for field-level help/detail drawers

Work:

* add field error summary metadata
* support dirty, readonly, review, pending, and blocked states
* support file field as a host-upload descriptor, not direct object-storage logic
* add dependent visibility and disabled state metadata supplied by host features
* add fixture tests for required, invalid, disabled, readonly, hidden, and
  blocked fields

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| field states | form metadata supports clean, dirty, readonly, review, pending, blocked, and invalid states | `src/schemas/form.schema.ts` |
| error summary | invalid forms carry field error summary metadata without embedding business validation | `src/schemas/form.schema.ts`, `src/sections/form/form-renderer.server.tsx` |
| host upload descriptor | file fields require a host upload descriptor and never implement object-storage upload logic | `src/schemas/form.schema.ts`, `src/primitives/field.server.tsx` |
| dependent metadata | dependent visibility and disabled behavior are represented as host-supplied metadata descriptors | `src/schemas/form.schema.ts` |
| builder ergonomics | helpers create file fields, field state, disabled state, dependencies, form state, and error summaries safely | `src/builders/form.builder.ts` |
| client island | client form tracks local dirty UI state only; no fetch, storage, validation engine, or submission execution | `src/sections/form/form.client.tsx` |
| regression tests | required, invalid, disabled, readonly, hidden, blocked, dependency, and file descriptor states are covered | `src/tests/metadata-ui-contracts-test.shared.ts`, `src/tests/production-hardening-test.shared.ts` |

Do not build:

* business validation rules
* object-storage upload implementation
* ERP workflow decisions

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E09 — Migration Adapter Parity Pack

Purpose: make replacement measurable by adapting governed-surface configs to
metadata-ui configs without JSX or legacy imports.

Target roots:

```txt
src/migration/
src/tests/
```

Integrations:

* Vitest snapshot and fixture testing
* no governed-surface runtime import

Work:

* add adapters for page-header, action-bar, list, form, detail-tabs, chart,
  kanban, and audit-panel
* emit parity notes for unsupported governed visual behavior
* keep adapters config-only and shared-runtime only
* add fixture coverage for every adapter
* define stop/go criteria for replacing feature imports

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| adapter pack | page-header, action-bar, list, form, detail-tabs, chart, kanban, and audit-panel configs adapt into metadata-ui contracts | `src/migration/parity-adapters.shared.ts` |
| parity notes | unsupported, mapped, and carried metadata behavior is emitted as explicit replacement evidence | `src/migration/parity-adapters.shared.ts` |
| config-only boundary | adapters remain shared-runtime, JSX-free, React-free, and do not import governed-surface or feature packages | `src/migration/parity-adapters.shared.ts`, `src/tests/parity-adapters-test.shared.ts` |
| replacement gate | stop/go criteria require guard, package build and tests, visual parity evidence, and no governed-surface runtime imports | `src/migration/parity-adapters.shared.ts` |
| fixture coverage | every adapter has fixture coverage, including blocked replacement criteria for unsupported visual behavior | `src/tests/parity-adapters-test.shared.ts` |
| door purity | the parity adapter pack exports through the shared door only | `src/index.ts` |

Do not build:

* global governed-surface replacement
* hidden renderer shims
* runtime dependency on governed-surface

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Status: complete.

---

## Slice E10 — Visual And Accessibility Certification

Purpose: prove metadata-ui can replace governed-surface in production without
visual or accessibility regressions.

Target roots:

```txt
src/tests/
apps/erp test harness when approved
.artifacts/
```

Integrations:

* Playwright visual tests
* Vitest fixture tests
* architecture guards
* design-system audits

Work:

* create deterministic fixture pages for list, stat, action-bar, page-header,
  form, detail-tabs, chart, kanban, and audit-panel
* capture desktop and mobile screenshots
* verify no text overlap, no blank charts/tables, keyboard navigation for table
  and form controls, and reduced-motion behavior
* write certification notes for each renderer
* keep artifacts under `.artifacts/`

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| fixture matrix | list, stat, action-bar, page-header, form, detail-tabs, chart, kanban, and audit-panel have deterministic certification fixture coverage | `src/tests/visual-accessibility-certification.shared.ts`, `src/tests/fixture-builders.shared.ts` |
| screenshot evidence plan | desktop `1440x900` and mobile `390x844` evidence paths are defined under `.artifacts/metadata-ui/e10/` for every surface | `src/tests/visual-accessibility-certification.shared.ts` |
| visual checks | every surface requires nonblank render, no text overlap, deterministic fixtures, and artifact hygiene checks | `src/tests/visual-accessibility-certification.shared.ts` |
| accessibility checks | list and form require keyboard checks; chart requires table fallback; chart, stat, and kanban require reduced-motion checks | `src/tests/visual-accessibility-certification.shared.ts` |
| renderer anchors | certification tests assert implemented renderer markers for server-window ownership, ARIA labels, error live regions, table fallback, and reduced-motion behavior | `src/tests/visual-accessibility-certification-test.shared.ts` |
| evidence gate | feature replacement remains blocked until every surface has matching desktop/mobile artifacts, completed checks, and timestamped evidence | `src/tests/visual-accessibility-certification.shared.ts` |
| no app integration | certification remains package-local and does not wire `apps/erp`, feature packages, live ERP data, or browser-side fetching | `src/tests/visual-accessibility-certification-test.shared.ts` |

Do not build:

* app feature integration without explicit migration approval
* brittle screenshots tied to live ERP data

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
pnpm architecture:check
```

Status: complete.

---

## Recommended Implementation Order

1. E01 — Enterprise TanStack Table Core
2. E02 — Virtualized Server Window
3. E03 — Enterprise List Toolbar
4. E04 — Action Lifecycle And Feedback
5. E08 — Enterprise Form Runtime
6. E05 — Chart Runtime Upgrade
7. E06 — Stat Animation And Metric Parity
8. E07 — Kanban Interaction Runtime
9. E09 — Migration Adapter Parity Pack
10. E10 — Visual And Accessibility Certification

This order attacks the hardest governed-surface advantages first: list/table,
toolbar, action lifecycle, and forms. Chart, stat animation, and kanban follow
once the core ERP work surfaces are stronger.

---

## Replacement Gate

Metadata-ui may begin feature-by-feature replacement only when:

* E01, E03, E04, E08, and E09 are complete
* `pnpm guard:metadata-ui` passes
* package build and tests pass
* the target feature page has visual parity evidence
* the target feature imports no governed-surface-only behavior without an
  approved metadata-ui adapter
* no metadata-ui file imports governed-surface, ERP repositories, feature
  packages, tenant session internals, or domain commands

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| unified gate | replacement readiness composes target surfaces, adapter parity notes, package checks, visual certification, and feature import audit evidence | `src/migration/replacement-readiness.shared.ts` |
| fail-closed blockers | unsupported target-surface parity, failed guard/build/tests, missing visual certification, and failed import audit all block replacement | `src/tests/replacement-readiness-test.shared.ts` |
| shared-runtime purity | replacement readiness is exported through the shared door and remains React-free, JSX-free, side-effect free, and feature-import free | `src/index.ts`, `src/tests/replacement-readiness-test.shared.ts` |

Global governed-surface removal is a later migration milestone, not a slice
objective.

---

## Stabilization Pass — 2026-06-05

The enterprise hardening implementation was synchronized against the actual
runtime after parallel slice audits.

Closed gaps:

* list row identity now fails closed when `rowKey` is missing instead of falling
  back to array index
* list saved views, export descriptors, bulk actions, trailing cells, and pinned
  columns are serialized into the table client model and surfaced in the client
  island
* confirmed navigation actions preserve their link execution through the
  confirmation dialog
* chart rendering now has explicit scatter and heatmap paths, honors
  `allow-animation`, keeps table fallback, and uses design-system tokens in the
  server wrapper
* stat `dataNature` and migration metadata are preserved by schema, not stripped
  as unknown fields
* form dependency metadata affects initial server rendering, and file upload
  host actions render through metadata-ui action buttons
* kanban swimlanes, transition hints, disabled transition reasons, and footer
  column counts are represented in the client model/renderers
* migration replacement gates now require guard, package build, package tests,
  visual evidence, and import-audit evidence
* visual/accessibility certification can require screenshot artifact files when
  used as a replacement gate

Verified package-local checks:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm --filter @afenda/metadata-ui test
pnpm guard:metadata-ui
```

Repo-wide `pnpm architecture:check` remains blocked by non-metadata-ui
and metadata-ui-adjacent violations in existing architecture-doc placement,
feature package layout, object-storage layout, and feature server-boundary
markers. The package-local runtime is validated by build/test/guard, but
repo-wide architecture compliance is not complete until the central architecture
document allowlist/placement issue is resolved.

### Stabilization Correction — 2026-06-05

Closed after parallel full-directory review:

* component registry now includes section and renderer component entries for
  `multi-step-form`, `scorecard-form`, and `approval-timeline`
* `page-header` now has a dedicated `page-header-renderer.server.tsx`, and the
  renderer registry/guard require that artifact instead of pointing at the
  section entry
* page-header breadcrumbs and list saved views use the shared safe navigation
  href schema
* external-link actions are restricted to http(s) URLs
* action-bar disabled items, page-header current breadcrumbs, detail-tabs
  default selection, list trailing cells, kanban keys/swimlane references, and
  stat `dataNature` are fail-closed schema invariants
* list and kanban client islands reset local state when server models change
* select fields preserve required/invalid/described-by metadata on the trigger
* visual certification requires screenshot artifact files by default; synthetic
  evidence is only valid when an explicit planning mode disables file checks

Clarification:

* E10 defines the certification plan and fail-closed gate; it does not yet run a
  browser screenshot harness. Actual Playwright/browser artifact capture remains
  the next implementation target before production replacement.
