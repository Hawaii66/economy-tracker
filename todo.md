# TODO

Scope decisions from IDEA.md review (2026-07-08):

- **Dropped:** liquid vs non-liquid accounts (all accounts count toward the guard-rail)
- **Dropped:** per-account CSV parser configuration UI (parsing stays code-driven)
- **Dropped:** workspace-level genesis epoch (per-account genesis date + opening balance is enough)
- **Dropped:** Swish / reactive split / net-expense / collaborative reimbursement linking

---

## 1. Sync sink balances when expenses are categorized

**Status:** Planned

**Problem:** Assigning a ledger transaction to a sink updates the account balance but not the sink balance. Manual `SINK_FUNDED` / `SINK_WITHDRAWN` are the only ways sink balances change today.

**Goal:** When an expense is categorized to a sink, the sink balance decreases by the expense amount (and reverses on delete or re-assignment).

**Implementation sketch:**

1. **Reducer (`packages/budget-core/src/reducer.ts`)**
   - On `LEDGER_TRANSACTION_CREATED`: if `sinkId` is set and `amount < 0`, subtract `|amount|` from that sink's balance (or emit an internal `SINK_WITHDRAWN`-equivalent adjustment).
   - On `LEDGER_TRANSACTION_UPDATED`: diff old vs new `sinkId` and `amount`; restore the old sink, apply the new sink.
   - On `LEDGER_TRANSACTION_DELETED`: restore sink balance if the transaction had a `sinkId`.
   - On `INCOME_SLICED`: for each slice with a `sinkId`, apply the same rules per slice amount.
   - Skip sink adjustments for internal transfers (no `sinkId`, linked group).

2. **Guard-rail:** No change needed — guard-rail compares account cash vs sink totals; spending from a sink lowers the sink total, which is correct.

3. **Tests**
   - Ghost scenario: fund sink → categorize expense to sink → assert sink balance dropped.
   - Update sink assignment on an existing ledger entry.
   - Delete ledger entry restores sink balance.

4. **UI:** No new screens; existing import → ledger flow should reflect updated sink balances on the Sinks and Overview pages.

---

## 2. Auto-funding sinks

**Status:** Design needed, then implement

**Problem:** Sinks show monthly pace and catch-up suggestions, but funding is always manual.

**Goal:** Optionally auto-allocate virtual funds to sinks on a schedule (e.g. monthly), respecting the guard-rail.

### How to implement

**Option A — Client-triggered (simplest)**

1. On Sinks page load (or a "Fund due sinks" button), compute `sinkFundingStatus(sink, today)` for each sink.
2. For sinks where `needsFunding` is true, sum `suggestedAmount` across sinks.
3. If `sum <= maxFundableAmount(accounts, sinks)`, append one `SINK_FUNDED` event per sink (or a batch via `appendEvents`).
4. Show a confirmation modal listing sinks and amounts before submitting.

Pros: no cron, no Convex scheduler, reuses existing events.  
Cons: only runs when a user opens the app / clicks the button.

**Option B — Scheduled Convex job**

1. Add a Convex cron (or `scheduled function`) per budget, or one job that iterates active budgets.
2. Job reads cached state, computes due funding via `sinkFundingStatus`, emits `SINK_FUNDED` events if guard-rail allows.
3. Store last auto-fund run date on the budget (new field) or infer from `sink.lastFundedOn`.

