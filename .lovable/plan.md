
# Smart Garment Factory Management System (GarmentIQ)

## Overview
A comprehensive factory management dashboard for apparel manufacturing with production tracking, operator analytics, digital Andon alerts, and simulated AI predictions. Built frontend-first with realistic mock data for a factory with 100+ sewing lines.

## Layout & Navigation
- **Sidebar navigation** with collapsible menu: Dashboard, Production Orders, Lines, Operators, Alerts, Reports
- **Top header** with factory selector dropdown (multi-factory support), notifications bell, and user avatar
- **Dark/light mode** toggle
- Color scheme: Industrial blue/slate with green/yellow/red status indicators

---

## Module 1: Factory Dashboard (Home)
**Top KPI Cards:**
- Total Output, Factory Efficiency %, Active Lines, Total Downtime, Pending Alerts

**Main Sections:**
- **Line Performance Table** — Line name, Style, Target, Actual Output, Efficiency %, Status indicator (🟢🟡🔴)
- **Hourly Production Chart** (Recharts area chart) — Predicted vs Actual output per hour
- **Downtime Pareto Chart** (bar chart) — Top 10 downtime reasons ranked
- **Bottleneck Detection Panel** — AI-highlighted slow operations with recommendations
- **Live Andon Status Strip** — Color-coded status across all active lines

## Module 2: Production Orders
- **Order List** with filters (Buyer, Style, Status)
- **Order Detail View**: Buyer, Style, PO#, Quantity, SMV, Planned dates
- **Auto-calculated fields**: Daily target, Hourly target, Estimated completion
- **Operation Bulletin** table within each order (Operation, SMV, Machine type)
- **AI Prediction Card**: Simulated forecast showing predicted completion date vs planned

## Module 3: Operator Management
- **Operator Directory** with search/filter by line, skill level, operation
- **Skill Matrix View** — Grid showing operators × operations with efficiency % color-coded
- **Operator Detail**: Profile, trained operations, efficiency per operation, attendance trend
- **Productivity Analytics**: Output, efficiency trend chart, idle time, comparison to line average
- **AI Recommendations**: "Best operator for each workstation" suggestions based on skill data

## Module 4: Digital Andon & Smart Alerts
- **Alert Dashboard** — Active alerts with type icons (Production/Quality/Machine/Material)
- **Color-coded severity**: 🟢 Normal, 🟡 Warning (e.g., efficiency < 70%), 🔴 Critical (e.g., efficiency < 60%)
- **Alert Rules Configuration** — Set thresholds for auto-triggering
- **Smart Alert Examples**: "Line L12 will miss today's target by 320 pcs" (simulated prediction)
- **Alert History** with filters by type, line, date range

## Additional Screens
- **WIP Tracking**: Bundle flow visualization showing WIP count per operation with bottleneck highlighting
- **TV Display Mode**: Full-screen dashboard view auto-refreshing every 60 seconds, designed for large factory screens
- **Reports**: Daily/Hourly production, Efficiency, Downtime analysis — with mock export buttons for Excel/PDF

## Mock Data
- 3 factories, each with 2 floors, ~15 lines per floor
- ~5,000 operators with randomized skill matrices
- Sample production orders with realistic garment styles (denim, polo, jacket)
- Simulated hourly production data with variance patterns
- Pre-configured alert thresholds and sample active alerts

## AI Simulation Logic
- **Production prediction**: Rule-based formula using operator count × average efficiency × (1 - downtime ratio) × hours remaining
- **Bottleneck detection**: Flag operations where WIP > 2× average
- **Line balancing suggestions**: Compare actual cycle times to takt time, suggest reallocation
- **Completion forecasting**: Linear projection based on current run-rate vs remaining quantity
