ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "organization_memberships" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "erp_module_records" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "erp_saved_views" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "erp_work_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "erp_documents" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "ai_usage_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "ai_document_extractions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "organizations_tenant_isolation" ON "organizations"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    id = current_setting('afenda.current_organization_id', true)
  );
--> statement-breakpoint
CREATE POLICY "organization_memberships_tenant_isolation" ON "organization_memberships"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
    OR auth_user_id = current_setting('afenda.auth_user_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
    OR auth_user_id = current_setting('afenda.auth_user_id', true)
  );
--> statement-breakpoint
CREATE POLICY "erp_module_records_tenant_isolation" ON "erp_module_records"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
--> statement-breakpoint
CREATE POLICY "erp_saved_views_tenant_isolation" ON "erp_saved_views"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
--> statement-breakpoint
CREATE POLICY "erp_work_items_tenant_isolation" ON "erp_work_items"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
--> statement-breakpoint
CREATE POLICY "erp_documents_tenant_isolation" ON "erp_documents"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
--> statement-breakpoint
CREATE POLICY "ai_usage_events_tenant_isolation" ON "ai_usage_events"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
--> statement-breakpoint
CREATE POLICY "ai_document_extractions_tenant_isolation" ON "ai_document_extractions"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (
    organization_id = current_setting('afenda.current_organization_id', true)
  )
  WITH CHECK (
    organization_id = current_setting('afenda.current_organization_id', true)
  );
