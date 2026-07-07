import { z } from "zod";
import {
  CURRENT_EVENT_VERSION,
  EntityIdSchema,
  IsoDateTimeSchema,
} from "../common.ts";
import {
  AccountAddedPayloadSchema,
  AccountBalanceAdjustedPayloadSchema,
  AccountUpdatedPayloadSchema,
  CategoryCreatedPayloadSchema,
  CategoryUpdatedPayloadSchema,
  EventTagArchivedPayloadSchema,
  EventTagCreatedPayloadSchema,
  EventTagUpdatedPayloadSchema,
  GenesisEpochSetPayloadSchema,
  IncomeSlicedPayloadSchema,
  InternalTransferLinkedPayloadSchema,
  InternalTransferRecordedPayloadSchema,
  InternalTransferUnlinkedPayloadSchema,
  LedgerTransactionCreatedPayloadSchema,
  LedgerTransactionDeletedPayloadSchema,
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
} from "./payloads.ts";

export const EVENT_TYPES = [
  "GENESIS_EPOCH_SET",
  "ACCOUNT_ADDED",
  "ACCOUNT_UPDATED",
  "ACCOUNT_BALANCE_ADJUSTED",
  "SINK_CREATED",
  "SINK_FUNDED",
  "SINK_WITHDRAWN",
  "SINK_CAP_UPDATED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "LIFESTYLE_TAG_CREATED",
  "LIFESTYLE_TAG_UPDATED",
  "EVENT_TAG_CREATED",
  "EVENT_TAG_UPDATED",
  "EVENT_TAG_ARCHIVED",
  "PARSER_TEMPLATE_CONFIGURED",
  "RULE_CREATED",
  "RULE_UPDATED",
  "TRANSACTIONS_IMPORTED",
  "LEDGER_TRANSACTION_CREATED",
  "LEDGER_TRANSACTION_UPDATED",
  "LEDGER_TRANSACTION_DELETED",
  "SPLIT_INITIATED",
  "SPLIT_LINKED",
  "INCOME_SLICED",
  "INTERNAL_TRANSFER_LINKED",
  "INTERNAL_TRANSFER_UNLINKED",
  "INTERNAL_TRANSFER_RECORDED",
] as const;

export const EventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof EventTypeSchema>;

const domainEventBase = {
  sequenceNumber: z.number().int().positive(),
  userId: EntityIdSchema,
  createdAt: IsoDateTimeSchema,
  v: z.number().int().positive(),
};

export const GenesisEpochSetEventSchema = z.object({
  eventType: z.literal("GENESIS_EPOCH_SET"),
  payload: GenesisEpochSetPayloadSchema,
  ...domainEventBase,
});

export const AccountAddedEventSchema = z.object({
  eventType: z.literal("ACCOUNT_ADDED"),
  payload: AccountAddedPayloadSchema,
  ...domainEventBase,
});

export const AccountUpdatedEventSchema = z.object({
  eventType: z.literal("ACCOUNT_UPDATED"),
  payload: AccountUpdatedPayloadSchema,
  ...domainEventBase,
});

export const AccountBalanceAdjustedEventSchema = z.object({
  eventType: z.literal("ACCOUNT_BALANCE_ADJUSTED"),
  payload: AccountBalanceAdjustedPayloadSchema,
  ...domainEventBase,
});

export const SinkCreatedEventSchema = z.object({
  eventType: z.literal("SINK_CREATED"),
  payload: SinkCreatedPayloadSchema,
  ...domainEventBase,
});

export const SinkFundedEventSchema = z.object({
  eventType: z.literal("SINK_FUNDED"),
  payload: SinkFundedPayloadSchema,
  ...domainEventBase,
});

export const SinkWithdrawnEventSchema = z.object({
  eventType: z.literal("SINK_WITHDRAWN"),
  payload: SinkWithdrawnPayloadSchema,
  ...domainEventBase,
});

export const SinkCapUpdatedEventSchema = z.object({
  eventType: z.literal("SINK_CAP_UPDATED"),
  payload: SinkCapUpdatedPayloadSchema,
  ...domainEventBase,
});

export const CategoryCreatedEventSchema = z.object({
  eventType: z.literal("CATEGORY_CREATED"),
  payload: CategoryCreatedPayloadSchema,
  ...domainEventBase,
});

