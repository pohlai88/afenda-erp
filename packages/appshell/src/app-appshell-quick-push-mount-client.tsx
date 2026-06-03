"use client";

import { MessageCircle, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@afenda/ui";

export function AppShellQuickPushMount({
  children,
}: {
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!children) {
    return null;
  }

  return (
    <div className="af-appshell__quick-push">
      {open ? (
        <div className="af-appshell__quick-push-panel">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="text-sm font-semibold text-foreground">Quick push</div>
            <Button
              aria-label="Close quick push"
              className="af-appshell__icon-button af-appshell__icon-button--sm"
              size="icon-xs"
              onClick={() => setOpen(false)}
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" size={16} />
            </Button>
          </div>
          {children}
        </div>
      ) : null}
      <Button
        aria-expanded={open}
        aria-label={open ? "Hide quick push" : "Open quick push"}
        className="af-appshell__quick-push-trigger"
        data-icon="inline-start"
        onClick={() => setOpen((current) => !current)}
        size="sm"
        type="button"
        variant="default"
      >
        <MessageCircle aria-hidden="true" size={16} />
        <span>{open ? "Hide quick push" : "Quick push"}</span>
      </Button>
    </div>
  );
}
