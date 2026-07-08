# architecture.md

## 1. Architectural Philosophy: Event Sourcing

To achieve ultimate state auditability, time-travel history previews, and deterministic workspace branching, the system utilizes a lightweight **Event Sourced** architecture with **Computed State Write-Through Caching** built on Convex.

### Core Axioms
1.  **Events are the Truth:** All mutations inside a budget workspace are stored as an immutable, append-only chronological stream of `Events`.
2.  **Cached Projections:** For ultra-fast sub-millisecond responses on active client pages, mutations process events immediately and write the calculated results straight to a `cachedStateJson` document representing the current schema.
3.  **Active Upcasting-on-Read:** Whenever state is requested at a historical time-travel sequence, the engine matches the historical version delta and dynamically upgrades (upcasts) state models on the fly before delivering them to the frontend context.

---

## 2. Logical System Math

### 1. Cumulative State Progression

The system state \( \mathbb{S} \) at sequence target \( t \) is resolved deterministically from initial state \( \mathbb{S}_0 \):

$$ \mathbb{S}(t) = \mathbb{S}_0 + \sum_{i=1}^{t} f(E_i) $$

*Where \( f \) is the pure state reducer, and \( E_i \) represents individual domain events.*

### 2. Time-Travel State Reconstruction with Upcasting

To compute a safe software schema state \( \mathbb{S}_{\text{client}} \) at target step \( t \) using a historical snapshot index \( S_s \) and upcasting transformer \( \mathcal{U} \):

$$ \mathbb{S}_{\text{client}}(t) = \mathcal{U}\left(\mathbb{S}_{\text{snap}}(S_s) + \sum_{i = S_s + 1}^{t} f(E_i)\right) $$

### 3. Capped Reserve Sink Allocation

$$ \text{Allocation Amount} = \min(M_{\text{target}}, C_{\text{cap}} - B_{\text{curr}}) $$

*Where \( M_{\text{target}} \) is the monthly target, \( C_{\text{cap}} \) is the ceiling cap, and \( B_{\text{curr}} \) is the current balance.*

---

## 3. Database Schema Blueprint (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    displayName: v.string(),
  }).index("by_email", ["email"]),

  budgets: defineTable({
    name: v.string(),
    createdById: v.id("users"),

    // Branch Genealogy pointers
    isBranch: v.boolean(),
    parentBudgetId: v.union(v.id("budgets"), v.null()),
    branchedAtSequence: v.union(v.number(), v.null()),

    // Fast O(1) Cache: Always guaranteed to be CURRENT_VERSION structured JSON
    cachedStateJson: v.string(),
    currentSequence: v.number(),
  }),

  budgetMemberships: defineTable({
    budgetId: v.id("budgets"),
    userId: v.id("users"),
    role: v.union(v.literal("OWNER"), v.literal("EDITOR"), v.literal("VIEWER")),
  })
    .index("by_budget", ["budgetId"])
    .index("by_user", ["userId"]),

  events: defineTable({
    budgetId: v.id("budgets"),
    sequenceNumber: v.number(),
    eventType: v.string(),
    payload: v.any(),
    userId: v.id("users"),
    createdAt: v.string(),
    v: v.number(), // Schema version indicator
  })
    .index("by_budget_seq", ["budgetId", "sequenceNumber"])
    .index("by_budget", ["budgetId"]),

  snapshots: defineTable({
    budgetId: v.id("budgets"),
    sequenceNumber: v.number(),
    stateDataJson: v.string(),
    createdAt: v.string(),
  }).index("by_budget_seq", ["budgetId", "sequenceNumber"]),
});
```

---

## 4. State Calculation Engine (`core/engine.ts`)

```typescript
export const CURRENT_VERSION = 2;

// --- STATE VERSION SCHEMAS ---

export interface StateV1 {
  version: 1;
  accounts: Record<string, { id: string; name: string; balance: number }>;
  sinks: Record<string, { id: string; name: string; balance: number }>;
}

