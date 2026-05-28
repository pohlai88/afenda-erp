import { describe, expect, it } from "vitest";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { buildMembersListSurface } from "../../src/identity/surfaces";
import {
  buildApiCredentialsListSurface,
  buildWebhooksListSurface,
} from "../../src/integrations/surfaces";
import {
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
} from "../../src/machine-layer/surfaces";

describe("system admin governed surfaces", () => {
  it("normalizes empty pagination to schema-safe server windows", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildMembersListSurface({ members: [] }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pagination?.pageSize).toBe(1);
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe(
        "membersQ",
      );
    }
  });

  it("adds governed trailing actions for mutable row commands", () => {
    const credentials = parseListSurfaceRendererConfiguration(
      buildApiCredentialsListSurface({
        canMutate: true,
        credentials: [
          {
            id: "cred_1",
            label: "Primary",
            keyPrefix: "afk_live_01",
            scopes: ["erp.read"],
            status: "active",
            lastUsedAt: null,
          },
        ],
      }),
    );

    expect(credentials.success).toBe(true);
    if (credentials.success) {
      expect(credentials.data.rows[0]?.trailingAction?.state).toBe("ready");
      expect(
        credentials.data.rows[0]?.trailingAction?.descriptor?.confirm,
      ).toEqual(definedConfirm);
    }
  });

  it("exposes enable/disable trailing actions for webhooks when mutable", () => {
    const webhooks = parseListSurfaceRendererConfiguration(
      buildWebhooksListSurface({
        canMutate: true,
        webhooks: [
          {
            id: "wh_1",
            label: "Primary",
            url: "https://example.com/hooks",
            status: "enabled",
            eventFilters: ["tenant.webhook.created"],
          },
        ],
      }),
    );

    expect(webhooks.success).toBe(true);
    if (webhooks.success) {
      expect(webhooks.data.rows[0]?.trailingAction?.state).toBe("ready");
      expect(webhooks.data.rows[0]?.trailingAction?.descriptor?.label).toBe(
        "Disable",
      );
    }
  });

  it("uses machine-layer labels on admin machine surfaces", () => {
    const usage = parseListSurfaceRendererConfiguration(
      buildSystemAdminAiUsageListSurface({ events: [] }),
    );
    const sandboxes = parseListSurfaceRendererConfiguration(
      buildSystemAdminAiSandboxesListSurface({
        sandboxes: [],
        canMutate: false,
      }),
    );

    expect(usage.success).toBe(true);
    expect(sandboxes.success).toBe(true);
    if (usage.success && sandboxes.success) {
      expect(usage.data.surface.header?.title).toBe("Machine usage ledger");
      expect(sandboxes.data.surface.header?.title).toBe("Lynx action sandboxes");
    }
  });
});

const definedConfirm = expect.objectContaining({
  title: "Revoke API credential",
});
