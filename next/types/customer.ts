import { z } from "zod";
import { Category, CustomerType } from "./category";

export const Customer = z.object({
  id: z.string().uuid(),
  name: z.string(),
  rename: z.string(),
  type: CustomerType,
  category: Category.nullable(),
});
export type Customer = z.infer<typeof Customer>;
