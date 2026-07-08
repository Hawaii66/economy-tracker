import { z } from "zod";
import { CURRENT_STATE_VERSION } from "../common.ts";
import {
  AccountSchema,
  CategorySchema,
  EventTagSchema,
  LedgerTransactionSchema,
  LifestyleTagSchema,
  RawTransactionSchema,
  RuleSchema,
  SinkSchema,
  InternalTransferGroupSchema,
} from "./entities.ts";

export const BudgetStateV1Schema = z.object({
  version: z.literal(1),
  accounts: z.record(z.string(), AccountSchema),
  sinks: z.record(z.string(), SinkSchema),
  categories: z.record(z.string(), CategorySchema),
  lifestyleTags: z.record(z.string(), LifestyleTagSchema),
  eventTags: z.record(z.string(), EventTagSchema),
  rules: z.record(z.string(), RuleSchema),
  rawTransactions: z.record(z.string(), RawTransactionSchema),
  ledgerTransactions: z.record(z.string(), LedgerTransactionSchema),
  internalTransferGroups: z.record(z.string(), InternalTransferGroupSchema).default({}),
});
export type BudgetStateV1 = z.infer<typeof BudgetStateV1Schema>;

export const BudgetStateSchema = BudgetStateV1Schema;
export type BudgetState = z.infer<typeof BudgetStateSchema>;

export const INITIAL_BUDGET_STATE: BudgetState = {
  version: CURRENT_STATE_VERSION,
  accounts: {},
  sinks: {},
  categories: {},
  lifestyleTags: {},
  eventTags: {},
  rules: {},
  rawTransactions: {},
  ledgerTransactions: {},
  internalTransferGroups: {},
};
