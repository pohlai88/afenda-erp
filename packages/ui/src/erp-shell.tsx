import { Fragment, type ReactNode } from "react";

type ShellFrameProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export type Tone = "neutral" | "positive" | "warning";

export type DataTableRow = {
  id: string;
  cells: readonly string[];
};

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

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface-strong p-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-muted">
          {label}
        </div>
        <StatusBadge
          label={
            tone === "positive"
              ? "Healthy"
              : tone === "warning"
                ? "Watch"
                : "Stable"
          }
          tone={tone}
        />
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-2 text-sm leading-6 text-muted">{detail}</div>
    </section>
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

export function DetailList({
  items,
}: {
  items: readonly {
    label: string;
    value: string;
  }[];
}) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-line bg-surface-strong px-4 py-3"
        >
          <dt className="text-xs uppercase tracking-wide text-muted">
            {item.label}
          </dt>
          <dd className="mt-2 text-sm font-medium text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
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

export function SimpleDataTable({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly DataTableRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface-strong">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line">
              {columns.map((column, cellIndex) => (
                <td
                  key={`${row.id}-${column}`}
                  className="px-4 py-3 text-slate-700"
                >
                  {row.cells[cellIndex] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type MetricItem = {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
};

export function MetricGrid({
  metrics,
  persisted = true,
}: {
  metrics: readonly MetricItem[];
  persisted?: boolean;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          detail={
            persisted
              ? metric.detail
              : `${metric.detail} (metadata sample until tenant data is seeded)`
          }
          label={metric.label}
          tone={metric.tone}
          value={metric.value}
        />
      ))}
    </section>
  );
}

export type IndicatorItem = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

export function IndicatorCard({ indicator }: { indicator: IndicatorItem }) {
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

export type SavedViewItem = {
  id: string;
  name: string;
  description: string;
  visibility: string;
};

export function SavedViewGrid({
  views,
  emptyMessage = "No saved views are configured for this route yet.",
}: {
  views: readonly SavedViewItem[];
  emptyMessage?: string;
}) {
  if (views.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface-strong p-4 text-sm leading-6 text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {views.map((view) => (
        <div
          key={view.id}
          className="rounded-lg border border-line bg-surface-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">
              {view.name}
            </div>
            <StatusBadge label={view.visibility} tone="neutral" />
          </div>
          <div className="mt-2 text-sm leading-6 text-muted">
            {view.description}
          </div>
        </div>
      ))}
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

export function WorkflowSummaryPanel({
  queueDepth,
  escalations,
  highPriority,
}: {
  queueDepth: number;
  escalations: number;
  highPriority: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-strong p-4">
      <div className="text-sm font-semibold text-foreground">
        Workflow summary
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Queue depth
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {queueDepth}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Escalations
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {escalations}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            High priority
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {highPriority}
          </div>
        </div>
      </div>
    </div>
  );
}

export type AutomationRunItem = {
  name: string;
  schedule: string;
  status: string;
  detail: string;
  statusTone: Tone;
};

export function AutomationRunList({
  runs,
}: {
  runs: readonly AutomationRunItem[];
}) {
  return (
    <div className="space-y-3">
      {runs.map((automation) => (
        <div key={automation.name}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">
              {automation.name}
            </div>
            <StatusBadge
              label={automation.status}
              tone={automation.statusTone}
            />
          </div>
          <div className="mt-1 text-sm text-muted">
            {automation.schedule} · {automation.detail}
          </div>
        </div>
      ))}
    </div>
  );
}

export type HardeningChecklistItem = {
  area: string;
  status: string;
  detail: string;
  statusTone: Tone;
};

export function HardeningChecklistGrid({
  items,
}: {
  items: readonly HardeningChecklistItem[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.area}
          className="rounded-lg border border-line bg-surface-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">
              {item.area}
            </div>
            <StatusBadge label={item.status} tone={item.statusTone} />
          </div>
          <div className="mt-2 text-sm leading-6 text-muted">{item.detail}</div>
        </div>
      ))}
    </div>
  );
}

export type RecoveryPlaybookItem = {
  id: string;
  label?: string;
  problem: string;
  diagnosis: string;
  action: string;
  risk: "high" | "medium" | "low";
};

function recoveryRiskTone(risk: RecoveryPlaybookItem["risk"]): Tone {
  if (risk === "high") {
    return "warning";
  }

  if (risk === "medium") {
    return "neutral";
  }

  return "positive";
}

export function RecoveryPlaybookGrid({
  playbooks,
}: {
  playbooks: readonly RecoveryPlaybookItem[];
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {playbooks.map((playbook) => (
        <article
          key={playbook.id}
          className="rounded-lg border border-line bg-surface-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">
              {playbook.label ?? playbook.problem}
            </div>
            <StatusBadge
              label={playbook.risk}
              tone={recoveryRiskTone(playbook.risk)}
            />
          </div>
          <div className="mt-3 text-sm leading-6 text-muted">
            {playbook.diagnosis}
          </div>
          <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-6 text-slate-700">
            {playbook.action}
          </div>
        </article>
      ))}
    </div>
  );
}

export type OperationalSkillItem = {
  id: string;
  label: string;
  moduleId: string;
  description: string;
  problemTypes: readonly string[];
  readToolNames: readonly string[];
  draftToolNames: readonly string[];
  approvalToolNames: readonly string[];
  approvalPolicy: "read-only" | "draft-only" | "human-approval-required";
};

function operationalSkillTone(
  policy: OperationalSkillItem["approvalPolicy"],
): Tone {
  if (policy === "human-approval-required") {
    return "warning";
  }

  if (policy === "draft-only") {
    return "neutral";
  }

  return "positive";
}

export function OperationalSkillGrid({
  skills,
}: {
  skills: readonly OperationalSkillItem[];
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {skills.map((skill) => (
        <article
          key={skill.id}
          className="rounded-lg border border-line bg-surface-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {skill.label}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                {skill.moduleId}
              </div>
            </div>
            <StatusBadge
              label={skill.approvalPolicy.replaceAll("-", " ")}
              tone={operationalSkillTone(skill.approvalPolicy)}
            />
          </div>
          <div className="mt-3 text-sm leading-6 text-muted">
            {skill.description}
          </div>
          <div className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-3">
            <div className="rounded-md border border-line bg-surface px-2 py-2">
              <div className="font-medium text-foreground">Read</div>
              <div className="mt-1">{skill.readToolNames.length} tools</div>
            </div>
            <div className="rounded-md border border-line bg-surface px-2 py-2">
              <div className="font-medium text-foreground">Draft</div>
              <div className="mt-1">{skill.draftToolNames.length} tools</div>
            </div>
            <div className="rounded-md border border-line bg-surface px-2 py-2">
              <div className="font-medium text-foreground">Approve</div>
              <div className="mt-1">{skill.approvalToolNames.length} tools</div>
            </div>
          </div>
          <div className="mt-3 text-xs leading-5 text-muted">
            {skill.problemTypes.slice(0, 4).join(", ")}
          </div>
        </article>
      ))}
    </div>
  );
}
