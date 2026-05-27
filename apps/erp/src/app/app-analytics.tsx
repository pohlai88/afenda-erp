"use client";

import { shouldIgnoreAnalyticsPathname } from "@afenda/observability";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

function filterAnalyticsEvent(event: BeforeSendEvent) {
  if (shouldIgnoreAnalyticsPathname(event.url)) {
    return null;
  }

  return event;
}

export function AppAnalytics() {
  return (
    <>
      <Analytics beforeSend={filterAnalyticsEvent} />
      <SpeedInsights />
    </>
  );
}
