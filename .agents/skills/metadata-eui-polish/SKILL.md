---
name: metadata-eui-polish
description: >
  Afenda metadata-driven EUI polish workflow. Use automatically when implementing,
  reviewing, or refining governed renderers (packages/governed-surface/src/metadata/renderers),
  surface builders (packages/kernel/src/modules/list-surfaces.ts), Pattern A/B/C ERP pages, or
  the dev metadata-renderer-gallery. Composes shadcn-metadata, governed-renderer
  contracts, and Vercel web-design/composition skills. Do not invoke sibling
  skills separately for the same task.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Metadata EUI polish — governed renderer workflow

**Target:** production-grade Pattern B/C surfaces that pass renderer lint gates.

**Announce at start:** "Applying metadata EUI polish to [path or renderer id]."

This skill applies when editing:

- `packages/governed-surface/src/metadata/renderers/**`
- `packages/governed-surface/src/` (`GovernedSurfaceSectionCard`, `GovernedPatternCListSection`)
- `packages/kernel/src/modules/list-surfaces.ts` (list surface builders — pre-feature-package; moves to `packages/features/<id>/` on extraction)
- ERP pages using `GovernedComponentRenderer` or `GovernedPatternCListSection` (`layout="embedded"` when parent `Card` owns chrome)

**Canonical docs:** **ARCH-1003** `docs/architecture/1003-frontend.md`, **ARCH-1003** `docs/architecture/1003-frontend.md`. Index: `docs/architecture/README.md`.

## Embedded skills (load in this order)

| Skill                           | Location                                                        | Role                                                                                |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **shadcn-metadata**             | `.agents/skills/shadcn-metadata/SKILL.md`                       | Shelf primitives, composition, semantic tokens, forms — **never raw tile `<div>`s** |
| **web-design-guidelines**       | global — `vercel-labs/agent-skills@web-design-guidelines`       | Hierarchy, spacing rhythm, interaction states, loading/empty/error polish           |
| **vercel-composition-patterns** | global — `vercel-labs/agent-skills@vercel-composition-patterns` | Compound components; avoid boolean prop bags on renderers                           |
| **nextjs** (Cursor plugin)      | `vercel` plugin skill                                           | App Router: async params, RSC boundaries, Server Actions, cache tags                |
| **vercel-react-best-practices** | `~/.claude/skills/vercel-react-best-practices`                  | `async-parallel`, barrel imports, no client copy of server list truth               |

Optional review pass (attach manually): **frontend-design-review**, **wcag-accessibility-audit** for table keyboard/focus audits.

## Complementary skills (pair with Vercel React / composition)

| Priority              | Skill                                       | Install / path                                                          | Why                                                                                   |
| --------------------- | ------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Required**          | **shadcn-metadata**                         | `.agents/skills/shadcn-metadata/SKILL.md` (repo)                        | Shelf primitives, forms, tokens — renderers must not invent tiles                     |
| **Required**          | **web-design-guidelines**                   | `npx skills add vercel-labs/agent-skills@web-design-guidelines`         | Spacing, states, hierarchy — pairs with composition                                   |
| **Required**          | **vercel-react-best-practices**             | `~/.claude/skills/vercel-react-best-practices`                          | Waterfalls, serialization, client state                                               |
| **Required**          | **nextjs** / **nextjs-app-router-patterns** | Cursor `nextjs` plugin or `~/.claude/skills/nextjs-app-router-patterns` | Thin pages, `await params`, Server Actions                                            |
| **High**              | **typescript-react-reviewer**               | `~/.claude/skills/typescript-react-reviewer`                            | `useEffect` abuse, hook rules, client-bridge anti-patterns                            |
| **High**              | **react-hooks**                             | `~/.claude/skills/react-hooks`                                          | Derived state in render, event handlers vs effects — critical for drag/footer bridges |
| **High**              | **playwright-best-practices**               | `~/.claude/skills/playwright-best-practices`                            | Gallery matrix smoke tests                                                            |
| **Medium**            | **web-accessibility**                       | `~/.claude/skills/web-accessibility`                                    | Drag handles, focus, `aria-grabbed`                                                   |
| **Medium**            | **frontend-design-review**                  | `~/.codex/skills/frontend-design-review`                                | Design-system + layout geometry review gate                                           |
| **Repo**              | **dry** / **kiss** / **yagni**              | `.agents/skills/{dry,kiss,yagni}/`                                      | Builder duplication, speculative renderer modes                                       |

**Vercel plugin (Cursor):** `next-cache-components`, `nextjs` — use when touching `use cache`, `cacheLife`, or App Router caching.

## Cursor rules (non-negotiable)

| Rule               | Path                                  |
| ------------------ | ------------------------------------- |
| Governed UI        | `.cursor/rules/afenda-governed-ui.mdc` |
| Core architecture  | `.cursor/rules/afenda-core.mdc`        |

**Import doors (current monorepo):**

- Server/metadata surface components → `@afenda/governed-surface/server`
- Client components → `@afenda/governed-surface/client`
- Schemas → `@afenda/governed-surface/schemas`
- UI primitives → `@afenda/ui`
- List surface builders → `@afenda/kernel` (pre-extraction; move to `@afenda/feature-<id>` on extraction per ARCH-1002)

## Pattern map

