"use client";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="surface-code">
      {language ? (
        <div className="border-b border-code-block-border px-3 py-1 type-code-label">
          {language}
        </div>
      ) : null}
      <pre className="max-h-64 overflow-auto p-3 type-code">
        <code>{code}</code>
      </pre>
    </div>
  );
}
