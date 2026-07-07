export const BUDGET_CORE_VERSION = "0.0.0";

export {
  formatMinorUnits,
  MINOR_UNITS_PER_MAJOR_UNIT,
  minorUnitsToDecimalString,
  MoneyAmountSchema,
  parseDecimalStringToMinorUnits,
  wholeMajorUnitsToMinorUnits,
} from "./money.ts";
export type { MoneyAmount } from "./money.ts";

export {
  CURRENT_EVENT_VERSION,
  CURRENT_STATE_VERSION,
  ACCOUNT_ICON_VALUES,
  AccountIconSchema,
  CurrencyCodeSchema,
  DEFAULT_ACCOUNT_ICON,
  DEFAULT_ENTITY_COLOR,
  EntityIdSchema,
  HexColorSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  MembershipRoleSchema,
} from "./common.ts";
export type {
  AccountIcon,
  CurrencyCode,
  EntityId,
  HexColor,
  IsoDate,
  IsoDateTime,
  MembershipRole,
} from "./common.ts";

export {
  AccountSchema,
  CategorySchema,
  ColumnMappingSchema,
  DEFAULT_ACCOUNT_APPEARANCE,
  EventTagSchema,
  GenesisEpochSchema,
  LedgerTransactionSchema,
  LifestyleTagSchema,
  NumberFormatSchema,
  ParserTemplateSchema,
  RawTransactionSchema,
  RuleSchema,
  RuleTypeSchema,
  SinkSchema,
  InternalTransferGroupSchema,
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
  RuleType,
  Sink,
  InternalTransferGroup,
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
  AccountUpdatedPayloadSchema,
  CategoryCreatedPayloadSchema,
  CategoryUpdatedPayloadSchema,
  EventTagArchivedPayloadSchema,
  EventTagCreatedPayloadSchema,
  EventTagUpdatedPayloadSchema,
  GenesisEpochSetPayloadSchema,
  ImportedRawTransactionSchema,
  IncomeSlicedPayloadSchema,
  InternalTransferLinkedPayloadSchema,
  InternalTransferRecordedPayloadSchema,
  LedgerTransactionCreatedPayloadSchema,
  LedgerTransactionUpdatedPayloadSchema,
  LifestyleTagCreatedPayloadSchema,
  LifestyleTagUpdatedPayloadSchema,
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
  AccountUpdatedPayload,
  CategoryCreatedPayload,
  CategoryUpdatedPayload,
  EventTagArchivedPayload,
  EventTagCreatedPayload,
  EventTagUpdatedPayload,
  GenesisEpochSetPayload,
  ImportedRawTransaction,
  IncomeSlicedPayload,
  InternalTransferLinkedPayload,
  InternalTransferRecordedPayload,
  LedgerTransactionCreatedPayload,
  LedgerTransactionUpdatedPayload,
  LifestyleTagCreatedPayload,
  LifestyleTagUpdatedPayload,
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
  AccountUpdatedEventSchema,
  AppendEventInputSchema,
  CategoryCreatedEventSchema,
  CategoryUpdatedEventSchema,
  DomainEventSchema,
  EVENT_TYPES,
  EventTagArchivedEventSchema,
  EventTagCreatedEventSchema,
  EventTagUpdatedEventSchema,
  EventTypeSchema,
  GenesisEpochSetEventSchema,
  IncomeSlicedEventSchema,
  InternalTransferLinkedEventSchema,
  InternalTransferRecordedEventSchema,
  LedgerTransactionCreatedEventSchema,
  LedgerTransactionUpdatedEventSchema,
  LifestyleTagCreatedEventSchema,
  LifestyleTagUpdatedEventSchema,
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

export {
  assignmentFromRule,
  findMatchingCategorizeRule,
  findMatchingInternalTransferRule,
  findMatchingRule,
  ruleMatchesDescription,
} from "./rules/match-rule.ts";
export type { MatchableRule, RuleAssignment } from "./rules/match-rule.ts";
