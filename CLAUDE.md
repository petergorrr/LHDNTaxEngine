# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LHDN Tax Engine is a Malaysian personal income tax calculator web application. It helps taxpayers calculate income tax, determine tax brackets, and optimize tax reliefs for YA 2025 and YA 2026.

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start development server (http://localhost:5173)
npm run build   # Build for production (outputs to dist/)
npm run preview # Preview production build locally
```

## Architecture

### Single-File Application Structure

The entire application lives in `src/App.jsx`. This is intentional for simplicity - no component splitting or routing needed.

**Key sections within App.jsx:**

1. **Year Configuration** (lines 12-13)
   - `TAX_YEARS` - Array of supported years (add new years here)
   - `TAX_BRACKETS_BY_YEAR` - Year-specific tax brackets

2. **Tax Data Constants** (lines 16-250+)
   - `DICT` - Multi-language dictionary (zh/en/ms)
   - `RELIEF_DATABASE` - Year-specific tax relief definitions (YA 2025 vs 2026)

3. **State Management**
   - `useStickyState` - Custom hook wrapping `useState` + `localStorage` persistence
   - All user data persists across sessions automatically
   - Edit state for inline relief modification (`editingReliefId`, `editingAmount`)

4. **Core Calculation Logic** (`calculations` useMemo)
   - Gross income aggregation (supports monthly or annual input mode)
   - Relief capping at statutory maximums
   - Progressive tax bracket calculation (year-specific)
   - RM400 rebate for chargeable income ≤ RM35k
   - Final balance (refund vs payable)

5. **Auto-EPF Injection**
   - Automatically estimates 11% KWSP contribution based on income
   - Can be overridden by manual entry

### Adding New Tax Years

1. Add year to `TAX_YEARS` array
2. Add tax brackets to `TAX_BRACKETS_BY_YEAR`
3. Add relief definitions to `RELIEF_DATABASE[year]`
4. Year toggle will automatically show the new year

### State Keys (localStorage)

- `lhdn-lang` - UI language (en/zh/ms)
- `lhdn-year` - Assessment year (2025/2026)
- `lhdn-income-mode` - Input mode (monthly/annual)
- `lhdn-employments` - Array of income sources (EA Forms)
- `lhdn-reliefs` - User-declared tax reliefs

### Tax Logic Notes

- Individual relief (RM9,000) is auto-applied, not user-editable
- Relief amounts are capped at statutory maximums per category
- Marginal tax rate is used to calculate "tax saved" display for each relief
- Threshold check: Net income (after KWSP) < RM37,333 = not required to file
- Relief items can be edited inline by clicking on the amount

## Tech Stack

- React 18 + Vite
- Tailwind CSS (via PostCSS)
- Lucide React icons
- Vercel Analytics

## Important Conventions

- All monetary values stored as numbers (no currency formatting in state)
- Multi-language strings use `t.keyName` pattern from `DICT[lang]`
- Year-specific data uses `*_BY_YEAR[year]` pattern
- Always reference current year's data via `RELIEF_DATABASE[year]`
- All number inputs have `aria-label` for accessibility
- Final result panel has `aria-live="polite"` for screen reader updates