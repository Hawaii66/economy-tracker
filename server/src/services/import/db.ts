import { db, importedTransactionsTable } from "src/drizzle/schema";
import { TransactionRow } from "./types";
import { uuid } from "../utils";

export const importTransactions = async (
  transactions: TransactionRow[],
  accountId: string
) => {
  const result = await db
    .insert(importedTransactionsTable)
    .values(
      transactions.map((transaction) => ({
        accountId: accountId,
        date: transaction.date.toISOString(),
        amount: transaction.amount,
        text: transaction.text,
        id: uuid(),
        collisionMitigator: transaction.collisionMitigator,
        imported: false,
      }))
    )
    .onConflictDoNothing()
    .returning({
      id: importedTransactionsTable.id,
    });

  return result;
};
