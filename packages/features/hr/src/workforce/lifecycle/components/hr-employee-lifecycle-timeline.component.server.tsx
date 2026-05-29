import { formatErpDateTime } from "@afenda/kernel";
import { SectionPanel } from "@afenda/ui";
import type { HrLifecycleEventRow } from "../contracts/hr-lifecycle-event.contract";
import { hrLifecycleUiCopy } from "../surface/hr-lifecycle-ui.copy.shared";

export function HrEmployeeLifecycleTimelinePanel({
  events,
}: {
  events: readonly HrLifecycleEventRow[];
}) {
  const copy = hrLifecycleUiCopy.timeline;

  return (
    <SectionPanel title={copy.title} description={copy.description}>
      {events.length === 0 ? (
        <p className="type-muted">{copy.emptyLabel}</p>
      ) : (
        <ol className="flex flex-col gap-surface-md">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-control border border-line bg-surface-strong px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="type-body font-medium">{event.kind}</span>
                <span className="type-caption text-muted">
                  {formatErpDateTime(event.effectiveDate)}
                </span>
              </div>
              {event.previousStatus || event.newStatus ? (
                <p className="type-caption text-muted">
                  {event.previousStatus ?? "—"} → {event.newStatus ?? "—"}
                </p>
              ) : null}
              {event.reason ? (
                <p className="type-caption text-muted">{event.reason}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </SectionPanel>
  );
}
