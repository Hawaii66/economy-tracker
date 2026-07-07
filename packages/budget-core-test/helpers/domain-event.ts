import {
  AccountAddedEventSchema,
  CategoryCreatedEventSchema,
  CURRENT_EVENT_VERSION,
  IncomeSlicedEventSchema,
  LedgerTransactionCreatedEventSchema,
  LedgerTransactionUpdatedEventSchema,
  SinkCreatedEventSchema,
  SinkFundedEventSchema,
  SinkMonthlyTargetUpdatedEventSchema,
  type AccountAddedPayload,
  type CategoryCreatedPayload,
  type IncomeSlicedPayload,
  type LedgerTransactionCreatedPayload,
  type LedgerTransactionUpdatedPayload,
  type SinkCreatedPayload,
  type SinkFundedPayload,
  type SinkMonthlyTargetUpdatedPayload,
} from "budget-core";

type DomainEventInput<TPayload> = {
  sequenceNumber: number;
  userId: string;
  createdAt: string;
  payload: TPayload;
};

export function accountAddedEvent(input: DomainEventInput<AccountAddedPayload>) {
  return AccountAddedEventSchema.parse({
    eventType: "ACCOUNT_ADDED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function categoryCreatedEvent(
  input: DomainEventInput<CategoryCreatedPayload>,
) {
  return CategoryCreatedEventSchema.parse({
    eventType: "CATEGORY_CREATED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function ledgerTransactionCreatedEvent(
  input: DomainEventInput<LedgerTransactionCreatedPayload>,
) {
  return LedgerTransactionCreatedEventSchema.parse({
    eventType: "LEDGER_TRANSACTION_CREATED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function ledgerTransactionUpdatedEvent(
  input: DomainEventInput<LedgerTransactionUpdatedPayload>,
) {
  return LedgerTransactionUpdatedEventSchema.parse({
    eventType: "LEDGER_TRANSACTION_UPDATED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function incomeSlicedEvent(input: DomainEventInput<IncomeSlicedPayload>) {
  return IncomeSlicedEventSchema.parse({
    eventType: "INCOME_SLICED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function sinkCreatedEvent(input: DomainEventInput<SinkCreatedPayload>) {
  return SinkCreatedEventSchema.parse({
    eventType: "SINK_CREATED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function sinkFundedEvent(input: DomainEventInput<SinkFundedPayload>) {
  return SinkFundedEventSchema.parse({
    eventType: "SINK_FUNDED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}

export function sinkMonthlyTargetUpdatedEvent(
  input: DomainEventInput<SinkMonthlyTargetUpdatedPayload>,
) {
  return SinkMonthlyTargetUpdatedEventSchema.parse({
    eventType: "SINK_MONTHLY_TARGET_UPDATED",
    v: CURRENT_EVENT_VERSION,
    ...input,
  });
}
