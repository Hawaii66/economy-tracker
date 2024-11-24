import { ImportedTransaction } from "../../types/transaction";
import { maybeRemoveDate, parseCSV } from "./csv";
import { DEFAULT_USER_ID } from "./dangerous";
import { db } from "./db";
import { getCustomers } from "./serverCustomers";

export const insertTransactions = async (csv: string) => {
  const transactions = parseCSV(csv);
  const customers = await getCustomers();
  const customerMap = new Map(customers.map((i) => [i.name, i.id]));

  const imported: Omit<ImportedTransaction, "id" | "createdAt">[] =
    transactions.map((transaction) => ({
      amount: transaction.amount,
      customerId: customerMap.get(maybeRemoveDate(transaction.text)) ?? null,
      date: transaction.date,
      text: transaction.text,
      verificationNumber: transaction.verificationNumber,
    }));

  const sql = await db();

  let query = `INSERT INTO imported_transactions (text,verification_number,date,amount,user_id,customer_id) VALUES `;
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
