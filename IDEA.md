# idea.md

## 1. Executive Summary

### What is this App?
A highly customized, self-hosted web application for personal finance management designed to solve the rigidities, double-counting, and tracking errors of mainstream banking apps. The system is designed with a Swedish financial context in mind, optimizing for multi-account structures and automated bank CSV parsing.

### Core Philosophy
*   **Decoupled Architecture:** Keep virtual budgeting completely separate from physical cash logistics. Sinks are virtual and live entirely in the app; Accounts represent physical realities.
*   **The absolute truth is immutable:** Raw bank statements are read-only. Your visual sandbox budget ledger lives on a layer on top, preserving historical integrity while allowing infinite flexibility.
*   **Multi-Tenant Workspace Paradigm:** All entities (Accounts, Sinks, Rules, Ledger Transactions) belong strictly to a `Budget` workspace container. Users can own, join, or switch between multiple budgets (e.g., "Personal Sandbox", "Shared Apartment", "Summer Cabin Project") with zero cross-budget data leakage.

---

## 2. Visual Design: The "Analog Darkroom" Palette

Shared with glimt-v2's darkroom base, with blue accents instead of orange. The interface is dark, rich, and tactile — warm darkroom tones instead of harsh pure whites and blacks.

```text
BACKGROUNDS:
█ #0E0D0C -> Primary Background (Pure, warm, dark-mode slate)
█ #1B1817 -> Secondary Background (Frames, folders, and cards)

HIGHLIGHT COLORS:
█ #5EAEFF -> Electric Blue (Active buttons and ready states)
█ #2E7AD4 -> Deep Azure (Secondary highlight accents and active lines)

TYPOGRAPHY COLORS:
█ #F2EFEA -> Cream White (Primary text)
█ #8C847E -> Film Gray (Secondary text, timestamps, metadata)
█ #0E1014 -> Deep Charcoal (Text on blue buttons)

BORDERS:
█ #262220 -> Surface border
```

**Typography:** DM Sans (UI) and Instrument Serif (display headings).

**Implementation:** `apps/web/src/styles.css` defines CSS variables; `apps/web/src/lib/theme.ts` exports the same palette for programmatic use. Chart colors use the same palette (`--chart-1` … `--chart-5`).

---

## 3. Core Features

### 1. Unified Sinks Budgeting ("Everything is a Sink")
Instead of separating "monthly budgets" from "savings goals", all expense projections are structured as **Sinks**. A sink is a virtual envelope. The app supports three distinct Sink behaviors:
*   **Target Date Sinks:** Dynamically calculates saving pace leading up to a specific date. For example, a target date sink requiring 2,000 SEK in 5 months suggests 400 SEK per month.
*   **Recurring Bill Sinks:** Predictably amortizes expensive quarterly/yearly bills (e.g., dividing an annual Netflix bill into steady monthly portions).
*   **Capped Reserve Sinks:** Continually funds unexpected categories (e.g., Car Repairs) with a set monthly contribution until it reaches a safety ceiling (Cap), at which point it stops demanding your money.

**Funding:** Users manually fund or withdraw virtual sink balances. The app suggests catch-up amounts and offers an optional **"Fund due sinks"** action that allocates suggested monthly amounts in one step, always respecting the guard-rail.

**Spending:** When a ledger expense is categorized to a sink, the sink balance decreases by the expense amount. Deleting or re-assigning a transaction reverses the adjustment. Physical account balances are unaffected by virtual funding — only real imported transactions move cash.

**Requirement:** Every non–internal-transfer ledger transaction must be connected to a sink before it is saved.

### 2. Sandbox Ledger & Automated Import Engine
*   Dual-table ledger separating raw import records from user-adjustable ledger transactions.
*   Code-driven CSV parsing for Swedish bank exports: semi-colon delimiters, `"1 250,50"` number formats, ISO-8859-1 encoding fallback, and common column-name heuristics. No user-facing parser configuration is required.
*   Flexible case-insensitive substring keyword matching rules to auto-categorize, tag, and direct transactions to the right sinks upon importing.
*   **Internal transfers:** Pair opposite-amount transactions across accounts so they do not distort income/expense totals.
*   **Virtual slicing:** Break a single imported payment (especially aggregate income) into virtual slices, each with its own category, sink, and tags.

### 3. Hybrid Transaction Taxonomy
*   **Category (1 per Transaction):** Broad, mutually exclusive structural designations (such as Food, Rent, Transportation).
*   **Lifestyle Tags (Constant):** Permanent behavioral search contexts (like `#groceries`, `#takeout`, `#subscription`).
*   **Event Tags (Temporary):** Project-bound tags (like `#gothenburg-trip`, `#christmas-2026`) that can be archived so they no longer clutter search suggestions, while safely retaining their historical data.

### 4. Budget Insights — Charts & Drill-Down
The budget should be understandable at a glance and explorable in detail.

