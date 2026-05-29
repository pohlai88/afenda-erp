"use client";

import { StatusBadge, type Tone } from "@afenda/ui";
import Link from "next/link";
import { CodeBlock } from "./code-block";

export type ToolPart = {
  type: string;
  state?: string;
  toolCallId?: string;
  input?: unknown;
  output?: unknown;
  approval?: {
    id: string;
  };
};

function renderStructuredValue(value: unknown) {
  if (value === undefined) {
    return "{}";
  }

  return JSON.stringify(value, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getToneForRisk(value: unknown): Tone {
  return value === "high"
    ? "warning"
    : value === "low"
      ? "positive"
      : "neutral";
}

function getToneForStatus(value: unknown): Tone {
  return value === "available" ||
    value === "approved" ||
    value === "completed" ||
    value === "human-approved" ||
    value === "high"
    ? "positive"
    : value === "partial" ||
        value === "pending" ||
        value === "failed" ||
        value === "rejected" ||
        value === "unavailable" ||
        value === "low" ||
        value === "medium"
      ? "warning"
      : "neutral";
}

function ToolHeader({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value?: string | null;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="type-body font-semibold text-foreground">{label}</div>
      {value ? <StatusBadge label={value} tone={tone} /> : null}
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-section border border-line bg-surface-strong px-3 py-2">
      <div className="type-caption uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 type-body font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ConfidenceCard({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return null;
  }

  const overall = getNumber(value.overall);
  const level = getString(value.level);

  if (overall === null || !level) {
    return null;
  }

  return (
    <div className="rounded-section border border-line bg-surface-strong p-3">
      <ToolHeader
        label="Confidence"
        tone={getToneForStatus(level)}
        value={`${overall}% ${level}`}
      />
      <div className="@container mt-3 grid gap-2 @sm:grid-cols-3">
        <MiniMetric label="Data" value={getNumber(value.dataQuality) ?? "-"} />
        <MiniMetric
          label="Grounding"
          value={getNumber(value.groundingStrength) ?? "-"}
        />
        <MiniMetric
          label="Intent"
          value={getNumber(value.intentClarity) ?? "-"}
        />
      </div>
      {typeof value.explanation === "string" ? (
        <div className="mt-3 type-body leading-6 text-muted">
          {value.explanation}
        </div>
      ) : null}
    </div>
  );
}

function EvidenceList({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const evidence = value.filter(isRecord).slice(0, 6);

  if (evidence.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="type-caption uppercase tracking-wide text-muted">Evidence</div>
      {evidence.map((item, index) => {
        const label =
          getString(item.label) ?? getString(item.sourceId) ?? "Source";
        const href = getString(item.href);

        return (
          <div
            className="rounded-section border border-line bg-surface-strong px-3 py-2"
            key={`${getString(item.recordId) ?? getString(item.sourceId) ?? index}-${index}`}
          >
            <div className="flex items-center justify-between gap-3">
              {href ? (
                <Link
                  className="type-body font-medium text-foreground underline-offset-2 hover:underline"
                  href={href}
                >
                  {label}
                </Link>
              ) : (
                <div className="type-body font-medium text-foreground">
                  {label}
                </div>
              )}
              <div className="type-caption text-muted">
                {getString(item.moduleId) ?? "module"}
              </div>
            </div>
            <div className="mt-1 type-body leading-6 text-muted">
              {getString(item.signal) ??
                getString(item.recordId) ??
                "Evidence source"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SandboxCard({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return null;
  }

  const diff = isRecord(value.diff) ? value.diff : null;
  const risk = isRecord(value.riskAssessment) ? value.riskAssessment : null;
  const status = getString(value.status);
  const title = getString(value.title);

  if (!diff || !risk || !title) {
    return null;
  }

  const requiredHumanChecks = isStringArray(risk.requiredHumanChecks)
    ? risk.requiredHumanChecks
    : [];

  const sandboxId = getString(value.id);

  return (
    <div className="rounded-section border border-line bg-surface-strong p-3">
      <ToolHeader
        label={title}
        tone={getToneForStatus(status)}
        value={status}
      />
      {sandboxId ? (
        <Link
          className="mt-1 inline-flex items-center rounded bg-muted/30 px-2 py-0.5 font-mono type-caption text-muted underline-offset-2 hover:underline"
          href={`/system-admin#ai-sandboxes-${sandboxId}`}
        >
          sandbox: {sandboxId}
        </Link>
      ) : null}
      <div className="mt-2 type-body leading-6 text-muted">
        {getString(diff.summary) ?? "Action preview"}
      </div>
      <div className="@container mt-3 grid gap-2 @sm:grid-cols-4">
        <MiniMetric label="Creates" value={getNumber(diff.creates) ?? 0} />
        <MiniMetric label="Updates" value={getNumber(diff.updates) ?? 0} />
        <MiniMetric label="Deletes" value={getNumber(diff.deletes) ?? 0} />
        <MiniMetric label="Risk" value={getString(risk.riskLevel) ?? "-"} />
      </div>
      {requiredHumanChecks.length > 0 ? (
        <ul className="flex flex-col mt-3  type-body leading-6 text-muted gap-1">
          {requiredHumanChecks.slice(0, 4).map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function DiagnosisCards({ value }: { value: unknown }) {
  if (!Array.isArray(value)) {
    return null;
  }

  const diagnoses = value.filter(isRecord);

  const firstDiagnosis = diagnoses[0];
  if (diagnoses.length === 0 || !firstDiagnosis || !("evidence" in firstDiagnosis)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {diagnoses.slice(0, 6).map((diagnosis, index) => (
        <div
          className="rounded-section border border-line bg-surface-strong p-3"
          key={`${getString(diagnosis.id) ?? index}-${index}`}
        >
          <ToolHeader
            label={getString(diagnosis.title) ?? "Diagnosis"}
            tone={getToneForRisk(diagnosis.severity)}
            value={getString(diagnosis.severity)}
          />
          <div className="mt-2 type-body leading-6 text-muted">
            {getString(diagnosis.explanation) ?? "No explanation supplied."}
          </div>
          <div className="mt-3">
            <EvidenceList value={diagnosis.evidence} />
          </div>
          <div className="mt-3">
            <ConfidenceCard value={diagnosis.confidenceBreakdown} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecoveryPlanCard({ value }: { value: unknown }) {
  if (!isRecord(value) || !Array.isArray(value.orderedActions)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-section border border-line bg-surface-strong p-3">
        <ToolHeader
          label={getString(value.title) ?? "Recovery playbook"}
          value={getString(value.workflowId)}
        />
        <div className="mt-2 type-body leading-6 text-muted">
          {getString(value.summary) ?? "Recovery plan generated."}
        </div>
      </div>
      {value.orderedActions
        .filter(isRecord)
        .slice(0, 6)
        .map((action, index) => (
          <div
            className="rounded-section border border-line bg-surface-strong p-3"
            key={`${getString(action.id) ?? index}-${index}`}
          >
            <ToolHeader
              label={getString(action.title) ?? "Recovery action"}
              tone={getToneForRisk(action.riskLevel)}
              value={getString(action.priority)}
            />
            <div className="mt-2 type-body leading-6 text-muted">
              {getString(action.expectedImpact) ??
                "No expected impact supplied."}
            </div>
            <div className="mt-3 grid gap-3">
              <ConfidenceCard value={action.confidenceBreakdown} />
              <SandboxCard value={action.actionSandbox} />
              <EvidenceList value={action.sourceRecords} />
            </div>
          </div>
        ))}
    </div>
  );
}

function ApprovalOutputCard({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return null;
  }

  const metadata = isRecord(value.metadata) ? value.metadata : null;
  const sandbox = metadata ? metadata.sandbox : undefined;
  const approvalState = getString(value.approvalState);

  if (!approvalState && !sandbox) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-section border border-line bg-surface-strong p-3">
        <ToolHeader
          label={
            getString(value.title) ??
            getString(value.proposedAction) ??
            "Approval proposal"
          }
          tone={getToneForStatus(approvalState)}
          value={approvalState}
        />
        <div className="mt-2 type-body leading-6 text-muted">
          Proposal {getString(value.proposalId) ?? "pending"} for{" "}
          {getString(value.moduleId) ?? "module"}.
          {getString(value.sandboxId) ? (
            <Link
              className="ml-2 inline-flex items-center rounded bg-muted/30 px-2 py-0.5 font-mono type-caption underline-offset-2 hover:underline"
              href={`/system-admin#ai-sandboxes-${getString(value.sandboxId)}`}
            >
              {getString(value.sandboxId)}
            </Link>
          ) : null}
        </div>
      </div>
      <SandboxCard value={sandbox} />
    </div>
  );
}

function ErpReadToolOutputCard({ value }: { value: unknown }) {
  if (!isRecord(value) || value.source !== "tenant-erp-read-tool") {
    return null;
  }

  const modules = Array.isArray(value.modules)
    ? value.modules.filter(isRecord)
    : [];
  const signals = Array.isArray(value.signals)
    ? value.signals.filter(isRecord)
    : [];
  const evidence = Array.isArray(value.evidence)
    ? value.evidence.filter(isRecord)
    : [];
  const missingData = isStringArray(value.missingData) ? value.missingData : [];
  const safeNextActions = isStringArray(value.safeNextActions)
    ? value.safeNextActions
    : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-section border border-line bg-surface-strong p-3">
        <ToolHeader
          label={getString(value.summary) ?? "ERP-native read inspection"}
          tone={getToneForStatus(value.readinessStatus)}
          value={getString(value.readinessStatus)}
        />
        <div className="@container mt-3 grid gap-2 @sm:grid-cols-3">
          <MiniMetric label="Modules" value={modules.length} />
          <MiniMetric label="Signals" value={signals.length} />
          <MiniMetric label="Evidence" value={evidence.length} />
        </div>
      </div>

      {modules.length > 0 ? (
        <div className="@container grid gap-2 @sm:grid-cols-2">
          {modules.slice(0, 4).map((module, index) => (
            <div
              className="rounded-section border border-line bg-surface-strong p-3"
              key={`${getString(module.moduleId) ?? index}-${index}`}
            >
              <ToolHeader
                label={getString(module.moduleLabel) ?? "Module"}
                tone={getToneForStatus(module.readinessStatus)}
                value={getString(module.readinessStatus)}
              />
              {isRecord(module.stats) ? (
                <div className="@container mt-3 grid gap-2 @sm:grid-cols-2">
                  <MiniMetric
                    label="Records"
                    value={getNumber(module.stats.recordCount) ?? 0}
                  />
                  <MiniMetric
                    label="Work"
                    value={getNumber(module.stats.workItemCount) ?? 0}
                  />
                  <MiniMetric
                    label="Docs"
                    value={getNumber(module.stats.documentCount) ?? 0}
                  />
                  <MiniMetric
                    label="Views"
                    value={getNumber(module.stats.savedViewCount) ?? 0}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {signals.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="type-caption uppercase tracking-wide text-muted">
            Signals
          </div>
          {signals.slice(0, 6).map((signal, index) => (
            <div
              className="rounded-section border border-line bg-surface-strong px-3 py-2"
              key={`${getString(signal.id) ?? index}-${index}`}
            >
              <ToolHeader
                label={getString(signal.label) ?? "Signal"}
                tone={getToneForStatus(signal.status)}
                value={getString(signal.value) ?? getString(signal.status)}
              />
              <div className="mt-1 type-body leading-6 text-muted">
                {getString(signal.detail) ?? "No detail supplied."}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <EvidenceList value={evidence} />

      {missingData.length > 0 || safeNextActions.length > 0 ? (
        <div className="@container grid gap-3 @md:grid-cols-2">
          {missingData.length > 0 ? (
            <div className="rounded-section border border-line bg-surface-strong p-3">
              <div className="type-caption uppercase tracking-wide text-muted">
                Missing data
              </div>
              <ul className="flex flex-col mt-2  type-body leading-6 text-muted gap-1">
                {missingData.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {safeNextActions.length > 0 ? (
            <div className="rounded-section border border-line bg-surface-strong p-3">
              <div className="type-caption uppercase tracking-wide text-muted">
                Safe next actions
              </div>
              <ul className="flex flex-col mt-2  type-body leading-6 text-muted gap-1">
                {safeNextActions.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StructuredToolOutput({ value }: { value: unknown }) {
  return (
    <div className="flex flex-col gap-3">
      <ErpReadToolOutputCard value={value} />
      <DiagnosisCards value={value} />
      <RecoveryPlanCard value={value} />
      <ApprovalOutputCard value={value} />
    </div>
  );
}

export function Tool({
  part,
  onApprove,
  onReject,
}: {
  part: ToolPart;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
}) {
  const approvalId = part.approval?.id;
  const displayValue = part.output ?? part.input;

  return (
    <div className="rounded-section border border-line bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="type-body font-semibold text-foreground">
          {part.type.replace(/^tool-/, "")}
        </div>
        <div className="rounded-control bg-slate-100 px-2 py-1 type-caption text-muted">
          {part.state ?? "pending"}
        </div>
      </div>
      <div className="flex flex-col mt-3 gap-3">
        <StructuredToolOutput value={part.output} />
        <details className="rounded-section border border-line bg-surface-strong">
          <summary className="cursor-pointer px-3 py-2 type-body font-medium text-foreground">
            Raw payload
          </summary>
          <div className="border-t border-line p-3">
            <CodeBlock
              code={renderStructuredValue(displayValue)}
              language="json"
            />
          </div>
        </details>
      </div>
      {part.state === "approval-requested" && approvalId ? (
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-control bg-slate-950 px-3 py-2 type-body font-medium text-white"
            onClick={() => onApprove?.(approvalId)}
            type="button"
          >
            Approve
          </button>
          <button
            className="rounded-control border border-line bg-surface px-3 py-2 type-body font-medium text-slate-700"
            onClick={() => onReject?.(approvalId)}
            type="button"
          >
            Reject
          </button>
        </div>
      ) : null}
    </div>
  );
}
