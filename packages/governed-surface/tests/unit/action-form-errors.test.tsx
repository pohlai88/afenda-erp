import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ActionFormErrors } from "../../src/components/action-form-errors";

describe("ActionFormErrors", () => {
  it("returns null for success or missing result", () => {
    expect(
      renderToStaticMarkup(
        <ActionFormErrors result={{ ok: true, data: undefined }} />,
      ),
    ).toBe("");
    expect(renderToStaticMarkup(<ActionFormErrors result={null} />)).toBe("");
  });

  it("defaults errorKind to business-rule and uses governed test id", () => {
    const html = renderToStaticMarkup(
      <ActionFormErrors
        result={{
          ok: false,
          error: "Something failed",
        }}
      />,
    );

    expect(html).toContain('data-action-error-kind="business-rule"');
    expect(html).toContain(
      'data-testid="governed:action-form-errors:business-rule"',
    );
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("data-action-error-code");
  });

  it("emits field error attributes and conditional error code", () => {
    const html = renderToStaticMarkup(
      <ActionFormErrors
        result={{
          ok: false,
          error: "Validation failed",
          code: "VALIDATION_FAILED",
          errorKind: "validation",
          fieldErrors: {
            email: "Invalid email",
            name: "",
          },
        }}
      />,
    );

    expect(html).toContain('data-action-error-kind="validation"');
    expect(html).toContain('data-action-error-code="VALIDATION_FAILED"');
    expect(html).toContain('data-field-error="email"');
    expect(html).not.toContain('data-field-error="name"');
    expect(html).toContain('aria-label="Field errors"');
  });
});
