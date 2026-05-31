import Link from "next/link";

import { hrCpmRoutePaths } from "../contracts/hr.payroll.cpm-route.contract";
import { hrCpmUiCopy } from "../surface/hr.payroll.cpm-ui.copy.shared";

export function HrCpmSectionNav({ active }: { active: "cycles" | "reports" | "audit" }) {
  const copy = hrCpmUiCopy.nav;
  return (
    <nav aria-label="Compensation planning sections" className="flex flex-wrap gap-surface-lg">
      <Link
        className={
          active === "cycles"
            ? "type-control font-medium underline underline-offset-4"
            : "type-muted hover:text-foreground"
        }
        href={hrCpmRoutePaths.compensationPlanning}
      >
        {copy.cycles}
      </Link>
      <Link
        className={
          active === "reports"
            ? "type-control font-medium underline underline-offset-4"
            : "type-muted hover:text-foreground"
        }
        href={hrCpmRoutePaths.reports}
      >
        {copy.reports}
      </Link>
      <Link
        className={
          active === "audit"
            ? "type-control font-medium underline underline-offset-4"
            : "type-muted hover:text-foreground"
        }
        href={hrCpmRoutePaths.audit}
      >
        {copy.audit}
      </Link>
    </nav>
  );
}
