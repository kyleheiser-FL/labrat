# LabRat Premium Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing LabRat member shop feel more premium, trustworthy, and operationally clear without changing its core data model, order mechanics, or member tier rules.

**Architecture:** Keep the current React/Vite + Express app and Firebase-backed shop flow. Add small view-model helpers for repeatable tier/status language, then wire those helpers into the existing shop screens.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Tailwind utility classes, lucide-react icons, Firebase.

## Task 1: Add Tested Shop View Models

- [ ] Create failing Vitest coverage for member tier and order status presentation helpers.
- [ ] Add `src/lib/shopViewModels.ts` with tier and order status view-model functions.
- [ ] Re-run the targeted test and confirm it passes.

## Task 2: Upgrade Catalog Entry And Product Discovery

- [ ] Replace the tier banner stack in `ShopCatalogView.tsx` with a reusable premium member header.
- [ ] Add concise trust metrics and a curated product rail using existing catalog data.
- [ ] Improve search/category empty states while preserving current filters and stock restrictions.

## Task 3: Upgrade Product Drawer Confidence

- [ ] Add a confidence strip for COA/source/shipping expectations.
- [ ] Make option cards easier to scan across vial, kit, China, and admin modes.
- [ ] Keep quantity and add-to-cart behavior unchanged.

## Task 4: Upgrade Cart, Checkout, Orders, And Admin Status

- [ ] Add checkout/order reassurance copy around request submission and payment next steps.
- [ ] Apply the order status helper to member orders.
- [ ] Apply the same status helper to admin order management where useful.

## Task 5: Verify And Ship

- [ ] Run targeted tests.
- [ ] Run TypeScript lint.
- [ ] Run production build.
- [ ] Start the app locally and do a smoke check.
- [ ] Commit only relevant LabRat files.
- [ ] Push the branch/mainline and confirm production deployment.
