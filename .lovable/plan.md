## Goal
Surface a short, plain-language explanation of ERP (with MRP, BOM, MPS) as in-app help — accessible from planning pages and globally from the sidebar.

## Shared content
Create `src/components/help/ErpHelpContent.tsx` — a reusable component rendering the concise summary (4 short sections):

1. **What is ERP?** — Enterprise Resource Planning helps an organization use its resources (people, machines, materials, money) to the best possible effect. It evolved from MRP → MRPII → ERP.
2. **MRP (Material Requirements Planning)** — Computerized approach to planning material acquisition for production. Built around the BOM and MPS.
3. **BOM (Bill of Materials)** — Parent/child breakdown of an assembly into components and raw materials (e.g., stool → legs + seat → frame + cushion).
4. **MPS (Master Production Schedule)** — Spreadsheet projecting demand for each product over time; drives the BOMP to compute component requirements.

Small footer line: "In this app, planning modules (Cutting / Sewing / Finishing) apply these MRP concepts to denim production."

## Placement 1 — Info tooltip on Planning headers
Files: `src/pages/PlanningModules.tsx`, `src/pages/PlanningOverview.tsx`
- Add a small `Info` (lucide) icon button next to the page `<h1>`.
- Clicking opens a `Dialog` titled "About ERP & MRP" rendering `<ErpHelpContent />`.

## Placement 2 — Collapsible help panel on Planning Overview
File: `src/pages/PlanningOverview.tsx`
- Add a dismissible `Card` at the top ("What is ERP?" with chevron toggle, default collapsed) that expands to show `<ErpHelpContent />`.
- Persist collapsed state in `localStorage` under `help_erp_overview_open`.

## Placement 3 — Global Help entry in sidebar
File: `src/components/layout/AppSidebar.tsx`
- Add a new "Help" `SidebarMenuItem` near the bottom (above the user profile footer), with `HelpCircle` icon.
- Clicking opens a shared Dialog rendering `<ErpHelpContent />` (state managed locally in the sidebar).

## Technical notes
- Use existing shadcn `Dialog`, `Card`, `Collapsible`, `Button`, `Tooltip` primitives — no new dependencies.
- Content is pure frontend/presentation; no backend or data changes.
- Follow existing typography (Inter, muted text hierarchy) and teal primary accents.
- No changes to routes, business logic, or CRUD storage.

## Files touched
- `src/components/help/ErpHelpContent.tsx` (new)
- `src/pages/PlanningModules.tsx`
- `src/pages/PlanningOverview.tsx`
- `src/components/layout/AppSidebar.tsx`
