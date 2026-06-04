"use client";

import { Badge, Button, Card, CardContent, Textarea } from "@afenda/ui";
import {
  ArrowDown,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Flag,
  LoaderCircle,
  Send,
  ThumbsUp,
} from "lucide-react";
import {
  type ComponentProps,
  type FormEvent,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Streamdown, type Components, type ExtraProps } from "streamdown";
import { LYNX_ERP_HTTP_ROUTES } from "./lyn-core.contract";
import {
  lynxRunContextDataSchema,
  lynxRunContextMetadataSchema,
  type LynxRunContextData,
  type LynxRunFeedbackCategory,
  type LynxRunFeedbackRating,
} from "./lyn-run-feedback.schema";
import {
  lynxTruthEvidenceDataSchema,
  lynxTruthQualityGateDataSchema,
} from "./lyn-truth.schema";
import {
  getLynxChatStatus,
  getLynxRunStepState,
  isSafeLynxHref,
  linkLynxCitations,
  type LynxRunStepState,
} from "./lyn-chat-format.shared";
import {
  LynxEvidenceCard,
  LynxMetricCard,
} from "./lyn-panel.component.client";
import {
  getLynxToolDisplayName,
  LynxToolCard,
  type LynxToolPart,
} from "./lyn-tool-output.component.client";

type TextPart = {
  type: "text";
  text: string;
};

type DataPart = {
  type: string;
  data: unknown;
};

type LynxMessagePayload = {
  id: string;
  metadata?: unknown;
  role: string;
  parts: unknown[];
};

type BadgeVariant = ComponentProps<typeof Badge>["variant"];
type LynxAnchorProps = JSX.IntrinsicElements["a"] & ExtraProps;
type CopyState = "idle" | "copied";
type LiveFeedbackState =
  | "idle"
  | "submitting"
  | "positive"
  | "negative"
  | "blocked";

type LynxRunStep = {
  id: string;
  label: string;
  state: LynxRunStepState;
};

const liveFeedbackCategoryByRating = {
  positive: "accurate",
  negative: "unsupported",
} as const satisfies Record<LynxRunFeedbackRating, LynxRunFeedbackCategory>;

const LynxMarkdownAnchor: NonNullable<Components["a"]> = ({
  children,
  href,
  node: _node,
  ...props
}: LynxAnchorProps) => (
  <LynxCitationLink href={href} {...props}>
    {children}
  </LynxCitationLink>
);

const LynxMarkdownImage: NonNullable<Components["img"]> = () => null;

const lynxMarkdownComponents: Pick<Components, "a" | "img"> = {
  a: LynxMarkdownAnchor,
  img: LynxMarkdownImage,
};

export type LynxSourceItem = {
  id: string;
  passage: number;
  title: string;
  excerpt: string;
  href?: string;
  meta?: string;
};

function isTextPart(part: unknown): part is TextPart {
  return (
    typeof part === "object" &&
    part !== null &&
    (part as { type?: unknown }).type === "text" &&
    typeof (part as { text?: unknown }).text === "string"
  );
}

