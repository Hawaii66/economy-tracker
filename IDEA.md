# idea.md

## 1. Executive Summary

### What is this App?
A highly customized, self-hosted web application for personal finance management designed to solve the rigidities, double-counting, and tracking errors of mainstream banking apps. The system is designed with a Swedish financial context in mind, optimizing for multi-account structures, Swish-based social split transactions, and automated bank CSV parsing.

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

**Implementation:** `apps/web/src/styles.css` defines CSS variables; `apps/web/src/lib/theme.ts` exports the same palette for programmatic use.

---

## 3. Core Features

### 1. Unified Sinks Budgeting ("Everything is a Sink")
Instead of separating "monthly budgets" from "savings goals", all expense projections are structured as **Sinks**. A sink is a virtual envelope. The app supports three distinct Sink behaviors:
*   **Target Date Sinks:** Dynamically calculates saving pace leading up to a specific date. For example, a target date sink requiring 2,000 SEK in 5 months will auto-allocate 400 SEK per month.
*   **Recurring Bill Sinks:** Predictably amortizes expensive quarterly/yearly bills (e.g., dividing annual Netflix bills into steady monthly portions of 10 SEK).
*   **Capped Reserve Sinks:** Continually funds unexpected categories (e.g., Car Repairs) with a set monthly contribution until it reaches a safety ceiling (Cap), at which point it stops demanding your money.

### 2. Sandbox Ledger & Automated Import Engine
*   Dual-table ledger separating raw import records from user-adjustable ledger transactions.
*   Parser mapping dictionary unique to each bank account, eliminating hardcoding and supporting dynamic character encoding, diverse delimiters, and regional numbering formats.
*   Flexible case-insensitive substring keyword matching rules to auto-categorize, tag, and direct transactions to the right sinks instantly upon importing.

### 3. Reactive "Select & Connect" Split System
*   **Reactive Splitting:** No virtual mock-up transactions or pending lists. The system waits until transactions are imported physically, allowing you to multi-select and link multiple incoming Swish reimbursements to an original outflow.
*   **Collaborative Splits:** In a shared budget, User A can tag a physical transaction as a split, allowing partner User B to link their incoming physical Swish settlement directly to that transaction.
*   **Net-Expense Calculation:** Linked transfers directly digest parent expense values, indicating the true economic footprint in your charts.
*   **Virtual Slicing:** Break complex aggregate income payments into virtual slices that can be linked to separate groupings.

### 4. Hybrid Transaction Taxonomy
*   **Category (1 per Transaction):** Broad, mutually exclusive structural designations (such as Food, Rent, Transportation).
*   **Lifestyle Tags (Constant):** Permanent behavioral search contexts (like `#groceries`, `#takeout`, `#subscription`).
*   **Event Tags (Temporary):** Project-bound tags (like `#gothenburg-trip`, `#christmas-2026`) that can be archived so they no longer clutter search suggestions, while safely retaining their historical data.

---

## 4. Real-World Problems and Solutions

### Problem A: Bank CSV Formats and Locales
**Problem:** Swedish banks utilize semi-colons `;` instead of commas, format numbers as `"1 250,50"` instead of decimal system floats, and export in `ISO-8859-1` character tables.
**Solution:** A customizable CSV template linked to every account in your database. An isolated parser sanitizes and converts character encodings to UTF-8 and maps currency fields to strict standard JS floats globally prior to database injection.

### Problem B: The "Wrong-Feeling" Car Repair
**Problem:** Sparing up for a car repair in a Balancing Account, transferring money to a Maestro Card physically, and paying the mechanic on the card breaks target structures.
**Solution:** Do not lock Sinks into specific account tables. Sinks remain virtual and independent. The physical transfer between accounts is processed as a standard internal transfer. The Mekonomen expense on your Maestro Card is categorized online directly to the virtual Car Repair Sink, and your balance calculations synchronize instantly.

### Problem C: Sinks depleting checking safety
**Problem:** Accidental over-allocation of virtual Sinks beyond actual cash availability.
**Solution:** The system enforces a strict mathematical budget guard-rail on the dashboard:

$$ \text{Total Cash in Liquid Accounts} \ge \sum \text{Virtual Sinks Balance} $$

If you attempt to manually deposit or auto-fund Sinks above your physical liquid net-worth, the ecosystem triggers a validation error.

### Problem D: The historical import backlog
**Problem:** You cannot (and should not have to) download and import a decades-worth of CSV files just to see your current balances on day one.
**Solution:** The database establishes a **Genesis Epoch (Day Zero Onboarding)**. The workspace records physical cash balances and virtual sink values as they exist on that specific day. The system processes these as a baseline, and the import engine automatically ignores all CSV rows dated before this account opening balance date.