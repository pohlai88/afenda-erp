import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GovernedHeading } from "../../src/gov-governed-heading-shared";

describe("GovernedHeading", () => {
  it("renders the mapped semantic heading tag for each level", () => {
    expect(
      renderToStaticMarkup(
        <GovernedHeading level={1} id="page-title">
          Page
        </GovernedHeading>,
      ),
    ).toContain("<h1");
    expect(
      renderToStaticMarkup(
        <GovernedHeading level={2} id="section-title">
          Section
        </GovernedHeading>,
      ),
    ).toContain("<h2");
    expect(
      renderToStaticMarkup(
        <GovernedHeading level={6}>Fine print</GovernedHeading>,
      ),
    ).toContain("<h6");
  });

  it("applies governed typography variants", () => {
    expect(
      renderToStaticMarkup(
        <GovernedHeading level={1} variant="page">
          Page
        </GovernedHeading>,
      ),
    ).toContain('class="type-page-title"');

    expect(
      renderToStaticMarkup(
        <GovernedHeading level={2} variant="section">
          Section
        </GovernedHeading>,
      ),
    ).toContain('class="type-section-title"');

    expect(
      renderToStaticMarkup(
        <GovernedHeading level={3} variant="card">
          Card
        </GovernedHeading>,
      ),
    ).toContain('class="type-subtitle"');
  });

  it("forwards id and merges className with variant styles", () => {
    const html = renderToStaticMarkup(
      <GovernedHeading
        level={2}
        variant="section"
        id="governed-section-active-employees-title"
        className="tabular-nums"
      >
        Active employees
      </GovernedHeading>,
    );

    expect(html).toContain('id="governed-section-active-employees-title"');
    expect(html).toContain("type-section-title");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("Active employees");
  });
});
