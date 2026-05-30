import { describe, expect, it } from "vitest";

import {
  assertHrEmploymentStatusTransition,
  HrLifecycleCommandError,
} from "@afenda/db";

describe("assertHrEmploymentStatusTransition", () => {
  it("allows active to probation", () => {
    expect(() =>
      assertHrEmploymentStatusTransition("active", "probation"),
    ).not.toThrow();
  });

  it("blocks transitions from terminal separated status", () => {
    expect(() =>
      assertHrEmploymentStatusTransition("separated", "active"),
    ).toThrow(HrLifecycleCommandError);
  });

  it("blocks invalid active to archived direct transition", () => {
    expect(() =>
      assertHrEmploymentStatusTransition("active", "archived"),
    ).toThrow(HrLifecycleCommandError);
  });
});
