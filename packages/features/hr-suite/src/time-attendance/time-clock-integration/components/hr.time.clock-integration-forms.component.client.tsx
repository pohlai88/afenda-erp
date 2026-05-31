"use client";

import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import { SectionPanel } from "@afenda/ui";
import { Button } from "@afenda/ui/button";

import { hrTimeClockUiCopy } from "../surface/hr.time.clock-integration-ui.copy.shared";

export function HrTimeClockFormsPanel({ canAdmin }: { canAdmin: boolean }) {
  if (!canAdmin) {
    return null;
  }

  return (
    <div className="@container grid gap-surface-md @md:grid-cols-2">
      <SectionPanel
        headingLevel={4}
        title={hrTimeClockUiCopy.forms.registerDeviceTitle}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="tci-external-device-id">External device ID</FieldLabel>
            <Input id="tci-external-device-id" name="externalDeviceId" disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="tci-device-name">Device name</FieldLabel>
            <Input id="tci-device-name" name="name" disabled />
          </Field>
          <Button type="button" size="sm" disabled>
            Register device (wire actions)
          </Button>
        </FieldGroup>
      </SectionPanel>
      <SectionPanel
        headingLevel={4}
        title={hrTimeClockUiCopy.forms.registerMappingTitle}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="tci-mapping-device">Device ID</FieldLabel>
            <Input id="tci-mapping-device" name="deviceId" disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="tci-mapping-employee">Employee ID</FieldLabel>
            <Input id="tci-mapping-employee" name="employeeId" disabled />
          </Field>
          <Button type="button" size="sm" disabled>
            Create mapping (wire actions)
          </Button>
        </FieldGroup>
      </SectionPanel>
    </div>
  );
}
