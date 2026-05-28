# ARCH-009 · Machine Layer Doctrine (Lynx + Knowledge)

**Doc ID:** `ARCH-009` · **File:** `009-machine-layer-doctrine.md`

| Field      | Value                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| Status     | Active — governs `@afenda/feature-lynx` and `@afenda/feature-knowledge`             |
| Authority  | Machine-layer product framing, four-layer model, brand contract, retrieval substrate |
| Supersedes | TRACK-003 disposition row "Embeddings / RAG" (Cancelled → Superseded by TRACK-004) |
| Related    | **ARCH-001** (AI gateway, runtime), **ARCH-002** (feature packages), **ARCH-008** (package discipline), **TRACK-004** |

---

## Canonical line

```
Lynx is Afenda's machine layer for resolving truth, preparing work, and recommending controlled action.
```

Lynx is an **ERP module**, not an "AI feature". It owns every machine-assisted modality (retrieval, NL→SQL, structured generation, chart inference, operator decisions). No parallel "AI assistant" or "copilot" modules exist. Providers (OpenAI, AI SDK, embeddings) are **implementation details** — never user-facing brand.

---

## Four product layers

| # | Name                 | Code slug    | Route                        | Audit action                     |
|---|----------------------|--------------|------------------------------|----------------------------------|
| 1 | Truth Retrieval      | `truth`      | `api/lynx/truth-search`      | `erp.lynx.truth.query`           |
| 2 | Operating Briefs     | `briefs`     | (deferred until product validates) | `erp.lynx.brief.generate`   |
| 3 | Canonical Intake     | `structured` | (deferred)                   | `erp.lynx.intake.commit`         |
| 4 | Decision Operator    | `operator`   | `api/lynx/operator`          | `erp.lynx.operator.recommend`    |

Phase 1 ships layers 1 and 4. Layers 2 and 3 are deferred until product validates demand.

### Layer 1 — Truth Retrieval

Every truth response **must** include exactly these four sections in order:

```
### Answer
### Evidence used
### Limitations
### Next safe action
```

- `### Answer` — cites passage numbers `[1]`, `[2]` when using a retrieved fact.
- `### Evidence used` — lists the knowledge chunk ids/titles actually cited.
- `### Limitations` — states what is unknown, what was not verified, that answers depend on stored evidence coverage.
- `### Next safe action` — one concrete, low-risk step for a human operator (no autonomous system changes).

Do **not** invent facts. Do not reference external systems unless they appear in retrieved passages.

### Layer 4 — Decision Operator

A `ToolLoopAgent` with a governed tool registry. Tenant id is captured in the closure at registry construction time — **never passed as a model argument**. Max tool round-trips: `LYNX_OPERATOR_MAX_STEPS` (default 5). Each tool declares: `risk`, `category`, `access`, `dataSensitivity`, `audit`.

---

## Module split: Knowledge substrate vs Lynx product

| Module                      | Role                                                              | Public door                   |
|-----------------------------|-------------------------------------------------------------------|-------------------------------|
| `@afenda/feature-knowledge` | Substrate — pgvector, `knowledge_chunk`, embeddings, chunk CRUD  | `./`, `./client`, `./server`, `./metadata` |
| `@afenda/feature-lynx`      | Product — Truth Retrieval UI, streaming truth, Operator Assist   | `./`, `./client`, `./server`, `./metadata` |

`@afenda/feature-lynx` composes `@afenda/feature-knowledge` via barrel only — no deep imports.

`@afenda/ai` stays **substrate-blind**: it imports from `@afenda/feature-knowledge/server` via the consuming route handler, not internally. This keeps `@afenda/ai` reusable by all feature packages.

---

## Knowledge substrate invariants

### Invariant A — Adapter purity

`KnowledgeSourceAdapter.listDocuments` returns plain `RawKnowledgeDocument` items only. Adapters must **not**: write DB rows, call embedding functions, choose chunking strategy, influence ranking. Only `pipeline-commit.ts` may write `knowledge_document` or `knowledge_chunk`.

### Invariant B — Retrieval is source-blind

Retrieval and reranking must not branch on `knowledge_source.kind`. Do not join source metadata for ranking heuristics. Allowed inputs: tenant id, query, optional explicit document allowlists.

### Invariant C — Embedding runs outside Route Handlers

Embedding and chunking loops run in background jobs (cron + queue). Never call `embedKnowledgeBatch` inline in a Route Handler that must respond within the Vercel function timeout.

### Invariant D — Tenant isolation is non-negotiable

All queries against `knowledge_chunk`, `knowledge_document`, `knowledge_source` must include `WHERE organization_id = $orgId`. RLS policies in `packages/db/drizzle/0014_knowledge_substrate.sql` provide defense-in-depth; app-level filters are still mandatory.

---

