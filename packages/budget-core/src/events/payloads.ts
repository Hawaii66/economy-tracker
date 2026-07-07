import { z } from "zod";
import {
  AccountIconSchema,
  CurrencyCodeSchema,
  EntityIdSchema,
  HexColorSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  MoneyAmountSchema,
  SinkIconSchema,
} from "../common.ts";
import { ColumnMappingSchema, NumberFormatSchema } from "../budget/entities.ts";

export const GenesisEpochSetPayloadSchema = z.object({
  establishedOn: IsoDateSchema,
  accountOpeningBalances: z.record(EntityIdSchema, MoneyAmountSchema),
  sinkOpeningBalances: z.record(EntityIdSchema, MoneyAmountSchema),
});
export type GenesisEpochSetPayload = z.infer<typeof GenesisEpochSetPayloadSchema>;

export const AccountAddedPayloadSchema = z.object({
  accountId: EntityIdSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  color: HexColorSchema.optional(),
  icon: AccountIconSchema.optional(),
  openingBalance: MoneyAmountSchema,
  currency: CurrencyCodeSchema.optional(),
  genesisDate: IsoDateSchema,
});
export type AccountAddedPayload = z.infer<typeof AccountAddedPayloadSchema>;

export const AccountUpdatedPayloadSchema = z.object({
  accountId: EntityIdSchema,
  name: z.string().min(1),
  description: z.string(),
  color: HexColorSchema,
  icon: AccountIconSchema,
});
export type AccountUpdatedPayload = z.infer<typeof AccountUpdatedPayloadSchema>;

export const AccountBalanceAdjustedPayloadSchema = z.object({
  accountId: EntityIdSchema,
  newBalance: MoneyAmountSchema,
  reason: z.string().optional(),
});
export type AccountBalanceAdjustedPayload = z.infer<
  typeof AccountBalanceAdjustedPayloadSchema
>;

const sinkCreatedBaseFields = {
  sinkId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
  icon: SinkIconSchema,
};

export const SinkCreatedPayloadSchema = z.discriminatedUnion("sinkType", [
  z.object({
    ...sinkCreatedBaseFields,
    sinkType: z.literal("target_date"),
    targetAmount: MoneyAmountSchema,
    targetDate: IsoDateSchema,
  }),
  z.object({
    ...sinkCreatedBaseFields,
    sinkType: z.literal("recurring_bill"),
    billAmount: MoneyAmountSchema,
    periodMonths: z.number().int().positive(),
  }),
  z.object({
    ...sinkCreatedBaseFields,
    sinkType: z.literal("capped_reserve"),
    monthlyTarget: MoneyAmountSchema,
    cap: MoneyAmountSchema,
  }),
]);
export type SinkCreatedPayload = z.infer<typeof SinkCreatedPayloadSchema>;

export const SinkFundedPayloadSchema = z.object({
  sinkId: EntityIdSchema,
  amount: MoneyAmountSchema,
  ledgerTransactionId: EntityIdSchema.nullable(),
});
export type SinkFundedPayload = z.infer<typeof SinkFundedPayloadSchema>;

export const SinkWithdrawnPayloadSchema = z.object({
  sinkId: EntityIdSchema,
  amount: MoneyAmountSchema,
  ledgerTransactionId: EntityIdSchema.nullable(),
});
export type SinkWithdrawnPayload = z.infer<typeof SinkWithdrawnPayloadSchema>;

export const SinkCapUpdatedPayloadSchema = z.object({
  sinkId: EntityIdSchema,
  cap: MoneyAmountSchema,
});
export type SinkCapUpdatedPayload = z.infer<typeof SinkCapUpdatedPayloadSchema>;

export const SinkMonthlyTargetUpdatedPayloadSchema = z.object({
  sinkId: EntityIdSchema,
  monthlyTarget: MoneyAmountSchema,
});
export type SinkMonthlyTargetUpdatedPayload = z.infer<
  typeof SinkMonthlyTargetUpdatedPayloadSchema
>;

