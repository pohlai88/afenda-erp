import { Badge } from "@afenda/ui";

export function SystemAdminAuditCorrelationBadges({
  label,
  keys,
}: {
  label: string;
  keys: readonly string[];
}) {
  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-surface-sm">
      <span className="type-muted">{label}</span>
      {keys.map((key) => (
        <Badge key={key} variant="outline">
          {key}
        </Badge>
      ))}
    </div>
  );
}
