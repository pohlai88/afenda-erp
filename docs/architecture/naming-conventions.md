# Naming Conventions

Afenda uses predictable names so routes, packages, generated output, and documentation remain easy to scan in a Vercel/Turborepo monorepo.

## Directories

- Use lowercase kebab-case for normal folders: `governed-surface`, `solution-console`, `ai-elements`.
- Keep package folders under `packages/*` aligned with package names: `packages/governed-surface` -> `@afenda/governed-surface`.
- Keep app folders under `apps/*` aligned with app package names where practical: `apps/erp` -> `@afenda/erp`.
- Allowed framework exceptions:
  - Next.js route groups: `(app)`, `(auth)`.
  - Next.js dynamic segments: `[moduleId]`, `[recordId]`.
  - Private route-local folders: `_components`.

## Files

- Use lowercase kebab-case for authored source files: `module-screen.tsx`, `document-upload-policy.ts`, `record-type-definitions.ts`.
- Keep Next.js App Router filenames unchanged: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `route.ts`.
- Keep governed-surface suffix taxonomy:
  - `.client.tsx` for Client Components or browser-only modules.
  - `.server.ts` or `.server.tsx` for server-only modules.
  - `.shared.ts` for environment-neutral helpers.
  - `.schema.ts` for schema contracts.
  - `.renderer.tsx` for governed metadata renderers.
- Keep test suffixes aligned with runner ownership:
  - `*.test.ts` and `*.test.tsx` for Vitest.
  - `*.spec.ts` for Playwright e2e tests.

## Components

- React component filenames stay kebab-case.
- Exported React component symbols stay PascalCase.
- Hooks use `use-*` filenames only when the file exports a hook as its primary API.
- Reusable UI primitives live in `packages/ui/src`.
- App-specific composition components live in `apps/erp/src/app` or `apps/erp/src/components`.

## Documentation

- Stable architecture docs live in `docs/architecture/`.
- Roadmaps, staged plans, and draft implementation plans live in `docs/roadmap/`.
- Markdown filenames use lowercase kebab-case.
- Allowed uppercase Markdown exceptions are `README.md` and tool-owned docs such as `AGENTS.md`.
- Do not create root-level architecture documents; add them under `docs/architecture/` and link them from `docs/architecture/README.md`.
