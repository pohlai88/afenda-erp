ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "audit_logs_tenant_isolation" ON "audit_logs"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
