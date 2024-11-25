
-- Set NOT NULL constraint
ALTER TABLE "transactions"
ALTER COLUMN "verification_number" SET NOT NULL;

-- Change the data type for imported_transactions
ALTER TABLE "imported_transactions"
ALTER COLUMN "verification_number" SET DATA TYPE varchar(100);

-- Set NOT NULL constraint for imported_transactions
ALTER TABLE "imported_transactions"
ALTER COLUMN "verification_number" SET NOT NULL;