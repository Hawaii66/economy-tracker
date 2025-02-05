import { eq } from "drizzle-orm";
import {
  customerDetectionsTable,
  customersTable,
  db,
} from "src/drizzle/schema";
import { Customer } from "./types";
import { uuid } from "../utils";

export const getCustomers = async (userId: string): Promise<Customer[]> => {
  const customers = await db
    .select()
    .from(customersTable)
    .leftJoin(
      customerDetectionsTable,
      eq(customersTable.id, customerDetectionsTable.customerId)
    )
    .where(eq(customersTable.userId, userId));

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => {
    const prev = customerMap.get(c.customers.id);
    if (!c.customer_detections) {
      if (prev) return;
      customerMap.set(c.customers.id, {
        categoryId: c.customers.categoryId,
        color: c.customers.color,
        detections: [],
        id: c.customers.id,
        name: c.customers.name,
      });
      return;
    }

    if (prev) {
      customerMap.set(c.customers.id, {
        ...prev,
        detections: [...prev.detections, c.customer_detections.name],
      });
    } else {
      customerMap.set(c.customers.id, {
        categoryId: c.customers.categoryId,
        color: c.customers.color,
        detections: [c.customer_detections.name],
        id: c.customers.id,
        name: c.customers.name,
      });
    }
  });

  return Array.from(customerMap.values());
};

export const insertCustomer = async (
  userId: string,
  data: Pick<Customer, "color" | "name" | "categoryId">
): Promise<void> => {
  await db.insert(customersTable).values({
    color: data.color,
    id: uuid(),
    name: data.name,
    userId,
    categoryId: data.categoryId,
  });
};

export const insertCustomerDetection = async (
  customerId: string,
  name: string
) => {
  await db.insert(customerDetectionsTable).values({
    customerId,
    name,
    id: uuid(),
  });
};
