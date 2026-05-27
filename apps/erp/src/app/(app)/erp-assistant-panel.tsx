"use client";

import {
  erpAssistantPanelCopy,
  getAssistantEmptyStateHint,
  getAssistantPromptDefinitions,
} from "@afenda/domain";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Conversation } from "@/components/ai-elements/conversation";
import { Message } from "@/components/ai-elements/message";
import { PromptInput } from "@/components/ai-elements/prompt-input";
import { useState } from "react";

const assistantPrompts = getAssistantPromptDefinitions();

export function ErpAssistantPanel({
  contextModuleId,
}: {
  contextModuleId?: string;
}) {
  const [input, setInput] = useState("");
  const { addToolApprovalResponse, messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: contextModuleId ? { contextModuleId } : undefined,
    }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  function sendPrompt(prompt: string) {
    if (isBusy) {
      return;
    }

    sendMessage({ text: prompt });
  }

  function handleSubmit() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isBusy) {
      return;
    }

    sendPrompt(trimmedInput);
    setInput("");
  }

  return (
    <div className="rounded-lg border border-line bg-surface-strong">
      <div className="border-b border-line px-4 py-3">
        <div className="text-sm font-semibold text-foreground">
          {erpAssistantPanelCopy.title}
        </div>
        <div className="mt-1 text-sm text-muted">
          {erpAssistantPanelCopy.description}
        </div>
      </div>
      <div className="border-b border-line p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {assistantPrompts.map((prompt) => (
            <button
              key={prompt.id}
              className="rounded-lg border border-line bg-surface px-3 py-3 text-left text-sm font-medium leading-5 text-foreground transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onClick={() => sendPrompt(prompt.prompt)}
              type="button"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
      <Conversation>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
            Ask about {getAssistantEmptyStateHint()},{" "}
            {erpAssistantPanelCopy.emptyStateSuffix}
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
                reason: erpAssistantPanelCopy.toolRejectReason,
              })
            }
          />
        ))}
      </Conversation>
      <PromptInput
        disabled={isBusy}
        onSubmit={handleSubmit}
        onValueChange={setInput}
        placeholder={erpAssistantPanelCopy.inputPlaceholder}
        status={status}
        value={input}
      />
    </div>
  );
}
