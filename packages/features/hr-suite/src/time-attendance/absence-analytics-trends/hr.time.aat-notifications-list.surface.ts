import type { HrAatNotificationWindow } from "./hrs-hr-time-aat-notifications-server";
import {
  buildAatListSearchToolbar,
  buildAatOperationalListSurface,
  formatAatRiskLevelLabel,
} from "./hr.time.aat-list.shared";
import { hrAatUiCopy } from "./hr.time.aat-ui.copy.shared";
import {
  hrAatNotificationsColumnsId,
  hrAatNotificationsSearchParam,
  hrAatNotificationsSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

export { hrAatNotificationsSurfaceKey };

export function buildHrAatNotificationsListSurface(input: {
  window: HrAatNotificationWindow;
  searchValue?: string;
}) {
  const copy = hrAatUiCopy.notifications;

  return buildAatOperationalListSurface({
    primaryColumnId: "title",
    searchToolbar: buildAatListSearchToolbar({
      param: hrAatNotificationsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrAatNotificationsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "title", header: copy.colTitle, pin: "start", priority: "primary", wrap: true },
      { id: "riskLevel", header: copy.colRiskLevel },
      { id: "recipient", header: copy.colRecipient },
      { id: "when", header: copy.colWhen },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        riskLevel: formatAatRiskLevelLabel(row.riskLevel),
        recipient: row.recipientRole,
        when: row.createdAt.toISOString(),
      },
    })),
  });
}