export const CategoryUpdatedEventSchema = z.object({
  eventType: z.literal("CATEGORY_UPDATED"),
  payload: CategoryUpdatedPayloadSchema,
  ...domainEventBase,
});

export const LifestyleTagCreatedEventSchema = z.object({
  eventType: z.literal("LIFESTYLE_TAG_CREATED"),
  payload: LifestyleTagCreatedPayloadSchema,
  ...domainEventBase,
});

export const LifestyleTagUpdatedEventSchema = z.object({
  eventType: z.literal("LIFESTYLE_TAG_UPDATED"),
  payload: LifestyleTagUpdatedPayloadSchema,
  ...domainEventBase,
});

export const EventTagCreatedEventSchema = z.object({
  eventType: z.literal("EVENT_TAG_CREATED"),
  payload: EventTagCreatedPayloadSchema,
  ...domainEventBase,
});

export const EventTagUpdatedEventSchema = z.object({
  eventType: z.literal("EVENT_TAG_UPDATED"),
  payload: EventTagUpdatedPayloadSchema,
  ...domainEventBase,
});

export const EventTagArchivedEventSchema = z.object({
  eventType: z.literal("EVENT_TAG_ARCHIVED"),
  payload: EventTagArchivedPayloadSchema,
  ...domainEventBase,
});

export const ParserTemplateConfiguredEventSchema = z.object({
  eventType: z.literal("PARSER_TEMPLATE_CONFIGURED"),
  payload: ParserTemplateConfiguredPayloadSchema,
  ...domainEventBase,
});

export const RuleCreatedEventSchema = z.object({
  eventType: z.literal("RULE_CREATED"),
  payload: RuleCreatedPayloadSchema,
  ...domainEventBase,
});

export const RuleUpdatedEventSchema = z.object({
  eventType: z.literal("RULE_UPDATED"),
  payload: RuleUpdatedPayloadSchema,
  ...domainEventBase,
});

export const TransactionsImportedEventSchema = z.object({
  eventType: z.literal("TRANSACTIONS_IMPORTED"),
  payload: TransactionsImportedPayloadSchema,
  ...domainEventBase,
});

export const LedgerTransactionCreatedEventSchema = z.object({
  eventType: z.literal("LEDGER_TRANSACTION_CREATED"),
  payload: LedgerTransactionCreatedPayloadSchema,
  ...domainEventBase,
});

export const LedgerTransactionUpdatedEventSchema = z.object({
  eventType: z.literal("LEDGER_TRANSACTION_UPDATED"),
  payload: LedgerTransactionUpdatedPayloadSchema,
  ...domainEventBase,
});

export const LedgerTransactionDeletedEventSchema = z.object({
  eventType: z.literal("LEDGER_TRANSACTION_DELETED"),
  payload: LedgerTransactionDeletedPayloadSchema,
  ...domainEventBase,
});

export const SplitInitiatedEventSchema = z.object({
  eventType: z.literal("SPLIT_INITIATED"),
  payload: SplitInitiatedPayloadSchema,
  ...domainEventBase,
});

export const SplitLinkedEventSchema = z.object({
  eventType: z.literal("SPLIT_LINKED"),
  payload: SplitLinkedPayloadSchema,
  ...domainEventBase,
});

export const IncomeSlicedEventSchema = z.object({
  eventType: z.literal("INCOME_SLICED"),
  payload: IncomeSlicedPayloadSchema,
  ...domainEventBase,
});

export const InternalTransferLinkedEventSchema = z.object({
  eventType: z.literal("INTERNAL_TRANSFER_LINKED"),
  payload: InternalTransferLinkedPayloadSchema,
  ...domainEventBase,
});

export const InternalTransferUnlinkedEventSchema = z.object({
  eventType: z.literal("INTERNAL_TRANSFER_UNLINKED"),
  payload: InternalTransferUnlinkedPayloadSchema,
  ...domainEventBase,
});

export const InternalTransferRecordedEventSchema = z.object({
  eventType: z.literal("INTERNAL_TRANSFER_RECORDED"),
  payload: InternalTransferRecordedPayloadSchema,
  ...domainEventBase,
});

