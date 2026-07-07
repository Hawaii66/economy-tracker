import {
  AccountAddedEventSchema,
  CategoryCreatedEventSchema,
  CURRENT_EVENT_VERSION,
  LedgerTransactionCreatedEventSchema,
  type AccountAddedPayload,
  type CategoryCreatedPayload,
  type LedgerTransactionCreatedPayload,
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
