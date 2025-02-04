import {
  accountsTable,
  db,
  importedTransactionsTable,
  transactionsTable,
  usersTable,
} from "src/drizzle/schema";
import { ClassifiedChoice, ClassifyTransaction, TransactionRow } from "./types";
import { uuid } from "../utils";
import { eq } from "drizzle-orm";

export const getImportedTransactions = async (
  userId: string
): Promise<ClassifyTransaction[]> => {
  const transactions = await db
    .select({
      id: importedTransactionsTable.id,
      account: {
        id: accountsTable.id,
        name: accountsTable.name,
      },
      date: importedTransactionsTable.date,
      text: importedTransactionsTable.text,
      amount: importedTransactionsTable.amount,
    })
    .from(importedTransactionsTable)
    .leftJoin(
      accountsTable,
      eq(accountsTable.id, importedTransactionsTable.accountId)
    )
    .leftJoin(usersTable, eq(usersTable.id, userId))
    .where(eq(importedTransactionsTable.imported, false));

  const filtered = transactions
    .map((i) => ({ ...i, date: new Date(i.date) }))
    .filter(
      (
        i
      ): i is ClassifyTransaction & {
        account: ClassifyTransaction["account"];
      } => i.account !== null
    );

  return filtered;
};

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

export const classifyTransaction = async (data: ClassifiedChoice) => {
  const [transaction] = await db
    .select({
      id: importedTransactionsTable.id,
      account: {
        id: accountsTable.id,
        name: accountsTable.name,
      },
      date: importedTransactionsTable.date,
      text: importedTransactionsTable.text,
      amount: importedTransactionsTable.amount,
    })
    .from(importedTransactionsTable)
    .leftJoin(
      accountsTable,
      eq(accountsTable.id, importedTransactionsTable.accountId)
    )
    .where(eq(importedTransactionsTable.id, data.transactionId));

  if (transaction.account === null) throw new Error("Missing account");

  const [{ id }] = await db
    .insert(transactionsTable)
    .values({
      id: uuid(),
      accountId: transaction.account.id,
      amount: transaction.amount,
      date: transaction.date,
      importedTransactionId: transaction.id,
      text: transaction.text,
      type: data.type,
      customerId: data.type === "Customer" ? data.otherId : null,
      swishRecipientId: data.type === "Swish" ? data.otherId : null,
      transferedAccountId: data.type === "Internal" ? data.otherId : null,
      categoryId: data.categoryId,
    })
    .returning({ id: transactionsTable.id });

  await db
    .update(importedTransactionsTable)
    .set({
      imported: true,
    })
    .where(eq(importedTransactionsTable.id, data.transactionId));

  return id;
};
