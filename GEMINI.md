# GEMINI.md - Project Context (v2 - 2025-12-01)

This document provides a comprehensive overview of the `hex-test-drive` project, updated with intelligence from Handover Document v3.0.

## 1. Project Overview & Objective

*   **Project:** `GetMyTestDrive.com` - A live, Vercel-deployed vehicle test drive booking platform for the Egyptian market.
*   **Architecture:** A Next.js 15 (App Router) frontend connected to a Supabase PostgreSQL backend.
*   **Immediate Objective:** Fix a critical bug where the production website displays 0 vehicles in its catalog.
*   **Root Cause:** The `vehicle_trims` table in the Supabase database is empty. Our primary goal is to populate it.

## 2. Technical Stack & Conventions

*   **Package Manager:** `pnpm` 9.x is mandatory. `npm` and `yarn` are forbidden.
*   **Core Stack:** Next.js 15.0.3, React 19, TypeScript 5.7.2, Node.js 20.x.
*   **UI & State:** Material-UI (MUI) 6.1.9 is the exclusive UI framework. Zustand 5.x is used for state management with SWR 2.2.5 for data fetching.
*   **Deployment:** Continuous deployment is handled by Vercel, deploying the `main` branch.
*   **Database:** Supabase PostgreSQL 15.x. Interaction is via direct REST API calls.

## 3. Current State (As of 2025-11-22)

### What Works
*   The application successfully builds and deploys to Vercel.
*   The Supabase database schema is complete with reference data (58 models, ~20 brands).
*   Public read access (RLS) is correctly configured on the database tables.

### What Is Broken
*   **The catalog shows 0 vehicles.** This is the primary issue.
*   The `vehicle_trims` table contains 0 rows, which is the direct cause of the empty catalog.

## 4. Critical Path Forward

The recovery plan is defined by the handover document.

*   **Priority 1: Populate `vehicle_trims` Table.**
    *   **Action:** Use `curl` with the Supabase service role key to insert test data.
    *   **Goal:** Add at least 3 sample vehicle trims to the database.
    *   **Verification:** Confirm the table count is no longer zero.

*   **Priority 2: Verify Catalog Rendering.**
    *   **Action:** Visit the deployed Vercel URL.
    *   **Goal:** Confirm the 3 test vehicles appear correctly on the website.

*   **Priority 3: Investigate Existing Feature Branches.**
    *   **Action:** Analyze the diffs of the three `fix/*` branches against `main`.
    *   **Goal:** Understand previous attempts to avoid re-introducing bugs.

## 5. Key Learnings & Anti-Patterns

*   A previous agent (`Factory.ai`) was abandoned due to creating infinite `setState` loops.
*   **Zustand Anti-Pattern:** Do not use object selectors like `useStore(s => ({ brands: s.brands }))`.
*   **Zustand Best Practice:** Use primitive selectors like `useStore(s => s.brands)` to avoid re-renders.
*   Vercel environment variables must be scoped to "All Environments" to avoid build failures in preview deployments.

This document will be updated as the project state evolves.