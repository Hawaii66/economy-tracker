ALTER TABLE "transactions" 
ALTER COLUMN "verification_number" SET DATA TYPE integer USING verification_number::integer;