export interface StateV2 {
  version: 2;
  accounts: Record<
    string,
    {
      id: string;
      name: string;
      balance: number;
      currency: string;
    }
  >;
  sinks: Record<
    string,
    {
      id: string;
      name: string;
      balance: number;
      cap: number | null;
    }
  >;
}

export type BudgetState = StateV1 | StateV2;

export const INITIAL_STATE: StateV1 = {
  version: 1,
  accounts: {},
  sinks: {},
};

// --- DOMAIN EVENT SPECIFICATIONS ---

export interface DomainEvent {
  eventType: string;
  sequenceNumber: number;
  payload: Record<string, any>;
  userId: string;
  createdAt: string;
  v: number;
}

// --- VERSIONED REDUCER FLOWS ---

function reducerV1(state: StateV1, event: DomainEvent): StateV1 {
  const { eventType, payload } = event;
  switch (eventType) {
    case "ACCOUNT_ADDED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          [payload.accountId]: {
            id: payload.accountId,
            name: payload.name,
            balance: payload.openingBalance,
          },
        },
      };

    case "SINK_CREATED":
      return {
        ...state,
        sinks: {
          ...state.sinks,
          [payload.sinkId]: {
            id: payload.sinkId,
            name: payload.name,
            balance: 0,
          },
        },
      };

    default:
      return state;
  }
}

function reducerV2(state: StateV2, event: DomainEvent): StateV2 {
  const { eventType, payload } = event;
  switch (eventType) {
    case "ACCOUNT_ADDED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          [payload.accountId]: {
            id: payload.accountId,
            name: payload.name,
            balance: payload.openingBalance,
            currency: payload.currency || "SEK",
          },
        },
      };

    case "SINK_CREATED":
      return {
        ...state,
        sinks: {
          ...state.sinks,
          [payload.sinkId]: {
            id: payload.sinkId,
            name: payload.name,
            balance: 0,
            cap: payload.capAmount ?? null,
          },
        },
      };

    default:
      return state;
  }
}

// --- UPCASTING PIPELINE ---

const upcasters: Record<number, (oldState: any) => any> = {
  1: (stateV1: StateV1): StateV2 => {
    const upgradedAccounts: StateV2["accounts"] = {};
    const upgradedSinks: StateV2["sinks"] = {};

    for (const [id, acc] of Object.entries(stateV1.accounts)) {
      upgradedAccounts[id] = { ...acc, currency: "SEK" };
    }
    for (const [id, sink] of Object.entries(stateV1.sinks)) {
      upgradedSinks[id] = { ...sink, cap: null };
    }

    return {
      version: 2,
      accounts: upgradedAccounts,
      sinks: upgradedSinks,
    };
  },
};

export function upcastState(state: BudgetState): StateV2 {
  let activeState = state;
  while (activeState.version < CURRENT_VERSION) {
    const upcaster = upcasters[activeState.version];
    if (!upcaster) {
      throw new Error(`Upcast path not found for state v${activeState.version}`);
    }
    activeState = upcaster(activeState);
  }
  return activeState as StateV2;
}

// --- GLOBAL UNIFIED REDUCER ---

export function budgetStateReducer(
  state: BudgetState,
  event: DomainEvent
): BudgetState {
  let activeState = state;

  if (event.v > activeState.version) {
    activeState = upcastState(activeState);
  }

  if (activeState.version === 1) {
    return reducerV1(activeState, event);
  } else if (activeState.version === 2) {
    return reducerV2(activeState, event);
  }

  throw new Error(`Unsupported schema version state: v${activeState.version}`);
}

