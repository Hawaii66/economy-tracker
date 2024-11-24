import { z } from "zod";
import { Category, CustomerType } from "./category";

export const ImportRow = z.object({
  date: z.date(),
  verificationNumber: z.number().int(),
  text: z.string(),
  amount: z.number().int(),
});

export type ImportRow = z.infer<typeof ImportRow>;

export const ImportedCustomer = z.object({
  name: z.string(),
  type: CustomerType,
});
export type ImportedCustomer = z.infer<typeof ImportedCustomer>;

export const ImportedCustomerWithCategory = ImportedCustomer.extend({
  categoryId: Category.shape.id,
});
export type ImportedCustomerWithCategory = z.infer<
  typeof ImportedCustomerWithCategory
>;
