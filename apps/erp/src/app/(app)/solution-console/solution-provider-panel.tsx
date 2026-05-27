"use client";

import {
  getRecoveryPlaybookDefinitions,
  getSolutionConsoleUxCards,
  solutionConsoleAgentCopy,
} from "@afenda/domain";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AlertTriangle,
  BadgeCheck,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Conversation } from "@/components/ai-elements/conversation";
import { Message } from "@/components/ai-elements/message";
import { PromptInput } from "@/components/ai-elements/prompt-input";
import { getRecoveryPlaybookIcon } from "@/lib/recovery-playbook-icons";
import { useState } from "react";

const recoveryPlaybooks = getRecoveryPlaybookDefinitions();
const solutionConsoleUxCards = getSolutionConsoleUxCards();

const solutionConsoleUxCardIcons = {
  "alert-triangle": AlertTriangle,
  "badge-check": BadgeCheck,
  send: Send,
} as const;

export function SolutionProviderPanel() {
  const [input, setInput] = useState("");
  const { addToolApprovalResponse, messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/solution-provider",
    }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  function sendPrompt(prompt: string, workflowId?: string) {
    if (isBusy) {
      return;
    }

    sendMessage(
      { text: prompt },
      workflowId ? { body: { workflowId } } : undefined,
    );
  }

  function handleSubmit() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isBusy) {
      return;
    }

    sendPrompt(trimmedInput);
    setInput("");
  }

  const emptyStateProblems = recoveryPlaybooks
    .map((playbook) => playbook.problem.toLowerCase())
    .join(", ");

  return (
    <div className="rounded-lg border border-line bg-surface-strong">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">
              {solutionConsoleAgentCopy.title}
            </div>
            <div className="mt-1 text-sm text-muted">
              {solutionConsoleAgentCopy.description}
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
        </div>
      </div>

      <div className="border-b border-line p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {recoveryPlaybooks.map((playbook) => {
            const Icon = getRecoveryPlaybookIcon(playbook.iconKey);

            return (
              <button
                key={playbook.id}
                className="flex min-h-16 items-start gap-3 rounded-lg border border-line bg-surface px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isBusy}
                onClick={() =>
                  sendPrompt(playbook.starterPrompt, playbook.workflowId)
                }
                type="button"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" aria-hidden />
                <span className="text-sm font-medium leading-5 text-foreground">
                  {playbook.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 border-b border-line p-4 md:grid-cols-3">
        {solutionConsoleUxCards.map((card) => {
          const Icon =
            solutionConsoleUxCardIcons[
              card.iconKey as keyof typeof solutionConsoleUxCardIcons
            ] ?? AlertTriangle;

          return (
            <div
              className="rounded-lg border border-line bg-surface p-3"
              key={card.id}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon
                  className={`h-4 w-4 ${
                    card.iconKey === "alert-triangle"
                      ? "text-amber-600"
                      : card.iconKey === "badge-check"
                        ? "text-emerald-600"
                        : "text-slate-700"
                  }`}
                  aria-hidden
                />
                {card.title}
              </div>
              <div className="mt-2 text-sm leading-6 text-muted">
                {card.description}
              </div>
            </div>
          );
        })}
      </div>

      <Conversation>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
            Start with a business problem such as {emptyStateProblems}.
          </div>
        ) : null}
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onApproveTool={(approvalId) =>
              addToolApprovalResponse({
                id: approvalId,
                approved: true,
              })
            }
            onRejectTool={(approvalId) =>
              addToolApprovalResponse({
                id: approvalId,
                approved: false,
                reason: solutionConsoleAgentCopy.toolRejectReason,
              })
            }
          />
        ))}
      </Conversation>
      <PromptInput
        disabled={isBusy}
        onSubmit={handleSubmit}
        onValueChange={setInput}
        placeholder={solutionConsoleAgentCopy.inputPlaceholder}
        status={status}
        value={input}
      />
    </div>
  );
}
