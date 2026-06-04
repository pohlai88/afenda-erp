import { describe, expect, it } from "vitest";
import {
  authPageMetadataCopy,
  authShellCopy,
  devSignInCopy,
  getAuthPageMetadataCopy,
  getNeonAuthFormModeCopy,
  neonAuthFormCopy,
  uploadRouteCopy,
} from "../../src/ker-auth-route-copy";

describe("auth route copy metadata", () => {
  it("exposes auth shell hero copy", () => {
    expect(authShellCopy.hero.bullets).toHaveLength(3);
    expect(authShellCopy.hero.eyebrow).toBe("Afenda ERP");
  });

  it("returns page metadata by key", () => {
    expect(getAuthPageMetadataCopy("signIn").title).toBe("Sign in");
    expect(authPageMetadataCopy.onboarding.description).toContain(
      "organization workspace",
    );
  });

  it("returns neon auth mode copy", () => {
    expect(getNeonAuthFormModeCopy("sign-in").title).toBe(
      "Sign in to your workspace",
    );
    expect(getNeonAuthFormModeCopy("sign-up").button).toBe("Create account");
    expect(neonAuthFormCopy.googleButton).toBe("Continue with Google");
  });

  it("exposes dev sign-in and upload route messages", () => {
    expect(devSignInCopy.submitLabel).toBe("Continue to dashboard");
    expect(uploadRouteCopy.uploadNotAllowed).toBe(
      "Document upload is not allowed.",
    );
  });
});
