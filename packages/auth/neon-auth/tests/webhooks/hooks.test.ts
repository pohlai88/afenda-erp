import { describe, expect, it, vi } from "vitest";
import {
  getNeonAuthWebhookHooks,
  registerNeonAuthWebhookHooks,
  resetNeonAuthWebhookHooksForTests,
} from "../../webhooks/hooks.server";

describe("neon-auth webhook hooks", () => {
  it("registers and returns hooks", () => {
    resetNeonAuthWebhookHooksForTests();
    const onUserCreated = vi.fn();
    registerNeonAuthWebhookHooks({ onUserCreated });
    expect(getNeonAuthWebhookHooks().onUserCreated).toBe(onUserCreated);
  });

  it("merges hooks on repeated registration", () => {
    resetNeonAuthWebhookHooksForTests();
    const onUserCreated = vi.fn();
    const onPhoneNumberVerified = vi.fn();
    registerNeonAuthWebhookHooks({ onUserCreated });
    registerNeonAuthWebhookHooks({ onPhoneNumberVerified });
    const hooks = getNeonAuthWebhookHooks();
    expect(hooks.onUserCreated).toBe(onUserCreated);
    expect(hooks.onPhoneNumberVerified).toBe(onPhoneNumberVerified);
  });

  it("resets hooks for tests", () => {
    resetNeonAuthWebhookHooksForTests();
    registerNeonAuthWebhookHooks({ onUserCreated: vi.fn() });
    resetNeonAuthWebhookHooksForTests();
    expect(getNeonAuthWebhookHooks()).toEqual({});
  });
});
