import { z } from "zod";
import {
  AccountIconSchema,
  CurrencyCodeSchema,
  DEFAULT_ACCOUNT_ICON,
  DEFAULT_ENTITY_COLOR,
  EntityIdSchema,
  HexColorSchema,
  IsoDateSchema,
  MoneyAmountSchema,
} from "../common.ts";

export const GenesisEpochSchema = z.object({
  establishedOn: IsoDateSchema,
  accountOpeningBalances: z.record(EntityIdSchema, MoneyAmountSchema),
  sinkOpeningBalances: z.record(EntityIdSchema, MoneyAmountSchema),
});
export type GenesisEpoch = z.infer<typeof GenesisEpochSchema>;

export const AccountSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  description: z.string(),
  color: HexColorSchema,
  icon: AccountIconSchema,
  balance: MoneyAmountSchema,
  currency: CurrencyCodeSchema,
  genesisDate: IsoDateSchema,
  parserTemplateId: EntityIdSchema.nullable(),
});

export const DEFAULT_ACCOUNT_APPEARANCE = {
  color: DEFAULT_ENTITY_COLOR,
  icon: DEFAULT_ACCOUNT_ICON,
  description: "",
} as const;
export type Account = z.infer<typeof AccountSchema>;

const TargetDateSinkSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  balance: MoneyAmountSchema,
  sinkType: z.literal("target_date"),
  targetAmount: MoneyAmountSchema,
  targetDate: IsoDateSchema,
});

const RecurringBillSinkSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  balance: MoneyAmountSchema,
  sinkType: z.literal("recurring_bill"),
  billAmount: MoneyAmountSchema,
  periodMonths: z.number().int().positive(),
});

const CappedReserveSinkSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  balance: MoneyAmountSchema,
  sinkType: z.literal("capped_reserve"),
  monthlyTarget: MoneyAmountSchema,
  cap: MoneyAmountSchema,
});

export const SinkSchema = z.discriminatedUnion("sinkType", [
  TargetDateSinkSchema,
  RecurringBillSinkSchema,
  CappedReserveSinkSchema,
]);
export type Sink = z.infer<typeof SinkSchema>;

export const CategorySchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type Category = z.infer<typeof CategorySchema>;

export const LifestyleTagSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
});
export type LifestyleTag = z.infer<typeof LifestyleTagSchema>;

export const EventTagSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  color: HexColorSchema,
  archived: z.boolean(),
});
export type EventTag = z.infer<typeof EventTagSchema>;

export const ColumnMappingSchema = z.object({
  date: z.string().min(1),
  amount: z.string().min(1),
  description: z.string().min(1),
});
export type ColumnMapping = z.infer<typeof ColumnMappingSchema>;

export const NumberFormatSchema = z.object({
  decimalSeparator: z.string().min(1),
  thousandsSeparator: z.string(),
  negativePrefix: z.string().optional(),
  negativeSuffix: z.string().optional(),
});
export type NumberFormat = z.infer<typeof NumberFormatSchema>;

export const ParserTemplateSchema = z.object({
  id: EntityIdSchema,
  accountId: EntityIdSchema,
  delimiter: z.string().min(1),
  encoding: z.string().min(1),
  columnMappings: ColumnMappingSchema,
  numberFormat: NumberFormatSchema,
});
export type ParserTemplate = z.infer<typeof ParserTemplateSchema>;

export const RuleTypeSchema = z.enum(["categorize", "internal_transfer"]);
export type RuleType = z.infer<typeof RuleTypeSchema>;

export const RuleSchema = z.object({
  id: EntityIdSchema,
  name: z.string().min(1),
  keywords: z.array(z.string().min(1)),
  ruleType: RuleTypeSchema.default("categorize"),
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
});
export type Rule = z.infer<typeof RuleSchema>;

export const RawTransactionSchema = z.object({
  id: EntityIdSchema,
  accountId: EntityIdSchema,
  importBatchId: EntityIdSchema,
  date: IsoDateSchema,
  amount: MoneyAmountSchema,
  description: z.string(),
  rawRow: z.record(z.string(), z.string()),
});
export type RawTransaction = z.infer<typeof RawTransactionSchema>;

export const VirtualSliceSchema = z.object({
  id: EntityIdSchema,
  amount: MoneyAmountSchema,
  description: z.string().optional(),
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
});
export type VirtualSlice = z.infer<typeof VirtualSliceSchema>;

export const LedgerTransactionSchema = z.object({
  id: EntityIdSchema,
  rawTransactionId: EntityIdSchema.nullable(),
  accountId: EntityIdSchema,
  date: IsoDateSchema,
  amount: MoneyAmountSchema,
  description: z.string(),
  categoryId: EntityIdSchema.nullable(),
  sinkId: EntityIdSchema.nullable(),
  lifestyleTagIds: z.array(EntityIdSchema),
  eventTagIds: z.array(EntityIdSchema),
  splitGroupId: EntityIdSchema.nullable(),
  internalTransferGroupId: EntityIdSchema.nullable().default(null),
  virtualSlices: z.array(VirtualSliceSchema),
});
export type LedgerTransaction = z.infer<typeof LedgerTransactionSchema>;

export const SplitGroupSchema = z.object({
  id: EntityIdSchema,
  parentLedgerTransactionId: EntityIdSchema,
  linkedLedgerTransactionIds: z.array(EntityIdSchema),
  initiatedByUserId: EntityIdSchema,
});
export type SplitGroup = z.infer<typeof SplitGroupSchema>;

export const InternalTransferGroupSchema = z.object({
  id: EntityIdSchema,
  ledgerTransactionIds: z.tuple([EntityIdSchema, EntityIdSchema]),
  initiatedByUserId: EntityIdSchema,
});
export type InternalTransferGroup = z.infer<typeof InternalTransferGroupSchema>;
