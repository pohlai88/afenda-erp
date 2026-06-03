"use client";

import { useState, useTransition } from "react";
import { Button } from "@afenda/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";

import { captureHrGeoRemoteCheckinAction } from "./hr.time.geo.actions.server";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

type CaptureAction = "check_in" | "check_out" | "break_start" | "break_end";

async function readCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation_unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15_000,
    });
  });
}

export function HrGeoRemoteCheckinCapturePanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function capture(action: CaptureAction) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const position = await readCurrentPosition();
        const result = await captureHrGeoRemoteCheckinAction({
          action,
          capturedAt: new Date().toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          deviceReference: navigator.userAgent.slice(0, 120),
        });
        setMessage(
          `${hrGeoUiCopy.capture.success} (${result.status}; flags: ${result.validationFlags.join(", ") || "none"})`,
        );
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : hrGeoUiCopy.capture.error,
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-surface-md">
      <div className="flex flex-row flex-wrap gap-control">
        <Button
          type="button"
          disabled={pending}
          onClick={() => capture("check_in")}
        >
          {pending ? hrGeoUiCopy.capture.capturing : hrGeoUiCopy.capture.actionCheckIn}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => capture("check_out")}
        >
          {hrGeoUiCopy.capture.actionCheckOut}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => capture("break_start")}
        >
          {hrGeoUiCopy.capture.actionBreakStart}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => capture("break_end")}
        >
          {hrGeoUiCopy.capture.actionBreakEnd}
        </Button>
      </div>
      {message ? (
        <Alert>
          <AlertTitle>{hrGeoUiCopy.capture.success}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{hrGeoUiCopy.capture.error}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
