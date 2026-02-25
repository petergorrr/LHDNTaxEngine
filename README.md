# LHDN Tax Engine

A modern, fast, and user-friendly web application designed to help Malaysian taxpayers calculate their personal income tax, determine their tax bracket, and optimize their tax reliefs for the Year of Assessment (YA) 2025 and 2026.

## Features

- **Multi-lingual Support**: Available in English, Bahasa Malaysia, and Chinese (中文).
- **Dual Year Support**: Toggle between tax rules and reliefs for YA 2025 and YA 2026.
- **Income & PCB Tracking**: Add multiple income sources (EA Forms), calculate total gross income, and track monthly PCB deductions.
- **Comprehensive Tax Reliefs**: Browse and apply all statutory tax reliefs categorized logically (Foundation, Lifestyle, Medical, Housing, Family).
- **Smart Automations**: Automatically calculates EPF (KWSP) based on entered income and caps maximum allowable relief amounts to prevent over-claiming.
- **Detailed Tax Breakdown**: View a step-by-step breakdown of your chargeable income, marginal tax rate, and tax brackets.
- **Settlement Prediction**: Instantly know how much tax you need to pay or how much refund you will receive from LHDN.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience on desktop and mobile.

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks with Custom LocalStorage Persistence

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/petergorrr/LHDNTaxEngine.git
   cd LHDNTaxEngine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local server URL provided by Vite (usually `http://localhost:5173`).

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The compiled assets will be available in the `dist` directory, ready to be deployed to any static hosting service.

## Usage Guide

1. **Select Language & Year**: Choose your preferred interface language and the tax assessment year you are filing for.
2. **Input Income**: Enter your monthly base salary, bonuses, and PCB already paid for the year. You can add multiple EA forms if you have multiple employers or income sources.
3. **Declare Reliefs**: Scroll through the tax reliefs section and accurately input the amounts you spent on eligible items (e.g., life insurance, lifestyle spending, medical expenses).
4. **Review Settlement**: The "Final Settlement" panel will update in real-time, showing your chargeable income, taxes assessed, rebates, and your final balance (Refund or Payable).

## Disclaimer

This tool is designed for estimation and planning purposes only. It is not affiliated with the Inland Revenue Board of Malaysia (LHDNM). Always refer to official LHDN guidelines or consult a certified tax professional for official tax filings.
