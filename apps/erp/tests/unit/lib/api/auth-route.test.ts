import { authApiRouteCopy } from "@afenda/kernel";
import { describe, expect, it } from "vitest";
import {
  getAuthRouteFailedResponse,
  getNeonAuthNotConfiguredResponse,
} from "@/lib/api/auth-route";

describe("auth route helpers", () => {
  it("returns neon-not-configured response copy", async () => {
    const response = getNeonAuthNotConfiguredResponse();

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toBe(
      authApiRouteCopy.neonNotConfigured,
    );
  });

  it("returns route-failed response copy", async () => {
    const response = getAuthRouteFailedResponse();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe(authApiRouteCopy.routeFailed);
  });
});
