import { describe, expect, it } from "vitest";
import {
  evaluatePasswordPolicy,
  isPasswordPolicySatisfied,
  normalizeAuthError,
  resolveAuthMethodReadiness,
} from "../../src/index";

describe("enterprise auth password policy", () => {
  it("requires length, case, number, and symbol", () => {
    expect(isPasswordPolicySatisfied("password")).toBe(false);
    expect(isPasswordPolicySatisfied("Password1!")).toBe(true);
  });

  it("reports live requirement state", () => {
    expect(
      evaluatePasswordPolicy("Password1!").every(
        (requirement) => requirement.met,
      ),
    ).toBe(true);
    expect(
      evaluatePasswordPolicy("password").filter(
        (requirement) => !requirement.met,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "uppercase" }),
        expect.objectContaining({ key: "number" }),
        expect.objectContaining({ key: "symbol" }),
      ]),
    );
  });
});

describe("enterprise auth error normalization", () => {
  it("maps raw provider errors to governed categories", () => {
    expect(normalizeAuthError({ message: "Invalid credentials" })).toBe(
      "invalid_credentials",
    );
    expect(normalizeAuthError({ message: "TOO_MANY_ATTEMPTS" })).toBe(
      "too_many_attempts",
    );
    expect(normalizeAuthError({ message: "Provider is not configured" })).toBe(
      "provider_not_configured",
    );
    expect(normalizeAuthError(new Error("fetch failed"))).toBe(
      "network_unavailable",
    );
  });
});

describe("enterprise auth method readiness", () => {
  it("hides optional methods until branch readiness is explicit", () => {
    const readiness = resolveAuthMethodReadiness({
      neonAuthReady: true,
      devCookieAuthEnabled: false,
      env: {},
    }).methods;

    expect(readiness.password).toBe(true);
    expect(readiness.forgotPassword).toBe(true);
    expect(readiness.emailVerification).toBe(true);
    expect(readiness.google).toBe(false);
    expect(readiness.emailOtp).toBe(false);
    expect(readiness.magicLink).toBe(false);
    expect(readiness.devAccess).toBe(false);
  });

  it("enables optional methods only with provider and delivery readiness", () => {
    const readiness = resolveAuthMethodReadiness({
      neonAuthReady: true,
      devCookieAuthEnabled: false,
      env: {
        AFENDA_AUTH_EMAIL_DELIVERY_READY: "1",
        AFENDA_AUTH_EMAIL_OTP_ENABLED: "1",
        AFENDA_AUTH_GOOGLE_ENABLED: "1",
        AFENDA_AUTH_MAGIC_LINK_ENABLED: "1",
      },
    }).methods;

    expect(readiness.google).toBe(true);
    expect(readiness.emailOtp).toBe(true);
    expect(readiness.magicLink).toBe(true);
  });

  it("marks dev access only when Neon is not ready", () => {
    expect(
      resolveAuthMethodReadiness({
        neonAuthReady: false,
        devCookieAuthEnabled: true,
        env: {},
      }).methods.devAccess,
    ).toBe(true);
  });
});
