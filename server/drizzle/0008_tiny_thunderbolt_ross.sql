ALTER TABLE "transactions" ADD COLUMN "swishRecipientId" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "customerId" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_swishRecipientId_swish_recipients_id_fk" FOREIGN KEY ("swishRecipientId") REFERENCES "public"."swish_recipients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;