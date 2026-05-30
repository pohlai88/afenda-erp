import { Fragment, type ElementType, type ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "./badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { uiTitle, uiTypography } from "./design-system";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./empty";

export type Tone = "neutral" | "positive" | "warning";

const toneToBadgeVariant: Record<
  Tone,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  neutral: "outline",
  positive: "success",
  warning: "warning",
};

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return <Badge variant={toneToBadgeVariant[tone]}>{label}</Badge>;
}

export function SectionPanel({
  eyebrow,
  title,
  description,
  aside,
  headingLevel = 2,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  headingLevel?: 1 | 2 | 3;
  children?: ReactNode;
}) {
  const HeadingTag: ElementType =
    headingLevel === 1 ? "h1" : headingLevel === 3 ? "h3" : "h2";

  return (
    <section className="border-t border-border pt-surface-2xl">
      <Card className="gap-surface-lg border-0 bg-transparent py-0 shadow-none ring-0">
        <CardHeader className="px-0">
          <div className="flex flex-col gap-surface-lg lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className={uiTypography.label}>{eyebrow}</p>
              ) : null}
              <HeadingTag className={`mt-2 ${uiTitle.lg} text-foreground`}>
                {title}
              </HeadingTag>
              {description ? (
                <CardDescription className="mt-3 leading-7">
                  {description}
                </CardDescription>
              ) : null}
            </div>
            {aside ? (
              <CardAction className="col-start-auto row-start-auto self-start">
                {aside}
              </CardAction>
            ) : null}
          </div>
        </CardHeader>
        {children ? (
          <CardContent className="px-0 pt-0">{children}</CardContent>
        ) : null}
      </Card>
    </section>
  );
}

/** Compact form tile — Card with header inside grids (not a section wrapper). */
export function SubsectionPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card size="sm" className="gap-surface-sm py-surface-md">
      <CardHeader className="px-surface-md pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-surface-md pt-surface-sm">{children}</CardContent>
    </Card>
  );
}

export function BulletColumns({
  items,
}: {
  items: readonly {
    title: string;
    summary: string;
    bullets: readonly string[];
  }[];
}) {
  return (
    <div className="grid gap-surface-lg xl:grid-cols-2">
      {items.map((item) => (
        <Card key={item.title} size="sm">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="leading-7">{item.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className={`flex flex-col gap-2 ${uiTypography.muted} leading-6`}>
              {item.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-sm bg-muted-foreground/60"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export type IndicatorItem = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

function IndicatorCard({ indicator }: { indicator: IndicatorItem }) {
  return (
    <Card size="sm">
      <CardHeader className="grid-cols-[1fr_auto]">
        <CardTitle>{indicator.label}</CardTitle>
        <CardAction>
          <StatusBadge label={indicator.value} tone={indicator.tone} />
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="leading-6">{indicator.detail}</CardDescription>
      </CardContent>
    </Card>
  );
}

export function ObservabilityIndicatorList({
  indicators,
  footer,
}: {
  indicators: readonly IndicatorItem[];
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.label} indicator={indicator} />
      ))}
      {footer ? (
        <Card className="border-dashed bg-card">
          <CardContent className={uiTypography.muted}>{footer}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export type ModuleLinkItem = {
  id: string;
  href: string;
  label: string;
  summary: string;
  statusLabel: string;
  statusTone: Tone;
};

function ModuleLinkCard({
  module,
  renderLink,
}: {
  module: ModuleLinkItem;
  renderLink?: (input: {
    module: ModuleLinkItem;
    className: string;
    children: ReactNode;
  }) => ReactNode;
}) {
  const card = (
    <Card
      className="transition-colors hover:border-border hover:bg-muted/50"
      size="sm"
    >
      <CardHeader className="grid-cols-[1fr_auto]">
        <CardTitle>{module.label}</CardTitle>
        <CardAction>
          <StatusBadge label={module.statusLabel} tone={module.statusTone} />
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="leading-6">{module.summary}</CardDescription>
      </CardContent>
    </Card>
  );

  if (renderLink) {
    return (
      <Fragment key={module.id}>
        {renderLink({
          module,
          className:
            "block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          children: card,
        })}
      </Fragment>
    );
  }

  return (
    <a
      key={module.id}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={module.href}
    >
      {card}
    </a>
  );
}

export function ModuleLinkGrid({
  modules,
  emptyMessage = "No adjacent modules are available under the current capability set.",
  renderLink,
}: {
  modules: readonly ModuleLinkItem[];
  emptyMessage?: string;
  renderLink?: (input: {
    module: ModuleLinkItem;
    className: string;
    children: ReactNode;
  }) => ReactNode;
}) {
  if (modules.length === 0) {
    return (
      <Empty className="border border-dashed p-6">
        <EmptyHeader>
          <EmptyTitle>No modules available</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => (
        <ModuleLinkCard key={module.id} module={module} renderLink={renderLink} />
      ))}
    </div>
  );
}

export { ShellFrame } from "./shell-frame.client";