export const CategoryCreatedPayloadSchema = z.object({
  categoryId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type CategoryCreatedPayload = z.infer<typeof CategoryCreatedPayloadSchema>;

export const CategoryUpdatedPayloadSchema = z.object({
  categoryId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type CategoryUpdatedPayload = z.infer<typeof CategoryUpdatedPayloadSchema>;

export const LifestyleTagCreatedPayloadSchema = z.object({
  tagId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type LifestyleTagCreatedPayload = z.infer<
  typeof LifestyleTagCreatedPayloadSchema
>;

export const LifestyleTagUpdatedPayloadSchema = z.object({
  tagId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type LifestyleTagUpdatedPayload = z.infer<
  typeof LifestyleTagUpdatedPayloadSchema
>;

export const EventTagCreatedPayloadSchema = z.object({
  tagId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type EventTagCreatedPayload = z.infer<typeof EventTagCreatedPayloadSchema>;

export const EventTagUpdatedPayloadSchema = z.object({
  tagId: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
  archived: z.boolean(),
});
export type EventTagUpdatedPayload = z.infer<typeof EventTagUpdatedPayloadSchema>;

export const EventTagArchivedPayloadSchema = z.object({
  tagId: EntityIdSchema,
});
export type EventTagArchivedPayload = z.infer<typeof EventTagArchivedPayloadSchema>;

export const ParserTemplateConfiguredPayloadSchema = z.object({
  templateId: EntityIdSchema,
  accountId: EntityIdSchema,
  delimiter: z.string().min(1),
  encoding: z.string().min(1),
  columnMappings: ColumnMappingSchema,
  numberFormat: NumberFormatSchema,
});
export type ParserTemplateConfiguredPayload = z.infer<
  typeof ParserTemplateConfiguredPayloadSchema
>;

export const RuleCreatedPayloadSchema = z.object({
  ruleId: EntityIdSchema,
  name: z.string().min(1),
  keywords: z.array(z.string().min(1)),
  ruleType: z.enum(["categorize", "internal_transfer"]).default("categorize"),
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
});
export type RuleCreatedPayload = z.infer<typeof RuleCreatedPayloadSchema>;

export const RuleUpdatedPayloadSchema = RuleCreatedPayloadSchema;
export type RuleUpdatedPayload = z.infer<typeof RuleUpdatedPayloadSchema>;

export const ImportedRawTransactionSchema = z.object({
  rawTransactionId: EntityIdSchema,
  date: IsoDateSchema,
  amount: MoneyAmountSchema,
  description: z.string(),
  rawRow: z.record(z.string(), z.string()),
});
export type ImportedRawTransaction = z.infer<typeof ImportedRawTransactionSchema>;

export const TransactionsImportedPayloadSchema = z.object({
  importBatchId: EntityIdSchema,
  accountId: EntityIdSchema,
  importedAt: IsoDateTimeSchema,
  transactions: z.array(ImportedRawTransactionSchema).min(1),
});
export type TransactionsImportedPayload = z.infer<
  typeof TransactionsImportedPayloadSchema
>;

export const LedgerTransactionCreatedPayloadSchema = z.object({
  ledgerTransactionId: EntityIdSchema,
  rawTransactionId: EntityIdSchema.nullable(),
  accountId: EntityIdSchema,
  date: IsoDateSchema,
  amount: MoneyAmountSchema,
  description: z.string(),
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
});
export type LedgerTransactionCreatedPayload = z.infer<
  typeof LedgerTransactionCreatedPayloadSchema
>;

export const LedgerTransactionUpdatedPayloadSchema = z.object({
  ledgerTransactionId: EntityIdSchema,
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
  description: z.string().optional(),
});
export type LedgerTransactionUpdatedPayload = z.infer<
  typeof LedgerTransactionUpdatedPayloadSchema
>;

export const LedgerTransactionDeletedPayloadSchema = z.object({
  ledgerTransactionId: EntityIdSchema,
});
export type LedgerTransactionDeletedPayload = z.infer<
  typeof LedgerTransactionDeletedPayloadSchema
>;

export const SplitInitiatedPayloadSchema = z.object({
  splitGroupId: EntityIdSchema,
  parentLedgerTransactionId: EntityIdSchema,
});
export type SplitInitiatedPayload = z.infer<typeof SplitInitiatedPayloadSchema>;

export const SplitLinkedPayloadSchema = z.object({
  splitGroupId: EntityIdSchema,
  linkedLedgerTransactionId: EntityIdSchema,
});
export type SplitLinkedPayload = z.infer<typeof SplitLinkedPayloadSchema>;

export const VirtualSliceDefinedSchema = z.object({
  sliceId: EntityIdSchema,
  amount: MoneyAmountSchema,
  description: z.string().optional(),
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
});

export const IncomeSlicedPayloadSchema = z.object({
  ledgerTransactionId: EntityIdSchema,
  slices: z.array(VirtualSliceDefinedSchema).min(1),
});
export type IncomeSlicedPayload = z.infer<typeof IncomeSlicedPayloadSchema>;

export const InternalTransferLinkedPayloadSchema = z.object({
  transferGroupId: EntityIdSchema,
  ledgerTransactionIdA: EntityIdSchema,
  ledgerTransactionIdB: EntityIdSchema,
});
export type InternalTransferLinkedPayload = z.infer<
  typeof InternalTransferLinkedPayloadSchema
>;

export const InternalTransferUnlinkedPayloadSchema = z.object({
  transferGroupId: EntityIdSchema,
});
export type InternalTransferUnlinkedPayload = z.infer<
  typeof InternalTransferUnlinkedPayloadSchema
>;

export const InternalTransferRecordedPayloadSchema = z.object({
  transferId: EntityIdSchema,
  fromAccountId: EntityIdSchema,
  toAccountId: EntityIdSchema,
  amount: MoneyAmountSchema,
  date: IsoDateSchema,
  description: z.string().optional(),
});
export type InternalTransferRecordedPayload = z.infer<
  typeof InternalTransferRecordedPayloadSchema
>;
