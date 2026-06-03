import { describe, expect, it } from "vitest";
import { isNeonEmailResetAvailable } from "../../src/plugins/recovery/client";

describe("neon-auth recovery client", () => {
  it("exports recovery helpers", () => {
    expect(typeof isNeonEmailResetAvailable).toBe("function");
  });
});
