import { z } from "zod";

export const Category = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
});
export type Category = z.infer<typeof Category>;
