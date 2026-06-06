import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  parseMetadataUiPermissionContract,
  safeParseMetadataUiPermissionContract,
} from "../contracts/permission.contract";
import { resolveMetadataUiPermission } from "../security/permission-resolver.server";

describe("@afenda/metadata-ui permission contract", () => {
  it("defaults to a hidden failure surface and trims normalized fields", () => {
    const permission = parseMetadataUiPermissionContract({
      requirements: [
        {
          capability: " finance.close.read ",
        },
      ],
    });

    expect(permission.operator).toBe("all");
    expect(permission.requirements).toEqual([
      {
        capability: "finance.close.read",
        effect: "allow",
      },
    ]);
    expect(permission.failure).toEqual({
      visibility: "hidden",
    });
  });

  it("requires explicit content for visible and disabled failure states", () => {
    const visiblePermission = parseMetadataUiPermissionContract({
      requirements: [
        {
          capability: "finance.close.approve",
        },
      ],
      failure: {
        visibility: "visible",
        title: "Approval required",
        description: "A finance approver must review this action.",
      },
    });

    expect(visiblePermission.failure).toEqual({
      visibility: "visible",
      title: "Approval required",
      description: "A finance approver must review this action.",
    });

    expect(
      safeParseMetadataUiPermissionContract({
        requirements: [
          {
            capability: "finance.close.approve",
          },
        ],
        failure: {
          visibility: "visible",
        },
      }).success,
    ).toBe(false);

    expect(
      safeParseMetadataUiPermissionContract({
        requirements: [
          {
            capability: "finance.close.approve",
          },
        ],
        failure: {
          visibility: "hidden",
          title: "Hidden copy is not allowed",
        },
      }).success,
    ).toBe(false);
  });

  it("propagates the failure surface through permission resolution", () => {
    const permission = parseMetadataUiPermissionContract({
      requirements: [
        {
          capability: "finance.close.publish",
        },
      ],
      failure: {
        visibility: "disabled",
        title: "Publishing disabled",
        description: "This surface is read-only in the current mode.",
      },
    });

    const denied = resolveMetadataUiPermission(permission, {
      capabilities: [],
    });

    expect(denied).toMatchObject({
      allowed: false,
      visibility: "disabled",
      failure: {
        visibility: "disabled",
        title: "Publishing disabled",
        description: "This surface is read-only in the current mode.",
      },
    });

    expect(resolveMetadataUiPermission(undefined)).toMatchObject({
      allowed: true,
      visibility: "visible",
      failure: {
        visibility: "hidden",
      },
    });
  });
});
