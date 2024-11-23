import { z } from "zod";

export const Tag = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string(),
});
export type Tag = z.infer<typeof Tag>;
