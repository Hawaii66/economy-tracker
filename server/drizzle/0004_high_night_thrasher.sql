ALTER TABLE "imported_transactions" ADD COLUMN "collisionMitigator" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "imported_transactions" ADD COLUMN "imported" boolean NOT NULL;