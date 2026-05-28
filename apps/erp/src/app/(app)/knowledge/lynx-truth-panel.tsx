"use client";

import { LYNX_ERP_HTTP_ROUTES } from "@afenda/feature-lynx";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Search } from "lucide-react";
import { useState } from "react";

import { Conversation } from "@/components/ai-elements/conversation";
import { Message } from "@/components/ai-elements/message";
import { PromptInput } from "@/components/ai-elements/prompt-input";

export function LynxTruthPanel() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: LYNX_ERP_HTTP_ROUTES.truthSearch,
    }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit() {
    const trimmedInput = input.trim();
    if (!trimmedInput || isBusy) {
      return;
    }

    sendMessage({ text: trimmedInput });
    setInput("");
  }

  return (
    <div className="rounded-lg border border-line bg-surface-strong">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Truth retrieval
          </div>
          <div className="mt-1 text-sm leading-6 text-muted">
            Ask against tenant-scoped Knowledge with streamed evidence.
          </div>
        </div>
        <Search className="mt-1 h-4 w-4 shrink-0 text-slate-700" aria-hidden />
      </div>

      <Conversation>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
            Ask for policy, SOP, audit, or migration evidence.
          </div>
        ) : null}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </Conversation>
      <PromptInput
        disabled={isBusy}
        onSubmit={handleSubmit}
        onValueChange={setInput}
        placeholder="Search Knowledge evidence"
        status={status}
        value={input}
      />
    </div>
  );
}
