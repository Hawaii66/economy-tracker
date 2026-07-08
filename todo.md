# TODO

Scope decisions from IDEA.md review (2026-07-08):

- **Dropped:** liquid vs non-liquid accounts (all accounts count toward the guard-rail)
- **Dropped:** per-account CSV parser configuration UI (parsing stays code-driven)
- **Dropped:** workspace-level genesis epoch (per-account genesis date + opening balance is enough)
- **Dropped:** Swish / reactive split / net-expense / collaborative reimbursement linking

Implementation audit (2026-07-08): core financial model, import pipeline, theme, Overview/Sinks charts, Option A auto-funding, sink detail, and ledger filter infra are shipped. Remaining work is mostly exploration UX — entity drill-down, chart→ledger navigation, and ledger filter controls.

---

## 1. Auto-funding sinks

**Status:** Option A done — optional enhancements remain

**Problem:** Sinks show monthly pace and catch-up suggestions; batch funding is available but not hands-off scheduled.

**Goal:** Optionally auto-allocate virtual funds to sinks on a schedule (e.g. monthly), respecting the guard-rail.

### Shipped (Option A)

- `sinkFundingStatus` / `planDueSinkFunding` in `packages/budget-core/src/budget/sinks.ts`
- "Fund due sinks" button + confirmation modal on Sinks page (`FundDueSinksModal.tsx`)
- Banner when sinks need funding (`SinksManager.tsx`)
- Guard-rail validation via reducer on `SINK_FUNDED`; partial headroom funds by `missedMonths` desc
- Tests: `bulk-funding.test.ts`, `funding-schedule.test.ts`

### Still open (optional)

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

**Optional UI additions:**

- Overview banner: "N sinks need funding — [Fund all]" (Sinks page banner exists; Overview does not)
- Per-sink toggle: "Include in auto-fund" (needs a new field on `Sink` or budget-level settings)

---

## 2. Budget charts and visual summaries

**Status:** Charts done — chart→ledger drill-down remains

**Problem:** Charts display breakdowns but segments are not clickable; users cannot jump from a chart slice into filtered ledger rows.

**Goal:** Complete the exploration loop: Overview (and Sinks) charts link into filtered ledger or entity detail views.

### Chart library

- **Done:** Recharts in `BudgetOverviewCharts.tsx`, `BudgetSinksCharts.tsx`, `chart-panels.tsx`
- Reuse existing `formatMoney` and theme colors; no new palette.

### Chart status

| Chart | Data source | Where | Status |
|---|---|---|---|
| Account cash breakdown | `state.accounts[].balance` | Overview | Done |
| Virtual sink allocation | `state.sinks[].balance` | Overview, Sinks | Done |
| Guard-rail headroom | `guardRailFromState` | Overview | Done |
| Sink progress | per-sink `balance` vs target/cap/bill | Sinks page | Done (`SinkProgressChart`) |
| Spending by category | ledger by `categoryId` (+ slices) | Overview | Done |
| Spending by sink | ledger by `sinkId` | Overview, Sinks | Done |
| Spending by tag | lifestyle + event tag ids | Overview | Done |
| Income vs expenses | positive vs negative (excl. internal transfers) | Overview | Done |
| Monthly trend | ledger bucketed by month | Overview | Done (`MonthlyTrendChart`) |
| Chart → ledger drill-down | click segment → `?categoryId=` etc. | Overview, Sinks | **Not started** |

### Aggregation layer

**Done** in `packages/budget-core/src/budget/aggregations.ts` with unit tests in `aggregations.test.ts`:

```text
aggregateLedgerByCategory(...)
aggregateLedgerBySink(...)
aggregateLedgerByTag(...)
aggregateLedgerByAccount(...)
aggregateMonthlyTrend(...)
aggregateIncomeAndExpenses(...)
```

Rules implemented: virtual slices included, internal transfers excluded, optional `{ from, to }` date range.