**Overview charts:**
*   Account cash breakdown across all physical accounts
*   Virtual sink allocation vs guard-rail headroom
*   Sink progress toward target, cap, or amortized bill
*   Spending by category, sink, and tag
*   Income vs expenses (internal transfers excluded)
*   Optional monthly spending trend

**Entity detail views:** Each account, category, lifestyle tag, event tag, and sink has a detail view showing metadata, summary stats, a relevant chart, and the filtered transaction list for that entity.

**Ledger filtering:** The ledger supports URL-driven filters (`accountId`, `categoryId`, `sinkId`, `tagId`, date range) so charts and list rows link directly into the underlying transactions.

---

## 4. Real-World Problems and Solutions

### Problem A: Bank CSV Formats and Locales
**Problem:** Swedish banks utilize semi-colons `;` instead of commas, format numbers as `"1 250,50"` instead of decimal floats, and export in `ISO-8859-1` character tables.
**Solution:** A built-in import parser detects delimiters, normalizes encodings to UTF-8, parses regional number formats into strict integer minor units (öre), and maps common Swedish column headers. Users upload CSV files per account; no template setup is needed.

### Problem B: The "Wrong-Feeling" Car Repair
**Problem:** Sparing up for a car repair in a balancing account, transferring money to a Maestro card physically, and paying the mechanic on the card breaks target structures in rigid budgeting apps.
**Solution:** Do not lock Sinks into specific account tables. Sinks remain virtual and independent. The physical transfer between accounts is recorded as an internal transfer. The Mekonomen expense on the Maestro card is categorized directly to the virtual Car Repair sink; account and sink balances synchronize instantly.

### Problem C: Sinks depleting available cash
**Problem:** Accidental over-allocation of virtual Sinks beyond actual cash availability.
**Solution:** The system enforces a strict mathematical budget guard-rail on the dashboard:

$$ \text{Total Cash in Accounts} \ge \sum \text{Virtual Sinks Balance} $$

All physical accounts count toward total cash. If you attempt to manually fund or batch-fund sinks above available cash, the system triggers a validation error.

### Problem D: The historical import backlog
**Problem:** You cannot (and should not have to) download and import decades of CSV files just to see current balances on day one.
**Solution:** Each account is created with a **genesis date** and **opening balance** representing day zero for that bank account. The import engine automatically ignores all CSV rows dated before that account's genesis date. Sinks are funded separately to their starting virtual balances; no workspace-wide genesis onboarding step is required.

---

## 5. Implementation Status

Audit date: 2026-07-08. See `todo.md` for remaining work items.

### Shipped

| Area | Status |
|---|---|
| Multi-budget workspaces (Convex + UI list/create/switch) | Done |
| Event-sourced state, cached projections, reducer | Done |
| Accounts with per-account genesis date + opening balance | Done |
| Dual-table ledger (raw imports + ledger entries) | Done |
| Three sink types, pace/catch-up, fund/withdraw | Done |
| Guard-rail enforcement (UI + reducer) | Done |
| Mandatory sink on non-transfer transactions | Done |
| Sink balance sync on categorize / delete / reassign | Done |
| "Fund due sinks" batch action (Option A) | Done |
| Swedish CSV import (delimiter, locale, encoding, headers) | Done |
| Import rules, internal transfers, virtual slicing | Done |
| Categories, lifestyle tags, event tags (incl. archive) | Done |
| Analog Darkroom theme + Recharts chart palette | Done |
| Overview charts (accounts, sinks, guard-rail, category/sink/tag spend, income vs expenses, monthly trend) | Done |
| Sinks page charts (allocation, progress, spending) | Done |
| Ledger aggregators in `budget-core` + unit tests | Done |
| Sink detail view (`/sinks/$sinkId`) | Done |
| URL-driven ledger filters + `filterLedgerTransactions` | Done |

### Partial

| Area | Done | Remaining |
|---|---|---|
| Entity detail views | Sink detail | Account, category, tag detail pages |
| Ledger exploration | URL filters, clear-filters link | In-page filter pickers (account, category, sink, tag, dates) |
| Chart drill-down | — | Click chart segment → filtered ledger or entity detail |
| Auto-funding | Option A (manual batch on Sinks page) | Overview banner, per-sink toggle, scheduled cron (Option B) |
| Taxonomy lists | CRUD + archive | Transaction counts, "View activity" links |
| Workspace admin | Backend memberships | Settings UI (members, roles) |

### Out of scope (dropped)

- Liquid vs non-liquid account distinction
- Per-account CSV parser configuration UI
- Workspace-level genesis epoch onboarding
- Swish / reactive split / net-expense / collaborative reimbursement linking

### Legacy (no UI, cleanup optional)

- `genesisEpoch` and `parserTemplates` fields remain in `budget-core` state schema from earlier design; not exposed in the app.