Pros: hands-off monthly funding.  
Cons: needs scheduler infra, timezone/month-boundary policy, and idempotency (don't double-fund if cron and manual both run).

**Option C — Event on month boundary**

1. When any mutation runs, check if the calendar month rolled over since last visit.
2. If so, prompt "Fund N sinks for [month]?" and apply Option A logic.

Pros: no cron; feels automatic to the user.  
Cons: still requires someone to use the app.

**Recommended path:** Start with **Option A** (explicit "Fund due sinks" action + optional prompt on Sinks page when `needsFunding`). Add **Option B** later if truly hands-off funding is wanted.

**Shared rules (all options):**

- Use existing `assertGuardRailFundingAllowed` before each `SINK_FUNDED`.
- If headroom is insufficient, fund sinks in priority order (user-defined or by `missedMonths` desc) and stop when cash runs out — surface a clear message.
- Set `lastFundedOn` via existing reducer behavior on `SINK_FUNDED`.
- Add tests: multiple sinks due, partial headroom, zero headroom (no events emitted).

**Optional UI additions:**

- Per-sink toggle: "Include in auto-fund" (would need a new field on `Sink` or budget-level settings).
- Overview banner: "3 sinks need funding — [Fund all]".

---

## 3. Require sink on ledger transactions (consistency fix)

**Status:** Done

**Problem:** `LEDGER_TRANSACTION_CREATED` allows fully unassigned entries (`sinkId: null`, no category/tags), but `LEDGER_TRANSACTION_UPDATED` rejects anything without a sink. The web app never emits `LEDGER_TRANSACTION_UPDATED`, so users can save imports without a sink and have no in-ledger way to fix it except delete and re-import.

**Goal:** One clear rule: every non–internal-transfer ledger transaction must have a `sinkId` before it is persisted (or at least before it is considered "complete").

**Implementation sketch:**

1. **Choose policy (recommended):**
   - **Strict:** Require `sinkId` on `LEDGER_TRANSACTION_CREATED` unless the transaction is part of an internal transfer pair (both legs unassigned).
   - Virtual slices: each slice with a non-zero amount must have a `sinkId` (already enforced on `INCOME_SLICED`).

2. **Reducer:** Remove or narrow `exemptWhenFullyUnassigned` on create; keep exemption only for internal-transfer legs.

3. **Web app (`ImportedTransactionsTable` / save handlers):**
   - Disable "Save to ledger" until a sink is selected (single mode) or every split row has a sink.
   - Show validation message: "Connect to a sink before saving."

4. **Ledger edit (optional follow-up):**
   - Add edit flow using `LEDGER_TRANSACTION_UPDATED` so users can fix sink/category without delete + re-import.

5. **Tests:** Update/create tests in `packages/budget-core-test/tests/ledger/sink-required.test.ts` for create-time rejection; keep internal-transfer exemption.

---

## 4. Budget charts and visual summaries

**Status:** Not started

**Problem:** Overview shows counts and the guard-rail only. There is no visual breakdown of where money sits (accounts vs sinks) or where it went (categories, tags, sinks over time).

**Goal:** Charts on Overview (and optionally Sinks) so the budget is understandable at a glance, using the Analog Darkroom palette (`--chart-1` … `--chart-5` in `styles.css`).

**Depends on:** Item 1 (sink balances must reflect categorized spending for sink charts to be meaningful).

### Chart library

- Add a small chart dependency (e.g. Recharts) or build minimal SVG bar/donut components if bundle size matters.
- Reuse existing `formatMoney` and theme colors; no new palette.

### Suggested charts

| Chart | Data source | Where |
|---|---|---|
| Account cash breakdown | `state.accounts[].balance` | Overview |
| Virtual sink allocation | `state.sinks[].balance` (+ target/cap for context) | Overview, Sinks |
| Guard-rail headroom | `guardRailFromState` | Overview (stacked bar: cash vs allocated sinks vs free headroom) |
| Sink progress | per-sink `balance` vs `targetAmount` / `cap` / amortized bill | Sinks page |
| Spending by category | sum negative `ledgerTransactions` (+ virtual slice amounts) by `categoryId` | Overview |
| Spending by sink | same, grouped by `sinkId` | Overview, Sinks |
| Spending by tag | lifestyle + event tag ids on transactions/slices | Overview, tag detail |
| Income vs expenses | sum positive vs negative ledger amounts (exclude internal transfers) | Overview |
| Monthly trend | bucket ledger by `date` month | Overview (optional v2) |

### Aggregation layer

Add pure functions in `packages/budget-core` or `apps/web/src/lib/` (prefer core if reused in tests):

```text
aggregateLedgerByCategory(ledgerTransactions, options?)
aggregateLedgerBySink(...)
aggregateLedgerByTag(...)
aggregateLedgerByAccount(...)
aggregateLedgerByMonth(...)
```

Rules:

- Include `virtualSlices` when present (use slice amounts + assignments instead of parent row).
- Exclude internal-transfer legs (`internalTransferGroupId` set) from expense/income totals.
- Respect optional date range `{ from, to }` on all aggregators.

### UI

1. **Overview page** — row of summary charts + link to filtered ledger per segment (click slice → navigate with query params).
2. **Sinks page** — per-sink progress bars (partially exists) plus optional mini chart of spend vs funded over time once item 1 ships.
3. **Empty states** — “Import and categorize transactions to see spending breakdown.”

### Tests

- Unit tests for aggregators (slices, internal transfers excluded, date filter).
- No snapshot tests on chart DOM unless necessary.

---

## 5. Entity detail views and ledger filtering

**Status:** Not started

**Problem:** Accounts, categories, and tags are managed as lists but there is no place to see *what happened* under each one. The ledger is one flat table with no filters.

**Goal:** Drill-down pages (or panels) for each account, category, tag, and sink, plus shared filters so users can explore and understand the budget.

### Shared filter model

Introduce URL search params on the Ledger route (and reuse on detail pages):

```text
?accountId=
?categoryId=
?sinkId=
?tagId=        # matches lifestyle or event tag
?from=YYYY-MM-DD
?to=YYYY-MM-DD
```

Implement `filterLedgerTransactions(transactions, filters)` in `apps/web/src/lib/ledger-filters.ts` (or budget-core). Apply filters in `LedgerEntriesTable` and any detail view transaction list.

### Account detail

**Route:** `/dashboard/budgets/$budgetId/accounts/$accountId` (or expandable row on Accounts page)

Show:

- Name, icon, color, description, genesis date, current balance
- Chart: share of total cash across accounts
- Stats: total in / total out (excluding internal transfers to other own accounts)
- Filtered transaction list for this account
- Link to Import pre-scoped to this account

### Category detail

**Route:** `/dashboard/budgets/$budgetId/tags/categories/$categoryId` or query from Categories list

Show:

- Name, color
- Total spent (and count of transactions)
- Small bar chart or top merchants by description (optional v2)
- Filtered ledger list
- Link: “View all in Ledger” with `?categoryId=`

### Tag detail (lifestyle + event)

Same pattern as category:

- Distinguish permanent vs temporary (event) in the header
- Show archived badge for event tags
- Stats + filtered ledger
- Event tags: note that archived tags still appear in historical data but not in suggestion lists (already partially true in import UI)

### Sink detail

**Route:** `/dashboard/budgets/$budgetId/sinks/$sinkId`

Show:

- Sink type, pace, target/cap/bill metadata (reuse `SinkMetadata` from `SinksManager`)
- Balance vs goal progress
- Total funded (`SINK_FUNDED` history is not stored separately today — infer from balance + categorized spend after item 1, or show “spent this period” from ledger)
- Transactions categorized to this sink
- Fund / withdraw shortcuts (existing modals)

### Navigation wiring

- Make account cards, category rows, tag rows, and sink cards link to their detail view.
- From Overview charts (item 4), click segment → detail page or filtered ledger.
- Breadcrumb: `Budget name / Accounts / Checking`

### Categories & Tags page improvements

- Add “View activity” action per row.
- Show transaction count and total amount next to each category/tag (computed client-side from ledger).

### Performance

- All aggregation is client-side from cached budget state (fine until ledger is very large).
- If slow later: add optional Convex query that returns pre-aggregated summaries.

---

## IDEA.md

Updated 2026-07-08 to match scope decisions above (liquid accounts, parser UI, workspace genesis, and Swish splits removed; charts, drill-down, sink spending sync, and optional auto-fund added).