export function replayEvents(
  events: DomainEvent[],
  initial: BudgetState = INITIAL_STATE
): BudgetState {
  return events.reduce(budgetStateReducer, initial);
}
```

---

## 5. Active Convex State Management (`convex/budgets.ts`)

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  budgetStateReducer,
  upcastState,
  replayEvents,
  INITIAL_STATE,
  DomainEvent,
  CURRENT_VERSION,
} from "../core/engine";

/**
 * Fetch budget state: Reads fast cache instantly,
 * or recalculates history on the fly with dynamic upcasting.
 */
export const getBudgetState = query({
  args: {
    budgetId: v.id("budgets"),
    timeTravelSeq: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) throw new Error("Budget not found");

    if (args.timeTravelSeq === undefined) {
      return {
        sequence: budget.currentSequence,
        state: JSON.parse(budget.cachedStateJson),
      };
    }

    const closestSnapshot = await ctx.db
      .query("snapshots")
      .withIndex("by_budget_seq", (q) =>
        q
          .eq("budgetId", args.budgetId)
          .lte("sequenceNumber", args.timeTravelSeq!)
      )
      .order("desc")
      .first();

    let state = closestSnapshot
      ? JSON.parse(closestSnapshot.stateDataJson)
      : INITIAL_STATE;

    const startSeq = closestSnapshot ? closestSnapshot.sequenceNumber : 0;

    const deltaEvents = await ctx.db
      .query("events")
      .withIndex("by_budget_seq", (q) =>
        q
          .eq("budgetId", args.budgetId)
          .gt("sequenceNumber", startSeq)
          .lte("sequenceNumber", args.timeTravelSeq!)
      )
      .order("asc")
      .collect();

    const domainEvents: DomainEvent[] = deltaEvents.map((e) => ({
      eventType: e.eventType,
      sequenceNumber: e.sequenceNumber,
      payload: e.payload,
      userId: e.userId,
      createdAt: e.createdAt,
      v: e.v,
    }));

    const historicalRawState = replayEvents(domainEvents, state);
    const clientSafeUpcastState = upcastState(historicalRawState);

    return {
      sequence: args.timeTravelSeq,
      state: clientSafeUpcastState,
    };
  },
});

/**
 * Append Event: Writes event, updates cache in-place globally,
 * and handles automated snapshotting every 100 entries.
 */
export const appendEvent = mutation({
  args: {
    budgetId: v.id("budgets"),
    eventType: v.string(),
    payload: v.any(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) throw new Error("Budget workspace not found");

    const nextSeq = budget.currentSequence + 1;
    const timestamp = new Date().toISOString();

    const newEvent: DomainEvent = {
      eventType: args.eventType,
      sequenceNumber: nextSeq,
      payload: args.payload,
      userId: args.userId,
      createdAt: timestamp,
      v: CURRENT_VERSION,
    };

    await ctx.db.insert("events", {
      budgetId: args.budgetId,
      sequenceNumber: nextSeq,
      eventType: args.eventType,
      payload: args.payload,
      userId: args.userId,
      createdAt: timestamp,
      v: CURRENT_VERSION,
    });

    const previousStateCache = JSON.parse(budget.cachedStateJson);
    const updatedStateCache = budgetStateReducer(previousStateCache, newEvent);

    await ctx.db.patch(args.budgetId, {
      cachedStateJson: JSON.stringify(updatedStateCache),
      currentSequence: nextSeq,
    });

    if (nextSeq % 100 === 0) {
      await ctx.db.insert("snapshots", {
        budgetId: args.budgetId,
        sequenceNumber: nextSeq,
        stateDataJson: JSON.stringify(updatedStateCache),
        createdAt: timestamp,
      });
    }

    return { sequence: nextSeq };
  },
});

/**
 * Copy-on-Fork Branching Mutation
 */
export const branchBudget = mutation({
  args: {
    parentBudgetId: v.id("budgets"),
    branchName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const parentBudget = await ctx.db.get(args.parentBudgetId);
    if (!parentBudget) throw new Error("Parent budget not found");

    const branchBudgetId = await ctx.db.insert("budgets", {
      name: args.branchName,
      createdById: args.userId,
      isBranch: true,
      parentBudgetId: args.parentBudgetId,
      branchedAtSequence: parentBudget.currentSequence,
      cachedStateJson: parentBudget.cachedStateJson,
      currentSequence: 0,
    });

    await ctx.db.insert("budgetMemberships", {
      budgetId: branchBudgetId,
      userId: args.userId,
      role: "OWNER",
    });

    return branchBudgetId;
  },
});
```