| Pattern | When                                                   | Import door                                                                 |
| ------- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| **A**   | Page chrome + bespoke forms                            | `GovernedSurface`, `ModulePageHeader`, `GovernedSection` from `@afenda/governed-surface/server` |
| **B**   | Tables, KPI grids, audit lists (no trailing row forms) | `GovernedComponentRenderer` from `@afenda/governed-surface/metadata` + manual `Card` section |
| **C**   | List metadata + trailing forms/actions                 | `GovernedPatternCListSection` from `@afenda/governed-surface/server`; `GovernedTrailingActionSlot` from `@afenda/governed-surface/client` |

**Builder recipe:** `packages/kernel/src/modules/list-surfaces.ts` exports builders that return `ListSurfaceRendererConfigurationInput`. Pattern C sections pass the builder output to `GovernedPatternCListSection` — do not re-parse in the route.

**Pattern C polish:** `surfaceKey`, `requiresErpPermission`, row `trailingAction` + `disabledReason`, `data-trailing-action-state` on trailing cells. Governed identity contract: `data-surface-key`, `data-section-key`, `data-component-key` via `governedIdentityAttributes()`; render state via `diagnosticsDataAttributes()`. Section Playwright id: `data-testid="governed:list-section:{surfaceKey}"` (from `governedListSectionTestId` / `governedTestId("list-section", surfaceKey)`).

## Next.js runtime contract (Afenda)

**Canonical doc:** **ARCH-1003** `docs/architecture/1003-frontend.md` §runtime.

| Check          | Requirement                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| Page           | `await params`; `requireOrgSession`; `Promise.all` for independent fetches                |
| Section        | Pass `orgId`, permission flags from page — builders need `organizationId`                 |
| Builder        | `server-only`; return configuration, not JSX                                              |
| Pattern C      | `trailingColumn.cellId` + client `Cell` from registry — **never** `trailingColumn.render` |
| Links          | `rowHref` / cell `href` without locale prefix                                             |
| Client imports | `@afenda/governed-surface/client` from `*.client.tsx` only                                |
| Mutations      | Server Actions — not internal REST for list CRUD                                          |

## Vercel React performance (governed surfaces)

| Rule id                            | Apply on governed work                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `async-parallel`                   | Batch list query + ERP permission probe in one `Promise.all` on the page                                                 |
| `bundle-barrel-imports`            | Import shared row helpers via explicit `.shared` paths                                                                   |
| `server-serialization`             | Serialize builder output once; client table consumes config — not raw DB entities                                        |
| `rerender-derived-state-no-effect` | No `useEffect` mirroring server `rows` into local state for the main grid                                                |

## Polish checklist (every renderer / surface PR)

### 1. Placement & layout

- [ ] Outermost element: `@container`; inner grids use `@sm:` / `@md:` — **no viewport `sm:`/`md:`/`lg:` inside renderers**
- [ ] Variant maps typed as `Record<SchemaEnum, string>` — no inline ternaries for density/size
- [ ] Skeleton case exists in `GovernedComponentSkeleton` for the renderer id
- [ ] Gallery visual matrix updated if geometry changed

### 2. Primitives & tokens

- [ ] Leaf tiles/rows/chips use `@afenda/ui` (`Card`, `Badge`, `Table`, `Empty`, `Skeleton`, `Alert`)
- [ ] Semantic colors only (`text-muted-foreground`, `bg-card`) — no hardcoded hex or `dark:` one-offs
- [ ] `flex` + `gap-*` for stacks — no `space-y-*` / `space-x-*`
- [ ] Loading: `Skeleton` shape matches real content density

### 3. Data nature & schema

- [ ] Configuration schema exports `dataNatureSchema` + required `dataNature` field
- [ ] Nature registered in the governed renderer contracts (`packages/governed-surface/`)
- [ ] KPI vs snapshot-summary stat cards use correct `dataNature`

### 4. ERP states (every surface)

- [ ] Loading skeleton · empty with action · error with recovery · permission denied (honest, non-leaking)
- [ ] Table rows: stable entity IDs as keys — never `key={index}`
- [ ] `requiresErpPermission` on config when module gates apply
- [ ] Pattern C: single section path via `GovernedPatternCListSection` (no duplicate empty `Card`, no `GovernedComponentRenderer` empty fork)
- [ ] Trailing: `GovernedTrailingActionSlot` + `data-trailing-action-state`; invalid config uses `invalidConfig*` copy, not empty titles
- [ ] Next.js: thin `page.tsx`, `Promise.all`, serializable trailing `Cell`
- [ ] Vercel: no client copy of server list rows; no query waterfall on independent fetches

### 5. Verification gates

```bash
# After every change
pnpm lint:governed-renderers
pnpm typecheck

# Architecture guard
pnpm architecture:check
```

## Anti-patterns (block merge)

```txt
Viewport breakpoints inside renderers
Raw <div> tile geometry instead of @afenda/ui Card/Badge/Table primitives
Bespoke empty/loading markup instead of Empty/Skeleton
Deep import of list-surface-table from feature modules (use GovernedPatternCListSection)
GovernedComponentRenderer empty fork inside Pattern C list sections
Copying server list data into client state for initial ERP reads
Sequential page awaits when queries are independent
trailingColumn.render or non-serializable props across RSC boundary
```
