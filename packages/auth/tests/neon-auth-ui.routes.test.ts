import { describe, expect, it } from "vitest";

import {
  erpAuthRouteToNeonUiAuthView,
  neonAuthUiAuthViews,
} from "../src/aut-neon-auth-ui-routes-shared";

describe("neon-auth-ui routes", () => {
  it("maps ERP auth ingress routes to Neon Auth UI view slugs", () => {
    expect(erpAuthRouteToNeonUiAuthView["/sign-in"]).toBe(neonAuthUiAuthViews.signIn);
    expect(erpAuthRouteToNeonUiAuthView["/sign-up"]).toBe(neonAuthUiAuthViews.signUp);
    expect(erpAuthRouteToNeonUiAuthView["/forgot-password"]).toBe(
      neonAuthUiAuthViews.forgotPassword,
    );
    expect(erpAuthRouteToNeonUiAuthView["/verify-email"]).toBe(neonAuthUiAuthViews.emailOtp);
    expect(erpAuthRouteToNeonUiAuthView["/callback"]).toBe(neonAuthUiAuthViews.callback);
    expect(erpAuthRouteToNeonUiAuthView["/sign-out"]).toBe(neonAuthUiAuthViews.signOut);
  });
});
