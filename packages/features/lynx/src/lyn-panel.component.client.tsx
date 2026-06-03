"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@afenda/ui";
import type { ReactNode } from "react";
import { isSafeLynxHref } from "./lynx.chat-format.shared";

export function LynxPanel({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <section className="@container rounded-section border border-border bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-3 border-b border-border px-surface-lg py-surface-md">
        <div className="min-w-0">
          <h2 className="type-body font-semibold text-foreground">{title}</h2>
          <p className="mt-1 type-muted">
            {description}
          </p>
        </div>
        {icon ? (
          <div className="mt-1 shrink-0 text-muted-foreground">{icon}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function LynxEmptyState({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <Empty className="border border-border bg-background/60 p-6">
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function LynxMetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card size="sm" className="border border-border shadow-none">
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function LynxEvidenceCard({
  href,
  id,
  meta,
  signal,
  title,
}: {
  href?: string;
  id?: string;
  meta?: string;
  signal: string;
  title: string;
}) {
  const safeHref = isSafeLynxHref(href) ? href : undefined;
  const isExternal = safeHref?.startsWith("https://");
  const titleElement = safeHref ? (
    <a
      className="font-medium text-foreground underline-offset-2 hover:underline"
      href={safeHref}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {title}
    </a>
  ) : (
    <span className="font-medium text-foreground">{title}</span>
  );

  return (
    <Card id={id} size="sm" className="border border-border shadow-none">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3 type-body">
          {titleElement}
          {meta ? (
            <span className="shrink-0 type-caption">
              {meta}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-3 type-muted">
          {signal}
        </p>
      </CardContent>
    </Card>
  );
}
