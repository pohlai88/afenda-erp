"use client";

import { Tool, type ToolPart } from "./tool";

type TextPart = {
  type: "text";
  text: string;
};

type AiMessage = {
  id: string;
  role: string;
  parts: unknown[];
};

type DataPart = {
  type: string;
  data: unknown;
};

function isTextPart(part: unknown): part is TextPart {
  return (
    typeof part === "object" &&
    part !== null &&
    (part as { type?: unknown }).type === "text" &&
    typeof (part as { text?: unknown }).text === "string"
  );
}

function isToolPart(part: unknown): part is ToolPart {
  return (
    typeof part === "object" &&
    part !== null &&
    typeof (part as { type?: unknown }).type === "string" &&
    ((part as { type: string }).type.startsWith("tool-") ||
      (part as { type: string }).type === "dynamic-tool")
  );
}

function isDataPart(part: unknown): part is DataPart {
  return (
    typeof part === "object" &&
    part !== null &&
    typeof (part as { type?: unknown }).type === "string" &&
    (part as { type: string }).type.startsWith("data-") &&
    "data" in part
  );
}

function LynxTruthEvidence({ data }: { data: unknown }) {
  const evidence = data as {
    chunkCount?: number;
    passages?: Array<{
      passage?: number;
      title?: string;
      excerpt?: string;
    }>;
  };

  if (!Array.isArray(evidence.passages)) {
    return null;
  }

  return (
    <div className="rounded-md border border-line bg-surface-strong p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Evidence ({evidence.chunkCount ?? evidence.passages.length})
      </div>
      <div className="space-y-2">
        {evidence.passages.slice(0, 5).map((passage, index) => (
          <div
            className="rounded border border-line bg-surface px-3 py-2 text-xs"
            key={`${passage.passage ?? index}-${passage.title ?? "passage"}`}
          >
            <div className="font-medium text-foreground">
              [{passage.passage ?? index + 1}] {passage.title ?? "Untitled"}
            </div>
            <p className="mt-1 line-clamp-3 text-muted">
              {passage.excerpt ?? ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LynxQualityGate({ data }: { data: unknown }) {
  const payload = data as {
    gate?: {
      status?: string;
      unsupportedClaimCount?: number;
      citationPrecision?: number;
      reasons?: string[];
    };
    claims?: Array<{
      claim?: { text?: string };
      status?: string;
      reason?: string;
    }>;
  };

  if (!payload.gate) {
    return null;
  }

  const precision =
    typeof payload.gate.citationPrecision === "number"
      ? `${Math.round(payload.gate.citationPrecision * 100)}%`
      : "-";

  return (
    <div className="rounded-md border border-line bg-surface-strong p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium uppercase tracking-wide text-muted">
          Evidence quality
        </span>
        <span className="rounded border border-line bg-surface px-2 py-1 font-medium text-foreground">
          {payload.gate.status ?? "review"}
        </span>
      </div>
      <div className="grid gap-2 text-xs text-muted sm:grid-cols-2">
        <div>Unsupported: {payload.gate.unsupportedClaimCount ?? 0}</div>
        <div>Citation precision: {precision}</div>
      </div>
      {Array.isArray(payload.claims) && payload.claims.length > 0 ? (
        <div className="mt-3 space-y-2">
          {payload.claims.slice(0, 4).map((claim, index) => (
            <div
              className="rounded border border-line bg-surface px-3 py-2 text-xs"
              key={`${claim.status ?? "claim"}-${index}`}
            >
              <div className="font-medium text-foreground">
                {claim.status ?? "review"}
              </div>
              <p className="mt-1 line-clamp-2 text-muted">
                {claim.claim?.text ?? claim.reason ?? ""}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MessageResponse({ children }: { children: string }) {
  return (
    <div className="space-y-2 text-sm leading-6">
      {children.split(/\n{2,}/).map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export function Message({
  message,
  onApproveTool,
  onRejectTool,
}: {
  message: AiMessage;
  onApproveTool?: (approvalId: string) => void;
  onRejectTool?: (approvalId: string) => void;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        message.role === "user"
          ? "border-slate-200 bg-slate-50"
          : "border-line bg-surface"
      }`}
    >
      <div className="mb-3 text-xs uppercase tracking-wide text-muted">
        {message.role}
      </div>
      <div className="space-y-3">
        {message.parts.map((part, index) => {
          const key = `${message.id}-${index}`;

          if (isTextPart(part)) {
            return <MessageResponse key={key}>{part.text}</MessageResponse>;
          }

          if (isToolPart(part)) {
            return (
              <Tool
                key={part.toolCallId ?? key}
                onApprove={onApproveTool}
                onReject={onRejectTool}
                part={part}
              />
            );
          }

          if (isDataPart(part)) {
            if (part.type === "data-lynx-truth-evidence") {
              return <LynxTruthEvidence key={key} data={part.data} />;
            }
            if (part.type === "data-lynx-quality-gate") {
              return <LynxQualityGate key={key} data={part.data} />;
            }
          }

          return null;
        })}
      </div>
    </div>
  );
}
