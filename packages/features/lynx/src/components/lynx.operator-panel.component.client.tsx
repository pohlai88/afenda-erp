"use client";

import { Button, Card, CardContent } from "@afenda/ui";
import {
  getRecoveryPlaybookDefinitions,
  getSolutionConsoleUxCards,
  solutionConsoleAgentCopy,
  type RecoveryPlaybookIconKey,
} from "@afenda/kernel";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Boxes,
  ChartLine,
  ClipboardCheck,
  Scale,
  Send,
  Shield,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { LYNX_ERP_HTTP_ROUTES } from "../contracts/lynx.core.contract";
import {
  LynxConversation,
  LynxMessage,
  LynxPromptInput,
} from "./lynx.chat-elements.component.client";
import { LynxEmptyState, LynxPanel } from "./lynx.panel.component.client";

const recoveryPlaybooks = getRecoveryPlaybookDefinitions();
const solutionConsoleUxCards = getSolutionConsoleUxCards();

const recoveryPlaybookIcons = {
  "trending-down": TrendingDown,
  banknote: Banknote,
  boxes: Boxes,
  "clipboard-check": ClipboardCheck,
  "chart-line": ChartLine,
  scale: Scale,
  shield: Shield,
} as const satisfies Record<RecoveryPlaybookIconKey, LucideIcon>;

const solutionConsoleUxCardIcons = {
  "alert-triangle": AlertTriangle,
  "badge-check": BadgeCheck,
  send: Send,
} as const;

function getRecoveryPlaybookIcon(iconKey: RecoveryPlaybookIconKey) {
  return recoveryPlaybookIcons[iconKey];
}

export function LynxOperatorPanel({
  defaultWorkflowId,
  workflowSessionId,
}: {
  defaultWorkflowId?: string;
  workflowSessionId?: string;
}) {
  const [input, setInput] = useState("");
  const { addToolApprovalResponse, messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: LYNX_ERP_HTTP_ROUTES.operator,
    }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  function sendPrompt(prompt: string, workflowId?: string) {
    if (isBusy) {
      return;
    }

    const resolvedWorkflowId = workflowSessionId
      ? undefined
      : (workflowId ?? defaultWorkflowId);
    const body = {
      ...(resolvedWorkflowId ? { workflowId: resolvedWorkflowId } : {}),
      ...(workflowSessionId ? { workflowSessionId } : {}),
    };

    sendMessage(
      { text: prompt },
      Object.keys(body).length > 0 ? { body } : undefined,
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
    <LynxPanel
      description={solutionConsoleAgentCopy.description}
      icon={
        <img
          src="/icons/lynx/lynx-operator.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden
        />
      }
      title={solutionConsoleAgentCopy.title}
    >
      <div className="border-b border-border p-4">
        <div className="grid gap-2 @sm:grid-cols-2">
          {recoveryPlaybooks.map((playbook) => {
            const Icon = getRecoveryPlaybookIcon(playbook.iconKey);

            return (
              <Button
                key={playbook.id}
                className="h-auto min-h-16 justify-start whitespace-normal px-3 py-3 text-left"
                disabled={isBusy}
                onClick={() =>
                  sendPrompt(playbook.starterPrompt, playbook.workflowId)
                }
                type="button"
                variant="outline"
              >
                <Icon
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="text-sm font-medium leading-5 text-foreground">
                  {playbook.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 border-b border-border p-4 @md:grid-cols-3">
        {solutionConsoleUxCards.map((card) => {
          const Icon =
            solutionConsoleUxCardIcons[
              card.iconKey as keyof typeof solutionConsoleUxCardIcons
            ] ?? AlertTriangle;

          return (
            <Card
              className="border border-border shadow-none"
              key={card.id}
              size="sm"
            >
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon
                    className={`h-4 w-4 ${
                      card.iconKey === "alert-triangle"
                        ? "text-warning-foreground"
                        : card.iconKey === "badge-check"
                          ? "text-success"
                          : "text-muted-foreground"
                    }`}
                    aria-hidden
                  />
                  {card.title}
                </div>
                <div className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <LynxConversation>
        {messages.length === 0 ? (
          <LynxEmptyState title="No Lynx run yet">
            Start with a business problem such as {emptyStateProblems}.
          </LynxEmptyState>
        ) : null}
        {messages.map((message) => (
          <LynxMessage
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
      </LynxConversation>
      <LynxPromptInput
        disabled={isBusy}
        onSubmit={handleSubmit}
        onValueChange={setInput}
        placeholder={solutionConsoleAgentCopy.inputPlaceholder}
        status={status}
        value={input}
      />
    </LynxPanel>
  );
}
