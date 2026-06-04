# @afenda/metadata-ui — shadcn primitive architecture

This document is the second architecture document for the `@afenda/metadata-ui`
visual implementation layer.

Primary architectural law remains [architecture.md](./architecture.md). If this
document conflicts with runtime law, dependency direction, registry law, or door
purity, [architecture.md](./architecture.md) wins.

Implementation is sliced in [implementation-slices.md](./implementation-slices.md).

---

## Purpose

`@afenda/metadata-ui` renders metadata contracts into enterprise UI.

`@afenda/ui` owns the Afenda shadcn primitive fork.

Shadcn is source ownership, not a package dependency. The CLI copies component
source into the Afenda UI package; after that, Afenda owns the component source,
token hardening, accessibility review, and enterprise density.

Metadata UI must not copy shadcn primitives, own shadcn configuration, or expose
shadcn-specific schema fields. Metadata UI consumes `@afenda/ui` through a small
primitive adapter layer and maps metadata intent to UI implementation.

```txt
metadata contracts
  -> presentation resolution
  -> metadata-ui primitive adapters
  -> @afenda/ui shadcn primitives
  -> rendered enterprise UI
```

---

## ERP Product Standard

The target is not "a shadcn-looking UI." The target is a dense, governed ERP
runtime that uses shadcn primitives as the interaction foundation.

Metadata-ui renderers must optimize for repeated operational work:

* scanability over decoration
* stable density over page-by-page invention
* predictable action placement over novelty
* keyboard and screen-reader usability over pointer-only convenience
* designed loading, empty, error, and forbidden states over placeholder text
* token-backed surfaces over raw Tailwind composition
* section-level consistency across finance, HR, inventory, purchasing, and CRM
  without embedding any of those domain rules in metadata-ui

The Vercel shadcn guidance treats shadcn as the product interface language. For
Afenda ERP, that means:

| Concern | ERP standard |
| --- | --- |
| Theme | Use host `globals.css` tokens; do not add metadata-ui theme overrides |
| Density | Default to compact or comfortable; never mix density systems inside one section |
| Typography | Use `type-*` / `@afenda/ui/design-system` utilities, not ad hoc `text-sm` stacks |
| Surfaces | Use Afenda semantic surfaces; avoid nested cards and fake bordered divs |
| Actions | Primary action is singular; destructive actions require `AlertDialog` |
| Tables | Server-window compatible, sticky/scannable header-ready, row actions predictable |
| Forms | `FieldGroup` / `Field` structure, explicit labels, inline validation affordance |
| States | Empty/loading/error/forbidden states are first-class render paths |
| Icons | Lucide only, quiet sizing, label or tooltip for ambiguous icon-only controls |
| Motion | Native Afenda motion tokens only; no `tw-animate-css` classes |

Renderer quality below this bar is not production-ready even if it compiles.

---

## Existing Shadcn Source Of Truth

Shadcn is already configured for the ERP app:

```txt
apps/erp/components.json
apps/erp/src/app/globals.css
```

Important resolved configuration:

| Field | Value |
| --- | --- |
| style | `radix-nova` |
| RSC | `true` |
| icon library | `lucide` |
| UI alias | `../../packages/ui/src` |
| utility alias | `../../packages/ui/src/utils` |
| Tailwind CSS | `apps/erp/src/app/globals.css` |

Therefore:

* Add or update shadcn primitives through the existing `apps/erp/components.json`
  path.
* Primitive source lives in `packages/ui/src`.
* Metadata UI imports primitives from `@afenda/ui`, never from
  `@afenda/ui/src/*`.
* Metadata UI does not create another `components.json`.
* Metadata UI does not run `shadcn init`.
* Metadata UI does not own global CSS, theme variables, or Tailwind source
  scanning.
* New primitive installation must be previewed with shadcn CLI diagnostics before
  files are written.

Agent-safe shadcn workflow from `apps/erp`:

```bash
pnpm dlx shadcn@latest info --json
pnpm dlx shadcn@latest docs <component>
pnpm dlx shadcn@latest add <component> --dry-run
```

