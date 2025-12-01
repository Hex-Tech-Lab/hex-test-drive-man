# 🚗 Hex Test Drive - Egyptian Automotive Marketplace

A production-grade, bilingual (EN/AR) test drive booking platform for the Egyptian market, featuring real-time data, advanced filtering, and comprehensive vehicle specifications.

## 🌟 Current Status (v1.2 - Dec 2025)

### ✅ Live Features
- **Real Database**: Supabase PostgreSQL with ~384 trims across 22+ brands
- **Dynamic Catalog**: Server-side rendering with Next.js 15 App Router
- **Advanced Search**: Fuzzy matching + consecutive character logic
- **Localization**: Full Arabic RTL support + English LTR
- **Price Segments**: 6 Egyptian market tiers (Entry <800k to Supercar >8M)
- **Brand Identity**: 93+ verified brand logos with official agent mappings

## 🛠 Tech Stack

### Core
- **Framework**: Next.js 15.1.3 (App Router)
- **Language**: TypeScript 5.7.2
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Material UI v6 (No Tailwind)
- **State**: Zustand 5.x (Primitive selectors)
- **Package Manager**: pnpm (Exclusive)

### Infrastructure
- **Auth**: Supabase Auth (Anon/Service Role)
- **Hosting**: Vercel
- **Search**: `fuzzysort` for typo-tolerant vehicle lookup
- **Dev Tools**: Turbopack (dev), GPG Commit Signing

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9.x
- Supabase Credentials (in .env.local)

### Installation

1. Install dependencies
pnpm install

2. Setup Environment
Copy .env.example to .env.local manually
Add NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Run Development Server (Turbopack)
pnpm dev

text

## 🔧 Development Workflows

### Commit Signing (Mandatory)
All commits must be GPG signed.
`git commit -S -m "feat: your message"`

## 📝 Documentation Index
- Phase 1 Extraction Summary: `docs/reports/PHASE1A_FINAL_SUMMARY.md`
- Database Handover: `docs/reports/COMPREHENSIVE_TECHNICAL_HANDOVER.md`
- TRAE Automation Plan: `docs/reports/TRAE_PLAN.md`

---
**© 2025 Hex Tech Lab**
