ALTER TABLE "imported_transactions" ALTER COLUMN "customer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "customer_id" DROP NOT NULL;