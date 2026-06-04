# @afenda/metadata-ui — implementation slices

This root-level plan breaks the shadcn-backed ERP implementation into bounded
slices. Each slice must land independently and keep [architecture.md](./architecture.md)
as the controlling law.

Maximum active slices: 10.

Do not start a later slice until its declared predecessors are merged or the
slice is explicitly marked documentation-only.

---

## Slice 01 — Source And Design-System Readiness

Purpose: make metadata-ui class output visible to Tailwind v4 and lock the
primitive source of truth.

Root files:

```txt
apps/erp/src/app/globals.css
packages/metadata-ui/architecture-shadcn-primitives.md
packages/metadata-ui/implementation-slices.md
```

Work:

* keep metadata-ui in ERP Tailwind `@source`
* document `@afenda/ui` as the only shadcn primitive source
* document that metadata-ui consumes `@afenda/ui/design-system`
* do not add metadata-ui `globals.css`
* do not modify `@afenda/ui` unless a primitive contract is actually missing

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| Tailwind v4 source scanning | `apps/erp/src/app/globals.css` scans `packages/metadata-ui/src/**/*.{tsx,ts}` | `apps/erp/src/app/globals.css` |
| shadcn config ownership | ERP app owns the single `components.json`; Tailwind config path is empty for v4 | `apps/erp/components.json` |
| primitive ownership | shadcn source lives in `packages/ui/src` and is consumed through `@afenda/ui` | `apps/erp/components.json`, `packages/ui/package.json` |
| design-system door | token contract is exported as `@afenda/ui/design-system` | `packages/ui/package.json` |
| metadata-ui CSS boundary | metadata-ui has no package-local `globals.css` or shadcn config | package root |
| architecture documentation | shadcn boundary and ERP renderer bar are documented | `architecture-shadcn-primitives.md` |

Acceptance:

```bash
pnpm guard:metadata-ui
```

Status: complete.

Completion notes:

* Slice 01 is a readiness slice, so it does not introduce primitive adapters or
  renderer JSX.
* `@afenda/ui` was not modified because the required primitive and design-system
  contracts already exist.
* Later slices must not create metadata-ui-owned CSS, `components.json`, or
  shadcn initialization state.

---

## Slice 02 — Presentation Resolver Hardening

Purpose: create the stable mapping layer between metadata intent and primitive
adapter props.

Target roots:

```txt
src/presentation/
src/contracts/
src/schemas/
src/tests/
```

Work:

* keep schemas shadcn-free
* add resolver helpers only when at least two renderers need the same mapping
* normalize density, tone, surface, visibility, and layout intent
* expose shared resolver output through shared runtime only

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| density resolver | presentation density resolves through shared runtime | `src/presentation/resolve-density.shared.ts` |
| tone resolver | presentation tone and emphasis resolve through shared runtime | `src/presentation/resolve-tone.shared.ts` |
| surface resolver | surface and chrome-rendering decision resolve through shared runtime | `src/presentation/resolve-surface.shared.ts` |
| layout resolver | layout, alignment, and width resolve through shared runtime | `src/presentation/resolve-layout.shared.ts` |
| visibility resolver | header and description visibility resolve through shared runtime | `src/presentation/resolve-visibility.shared.ts` |
| shell usage | section shell/card consume shared resolver decisions instead of local defaults | `src/shell/` |
| contract safety | helpers return metadata intent only; no shadcn variants or raw classes | `src/presentation/` |

Do not build:

* primitive JSX
* raw class escape hatches
* ERP domain policy

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 01.

Status: complete.

---

## Slice 03 — Primitive Adapter Foundation

Purpose: introduce server-only adapters that compose `@afenda/ui` primitives for
metadata-ui renderers.

Target roots:

```txt
src/primitives/
src/server.ts
src/shell/
src/tests/
```

Work:

