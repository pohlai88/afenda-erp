# Metadata UI Playground Advanced Patterns

This document defines the advanced metadata-driven playground target for
slice-by-slice implementation. It is a development-only architecture supplement
for `/playground-metadataui`; it does not define ERP workspace behavior.

The target is to simulate realistic ERP renderer patterns with static,
sanitized seeds while keeping the route fully metadata-ui driven.

## Handroll Conversion Status

The advanced playground target is metadata-only for visible renderer content.
Slice 10 removes the previous state coverage handroll:

- `_fixtures/advanced-state.fixture.ts` builds a list-based metadata state
  matrix from deterministic state seeds.
- `_fixtures/stack.fixture.ts` renders the state matrix through the registered
  `metadata-ui.renderer.list` dispatcher.
- State rows are supplied through `rowsBySectionKey`; no state coverage children
  are injected through `childrenBySectionKey`.
- The obsolete `_fixtures/state.fixture.ts`, custom `createElement` cards,
  direct `Skeleton` usage, and empty `metadata: {}` state placeholder are
  removed.

Future playground slices must keep this target shape. The playground should
assemble typed fixtures and renderer context; it should not hand-render cards,
state layouts, or table bodies.

## Target Principles

- Metadata drives every visible renderer surface.
- App code owns only static fixture assembly and the dev-only AppShell frame.
- Renderer behavior lives in `packages/metadata-ui`.
- TanStack Table behavior is exercised through metadata-ui list renderers, not
  custom playground table code.
- Seeds are deterministic, sanitized, and safe for screenshots.
- Types model ERP-like variation without importing ERP feature packages.
- The page remains server-rendered and request-independent.

Forbidden in the advanced playground:

- `@afenda/auth`, `@afenda/db`, feature packages, repositories, commands, domain
  services, or read models.
- `fetch`, route handlers, server actions, cookies, headers, random values,
  current time, browser storage, and tenant IDs.
- Hand-rolled preview components for renderer content.
- Production workspace navigation, sitemap entries, or module manifests.

## Navigation Model

The left navigation should simulate ERP module discovery while remaining static
local AppShell chrome.

Recommended groups:

| Group | Routes Or Sections | Purpose |
| --- | --- | --- |
| Overview | Coverage index, renderer inventory | Shows all advanced scenarios and certification state. |
| Operations | Work queue, approvals, exception review | Dense ERP operational list and command surfaces. |
| Planning | Kanban, capacity board, timeline | Multi-surface planning patterns. |
| Records | Detail tabs, audit panel, related records | Record-centric metadata composition. |
| Analytics | KPI band, charts, trend table | Analytical read-only surfaces. |
| Forms | Multi-step form, scorecard form, validation | Input and workflow preview without mutation. |
| States | Ready, loading, empty, forbidden, error | State renderer matrix after handroll removal. |
| Table Lab | TanStack list variants | Column, filter, sort, selection, and action patterns. |

The root landing page now renders the full catalog as metadata sections. The
pattern routes remain the isolate views for deeper inspection. Later slices may
introduce additional static route segments only if they remain developer-only
and do not read request-bound data.

## Seed Architecture

Use typed seed modules under `_fixtures/`:

```txt
_fixtures/
  advanced-seed-types.fixture.ts
  advanced-seed.fixture.ts
  advanced-navigation.fixture.ts
  advanced-table.fixture.ts
  advanced-record.fixture.ts
  advanced-workflow.fixture.ts
  advanced-planning.fixture.ts
  advanced-analytics.fixture.ts
  advanced-state.fixture.ts
```

Seeds must use:

- `as const satisfies` to preserve literal IDs and validate shape.
- Template-literal IDs such as
  `metadata-ui.playground.advanced.operation.${string}`.
- Fixed timestamps such as `2026-01-01T08:00:00.000Z`.
- Neutral labels like `Sample Location`, `Sample Record`, and
  `sample.operator@example.invalid`.
- Deterministic windows of rows, never full unbounded datasets.

The seed catalog should simulate ERP variety without real ERP data:

