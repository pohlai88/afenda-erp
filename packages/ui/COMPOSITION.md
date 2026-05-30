# Afenda UI composition (`@afenda/ui`)

How agents and humans compose ERP surfaces **without** `Card` → `Card` → `Card` stacks.

Upstream shadcn guidance: [`skills/shadcn`](../../.agents/skills/shadcn/SKILL.md) (install via `pnpm dlx shadcn@latest` + `components.json`). **Afenda rules below override generic shadcn defaults** for product code in `apps/erp`, `packages/features`, and `packages/governed-surface`.

Token rules: [`shadcn-update.md`](./shadcn-update.md) · [`.cursor/rules/governed-design-tokens.mdc`](../../.cursor/rules/governed-design-tokens.mdc)

---

## Layer model

| Layer | Import from | Role |
| ----- | ----------- | ---- |
| **ERP shell** | `@afenda/ui` — `SectionPanel`, `BulletColumns`, `ObservabilityIndicatorList`, `StatusBadge` | Page/section chrome (preferred) |
| **Governed lists** | `@afenda/governed-surface` — `GovernedPatternCListSection`, stat groups | Metadata-driven tables/stats |
| **Primitives** | `@afenda/ui` — `Field`, `FieldGroup`, `Dialog`, `Empty`, `Alert`, … | shadcn fork; compose inside shell |
| **Tokens** | `@afenda/ui/design-system` — `uiTypography`, `uiSurface`, `ui.*` | Class names only in product code |

**Do not** import from `@afenda/ui/src/*` or deep paths.

---

## Component selection (ERP)

| Need | Use | Not |
| ---- | --- | --- |
| Module section (title + description + body) | `SectionPanel` | Nested `Card` wrappers |
| Multi-column explainer / bullets | `BulletColumns` | Grid of `Card`s |
| KPI / status tiles row | `ObservabilityIndicatorList` or governed stat group | Row of raw `Card`s |
| Form fields | `FieldGroup` + `Field` + `FieldLabel` | `div` + `grid` + `Label` |
| 2–5 mutually exclusive options | `ToggleGroup` | Loop of `Button` variants |
| Empty list/state | `Empty` + `EmptyHeader` + `EmptyDescription` | Custom dashed border div |
| Callout / banner | `Alert` + `AlertTitle` + `AlertDescription` | Styled border div |
| Confirm destructive action | `AlertDialog` | `Dialog` |
| Side filters / detail | `Sheet` | Full-page `Card` |
| Data table (governed) | `GovernedPatternCListSection` | Hand-built `Table` in features |
| Form tile in a 2–3 column grid | `SubsectionPanel` | Local `SectionPanelLite` / bordered `div` |
| Code / JSON block | `surface-code` + `type-code` | `bg-slate-*` / `text-background` |

---

## Section layout (canonical)

```tsx
import { SectionPanel } from "@afenda/ui";

export function HrExampleSection() {
  return (
    <SectionPanel
      eyebrow="Workforce"
      title="Benefits enrollment"
      description="Review open enrollments and trailing actions."
      headingLevel={2}
    >
      {/* lists, forms, governed sections — no outer Card */}
      <GovernedPatternCListSection {...props} />
    </SectionPanel>
  );
}
```

### Anti-pattern: card stacking

```tsx
// ❌ AI default — do not generate
<Card>
  <CardHeader><CardTitle>Section</CardTitle></CardHeader>
  <CardContent>
    <Card>...</Card>
    <Card>...</Card>
  </CardContent>
</Card>

// ✅ ERP pattern
<SectionPanel title="Section" description="...">
  <BulletColumns items={...} />
</SectionPanel>
```

---

## Forms (shadcn + Afenda)

Follow upstream [`forms.md`](../../.agents/skills/shadcn/rules/forms.md):

- `FieldGroup` + `Field` — never `space-y-*` stacks
- `FieldSet` + `FieldLegend` for related checkboxes/radios
- Choice cards: `Field` inside `FieldLabel` + `RadioGroup` (not custom bordered divs)

Use `type-*` / `uiTypography` for copy — see token rule.

---

## Cards — when allowed

| OK | Not OK |
| -- | ------ |
| One `Card` per tile inside `BulletColumns` / indicator list | `Card` as page section wrapper |
| `Card` in playground/gallery demos | Multiple sibling `Card`s replacing `SectionPanel` |
| `Card` inside `DialogContent` for focused sub-task | `Card` nested inside another `CardContent` |
| Lynx / chat bubbles (feature-specific) | HR module `*-section.component.server.tsx` importing `Card` for layout |

Always use full structure when you use `Card`: `CardHeader` + `CardTitle` (+ optional `CardDescription`) + `CardContent` (+ optional `CardFooter`).

---

## Agent workflow

1. Read `apps/erp/components.json` — components live in `packages/ui/src`.
2. Run `pnpm dlx shadcn@latest info --json` from `apps/erp` when adding primitives.
3. Pick **shell** first (`SectionPanel` vs governed list vs dialog).
4. Pick **primitives** second (`FieldGroup`, `Empty`, …).
5. Run `pnpm design-system:check` before finishing UI work.

---

## Enforcement

| Script | Catches |
| ------ | ------- |
| `pnpm audit:shadcn-composition --strict` | `space-y`, raw `<button>`, excessive `Card`, nested cards, fake card divs |
| `pnpm audit:shadcn-primitives` | Description-slot drift in UI fork |
| `pnpm audit:governed-design-tokens --scope=all --strict` | Token bypass |

Bundled: `pnpm design-system:check`