function isToolPart(part: unknown): part is LynxToolPart {
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

function qualityVariant(value: string | undefined): BadgeVariant {
  if (value === "passed" || value === "supported") {
    return "success";
  }

  if (value === "failed" || value === "unsupported" || value === "declined") {
    return "critical";
  }

  return "warning";
}

function getMessageCitationTargetPrefix(messageId: string) {
  return `lynx-message-${messageId.replace(/[^a-zA-Z0-9_-]/g, "-")}-evidence`;
}

function getMessageText(parts: unknown[]) {
  return parts
    .filter(isTextPart)
    .map((part) => part.text)
    .join("\n\n");
}

function getEvidenceSourcesFromData(data: unknown): LynxSourceItem[] {
  const parsed = lynxTruthEvidenceDataSchema.safeParse(data);

  if (!parsed.success) {
    return [];
  }

  return parsed.data.passages.slice(0, 5).map((passage) => ({
    id: passage.id,
    passage: passage.passage,
    title: passage.title,
    excerpt: passage.excerpt,
  }));
}

function formatEvidenceSources(sources: readonly LynxSourceItem[]) {
  return sources
    .map((source) => {
      const excerpt = source.excerpt.replace(/\s+/g, " ").trim();
      return `[${source.passage}] ${source.title}: ${excerpt}`;
    })
    .join("\n");
}

function getEvidenceSources(parts: unknown[]): LynxSourceItem[] {
  return parts.flatMap((part) => {
    if (!isDataPart(part) || part.type !== "data-lynx-truth-evidence") {
      return [];
    }

    return getEvidenceSourcesFromData(part.data);
  });
}

function getEvidenceSummary(parts: unknown[]) {
  return formatEvidenceSources(getEvidenceSources(parts));
}

function getMessageRunContext(
  message: LynxMessagePayload,
): LynxRunContextData | null {
  const metadata = lynxRunContextMetadataSchema.safeParse(message.metadata);

  if (metadata.success) {
    return metadata.data.lynxRun;
  }

  for (const part of message.parts) {
    if (!isDataPart(part) || part.type !== "data-lynx-run-context") {
      continue;
    }

    const parsed = lynxRunContextDataSchema.safeParse(part.data);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return null;
}

function getRunSteps(parts: unknown[]): LynxRunStep[] {
  return parts.flatMap((part, index) => {
    if (isToolPart(part)) {
      const toolName = getLynxToolDisplayName(part);

      return [
        {
          id: part.toolCallId ?? `${toolName}-${index}`,
          label: toolName,
          state: getLynxRunStepState(part.state),
        },
      ];
    }

    if (isDataPart(part)) {
      if (part.type === "data-lynx-truth-evidence") {
        return [
          {
            id: `evidence-${index}`,
            label: "evidence verified",
            state: "verified" as const,
          },
        ];
      }

      if (part.type === "data-lynx-quality-gate") {
        const parsed = lynxTruthQualityGateDataSchema.safeParse(part.data);

        return [
          {
            id: `quality-${index}`,
            label: "quality gate",
            state: parsed.success
              ? getLynxRunStepState(parsed.data.gate.status)
              : ("blocked" as const),
          },
        ];
      }
    }

    return [];
  });
}

function runStepVariant(state: LynxRunStepState): BadgeVariant {
  if (state === "verified") {
    return "success";
  }

  if (state === "blocked") {
    return "critical";
  }

  if (state === "resolving") {
    return "warning";
  }

  return "outline";
}

async function writeClipboard(value: string) {
  if (!value.trim()) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function LynxCitationLink({
  children,
  href,
  ...props
}: ComponentProps<"a">) {
  if (!isSafeLynxHref(href)) {
    return <span>{children}</span>;
  }

  const isExternal = href?.startsWith("https://");

  return (
    <a
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      href={href}
      {...props}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}

export function LynxSources({
  citationTargetPrefix,
  sources,
  title = "Evidence",
}: {
  citationTargetPrefix?: string;
  sources: readonly LynxSourceItem[];
  title?: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const firstSafeHref = sources.find((source) =>
    isSafeLynxHref(source.href),
  )?.href;
  const isExternalSource = firstSafeHref?.startsWith("https://");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState("idle"), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  if (sources.length === 0) {
    return null;
  }

  async function copySources() {
    if (await writeClipboard(formatEvidenceSources(sources))) {
      setCopyState("copied");
    }
  }

  return (
    <details
      className="rounded-section border border-border bg-background/60"
      open={sources.length <= 3}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
        <div className="type-label">
          {title}
        </div>
        <Badge variant="outline">{sources.length}</Badge>
      </summary>
      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="type-caption">
            {sources.length} source{sources.length === 1 ? "" : "s"} tied to
            this response.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy Lynx sources"
              onClick={copySources}
              size="xs"
              type="button"
              variant="outline"
            >
              {copyState === "copied" ? (
                <Check aria-hidden data-icon="inline-start" />
              ) : (
                <Copy aria-hidden data-icon="inline-start" />
              )}
              {copyState === "copied" ? "Copied" : "Copy sources"}
            </Button>
            {firstSafeHref ? (
              <Button asChild size="xs" variant="outline">
                <a
                  href={firstSafeHref}
                  rel={isExternalSource ? "noreferrer" : undefined}
                  target={isExternalSource ? "_blank" : undefined}
                >
                  <ExternalLink aria-hidden data-icon="inline-start" />
                  Open source
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        {sources.map((source) => (
          <LynxEvidenceCard
            href={source.href}
            id={
              citationTargetPrefix
                ? `${citationTargetPrefix}-${source.passage}`
                : undefined
            }
            key={`${source.passage}-${source.id}`}
            meta={source.meta ?? `#${source.passage}`}
            signal={source.excerpt}
            title={source.title}
          />
        ))}
      </div>
    </details>
  );
}

function LynxTruthEvidence({
  citationTargetPrefix,
  data,
}: {
  citationTargetPrefix: string;
  data: unknown;
}) {
  const parsed = lynxTruthEvidenceDataSchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }

  const evidence = parsed.data;
  const sources = getEvidenceSourcesFromData(data);

  return (
    <LynxSources
      citationTargetPrefix={citationTargetPrefix}
      sources={sources}
      title={`Evidence (${evidence.chunkCount})`}
    />
  );
}

function LynxQualityGate({ data }: { data: unknown }) {
  const parsed = lynxTruthQualityGateDataSchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }

  const payload = parsed.data;
  const precision = `${Math.round(payload.gate.citationPrecision * 100)}%`;

  return (
    <section className="@container rounded-section border border-border bg-background/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="type-label">
          Evidence quality
        </div>
        <Badge variant={qualityVariant(payload.gate.status)}>
          {payload.gate.status ?? "review"}
        </Badge>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid gap-2 @sm:grid-cols-2">
          <LynxMetricCard
            label="Unsupported"
            value={payload.gate.unsupportedClaimCount}
          />
          <LynxMetricCard label="Citation precision" value={precision} />
        </div>
        {payload.claims.length > 0 ? (
          <div className="flex flex-col gap-2">
            {payload.claims.slice(0, 4).map((claim) => (
              <Card
                className="border border-border shadow-none"
                key={claim.claim.id}
                size="sm"
              >
                <CardContent className="flex flex-col gap-1">
                  <Badge variant={qualityVariant(claim.status)}>
                    {claim.status}
                  </Badge>
                  <p className="line-clamp-2 type-muted">
                    {claim.claim.text || claim.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function LynxConversation({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isAtLatest, setIsAtLatest] = useState(true);

  function scrollToLatest(behavior: ScrollBehavior = "smooth") {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      behavior,
      top: viewport.scrollHeight,
    });
  }

  function handleScroll() {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setIsAtLatest(distanceFromBottom < 48);
  }

  useEffect(() => {
    if (isAtLatest) {
      scrollToLatest("auto");
    }
  }, [children, isAtLatest]);

  return (
    <div className="relative">
      <div
        aria-live="polite"
        className="flex max-h-[520px] flex-col gap-surface-lg overflow-y-auto px-surface-lg py-surface-lg" // audit-ds: ignore no-arbitrary-value — conversation scroll viewport height contract
        onScroll={handleScroll}
        ref={viewportRef}
        role="log"
      >
        {children}
      </div>
      {!isAtLatest ? (
        <Button
          aria-label="Scroll to latest Lynx response"
          className="absolute bottom-3 right-3 shadow-elevation-1"
          onClick={() => scrollToLatest()}
          size="sm"
          type="button"
          variant="outline"
        >
          <ArrowDown aria-hidden data-icon="inline-start" />
          Latest
        </Button>
      ) : null}
    </div>
  );
}

export function LynxPromptInput({
  disabled,
  onSubmit,
  onValueChange,
  placeholder,
  status,
  value,
}: {
  disabled?: boolean;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  status: string;
  value: string;
}) {
  const lynxStatus = getLynxChatStatus(status);
  const canSubmit = !disabled && value.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (canSubmit) {
        onSubmit();
      }
    }
  }

  return (
    <form className="border-t border-border p-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="sr-only">Ask Lynx</span>
        <Textarea
          className="min-h-24 resize-y bg-background"
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Badge variant={lynxStatus === "blocked" ? "critical" : "outline"}>
          {lynxStatus}
        </Badge>
        <Button disabled={!canSubmit} type="submit">
          {disabled ? (
            <LoaderCircle
              aria-hidden
              className="animate-spin"
              data-icon="inline-start"
            />
          ) : (
            <Send aria-hidden data-icon="inline-start" />
          )}
          Send
        </Button>
      </div>
    </form>
  );
}

export function LynxMessageResponse({
  children,
  citationTargetPrefix,
}: {
  children: string;
  citationTargetPrefix?: string;
}) {
  const markdown = linkLynxCitations(children, citationTargetPrefix);

  return (
    <Streamdown
      className="type-body"
      components={lynxMarkdownComponents}
      controls={{
        code: {
          copy: true,
          download: false,
        },
        table: {
          copy: true,
          download: false,
        },
      }}
      mode="streaming"
      parseIncompleteMarkdown
      skipHtml
      urlTransform={(url) => (isSafeLynxHref(url) ? url : null)}
    >
      {markdown}
    </Streamdown>
  );
}

export function LynxMessageActions({ content }: { content: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState("idle"), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  if (!content.trim()) {
    return null;
  }

  async function copyContent() {
    if (await writeClipboard(content)) {
      setCopyState("copied");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        aria-label="Copy Lynx response"
        onClick={copyContent}
        size="xs"
        type="button"
        variant="outline"
      >
        {copyState === "copied" ? (
          <Check aria-hidden data-icon="inline-start" />
        ) : (
          <Copy aria-hidden data-icon="inline-start" />
        )}
        {copyState === "copied" ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export function LynxEvidenceActions({ content }: { content: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState("idle"), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  if (!content.trim()) {
    return null;
  }

  async function copyContent() {
    if (await writeClipboard(content)) {
      setCopyState("copied");
    }
  }

  return (
    <Button
      aria-label="Copy Lynx evidence summary"
      onClick={copyContent}
      size="xs"
      type="button"
      variant="outline"
    >
      {copyState === "copied" ? (
        <Check aria-hidden data-icon="inline-start" />
      ) : (
        <FileText aria-hidden data-icon="inline-start" />
      )}
      {copyState === "copied" ? "Evidence copied" : "Copy evidence"}
    </Button>
  );
}

export function LynxLiveFeedbackActions({
  messageId,
  runContext,
}: {
  messageId: string;
  runContext: LynxRunContextData;
}) {
  const [feedbackState, setFeedbackState] = useState<LiveFeedbackState>("idle");

  const hasSavedFeedback =
    feedbackState === "positive" || feedbackState === "negative";
  const isSubmitting = feedbackState === "submitting";

  async function submitFeedback(rating: LynxRunFeedbackRating) {
    if (isSubmitting || hasSavedFeedback) {
      return;
    }

    setFeedbackState("submitting");

    try {
      const response = await fetch(LYNX_ERP_HTTP_ROUTES.runFeedback, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          runId: runContext.runId,
          messageId,
          rating,
          category: liveFeedbackCategoryByRating[rating],
        }),
      });

      if (!response.ok) {
        throw new Error(`Feedback request failed with ${response.status}.`);
      }

      setFeedbackState(rating);
    } catch {
      setFeedbackState("blocked");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        aria-label="Mark Lynx response helpful"
        aria-pressed={feedbackState === "positive"}
        disabled={isSubmitting || hasSavedFeedback}
        onClick={() => void submitFeedback("positive")}
        size="xs"
        type="button"
        variant={feedbackState === "positive" ? "secondary" : "outline"}
      >
        <ThumbsUp aria-hidden data-icon="inline-start" />
        Helpful
      </Button>
      <Button
        aria-label="Flag Lynx response for review"
        aria-pressed={feedbackState === "negative"}
        disabled={isSubmitting || hasSavedFeedback}
        onClick={() => void submitFeedback("negative")}
        size="xs"
        type="button"
        variant={feedbackState === "negative" ? "secondary" : "outline"}
      >
        <Flag aria-hidden data-icon="inline-start" />
        Needs review
      </Button>
      {feedbackState !== "idle" ? (
        <Badge
          aria-live="polite"
          variant={feedbackState === "blocked" ? "critical" : "outline"}
        >
          {feedbackState === "submitting"
            ? "Saving feedback"
            : feedbackState === "blocked"
              ? "Could not save"
              : "Feedback saved"}
        </Badge>
      ) : null}
    </div>
  );
}

export function LynxRunSteps({ steps }: { steps: readonly LynxRunStep[] }) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="rounded-section border border-border bg-background/60 p-3">
      <div className="mb-2 type-label">
        Run steps
      </div>
      <ol className="flex flex-col gap-2">
        {steps.map((step) => (
          <li
            className="flex items-center justify-between gap-3 type-body"
            key={step.id}
          >
            <span className="font-medium text-foreground">{step.label}</span>
            <Badge variant={runStepVariant(step.state)}>{step.state}</Badge>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LynxMessage({
  message,
  onApproveTool,
  onRejectTool,
}: {
  message: LynxMessagePayload;
  onApproveTool?: (approvalId: string) => void;
  onRejectTool?: (approvalId: string) => void;
}) {
  const isUser = message.role === "user";
  const messageText = getMessageText(message.parts);
  const citationTargetPrefix = getMessageCitationTargetPrefix(message.id);
  const evidenceSummary = getEvidenceSummary(message.parts);
  const runSteps = getRunSteps(message.parts);
  const runContext = getMessageRunContext(message);

  return (
    <article
      className={`border border-border shadow-none ${
        isUser ? "bg-muted/40" : "bg-card"
      } rounded-section p-4`}
    >
      <div className="mb-3">
        <Badge variant={isUser ? "secondary" : "outline"}>
          {isUser ? "You" : "Lynx"}
        </Badge>
      </div>
      <div className="flex flex-col gap-3">
        {!isUser ? <LynxRunSteps steps={runSteps} /> : null}
        {message.parts.map((part, index) => {
          const key = `${message.id}-${index}`;

          if (isTextPart(part)) {
            return (
              <LynxMessageResponse
                citationTargetPrefix={citationTargetPrefix}
                key={key}
              >
                {part.text}
              </LynxMessageResponse>
            );
          }

          if (isToolPart(part)) {
            return (
              <LynxToolCard
                key={part.toolCallId ?? key}
                onApprove={onApproveTool}
                onReject={onRejectTool}
                part={part}
              />
            );
          }

          if (isDataPart(part)) {
            if (part.type === "data-lynx-truth-evidence") {
              return (
                <LynxTruthEvidence
                  citationTargetPrefix={citationTargetPrefix}
                  data={part.data}
                  key={key}
                />
              );
            }
            if (part.type === "data-lynx-quality-gate") {
              return <LynxQualityGate key={key} data={part.data} />;
            }
          }

          return null;
        })}
        {!isUser ? (
          <div className="flex flex-wrap gap-2">
            <LynxMessageActions content={messageText} />
            <LynxEvidenceActions content={evidenceSummary} />
            {runContext ? (
              <LynxLiveFeedbackActions
                messageId={message.id}
                runContext={runContext}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
