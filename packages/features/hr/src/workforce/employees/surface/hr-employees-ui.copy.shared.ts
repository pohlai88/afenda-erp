export const hrEmployeesUiCopy = {
  section: {
    title: "Employee directory",
    description:
      "Active workforce records for the tenant with placement and reporting context.",
    trailingHeader: "Record",
  },
  page: {
    title: "Employees",
    description: "Browse and investigate workforce master records.",
    addEmployeeLabel: "Add employee",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You need the hr.view capability to open the employee directory.",
  },
  listSurface: {
    emptyTitle: "No employees yet",
    emptyDescription:
      "Workforce records appear here after migration and seed. For local dev, run: pnpm exec tsx packages/db/scripts/seed-hr-workforce.mts",
    searchPlaceholder: "Search by name, email, or employee number",
  },
  detail: {
    subtitlePrefix: "Employee",
    backLabel: "Back to directory",
    placementTitle: "Placement",
    departmentLabel: "Department",
    positionLabel: "Position",
    managerLabel: "Manager",
    emailLabel: "Email",
    auditTitle: "Record timestamps",
    createdLabel: "Created",
    updatedLabel: "Updated",
    notFoundTitle: "Employee not found",
    notFoundDescription:
      "This workforce record does not exist for the active tenant or may have been removed.",
  },
  create: {
    title: "Add employee",
    description: "Create a workforce master record with optional initial placement.",
    backLabel: "Back to directory",
    formTitle: "Employee details",
    accessDeniedTitle: "Access restricted",
    accessDeniedDescription:
      "You need the hr.employees.write capability to create workforce records.",
  },
  form: {
    employeeNumberLabel: "Employee number",
    legalNameLabel: "Legal name",
    preferredNameLabel: "Preferred name",
    emailLabel: "Work email",
    departmentLabel: "Department",
    positionLabel: "Position",
    managerLabel: "Manager",
    createSubmitLabel: "Create employee",
    createPendingLabel: "Creating…",
    updateSubmitLabel: "Save changes",
    updatePendingLabel: "Saving…",
    updateSuccessLabel: "Employee record updated.",
    editTitle: "Edit employee",
    editDescription: "Update core identity fields and current placement.",
    archiveTitle: "Archive employee",
    archiveDescription:
      "Archiving removes the employee from the active directory and closes open assignments.",
    archiveSubmitLabel: "Archive employee",
    archivePendingLabel: "Archiving…",
  },
} as const;
