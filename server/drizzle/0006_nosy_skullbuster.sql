CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swish_recipients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"swishNumber" varchar(255) NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clerkId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swish_recipients" ADD CONSTRAINT "swish_recipients_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerkId_unique" UNIQUE("clerkId");