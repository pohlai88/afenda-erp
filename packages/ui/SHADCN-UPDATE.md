# shadcn/ui update checklist (`@afenda/ui`)

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
pnpm audit:tailwind-token-parity
pnpm audit:governed-design-tokens --scope=app --strict
pnpm --filter @afenda/ui typecheck
```

## Primitive typography zone

| Layer | Rule |
| ----- | ---- |
| `packages/ui/src/**` (internal) | May keep shadcn `text-sm`, `text-xs`, `animate-in/*`, selective `dark:` for nova variant |
| CardDescription, EmptyDescription, Field helpers | Must use `type-muted` / `type-caption` |
| `apps/erp`, `packages/features`, `packages/governed-surface` | Must use `type-*` and `ui.*` only — never raw `text-sm` / palette colors |

## Animation (`tw-animate-css`)

- **Keep** `@import "tw-animate-css"` in `globals.css` until each primitive animation has a `@theme --animate-*` equivalent.
- **Ban** new `animate-in`, `fade-in-0`, `slide-in-from-*`, `zoom-in-95` usage outside `packages/ui`.
- **Migration order** (when mapping): dialog → popover → sheet → tooltip.
- Native ERP motion already lives in `@theme`: `surface-in`, `surface-out`, `command-in`, `material-resolving`.

## Inventory: tw-animate class usage in `packages/ui`

Primitives using shadcn/tw-animate utilities (do not remove import until migrated):

- **Overlays:** `dialog`, `sheet`, `drawer`, `popover`, `hover-card`, `tooltip`, `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`, `select`, `combobox`
- **Patterns:** `animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`, `slide-in-from-*`, `slide-out-to-*`

Cross-reference native tokens in `apps/erp/src/app/globals.css` (`--animate-surface-in`, etc.) before adding new keyframes.

## References

- Token contract: `packages/ui/src/design-system.ts`
- CSS source of truth: `apps/erp/src/app/globals.css`
- Agent rule: `.cursor/rules/governed-design-tokens.mdc`
- shadcn v4: https://ui.shadcn.com/docs/tailwind-v4
