CREATE TYPE "public"."object_storage_provider" AS ENUM('vercel-blob', 'r2');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "object_storage_provider" "object_storage_provider";