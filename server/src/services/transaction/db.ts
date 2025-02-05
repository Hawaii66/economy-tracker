import {
  accountsTable,
  categoriesTable,
  customersTable,
  db,
  importedTransactionsTable,
  swishRecipientsTable,
  transactionsTable,
  usersTable,
} from "src/drizzle/schema";
import {
  ClassifiedChoice,
  ClassifyTransaction,
  Transaction,
  TransactionRow,
} from "./types";
import { uuid } from "../utils";
import { eq, inArray } from "drizzle-orm";
import { isWithinInterval } from "date-fns";

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

export const getTransactions = async (
  from: Date,
  to: Date,
  userId: string
): Promise<Transaction[]> => {
  const categoriesPromise = db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.userId, userId));
  const customersPromise = db
    .select()
    .from(customersTable)
    .where(eq(customersTable.userId, userId));
  const swishRecipientsPromise = db
    .select()
    .from(swishRecipientsTable)
    .where(eq(swishRecipientsTable.userId, userId));
  const accountsPromise = db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, userId));

  const [categories, customers, swishRecipients, accounts] = await Promise.all([
    categoriesPromise,
    customersPromise,
    swishRecipientsPromise,
    accountsPromise,
  ]);

  const accountIds = accounts.map((i) => i.id);

  const categoriesMap = new Map(categories.map((i) => [i.id, i]));
  const customersMap = new Map(customers.map((i) => [i.id, i]));
  const swishRecipientsMap = new Map(swishRecipients.map((i) => [i.id, i]));
  const accountsMap = new Map(accounts.map((i) => [i.id, i]));

  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(inArray(transactionsTable.accountId, accountIds));

  return transactions
    .map((i) => {
      switch (i.type) {
        case "Swish": {
          return {
            account: accountsMap.get(i.accountId)!,
            amount: i.amount,
            category: categoriesMap.get(i.categoryId)!,
            date: new Date(i.date),
            id: i.id,
            text: i.text,
            type: "Swish" as const,
            swish: swishRecipientsMap.get(i.swishRecipientId ?? "")!,
          };
        }
        case "Customer": {
          return {
            account: accountsMap.get(i.accountId)!,
            amount: i.amount,
            category: categoriesMap.get(i.categoryId)!,
            date: new Date(i.date),
            id: i.id,
            text: i.text,
            type: "Customer" as const,
            customer: customersMap.get(i.customerId ?? "")!,
          };
        }
        case "Internal": {
          return {
            account: accountsMap.get(i.accountId)!,
            amount: i.amount,
            category: categoriesMap.get(i.categoryId)!,
            date: new Date(i.date),
            id: i.id,
            text: i.text,
            type: "Internal" as const,
            otherAccount: accountsMap.get(i.transferedAccountId ?? "")!,
          };
        }
      }
      throw new Error("Wrong type: " + i.type + " . " + i.id);
    })
    .filter((i) => isWithinInterval(i.date, { start: from, end: to }));
};
