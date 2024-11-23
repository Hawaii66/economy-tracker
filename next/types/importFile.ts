import { z } from "zod";
import { CustomerType } from "./category";

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
