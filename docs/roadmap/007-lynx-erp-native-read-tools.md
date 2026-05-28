# TRACK-007: Lynx ERP-Native Read Tools

## Status

Active.

## Purpose

Give Lynx read-only ERP-native inspection before posting-grade ERP modules are
complete. This track expands Lynx usefulness without increasing mutation risk:
finance, approvals, and audit readiness are inspected from the existing tenant
ERP substrate, Knowledge/readiness context, and run ledger governance.

## Initial Scope

- Add governed read-only Lynx operator tools:
  - `inspectFinanceSignals`
  - `inspectApprovalControls`
  - `inspectAuditReadiness`
- Use server-derived tenancy only. Tool inputs must never accept
  `organizationId`.
- Keep all tools read-only, audited, and replayable through the Lynx Run Ledger.
- Report missing module substrate honestly as `partial` or `unavailable`.
- Keep ERP write/proposal actions sandboxed and human-approved.

## Enterprise Controls

- Every tool declares `GovernedToolMeta`.
- Finance and approval tools require their module view capabilities before
  reading module data.
- Tool call events are recorded with input, output summary, evidence references,
  and module tags where available.
- Vercel AI Gateway routing remains centralized; this track adds no Vercel
  Workflow or Vercel Sandbox runtime dependency.

## Exit Criteria

- Lynx can inspect finance, approval, and audit readiness in the operator route.
- Readiness panels show ERP-native tool availability by tenant/module state.
- Run replay can show ERP-native tool outputs and evidence references.
- Typecheck, architecture checks, brand lint, and targeted tests pass.
