export const BUDGET_CORE_VERSION = "0.0.0";

export {
  CURRENT_EVENT_VERSION,
  CURRENT_STATE_VERSION,
  CurrencyCodeSchema,
  EntityIdSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  MembershipRoleSchema,
  MoneyAmountSchema,
} from "./common.ts";
export type {
  CurrencyCode,
  EntityId,
  IsoDate,
  IsoDateTime,
  MembershipRole,
  MoneyAmount,
} from "./common.ts";

export {
  AccountSchema,
  CategorySchema,
  ColumnMappingSchema,
  EventTagSchema,
  GenesisEpochSchema,
  LedgerTransactionSchema,
  LifestyleTagSchema,
  NumberFormatSchema,
  ParserTemplateSchema,
  RawTransactionSchema,
  RuleSchema,
  SinkSchema,
  SplitGroupSchema,
  VirtualSliceSchema,
} from "./budget/entities.ts";
export type {
  Account,
  Category,
  ColumnMapping,
  EventTag,
  GenesisEpoch,
  LedgerTransaction,
  LifestyleTag,
  NumberFormat,
  ParserTemplate,
  RawTransaction,
  Rule,
  Sink,
  SplitGroup,
  VirtualSlice,
} from "./budget/entities.ts";

export { BudgetMetadataSchema } from "./budget/metadata.ts";
export type { BudgetMetadata } from "./budget/metadata.ts";

export {
  BudgetStateSchema,
  BudgetStateV1Schema,
  INITIAL_BUDGET_STATE,
} from "./budget/state.ts";
export type { BudgetState, BudgetStateV1 } from "./budget/state.ts";

export {
  AccountAddedPayloadSchema,
  AccountBalanceAdjustedPayloadSchema,
  CategoryCreatedPayloadSchema,
  EventTagArchivedPayloadSchema,
  EventTagCreatedPayloadSchema,
  GenesisEpochSetPayloadSchema,
  ImportedRawTransactionSchema,
  IncomeSlicedPayloadSchema,
  InternalTransferRecordedPayloadSchema,
  LedgerTransactionCreatedPayloadSchema,
  LedgerTransactionUpdatedPayloadSchema,
  LifestyleTagCreatedPayloadSchema,
  ParserTemplateConfiguredPayloadSchema,
  RuleCreatedPayloadSchema,
  RuleUpdatedPayloadSchema,
  SinkCapUpdatedPayloadSchema,
  SinkCreatedPayloadSchema,
  SinkFundedPayloadSchema,
  SinkWithdrawnPayloadSchema,
  SplitInitiatedPayloadSchema,
  SplitLinkedPayloadSchema,
  TransactionsImportedPayloadSchema,
  VirtualSliceDefinedSchema,
} from "./events/payloads.ts";
export type {
  AccountAddedPayload,
  AccountBalanceAdjustedPayload,
  CategoryCreatedPayload,
  EventTagArchivedPayload,
  EventTagCreatedPayload,
  GenesisEpochSetPayload,
  ImportedRawTransaction,
  IncomeSlicedPayload,
  InternalTransferRecordedPayload,
  LedgerTransactionCreatedPayload,
  LedgerTransactionUpdatedPayload,
  LifestyleTagCreatedPayload,
  ParserTemplateConfiguredPayload,
  RuleCreatedPayload,
  RuleUpdatedPayload,
  SinkCapUpdatedPayload,
  SinkCreatedPayload,
  SinkFundedPayload,
  SinkWithdrawnPayload,
  SplitInitiatedPayload,
  SplitLinkedPayload,
  TransactionsImportedPayload,
} from "./events/payloads.ts";

export {
  AccountAddedEventSchema,
  AccountBalanceAdjustedEventSchema,
  AppendEventInputSchema,
  CategoryCreatedEventSchema,
  DomainEventSchema,
  EVENT_TYPES,
  EventTagArchivedEventSchema,
  EventTagCreatedEventSchema,
  EventTypeSchema,
  GenesisEpochSetEventSchema,
  IncomeSlicedEventSchema,
  InternalTransferRecordedEventSchema,
  LedgerTransactionCreatedEventSchema,
  LedgerTransactionUpdatedEventSchema,
  LifestyleTagCreatedEventSchema,
  ParserTemplateConfiguredEventSchema,
  RuleCreatedEventSchema,
  RuleUpdatedEventSchema,
  SinkCapUpdatedEventSchema,
  SinkCreatedEventSchema,
  SinkFundedEventSchema,
  SinkWithdrawnEventSchema,
  SplitInitiatedEventSchema,
  SplitLinkedEventSchema,
  StoredEventSchema,
  TransactionsImportedEventSchema,
} from "./events/domain-event.ts";
export type {
  AppendEventInput,
  DomainEvent,
  EventType,
  StoredEvent,
} from "./events/domain-event.ts";

export {
  reduceBudgetState,
  replayBudgetEvents,
  applyEventToDraft,
} from "./reducer.ts";
