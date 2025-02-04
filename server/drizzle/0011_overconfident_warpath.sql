ALTER TABLE "transactions" ALTER COLUMN "category" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;