import { SectionPanel } from "@afenda/ui";

export function SystemAdminRolesAccessDenied() {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title="Roles"
        description="Seeded authority bundles with effective permission counts."
      />
      <SectionPanel title="Access denied">
        <p className="type-muted">
          You need the system-admin.roles.read capability to view the role
          catalog.
        </p>
      </SectionPanel>
    </div>
  );
}
