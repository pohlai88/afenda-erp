"use client";

import { useEffect } from "react";

export const AFENDA_ORG_NOTIFICATION_REFRESH_EVENT =
  "afenda:org-notification-refresh";

export function AppShellOrgNotificationDelivery() {
  useEffect(() => {
    function dispatchRefresh() {
      window.dispatchEvent(
        new CustomEvent(AFENDA_ORG_NOTIFICATION_REFRESH_EVENT),
      );
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        dispatchRefresh();
      }
    }

    window.addEventListener("focus", dispatchRefresh);
    window.addEventListener("online", dispatchRefresh);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", dispatchRefresh);
      window.removeEventListener("online", dispatchRefresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