export const DomainEventSchema = z.discriminatedUnion("eventType", [
  GenesisEpochSetEventSchema,
  AccountAddedEventSchema,
  AccountUpdatedEventSchema,
  AccountBalanceAdjustedEventSchema,
  SinkCreatedEventSchema,
  SinkFundedEventSchema,
  SinkWithdrawnEventSchema,
  SinkCapUpdatedEventSchema,
  CategoryCreatedEventSchema,
  CategoryUpdatedEventSchema,
  LifestyleTagCreatedEventSchema,
  LifestyleTagUpdatedEventSchema,
  EventTagCreatedEventSchema,
  EventTagUpdatedEventSchema,
  EventTagArchivedEventSchema,
  ParserTemplateConfiguredEventSchema,
  RuleCreatedEventSchema,
  RuleUpdatedEventSchema,
  TransactionsImportedEventSchema,
  LedgerTransactionCreatedEventSchema,
  LedgerTransactionUpdatedEventSchema,
  LedgerTransactionDeletedEventSchema,
  SplitInitiatedEventSchema,
  SplitLinkedEventSchema,
  IncomeSlicedEventSchema,
  InternalTransferLinkedEventSchema,
  InternalTransferUnlinkedEventSchema,
  InternalTransferRecordedEventSchema,
]);
export type DomainEvent = z.infer<typeof DomainEventSchema>;

export const StoredEventSchema = z.intersection(
  DomainEventSchema,
  z.object({ budgetId: EntityIdSchema }),
);
export type StoredEvent = z.infer<typeof StoredEventSchema>;

const appendEventBase = {
  budgetId: EntityIdSchema,
  userId: EntityIdSchema,
  v: z.number().int().positive().default(CURRENT_EVENT_VERSION),
};

export const AppendEventInputSchema = z.discriminatedUnion("eventType", [
  z.object({
    eventType: z.literal("GENESIS_EPOCH_SET"),
    payload: GenesisEpochSetPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("ACCOUNT_ADDED"),
    payload: AccountAddedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("ACCOUNT_UPDATED"),
    payload: AccountUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("ACCOUNT_BALANCE_ADJUSTED"),
    payload: AccountBalanceAdjustedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("SINK_CREATED"),
    payload: SinkCreatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("SINK_FUNDED"),
    payload: SinkFundedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("SINK_WITHDRAWN"),
    payload: SinkWithdrawnPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("SINK_CAP_UPDATED"),
    payload: SinkCapUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("CATEGORY_CREATED"),
    payload: CategoryCreatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("CATEGORY_UPDATED"),
    payload: CategoryUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("LIFESTYLE_TAG_CREATED"),
    payload: LifestyleTagCreatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("LIFESTYLE_TAG_UPDATED"),
    payload: LifestyleTagUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("EVENT_TAG_CREATED"),
    payload: EventTagCreatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("EVENT_TAG_UPDATED"),
    payload: EventTagUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("EVENT_TAG_ARCHIVED"),
    payload: EventTagArchivedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("PARSER_TEMPLATE_CONFIGURED"),
    payload: ParserTemplateConfiguredPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("RULE_CREATED"),
    payload: RuleCreatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("RULE_UPDATED"),
    payload: RuleUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("TRANSACTIONS_IMPORTED"),
    payload: TransactionsImportedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("LEDGER_TRANSACTION_CREATED"),
    payload: LedgerTransactionCreatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("LEDGER_TRANSACTION_UPDATED"),
    payload: LedgerTransactionUpdatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("LEDGER_TRANSACTION_DELETED"),
    payload: LedgerTransactionDeletedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("SPLIT_INITIATED"),
    payload: SplitInitiatedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("SPLIT_LINKED"),
    payload: SplitLinkedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("INCOME_SLICED"),
    payload: IncomeSlicedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("INTERNAL_TRANSFER_LINKED"),
    payload: InternalTransferLinkedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("INTERNAL_TRANSFER_UNLINKED"),
    payload: InternalTransferUnlinkedPayloadSchema,
    ...appendEventBase,
  }),
  z.object({
    eventType: z.literal("INTERNAL_TRANSFER_RECORDED"),
    payload: InternalTransferRecordedPayloadSchema,
    ...appendEventBase,
  }),
]);
export type AppendEventInput = z.infer<typeof AppendEventInputSchema>;
