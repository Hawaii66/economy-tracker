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
  DEFAULT_SINK_ICON,
  EntityIdSchema,
  HexColorSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  MembershipRoleSchema,
  normalizeSinkIcon,
  SINK_ICON_VALUES,
  SinkIconSchema,
} from "./common.ts";
export type {
  AccountIcon,
  CurrencyCode,
  EntityId,
  HexColor,
  IsoDate,
  IsoDateTime,
  MembershipRole,
  SinkIcon,
} from "./common.ts";

export {
  AccountSchema,
  CategorySchema,
  DEFAULT_ACCOUNT_APPEARANCE,
  DEFAULT_SINK_APPEARANCE,
  EventTagSchema,
  LedgerTransactionSchema,
  LifestyleTagSchema,
  RawTransactionSchema,
  RuleSchema,
  RuleTypeSchema,
  SinkSchema,
  InternalTransferGroupSchema,
  VirtualSliceSchema,
} from "./budget/entities.ts";
export type {
  Account,
  Category,
  EventTag,
  LedgerTransaction,
  LifestyleTag,
  RawTransaction,
  Rule,
  RuleType,
  Sink,
  InternalTransferGroup,
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
  assertGuardRailFundingAllowed,
  assertGuardRailStateHealthy,
  assertSinkBalanceCoversAllocation,
  calendarMonthsBetween,
  findInsufficientSinkBalance,
  guardRailFromState,
  isGuardRailHealthy,
  maxFundableAmount,
  missedFundingMonths,
  monthsUntilTarget,
  planDueSinkFunding,
  sinkCatchUpAmount,
  sinkFundingPromptLabel,
  sinkFundingStatus,
  sinkMonthlyPace,
  totalAccountCash,
  totalSinkBalance,
} from "./budget/sinks.ts";
export type {
  DueSinkFundingEntry,
  DueSinkFundingPlan,
  InsufficientSinkBalance,
  SinkAllocationAmount,
  SinkFundingStatus,
} from "./budget/sinks.ts";

export {
  aggregateIncomeAndExpenses,
  aggregateLedgerByAccount,
  aggregateLedgerByCategory,
  aggregateLedgerByMonth,
  aggregateLedgerBySink,
  aggregateLedgerByTag,
  aggregateMonthlyTrend,
  collectLedgerLines,
} from "./budget/aggregations.ts";
export type {
  IncomeExpenseTotals,
  LedgerAggregationRow,
  LedgerDateRange,
  MonthlyTrendRow,
} from "./budget/aggregations.ts";

export {
  AccountAddedPayloadSchema,
  AccountBalanceAdjustedPayloadSchema,
  AccountUpdatedPayloadSchema,
  CategoryCreatedPayloadSchema,
  CategoryUpdatedPayloadSchema,
  EventTagArchivedPayloadSchema,
  EventTagCreatedPayloadSchema,
  EventTagUpdatedPayloadSchema,
  ImportedRawTransactionSchema,
  IncomeSlicedPayloadSchema,
  InternalTransferLinkedPayloadSchema,
  InternalTransferRecordedPayloadSchema,
  InternalTransferUnlinkedPayloadSchema,
  LedgerTransactionCreatedPayloadSchema,
  LedgerTransactionDeletedPayloadSchema,
  LedgerTransactionUpdatedPayloadSchema,
  LifestyleTagCreatedPayloadSchema,
  LifestyleTagUpdatedPayloadSchema,
  RuleCreatedPayloadSchema,
  RuleUpdatedPayloadSchema,
  SinkCapUpdatedPayloadSchema,
  SinkCreatedPayloadSchema,
  SinkFundedPayloadSchema,
  SinkMonthlyTargetUpdatedPayloadSchema,
  SinkWithdrawnPayloadSchema,
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
  ImportedRawTransaction,
  IncomeSlicedPayload,
  InternalTransferLinkedPayload,
  InternalTransferRecordedPayload,
  InternalTransferUnlinkedPayload,
  LedgerTransactionCreatedPayload,
  LedgerTransactionDeletedPayload,
  LedgerTransactionUpdatedPayload,
  LifestyleTagCreatedPayload,
  LifestyleTagUpdatedPayload,
  RuleCreatedPayload,
  RuleUpdatedPayload,
  SinkCapUpdatedPayload,
  SinkCreatedPayload,
  SinkFundedPayload,
  SinkMonthlyTargetUpdatedPayload,
  SinkWithdrawnPayload,
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
  IncomeSlicedEventSchema,
  InternalTransferLinkedEventSchema,
  InternalTransferRecordedEventSchema,
  InternalTransferUnlinkedEventSchema,
  LedgerTransactionCreatedEventSchema,
  LedgerTransactionDeletedEventSchema,
  LedgerTransactionUpdatedEventSchema,
  LifestyleTagCreatedEventSchema,
  LifestyleTagUpdatedEventSchema,
  RuleCreatedEventSchema,
  RuleUpdatedEventSchema,
  SinkCapUpdatedEventSchema,
  SinkCreatedEventSchema,
  SinkFundedEventSchema,
  SinkMonthlyTargetUpdatedEventSchema,
  SinkWithdrawnEventSchema,
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

export {
  assignmentHasSink,
  assignmentsHaveSinks,
  isFullyUnassignedAssignment,
} from "./budget/assignment.ts";
export type { LedgerAssignment } from "./budget/assignment.ts";
