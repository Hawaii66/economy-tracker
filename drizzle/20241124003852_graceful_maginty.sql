CREATE TABLE IF NOT EXISTS "ignored_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "customer_type"
);