Use `add` only after the dry run is understood. If a new project ever needs
initialization, use non-interactive defaults (`shadcn init -d`), but
metadata-ui must never initialize its own shadcn project.

---

## Global CSS Ownership

`apps/erp/src/app/globals.css` owns:

* Tailwind imports
* `shadcn/tailwind.css`
* ERP theme variables
* semantic design tokens
* Tailwind v4 `@source` scanning
* primitive sizing tokens
* table density tokens
* surface rhythm tokens

Metadata UI consumes these tokens through rendered class names and `@afenda/ui`
primitives. Metadata UI must not create a package-local `globals.css`.

The ERP app global CSS includes metadata-ui as a Tailwind source:

```css
@source "../../../../packages/metadata-ui/src/**/*.{tsx,ts}";
```

This belongs in `apps/erp/src/app/globals.css`, not in `@afenda/metadata-ui`.

Reason: Tailwind v4 CSS-first scanning must see classes emitted by package
renderers. Without this source entry, metadata-ui classes may be absent from the
compiled app stylesheet.

Current known source ownership:

```txt
packages/ui              -> already scanned
packages/governed-surface -> already scanned
packages/features        -> already scanned
packages/metadata-ui     -> already scanned
```

This source entry is intentionally present before primitive adapter migration so
metadata-ui server renderers and future gallery output cannot silently miss
generated utility classes.

---

## Design System Contract

`packages/ui/src/design-system.ts` is the primitive design-system contract.
Metadata UI should consume it through:

```ts
import { ui, uiSurface, uiTypography } from "@afenda/ui/design-system";
```

Rules:

* keep Tailwind variables and `@theme inline` mappings in
  `apps/erp/src/app/globals.css`
* keep primitive token class contracts in `@afenda/ui/design-system`
* keep metadata-to-primitive decisions in metadata-ui presentation resolvers and
  primitive adapters
* do not add metadata-ui-specific aliases to `@afenda/ui/design-system` unless
  the same token is also useful to normal `@afenda/ui` consumers

Reason: the design system owns reusable primitive tokens; metadata-ui owns
metadata rendering policy. Keeping those responsibilities separate prevents the
primitive package from accumulating renderer-specific concepts.

When `@afenda/ui` primitives are added or updated, follow
`packages/ui/shadcn-update.md`:

```bash
pnpm design-system:check
pnpm --filter @afenda/ui typecheck
```

The primitive package may fork upstream shadcn only for Afenda semantic tokens,
accessibility hardening, enterprise density, and documented component behavior.
Random visual invention belongs neither in `@afenda/ui` nor metadata-ui.

---

## Boundary Law

Metadata schemas describe intent, not implementation.

Allowed metadata:

```ts
presentation: {
  chrome: {
    surface: "card",
    density: "compact",
    tone: "neutral"
  },
  layout: {
    layout: "table",
    width: "full"
  },
  visibility: {
    showHeader: true
  }
}
```

Forbidden metadata:

```ts
presentation: {
  buttonVariant: "outline",
  className: "rounded-xl border bg-card",
  shadcnComponent: "Card"
}
```

Metadata UI maps intent to primitives internally.

Non-negotiable metadata boundary:

* contracts describe intent, state, density, tone, action priority, and section
  behavior
* adapters choose shadcn primitives and Afenda UI component composition
* schemas never expose shadcn variant names, primitive names, raw class strings,
  raw color palettes, radius utilities, or animation classes
* feature packages never pass arbitrary styling into metadata-ui renderers

---

## Primitive Adapter Layer

Add a new server-only adapter folder when implementation starts:

```txt
src/primitives/
  action-button.server.tsx
  badge.server.tsx
  card.server.tsx
  empty.server.tsx
  field.server.tsx
  table.server.tsx
  tabs.server.tsx
```

Purpose:

* centralize mapping from metadata presentation to `@afenda/ui` primitives
* keep section renderers consistent
* avoid raw Tailwind duplication in sections
* keep shadcn details out of contracts and schemas
* concentrate accessibility, density, tone, and empty/error state behavior in
  one implementation layer
