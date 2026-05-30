# shadcn upstream snapshot (`@afenda/ui`)

This directory holds the **approved structural contract** for the Afenda shadcn fork.

## Layout

```txt
packages/ui/
  .upstream/shadcn/manifest.json   ← export + structure fingerprints
  src/                             ← live fork (semantic tokens, a11y, density)
  audits/                          ← contract-drift layers 1–4
```

## When to sync

After `pnpm dlx shadcn@latest add …` or any intentional change to primitive exports, root functions, `data-slot` attributes, or `cva` / `Slot` structure:

```bash
pnpm audit:shadcn-upstream:sync   # updates manifest.json (export source of truth)
pnpm audit:shadcn-primitives
pnpm test:visual --update-snapshots   # Linux CI baseline; commit snapshot PNGs
```

Use `--profile` on the primitive audit to see per-layer timing (excludes tsx startup).

## What drift means

The manifest stores fingerprints — not subjective design judgment:

| Field | Catches |
| ----- | ------- |
| `exports` | Missing public primitive export doors |
| `rootFunctions` | Removed/renamed root parts |
| `dataSlots` | Lost shadcn slot structure |
| `displayNames` | Missing devtools labels |
| `hasCva` / `hasSlot` / `hasCn` | Structure regression |

Optional full-file upstream copies can live beside `manifest.json` for diff review; the audit compares against the manifest.

## Doctrine

> `@afenda/ui` may fork shadcn only for Afenda semantic tokens, accessibility hardening, and enterprise density — never for random visual invention.

See [`../shadcn-update.md`](../shadcn-update.md).
