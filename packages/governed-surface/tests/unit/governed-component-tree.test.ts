/**
 * Tests for GovernedComponentTree error paths (ADR-0025 §3).
 *
 * The discriminated component schema validates both `type` and `configuration`
 * strictly, so dataNature mismatch and "unregistered" paths are exercised via
 * custom registries — the defense-in-depth scenario they protect against.
 */
import { describe, expect, it } from "vitest";

import { GovernedComponentTree } from "../../src/metadata/governed-component-tree";
import type { AfendaGovernedComponentRegistry } from "../../src/metadata/registry";
import { GOVERNED_METADATA_SCHEMA_VERSION } from "../../src/schemas/schema-version.shared";

// Helper: extract the `model` prop from a GovernedEmpty element.
function getEmptyModel(
  node: unknown,
): { variant: string; description?: string } | null {
  if (node == null || typeof node !== "object") return null;
  const el = node as { props?: Record<string, unknown> };
  const model = el.props?.["model"] as
    | { variant?: string; description?: string }
    | undefined;
  if (!model) return null;
  return { variant: model.variant ?? "", description: model.description };
}

// Minimal valid stat-card configuration (dataNature defaults to "kpi" in schema).
const VALID_STAT_CARD_CONFIG = {
  __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
  stats: [{ label: "Open items", value: "12", tone: "default" as const }],
};

// Minimal valid section configuration (children is required).
const VALID_SECTION_CONFIG = {
  children: [
    {
      type: "governed:empty",
      serverType: "governed:empty",
      configuration: { variant: "muted", title: "Empty" },
    },
  ],
};

describe("GovernedComponentTree — error paths", () => {
  it("returns an error empty state when the component payload fails parse", () => {
    const node = GovernedComponentTree({ component: { type: 123 } });
    const model = getEmptyModel(node);
    expect(model?.variant).toBe("error");
  });

  it("returns a muted empty state for an unregistered type via custom registry", () => {
    // Pass an empty registry so the tree cannot resolve any renderer.
    const node = GovernedComponentTree({
      component: {
        type: "governed:section",
        serverType: "governed:section",
        configuration: VALID_SECTION_CONFIG,
      },
      registry: {} as AfendaGovernedComponentRegistry,
    });
    const model = getEmptyModel(node);
    expect(model?.variant).toBe("muted");
  });

  it("returns an error empty state when dataNature is missing for a renderer that requires it", () => {
    // Route a governed:section (no dataNature in config) to the "stat-card" renderer
    // which requires dataNature. This simulates a custom registry misconfiguration.
    const customRegistry = {
      "governed:section": "stat-card",
    } as unknown as AfendaGovernedComponentRegistry;

    const node = GovernedComponentTree({
      component: {
        type: "governed:section",
        serverType: "governed:section",
        configuration: VALID_SECTION_CONFIG,
      },
      registry: customRegistry,
    });
    const model = getEmptyModel(node);
    expect(model?.variant).toBe("error");
  });

  it("returns an error empty state when dataNature mismatches the renderer contract", () => {
    // Route a governed:stat-card (dataNature: "kpi") to the "list-surface" renderer
    // which only accepts "table" / "document-lines".
    const customRegistry = {
      "governed:stat-card": "list-surface",
    } as unknown as AfendaGovernedComponentRegistry;

    const node = GovernedComponentTree({
      component: {
        type: "governed:stat-card",
        serverType: "governed:stat-card",
        configuration: VALID_STAT_CARD_CONFIG,
      },
      registry: customRegistry,
    });
    const model = getEmptyModel(node);
    expect(model?.variant).toBe("error");
  });

  it("reveals renderer id and dataNature in the error description for operator diagnostics", () => {
    const customRegistry = {
      "governed:stat-card": "list-surface",
    } as unknown as AfendaGovernedComponentRegistry;

    const node = GovernedComponentTree({
      component: {
        type: "governed:stat-card",
        serverType: "governed:stat-card",
        configuration: VALID_STAT_CARD_CONFIG,
      },
      registry: customRegistry,
      diagnostics: "operator",
    });
    const model = getEmptyModel(node);
    expect(model?.variant).toBe("error");
    expect(model?.description).toContain("list-surface");
    expect(model?.description).toContain("kpi");
  });

  it("hides internal details in user-facing error copy", () => {
    const customRegistry = {
      "governed:stat-card": "list-surface",
    } as unknown as AfendaGovernedComponentRegistry;

    const node = GovernedComponentTree({
      component: {
        type: "governed:stat-card",
        serverType: "governed:stat-card",
        configuration: VALID_STAT_CARD_CONFIG,
      },
      registry: customRegistry,
      diagnostics: "user",
    });
    const model = getEmptyModel(node);
    expect(model?.variant).toBe("error");
    // User copy must not leak renderer internals.
    expect(model?.description).not.toContain("list-surface");
    expect(model?.description).not.toContain("kpi");
  });

  it("skips the dataNature check for container renderers (acceptedNatures: [])", () => {
    // governed:section → section renderer has acceptedNatures: [].
    // No dataNature in configuration — should NOT return an error variant.
    const node = GovernedComponentTree({
      component: {
        type: "governed:section",
        serverType: "governed:section",
        configuration: VALID_SECTION_CONFIG,
      },
    });
    const model = getEmptyModel(node);
    // Should not be a GovernedEmpty error from the dataNature check.
    expect(model?.variant).not.toBe("error");
  });
});
