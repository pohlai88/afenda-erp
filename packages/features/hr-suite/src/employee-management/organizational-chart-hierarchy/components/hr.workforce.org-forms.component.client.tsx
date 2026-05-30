"use client";

import { useActionState } from "react";

import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { Label } from "@afenda/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select";
import type { ActionResult } from "@afenda/governed-surface/schemas";

import {
  upsertHrOrgUnitAction,
  upsertHrOrgPositionAction,
  upsertHrReportingRelationshipAction,
} from "../actions/hr.workforce.org.actions.server";
import { hrOrgUiCopy } from "../surface/hr.workforce.org-ui.copy.shared";

type PickerOption = { value: string; label: string };

function ActionMessage({ result }: { result: ActionResult | undefined }) {
  if (!result) return null;
  return (
    <p className={result.ok ? "type-caption text-emerald-600" : "type-caption text-critical"}>
      {result.ok ? "Saved." : result.error}
    </p>
  );
}

export function HrOrgUnitForm({
  orgUnitOptions,
  employeeOptions,
}: {
  orgUnitOptions: PickerOption[];
  employeeOptions: PickerOption[];
}) {
  const [result, action, pending] = useActionState(upsertHrOrgUnitAction, undefined);
  const copy = hrOrgUiCopy.forms;

  return (
    <form action={action} className="flex flex-col gap-3 rounded-section border p-4">
      <h3 className="type-subtitle">{copy.orgUnitTitle}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="org-unit-code">Code</Label>
          <Input id="org-unit-code" name="code" required />
        </div>
        <div>
          <Label htmlFor="org-unit-name">Name</Label>
          <Input id="org-unit-name" name="name" required />
        </div>
        <div>
          <Label htmlFor="org-unit-type">Type</Label>
          <Select name="unitType" defaultValue="department">
            <SelectTrigger id="org-unit-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legal_entity">Legal entity</SelectItem>
              <SelectItem value="business_unit">Business unit</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="sub_department">Sub-department</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-unit-status">Status</Label>
          <Select name="orgUnitStatus" defaultValue="active">
            <SelectTrigger id="org-unit-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-unit-parent">Parent unit</Label>
          <Select name="parentDepartmentId">
            <SelectTrigger id="org-unit-parent">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {orgUnitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-unit-manager">Manager</Label>
          <Select name="managerEmployeeId">
            <SelectTrigger id="org-unit-manager">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-unit-location">Location code</Label>
          <Input id="org-unit-location" name="locationCode" />
        </div>
        <div>
          <Label htmlFor="org-unit-legal-entity">Legal entity code</Label>
          <Input id="org-unit-legal-entity" name="legalEntityCode" />
        </div>
        <div>
          <Label htmlFor="org-unit-cost-center">Cost center</Label>
          <Input id="org-unit-cost-center" name="costCenterCode" />
        </div>
        <div>
          <Label htmlFor="org-unit-effective-from">Effective from</Label>
          <Input id="org-unit-effective-from" name="effectiveFrom" type="datetime-local" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {copy.submitLabel}
      </Button>
      <ActionMessage result={result} />
    </form>
  );
}

export function HrOrgPositionForm({
  orgUnitOptions,
  employeeOptions,
}: {
  orgUnitOptions: PickerOption[];
  employeeOptions: PickerOption[];
}) {
  const [result, action, pending] = useActionState(upsertHrOrgPositionAction, undefined);
  const copy = hrOrgUiCopy.forms;

  return (
    <form action={action} className="flex flex-col gap-3 rounded-section border p-4">
      <h3 className="type-subtitle">{copy.positionTitle}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="org-position-code">Code</Label>
          <Input id="org-position-code" name="code" required />
        </div>
        <div>
          <Label htmlFor="org-position-title">Title</Label>
          <Input id="org-position-title" name="title" required />
        </div>
        <div>
          <Label htmlFor="org-position-department">Organization unit</Label>
          <Select name="departmentId" required>
            <SelectTrigger id="org-position-department">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {orgUnitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-position-status">Status</Label>
          <Select name="positionStatus" defaultValue="active">
            <SelectTrigger id="org-position-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-position-manager">Manager</Label>
          <Select name="managerEmployeeId">
            <SelectTrigger id="org-position-manager">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-position-location">Location code</Label>
          <Input id="org-position-location" name="locationCode" />
        </div>
        <div>
          <Label htmlFor="org-position-cost-center">Cost center</Label>
          <Input id="org-position-cost-center" name="costCenterCode" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {copy.submitLabel}
      </Button>
      <ActionMessage result={result} />
    </form>
  );
}

export function HrOrgReportingLineForm({
  employeeOptions,
}: {
  employeeOptions: PickerOption[];
}) {
  const [result, action, pending] = useActionState(
    upsertHrReportingRelationshipAction,
    undefined,
  );
  const copy = hrOrgUiCopy.forms;

  return (
    <form action={action} className="flex flex-col gap-3 rounded-section border p-4">
      <h3 className="type-subtitle">{copy.reportingLineTitle}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="org-reporting-employee">Employee</Label>
          <Select name="employeeId" required>
            <SelectTrigger id="org-reporting-employee">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-reporting-manager">Manager</Label>
          <Select name="managerEmployeeId" required>
            <SelectTrigger id="org-reporting-manager">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-reporting-type">Relationship type</Label>
          <Select name="relationshipType" defaultValue="direct">
            <SelectTrigger id="org-reporting-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="dotted_line">Dotted line</SelectItem>
              <SelectItem value="matrix">Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="org-reporting-reason">Reason</Label>
          <Input id="org-reporting-reason" name="reason" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {copy.submitLabel}
      </Button>
      <ActionMessage result={result} />
    </form>
  );
}
