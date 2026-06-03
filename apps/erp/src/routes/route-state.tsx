import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Spinner,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";
import { CircleAlertIcon, FileQuestionIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type RouteStateLayout = "centered-auth" | "centered" | "workspace";

const layoutClassNames: Record<RouteStateLayout, string> = {
  "centered-auth":
    "neon-auth-ui-page surface-page flex w-full items-center justify-center p-surface-lg",
  centered: "surface-page flex w-full items-center justify-center p-surface-lg",
  workspace: "surface-page text-foreground",
};

export function RouteStateShell({
  layout,
  ariaBusy,
  children,
}: {
  layout: RouteStateLayout;
  ariaBusy?: boolean;
  children: ReactNode;
}) {
  if (layout === "workspace") {
    return (
      <main
        aria-busy={ariaBusy ? true : undefined}
        className={layoutClassNames.workspace}
      >
        <div className="page-shell page-stack">{children}</div>
      </main>
    );
  }

  return (
    <main
      aria-busy={ariaBusy ? true : undefined}
      className={layoutClassNames[layout]}
    >
      {children}
    </main>
  );
}

export type RouteStateKind = "error" | "not-found" | "loading";

const stateIcons = {
  error: CircleAlertIcon,
  "not-found": FileQuestionIcon,
} as const;

export function RouteStatePanel({
  kind,
  label,
  title,
  description,
  action,
  align = "center",
  className,
}: {
  kind: RouteStateKind;
  label?: string;
  title: string;
  description: string;
  action?: ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  const Icon = kind === "loading" ? null : stateIcons[kind];

  return (
    <Empty
      className={cn(
        "w-full border-solid bg-card p-surface-lg",
        align === "center" ? "mx-auto max-w-md text-center" : "max-w-none text-left",
        className,
      )}
    >
      <EmptyHeader className={align === "start" ? "items-start" : undefined}>
        {label ? <p className="type-section-label">{label}</p> : null}
        <EmptyMedia variant="icon">
          {kind === "loading" ? <Spinner /> : Icon ? <Icon /> : null}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}

export function RouteStateLinkAction({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button variant="secondary" asChild>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function RouteLoadingFallback({
  layout = "centered-auth",
  title,
  description,
}: {
  layout?: RouteStateLayout;
  title: string;
  description: string;
}) {
  return (
    <RouteStateShell layout={layout} ariaBusy>
      <RouteStatePanel kind="loading" title={title} description={description} />
    </RouteStateShell>
  );
}

export function formatRouteErrorDescription(
  description: string,
  digest?: string,
) {
  return digest ? `${description} Reference: ${digest}.` : description;
}
