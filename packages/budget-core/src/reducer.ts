import { produce, type Draft } from "immer";
import { DEFAULT_ACCOUNT_APPEARANCE, type Sink } from "./budget/entities.ts";
import type { BudgetState } from "./budget/state.ts";
import type { EntityId } from "./common.ts";
import type { DomainEvent } from "./events/domain-event.ts";
import type { SinkCreatedPayload } from "./events/payloads.ts";

type DraftBudgetState = Draft<BudgetState>;

function requireAccount(draft: DraftBudgetState, accountId: EntityId) {
  const account = draft.accounts[accountId];
  if (!account) {
    throw new Error(`Account not found: ${accountId}`);
  }
  return account;
}

function requireSink(draft: DraftBudgetState, sinkId: EntityId) {
  const sink = draft.sinks[sinkId];
  if (!sink) {
    throw new Error(`Sink not found: ${sinkId}`);
  }
  return sink;
}

function requireLedgerTransaction(
  draft: DraftBudgetState,
  ledgerTransactionId: EntityId,
) {
  const ledgerTransaction = draft.ledgerTransactions[ledgerTransactionId];
  if (!ledgerTransaction) {
    throw new Error(`Ledger transaction not found: ${ledgerTransactionId}`);
  }
  return ledgerTransaction;
}

function requireSplitGroup(draft: DraftBudgetState, splitGroupId: EntityId) {
  const splitGroup = draft.splitGroups[splitGroupId];
  if (!splitGroup) {
    throw new Error(`Split group not found: ${splitGroupId}`);
  }
  return splitGroup;
}

function requireEventTag(draft: DraftBudgetState, tagId: EntityId) {
  const eventTag = draft.eventTags[tagId];
  if (!eventTag) {
    throw new Error(`Event tag not found: ${tagId}`);
  }
  return eventTag;
}

function requireCategory(draft: DraftBudgetState, categoryId: EntityId) {
  const category = draft.categories[categoryId];
  if (!category) {
    throw new Error(`Category not found: ${categoryId}`);
  }
  return category;
}

function requireLifestyleTag(draft: DraftBudgetState, tagId: EntityId) {
  const lifestyleTag = draft.lifestyleTags[tagId];
  if (!lifestyleTag) {
    throw new Error(`Lifestyle tag not found: ${tagId}`);
  }
  return lifestyleTag;
}

function sinkFromCreatedPayload(payload: SinkCreatedPayload): Sink {
  const base = {
    id: payload.sinkId,
    name: payload.name,
    balance: 0,
  };

  switch (payload.sinkType) {
    case "target_date":
      return {
        ...base,
        sinkType: "target_date",
        targetAmount: payload.targetAmount,
        targetDate: payload.targetDate,
      };
    case "recurring_bill":
      return {
        ...base,
        sinkType: "recurring_bill",
        billAmount: payload.billAmount,
        periodMonths: payload.periodMonths,
      };
    case "capped_reserve":
      return {
        ...base,
        sinkType: "capped_reserve",
        monthlyTarget: payload.monthlyTarget,
        cap: payload.cap,
      };
  }
}

