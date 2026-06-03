import { describe, expect, it } from "vitest";

import { erpNeonAuthLegacyPathRedirects, erpNeonAuthUiBasePath } from "../../contracts/paths.shared";
import { resolveNeonAuthUiProviderOptions } from "../../ui/neon-auth-ui.config.shared";

describe("neon-auth-ui provider config", () => {
  it("uses flat ERP auth routes instead of Neon quickstart /auth prefix", () => {
    expect(erpNeonAuthUiBasePath).toBe("");
    expect(resolveNeonAuthUiProviderOptions().basePath).toBe("");
  });

  it("maps legacy /auth/* quickstart URLs to flat ERP routes", () => {
    expect(erpNeonAuthLegacyPathRedirects).toContainEqual({
      source: "/auth/sign-up",
      destination: "/sign-up",
    });
    expect(erpNeonAuthLegacyPathRedirects).toContainEqual({
      source: "/auth/email-otp",
      destination: "/verify-email",
    });
  });
});
