# TRACK-005 · Lynx + Knowledge Substrate

**Tracking ID:** `TRACK-005` · **File:** `005-lynx-knowledge-substrate.md` · **Status:** Active
**Related:** **ARCH-1005** (doctrine), **ARCH-1001** (AI gateway, runtime), **ARCH-1002** (feature packages), **ARCH-1005** (package discipline), **TRACK-003** (AI Enterprise Uplift — supersedes its "Embeddings / RAG: Cancelled" row)

---

## Why this track exists

The ERP AI assistant is tool-grounded today: it can answer questions whose answers are _shapes_ (record counts, status fields, document references). It cannot answer "why" questions, policy questions, or guidance questions — those require retrieving from unstructured tenant-owned text.

The legacy `afenda-vercel` codebase contains a mature Knowledge + Lynx substrate that is directly portable. This track adopts it.

The "Embeddings / RAG" row in **TRACK-003** was cancelled for the v1 uplift. **It is now superseded by this track.** All future decisions about retrieval, embeddings, and the Knowledge module reference TRACK-004, not TRACK-003.

---

## Scope

**In:**

- `@afenda/feature-knowledge` — pgvector schema, chunker, adapters (manual first), commit pipeline, hybrid retrieval, per-org settings, BYOK, eval harness
- `@afenda/feature-lynx` — `contracts/lynx.core.contract.ts`, Truth Retrieval route, Decision Operator route
- Governed tool envelope on `@afenda/ai`
- Brand ladder Phase A→B (Solution Console → Lynx Operator)
- Admin knowledge management UI, cron sync
- Eval runs list surface in admin

**Out (explicitly):**

- Vercel Workflow DevKit (still cancelled per TRACK-003)
- Public-docs "Public Lynx" surface (`apps/erp` has no public docs)
- NL→SQL demo (`lynx_demo_unicorn` — marketing-only, not in ERP)
- Layers 2 (Operating Briefs) and 3 (Canonical Intake) — deferred until product validates

---

## Phases

### Phase 0 — Doctrine + governance (markdown only)

**Deliverables:**

- [x] `docs/architecture/1005-infrastructure.md` (**ARCH-1005**)
- [x] `docs/roadmap/004-lynx-knowledge-substrate.md` (this file, **TRACK-004**)
- [x] `.cursor/rules/afenda-lynx-knowledge.mdc`
- [x] Update `docs/architecture/README.md`
- [x] Update `docs/roadmap/README.md`
- [x] Update `AGENTS.md` canonical references
- [x] Supersede TRACK-003 RAG row

**Verification:** `pnpm architecture:check`

---

### Phase 1 — `@afenda/feature-knowledge` substrate

**New package:** `packages/features/knowledge/` with export doors `./`, `./client`, `./server`, `./metadata`.

**New DB schema** (`packages/db/src/schema/knowledge.ts` + migration `0014_knowledge_substrate.sql`):

| Table                      | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `knowledge_source`         | Named sync source (manual, github_repo)         |
| `knowledge_document`       | Versioned document per source + externalId      |
| `knowledge_chunk`          | Text chunks with `vector(1536)` HNSW index      |
| `knowledge_org_setting`    | Per-org hybrid/rerank/ZDR toggles               |
| `knowledge_org_credential` | BYOK AES-256-GCM envelope for provider API keys |

RLS policies on all five tables (mirrors `0013_ai_tenant_rls.sql`). All five tables added to `rlsEvaluation` in `packages/db/src/rls.ts`.

**Substrate modules in `packages/features/knowledge/src/`:**

