CREATE TABLE "customer_detections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"customerId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_detections" ADD CONSTRAINT "customer_detections_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "rename";