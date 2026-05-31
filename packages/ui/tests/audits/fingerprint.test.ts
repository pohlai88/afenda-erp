import { describe, expect, it } from "vitest";

import {
  compareFingerprints,
  fingerprintContent,
  type ShadcnFileFingerprint,
} from "../../audits/fingerprint.ts";

function emptyFingerprint(overrides: Partial<ShadcnFileFingerprint> = {}): ShadcnFileFingerprint {
  return {
    exports: [],
    rootFunctions: [],
    dataSlots: [],
    displayNames: [],
    hasCva: false,
    hasSlot: false,
    hasCn: false,
    hasReactImport: false,
    ...overrides,
  };
}

describe("fingerprintContent", () => {
  it("extracts exports and structure flags from primitive source", () => {
    const content = `
import * as React from "react";
import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva("base");

function Button({ className }: { className?: string }) {
  return <Slot className={cn(buttonVariants(), className)} />;
}
Button.displayName = "Button";

export { Button, buttonVariants }
`;

    expect(fingerprintContent(content)).toMatchObject({
      exports: ["Button", "buttonVariants"],
      rootFunctions: ["Button"],
      displayNames: ["Button"],
      hasCva: true,
      hasSlot: true,
      hasCn: true,
      hasReactImport: true,
    });
  });
});

describe("compareFingerprints", () => {
  it("flags removed exports as errors", () => {
    const current = emptyFingerprint({ exports: ["Button"] });
    const baseline = emptyFingerprint({ exports: ["Button", "buttonVariants"] });

    const violations = compareFingerprints("button.tsx", current, baseline);

    expect(violations).toContainEqual(
      expect.objectContaining({ rule: "export-removed", match: "buttonVariants" }),
    );
  });

  it("flags added exports as warnings", () => {
    const current = emptyFingerprint({ exports: ["Button", "buttonVariants"] });
    const baseline = emptyFingerprint({ exports: ["Button"] });

    const violations = compareFingerprints("button.tsx", current, baseline);

    expect(violations).toContainEqual(
      expect.objectContaining({ rule: "export-added", match: "buttonVariants" }),
    );
  });

  it("flags structure regression when cva disappears", () => {
    const current = emptyFingerprint({ hasCva: false, hasCn: true });
    const baseline = emptyFingerprint({ hasCva: true, hasCn: true });

    const violations = compareFingerprints("button.tsx", current, baseline);

    expect(violations).toContainEqual(
      expect.objectContaining({ rule: "structure-regressed", match: "cva(" }),
    );
  });
});