* keep `cn()` usage local to adapters and primitive composition instead of
  scattering class merging through section renderers

Runtime:

* server adapters: `*.server.tsx`
* client-only adapters only when interactivity is required: `*.client.tsx`
* no shared adapter may import React UI primitives

Door:

* export server primitive adapters through `src/server.ts`
* do not export primitive adapters through `src/index.ts`
* export client adapters through `src/client.ts` only when needed

Adapter composition rules:

* use `@afenda/ui` primitive exports and `@afenda/ui/design-system`
* use `@afenda/ui/utils` for `cn()`
* use `AlertDialog` for destructive or irreversible confirmation flows
* use `Dialog` only for non-destructive focused tasks
* use `Sheet` for side-detail and responsive filter surfaces
* use `DropdownMenu` for compact contextual action groups
* use `Tooltip` only for icon-only or otherwise ambiguous controls
* do not nest `Card` inside `Card` for section layout

---

## ERP Renderer Patterns

Each section kind must follow a consistent shadcn-backed pattern. These are
implementation standards, not suggestions.

### Section Chrome

Use one section shell per metadata section:

* header: title, description, optional eyebrow, optional status/tone badges
* body: the actual section renderer
* footer: secondary metadata or action area only when the contract requires it

Do not wrap every child in a card. A section shell may contain repeated item
cards only when the repeated card is the data item itself, not another section
container.

### Action Bars

Action bars must render:

* one primary action when available
* secondary actions as quiet buttons or grouped `DropdownMenu` items
* destructive or irreversible actions behind `AlertDialog`
* disabled actions with clear accessible disabled state
* pending state with `Spinner` only after a submitted action is in progress

Action metadata can describe priority, confirmation requirement, disabled
reason, and authority status. It must not pass button variants or raw classes.

### Lists And Tables

List renderers must use `Table` primitives through `table.server.tsx` and
client islands only where interaction is required.

Required list behavior:

* compact row rhythm using table density tokens
* deterministic column order from metadata
* row actions in a stable trailing action cell
* empty state through the empty adapter
* loading state through `Skeleton` rows or a table-level loading affordance
* forbidden state through the permission/security rendering path
* no full-dataset client assumptions; host features remain responsible for
  server windows and read-model queries

Tables must avoid arbitrary width hacks. Column sizing should come from metadata
intent, stable token classes, or adapter-owned mapping.

### Forms

Form renderers must use `Field`, `FieldGroup`, labels, descriptions, and inline
validation affordances. A form field is not just an input.

Required form behavior:

* every input has an accessible label
* descriptions and validation messages use designed text utilities
* required/disabled/read-only states are visible and accessible
* submit actions use the action adapter
* field grouping follows metadata sectioning, not arbitrary grids
* raw `<input>`, `<select>`, `<textarea>`, and checkbox markup are prohibited
  when an `@afenda/ui` primitive exists

### Detail Tabs

Tabs must use `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`. Tab metadata
describes tab identity, label, visibility, disabled state, and content section
keys. It must not describe trigger class names or primitive variants.

### Stats And Charts

Stats should be quiet operational indicators, not marketing cards:

* primary value, label, optional trend, optional status tone
* no oversized hero typography inside compact ERP panels
* status tone maps through presentation and badge/stat adapters
* chart renderers must use semantic chart tokens and designed empty/error states

Charts remain presentation only. Metadata-ui must not compute ERP business
metrics.

### Kanban

Kanban uses shadcn primitives for cards, actions, badges, and empty columns, but
movement rules remain outside metadata-ui. Drag/drop client islands may express
interaction, but feature packages own whether movement is permitted.

---

## Required Primitive Mapping

