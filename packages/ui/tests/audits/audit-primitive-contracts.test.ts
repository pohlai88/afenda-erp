import { describe, expect, it } from "vitest";

import { auditPrimitiveContractsFromCache } from "../../audits/audit-primitive-contracts";
import type { UiSourceFile } from "../../audits/source-cache";

function mockFile(fileName: string, content: string): UiSourceFile {
  return {
    path: `/fake/${fileName}`,
    fileName,
    rel: `packages/ui/src/${fileName}`,
    content,
    lines: content.split("\n"),
    fingerprint: null,
  };
}

describe("auditPrimitiveContractsFromCache", () => {
  it("flags missing required shadcn structure patterns", () => {
    const violations = auditPrimitiveContractsFromCache({
      files: [mockFile("button.tsx", "export function Button() { return null }")],
      shadcnByName: new Map(),
    });

    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: "missing-required-pattern",
        file: "packages/ui/src/button.tsx",
        severity: "error",
      }),
    );
  });

  it("passes when required patterns are present", () => {
    const content = `
import * as React from "react";
import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "../../src/utils";

const buttonVariants = cva("base");

function Button({ className }: React.ComponentProps<"button">) {
  return <Slot className={cn(buttonVariants(), className)} />;
}

export { Button, buttonVariants }
`;

    const violations = auditPrimitiveContractsFromCache({
      files: [mockFile("button.tsx", content)],
      shadcnByName: new Map(),
    });

    expect(
      violations.filter((v) => v.file === "packages/ui/src/button.tsx"),
    ).toEqual([]);
  });
});
