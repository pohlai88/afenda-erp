export type __IDENTIFIER__CoverageStatus = "scaffold-only" | "shipped";

export type __IDENTIFIER__CoverageEntry = {
  readonly code: string;
  readonly status: __IDENTIFIER__CoverageStatus;
  readonly evidence: readonly string[];
};

export const __CONSTANT_PREFIX___REQUIREMENT_COVERAGE = [
  {
    code: "TBD",
    status: "scaffold-only",
    evidence: ["__CAPABILITY_SLUG__-architecture.md"],
  },
] as const satisfies readonly __IDENTIFIER__CoverageEntry[];

export const __CONSTANT_PREFIX___ACCEPTANCE_CRITERIA_COVERAGE = [
  {
    code: "TBD",
    status: "scaffold-only",
    evidence: ["__CAPABILITY_SLUG__-architecture.md"],
  },
] as const satisfies readonly __IDENTIFIER__CoverageEntry[];

export function assert__IDENTIFIER__ScaffoldOnly(): void {
  const coverageRows: readonly __IDENTIFIER__CoverageEntry[] = [
    ...__CONSTANT_PREFIX___REQUIREMENT_COVERAGE,
    ...__CONSTANT_PREFIX___ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const claimedShipped = coverageRows.filter(
    (entry) => entry.status === "shipped",
  );

  if (claimedShipped.length > 0) {
    throw new Error(
      `__CAPABILITY_TITLE__ scaffold must not claim shipped coverage: ${claimedShipped.map((entry) => entry.code).join(", ")}`,
    );
  }
}