* add `card.server.tsx`
* add `empty.server.tsx`
* add `badge.server.tsx`
* add `action-button.server.tsx`
* import primitives from `@afenda/ui`
* import token contracts from `@afenda/ui/design-system`
* use `cn()` from `@afenda/ui/utils`

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| guard root | `src/primitives` is an allowed metadata-ui root with adapter dependency rank | `scripts/lib/metadata-ui-layout.mts`, `scripts/lib/metadata-ui-guard.mts` |
| card adapter | server adapter composes `Card` structure and presentation density/surface intent | `src/primitives/card.server.tsx` |
| empty adapter | server adapter composes `Empty` and `Alert` states with semantic tone mapping | `src/primitives/empty.server.tsx` |
| badge adapter | server adapter maps metadata tone to `Badge` variants | `src/primitives/badge.server.tsx` |
| action button adapter | server-safe button/link adapter maps metadata priority, tone, risk, disabled, and pending state | `src/primitives/action-button.server.tsx` |
| server door | primitive adapters are exported through the server door only | `src/server.ts` |
| shell proof | existing shell empty state consumes the empty primitive adapter | `src/shell/empty-state.server.tsx` |

Do not build:

* client adapters unless interaction is required
* raw `<button>` / fake card divs
* shadcn variant names in metadata contracts

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 02.

Status: complete.

---

## Slice 04 — Section Chrome And State Surfaces

Purpose: move section shell, heading, empty, error, forbidden, and loading
surfaces onto primitive adapters.

Target roots:

```txt
src/shell/
src/security/
src/logging/
src/sections/page-header/
src/sections/stat/
```

Work:

* refactor section chrome through the card adapter
* route empty and forbidden states through designed adapters
* keep permission failure distinct from empty data
* preserve diagnostics and test identity attributes
* pilot visual parity on `stat` and `page-header`

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| section chrome | diagnostic section wrapper delegates visual chrome to the card adapter | `src/shell/section-card.server.tsx` |
| heading tokens | heading copy uses `@afenda/ui/design-system` typography and visibility resolver | `src/shell/heading.server.tsx` |
| forbidden state | permission fallback renders a designed forbidden empty state, not an empty-data state | `src/security/permission-gate.server.tsx` |
| page-header pilot | breadcrumbs, badges, and actions use token classes and primitive adapters | `src/sections/page-header/page-header.server.tsx` |
| stat pilot | stat items use tokenized inset surfaces and badge adapter tones without raw palette classes | `src/sections/stat/stat-renderer.server.tsx` |
| diagnostics | section/page-header identity attributes remain on the owned section/header elements | `src/shell/`, `src/sections/page-header/` |

Do not build:

* nested cards
* decorative surfaces
* feature-domain copy or policy

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 03.

Status: complete.

---

## Slice 05 — Governed Action Rendering

Purpose: make action bars production-safe with explicit hierarchy,
confirmation, disabled, and pending behavior.

Target roots:

```txt
src/server-actions/
src/security/
src/sections/action-bar/
src/primitives/
```

Work:

* use `Button` for primary and secondary actions
* use `DropdownMenu` for grouped secondary/contextual actions
* use `AlertDialog` for destructive or irreversible confirmation
* render disabled reason accessibly
* keep server-action execution fail-closed unless host registry is wired

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| button hierarchy | main actions render through the action button adapter with priority/tone/risk mapping | `src/sections/action-bar/action-bar-renderer.server.tsx`, `src/primitives/action-button.server.tsx` |
| overflow grouping | contextual and collapsed actions render in `DropdownMenu` | `src/sections/action-bar/action-bar-renderer.server.tsx` |
| confirmation affordance | actions with confirmation render through `AlertDialog` before any confirmed affordance is shown | `src/primitives/action-button.server.tsx` |
| disabled reason | disabled reasons are exposed via title and screen-reader description | `src/primitives/action-button.server.tsx` |
| hidden actions | hidden actions do not render | `src/primitives/action-button.server.tsx`, `src/sections/action-bar/action-bar-renderer.server.tsx` |
| fail-closed execution | renderer and adapters do not execute ERP commands or host mutations | `src/sections/action-bar/`, `src/primitives/action-button.server.tsx` |

