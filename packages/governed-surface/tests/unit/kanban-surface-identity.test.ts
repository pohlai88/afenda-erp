import { describe, expect, it } from "vitest";

import {
  buildKanbanBoardDataAttributes,
  buildKanbanSectionDataAttributes,
  governedKanbanBoardTestId,
  governedKanbanCardTestId,
  governedKanbanSectionTestId,
} from "../../src/kanban-surface-identity.shared";

describe("kanban-surface-identity", () => {
  it("emits canonical test ids", () => {
    expect(governedKanbanSectionTestId("hr.pipeline")).toBe(
      "governed:kanban-section:hr.pipeline",
    );
    expect(governedKanbanBoardTestId("hr.pipeline")).toBe(
      "governed:kanban-board:hr.pipeline",
    );
    expect(governedKanbanCardTestId("hr.pipeline", "card-1")).toBe(
      "governed:kanban-card:hr.pipeline:card-1",
    );
  });

  it("buildKanbanBoardDataAttributes merges legacy and canonical attrs", () => {
    const attrs = buildKanbanBoardDataAttributes({
      surfaceKey: "hr.pipeline",
      sectionKey: "candidate-pipeline",
      componentKey: "pipeline-board",
      state: "ready",
    });

    expect(attrs["data-governed-surface-key"]).toBe("hr.pipeline");
    expect(attrs["data-surface-key"]).toBe("hr.pipeline");
    expect(attrs["data-section-key"]).toBe("candidate-pipeline");
    expect(attrs["data-component-key"]).toBe("pipeline-board");
    expect(attrs["data-render-state"]).toBe("ready");
    expect(attrs["data-testid"]).toBe("governed:kanban-board:hr.pipeline");
  });

  it("buildKanbanSectionDataAttributes emits invalid state", () => {
    const attrs = buildKanbanSectionDataAttributes({
      surfaceKey: "hr.pipeline",
      sectionKey: "candidate-pipeline",
      componentKey: "pipeline-section",
      state: "invalid",
    });

    expect(attrs["data-section-key"]).toBe("candidate-pipeline");
    expect(attrs["data-component-key"]).toBe("pipeline-section");
    expect(attrs["data-render-state"]).toBe("invalid");
    expect(attrs["data-testid"]).toBe("governed:kanban-section:hr.pipeline");
  });
});
