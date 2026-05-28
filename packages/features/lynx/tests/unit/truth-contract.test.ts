import { describe, expect, it } from "vitest";
import {
  extractLynxTruthCitations,
  validateLynxTruthResponse,
} from "../../src/contracts/lynx.truth.contract";

const canonicalTruthResponse = [
  "### Answer",
  "Operators must review the finance exception before action [1].",
  "",
  "### Evidence used",
  "[1] Finance policy",
  "",
  "### Limitations",
  "Only indexed policy passages were checked.",
  "",
  "### Next safe action",
  "Open the evidence and ask a finance owner to validate it.",
].join("\n");

describe("Lynx truth contract", () => {
  it("validates the canonical ARCH-009 truth response shape", () => {
    const validation = validateLynxTruthResponse({
      text: canonicalTruthResponse,
      evidenceCount: 1,
    });

    expect(validation.hasRequiredSections).toBe(true);
    expect(validation.missingSections).toEqual([]);
    expect(validation.unexpectedSections).toEqual([]);
    expect(validation.duplicateSections).toEqual([]);
    expect(validation.sectionOrderValid).toBe(true);
    expect(validation.citedPassages).toEqual([1]);
    expect(validation.invalidCitations).toEqual([]);
    expect(validation.citationPrecision).toBe(1);
  });

  it("rejects the legacy colon-delimited truth response shape", () => {
    const validation = validateLynxTruthResponse({
      text: [
        "Answer: Operators must review evidence [1].",
        "Evidence: Finance policy.",
        "Limits: Only policy passages were checked.",
        "Next step: Review the exception.",
      ].join("\n"),
      evidenceCount: 1,
    });

    expect(validation.hasRequiredSections).toBe(false);
    expect(validation.missingSections).toEqual([
      "### Answer",
      "### Evidence used",
      "### Limitations",
      "### Next safe action",
    ]);
  });

  it("flags out-of-order or unexpected markdown sections", () => {
    const validation = validateLynxTruthResponse({
      text: [
        "### Answer",
        "The exception needs review [1].",
        "### Next safe action",
        "Open the exception.",
        "### Evidence used",
        "[1] Finance policy",
        "### Notes",
        "Extra commentary.",
        "### Limitations",
        "Only indexed passages were checked.",
      ].join("\n"),
      evidenceCount: 1,
    });

    expect(validation.hasRequiredSections).toBe(false);
    expect(validation.sectionOrderValid).toBe(false);
    expect(validation.unexpectedSections).toEqual(["### Notes"]);
  });

  it("rejects duplicate canonical sections", () => {
    const validation = validateLynxTruthResponse({
      text: [
        canonicalTruthResponse,
        "",
        "### Evidence used",
        "[1] Duplicate evidence.",
      ].join("\n"),
      evidenceCount: 1,
    });

    expect(validation.hasRequiredSections).toBe(false);
    expect(validation.duplicateSections).toEqual(["### Evidence used"]);
  });

  it("extracts unique citation numbers in ascending order", () => {
    expect(extractLynxTruthCitations("[3] [1] [3] [2]")).toEqual([1, 2, 3]);
  });

  it("requires degraded retrieval to be named in limitations", () => {
    const validation = validateLynxTruthResponse({
      text: canonicalTruthResponse,
      evidenceCount: 1,
      retrievalStatus: "degraded",
    });

    expect(validation.hasRequiredSections).toBe(false);
    expect(validation.degradedLimitationsValid).toBe(false);
  });

  it("accepts degraded retrieval when limitations disclose the partial failure", () => {
    const validation = validateLynxTruthResponse({
      text: [
        "### Answer",
        "Operators must review the finance exception before action [1].",
        "",
        "### Evidence used",
        "[1] Finance policy",
        "",
        "### Limitations",
        "Evidence retrieval was degraded, so only partial indexed passages were checked.",
        "",
        "### Next safe action",
        "Open the evidence and ask a finance owner to validate it.",
      ].join("\n"),
      evidenceCount: 1,
      retrievalStatus: "degraded",
    });

    expect(validation.hasRequiredSections).toBe(true);
    expect(validation.degradedLimitationsValid).toBe(true);
  });
});
