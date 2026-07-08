import { describe, expect, it } from "vitest";
import {
  aggregateIncomeAndExpenses,
  aggregateLedgerByCategory,
  aggregateLedgerByMonth,
  aggregateLedgerBySink,
  aggregateLedgerByTag,
  aggregateMonthlyTrend,
  type LedgerTransaction,
} from "budget-core";

const baseTransaction = {
  rawTransactionId: null,
  accountId: "account-1",
  date: "2026-03-15",
  description: "Test",
  categoryId: "cat-groceries",
  sinkId: "sink-food",
  lifestyleTagIds: ["tag-home"],
  eventTagIds: ["tag-trip"],
  splitGroupId: null,
  internalTransferGroupId: null,
  virtualSlices: [],
} satisfies Omit<LedgerTransaction, "id" | "amount">;

function makeTransaction(
  overrides: Partial<LedgerTransaction> & Pick<LedgerTransaction, "id" | "amount">,
): LedgerTransaction {
  return { ...baseTransaction, ...overrides };
}

describe("ledger aggregations", () => {
  const transactions = [
    makeTransaction({
      id: "tx-1",
      amount: -5000,
      categoryId: "cat-groceries",
      sinkId: "sink-food",
    }),
    makeTransaction({
      id: "tx-2",
      amount: 120000,
      categoryId: "cat-income",
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
    }),
    makeTransaction({
      id: "tx-3",
      amount: -2500,
      categoryId: "cat-groceries",
      sinkId: "sink-food",
      date: "2026-04-02",
    }),
    makeTransaction({
      id: "tx-transfer",
      amount: -10000,
      internalTransferGroupId: "transfer-1",
      categoryId: null,
      sinkId: null,
    }),
    makeTransaction({
      id: "tx-sliced",
      amount: 80000,
      categoryId: null,
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
      virtualSlices: [
        {
          id: "slice-1",
          amount: 50000,
          categoryId: "cat-income",
          sinkId: "sink-savings",
          lifestyleTagIds: ["tag-work"],
          eventTagIds: [],
        },
        {
          id: "slice-2",
          amount: 30000,
          categoryId: "cat-income",
          sinkId: null,
          lifestyleTagIds: [],
          eventTagIds: [],
        },
      ],
    }),
  ];

  it("aggregates spending by category using absolute expense amounts", () => {
    expect(aggregateLedgerByCategory(transactions)).toEqual([
      { id: "cat-groceries", amount: 7500 },
    ]);
  });

  it("aggregates spending by sink", () => {
    expect(aggregateLedgerBySink(transactions)).toEqual([
      { id: "sink-food", amount: 7500 },
    ]);
  });

  it("aggregates spending by tag across lifestyle and event tags", () => {
    expect(aggregateLedgerByTag(transactions)).toEqual([
      { id: "tag-home", amount: 7500 },
      { id: "tag-trip", amount: 7500 },
    ]);
  });

  it("aggregates income and expenses while excluding internal transfers", () => {
    expect(aggregateIncomeAndExpenses(transactions)).toEqual({
      income: 200000,
      expenses: 7500,
    });
  });

  it("uses virtual slice assignments instead of parent row amounts", () => {
    expect(aggregateLedgerBySink(transactions)).not.toContainEqual({
      id: "sink-savings",
      amount: expect.any(Number),
    });

    expect(
      aggregateLedgerByCategory([
        makeTransaction({
          id: "tx-sliced-expense",
          amount: -9000,
          categoryId: "cat-groceries",
          sinkId: "sink-food",
          virtualSlices: [
            {
              id: "slice-a",
              amount: -4000,
              categoryId: "cat-groceries",
              sinkId: "sink-food",
              lifestyleTagIds: [],
              eventTagIds: [],
            },
            {
              id: "slice-b",
              amount: -5000,
              categoryId: "cat-transport",
              sinkId: "sink-car",
              lifestyleTagIds: [],
              eventTagIds: [],
            },
          ],
        }),
      ]),
    ).toEqual([
      { id: "cat-transport", amount: 5000 },
      { id: "cat-groceries", amount: 4000 },
    ]);
  });

  it("respects optional date filters", () => {
    expect(
      aggregateLedgerByCategory(transactions, { from: "2026-04-01", to: "2026-04-30" }),
    ).toEqual([{ id: "cat-groceries", amount: 2500 }]);

    expect(
      aggregateIncomeAndExpenses(transactions, { from: "2026-04-01" }),
    ).toEqual({
      income: 0,
      expenses: 2500,
    });
  });

  it("buckets ledger lines by month", () => {
    expect(aggregateLedgerByMonth(transactions)).toEqual([
      { id: "2026-03", amount: 195000 },
      { id: "2026-04", amount: -2500 },
    ]);
  });

  it("aggregates income and expenses by month", () => {
    expect(aggregateMonthlyTrend(transactions)).toEqual([
      { id: "2026-03", income: 200000, expenses: 5000 },
      { id: "2026-04", income: 0, expenses: 2500 },
    ]);
  });
});