| Metadata UI need | `@afenda/ui` primitive | Adapter |
| --- | --- | --- |
| Section chrome | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `card.server.tsx` |
| Actions | `Button`, `DropdownMenu`, `AlertDialog` | `action-button.server.tsx` |
| Status/tone | `Badge` | `badge.server.tsx` |
| Empty/error/forbidden | `Empty`, `Alert` | `empty.server.tsx` |
| List/table | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `table.server.tsx` |
| Detail tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `tabs.server.tsx` |
| Forms | `Field`, `FieldGroup`, `FieldLabel`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch` | `field.server.tsx` |
| Loading | `Skeleton`, `Spinner` | section-specific or shared primitive |
| Separators | `Separator` | use directly inside adapter |
| Tooltips | `Tooltip` | adapter only when needed |

The mapping table is the allowed primitive vocabulary for the first migration
wave. Add new primitives only when a renderer requirement cannot be expressed
with this set and the `@afenda/ui` update workflow has been completed.

---

## Presentation Resolver Responsibility

Adapters must not independently interpret raw presentation contracts.

Presentation resolution happens before adapter composition:

```txt
contracts
  -> resolveMetadataUiPresentation(...)
  -> primitive adapter props
  -> @afenda/ui primitive composition
```

The existing `src/presentation` layer owns baseline profile resolution and
contract normalization. As renderer maturity increases, add focused resolver
helpers only when duplication appears:

```txt
src/presentation/
  resolve-density.shared.ts
  resolve-tone.shared.ts
  resolve-surface.shared.ts
  resolve-layout.shared.ts
```

Do not add these helpers speculatively. Add them when at least two adapters or
renderers need the same mapping logic.

Required rule:

```txt
Renderer receives metadata.
Renderer resolves presentation once.
Renderer passes resolved intent to adapters.
Adapter maps resolved intent to @afenda/ui.
```

Forbidden rule:

```txt
Every adapter re-parses or re-interprets raw presentation metadata.
```

---

## Renderer Context Contract

Before large-scale renderer migration, introduce a renderer context contract.

Target shape:

```txt
src/runtime/renderer-context.server.ts
```

The context should carry platform rendering concerns, not ERP domain logic:

```ts
type MetadataUiRendererContext = {
  surfaceKey?: string;
  sectionKey?: string;
  presentation: MetadataUiPresentationContract;
  diagnostics: MetadataUiDiagnosticsIdentity;
  permissions?: MetadataUiPermissionSubject;
  actionRegistry?: MetadataUiServerActionRegistry;
};
```

Rules:

* no `organizationId` unless it is already resolved by the host feature/server
  and passed as opaque metadata
* no ERP repository access
* no feature command execution
* no tenant policy ownership
* no browser state in server context

Why this matters:

* prevents each renderer from inventing its own context shape
* gives adapters a stable source of presentation, diagnostics, permission, and
  action wiring
* makes migration from governed-surface incremental rather than ad hoc

---

## Component Capability Registry

Renderer registration says what renders.

Capability registration says what a section kind can support.

Add a capability registry only after primitive adapters begin replacing
governed-surface behavior.

Target examples:

```txt
list:
  filtering
  sorting
  pagination
  row-actions
  bulk-actions
  export

stat:
  comparison
  thresholds
  drilldown

form:
  validation
  sections
  disabled-fields
  submit-action

kanban:
  columns
  swimlanes
  movement
  card-actions
```

The capability registry must remain metadata-ui specific. It must not encode
ERP workflows, approval rules, or module policy.

Suggested location:

```txt
src/registry/component-capability-registry.shared.ts
```

Do not add capability metadata to shadcn adapters. Capabilities describe section
behavior; adapters describe primitive composition.

---

## Adapter API Pattern

Adapters must accept metadata-ui concepts and return Afenda UI composition.

Example shape:

```ts
type MetadataUiPrimitiveDensity = "compact" | "comfortable" | "spacious";
type MetadataUiPrimitiveTone =
  | "neutral"
  | "primary"
  | "positive"
  | "warning"
  | "critical"
  | "muted";