| File                                                | Purpose                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/contracts/knowledge.core.contract.ts`          | Embedding defaults, audit actions, and knowledge source kinds                |
| `src/contracts/knowledge.source-adapter.contract.ts` | `KnowledgeSourceAdapter<T>` contract (Invariant A)                          |
| `src/schemas/knowledge.source-manual.schema.ts`     | Manual source configuration validation                                       |
| `src/schemas/knowledge.source-github-repo.schema.ts` | GitHub source configuration validation                                      |
| `src/data/knowledge.embeddings.server.ts`           | `embedKnowledgeText`, `embedKnowledgeBatch` via `@afenda/ai` gateway         |
| `src/data/knowledge.chunker.server.ts`              | Deterministic word-window chunker (512 tok target, 64 tok overlap)           |
| `src/data/knowledge.source-manual.server.ts`        | Manual text ingest adapter                                                   |
| `src/data/knowledge.source-github-repo.server.ts`   | GitHub repo tree → file adapter (ships in Phase 1, enabled later)            |
| `src/data/knowledge.pipeline-commit.server.ts`      | Hash → diff → tx (delete old chunks, upsert doc, batch embed, insert chunks) |
| `src/data/knowledge.queries.server.ts`              | `listRecentKnowledgeChunks`, `findSimilarKnowledgeChunks`                    |
| `src/data/knowledge.retrieve-hybrid.server.ts`      | Cosine + `to_tsvector`/`websearch_to_tsquery` + RRF + optional rerank        |
| `src/data/knowledge.sync.server.ts`                 | Non-WDK sync runner (adapter iterator → commit pipeline)                     |
| `src/data/knowledge.eval.server.ts`                 | Eval set/case/run domain + `summarizeEvalScores` (recall@k, MRR)             |

**App routes and actions:**

- `apps/erp/src/app/(app)/knowledge/page.tsx` — admin-only knowledge management (sources, manual ingest, recent chunks, org settings)
- `apps/erp/src/app/api/internal/v1/cron/knowledge-sync/route.ts` — `Authorization: Bearer ${CRON_SECRET}`

**Tests:**

- `packages/features/knowledge/tests/unit/chunker.test.ts`
- `packages/features/knowledge/tests/unit/pipeline-commit.test.ts` (mock gateway)
- `packages/features/knowledge/tests/integration/retrieve-hybrid.test.ts`

**Env vars added to `packages/config/src/env.ts`:**

- `EMBEDDING_MODEL` — gateway model id (default `openai/text-embedding-3-small`)
- `RERANK_MODEL` — optional rerank model id
- `GITHUB_TOKEN` — optional PAT for github_repo adapter
- `KNOWLEDGE_ENCRYPTION_KEY` — AES-256 key for BYOK credential cipher

**Verification:** `pnpm db:generate`, `pnpm --filter @afenda/db test`, Vitest in `packages/features/knowledge`

---

### Phase 2 — Governed tool envelope on existing AI

Add `GovernedToolMeta` type to `packages/ai/src/contracts/ai.tools.contract.ts` and apply it to every tool in `ai.erp-tools.tool.server.ts` and `lynx.solution-provider-tools.tool.server.ts` (`@afenda/feature-lynx`):

```ts
type GovernedToolMeta = {
  risk: "low" | "medium" | "high";
  category:
    | "contacts"
    | "knowledge"
    | "operations"
    | "approvals"
    | "records"
    | "documents";
  access: "read" | "write";
  dataSensitivity: "none" | "low" | "medium" | "high";
  audit: "silent" | "record";
};
```

Extend `packages/ai/tests/unit/tools.test.ts` to assert tool-id stability and meta completeness. Mirrors `lynx-operator-runtime.test.ts` in the legacy repo.

**Verification:** `pnpm --filter @afenda/ai test`

---

### Phase 3 — `@afenda/feature-lynx` product surface

**New package:** `packages/features/lynx/` with `contracts/lynx.core.contract.ts` (module id, layers, audit actions, HTTP routes).

**New routes:**

- `apps/erp/src/app/api/lynx/truth-search/route.ts` — embed → similarity search → four-section system prompt → AI SDK UI stream with evidence metadata parts
- `apps/erp/src/app/api/lynx/operator/route.ts` — governed tool registry + `org_search_knowledge` + `org_recent_knowledge_chunks` tools from `@afenda/feature-knowledge`

**Knowledge admin page** (moved from Phase 1 if not complete): `apps/erp/src/app/(app)/knowledge/page.tsx`

**Brand:** UI copy stays "ERP Assistant" / "Solution Console" — Phase A of brand ladder.

**Verification:** `pnpm typecheck`, `pnpm test`, smoke `/api/lynx/truth-search` with seeded chunks

---

### Phase 4 — First surface flip (Phase B of brand ladder)

Flip **Solution Console → "Lynx Operator"**:

- Update display label in `packages/kernel/src/modules/definitions.ts`
- Add brand mark SVG/PNG assets under `apps/erp/public/icons/lynx/`
- Update `getSolutionProviderSystemPrompt` — drop "Agent" / "AI" language
- Add `scripts/lint-lynx-brand.mjs` + `pnpm lint:lynx-brand` in root `package.json`

**Verification:** `pnpm lint:governed-renderers`, `pnpm lint:lynx-brand`

---

### Phase 5 — Eval + observability

- Admin "Lynx eval runs" panel using `GovernedPatternC` list surface
- OTel spans `lynx.truth.search` and `lynx.operator.stream` via `apps/erp/src/lib/ai-tracing.ts` `withAiSpan`
- Gateway spend report tag `module:lynx` in `packages/ai/src/data/ai.gateway.data.server.ts` `getGatewaySpendReport`

**Verification:** `pnpm test:e2e` (happy-path smoke per surface), Gateway spend regression

---

## Status

| Phase | Status   | Gate command                                        |
| ----- | -------- | --------------------------------------------------- |
| 0     | Complete | `pnpm architecture:check`                           |
| 1     | Pending  | `pnpm db:generate`, `pnpm --filter @afenda/db test` |
| 2     | Pending  | `pnpm --filter @afenda/ai test`                     |
| 3     | Pending  | `pnpm typecheck`, `pnpm test`                       |
| 4     | Pending  | `pnpm lint:lynx-brand`                              |
| 5     | Pending  | `pnpm test:e2e`                                     |

---

## Non-negotiables carried from ARCH-1001

- `organizationId` from server session only — never from model args or request body.
- All cron sync routes validate `Authorization: Bearer ${CRON_SECRET}`.
- Embedding Gateway requires `AI_GATEWAY_API_KEY` locally or `VERCEL_OIDC_TOKEN` on Vercel.
- `access: "write"` tools always route through sandbox/approval flow.
