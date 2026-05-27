import { Fragment, type ReactNode } from "react";

type ShellFrameProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export type Tone = "neutral" | "positive" | "warning";

export function ShellFrame({ sidebar, header, children }: ShellFrameProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 gap-0 lg:grid-cols-[304px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-surface-strong p-5 lg:border-r lg:border-b-0">
          {sidebar}
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-line bg-surface-strong px-6 py-4">
            {header}
          </header>
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const className =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
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
  const HeadingTag =
    headingLevel === 1 ? "h1" : headingLevel === 3 ? "h3" : "h2";

  return (
    <section className="border-t border-line pt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="text-xs uppercase tracking-wide text-muted">
              {eyebrow}
            </div>
          ) : null}
          <HeadingTag className="mt-2 text-2xl font-semibold text-foreground">
            {title}
          </HeadingTag>
          {description ? (
            <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
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
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.title}
          className="rounded-lg border border-line bg-surface-strong p-5"
        >
          <h3 className="text-base font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">{item.summary}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-slate-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </article>
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
    <div className="rounded-lg border border-line bg-surface-strong p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">
          {indicator.label}
        </div>
        <StatusBadge label={indicator.value} tone={indicator.tone} />
      </div>
      <div className="mt-2 text-sm leading-6 text-muted">
        {indicator.detail}
      </div>
    </div>
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
    <div className="space-y-3">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.label} indicator={indicator} />
      ))}
      {footer ? (
        <div className="rounded-lg border border-dashed border-line bg-surface-strong px-4 py-3 text-sm text-muted">
          {footer}
        </div>
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
      <div className="rounded-lg border border-dashed border-line bg-surface-strong p-4 text-sm leading-6 text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => {
        const className =
          "rounded-lg border border-line bg-surface-strong p-4 transition hover:border-slate-300 hover:bg-slate-50";
        const children = (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-950">
                {module.label}
              </div>
              <StatusBadge
                label={module.statusLabel}
                tone={module.statusTone}
              />
            </div>
            <div className="mt-2 text-sm leading-6 text-muted">
              {module.summary}
            </div>
          </>
        );

        if (renderLink) {
          return (
            <Fragment key={module.id}>
              {renderLink({ module, className, children })}
            </Fragment>
          );
        }

        return (
          <a key={module.id} className={className} href={module.href}>
            {children}
          </a>
        );
      })}
    </div>
  );
}
