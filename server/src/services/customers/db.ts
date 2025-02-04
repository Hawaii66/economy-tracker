import { eq } from "drizzle-orm";
import { customersTable, db } from "src/drizzle/schema";
import { Customer } from "./types";
import { uuid } from "../utils";

export const getCustomers = async (userId: string): Promise<Customer[]> => {
  const customers = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.userId, userId));

  return customers.map((i) => ({
    id: i.id,
    name: i.name,
    color: i.color,
    rename: i.rename,
    categoryId: i.categoryId,
  }));
};

export const insertCustomer = async (
  userId: string,
  data: Pick<Customer, "color" | "name" | "rename" | "categoryId">
): Promise<void> => {
  await db.insert(customersTable).values({
    color: data.color,
    id: uuid(),
    name: data.name,
    rename: data.rename,
    userId,
    categoryId: data.categoryId,
  });
};
