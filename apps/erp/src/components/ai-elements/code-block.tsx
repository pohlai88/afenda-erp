"use client";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-950">
      {language ? (
        <div className="border-b border-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
          {language}
        </div>
      ) : null}
      <pre className="max-h-64 overflow-auto p-3 text-xs leading-5 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
