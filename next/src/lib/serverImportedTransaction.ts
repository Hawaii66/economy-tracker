"use server";

import { revalidatePath } from "next/cache";
import { DBCategory, DBCustomer, DBTransaction } from "../../types/Database";
import { ImportedTransaction } from "../../types/transaction";
import { maybeRemoveDate, parseCSV } from "./csv";
import { DEFAULT_USER_ID } from "./dangerous";
import { db } from "./db";
import { getCustomers } from "./serverCustomers";
import { Category } from "../../types/category";

export const getImportedTransactions = async (): Promise<
  ImportedTransaction[]
> => {
  const sql = await db();
  const rows = await sql.query<
    Pick<
      DBTransaction,
      "id" | "verification_number" | "date" | "amount" | "text" | "customer_id"
    > &
      Pick<DBCustomer, "name" | "category_id" | "rename" | "type"> &
      Pick<DBCategory, "color" | "description" | "name" | "expected_per_month">
  >(`
		SELECT
			t.id,
			t.verification_number,
			t.date,
			t.amount,
			t.text,
			t.customer_id,
			c.name,
			c.category_id,
			c.rename,
			c.type,
			cat.color,
			cat.description,
			cat.name
		FROM
			imported_transactions t
		LEFT JOIN
			customers c
			ON
			t.customer_id = c.id
		LEFT JOIN
			categories cat
			ON
			cat.id = c.category_id
			`);

  await sql.end();
  const array = rows.rows.map((row) => ({
    amount: row.amount,
    customer: row.customer_id
      ? {
          category: {
            color: row.color,
            description: row.description,
            id: row.category_id,
            name: row.name,
            expectedPerMonth: row.expected_per_month,
          },
          id: row.category_id,
          name: row.name,
          rename: row.rename,
          type: row.type,
        }
      : null,
    date: row.date,
    id: row.id,
    text: row.text,
    verificationNumber: row.verification_number,
  }));

  return ImportedTransaction.array().parse(array);
};

export const getImportedTransaction = async (
  transactionId: ImportedTransaction["id"]
): Promise<ImportedTransaction | null> => {
  const sql = await db();
  const rows = await sql.query<
    Pick<
      DBTransaction,
      "id" | "verification_number" | "date" | "amount" | "text" | "customer_id"
    > &
      Pick<DBCustomer, "name" | "category_id" | "rename" | "type"> &
      Pick<DBCategory, "color" | "description" | "name" | "expected_per_month">
  >(
    `
		  SELECT
			  t.id,
			  t.verification_number,
			  t.date,
			  t.amount,
			  t.text,
			  t.customer_id,
			  c.name,
			  c.category_id,
			  c.rename,
			  c.type,
			  cat.color,
			  cat.description,
			  cat.name,
			  cat.expected_per_month
		  FROM
			  imported_transactions t
		  LEFT JOIN
			  customers c
			  ON
			  t.customer_id = c.id
		  LEFT JOIN
			  categories cat
			  ON
			  cat.id = c.category_id
			WHERE
				t.id=$1
			  `,
    [transactionId]
  );

  if (rows.rows.length !== 1) {
    return null;
  }

  const transactionRow = rows.rows[0];

  await sql.end();
  const transaction = {
    amount: transactionRow.amount,
    customer: transactionRow.customer_id
      ? {
          category: {
            color: transactionRow.color,
            description: transactionRow.description,
            id: transactionRow.category_id,
            name: transactionRow.name,
            expectedPerMonth: transactionRow.expected_per_month,
          },
          id: transactionRow.customer_id,
          name: transactionRow.name,
          rename: transactionRow.rename,
          type: transactionRow.type,
        }
      : null,
    date: transactionRow.date,
    id: transactionRow.id,
    text: transactionRow.text,
    verificationNumber: transactionRow.verification_number,
  };
  return transaction;
};

export const insertImportedTransactions = async (csv: string) => {
  const transactions = parseCSV(csv);
  const customers = await getCustomers();
  const customerMap = new Map(customers.map((i) => [i.name, i.id]));

  const imported = transactions.map((transaction) => ({
    amount: transaction.amount,
    customerId: customerMap.get(maybeRemoveDate(transaction.text)) ?? null,
    date: transaction.date,
    text: transaction.text,
    verificationNumber: transaction.verificationNumber,
  }));

  const sql = await db();

  const query = `INSERT INTO imported_transactions (text,verification_number,date,amount,user_id,customer_id) VALUES `;
  const rows = imported
    .map(
      (_, idx) =>
        `($${idx * 6 + 1},$${idx * 6 + 2},$${idx * 6 + 3},$${idx * 6 + 4},$${
          idx * 6 + 5
        },$${idx * 6 + 6})`
    )
    .join(",");
  const params = imported.flatMap((i) => [
    i.text,
    i.verificationNumber,
    i.date,
    i.amount,
    DEFAULT_USER_ID,
    i.customerId,
  ]);

  const statement = `${query} ${rows}`;
  await sql.query(statement, params);

  await sql.end();
};

export const approveTransaction = async (
  transactionId: ImportedTransaction["id"],
  categoryId: Category["id"]
) => {
  const transaction = await getImportedTransaction(transactionId);
  if (!transaction) {
    throw new Error(`Transaction with id ${transactionId} not found`);
  }

  const sql = await db();

  await sql.query(
    `
		INSERT INTO
			transactions
			(verification_number,date,amount,user_id,category_id,text,customer_id)
		VALUES
			($1,$2,$3,$4,$5,$6,$7)
		`,
    [
      transaction.verificationNumber,
      transaction.date,
      transaction.amount,
      DEFAULT_USER_ID,
      categoryId,
      transaction.text,
      transaction.customer?.id ?? null,
    ]
  );
  await sql.query(
    `
	DELETE FROM
		imported_transactions
	WHERE
		id=$1
	`,
    [transactionId]
  );

  revalidatePath("/pending-transaction");
};
