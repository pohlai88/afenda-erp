import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  renderGovernedPatternSectionShell,
} from "../../src/gov-governed-pattern-section-shell-shared";
import type { GovernedSurfaceSectionCardBody } from "../../src/gov-governed-surface-section-card";

describe("renderGovernedPatternSectionShell", () => {
  const readyBody: GovernedSurfaceSectionCardBody = {
    state: "ready",
    children: <p>Section body</p>,
  };

  it("suppresses card title chrome in embedded layout", () => {
    const html = renderToStaticMarkup(
      renderGovernedPatternSectionShell({
        layout: "embedded",
        surfaceKey: "finance",
        sectionKey: "records",
        title: "Hidden title",
        description: "Hidden description",
        body: readyBody,
      }),
    );

    expect(html).toContain("Section body");
    expect(html).not.toContain("Hidden title");
    expect(html).not.toContain("Hidden description");
    expect(html).not.toContain("data-slot=\"card-title\"");
  });

  it("renders card title chrome in card layout", () => {
    const html = renderToStaticMarkup(
      renderGovernedPatternSectionShell({
        layout: "card",
        surfaceKey: "finance",
        sectionKey: "records",
        title: "Visible title",
        body: readyBody,
      }),
    );

    expect(html).toContain("Visible title");
    expect(html).toContain("Section body");
  });

  it("maps compact density to Card size sm", () => {
    const html = renderToStaticMarkup(
      renderGovernedPatternSectionShell({
        layout: "card",
        density: "compact",
        surfaceKey: "finance",
        sectionKey: "records",
        title: "Compact section",
        body: readyBody,
      }),
    );

    expect(html).toContain('data-size="sm"');
  });

  it("emits identity and diagnostics when surfaceKey is provided", () => {
    const html = renderToStaticMarkup(
      renderGovernedPatternSectionShell({
        layout: "card",
        surfaceKey: "hr.records",
        sectionKey: "hr.records",
        title: "Records",
        body: readyBody,
      }),
    );

    expect(html).toContain('data-surface-key="hr.records"');
    expect(html).toContain('data-section-key="hr.records"');
    expect(html).toContain('data-component-key="hr.records"');
    expect(html).toContain('data-render-state="ready"');
    expect(html).toContain('data-testid="governed:pattern-section:hr.records"');
    expect(html).toContain('data-testid="governed:section-card:hr.records-card"');
  });

  it("emits governed identity and diagnostics for embedded body content", () => {
    const html = renderToStaticMarkup(
      renderGovernedPatternSectionShell({
        layout: "embedded",
        surfaceKey: "hr.records",
        sectionKey: "hr.records",
        componentKey: "records-list",
        title: "Records",
        body: readyBody,
      }),
    );

    expect(html).toContain('id="pattern-section-records-list"');
    expect(html).toContain('data-component-key="records-list"');
    expect(html).toContain('data-component-key="records-list-body"');
    expect(html).toContain('data-testid="governed:pattern-section:records-list"');
    expect(html).toContain('data-testid="governed:pattern-section-body:records-list"');
  });
});
