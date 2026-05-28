import type { DragEvent, ReactNode } from "react";
import type { Route } from "next";

import Link from "next/link";

import { Badge } from "@afenda/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card";
import type {
  GovernedKanbanBoardConfiguration,
  KanbanBadgeTone,
  KanbanBoardDataNature,
  KanbanCard,
  KanbanColumn,
} from "../../schemas/kanban-board.schema";
import type { KanbanCardDropState } from "../../index";
import { GovernedEmpty } from "../../client";
import { cn } from "@afenda/ui/utils";

export const KANBAN_DATA_NATURE_CLASS: Record<KanbanBoardDataNature, string> = {
  kanban: "@container flex flex-col gap-3",
};

const COLUMN_BADGE_VARIANT: Record<
  KanbanBadgeTone,
  "default" | "secondary" | "outline" | "destructive"
> = {
  default: "secondary",
  positive: "default",
  attention: "outline",
  critical: "destructive",
};

const KANBAN_CARD_TONE_CLASS: Record<KanbanBadgeTone, string> = {
  default: "",
  positive: "border-success/30 bg-success/5",
  attention: "border-warning/40 bg-warning/5",
  critical: "border-critical/40 bg-critical/5",
};

export const KANBAN_GRID_CLASS_DEFAULT =
  "grid grid-cols-1 gap-3 @sm:grid-cols-2 @3xl:grid-cols-4";

export const KANBAN_GRID_CLASS_WIDE =
  "grid grid-cols-1 gap-3 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 @3xl:grid-cols-6";

export function kanbanGridClass(columnCount: number): string {
  return columnCount >= 6 ? KANBAN_GRID_CLASS_WIDE : KANBAN_GRID_CLASS_DEFAULT;
}

export function resolveKanbanColumns(
  board: GovernedKanbanBoardConfiguration,
): KanbanColumn[] {
  const byId = new Map(board.columns.map((column) => [column.id, column]));

  if (board.columnOrder?.length) {
    return board.columnOrder
      .map((id) => byId.get(id))
      .filter((column): column is KanbanColumn => column !== undefined);
  }

  return board.columns;
}

export function groupCardsByColumn(cards: KanbanCard[]) {
  const map = new Map<string, KanbanCard[]>();

  for (const card of cards) {
    const list = map.get(card.columnId) ?? [];
    list.push(card);
    map.set(card.columnId, list);
  }

  return map;
}

export type KanbanColumnDropSurfaceProps = {
  dropState?: KanbanCardDropState | "none";
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLDivElement>) => void;
};

export type KanbanCardSurfaceProps = {
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLLIElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLLIElement>) => void;
  dragHandleAriaLabel?: string;
};

export function KanbanColumnPanel({
  column,
  cards,
  headingId,
  emptyColumnLabel,
  renderCard,
  columnDropSurface,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  headingId: string;
  emptyColumnLabel: string;
  renderCard: (card: KanbanCard) => ReactNode;
  columnDropSurface?: KanbanColumnDropSurfaceProps;
}) {
  const columnAriaLabel = `${column.label}, ${cards.length}`;
  const dropState = columnDropSurface?.dropState ?? "none";

  return (
    <Card
      className={cn(
        "flex min-h-40 flex-col transition-colors",
        dropState === "allowed" && "ring-2 ring-primary/40",
        dropState === "disabled" && "ring-2 ring-muted-foreground/25",
      )}
      role="region"
      aria-label={columnAriaLabel}
      data-kanban-drop-state={dropState}
      onDragOver={columnDropSurface?.onDragOver}
      onDrop={columnDropSurface?.onDrop}
      onDragLeave={columnDropSurface?.onDragLeave}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle id={headingId} className="type-control font-medium">
          {column.label}
        </CardTitle>
        {column.badgeTone ? (
          <Badge
            variant={COLUMN_BADGE_VARIANT[column.badgeTone]}
            aria-hidden="true"
          >
            {cards.length}
          </Badge>
        ) : (
          <span className="type-caption" aria-hidden="true">
            {cards.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2 pt-0">
        {cards.length === 0 ? (
          <KanbanEmptyColumn label={emptyColumnLabel} />
        ) : (
          <ul
            className="flex max-h-96 flex-col gap-2 overflow-y-auto"
            aria-labelledby={headingId}
          >
            {cards.map((card) => renderCard(card))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function KanbanEmptyColumn({ label }: { label: string }) {
  return (
    <GovernedEmpty
      model={{ variant: "muted", title: label }}
      className={cn("border-0 bg-transparent p-4 @sm:p-4")}
    />
  );
}

export function KanbanCardTile({
  card,
  footer,
  cardSurface,
}: {
  card: KanbanCard;
  footer?: ReactNode;
  cardSurface?: KanbanCardSurfaceProps;
}) {
  const titleId = `kanban-card-${card.id}-title`;

  return (
    <Card
      size="sm"
      className={cn(
        "border-border/80 shadow-none",
        KANBAN_CARD_TONE_CLASS[card.tone ?? "default"],
        cardSurface?.isDragging && "opacity-50",
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <article className="flex flex-col gap-2" aria-labelledby={titleId}>
          <div className="flex flex-col gap-0.5">
            {card.href ? (
              <Link
                id={titleId}
                href={card.href as Route}
                prefetch={false}
                className="type-control font-medium leading-snug text-primary hover:underline"
              >
                {card.title}
              </Link>
            ) : (
              <p id={titleId} className="type-control font-medium leading-snug">
                {card.title}
              </p>
            )}
            {card.subtitle ? (
              <p className="type-caption">{card.subtitle}</p>
            ) : null}
          </div>
          {card.badges?.length ? (
            <ul className="flex flex-wrap gap-1" aria-label="Status">
              {card.badges.map((badge) => (
                <li key={badge}>
                  <Badge variant="outline" className="type-caption font-normal">
                    {badge}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
          {card.metadataChips?.length ? (
            <ul className="flex flex-wrap gap-1" aria-label="Metadata">
              {card.metadataChips.map((chip) => (
                <li key={chip.label}>
                  <Badge
                    variant={COLUMN_BADGE_VARIANT[chip.tone ?? "default"]}
                    className="type-caption font-normal"
                  >
                    {chip.label}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
        {footer}
      </CardContent>
    </Card>
  );
}
