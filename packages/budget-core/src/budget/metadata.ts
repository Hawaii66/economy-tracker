import { z } from "zod";
import { EntityIdSchema } from "../common.ts";

export const BudgetMetadataSchema = z.object({
  name: z.string().min(1),
  createdById: EntityIdSchema,
  isBranch: z.boolean(),
  parentBudgetId: EntityIdSchema.nullable(),
  branchedAtSequence: z.number().int().nonnegative().nullable(),
  currentSequence: z.number().int().nonnegative(),
});
export type BudgetMetadata = z.infer<typeof BudgetMetadataSchema>;
