ALTER TABLE "transactions" RENAME COLUMN "category" TO "categoryId";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;