Do not build:

* ERP mutation execution
* feature workflow rules
* generic button variant fields in schemas

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 04.

Status: complete.

---

## Slice 06 — Table And List Primitive Migration

Purpose: migrate list rendering to shadcn table primitives without losing ERP
density or server-window assumptions.

Target roots:

```txt
src/primitives/table.server.tsx
src/sections/list/
src/sections/audit-panel/
src/renderers/
```

Work:

* compose table shell through `@afenda/ui` table primitives
* preserve deterministic column order
* keep stable trailing row action cell
* render loading skeleton rows, empty state, error state, forbidden state
* keep server-window data ownership outside metadata-ui

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| table adapter | server adapter composes `@afenda/ui` table primitives and maps list density to UI density | `src/primitives/table.server.tsx` |
| column order | renderer derives visible columns once and preserves schema order through the adapter | `src/sections/list/list-renderer.server.tsx` |
| row actions | row action column is stable and fail-closed until a host feature provides execution | `src/sections/list/list-renderer.server.tsx` |
| server window caption | rendered rows are labeled as the current server window, not a client-owned full dataset | `src/sections/list/list-renderer.server.tsx` |
| empty state | empty list and audit states continue through designed empty-state adapters | `src/sections/list/`, `src/sections/audit-panel/` |
| audit list cleanup | audit event list uses card and badge adapters plus design-system tokens | `src/sections/audit-panel/audit-panel-renderer.server.tsx` |

Do not build:

* client-side full dataset assumptions
* feature read-model queries
* arbitrary column width hacks

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 05.

Status: complete.

---

## Slice 07 — Forms And Detail Tabs

Purpose: move form and tabs sections to accessible shadcn-backed primitives.

Target roots:

```txt
src/primitives/field.server.tsx
src/primitives/tabs.server.tsx
src/sections/form/
src/sections/detail-tabs/
```

Work:

* use `Field`, `FieldGroup`, labels, descriptions, and validation affordances
* use `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
* keep submit actions routed through the action adapter
* preserve disabled, read-only, required, and visible states

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| field adapter | server adapter composes `Field`, `FieldGroup`, labels, descriptions, validation messages, and primitive controls | `src/primitives/field.server.tsx` |
| tabs adapter | server adapter composes `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` with badge support | `src/primitives/tabs.server.tsx` |
| form renderer | form sections render through field adapters and submit/actions route through the action adapter | `src/sections/form/form-renderer.server.tsx` |
| detail-tabs renderer | tab triggers no longer use raw buttons and header actions route through the action adapter | `src/sections/detail-tabs/detail-tabs-renderer.server.tsx` |
| server door | field and tabs adapters export through the server door only | `src/server.ts` |

Do not build:

* raw field controls when a primitive exists
* tab trigger class fields
* form business validation rules

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 06.

Status: complete.

---

## Slice 08 — Renderer Context And Capabilities

Purpose: add shared rendering context and section capability declaration only
after adapters need cross-renderer coordination.

Target roots:

```txt
src/runtime/
src/registry/
src/renderers/
src/sections/
```

Work:

* add `renderer-context.server.ts` when duplicated context appears
* add capability registry for metadata-ui behavior only
* carry diagnostics, presentation, permissions, and action registry references
* keep context server-only

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| renderer context | server-only context centralizes children, DOM attributes, diagnostics, presentation, permission, subject, and action registry references | `src/runtime/renderer-context.server.ts` |
| compatibility | previous `MetadataUiRendererDataContext` type remains available as a server context alias | `src/runtime/renderer-context.server.ts`, `src/renderers/` |
| capability registry | registered section kinds declare metadata-ui behavior capabilities without feature policy or discovery | `src/registry/section-capability-registry.server.ts` |
| renderer resolution | server renderer resolution carries declared capabilities beside renderer metadata | `src/runtime/resolve-renderer.server.ts` |
| render plumbing | section, stack, component, and child-tree renderers consume the shared context rather than ad hoc maps | `src/renderers/` |

Do not build:

* `organizationId` ownership
* ERP repository access
* feature command execution
* workflow approval policy

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

Predecessor: Slice 07.

Status: complete.

---

## Slice 09 — Migration Adapters And Visual Parity Pilot

Purpose: provide narrow config adapters for governed-surface parity pilots.

Target roots:

```txt
src/migration/
src/tests/
architecture-shadcn-primitives.md
```

Work:

* start with `governed-stat.adapter.shared.ts`
* then page-header, action-bar, detail-tabs, form, list in risk order
* transform metadata/config only
* document before/after parity evidence in the pilot artifact or review notes

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| stat pilot adapter | governed stat-card config transforms into `MetadataUiStat` without JSX or governed-surface imports | `src/migration/stat-card-migration.shared.ts` |
| parity notes | governed-only visual fields are reported for review instead of hidden renderer shims | `src/migration/stat-card-migration.shared.ts` |
| typed fixture coverage | adapter tests cover tone, href drilldown, comparison, density/profile, and snapshot layout mapping | `src/tests/stat-card-adapter-test.shared.ts` |
| shared door | migration adapter is exported through the runtime-neutral package door only | `src/index.ts` |
| pilot documentation | visual parity evidence and non-replacement caveat are documented in this slice record | `implementation-slices.md` |

Current parity coverage:

| Governed stat-card concern | Metadata-ui pilot treatment |
| --- | --- |
| label and value | mapped to stat item label/value |
| tone | `default -> neutral`, `attention -> warning`, `positive -> positive`, `critical -> critical` |
| href | mapped to a low-risk navigation drilldown action |
| comparison | mapped to stat comparison |
| delta without comparison | mapped to a flat comparison and flagged in parity notes |
| density/profile | mapped to metric presentation density and profile metadata |
| icons/sparklines/progress/animation | not rendered by the adapter; flagged as parity notes |

This is not approval to replace governed-surface globally.

Do not build:

* JSX in migration adapters
* hidden renderer shims
* feature data access
* global replacement of governed-surface imports

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm architecture:check
```

Predecessor: Slice 08.

Status: complete.

---

## Slice 10 — Production Hardening

Purpose: close remaining quality gaps before broader adoption.

Target roots:

```txt
src/tests/
src/logging/
src/identity/
src/security/
src/renderers/
```

Work:

* add focused fixtures for renderer states
* verify door purity and runtime boundaries
* verify accessible labels for icon actions and controls
* verify loading, empty, error, forbidden, disabled, and pending states
* remove temporary compatibility code
* update docs only where implementation changed the contract

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| identity hardening | stable test ids and DOM diagnostics are covered for renderer identity | `src/tests/production-hardening-test.shared.ts` |
| security hardening | capability normalization and security policy parsing are covered | `src/tests/production-hardening-test.shared.ts` |
| door purity | shared door is regression-tested against server/client/action exports | `src/tests/production-hardening-test.shared.ts` |
| runtime boundary | server renderer context and render-section runtime markers are asserted without importing server-only modules into shared tests | `src/tests/production-hardening-test.shared.ts` |
| migration safety | stat-card migration remains config-only and parity-note driven | `src/tests/production-hardening-test.shared.ts` |
| fixture growth | focused package tests cover seven baseline contract tests plus migration and hardening paths | `src/tests/` |

Do not build:

* repo-wide test demands for doc-only changes
* broad abstractions without duplication
* feature-module migration without approval

Acceptance:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm architecture:check
```

Predecessor: Slice 09.

Status: complete.

---

## Slice Discipline

Each implementation PR or working pass should name exactly one active slice.

A slice is complete only when:

* target files obey runtime suffix law
* package doors remain pure
* registry law still holds
* no ERP domain logic enters metadata-ui
* validation listed for that slice passes or the reason is documented

If a slice uncovers missing `@afenda/ui` primitive behavior, update
`packages/ui` through the shadcn workflow first, then return to the metadata-ui
slice.