```

Do not accept arbitrary `className` as a normal metadata escape hatch.

Allowed exception: internal adapter props may accept `className` for layout only
when the caller is a metadata-ui renderer, not feature metadata.

---

## Styling Rules

Use Afenda shadcn tokens and components:

* semantic colors: `bg-card`, `text-muted-foreground`, `border-border`
* semantic radii from `@afenda/ui`: `rounded-card`, `rounded-control`,
  `rounded-panel`, `rounded-section`
* surface spacing tokens: `gap-surface-*`, `p-surface-*`
* table tokens from `apps/erp/src/app/globals.css`
* `cn()` from `@afenda/ui/utils` for conditional classes
* Lucide icons through existing primitive/action composition, typically
  `h-4 w-4` for dense controls

Avoid:

* raw palette classes such as `bg-blue-500`, `text-emerald-600`,
  `border-zinc-200`
* raw `<button>`, `<input>`, `<select>`, `<table>` when a primitive exists
* `space-x-*` and `space-y-*`
* nested cards
* shadcn variant names in schemas
* arbitrary feature-supplied classes
* `animate-in`, `fade-in-*`, `zoom-in-*`, `slide-in-from-*`, and other
  `tw-animate-css` classes
* ad hoc gradients, glass effects, or multiple competing accent colors

---

## Accessibility And Interaction Bar

Shadcn primitives provide a strong baseline, but metadata-ui must preserve that
baseline when adapting metadata.

Required:

* every icon-only action has an accessible name and tooltip when the icon is not
  universally obvious
* every form control has a label or an explicit accessible name
* destructive confirmation copy is generated from safe metadata labels, not ERP
  domain policy
* disabled controls expose disabled state and optional disabled reason
* keyboard navigation remains primitive-native for dialogs, menus, tabs, sheets,
  selects, and command-like controls
* server renderers must not depend on browser state for initial accessibility
* client islands must be small and interaction-specific

Forbidden:

* clickable `div` / `span`
* pointer-only action menus
* visual-only required/error indicators
* custom ARIA where the shadcn primitive already provides the behavior
* hiding permission failures as empty states

---

## Visual Parity Gate

Before any renderer replaces governed-surface output, it must pass a visual
parity review against the governed equivalent.

Minimum parity checklist:

* same primary information hierarchy
* same or better action discoverability
* same or better empty/loading/error/forbidden state treatment
* no loss of table density or row action ergonomics
* no card stacking or decorative surfaces introduced during migration
* no new raw palette, radius, shadow, or animation classes
* mobile and narrow-panel layouts do not overlap text or controls

Recommended pilot order remains:

```txt
stat -> page-header -> action-bar -> detail-tabs -> form -> list
```

List remains last because table behavior has the largest blast radius.

---

## Scaffold Sequence

Implement in this order.

### Phase 0 — source scanning readiness

`apps/erp/src/app/globals.css` must contain:

```css
@source "../../../../packages/metadata-ui/src/**/*.{tsx,ts}";
```

Validation:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

If `@afenda/ui` primitives are changed:

```bash
pnpm --filter @afenda/ui typecheck
pnpm audit:shadcn-primitives
```

### Phase 1 — presentation and primitive adapters

Create:

```txt
src/presentation/resolve-density.shared.ts       # only when duplication appears
src/presentation/resolve-tone.shared.ts          # only when duplication appears
src/presentation/resolve-surface.shared.ts       # only when duplication appears
src/primitives/card.server.tsx
src/primitives/empty.server.tsx
src/primitives/action-button.server.tsx
src/primitives/badge.server.tsx
```

Then refactor:

```txt
src/shell/section-card.server.tsx
src/shell/empty-state.server.tsx
src/shell/heading.server.tsx
src/sections/action-bar/action-bar-renderer.server.tsx
src/sections/stat/stat-renderer.server.tsx
```

Goal:

* remove raw card/button/badge/empty-state Tailwind from metadata-ui
* keep current metadata contracts unchanged
* map metadata intent through presentation resolution, not directly inside
  renderers

### Phase 2 — table and list

Create:

```txt
src/primitives/table.server.tsx
```

Refactor:

```txt
src/sections/list/list-renderer.server.tsx
src/sections/list/list-table.client.tsx
```

Goal:

* use `@afenda/ui` table primitives
* map metadata density to table density
* keep server-window list behavior out of metadata-ui until migration is approved

### Phase 3 — forms and tabs

Create:

```txt
src/primitives/field.server.tsx
src/primitives/tabs.server.tsx
```

Refactor:

```txt
src/sections/form/form-renderer.server.tsx
src/sections/detail-tabs/detail-tabs-renderer.server.tsx
```

Goal:

* use Field/FieldGroup for form layout
* use Tabs/TabsList/TabsTrigger/TabsContent correctly
* no raw field groups or custom tab markup

### Phase 4 — confirmations and actions

Add action confirmation primitives using:

```txt
AlertDialog
DropdownMenu
Button
Spinner
```

Goal:

* high/critical action contracts render confirmation affordances
* server-action submission remains fail-closed unless host registry is wired
* no ERP mutation execution in metadata-ui

### Phase 5 — renderer context and capability registry

Add only when the first shadcn-backed section renderer needs shared rendering
context or capability negotiation:

```txt
src/runtime/renderer-context.server.ts
src/registry/component-capability-registry.shared.ts
```

Goal:

* one renderer context shape
* one capability source of truth
* no per-renderer context drift

### Phase 6 — migration adapters

Migration adapters are necessary because governed-surface is already widely
adopted.

Do not build broad migration APIs until a migration pilot is approved.

Approved pilot shape:

```txt
src/migration/stat-card-migration.shared.ts
```

Later, in risk order:

```txt
src/migration/governed-page-header.adapter.shared.ts
src/migration/governed-action-bar.adapter.shared.ts
src/migration/governed-detail-tabs.adapter.shared.ts
src/migration/governed-form.adapter.shared.ts
src/migration/governed-list.adapter.shared.ts
```

Rules:

* migration adapters transform metadata/config only
* no JSX in migration adapters
* no ERP data access
* no feature command execution
* no hidden compatibility shims in renderers

### Phase 7 — visual parity pilot

Pilot one section kind before global migration:

1. `stat`
2. `page-header`
3. `action-bar`
4. `detail-tabs`
5. `form`
6. `list`

List must remain last because governed-surface currently owns mature table,
toolbar, trailing-cell, URL, and server-window behavior.

---

## Required Shadcn Components

The current `@afenda/ui` inventory already includes the required primitives:

```txt
alert
alert-dialog
badge
button
card
checkbox
dialog
dropdown-menu
empty
field
input
input-group
select
separator
sheet
skeleton
spinner
switch
table
tabs
textarea
tooltip
```

Before adding new primitives, run from `apps/erp`:

```bash
pnpm dlx shadcn@latest info --json
pnpm dlx shadcn@latest docs <component>
pnpm dlx shadcn@latest add <component> --dry-run
```

After adding or updating primitives, run the `@afenda/ui` checks documented in
`packages/ui/shadcn-update.md`.

---

## Validation

After metadata-ui adapter changes:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
```