export function applyEventToDraft(draft: DraftBudgetState, event: DomainEvent): void {
  switch (event.eventType) {
    case "GENESIS_EPOCH_SET": {
      const { payload } = event;
      draft.genesisEpoch = {
        establishedOn: payload.establishedOn,
        accountOpeningBalances: payload.accountOpeningBalances,
        sinkOpeningBalances: payload.sinkOpeningBalances,
      };

      for (const [accountId, balance] of Object.entries(
        payload.accountOpeningBalances,
      )) {
        requireAccount(draft, accountId).balance = balance;
      }

      for (const [sinkId, balance] of Object.entries(payload.sinkOpeningBalances)) {
        requireSink(draft, sinkId).balance = balance;
      }
      return;
    }

    case "ACCOUNT_ADDED": {
      const { payload } = event;
      draft.accounts[payload.accountId] = {
        id: payload.accountId,
        name: payload.name,
        description: payload.description ?? DEFAULT_ACCOUNT_APPEARANCE.description,
        color: payload.color ?? DEFAULT_ACCOUNT_APPEARANCE.color,
        icon: payload.icon ?? DEFAULT_ACCOUNT_APPEARANCE.icon,
        balance: payload.openingBalance,
        currency: payload.currency ?? "SEK",
        genesisDate: payload.genesisDate,
        parserTemplateId: null,
      };
      return;
    }

    case "ACCOUNT_UPDATED": {
      const { payload } = event;
      const account = requireAccount(draft, payload.accountId);
      account.name = payload.name;
      account.description = payload.description;
      account.color = payload.color;
      account.icon = payload.icon;
      return;
    }

    case "ACCOUNT_BALANCE_ADJUSTED": {
      const { payload } = event;
      requireAccount(draft, payload.accountId).balance = payload.newBalance;
      return;
    }

    case "SINK_CREATED": {
      const { payload } = event;
      draft.sinks[payload.sinkId] = sinkFromCreatedPayload(payload);
      return;
    }

    case "SINK_FUNDED": {
      const { payload } = event;
      requireSink(draft, payload.sinkId).balance += payload.amount;
      return;
    }

    case "SINK_WITHDRAWN": {
      const { payload } = event;
      requireSink(draft, payload.sinkId).balance -= payload.amount;
      return;
    }

    case "SINK_CAP_UPDATED": {
      const { payload } = event;
      const sink = requireSink(draft, payload.sinkId);
      if (sink.sinkType !== "capped_reserve") {
        throw new Error(`Sink ${payload.sinkId} is not a capped reserve sink`);
      }
      sink.cap = payload.cap;
      return;
    }

    case "CATEGORY_CREATED": {
      const { payload } = event;
      draft.categories[payload.categoryId] = {
        id: payload.categoryId,
        name: payload.name,
        color: payload.color,
      };
      return;
    }

    case "CATEGORY_UPDATED": {
      const { payload } = event;
      const category = requireCategory(draft, payload.categoryId);
      category.name = payload.name;
      category.color = payload.color;
      return;
    }

    case "LIFESTYLE_TAG_CREATED": {
      const { payload } = event;
      draft.lifestyleTags[payload.tagId] = {
        id: payload.tagId,
        name: payload.name,
        color: payload.color,
      };
      return;
    }

    case "LIFESTYLE_TAG_UPDATED": {
      const { payload } = event;
      const lifestyleTag = requireLifestyleTag(draft, payload.tagId);
      lifestyleTag.name = payload.name;
      lifestyleTag.color = payload.color;
      return;
    }

    case "EVENT_TAG_CREATED": {
      const { payload } = event;
      draft.eventTags[payload.tagId] = {
        id: payload.tagId,
        name: payload.name,
        color: payload.color,
        archived: false,
      };
      return;
    }

    case "EVENT_TAG_UPDATED": {
      const { payload } = event;
      const eventTag = requireEventTag(draft, payload.tagId);
      eventTag.name = payload.name;
      eventTag.color = payload.color;
      eventTag.archived = payload.archived;
      return;
    }

    case "EVENT_TAG_ARCHIVED": {
      const { payload } = event;
      requireEventTag(draft, payload.tagId).archived = true;
      return;
    }

    case "PARSER_TEMPLATE_CONFIGURED": {
      const { payload } = event;
      draft.parserTemplates[payload.templateId] = {
        id: payload.templateId,
        accountId: payload.accountId,
        delimiter: payload.delimiter,
        encoding: payload.encoding,
        columnMappings: payload.columnMappings,
        numberFormat: payload.numberFormat,
      };
      requireAccount(draft, payload.accountId).parserTemplateId = payload.templateId;
      return;
    }

    case "RULE_CREATED":
    case "RULE_UPDATED": {
      const { payload } = event;
      draft.rules[payload.ruleId] = {
        id: payload.ruleId,
        name: payload.name,
        keywords: payload.keywords,
        categoryId: payload.categoryId,
        sinkId: payload.sinkId,
        lifestyleTagIds: payload.lifestyleTagIds,
        eventTagIds: payload.eventTagIds,
      };
      return;
    }

    case "TRANSACTIONS_IMPORTED": {
      const { payload } = event;
      for (const transaction of payload.transactions) {
        draft.rawTransactions[transaction.rawTransactionId] = {
          id: transaction.rawTransactionId,
          accountId: payload.accountId,
          importBatchId: payload.importBatchId,
          date: transaction.date,
          amount: transaction.amount,
          description: transaction.description,
          rawRow: transaction.rawRow,
        };
      }
      return;
    }

    case "LEDGER_TRANSACTION_CREATED": {
      const { payload } = event;
      requireAccount(draft, payload.accountId).balance += payload.amount;
      draft.ledgerTransactions[payload.ledgerTransactionId] = {
        id: payload.ledgerTransactionId,
        rawTransactionId: payload.rawTransactionId,
        accountId: payload.accountId,
        date: payload.date,
        amount: payload.amount,
        description: payload.description,
        categoryId: payload.categoryId,
        sinkId: payload.sinkId,
        lifestyleTagIds: payload.lifestyleTagIds,
        eventTagIds: payload.eventTagIds,
        splitGroupId: null,
        internalTransferGroupId: null,
        virtualSlices: [],
      };
      return;
    }

    case "LEDGER_TRANSACTION_UPDATED": {
      const { payload } = event;
      const ledgerTransaction = requireLedgerTransaction(
        draft,
        payload.ledgerTransactionId,
      );
      ledgerTransaction.categoryId = payload.categoryId;
      ledgerTransaction.sinkId = payload.sinkId;
      ledgerTransaction.lifestyleTagIds = payload.lifestyleTagIds;
      ledgerTransaction.eventTagIds = payload.eventTagIds;
      if (payload.description !== undefined) {
        ledgerTransaction.description = payload.description;
      }
      return;
    }

    case "SPLIT_INITIATED": {
      const { payload, userId } = event;
      draft.splitGroups[payload.splitGroupId] = {
        id: payload.splitGroupId,
        parentLedgerTransactionId: payload.parentLedgerTransactionId,
        linkedLedgerTransactionIds: [],
        initiatedByUserId: userId,
      };
      requireLedgerTransaction(
        draft,
        payload.parentLedgerTransactionId,
      ).splitGroupId = payload.splitGroupId;
      return;
    }

    case "SPLIT_LINKED": {
      const { payload } = event;
      requireSplitGroup(draft, payload.splitGroupId).linkedLedgerTransactionIds.push(
        payload.linkedLedgerTransactionId,
      );
      requireLedgerTransaction(
        draft,
        payload.linkedLedgerTransactionId,
      ).splitGroupId = payload.splitGroupId;
      return;
    }

    case "INCOME_SLICED": {
      const { payload } = event;
      requireLedgerTransaction(draft, payload.ledgerTransactionId).virtualSlices =
        payload.slices.map((slice) => ({
          id: slice.sliceId,
          amount: slice.amount,
          description: slice.description,
          categoryId: slice.categoryId,
          sinkId: slice.sinkId,
          lifestyleTagIds: slice.lifestyleTagIds,
          eventTagIds: slice.eventTagIds,
        }));
      return;
    }

    case "INTERNAL_TRANSFER_LINKED": {
      const { payload, userId } = event;
      const ledgerTransactionA = requireLedgerTransaction(
        draft,
        payload.ledgerTransactionIdA,
      );
      const ledgerTransactionB = requireLedgerTransaction(
        draft,
        payload.ledgerTransactionIdB,
      );

      if (ledgerTransactionA.accountId === ledgerTransactionB.accountId) {
        throw new Error("Internal transfer legs must be in different accounts");
      }

      if (ledgerTransactionA.amount + ledgerTransactionB.amount !== 0) {
        throw new Error("Internal transfer amounts must net to zero");
      }

      if (
        ledgerTransactionA.internalTransferGroupId ||
        ledgerTransactionB.internalTransferGroupId
      ) {
        throw new Error("Transaction is already linked as an internal transfer");
      }

      draft.internalTransferGroups[payload.transferGroupId] = {
        id: payload.transferGroupId,
        ledgerTransactionIds: [
          payload.ledgerTransactionIdA,
          payload.ledgerTransactionIdB,
        ],
        initiatedByUserId: userId,
      };
      ledgerTransactionA.internalTransferGroupId = payload.transferGroupId;
      ledgerTransactionB.internalTransferGroupId = payload.transferGroupId;
      return;
    }

    case "INTERNAL_TRANSFER_RECORDED": {
      const { payload } = event;
      requireAccount(draft, payload.fromAccountId).balance -= payload.amount;
      requireAccount(draft, payload.toAccountId).balance += payload.amount;
      return;
    }
  }
}

export function reduceBudgetState(state: BudgetState, event: DomainEvent): BudgetState {
  return produce(state, (draft) => {
    applyEventToDraft(draft, event);
  });
}

export function replayBudgetEvents(
  state: BudgetState,
  events: readonly DomainEvent[],
): BudgetState {
  return events.reduce(reduceBudgetState, state);
}
