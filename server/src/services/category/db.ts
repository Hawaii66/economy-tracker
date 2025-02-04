import { eq } from "drizzle-orm";
import { categoriesTable, db, swishRecipientsTable } from "src/drizzle/schema";
import { Category } from "./types";
import { uuid } from "../utils";

export const getCategories = async (userId: string): Promise<Category[]> => {
  const recipients = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.userId, userId));

  return recipients.map((i) => ({
    id: i.id,
    color: i.color,
    name: i.name,
    target: i.target,
  }));
};

export const insertCategory = async (
  userId: string,
  name: string,
  color: string,
  target: number
): Promise<void> => {
  await db.insert(categoriesTable).values({
    userId,
    name,
    id: uuid(),
    color,
    target,
  });
};
