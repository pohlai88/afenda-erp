"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Search } from "lucide-react";
import { useState } from "react";
import { LYNX_ERP_HTTP_ROUTES } from "./lyn-core-contract";
import {
  LynxConversation,
  LynxMessage,
  LynxPromptInput,
} from "./lynx.chat-elements.component.client";
import { LynxEmptyState, LynxPanel } from "./lynx.panel.component.client";

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
    <LynxPanel
      description="Ask against tenant-scoped Knowledge with streamed evidence."
      icon={<Search className="h-4 w-4" aria-hidden />}
      title="Truth retrieval"
    >
      <LynxConversation>
        {messages.length === 0 ? (
          <LynxEmptyState
            icon={<Search className="h-4 w-4" aria-hidden />}
            title="No evidence query yet"
          >
            Ask for policy, SOP, audit, or migration evidence.
          </LynxEmptyState>
        ) : null}
        {messages.map((message) => (
          <LynxMessage key={message.id} message={message} />
        ))}
      </LynxConversation>
      <LynxPromptInput
        disabled={isBusy}
        onSubmit={handleSubmit}
        onValueChange={setInput}
        placeholder="Search Knowledge evidence"
        status={status}
        value={input}
      />
    </LynxPanel>
  );
}
