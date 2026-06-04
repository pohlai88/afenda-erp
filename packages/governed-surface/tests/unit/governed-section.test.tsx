import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GovernedSection } from "../../src/gov-governed-section";

describe("GovernedSection", () => {
  it("emits identity and diagnostics when surfaceKey is provided", () => {
    const html = renderToStaticMarkup(
      <GovernedSection
        title="Records"
        description="Module records"
        surfaceKey="finance.records"
        sectionKey="finance.records"
      >
        <p>Body</p>
      </GovernedSection>,
    );

    expect(html).toContain('data-surface-key="finance.records"');
    expect(html).toContain('data-section-key="finance.records"');
    expect(html).toContain('data-render-state="ready"');
    expect(html).toContain('data-testid="governed:section:finance.records"');
    expect(html).toContain("Records");
  });
});
