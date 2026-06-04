import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ModulePageHeader } from "../../src/gov-module-page-header";

describe("ModulePageHeader", () => {
  it("omits eyebrow when not provided", () => {
    const html = renderToStaticMarkup(
      <ModulePageHeader title="Finance" surfaceKey="finance" />,
    );

    expect(html).not.toContain("ERP module");
    expect(html).toContain("Finance");
    expect(html).toContain('data-testid="governed:page-header:finance-page-header"');
  });

  it("renders eyebrow when provided", () => {
    const html = renderToStaticMarkup(
      <ModulePageHeader
        eyebrow="Ledger"
        title="Finance"
        surfaceKey="finance"
      />,
    );

    expect(html).toContain("Ledger");
  });
});