- locations, operators, approvals, inventory-like items, planning cards,
  compliance checks, workflow stages, and audit events.
- statuses, priorities, permission bands, review bands, aging buckets, and
  exception reasons.
- non-financial quantities and neutral operational metrics.

## Advanced Types

The advanced fixture layer should make invalid combinations hard to express.

Recommended types:

```ts
type AdvancedPatternKind =
  | "overview"
  | "operations-list"
  | "tanstack-table"
  | "record-detail"
  | "workflow-form"
  | "planning-board"
  | "analytics"
  | "state-matrix";

type AdvancedPatternId<K extends AdvancedPatternKind = AdvancedPatternKind> =
  `metadata-ui.playground.advanced.${K}.${string}`;

type AdvancedScenario<K extends AdvancedPatternKind> = Readonly<{
  id: AdvancedPatternId<K>;
  kind: K;
  title: string;
  description: string;
  sectionKeys: readonly string[];
}>;
```

Use discriminated unions for rows and scenarios. Avoid `any`, open-ended
`Record<string, unknown>` fixtures, and stringly renderer IDs when exported
metadata-ui constants are available.

Builder functions should return exact metadata shapes:

```ts
function createAdvancedOperationsListSection(
  scenario: AdvancedScenario<"operations-list">,
): MetadataUiSectionLike {
  // Build metadata only. Do not render JSX here.
}
```

If the current metadata-ui public API cannot express a needed pattern, add the
schema, renderer registration, and server renderer in `packages/metadata-ui`
first. Do not patch around the gap with playground-only React.

## TanStack Table Pattern

The Table Lab should exercise the metadata-ui list renderer and its TanStack
client implementation through metadata, row context, and controlled capabilities.

Coverage goals:

- governed server window rows
- stable row IDs
- column order and visibility metadata
- typed sorting states
- typed filter presets
- pinned important columns where supported
- row selection and bulk action affordances
- trailing actions with permission-disabled states
- metadata-owned row selectability through `selectableField` and
  `selectionDisabledReasonField`
- row action and trailing action state through `stateField` and
  `disabledReasonField`
- empty, loading, forbidden, and error states
- dense mobile layout behavior

The playground must not import TanStack directly unless the renderer package
itself exposes a metadata-supported extension point that requires it. The app
surface should feed metadata and rows into `@afenda/metadata-ui/server`.

## Metadata-Only Conversion Plan

1. Express ready, loading, empty, forbidden, and error coverage as
   deterministic state rows.
2. Build `_fixtures/advanced-state.fixture.ts` with metadata-ui list builders
   only.
3. Render `stateSection` through `metadata-ui.renderer.list` with real metadata.
4. Keep `childrenBySectionKey` out of the playground render context unless a
   renderer has a documented metadata-ui slot contract.
5. Keep guard checks that fail on playground `createElement`, direct primitive
   imports, `Skeleton`, and empty metadata placeholders.
6. Re-run visual and architecture validation.

## Slice Plan

### Slice 01 - Advanced Pattern Document And Guard

Add this document, allow it in playground certification, and record the current
handroll gaps.

Acceptance:

```bash
pnpm typecheck:scripts
pnpm architecture:check
```

### Slice 02 - Typed Advanced Seed Catalog

Add advanced seed types and deterministic scenario seeds. No visible renderer
change is required.

Implementation:

- `_fixtures/advanced-seed-types.fixture.ts` defines the advanced scenario,
  section-key, navigation, row, workflow, planning, state, and catalog types.
- `_fixtures/advanced-seed.fixture.ts` exports deterministic sanitized seeds for
  navigation groups, scenario inventory, operations rows, TanStack table lab
  rows, records, workflow steps, planning cards, and renderer state seeds.
- Certification requires the seed files, verifies key exports, and checks that
  the catalog uses `as const satisfies` with no runtime-generated values.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm guard:metadata-ui