### Remaining UI work

1. **Overview + Sinks charts** — click slice/bar → navigate to filtered ledger (`?categoryId=`, `?sinkId=`, `?tagId=`, `?accountId=`) or entity detail page.
2. **Empty states** — already present on chart panels; verify copy is consistent.

---

## 3. Entity detail views and ledger filtering

**Status:** Partially done — sink detail + filter infra shipped; account/category/tag detail and filter UI remain

**Problem:** Accounts, categories, and tags are managed as lists with no activity view. Ledger filters work via URL but there is no in-page filter picker.

**Goal:** Drill-down pages for each account, category, tag, and sink, plus shared filters so users can explore the budget.

### Shipped

- `filterLedgerTransactions` in `apps/web/src/lib/ledger-filters.ts`
- URL search params on Ledger route: `accountId`, `categoryId`, `sinkId`, `tagId`, `from`, `to`
- Filter applied in `ledger.tsx`; "Clear filters" when params active
- **Sink detail** at `/dashboard/budgets/$budgetId/sinks/$sinkId` (`SinkDetailView.tsx`):
  - Type, pace, target/cap/bill metadata
  - Balance vs goal progress, monthly spending chart, activity timeline
  - Transactions categorized to sink; fund/withdraw shortcuts
  - Link to filtered ledger (`?sinkId=`)
- Sink cards on Sinks page link to detail view

### Account detail — not started

**Route:** `/dashboard/budgets/$budgetId/accounts/$accountId`

Show:

- Name, icon, color, description, genesis date, current balance
- Chart: share of total cash across accounts
- Stats: total in / total out (excluding internal transfers to other own accounts)
- Filtered transaction list for this account
- Link to Import pre-scoped to this account

### Category detail — not started

**Route:** `/dashboard/budgets/$budgetId/tags/categories/$categoryId`

Show:

- Name, color
- Total spent (and count of transactions)
- Small bar chart or top merchants by description (optional v2)
- Filtered ledger list
- Link: "View all in Ledger" with `?categoryId=`

### Tag detail (lifestyle + event) — not started

Same pattern as category:

- Distinguish permanent vs temporary (event) in the header
- Show archived badge for event tags
- Stats + filtered ledger
- Event tags: note that archived tags still appear in historical data but not in suggestion lists (already true in import UI)

### Navigation wiring — partial

- **Done:** Sink cards → sink detail; sink detail → filtered ledger
- **Not done:** Account cards, category rows, tag rows → detail views
- **Not done:** Overview chart segments → detail page or filtered ledger
- **Not done:** Breadcrumb: `Budget name / Accounts / Checking`

### Ledger filter UI — not started

Add in-page pickers on Ledger route (account, category, sink, tag, date range) that update URL search params. Filters currently work only when navigating with params (e.g. from sink detail).

### Categories & Tags page improvements — not started

- Add "View activity" action per row
- Show transaction count and total amount next to each category/tag (computed client-side from ledger)

### Performance

- All aggregation is client-side from cached budget state (fine until ledger is very large).
- If slow later: add optional Convex query that returns pre-aggregated summaries.

---

## 4. Settings & workspace admin

**Status:** Not started

**Problem:** Settings page is a placeholder. Member management and branch genealogy exist in Convex but have no web UI.

**Goal:** Workspace configuration UI for shared budgets.

- Member invite/roles (OWNER / EDITOR / VIEWER) — backend in `apps/convex/convex/budgets.ts`
- Budget rename, branch info display
- Remove stale references to workspace genesis epoch onboarding from placeholder copy

---

## 5. Legacy schema cleanup (low priority)

**Status:** Not started

`genesisEpoch` and `parserTemplates` remain in `packages/budget-core` state/events but have no UI (scope dropped). Consider removing or formally deprecating in a future schema version.

---

## IDEA.md

Updated 2026-07-08: scope decisions, implementation status section added after codebase audit.
