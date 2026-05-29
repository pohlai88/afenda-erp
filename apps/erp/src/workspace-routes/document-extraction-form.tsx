"use client";

import { documentWorkflowCopy } from "@afenda/kernel";
import type { ModuleId } from "@afenda/kernel";
import { useState, type FormEvent } from "react";

const extractionCopy = documentWorkflowCopy.extraction;

type ExtractionState =
  | { status: "idle"; message: string }
  | { status: "running"; message: string }
  | { status: "completed"; message: string; payload: ExtractionPayload }
  | { status: "failed"; message: string };

type ExtractionPayload = {
  extractionId: string;
  status: string;
  extraction: {
    documentType: string;
    counterpartyName: string;
    reference: string;
    currency: string;
    totalAmountCents: number;
    confidence: number;
    recommendedAction: string;
    reviewNotes: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      amountCents: number;
    }>;
  };
};

const initialState: ExtractionState = {
  status: "idle",
  message: extractionCopy.idleMessage,
};

function getStateClassName(status: ExtractionState["status"]) {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "failed") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-line bg-surface text-muted";
}

function isExtractionPayload(payload: unknown): payload is ExtractionPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { extractionId?: unknown }).extractionId === "string" &&
    typeof (payload as { extraction?: unknown }).extraction === "object" &&
    (payload as { extraction?: unknown }).extraction !== null
  );
}

function formatAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function ExtractionReview({ payload }: { payload: ExtractionPayload }) {
  const extraction = payload.extraction;

  return (
    <div className="grid gap-surface-lg rounded-section border border-line bg-surface p-4">
      <div className="@container grid gap-3 @md:grid-cols-4">
        <div>
          <div className="type-caption uppercase tracking-wide text-muted">Type</div>
          <div className="mt-1 type-body font-semibold text-foreground">
            {extraction.documentType}
          </div>
        </div>
        <div>
          <div className="type-caption uppercase tracking-wide text-muted">
            Counterparty
          </div>
          <div className="mt-1 type-body font-semibold text-foreground">
            {extraction.counterpartyName}
          </div>
        </div>
        <div>
          <div className="type-caption uppercase tracking-wide text-muted">
            Reference
          </div>
          <div className="mt-1 type-body font-semibold text-foreground">
            {extraction.reference}
          </div>
        </div>
        <div>
          <div className="type-caption uppercase tracking-wide text-muted">
            Total
          </div>
          <div className="mt-1 type-body font-semibold text-foreground">
            {formatAmount(extraction.totalAmountCents, extraction.currency)}
          </div>
        </div>
      </div>
      <div className="@container grid gap-3 @md:grid-cols-3">
        <div className="rounded-section border border-line bg-surface-strong p-3">
          <div className="type-caption uppercase tracking-wide text-muted">
            Confidence
          </div>
          <div className="mt-1 type-card-title font-semibold text-foreground">
            {extraction.confidence}%
          </div>
        </div>
        <div className="rounded-section border border-line bg-surface-strong p-3">
          <div className="type-caption uppercase tracking-wide text-muted">
            Review status
          </div>
          <div className="mt-1 type-card-title font-semibold text-foreground">
            {payload.status}
          </div>
        </div>
        <div className="rounded-section border border-line bg-surface-strong p-3">
          <div className="type-caption uppercase tracking-wide text-muted">
            Suggested action
          </div>
          <div className="mt-1 type-card-title font-semibold text-foreground">
            {extraction.recommendedAction}
          </div>
        </div>
      </div>
      <div className="rounded-section border border-line bg-surface-strong p-3">
        <div className="type-caption uppercase tracking-wide text-muted">
          Review notes
        </div>
        <p className="mt-2 type-body leading-6 text-foreground">
          {extraction.reviewNotes}
        </p>
      </div>
      <div className="overflow-hidden rounded-section border border-line">
        <div className="border-b border-line bg-surface-strong px-3 py-2 type-body font-semibold text-foreground">
          {extractionCopy.lineItemsTitle}
        </div>
        <div className="divide-y divide-line">
          {extraction.lineItems.map((item, index) => (
            <div
              className="@container grid gap-2 px-3 py-2 type-body @md:grid-cols-[1fr_100px_140px]"
              key={`${item.description}-${index}`}
            >
              <div className="text-foreground">{item.description}</div>
              <div className="text-muted">{item.quantity}</div>
              <div className="font-medium text-foreground">
                {formatAmount(item.amountCents, extraction.currency)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <details className="rounded-section border border-line bg-surface-strong">
        <summary className="cursor-pointer px-3 py-2 type-body font-semibold text-foreground">
          {extractionCopy.rawPayloadTitle}
        </summary>
        <pre className="max-h-72 overflow-auto border-t border-line bg-slate-950 p-4 type-caption leading-5 text-slate-100">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export function DocumentExtractionForm({ moduleId }: { moduleId: ModuleId }) {
  const [state, setState] = useState<ExtractionState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const documentId = String(form.get("documentId") || "").trim();
    const documentText = String(form.get("documentText") || "").trim();

    setState({
      status: "running",
      message: extractionCopy.runningMessage,
    });

    try {
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId,
          title,
          documentId: documentId || undefined,
          documentText,
        }),
      });
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : extractionCopy.failureMessage;

        setState({
          status: "failed",
          message,
        });
        return;
      }

      if (isExtractionPayload(payload)) {
        setState({
          status: "completed",
          message: extractionCopy.successMessage,
          payload,
        });
        return;
      }

      setState({
        status: "failed",
        message: extractionCopy.unexpectedPayloadMessage,
      });
    } catch (error) {
      setState({
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : extractionCopy.failureMessage,
      });
    }
  }

  return (
    <form
      className="grid gap-surface-lg rounded-section border border-line bg-surface-strong p-4"
      onSubmit={handleSubmit}
    >
      <div className="@container grid gap-3 @md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block type-body font-medium text-foreground">
            {extractionCopy.titleLabel}
          </span>
          <input
            className="w-full rounded-section border border-line bg-surface px-3 py-2 type-body text-foreground outline-none transition focus:border-slate-400"
            name="title"
            placeholder={extractionCopy.titlePlaceholder}
            required
            type="text"
          />
        </label>
        <label className="block">
          <span className="mb-2 block type-body font-medium text-foreground">
            {extractionCopy.documentIdLabel}
          </span>
          <input
            className="w-full rounded-section border border-line bg-surface px-3 py-2 type-body text-foreground outline-none transition focus:border-slate-400"
            name="documentId"
            placeholder={extractionCopy.documentIdPlaceholder}
            type="text"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block type-body font-medium text-foreground">
          {extractionCopy.documentTextLabel}
        </span>
        <textarea
          className="min-h-32 w-full resize-y rounded-section border border-line bg-surface px-3 py-2 type-body text-foreground outline-none transition focus:border-slate-400"
          maxLength={12000}
          minLength={20}
          name="documentText"
          placeholder={extractionCopy.documentTextPlaceholder}
          required
        />
      </label>
      <div className="@container flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
        <div
          className={`rounded-section border px-3 py-2 type-body ${getStateClassName(state.status)}`}
          role="status"
        >
          {state.message}
        </div>
        <button
          className="rounded-section bg-slate-950 px-surface-lg py-2 type-body font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={state.status === "running"}
          type="submit"
        >
          {extractionCopy.submitLabel}
        </button>
      </div>
      {state.status === "completed" ? (
        <ExtractionReview payload={state.payload} />
      ) : null}
    </form>
  );
}
