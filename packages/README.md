# AI, Lynx, And Knowledge Package Map

This README is the cross-link for Afenda's machine-layer packages. It explains
where code belongs before agents create new files or merge packages.

Canonical references:

- [ARCH-009 Machine Layer Doctrine](../docs/architecture/009-machine-layer-doctrine.md)
- [ARCH-001 System Architecture](../docs/architecture/001-system-architecture.md)
- [Feature scaffold](./_template-definition/README.md)
- Vercel AI Gateway docs: https://vercel.com/docs/ai-gateway
- Vercel AI SDK docs: https://ai-sdk.dev/docs

## Decision

Do not merge `@afenda/ai`, `@afenda/feature-lynx`, and
`@afenda/feature-knowledge`.

`Lynx` is the user-facing product brand and machine-layer shell, similar to a
product surface such as Copilot or Codex. It may orchestrate multiple internal
specialist agents, but it is not itself one agent.

`Knowledge` is the retrieval substrate. It stores and retrieves tenant-owned
evidence, but it does not own product personality, operator copy, or agent
orchestration.

`@afenda/ai` is the provider-agnostic runtime and agent orchestra. It owns AI SDK
agent factories, tool contracts, gateway policy, guardrails, schemas, usage
events, and sandbox/approval primitives. It must stay blind to feature products
such as Lynx and Knowledge.

## Package Roles

| Package                            | Role                | Owns                                                                                                                     | Must not own                                               |
| ---------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `@afenda/ai`                       | Agent/runtime layer | Specialist agents, governed tools, AI Gateway options, model policy, guardrails, sandbox primitives, AI schemas          | Lynx UI, Knowledge retrieval tables, product routes        |
| `@afenda/feature-knowledge`        | Retrieval substrate | source adapters, chunking, embeddings, pgvector retrieval, eval data, knowledge settings                                 | Lynx brand, operator prompts, cross-product agent behavior |
| `@afenda/feature-lynx`             | Product/brand layer | Lynx contracts, Truth Retrieval, Decision Operator, run/workflow/readiness surfaces, composition of Knowledge + AI tools | generic AI gateway primitives, Knowledge storage ownership |

## Import Direction

Allowed direction:

```txt
apps/erp
  -> @afenda/feature-lynx
  -> @afenda/feature-knowledge
  -> @afenda/ai

@afenda/feature-lynx
  -> @afenda/feature-knowledge
  -> @afenda/ai

@afenda/feature-knowledge
  -> @afenda/ai

@afenda/ai
  -> no @afenda/feature-lynx
  -> no @afenda/feature-knowledge
```

Use package doors:

- Browser/client files import only `./client`.
- Server routes and Server Actions import `./server`.
- Static metadata imports `./metadata`.
- Avoid deep imports across package boundaries.

## Agent Naming

Agents are named by specialist responsibility, not by model, route, or brand.

Allowed:

- `ai.erp-specialist.agent.server.ts`
- `ai.solution-provider-specialist.agent.server.ts`
- `ai.analysis-specialist.agent.server.ts` when analysis work becomes real
- `ai.operator-orchestrator.agent.server.ts` only if a coordinator is needed

Disallowed:

- `ai.gpt.agent.server.ts`
- `ai.claude.agent.server.ts`
- `ai.lynx.agent.server.ts`
- route-shaped agent names such as `ai.chat.agent.server.ts`

The route or product chooses the specialist and tool pack. The model is selected
by Gateway policy (`feature`, `risk`, provider order, fallback models), not by
agent filename.

## Vercel Runtime Contract

- User-facing agent routes use AI SDK `ToolLoopAgent` and
  `createAgentUIStreamResponse`.
- Text and agent calls route through AI Gateway with `provider/model` ids.
- Gateway `providerOptions.gateway.tags` must include feature, tenant, module,
  environment, and risk where available.
- Embeddings and reranking use Gateway-compatible models when available. Keep
  Knowledge vectors in Neon pgvector; do not add external vector databases.
- Mutating tools require `needsApproval`, governed tool metadata, audit records,
  and sandbox/approval flow before domain mutations.

## Merge And Retirement Rules

Do not merge:

- `@afenda/feature-knowledge` into `@afenda/ai`
- `@afenda/feature-lynx` into `@afenda/ai`
- `@afenda/ai` into `@afenda/feature-lynx`

Allowed cleanup:

- Lynx product surfaces, console metadata, and `/lynx` routes live in
  `@afenda/feature-lynx`. Legacy `/solution-console` URLs redirect to `/lynx`.

## Next Refactor Audit

Current observations:

- `@afenda/feature-knowledge` now follows the feature template with substrate
  contracts in `src/contracts/`, validation in `src/schemas/`, and runtime
  implementation in `src/data/`.
- `@afenda/feature-lynx` now follows the feature template with contracts,
  metadata surfaces, data queries, tools, and workflows in explicit buckets.
### Knowledge

Current shape is mostly correct: it is a server-heavy substrate with chunking,
embedding, source adapters, pipeline commit, retrieval, sync, and eval code.

Refactor guardrails:

1. Keep source adapters pure: adapters list raw documents only; commit pipeline
   owns writes and embeddings.
2. Keep retrieval source-blind and tenant-scoped.
3. Keep substrate contracts in `contracts/`, schemas in `schemas/`, and
   server-heavy implementation in `data/`.

Do not move Knowledge into AI.

### Lynx

Current shape correctly owns the product contract, operator/readiness surfaces,
and proactive outcome workflows through explicit feature-template buckets.

Refactor next:

1. Keep `src/contracts/lynx.core.contract.ts` as the canonical ARCH-009 contract.
2. Continue moving any new metadata implementation into named `surfaces/`
   modules, with `src/metadata.ts` as the only public metadata door.
3. Keep server behavior in explicit `data/`, `tools/`, and `workflows/`
   buckets using dotted filenames.
4. Keep Lynx composing Knowledge through public doors only.
5. Keep Lynx tools governed and replayable through run events.

Do not move Lynx product code into AI.
