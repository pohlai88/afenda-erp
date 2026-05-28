export type ModulePageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export function ModulePageHeader({
  title,
  description,
  eyebrow = "ERP module",
}: ModulePageHeaderProps) {
  return (
    <header className="flex flex-col gap-surface-xs">
      <p className="type-label">{eyebrow}</p>
      <h2 className="type-page-title">{title}</h2>
      {description ? <p className="type-muted">{description}</p> : null}
    </header>
  );
}
