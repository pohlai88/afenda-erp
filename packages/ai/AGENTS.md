# @afenda/ai

Platform AI runtime — **ARCH-1002** §6, **ARCH-1004** §5, **ARCH-1005** §11.

**Substrate-blind:** no `@afenda/feature-knowledge`, `@afenda/feature-lynx`, or `@afenda/db`. Tenant HTTP commands that persist usage, approvals, or extractions live in `@afenda/feature-system-admin` `platform-ai/`.

## Owns

| Bucket | Responsibility |
| ------ | ---------------- |
| `data/` | Gateway client, tracing, persistence **repository** re-exports for handlers only |
| `api/` | Gateway spend and shared route observability (`handleAiGatewaySpendGet`, …) |
| `tools/` | Governed tool factories (generic ERP read tools) |
| `agents/` | ToolLoopAgent specialists (no product prompts with Lynx brand) |
| `policies/` | Budget, credential guardrails |
| `schemas/` | Ingress + tool Zod |

## Does not own

- Lynx operator/truth streams → `@afenda/feature-lynx` `api/`
- Sandbox DB executors after approval → `@afenda/feature-system-admin` `lynx/data/`
- Operational skill catalog, solution-provider tools/agents/prompts → `@afenda/feature-lynx`
- Lynx-branded gateway feature flags (`lynx-truth`, `lynx-operator`, `solution-provider`) → `@afenda/feature-lynx/metadata` (`lynxAiFeatureFlags`)

## HTTP (**ARCH-1004**)

```txt
POST /api/internal/v1/ai/queries/erp-assistant
GET  /api/internal/v1/ai/queries/gateway-spend
POST /api/internal/v1/ai/commands/extract-document
```

Canonical paths: `AI_ERP_HTTP_ROUTES` in `src/contracts/ai.http.contract.ts`.

Flat `/api/ai/*` is **non-compliant**.

## Public doors

- `@afenda/ai` / `@afenda/ai/server` — server runtime + handlers
- `@afenda/ai/client` — metadata, components, contracts, schemas
- `@afenda/ai/metadata` — platform feature flags only

## Agent naming

Specialist responsibility (`erp-specialist`), not model/route/brand shells.
