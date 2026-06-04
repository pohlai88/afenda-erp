"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@afenda/ui";
import { Braces, Check, Copy, X } from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { lynxErpReadToolOutputSchema } from "./lyn-erp-read-tools.schema";
import {
  LynxEvidenceCard,
  LynxMetricCard,
} from "./lyn-panel.component.client";
import {
  getLynxToolStateLabel,
  getLynxToolStateTone,
} from "./lyn-tool-state.shared";

export type LynxToolPart = {
  type: string;
  state?: string;
  title?: string;
  toolCallId?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: {
    approved?: boolean;
    id: string;
    reason?: string;
  };
};

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getSummary(value: Record<string, unknown>) {
  return (
    getString(value.summary) ??
    getString(value.title) ??
    getString(value.proposedAction)
  );
}

function getMetricEntries(value: Record<string, unknown>) {
  return Object.entries(value)
    .filter(([, entryValue]) => getNumber(entryValue) !== null)
    .slice(0, 4);
}

function statusVariant(value: unknown): BadgeVariant {
  return getLynxToolStateTone(value);
}

function getNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function getLynxToolDisplayName(part: LynxToolPart) {
  return (
    getNonEmptyString(part.title) ??
    getNonEmptyString(part.toolName) ??
    part.type.replace(/^tool-/, "")
  );
}

function renderStructuredValue(value: unknown) {
  if (value === undefined) {
    return "{}";
  }

  try {
    return JSON.stringify(value, null, 2) ?? "null";
  } catch {
    return "[Unserializable payload]";
  }
}

function getPayloadLineCount(value: string) {
  return value.split("\n").length;
}

function getPayloadCharacterCount(value: string) {
  return value.length;
}

