import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GovernedSurface } from "../../src/gov-governed-heading.server";
import { governedHeadingId } from "../../src/gov-governed-identity-shared";

describe("GovernedSurface", () => {
  it("labels the surface by the module page header heading", () => {
    const html = renderToStaticMarkup(
      <GovernedSurface
        header={{ title: "Finance" }}
        surfaceKey="finance"
        componentKey="finance-overview"
      >
        <p>Body</p>
      </GovernedSurface>,
    );

    const headingId = governedHeadingId("page-header", "finance-overview-header");

    expect(html).toContain(`aria-labelledby="${headingId}"`);
    expect(html).toContain(`id="${headingId}"`);
  });

  it("emits governed diagnostics for actions, back link, and content", () => {
    const html = renderToStaticMarkup(
      <GovernedSurface
        header={{
          title: "Finance",
          backHref: "/workspace/finance",
          backLabel: "Back to finance",
        }}
        surfaceKey="finance"
        sectionKey="overview"
        componentKey="finance-overview"
        renderState="loading"
        actions={<button type="button">Export</button>}
      >
        <p>Body</p>
      </GovernedSurface>,
    );

    expect(html).toContain('aria-label="Page actions"');
    expect(html).toContain('data-testid="governed:surface-actions:finance-overview"');
    expect(html).toContain('data-component-key="finance-overview-actions"');
    expect(html).toContain('data-testid="governed:surface-back-link:finance-overview"');
    expect(html).toContain('data-testid="governed:surface-content:finance-overview"');
    expect(html).toContain('data-component-key="finance-overview-content"');
    expect(html).toContain('data-render-state="loading"');
  });
});
