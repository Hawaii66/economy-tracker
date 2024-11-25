import { z } from "zod";
import { Customer } from "./customer";

export const ImportedTransaction = z.object({
  id: z.string().uuid(),
  verificationNumber: z.string(),
  date: z.date(),
  amount: z.number().int(),
  text: z.string(),
  customer: Customer.nullable(),
});
export type ImportedTransaction = z.infer<typeof ImportedTransaction>;
