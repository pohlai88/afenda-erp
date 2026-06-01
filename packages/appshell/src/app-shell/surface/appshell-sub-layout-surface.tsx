"use client";

import { Fragment, type ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import Link from "next/link";

import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import { useAppShellSubLayoutFloating } from "./appshell-sub-layout.client";

export type AppShellSurfaceProps = {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function AppShellSurface({
  title,
  subtitle,
  breadcrumbs = [],
  headerActions,
  children,
}: AppShellSurfaceProps) {
  const floating = useAppShellSubLayoutFloating();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {(breadcrumbs.length > 0 || headerActions || floating) ? (
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
          <div className="flex h-(--af-l1-height) items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              {floating ? (
                <Button
                  aria-controls={floating.panelId}
                  aria-expanded={floating.open}
                  aria-label={
                    floating.open ? "Close section navigation" : "Open section navigation"
                  }
                  className={cn(
                    "af-appshell__icon-button af-appshell__icon-button--sm",
                    floating.open && "bg-accent text-accent-foreground",
                  )}
                  size="icon-xs"
                  onClick={floating.toggle}
                  type="button"
                  variant="ghost"
                >
                  <PanelLeft aria-hidden="true" size={14} />
                </Button>
              ) : null}
              {breadcrumbs.length > 0 ? (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => {
                      const last = index === breadcrumbs.length - 1;
                      return (
                        <Fragment key={`${crumb.href ?? crumb.label}-${index}`}>
                          {index > 0 ? <BreadcrumbSeparator /> : null}
                          <BreadcrumbItem>
                            {crumb.href && !last ? (
                              <BreadcrumbLink asChild>
                                <Link href={crumb.href}>{crumb.label}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        </Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              ) : null}
            </div>
            {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
          </div>
        </div>
      ) : null}
      <div className="flex-1 px-4 pb-8 pt-5 sm:px-6">
        {(title || subtitle) ? (
          <header className="mb-6">
            {title ? <h1 className="text-xl font-medium">{title}</h1> : null}
            {subtitle ? (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );
}
