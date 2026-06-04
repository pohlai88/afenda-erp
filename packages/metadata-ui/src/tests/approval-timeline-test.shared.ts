import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  createApprovalFlowTimeline,
  createApprovalTimelineStep,
} from "../builders/approval-timeline.builder";
import { adaptLegacyApprovalTimelineToMetadataUi } from "../migration/approval-timeline-migration.shared";
import { safeParseMetadataUiApprovalTimeline } from "../schemas/approval-timeline.schema";

const PACKAGE_ROOT = process.cwd();
const SRC_ROOT = path.join(PACKAGE_ROOT, "src");

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relativePath), "utf8");
}

describe("approval timeline metadata parity", () => {
  it("builds bounded approval timelines with pending, approved, rejected, and blocked states", () => {
    const timeline = createApprovalFlowTimeline({
      key: "metadata-ui.fixture.approval",
      title: "Approval",
      currentStepKey: "metadata-ui.fixture.pending",
      steps: [
        createApprovalTimelineStep({
          key: "metadata-ui.fixture.approved",
          label: "Submitted",
          status: "approved",
          order: 0,
          actor: {
            actorId: "operator",
            actorType: "user",
            displayName: "Operator",
          },
          occurredAt: "2026-06-05T00:00:00.000Z",
          comment: "Ready for review.",
        }),
        createApprovalTimelineStep({
          key: "metadata-ui.fixture.pending",
          label: "Manager review",
          status: "pending",
          order: 1,
          dueAt: "2026-06-06T00:00:00.000Z",
        }),
        createApprovalTimelineStep({
          key: "metadata-ui.fixture.rejected",
          label: "Finance review",
          status: "rejected",
          order: 2,
          reason: "Budget is incomplete.",
        }),
        createApprovalTimelineStep({
          key: "metadata-ui.fixture.blocked",
          label: "Final posting",
          status: "blocked",
          order: 3,
          reason: "Period is locked by the host feature.",
        }),
      ],
    });

    expect(timeline.steps).toHaveLength(4);
    expect(timeline.currentStepKey).toBe("metadata-ui.fixture.pending");
    expect(timeline.steps.map((step) => step.status)).toEqual([
      "approved",
      "pending",
      "rejected",
      "blocked",
    ]);
  });

  it("rejects invalid approval timelines before renderer execution", () => {
    expect(() =>
      createApprovalTimelineStep({
        key: "metadata-ui.fixture.failed",
        label: "Failed",
        status: "failed",
        order: 0,
      }),
    ).toThrow(/must provide a reason/i);

    expect(() =>
      createApprovalFlowTimeline({
        key: "metadata-ui.fixture.invalid-current",
        currentStepKey: "metadata-ui.fixture.missing",
        steps: [
          createApprovalTimelineStep({
            key: "metadata-ui.fixture.only-step",
            label: "Only step",
            status: "pending",
            order: 0,
          }),
        ],
      }),
    ).toThrow(/currentStepKey/i);

    expect(() =>
      createApprovalFlowTimeline({
        key: "metadata-ui.fixture.duplicate",
        steps: [
          {
            key: "metadata-ui.fixture.same",
            label: "First",
            status: "pending",
            order: 0,
          },
          {
            key: "metadata-ui.fixture.same",
            label: "Second",
            status: "pending",
            order: 1,
          },
        ],
      }),
    ).toThrow(/unique/i);
  });

  it("keeps safe parsing fail-closed for zod-owned validation states", () => {
    const result = safeParseMetadataUiApprovalTimeline({
      key: "metadata-ui.fixture.safe",
      steps: [
        {
          key: "metadata-ui.fixture.rejected",
          label: "Rejected",
          status: "rejected",
          order: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("registers approval timeline through renderer and capability registries", () => {
    const rendererRegistrySource = readSource("registry/renderer-registry.server.ts");
    const capabilityRegistrySource = readSource(
      "registry/section-capability-registry.server.ts",
    );

    expect(rendererRegistrySource).toContain("metadata-ui.renderer.approval-timeline");
    expect(rendererRegistrySource).toContain('sectionKind: "approval-timeline"');
    expect(rendererRegistrySource).toContain(
      "sections/approval-timeline/approval-timeline-renderer.server",
    );
    expect(capabilityRegistrySource).toContain(
      '"approval-timeline": ["render", "audit"]',
    );
  });

  it("adapts legacy approval timeline config while keeping policy host-owned", () => {
    const result = adaptLegacyApprovalTimelineToMetadataUi({
      title: "Approval flow",
      currentStepId: "manager",
      policyDescription: "Manager then finance.",
      steps: [
        {
          id: "submit",
          label: "Submit",
          status: "approved",
          actorLabel: "Operator",
          occurredAt: "2026-06-05T00:00:00.000Z",
        },
        {
          id: "manager",
          label: "Manager",
          status: "pending",
          dueAt: "2026-06-06T00:00:00.000Z",
        },
      ],
    });

    expect(result.data.steps).toHaveLength(2);
    expect(result.data.currentStepKey).toBe("approval-timeline.manager");
    expect(result.data.steps[0]?.actor?.displayName).toBe("Operator");
    expect(result.parityNotes[0]).toMatchObject({
      sourceField: "policyDescription",
      disposition: "unsupported",
    });
  });

  it("keeps approval timeline adapters shared-runtime and policy free", () => {
    const migrationSource = readSource("migration/approval-timeline-migration.shared.ts");
    const schemaSource = readSource("schemas/approval-timeline.schema.ts");
    const rendererSource = readSource(
      "sections/approval-timeline/approval-timeline-renderer.server.tsx",
    );
    const indexSource = readSource("index.ts");
    const clientSource = readSource("client.ts");

    expect(migrationSource).not.toContain("@afenda/governed-surface");
    expect(migrationSource).not.toContain("@afenda/feature");
    expect(migrationSource).not.toContain("server-only");
    expect(migrationSource).not.toContain('"use client"');
    expect(schemaSource).not.toContain("@afenda/governed-surface");
    expect(rendererSource).toContain("server-only");
    expect(rendererSource).not.toContain("@afenda/feature");
    expect(indexSource).toContain("approval-timeline-migration.shared");
    expect(clientSource).not.toContain("approval-timeline");
  });
});