export function LynxToolPayloadDetails({
  defaultOpen,
  title,
  value,
}: {
  defaultOpen?: boolean;
  title: string;
  value: unknown;
}) {
  const [copied, setCopied] = useState(false);
  const serializedValue = renderStructuredValue(value);
  const lineCount = getPayloadLineCount(serializedValue);
  const characterCount = getPayloadCharacterCount(serializedValue);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(serializedValue);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details
      className="rounded-section border border-border bg-background/60"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 type-control font-medium text-foreground">
        <span className="inline-flex items-center gap-2">
          <Braces className="h-4 w-4 text-muted-foreground" aria-hidden />
          {title}
        </span>
        <Badge variant="outline">
          {lineCount} lines · {characterCount} chars
        </Badge>
      </summary>
      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div className="flex justify-end">
          <Button
            onClick={copyPayload}
            size="xs"
            type="button"
            variant="outline"
          >
            {copied ? (
              <Check aria-hidden data-icon="inline-start" />
            ) : (
              <Copy aria-hidden data-icon="inline-start" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="surface-code max-h-64 overflow-auto p-3 type-code">
          <code>{serializedValue}</code>
        </pre>
      </div>
    </details>
  );
}

function LynxToolError({ errorText }: { errorText: string }) {
  return (
    <section className="rounded-section border border-critical/30 bg-critical/10 p-3">
      <div className="type-body font-semibold text-critical">Tool blocked</div>
      <p className="mt-1 type-body text-critical">{errorText}</p>
    </section>
  );
}

function LynxGenericToolSummary({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return null;
  }

  const summary = getSummary(value);

  if (!summary) {
    return null;
  }

  return (
    <Card size="sm" className="border border-border shadow-none">
      <CardContent className="type-muted">
        {summary}
      </CardContent>
    </Card>
  );
}

function LynxErpReadToolOutput({ value }: { value: unknown }) {
  const parsed = lynxErpReadToolOutputSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  const output = parsed.data;

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-section border border-border bg-background/60 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="type-body font-semibold text-foreground">
              {output.summary}
            </div>
            <Badge variant={statusVariant(output.readinessStatus)}>
              {output.readinessStatus}
            </Badge>
          </div>
          <div className="grid gap-2 @sm:grid-cols-3">
            <LynxMetricCard label="Modules" value={output.modules.length} />
            <LynxMetricCard label="Signals" value={output.signals.length} />
            <LynxMetricCard label="Evidence" value={output.evidence.length} />
          </div>
        </div>
      </section>

      {output.modules.length > 0 ? (
        <details
          className="rounded-section border border-border bg-background/60"
          open={output.modules.length <= 2}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
            <span className="type-label">
              Modules
            </span>
            <Badge variant="outline">{output.modules.length}</Badge>
          </summary>
          <div className="grid gap-2 border-t border-border p-3 @md:grid-cols-2">
            {output.modules.slice(0, 4).map((module) => (
              <section
                key={module.moduleId}
                className="rounded-section border border-border bg-background/60 p-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="type-body font-semibold text-foreground">
                      {module.moduleLabel}
                    </div>
                    <Badge variant={statusVariant(module.readinessStatus)}>
                      {module.readinessStatus}
                    </Badge>
                  </div>
                  <div className="grid gap-2 @sm:grid-cols-2">
                    <LynxMetricCard
                      label="Records"
                      value={module.stats.recordCount}
                    />
                    <LynxMetricCard
                      label="Work"
                      value={module.stats.workItemCount}
                    />
                    <LynxMetricCard
                      label="Docs"
                      value={module.stats.documentCount}
                    />
                    <LynxMetricCard
                      label="Views"
                      value={module.stats.savedViewCount}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </details>
      ) : null}

      {output.signals.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="type-label">
            Signals
          </div>
          {output.signals.slice(0, 6).map((signal) => (
            <Card
              key={signal.id}
              size="sm"
              className="border border-border shadow-none"
            >
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="type-body font-medium text-foreground">
                    {signal.label}
                  </div>
                  <Badge variant={statusVariant(signal.status)}>
                    {signal.value ?? signal.status}
                  </Badge>
                </div>
                <p className="type-muted">
                  {signal.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {output.evidence.length > 0 ? (
        <details
          className="rounded-section border border-border bg-background/60"
          open={output.evidence.length <= 3}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
            <span className="type-label">
              Evidence
            </span>
            <Badge variant="outline">{output.evidence.length}</Badge>
          </summary>
          <div className="flex flex-col gap-2 border-t border-border p-3">
            {output.evidence.slice(0, 6).map((item) => (
              <LynxEvidenceCard
                key={`${item.type}-${item.id}`}
                href={item.href}
                meta={item.moduleId}
                signal={item.signal}
                title={item.label}
              />
            ))}
          </div>
        </details>
      ) : null}

      {output.missingData.length > 0 || output.safeNextActions.length > 0 ? (
        <div className="grid gap-3 @md:grid-cols-2">
          {output.missingData.length > 0 ? (
            <Card size="sm" className="border border-border shadow-none">
              <CardHeader>
                <CardTitle>Missing data</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1 type-muted">
                  {output.missingData.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {output.safeNextActions.length > 0 ? (
            <Card size="sm" className="border border-border shadow-none">
              <CardHeader>
                <CardTitle>Safe next actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1 type-muted">
                  {output.safeNextActions.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LynxMetricList({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return null;
  }

  const entries = getMetricEntries(value);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2 @sm:grid-cols-2">
      {entries.map(([label, entryValue]) => (
        <LynxMetricCard
          key={label}
          label={label}
          value={entryValue as number}
        />
      ))}
    </div>
  );
}

export function LynxToolOutput({ value }: { value: unknown }) {
  if (lynxErpReadToolOutputSchema.safeParse(value).success) {
    return <LynxErpReadToolOutput value={value} />;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (!getSummary(value) && getMetricEntries(value).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <LynxGenericToolSummary value={value} />
      <LynxMetricList value={value} />
    </div>
  );
}

export function LynxToolCard({
  part,
  onApprove,
  onReject,
}: {
  part: LynxToolPart;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
}) {
  const approvalId = part.approval?.id;
  const toolName = getLynxToolDisplayName(part);
  const toolStateLabel = getLynxToolStateLabel(part.state);
  const hasInput = part.input !== undefined;
  const hasOutput = part.output !== undefined;
  const errorText =
    typeof part.errorText === "string" && part.errorText !== ""
      ? part.errorText
      : null;

  return (
    <section className="@container rounded-section border border-border bg-background/60 p-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="type-body font-semibold text-foreground">
            {toolName}
          </div>
          <Badge variant={statusVariant(part.state)}>{toolStateLabel}</Badge>
        </div>
        {hasInput ? (
          <LynxToolPayloadDetails
            defaultOpen={!hasOutput}
            title="Input payload"
            value={part.input}
          />
        ) : null}
        {hasOutput ? <LynxToolOutput value={part.output} /> : null}
        {hasOutput ? (
          <LynxToolPayloadDetails title="Output payload" value={part.output} />
        ) : null}
        {errorText ? <LynxToolError errorText={errorText} /> : null}
        {part.state === "approval-requested" && approvalId ? (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => onApprove?.(approvalId)}
              size="sm"
              type="button"
            >
              <Check aria-hidden />
              Approve
            </Button>
            <Button
              onClick={() => onReject?.(approvalId)}
              size="sm"
              type="button"
              variant="outline"
            >
              <X aria-hidden />
              Reject
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
