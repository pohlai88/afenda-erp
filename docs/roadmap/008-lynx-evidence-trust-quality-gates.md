# TRACK-008: Lynx Evidence Trust And Quality Gates

## Status

Active.

## Purpose

Make Lynx replayable answers enterprise-trustworthy by validating claims against
cited evidence, persisting quality-gate metadata, and surfacing failed cases in
the Agent Management Console.

## Initial Scope

- Add claim-level validation contracts for supported, partially supported,
  unsupported, and declined answers.
- Persist validation summaries in Lynx run events and run metadata using the
  existing run ledger JSON fields.
- Show claim validation and quality-gate failures in the run console.
- Add filters for unsupported claims, low citation precision, and failed quality
  gates.
- Keep ERP-native read tools read-only; this track adds no durable workflow or
  autonomous write dependency.

## Enterprise Controls

- Truth Retrieval emits evidence and quality-gate UI data parts.
- Operator tool events record claim validation for tool output summaries and
  evidence references.
- AI Gateway tags include feature, organization, module, workflow, risk, and
  quality-gate context.
- Vercel Agent Code Review should include Lynx routes, validation contracts, and
  run-console metadata surfaces.

## Exit Criteria

- Claim validation helpers cover supported, unsupported, declined, and
  prompt-injection cases.
- Run replay shows claim-level validation next to event/evidence history.
- Run management filters can isolate failed quality gates and unsupported
  claims.
- Typecheck, architecture checks, Lynx brand lint, and targeted tests pass.
