# Governed Surface Enterprise Builders

This scaffold is intentionally **builder-only**.

It does not wrap React components and does not create JSX. Components such as
`GovernedSurface`, `GovernedSection`, Pattern B/C sections, `GovernedAuditPanel`,
and `GovernedDetailTabs` remain the rendering layer.

## Intended flow

```txt
Domain data
  ↓
Builder creates governed model/config
  ↓
Component renders governed model/config
```

## Files

```txt
builders/
  empty-state.builders.ts
  audit-panel.builders.ts
  detail-tabs.builders.ts
  build-governed-chart-surface.ts
  build-governed-list-surface.ts
  build-governed-stat-grid.ts
  governed-list-toolbar.shared.ts
  list-surface-header.shared.ts
  index.ts
```

## What this solves

- Standard empty states for forbidden, invalid, load error, no data, and CTA.
- Standard audit panel model creation.
- Standard detail tabs model creation.
- Keeps existing chart/list/stat config builders.
- Adds schema-version defaulting to chart builder.
- Avoids wrapper builders around already-good components.

## Integration

Place the `builders/` folder under your governed-surface package, then export it
from your package barrel if desired:

```ts
export * from "./builders";
```

Then use it inside feature/domain modules:

```ts
const auditModel = buildGovernedAuditPanel({ ... });
```

```tsx
<GovernedAuditPanel model={auditModel} />
```

## Architecture rule

Do not add builders named `buildGovernedSurface`, `buildGovernedSection`,
`buildGovernedPatternBListSection`, or `buildGovernedPatternCListSection` unless
they create serializable metadata/config rather than JSX or component props.
