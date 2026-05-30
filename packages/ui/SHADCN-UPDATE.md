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
   - `rounded-md` → `rounded-control`
   - `rounded-lg` / `rounded-xl` → `rounded-section` or `rounded-card` via `ui.radius.*`

3. **Colors** — semantic tokens only in customized files:
   - Never add `slate-*`, `gray-*`, `zinc-*` palette classes
   - Use `bg-primary`, `bg-surface`, `text-muted-foreground`, `surface-code`, etc.

4. **globals.css** — do not:
   - Add `@utility text-{fill}` overrides (`text-muted`, `text-accent`, …)
   - Duplicate `:root` / `.dark` blocks from shadcn init (tokens live in `apps/erp/src/app/globals.css` only)
   - Add per-component `dark:` color overrides when `.dark` already flips the CSS variable

5. **Verify**

```bash
pnpm design-system:check
pnpm --filter @afenda/ui typecheck
```

## Primitive typography zone

| Layer | Rule |
| ----- | ---- |
| `packages/ui/src/**` (internal) | May keep shadcn `text-sm`, `text-xs`, `animate-in/*`, selective `dark:` for nova variant |
| Description slots (`*Description`, `TableCaption`, command/combobox empty) | Must use `type-muted` |
| `FieldTitle` | `type-control` + `font-medium` |
| `EmptyContent` | `type-body` |
| `apps/erp`, `packages/features`, `packages/governed-surface` | Must use `type-*` and `ui.*` only — never raw `text-sm` / palette colors |

## Animation strategy (`tw-animate-css`)

### Policy (do not remove import yet)

- **Keep** `@import "tw-animate-css"` in `globals.css` until every primitive below has a tested `@theme --animate-*` equivalent.
- **Ban** new `animate-in`, `fade-in-0`, `slide-in-from-*`, `zoom-in-95` (and related tw-animate classes) outside `packages/ui`.
- **YAGNI:** do not delete `tw-animate-css` in a bulk pass — 50+ class strings across overlays; migrate one primitive at a time.

### Native ERP motion (already in `@theme`)

Use these for new product surfaces instead of tw-animate:

| Token | Use |
| ----- | --- |
| `--animate-surface-in` / `surface-out` | Panel / card enter-exit |
| `--animate-command-in` | Command palette |
| `--animate-material-resolving` | Lynx loading states |

Defined in `apps/erp/src/app/globals.css`. Cross-reference before adding keyframes.

### Migration order (when mapping 1:1)

1. **dialog** + **alert-dialog** (backdrop fade + content zoom)
2. **popover** + **hover-card** + **dropdown-menu** + **context-menu** + **menubar**
3. **sheet** + **drawer** (directional slide + backdrop)
4. **tooltip** + **select** + **combobox** + **navigation-menu**

### Inventory: tw-animate usage in `packages/ui/src` (13 files, ~21 class strings)

| File | tw-animate patterns |
| ---- | ------------------- |
| `alert-dialog.tsx` | backdrop `fade-in/out`; content `zoom-in-95` / `zoom-out-95` |
| `combobox.tsx` | `slide-in-from-*`, `animate-in/out`, `fade-in-0`, `zoom-in-95` |
| `context-menu.tsx` | 2 surfaces: slide + fade + zoom (open/closed) |
| `dialog.tsx` | backdrop fade; content zoom |
| `drawer.tsx` | backdrop fade only |
| `dropdown-menu.tsx` | 2 surfaces: slide + fade + zoom |
| `hover-card.tsx` | slide + fade + zoom |
| `menubar.tsx` | 2 surfaces: slide + fade (+ zoom on submenu) |
| `navigation-menu.tsx` | horizontal slide (`slide-in-from-left/right-52`), viewport `zoom-in/out-90`, indicator fade |
| `popover.tsx` | slide + fade + zoom |
| `select.tsx` | slide + fade + zoom |
| `sheet.tsx` | backdrop fade; panel directional `slide-in-from-*-10` / `slide-out-to-*` |
| `tooltip.tsx` | slide + fade + zoom (`delayed-open` + `open` states) |

**Class families in use:** `animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `fade-in`, `fade-out`, `zoom-in-95`, `zoom-out-95`, `zoom-in-90`, `zoom-out-90`, `slide-in-from-{top,left,right,bottom}-2`, `slide-in-from-*-10`, `slide-in-from-left-52`, `slide-out-to-*`.

Re-run inventory after shadcn upgrades:

```bash
rg "animate-in|animate-out|fade-in|fade-out|zoom-in|zoom-out|slide-in-from|slide-out-to" packages/ui/src --glob "*.tsx"
```

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
2. **Token drift** — raw palette, description-slot typography, inline color/style, raw elevation/radius (warnings until migrated).
3. **Primitive contracts** — export doors + representative shadcn patterns per file (`primitive-contracts.ts` overrides only).
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
