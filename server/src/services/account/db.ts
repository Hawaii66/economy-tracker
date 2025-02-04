import { eq } from "drizzle-orm";
import { accountsTable, db, swishRecipientsTable } from "src/drizzle/schema";
import { Account } from "./types";
import { uuid } from "../utils";

export const getAccounts = async (userId: string): Promise<Account[]> => {
  const accounts = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, userId));

  return accounts.map((i) => ({
    id: i.id,
    name: i.name,
  }));
};

export const insertAccount = async (
  userId: string,
  name: string
): Promise<void> => {
  await db.insert(accountsTable).values({
    userId,
    name,
    id: uuid(),
  });
};
