"use client";

import { Button } from "@afenda/ui";

export function HrCsfMatchTargetForm({
  targetKind,
  targetCode,
}: {
  targetKind: string;
  targetCode: string;
}) {
  return (
    <form className="flex flex-col gap-3 @sm:flex-row @sm:items-end" method="get">
      <label className="flex flex-col gap-1">
        <span className="type-control">Target kind</span>
        <select
          className="rounded-control border border-border bg-background px-3 py-2 type-control"
          defaultValue={targetKind}
          name="csfMatchTargetKind"
        >
          <option value="role">Role</option>
          <option value="project">Project</option>
          <option value="critical_position">Critical position</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="type-control">Target code</span>
        <input
          className="rounded-control border border-border bg-background px-3 py-2 type-control"
          defaultValue={targetCode}
          name="csfMatchTargetCode"
          placeholder="SR-ENG"
        />
      </label>
      <Button type="submit" variant="secondary">
        Run match
      </Button>
    </form>
  );
}
