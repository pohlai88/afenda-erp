import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  renderGovernedPatternSectionShell,
} from "../../src/components/governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "../../src/components/governed-surface-section-card";

describe("renderGovernedPatternSectionShell", () => {
  const readyBody: GovernedSurfaceSectionCardBody = {
    state: "ready",
    children: <p>Section body</p>,
  };

  it("suppresses card title chrome in embedded layout", () => {
    const html = renderToStaticMarkup(
      renderGovernedPatternSectionShell({
        layout: "embedded",
        sectionTestId: "test-section",
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
        sectionTestId: "test-section",
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
        sectionTestId: "test-section",
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
        sectionTestId: "governed:list-section:hr.records",
        surfaceKey: "hr.records",
        title: "Records",
        body: readyBody,
      }),
    );

    expect(html).toContain('data-surface-key="hr.records"');
    expect(html).toContain('data-section-key="hr.records"');
    expect(html).toContain('data-component-key="hr.records"');
    expect(html).toContain('data-render-state="ready"');
    expect(html).toContain('data-testid="governed:list-section:hr.records"');
    expect(html.match(/data-surface-key="hr.records"/g)).toHaveLength(1);
  });
});
