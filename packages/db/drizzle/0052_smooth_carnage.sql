CREATE TYPE "public"."object_storage_encryption_mode" AS ENUM('platform', 'customer-managed');--> statement-breakpoint
CREATE TYPE "public"."object_storage_kms_adapter" AS ENUM('vault-transit', 'aws-kms');--> statement-breakpoint
ALTER TYPE "public"."object_storage_provider" ADD VALUE 's3';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "object_storage_encryption_mode" "object_storage_encryption_mode" DEFAULT 'platform' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "object_storage_kms_adapter" "object_storage_kms_adapter";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "object_storage_kms_key_ref" text;