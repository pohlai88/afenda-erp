import Link from "next/link";

import { hrCsfRoutePaths } from "./hr.talent.csf-route.contract";
import { hrCsfUiCopy } from "./hr.talent.csf-ui.copy.shared";

type NavKey = "hub" | "reports" | "audit" | "matching";

export function HrCsfSectionNav({ active }: { active: NavKey }) {
  const copy = hrCsfUiCopy.nav;
  const items: Array<{ key: NavKey; href: string; label: string }> = [
    { key: "hub", href: hrCsfRoutePaths.hub, label: copy.hub },
    { key: "reports", href: hrCsfRoutePaths.reports, label: copy.reports },
    { key: "matching", href: hrCsfRoutePaths.matching, label: copy.matching },
    { key: "audit", href: hrCsfRoutePaths.audit, label: copy.audit },
  ];

  return (
    <nav className="flex flex-row flex-wrap gap-3 border-b border-border pb-3">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={
            item.key === active
              ? "type-control text-foreground"
              : "type-muted hover:text-foreground"
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