## Governed tool envelope

Every tool in `@afenda/ai` must declare this metadata envelope:

```ts
type GovernedToolMeta = {
  risk: "low" | "medium" | "high";
  category: "contacts" | "knowledge" | "operations" | "approvals" | "records" | "documents";
  access: "read" | "write";
  dataSensitivity: "none" | "low" | "medium" | "high";
  audit: "silent" | "record";
};
```

- `audit: "record"` tools emit a structured audit log entry per call.
- `audit: "silent"` tools are counted in usage but not individually audited.
- `access: "write"` tools must route mutations through the sandbox/approval flow — never direct table writes.
- `dataSensitivity: "high"` tools may not be called unless the requesting session holds the required capability.

---

## Banned user-facing vocabulary

Do **not** use in product copy, navigation labels, UI eyebrow text, or i18n message files:

| Banned                | Use instead                              |
|-----------------------|------------------------------------------|
| AI assistant          | Lynx / The Machine                       |
| Chatbot               | Lynx                                     |
| Copilot               | Lynx                                     |
| AI mode               | (omit)                                   |
| AI active             | "Lynx is resolving"                      |
| Thinking              | "resolving"                              |
| Processing            | "listening"                              |
| Generating            | (omit or use "resolving")                |
| AI answers            | "Lynx responds" / "high confidence"      |

The lint gate `pnpm lint:lynx-brand` enforces banned vocabulary on surfaces that have flipped to the Lynx brand. Surfaces that have not yet flipped are allowlisted.

---

## Brand ladder

Branding rolls out in four phases to avoid "big-bang rename" instability:

| Phase | State                | Trigger                                           |
|-------|----------------------|---------------------------------------------------|
| A     | Code-only Lynx       | TRACK-004 P0+P1 complete. Internal ids/audits are Lynx; UI copy unchanged. |
| B     | First surface flip   | First surface ships Lynx UI (Solution Console → Lynx Operator). |
| C     | All surfaces under Lynx | Post-TRACK-004. ERP Assistant → Lynx Truth, AI Ledger → Lynx Ledger. |
| D     | Lint enforced        | `pnpm lint:lynx-brand` passes with full allowlist removed. |

---

## Streaming protocol decision

Use **Vercel AI SDK UI streams** (`streamText` returning `result.toDataStreamResponse()`) for all Lynx routes. Evidence passages are carried as `metadata` parts. Revisit NDJSON only if the UI requires out-of-band tool-status frames that AI SDK UI streams cannot model.

---

## pgvector decision

Neon Postgres with the `pgvector` extension is the vector store. Key parameters:

| Parameter                | Value                              | Rationale                                               |
|--------------------------|------------------------------------|---------------------------------------------------------|
| Embedding model          | `openai/text-embedding-3-small`    | 1536 dims; efficient, Vercel AI Gateway routed          |
| Dimensions               | 1536                               | Must match `vector(1536)` column definition             |
| Index                    | HNSW `vector_cosine_ops`           | Sub-100 ms similarity at 100k+ chunks per tenant        |
| Hybrid retrieval default | off (per-org setting)              | Enable via `knowledge_org_setting.retrievalHybridEnabled` |
| Rerank default           | off (per-org setting)              | Enable via `knowledge_org_setting.retrievalRerankEnabled` + `RERANK_MODEL` |
| ZDR default              | off (per-org setting)              | Enable via `knowledge_org_setting.enforceZdr`           |

External vector databases (Pinecone, Weaviate, Qdrant) are **rejected** — they break the one-Neon doctrine in **ARCH-001** and require a second tenant boundary.

---

## Import rules

| Consumer                                           | Import                                      |
|----------------------------------------------------|---------------------------------------------|
| `apps/erp/app/**` RSC, Route Handlers, Server Actions | `@afenda/feature-knowledge`, `@afenda/feature-lynx` |
| Any `"use client"` file, client islands            | `@afenda/feature-knowledge/client`, `@afenda/feature-lynx/client` only |
| `@afenda/ai`                                       | No import of `@afenda/feature-knowledge` — stays substrate-blind |

`./client` exports: serializable DTOs, client-safe constants, Zod schemas. No `server-only`, no `next/headers`, no `@afenda/db`, no `@afenda/ai`.

---

## Verification

| Area                                    | Command                                           |
|-----------------------------------------|---------------------------------------------------|
| Architecture layout + exports           | `pnpm architecture:check`                         |
| Knowledge schema migration              | `pnpm db:generate`                                |
| Knowledge RLS coverage                  | `pnpm --filter @afenda/db test`                   |
| Governed-renderer changes               | `pnpm lint:governed-renderers`                    |
| Lynx brand compliance (flipped surfaces)| `pnpm lint:lynx-brand`                            |
| Full type safety                        | `pnpm typecheck`                                  |