After adding or changing `@afenda/ui` primitives:

```bash
pnpm design-system:check
pnpm --filter @afenda/ui typecheck
pnpm audit:shadcn-primitives
```

For UI-sensitive renderer work, also verify in the consuming app or gallery.

For a governed-surface replacement pilot, also capture before/after evidence in
the consuming route or gallery and check:

```bash
pnpm guard:metadata-ui
pnpm architecture:check
```

Do not run repo-wide test/build just because this architecture document changed.

---

## Quality Bar

A metadata-ui renderer is production quality only when:

* contracts remain metadata-first and shadcn-free
* renderer output uses `@afenda/ui` primitives
* no raw foundational controls are used
* no raw palette classes are introduced
* no raw radius, shadow, animation, or fake-card classes are introduced
* density, tone, and surface are resolved through presentation helpers
* empty/loading/error/forbidden states use designed primitives
* action hierarchy, disabled state, and confirmation behavior are explicit
* form controls and icon actions meet the accessibility bar
* tables preserve server-window assumptions and dense ERP scanability
* visual parity is proven before replacing governed-surface behavior
* server/client/action runtime boundaries pass guard
* the renderer can be migrated from governed-surface without feature-domain
  behavior leaking into metadata-ui

---

## Decision

Use shadcn through `@afenda/ui`.

Do not make metadata-ui a shadcn package.

Do not encode shadcn variants in metadata contracts.

Do build metadata-ui primitive adapters and migrate renderers through them.
