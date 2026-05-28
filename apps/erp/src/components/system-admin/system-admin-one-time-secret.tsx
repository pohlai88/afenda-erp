export function SystemAdminOneTimeSecretPanel(input: {
  title: string;
  secret: string;
  detail?: string;
}) {
  return (
    <div className="mt-3 rounded-md border border-border bg-muted/50 p-3 text-sm">
      <p className="font-medium text-foreground">{input.title}</p>
      {input.detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{input.detail}</p>
      ) : null}
      <code className="mt-2 block overflow-x-auto rounded bg-background px-3 py-2 text-xs">
        {input.secret}
      </code>
    </div>
  );
}