```

### Slice 03 - Static Advanced Navigation

Expand local AppShell chrome with advanced left navigation groups. Keep the
route developer-only and static.

Implementation:

- `_fixtures/advanced-navigation.fixture.ts` maps the slice 02 seed catalog into
  static AppShell rail sections and command palette sections.
- The local chrome fixture includes the advanced navigation groups after the
  baseline Overview item.
- Scenario links target real static playground routes under
  `/playground-metadataui/[pattern]` so each advanced pattern can be inspected
  as an isolated page without introducing request reads or workspace
  navigation.
- Certification requires the advanced navigation fixture and verifies that the
  chrome includes the generated static rail sections.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
```

### Slice 04 - Advanced Overview Pattern

Render an overview metadata stack with KPI, chart, coverage, and scenario index
sections.

Implementation:

- `_fixtures/advanced-overview.fixture.ts` builds metadata-only stat, chart, and
  list sections from the deterministic advanced seed catalog.
- The main stack renders the advanced overview immediately below the playground
  page header so left navigation has a visible target family.
- The render context provides only scenario-index rows for the list renderer; it
  does not inject JSX children or hand-render table content.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
```

### Slice 05 - TanStack Table Lab

Add advanced list metadata and seeded rows that exercise sorting, filtering,
selection, row actions, dense layout, and permission-disabled actions.

Implementation:

- `_fixtures/advanced-table.fixture.ts` builds a metadata-ui list surface from
  the advanced table seed rows.
- The table lab exercises sortable/filterable columns, pinned start/end columns,
  toolbar sort controls, saved views, multiple selection, bulk actions, inline
  row actions, row selectability fields, trailing action state fields,
  pagination, and virtualization metadata.
- The metadata-ui list contract serializes `selectableField`,
  `selectionDisabledReasonField`, row action `stateField`, and trailing action
  `disabledReasonField` into the TanStack client model, so locked/hidden row
  behavior is visible without playground React handrolls.
- It does not set an initial `defaultSort` because TanStack's sorted row model
  calls current time during prerender under Next Cache Components; sorting
  remains available through renderer toolbar and sortable headers after
  hydration.
- The playground still does not import TanStack directly; TanStack behavior is
  reached only through the metadata-ui list renderer.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
```

### Slice 06 - Operations Command Surface

Add metadata action bars, trailing actions, and inert command previews for
approval-like operations. No ERP mutation handlers.

Implementation:

- `_fixtures/advanced-operations.fixture.ts` builds metadata-only operation
  action-bar and list surfaces from deterministic operation seed rows.
- The command surface covers primary navigation, disabled approve/reject command
  previews, row actions, trailing status/action cells, bulk actions, export
  affordance, saved views, filtering, and virtualization metadata.
- Every command uses navigation or disabled `client-event` metadata only. There
  are no server actions, route handlers, feature package commands, or ERP writes.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm guard:metadata-ui
```

### Slice 07 - Record Detail Pattern

Compose detail tabs, related list, audit panel, and timeline sections around a
single seeded record.

Implementation:

- `_fixtures/advanced-record.fixture.ts` builds record-centric metadata from the
  advanced record and operations seeds.
- The stack renders detail tabs, related operation rows, audit trail, and
  approval-like timeline sections without custom JSX.
- The render context provides only related-list rows for the metadata-ui list
  renderer.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
```

### Slice 08 - Advanced Forms And Workflow

Add multi-step and scorecard scenarios with validation, blocked, complete, and
read-only states.

Implementation:

- `_fixtures/advanced-workflow.fixture.ts` builds an advanced multi-step form
  and scorecard form from deterministic workflow step seeds.
- The multi-step form covers complete, active invalid, blocked, and readonly
  field states with inert navigation actions.
- The scorecard covers readonly met criteria, review-with-reason criteria, and
  blocked publish-readiness criteria.
- No submit handler, server action, feature package command, or ERP mutation is
  introduced.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
```

### Slice 09 - Planning Board Pattern

Add kanban and planning timeline seeds that simulate ERP workflow movement
without mutation.

Implementation:

- `_fixtures/advanced-planning.fixture.ts` builds an advanced kanban planning
  board and approval-style planning timeline from deterministic planning seeds.
- The kanban board covers intake, capacity review, and release-ready lanes,
  priority swimlanes, static movement intents, confirmation-required metadata,
  and a blocked release transition.
- The timeline covers approved intake, pending review, blocked capacity, and
  skipped release-ready milestones with fixed timestamps.
- No server action, feature command, workflow engine lookup, or client-side data
  mutation is introduced.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
```

