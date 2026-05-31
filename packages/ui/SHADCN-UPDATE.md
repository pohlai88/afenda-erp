# shadcn/ui update checklist (`@afenda/ui`)

**Composition (agents):** [`COMPOSITION.md`](./COMPOSITION.md) · Cursor rule `.cursor/rules/afenda-ui-composition.mdc`  
**Upstream shadcn skill:** `.agents/skills/shadcn/SKILL.md` (from [shadcn/ui skills](https://ui.shadcn.com/docs/skills))

Afenda keeps shadcn components in [`packages/ui/src`](./src). Config: [`apps/erp/components.json`](../../apps/erp/components.json) (`"config": ""` — Tailwind v4 CSS-first).

Run from repo root after `pnpm dlx shadcn@latest add …` (aliases point here).

## Post-import steps

1. **Typography (product-facing slots)** — map descriptions to ERP utilities:
   - `text-sm text-muted-foreground` → `type-muted`
   - `text-xs uppercase …` → `type-label` or `type-caption`
   - Card / Empty / Field helper text → `type-*` (see Primitive typography zone below)

2. **Radius** — replace raw Tailwind radius:
   - `rounded-md` → `rounded-control` or `rounded-chip` (kbd, compact chips)
   - `rounded-lg` → `rounded-control`
   - `rounded-xl` → `rounded-section`
   - `rounded-2xl` → `rounded-card`, `rounded-popover`, or `rounded-dialog` via `ui.radius.*`

3. **Elevation** — replace raw Tailwind shadows on overlays:
   - `shadow-lg` → `shadow-elevation-2` (popover, menu, select content)
   - `shadow-xl` → `shadow-elevation-3` (dialog, sheet, drawer backdrop)

4. **Colors** — semantic tokens only in customized files:
   - Never add `slate-*`, `gray-*`, `zinc-*` palette classes
   - Use `bg-primary`, `bg-surface`, `text-muted-foreground`, `surface-code`, etc.

5. **globals.css** — do not:
   - Add `@utility text-{fill}` overrides (`text-muted`, `text-accent`, …)
   - Duplicate `:root` / `.dark` blocks from shadcn init (tokens live in `apps/erp/src/app/globals.css` only)
   - Add per-component `dark:` color overrides when `.dark` already flips the CSS variable

6. **Verify**

```bash
pnpm design-system:check
pnpm --filter @afenda/ui typecheck
```

## Primitive typography zone

| Layer | Rule |
| ----- | ---- |
| `packages/ui/src/**` (internal) | May keep shadcn `text-sm`, `text-xs`, selective `dark:` for nova variant |
| Description slots (`*Description`, `TableCaption`, command/combobox empty) | Must use `type-muted` |
| `FieldTitle` | `type-control` + `font-medium` |
| `EmptyContent` | `type-body` |
| `apps/erp`, `packages/features`, `packages/governed-surface` | Must use `type-*` and `ui.*` only — never raw `text-sm` / palette colors |

## Animation strategy (native `@theme` motion)

### Policy

- **`tw-animate-css` removed** — no `@import "tw-animate-css"` in `globals.css`; dependency dropped from `@afenda/erp`.
- **Overlay primitives** use `uiMotion.*` from `design-system.ts`, backed by `@theme --animate-*` keyframes in `apps/erp/src/app/globals.css`.
- **Ban** `animate-in`, `fade-in-0`, `slide-in-from-*`, `zoom-in-95` (and related tw-animate classes) everywhere — enforced by `no-tw-animate` in `audit:shadcn-primitives` layer 2.

### Native ERP motion tokens

| Token / `uiMotion` key | Use |
| ----- | --- |
| `--animate-surface-in` / `surface-out` · `uiMotion.overlaySurface` | Popover, menu, select, combobox enter-exit |
| `--animate-overlay-scrim-in/out` · `uiMotion.overlayScrim` | Dialog, drawer, sheet backdrop |
| `--animate-overlay-sheet-*` · `uiMotion.overlaySheet` | Sheet / drawer panel directional slide |
| `--animate-overlay-nav-*` · `uiMotion.overlayNavMotion`, `overlayNavViewport`, `overlayNavPanel`, `overlayIndicator` | Navigation menu |
| `--animate-command-in` · `uiMotion.commandIn` | Command palette |
| `--animate-material-resolving` · `uiMotion.resolving` | Lynx loading states |

Defined in `apps/erp/src/app/globals.css`. Cross-reference before adding keyframes.

### Inventory check (after shadcn upgrades)

```bash
rg "animate-in|animate-out|fade-in|fade-out|zoom-in|zoom-out|slide-in-from|slide-out-to" packages/ui/src --glob "*.tsx"
```

Expect **zero matches** in `packages/ui/src`.

## Enforcement (CI)

All gates run via `pnpm design-system:check` (also in `architecture:check`):

| Script | Catches |
| ------ | ------- |
| `audit:tailwind-token-parity` | CSS ↔ TS drift, missing `@theme` fills, orphan `@utility`, banned `@utility text-{fill}` |
| `audit:shadcn-primitives` | Four-layer **contract drift** (upstream manifest, tokens, exports/structure, interface-lab scaffold) |
| `audit:shadcn-upstream:sync` | Regenerate `.upstream/shadcn/manifest.json` after intentional shadcn add/upgrade |
| `audit:governed-design-tokens --scope=all --strict` | Product code: fill-as-ink, palette, typography, tw-animate outside UI, redundant ink stacks |
| `test:visual` | Playwright screenshot regression for interface-lab primitive previews |

`@afenda/ui` `pretypecheck` runs `audit:shadcn-primitives` automatically.

### Contract drift layers (`packages/ui/audits/`)

Single-pass I/O: each `.tsx` file is read once per run (`source-cache.ts` → `run-all.ts`).

1. **Shadcn upstream** — compare `src/` to `.upstream/shadcn/manifest.json` (exports, root functions, `data-slot`, `cva` / `Slot` / `cn` structure). **Exports are sourced from the manifest** — run `audit:shadcn-upstream:sync` after shadcn add; do not duplicate export lists elsewhere.
2. **Token drift** — raw palette, description-slot typography, inline color/style, raw elevation/radius, tw-animate class strings.
3. **Primitive contracts** — required shadcn structure patterns per file (`primitive-contracts.ts` overrides). Export doors are layer 1 only.
4. **Visual behavior** — `/interface-lab/primitives` + `ui-primitives-visual.spec.ts`; runtime gate `pnpm test:visual` (CI e2e job).

Local baseline seed (no production build):

```bash
pnpm test:visual:update
```

Doctrine:

> `@afenda/ui` may fork shadcn only for Afenda semantic tokens, accessibility hardening, and enterprise density — never for random visual invention.

## References

- Token contract: `packages/ui/src/design-system.ts`
- CSS source of truth: `apps/erp/src/app/globals.css`
- Agent rule: `.cursor/rules/governed-design-tokens.mdc`
- shadcn v4: https://ui.shadcn.com/docs/tailwind-v4
