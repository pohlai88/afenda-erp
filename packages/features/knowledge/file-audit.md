# Knowledge File Audit

Scope: `packages/features/knowledge`, excluding `node_modules`.

## Package Files

| File                  | Decision                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `AGENTS.md`           | Keep. Updated to reflect the template buckets actually used by the substrate.            |
| `README.md`           | Keep. Documents the retrieval-substrate role and the current bucketed layout.            |
| `package.json`        | Keep. Public export doors remain unchanged.                                              |
| `tsconfig.json`       | Keep. Typecheck package config only.                                                     |
| `tsconfig.build.json` | Keep. Build output contract remains `dist/**`.                                           |
| `vitest.config.ts`    | Keep. Unit test runner only.                                                             |

## Public Doors

| File              | Decision                                                                             |
| ----------------- | ------------------------------------------------------------------------------------ |
| `src/index.ts`    | Keep. Environment-neutral door re-exporting contracts and eval schemas.              |
| `src/client.ts`   | Keep. Browser-safe door re-exporting contracts and schemas only.                     |
| `src/server.ts`   | Keep. Server-only door re-exporting substrate data modules.                          |
| `src/metadata.ts` | Keep. Governed metadata door for knowledge and Lynx eval-run list surfaces only.     |

## Contracts

| File                                           | Decision                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `src/contracts/index.ts`                       | Keep. Contract barrel.                                                      |
| `src/contracts/knowledge.core.contract.ts`     | Keep. Embedding constants, audit action ids, and source-kind ids.           |
| `src/contracts/knowledge.retrieval.contract.ts` | Keep. Retrieval DTOs and raw knowledge-document contract.                  |
| `src/contracts/knowledge.source-adapter.contract.ts` | Keep. Adapter purity contract for source integrations.                |

## Schemas

| File                                                | Decision                                                                    |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/schemas/index.ts`                              | Keep. Schema barrel.                                                        |
| `src/schemas/knowledge.eval-dataset.schema.ts`      | Keep. Eval set/case/result schemas and derived types.                       |
| `src/schemas/knowledge.source-github-repo.schema.ts` | Add. GitHub source configuration schema separated from runtime adapter.    |
| `src/schemas/knowledge.source-manual.schema.ts`     | Add. Manual source configuration schema separated from runtime adapter.     |

## Data

| File                                                     | Decision                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/data/index.ts`                                      | Keep. Server data barrel.                                                                        |
| `src/data/knowledge.chunker.server.ts`                   | Keep. Deterministic chunker moved from ad hoc `src/server/`.                                     |
| `src/data/knowledge.embeddings.server.ts`                | Keep. Gateway-backed embedding helpers.                                                          |
| `src/data/knowledge.eval.server.ts`                      | Keep. Eval runner and read model.                                                                |
| `src/data/knowledge.pipeline-commit.server.ts`           | Keep. Document commit pipeline. Fixed incorrect `chunksDeleted` reporting.                       |
| `src/data/knowledge.queries.server.ts`                   | Keep. Tenant-scoped reads. Optimized counts to use `count()` instead of materializing all ids.  |
| `src/data/knowledge.retrieve-hybrid.server.ts`           | Keep. Source-blind retrieval and optional rerank. Removed dead placeholder code.                 |
| `src/data/knowledge.source-adapter-registry.server.ts`   | Keep. Adapter registry renamed into template bucket.                                             |
| `src/data/knowledge.source-github-repo.server.ts`        | Keep. GitHub adapter; config schema moved to `schemas/`.                                         |
| `src/data/knowledge.source-manual.server.ts`             | Keep. Manual adapter; config schema moved to `schemas/`.                                         |
| `src/data/knowledge.sync.server.ts`                      | Keep. Sync runner. Fixed org scoping when loading a source by id.                                |

## Removed Empty Buckets

| Bucket                | Decision                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| `src/actions/`        | Remove. No Server Actions live in the substrate today.                   |
| `src/components/`     | Remove. No client UI belongs in the substrate today.                     |
| `src/events/`         | Remove. No explicit domain event surface exists yet.                     |
| `src/policies/`       | Remove. No package-local policy layer exists yet.                        |
| `src/tests/`          | Remove. Package tests already live in the top-level `tests/` directory.  |

## Tests

| File                                  | Decision                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `tests/unit/chunker.test.ts`          | Keep. Updated import path for the renamed chunker module.                |
| `tests/unit/eval-gates.test.ts`       | Keep. Updated import path for the renamed eval module.                   |
| `tests/unit/pipeline-commit.test.ts`  | Keep. Updated import and mock paths for the renamed pipeline modules.    |

## Removed

- `src/server/` after moving all real implementation into template buckets.
- empty starter buckets: `actions`, `components`, `events`, `policies`, `tests`.
- Empty non-template buckets: `catalogs`, `errors`, `hooks`, `integrations`, `repositories`, `services`, `surfaces`, `webhooks`, `workflows`.
- Generated package output: `dist/` and `.turbo/`.
