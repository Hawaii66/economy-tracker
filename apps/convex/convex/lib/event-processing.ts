import {
  BudgetStateSchema,
  CURRENT_EVENT_VERSION,
  DomainEventSchema,
  reduceBudgetState,
  type BudgetState,
  type DomainEvent,
} from "budget-core";
import type { Doc, Id } from "../_generated/dataModel.js";
import type { MutationCtx } from "../_generated/server.js";

export const AUTO_SNAPSHOT_INTERVAL = 100;

export type ClientEventInput = {
  eventType: string;
  payload: unknown;
  v?: number;
};

export function parseCachedBudgetState(cachedStateJson: string): BudgetState {
  return BudgetStateSchema.parse(JSON.parse(cachedStateJson));
}

export function parseClientEvent(
  input: ClientEventInput,
  meta: {
    sequenceNumber: number;
    userId: string;
    createdAt: string;
  },
): DomainEvent {
  return DomainEventSchema.parse({
    eventType: input.eventType,
    payload: input.payload,
    v: input.v ?? CURRENT_EVENT_VERSION,
    sequenceNumber: meta.sequenceNumber,
    userId: meta.userId,
    createdAt: meta.createdAt,
  });
}

export function storedEventToDomainEvent(event: Doc<"events">): DomainEvent {
  return DomainEventSchema.parse({
    eventType: event.eventType,
    payload: event.payload,
    sequenceNumber: event.sequenceNumber,
    userId: event.userId,
    createdAt: event.createdAt,
    v: event.v,
  });
}

export async function insertSnapshot(
  ctx: MutationCtx,
  budgetId: Id<"budgets">,
  sequenceNumber: number,
  state: BudgetState,
  createdAt: string,
) {
  const existingSnapshot = await ctx.db
    .query("snapshots")
    .withIndex("by_budget_seq", (q) =>
      q.eq("budgetId", budgetId).eq("sequenceNumber", sequenceNumber),
    )
    .first();

  const stateDataJson = JSON.stringify(state);

  if (existingSnapshot) {
    await ctx.db.patch(existingSnapshot._id, {
      stateDataJson,
      createdAt,
    });
    return existingSnapshot._id;
  }

  return ctx.db.insert("snapshots", {
    budgetId,
    sequenceNumber,
    stateDataJson,
    createdAt,
  });
}

export async function appendBudgetEvents(
  ctx: MutationCtx,
  args: {
    budget: Doc<"budgets">;
    userId: Id<"users">;
    events: ClientEventInput[];
  },
) {
  if (args.events.length === 0) {
    return {
      startSequence: args.budget.currentSequence,
      endSequence: args.budget.currentSequence,
      eventCount: 0,
    };
  }

  let currentSequence = args.budget.currentSequence;
  let state = parseCachedBudgetState(args.budget.cachedStateJson);
  const timestamp = new Date().toISOString();

  for (const input of args.events) {
    currentSequence += 1;

    const domainEvent = parseClientEvent(input, {
      sequenceNumber: currentSequence,
      userId: args.userId,
      createdAt: timestamp,
    });

    await ctx.db.insert("events", {
      budgetId: args.budget._id,
      sequenceNumber: currentSequence,
      eventType: domainEvent.eventType,
      payload: domainEvent.payload,
      userId: args.userId,
      createdAt: timestamp,
      v: domainEvent.v,
    });

    state = reduceBudgetState(state, domainEvent);

    if (currentSequence % AUTO_SNAPSHOT_INTERVAL === 0) {
      await insertSnapshot(
        ctx,
        args.budget._id,
        currentSequence,
        state,
        timestamp,
      );
    }
  }

  await ctx.db.patch(args.budget._id, {
    cachedStateJson: JSON.stringify(state),
    currentSequence,
  });

  return {
    startSequence: args.budget.currentSequence + 1,
    endSequence: currentSequence,
    eventCount: args.events.length,
  };
}
