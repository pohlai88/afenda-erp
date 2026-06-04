import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getNeonAuthWebhookHooks,
  registerNeonAuthWebhookHooks,
  resetNeonAuthWebhookHooksForTests,
} from "../src/aut-hooks-server";

describe("registerNeonAuthWebhookHooks", () => {
  it("merges hook handlers", () => {
    resetNeonAuthWebhookHooksForTests();
    const onUserCreated = vi.fn();
    registerNeonAuthWebhookHooks({ onUserCreated });
    expect(getNeonAuthWebhookHooks().onUserCreated).toBe(onUserCreated);
  });
});
