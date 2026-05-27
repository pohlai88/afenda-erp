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

          return null;
        })}
      </div>
    </div>
  );
}
