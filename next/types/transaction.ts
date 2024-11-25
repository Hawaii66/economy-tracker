import { z } from "zod";
import { Customer } from "./customer";
import { Category } from "./category";

export const ImportedTransaction = z.object({
  id: z.string().uuid(),
  verificationNumber: z.string(),
  date: z.date(),
  amount: z.number().int(),
  text: z.string(),
  customer: Customer.nullable(),
});
export type ImportedTransaction = z.infer<typeof ImportedTransaction>;

export const Transaction = z.object({
  id: z.string().uuid(),
  verificationNumber: z.string(),
  date: z.date(),
  amount: z.number().int(),
  text: z.string(),
  customer: Customer.nullable(),
  category: Category,
});
export type Transaction = z.infer<typeof Transaction>;

export type FilterOptions = {
  startDate: Date;
  endDate: Date;
  minAmount: string;
  maxAmount: string;
  customerId: string;
  categoryId: string;
  query: string;
};
