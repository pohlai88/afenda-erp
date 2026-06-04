import type { AuditDiff } from "./ker-execution-audit-types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

function isEqual(left: unknown, right: unknown) {
  return Object.is(left, right);
}

function joinPath(base: string, key: string) {
  return base ? `${base}.${key}` : key;
}

function diffValues(
  before: unknown,
  after: unknown,
  path: string,
  diffs: AuditDiff[],
) {
  if (isEqual(before, after)) {
    return;
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index += 1) {
      const nextPath = joinPath(path, `[${index}]`);
      if (index >= before.length) {
        diffs.push({
          path: nextPath,
          change: "added",
          after: after[index],
        });
        continue;
      }

      if (index >= after.length) {
        diffs.push({
          path: nextPath,
          change: "removed",
          before: before[index],
        });
        continue;
      }

      diffValues(before[index], after[index], nextPath, diffs);
    }
    return;
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of keys) {
      const nextPath = joinPath(path, key);

      if (!(key in before)) {
        diffs.push({
          path: nextPath,
          change: "added",
          after: after[key],
        });
        continue;
      }

      if (!(key in after)) {
        diffs.push({
          path: nextPath,
          change: "removed",
          before: before[key],
        });
        continue;
      }

      diffValues(before[key], after[key], nextPath, diffs);
    }
    return;
  }

  diffs.push({
    path,
    change: before === undefined ? "added" : after === undefined ? "removed" : "changed",
    before,
    after,
  });
}

export function buildExecutionAuditDiff(
  before: unknown,
  after: unknown,
): AuditDiff[] {
  const diffs: AuditDiff[] = [];
  diffValues(before, after, "", diffs);
  return diffs;
}