### Slice 10 - Metadata State Matrix

Replace the hand-rolled state fixture with metadata-only state matrix rendering
and remove custom child injection.

Implementation:

- `_fixtures/advanced-state.fixture.ts` renders ready, loading, empty,
  forbidden, and error coverage as a metadata-ui list surface.
- `_fixtures/state.fixture.ts` is removed.
- `_fixtures/stack.fixture.ts` no longer uses `childrenBySectionKey` or
  `metadata: {}` for state coverage.
- State coverage rows are supplied through `rowsBySectionKey` like other
  metadata list surfaces.

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
pnpm guard:metadata-ui
```

### Slice 11 - Advanced Visual Coverage

Extend the no-auth Playwright visual spec for desktop and mobile coverage of the
advanced navigation and main renderer families.

Implementation:

- `apps/erp/tests/e2e/metadata-ui-playground.spec.ts` verifies the static
  advanced left navigation labels for overview, operations, table lab, records,
  forms, planning, analytics, and states.
- The spec asserts every advanced renderer section by
  `data-metadata-ui-section` and `data-metadata-ui-renderer`, then checks
  representative visible copy for stat, chart, list, action-bar, detail-tabs,
  audit-panel, approval-timeline, multi-step-form, scorecard-form, kanban, and
  state-matrix list surfaces.
- Desktop coverage captures the full playground plus the advanced operations
  list; mobile coverage captures the full playground plus the state matrix and
  asserts no horizontal overflow.
- The test remains no-auth and deterministic; it does not read APIs, cookies,
  storage, or tenant state.

Acceptance:

```bash
pnpm --filter @afenda/erp exec playwright test tests/e2e/metadata-ui-playground.spec.ts --config=playwright.visual.config.cjs --project=chromium-metadata-ui-playground
```

### Slice 12 - Certification Hardening

Update architecture guards to reject playground handroll patterns and verify the
advanced pattern files, static seeds, and renderer coverage.

Implementation:

- `scripts/check-directory-architecture.mts` certifies all advanced playground
  fixture files, seed catalog exports, scenario kinds, advanced navigation,
  generated static pattern routes, stack section wiring, metadata-only state
  matrix wiring, advanced analytics wiring, responsive stack span metadata, and
  deterministic source constraints.
- The guard rejects old state handroll regressions such as
  `_fixtures/state.fixture.ts`, `childrenBySectionKey`, `metadata: {}`,
  playground `createElement` state cards, direct `Skeleton` state usage, and
  feature/write transport imports.
- The guard verifies the no-auth Playwright visual spec covers every advanced
  scenario kind and asserts advanced sections by `data-metadata-ui-section` and
  `data-metadata-ui-renderer`.
- The visual spec carries explicit scenario-kind coverage for overview,
  operations-list, tanstack-table, record-detail, workflow-form,
  planning-board, analytics, and state-matrix.
- Advanced navigation targets real pattern routes such as
  `/playground-metadataui/operations-list`,
  `/playground-metadataui/planning-board`,
  `/playground-metadataui/analytics`, and
  `/playground-metadataui/state-matrix`.
- Certification remains scoped to the developer-only playground and does not
  relax the existing repository-wide architecture checks.

Acceptance:

```bash
pnpm typecheck:scripts
pnpm guard:metadata-ui
pnpm architecture:check
```

## Completion Criteria

The advanced playground is complete when:

- every visible ERP-like pattern is assembled from metadata fixtures,
- the state matrix has no playground JSX renderer,
- TanStack behavior is visible through metadata-ui list surfaces,
- left navigation exposes the major advanced scenarios,
- seeds are deterministic and sanitized,
- guards reject regressions into hand-rolled playground rendering,
- narrow typecheck, metadata guard, visual spec, and architecture guard pass
  except for unrelated existing repository architecture backlog.
