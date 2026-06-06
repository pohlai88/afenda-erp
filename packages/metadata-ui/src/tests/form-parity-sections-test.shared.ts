import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  createFormSection,
  createTextField,
} from "../builders/form.builder";
import {
  createMultiStepForm,
  createMultiStepFormStep,
  appendMultiStepFormStep,
} from "../builders/multi-step-form.builder";
import {
  createScorecardCriterion,
  createScorecardForm,
  appendScorecardCriterion,
} from "../builders/scorecard-form.builder";

const SRC_ROOT = path.join(process.cwd(), "src");

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relativePath), "utf8");
}

describe("multi-step and scorecard form parity sections", () => {
  it("builds multi-step form metadata with active step and host-owned submit action", () => {
    const detailsSection = createFormSection({
      key: "metadata-ui.fixture.details",
      fields: [
        createTextField({
          key: "metadata-ui.fixture.name",
          name: "name",
          label: "Name",
          validation: {
            required: true,
            message: "Name is required.",
          },
        }),
      ],
    });
    const form = createMultiStepForm({
      key: "metadata-ui.fixture.multi-step",
      activeStepKey: "metadata-ui.fixture.step.details",
      steps: [
        createMultiStepFormStep({
          key: "metadata-ui.fixture.step.details",
          title: "Details",
          status: "active",
          order: 0,
          sections: [detailsSection],
        }),
      ],
      submitAction: {
        id: "metadata-ui.fixture.submit",
        label: "Submit",
        execution: {
          kind: "server-action",
          actionKey: "metadata-ui.fixture.submit",
        },
      },
    });
    const appendedForm = appendMultiStepFormStep(
      form,
      createMultiStepFormStep({
        key: "metadata-ui.fixture.step.review",
        title: "Review",
        status: "available",
        order: 1,
        sections: [detailsSection],
      }),
    );

    expect(form.activeStepKey).toBe("metadata-ui.fixture.step.details");
    expect(form.steps[0]?.sections[0]?.fields[0]?.label).toBe("Name");
    expect(form.submitAction?.execution.kind).toBe("server-action");
    expect(appendedForm.steps).toHaveLength(2);
    expect(appendedForm.activeStepKey).toBe("metadata-ui.fixture.step.details");
  });

  it("rejects unsafe multi-step form states", () => {
    const section = createFormSection({
      key: "metadata-ui.fixture.section",
      fields: [
        createTextField({
          key: "metadata-ui.fixture.field",
          name: "field",
          label: "Field",
        }),
      ],
    });

    expect(() =>
      createMultiStepFormStep({
        key: "metadata-ui.fixture.blocked-step",
        title: "Blocked",
        status: "blocked",
        order: 0,
        sections: [section],
      }),
    ).toThrow(/blocked/i);

    expect(() =>
      createMultiStepForm({
        key: "metadata-ui.fixture.invalid-active",
        activeStepKey: "metadata-ui.fixture.missing",
        steps: [
          {
            key: "metadata-ui.fixture.step",
            title: "Step",
            status: "available",
            order: 0,
            sections: [section],
          },
        ],
      }),
    ).toThrow(/activeStepKey/i);
  });

  it("builds scorecard metadata without owning scoring interpretation", () => {
    const scorecard = createScorecardForm({
      key: "metadata-ui.fixture.scorecard",
      state: "review",
      criteria: [
        createScorecardCriterion({
          key: "metadata-ui.fixture.quality",
          label: "Quality",
          required: true,
          selectedValue: "pass",
          options: [
            { value: "pass", label: "Pass", weight: 1 },
            { value: "fail", label: "Fail", weight: 0 },
          ],
        }),
        createScorecardCriterion({
          key: "metadata-ui.fixture.risk",
          label: "Risk",
          blockedReason: "Risk is decided by the host workflow.",
          options: [{ value: "review", label: "Review" }],
        }),
      ],
    });
    const appendedScorecard = appendScorecardCriterion(
      scorecard,
      createScorecardCriterion({
        key: "metadata-ui.fixture.quality-followup",
        label: "Quality follow-up",
        options: [{ value: "review", label: "Review" }],
      }),
    );

    expect(scorecard.criteria).toHaveLength(2);
    expect(scorecard.criteria[0]?.selectedValue).toBe("pass");
    expect(scorecard.criteria[1]?.blockedReason).toContain("host workflow");
    expect(appendedScorecard.criteria).toHaveLength(3);
    expect(appendedScorecard.key).toBe("metadata-ui.fixture.scorecard");
  });

  it("rejects unsafe scorecard criteria", () => {
    expect(() =>
      createScorecardCriterion({
        key: "metadata-ui.fixture.invalid-score",
        label: "Invalid",
        selectedValue: "missing",
        options: [{ value: "ok", label: "Ok" }],
      }),
    ).toThrow(/selectedValue/i);

    expect(() =>
      createScorecardCriterion({
        key: "metadata-ui.fixture.reason",
        label: "Reason",
        selectedValue: "fail",
        requireReasonWhenSelected: ["fail"],
        options: [{ value: "fail", label: "Fail" }],
      }),
    ).toThrow(/requires a reason/i);
  });

  it("registers the new sections without client-door leakage", () => {
    const rendererRegistrySource = readSource("registry/renderer-registry.server.ts");
    const capabilityRegistrySource = readSource(
      "registry/section-capability-registry.server.ts",
    );
    const indexSource = readSource("index.ts");
    const serverSource = readSource("server.ts");
    const clientSource = readSource("client.ts");

    expect(rendererRegistrySource).toContain("metadata-ui.renderer.multi-step-form");
    expect(rendererRegistrySource).toContain("metadata-ui.renderer.scorecard-form");
    expect(capabilityRegistrySource).toContain('"multi-step-form"');
    expect(capabilityRegistrySource).toContain('"scorecard-form"');
    expect(indexSource).toContain("multi-step-form.schema");
    expect(indexSource).toContain("scorecard-form.schema");
    expect(serverSource).toContain("multi-step-form-section.server");
    expect(serverSource).toContain("scorecard-form-section.server");
    expect(clientSource).not.toContain("multi-step-form");
    expect(clientSource).not.toContain("scorecard-form");
  });
});
