import { z } from "zod";
import { CURRENT_STATE_VERSION } from "../common.ts";
import {
  AccountSchema,
  CategorySchema,
  EventTagSchema,
  GenesisEpochSchema,
  LedgerTransactionSchema,
  LifestyleTagSchema,
  ParserTemplateSchema,
  RawTransactionSchema,
  RuleSchema,
  SinkSchema,
  SplitGroupSchema,
} from "./entities.ts";

export const BudgetStateV1Schema = z.object({
  version: z.literal(1),
  genesisEpoch: GenesisEpochSchema.nullable(),
  accounts: z.record(z.string(), AccountSchema),
  sinks: z.record(z.string(), SinkSchema),
  categories: z.record(z.string(), CategorySchema),
  lifestyleTags: z.record(z.string(), LifestyleTagSchema),
  eventTags: z.record(z.string(), EventTagSchema),
  parserTemplates: z.record(z.string(), ParserTemplateSchema),
  rules: z.record(z.string(), RuleSchema),
  rawTransactions: z.record(z.string(), RawTransactionSchema),
  ledgerTransactions: z.record(z.string(), LedgerTransactionSchema),
  splitGroups: z.record(z.string(), SplitGroupSchema),
});
export type BudgetStateV1 = z.infer<typeof BudgetStateV1Schema>;

export const BudgetStateSchema = BudgetStateV1Schema;
export type BudgetState = z.infer<typeof BudgetStateSchema>;

export const INITIAL_BUDGET_STATE: BudgetState = {
  version: CURRENT_STATE_VERSION,
  genesisEpoch: null,
  accounts: {},
  sinks: {},
  categories: {},
  lifestyleTags: {},
  eventTags: {},
  parserTemplates: {},
  rules: {},
  rawTransactions: {},
  ledgerTransactions: {},
  splitGroups: {},
};
