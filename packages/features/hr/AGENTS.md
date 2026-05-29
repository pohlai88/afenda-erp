# @afenda/feature-hr

Scaffold default: `packages/_template-definition`. Migration: `docs/roadmap/004-hrm-migration.md`.

## Public doors

- `src/index.ts` — metadata + client-safe contracts
- `src/client.ts` — browser-safe contracts and shared helpers only
- `src/server.ts` — server queries/commands (add per slice)
- `src/metadata.ts` — governed metadata door

## Rules

- One workspace package; no nested `package.json` under `src/`.
- Add vertical folders only when implementing a TRACK-004 slice (`pnpm scaffold:vertical hr <vertical>`).
- Use template buckets only; banned: `repositories`, `services`, `surfaces`, `lib`, `utils`, `_shared`.
- Legacy HRM lives in afenda-vercel — reimplement, do not copy.

## Reset

`pnpm exec tsx packages/features/hr/scripts/reset-to-slice0.mts`
