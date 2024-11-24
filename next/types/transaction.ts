import { z } from "zod";
import { Customer } from "./customer";

export const ImportedTransaction = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  verificationNumber: z.number().int(),
  date: z.date(),
  amount: z.number().int(),
  text: z.string(),
  customerId: Customer.shape.id.nullable(),
});
export type ImportedTransaction = z.infer<typeof ImportedTransaction>;
