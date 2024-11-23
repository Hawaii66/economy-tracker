CREATE TYPE "public"."customer_type" AS ENUM('company', 'personal');--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "type" "customer_type";