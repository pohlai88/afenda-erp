# @afenda/feature-lynx

`@afenda/feature-lynx` is the Lynx product and brand layer. It owns Truth
Retrieval, Decision Operator contracts, and Lynx run/workflow/readiness surfaces.

Read the shared boundary map before adding files:

- [AI, Lynx, And Knowledge Package Map](../../README.md)

Lynx composes `@afenda/ai` and `@afenda/feature-knowledge`; it does not replace
them.

## Buckets

- `contracts/` keeps Lynx constants, public type language, prompts, and
  compatibility re-exports.
- `schemas/` owns Zod runtime validation for Truth, readiness, ERP read tools,
  outcome monitors, and tool input payloads.
- `components/` owns Lynx product UI exported through `@afenda/feature-lynx/client`.
- `data/`, `tools/`, and `workflows/` are server-only and exported through
  `@afenda/feature-lynx/server`.
- `surfaces/` owns governed metadata builders exported through
  `@afenda/feature-lynx/metadata`.

## Component Inventory

- `lynx.panel.component.client.tsx` owns the shared Lynx panel frame, empty
  state, metric card, and evidence card primitives.
- `lynx.chat-elements.component.client.tsx` owns message rendering and prompt
  input for Lynx streams, including Streamdown-powered markdown, citation links,
  copy actions, evidence summaries, run steps, and scroll-to-latest conversation
  behavior.
- `lynx.tool-output.component.client.tsx` owns structured operator tool output,
  including ERP-read summaries, metrics, evidence, approval controls,
  progressive disclosure, collapsible payloads, and serialized payload fallback.
- `lynx.operator-panel.component.client.tsx` composes the Decision Operator
  workspace.
- `lynx.truth-panel.component.client.tsx` composes Truth Retrieval.
- `lynx.run-feedback-form.component.client.tsx` owns replay feedback capture.
