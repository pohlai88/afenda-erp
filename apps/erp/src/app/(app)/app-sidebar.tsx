"use client";

import type { ErpModuleDefinition, NavigationExtension } from "@afenda/domain";
import { StatusBadge } from "@afenda/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar({
  modules,
  extensions = [],
}: {
  modules: readonly ErpModuleDefinition[];
  extensions?: readonly NavigationExtension[];
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {modules.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg border px-4 py-3 transition ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-line bg-surface-strong text-foreground hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{item.navigationLabel}</div>
              <StatusBadge
                label={item.status.label}
                tone={isActive ? "neutral" : item.status.tone}
              />
            </div>
            <div
              className={`mt-1 text-xs ${
                isActive ? "text-white/72" : "text-muted"
              }`}
            >
              {item.description}
            </div>
          </Link>
        );
      })}
      {extensions.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`block rounded-lg border px-4 py-3 transition ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-line bg-surface-strong text-foreground hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{item.label}</div>
              <StatusBadge
                label={item.status.label}
                tone={isActive ? "neutral" : item.status.tone}
              />
            </div>
            <div
              className={`mt-1 text-xs ${
                isActive ? "text-white/72" : "text-muted"
              }`}
            >
              {item.description}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
