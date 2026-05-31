/**
 * Single-pass orchestrator for all contract-drift layers.
 */
import { performance } from "node:perf_hooks";

import { auditShadcnUpstreamFromCache } from "./audit-shadcn-boundary";
import { auditPrimitiveContractsFromCache } from "./audit-primitive-contracts";
import { auditTokenDriftFromCache } from "./audit-token-drift";
import { auditVisualBehavior } from "./audit-visual-behavior";
import { loadUpstreamManifestState } from "./load-manifest";
import { loadUiSourceCache, type UiSourceCache } from "./source-cache";
import type { AuditViolation } from "./shared";

export type AuditLayerResult = {
  title: string;
  violations: AuditViolation[];
  ms: number;
};

export type AuditRunResult = {
  cache: UiSourceCache;
  layers: AuditLayerResult[];
};

export function runAllUiAudits(options?: {
  strictVisual?: boolean;
  profile?: boolean;
}): AuditRunResult {
  const t0 = performance.now();
  const cache = loadUiSourceCache();
  const manifestState = loadUpstreamManifestState();
  const loadMs = performance.now() - t0;

  const layers: AuditLayerResult[] = [];

  const runLayer = (title: string, fn: () => AuditViolation[]) => {
    const start = performance.now();
    const violations = fn();
    layers.push({ title, violations, ms: performance.now() - start });
  };

  runLayer("1. Shadcn upstream drift", () =>
    auditShadcnUpstreamFromCache(cache, manifestState),
  );
  runLayer("2. Token drift", () => auditTokenDriftFromCache(cache));
  runLayer("3. Primitive contract drift", () => auditPrimitiveContractsFromCache(cache));
  runLayer("4. Visual behavior scaffold", () =>
    auditVisualBehavior({ strict: options?.strictVisual }),
  );

  if (options?.profile) {
    layers.unshift({
      title: "0. Source load",
      violations: [],
      ms: loadMs,
    });
  }

  return { cache, layers };
}
