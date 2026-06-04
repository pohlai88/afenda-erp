import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GovernedAuditPanel } from "../../src/gov-governed-audit-panel";

const validRow = {
  id: "evt-1",
  action: "UPDATE",
  occurredAt: "2026-01-15T10:00:00.000Z",
  actorLabel: "Alex Operator",
  resourceLabel: "Employee",
  narrative: "Updated department",
  href: "/hr/records/rec-1",
  evidenceHref: "/hr/records/rec-1/audit/evt-1",
};

describe("GovernedAuditPanel", () => {
  it("renders invalid state with diagnostics when model fails validation", () => {
    const html = renderToStaticMarkup(
      <GovernedAuditPanel
        model={{
          dataNature: "audit-trail",
          headerTitle: "Audit",
          rows: [
            {
              ...validRow,
              occurredAt: "not-a-datetime",
            },
          ],
        }}
        surfaceKey="hr.records.audit"
        componentKey="employee-audit"
      />,
    );

    expect(html).toContain('data-render-state="invalid"');
    expect(html).toContain('data-surface-key="hr.records.audit"');
    expect(html).toContain('data-component-key="employee-audit"');
    expect(html).toContain('data-component-type="governed:audit-panel"');
    expect(html).toContain('data-empty-id="audit-panel-invalid"');
  });

  it("resolves componentKey from sectionKey before surfaceKey", () => {
    const html = renderToStaticMarkup(
      <GovernedAuditPanel
        model={{
          dataNature: "audit-trail",
          headerTitle: "Audit",
          rows: [],
        }}
        surfaceKey="hrm.employee-directory"
        sectionKey="recent-activity"
      />,
    );

    expect(html).toContain('data-component-key="recent-activity"');
    expect(html).toContain('id="governed-audit-panel-recent-activity"');
  });

  it("renders empty state diagnostics and governed heading", () => {
    const html = renderToStaticMarkup(
      <GovernedAuditPanel
        model={{
          dataNature: "audit-trail",
          headerTitle: "Recent activity",
          headerDescription: "Last 30 days",
          rows: [],
        }}
        componentKey="recent-activity"
      />,
    );

    expect(html).toContain('data-render-state="empty"');
    expect(html).toContain('data-empty-id="audit-panel-empty"');
    expect(html).toContain('class="type-subtitle sr-only"');
  });

  it("renders governed table, row, and evidence diagnostics", () => {
    const html = renderToStaticMarkup(
      <GovernedAuditPanel
        model={{
          dataNature: "audit-trail",
          headerTitle: "Recent activity",
          headerDescription: "Last 30 days",
          rows: [validRow],
        }}
        surfaceKey="hr.records.audit"
        componentKey="employee-audit"
      />,
    );

    expect(html).toContain('data-render-state="ready"');
    expect(html).toContain('data-component-type="governed:audit-panel"');
    expect(html).toContain('data-testid="governed:audit-panel-table:employee-audit"');
    expect(html).toContain('data-audit-row-id="evt-1"');
    expect(html).toContain('data-audit-tone="default"');
    expect(html).toContain('data-testid="governed:audit-action:evt-1"');
    expect(html).toContain('data-testid="governed:audit-evidence:evt-1"');
    expect(html).toContain('href="/hr/records/rec-1"');
    expect(html).toContain('aria-describedby="governed-audit-panel-employee-audit-description"');
    expect(html).toContain("When");
    expect(html).toContain("Evidence");
  });
});
