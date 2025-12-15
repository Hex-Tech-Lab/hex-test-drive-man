# Technology Stack Decisions - Quick Reference

**Document:** TECHNOLOGY_STACK_DECISIONS-v1.0-20251207.md  
**Size:** 1,650 lines, 62KB  
**Coverage:** 12 major technology decisions across MVP 0-2.0

---

## FROZEN STACK (MVP 0 - No Changes)

| Layer | Technology | Version | Score | Status |
|-------|-----------|---------|-------|--------|
| Framework | Next.js | 15.1.3 | 9.2/10 | ✅ FROZEN |
| Runtime | React | 19.0.0 | 9.4/10 | ✅ FROZEN |
| Language | TypeScript | 5.7.2 | 9.3/10 | ✅ FROZEN |
| State Mgmt | Zustand | 5.0.2 | 8.2/10 | ⚠️ ISSUE (refactor MVP 0.5) |
| Data Fetch | SWR | 2.2.5 | 9.1/10 | ✅ FROZEN |
| Data Access | Repository | Custom | 9.2/10 | ✅ LOCKED |
| Database | Supabase PG | — | 9.3/10 | ✅ FROZEN |
| UI Framework | Material UI | 6.1.9 | — | ✅ FROZEN |
| Package Mgr | pnpm | 9.15.0 | — | ✅ FROZEN |

---

## RESERVED FOR MVP 0.5+

| Layer | Technology | Version | When | Why |
|-------|-----------|---------|------|-----|
| ORM | Drizzle | 0.30.10 | MVP 0.5 | SMS service (separate DB) |
| Data Queries | TanStack Query | 5.28.4 | MVP 0.5 | SMS mutations (not catalog reads) |
| Queue | Upstash QStash | Latest | MVP 0.5 | Serverless SMS delivery |
| Logging | Pino | 8.19.0 | MVP 1.0 | High-throughput structured logs |
| Errors | Sentry | Latest | MVP 1.5 | Error aggregation + source maps |

---

## KEY DECISION MATRICES

### SWR vs TanStack Query
```
SWR:
├─ Catalog reads (50-150 items): ✅ Perfect
├─ Bundle: 4.8KB ✅
├─ Caching: ISR ✅
└─ Mutations: Manual ⚠️

TanStack Query:
├─ Catalog reads: Overkill (12.9KB bundle)
├─ SMS mutations: ✅ Perfect
├─ Background revalidation: ✅ Built-in
└─ Reserved for SMS admin dashboard (MVP 0.5+)
```

### Repository Pattern vs ORM (MVP 0)
```
Repository:
├─ Complexity: Simple ✅
├─ Type safety: Strong ✅
├─ Bundle: 0KB ✅
├─ Migration: Easy to ORM later ✅
└─ Use case: Read-only catalog ✅

Drizzle ORM:
├─ Bundle: 100KB (too large for MVP 0)
├─ Setup: More complex
├─ Use case: SMS service (separate DB, MVP 0.5)
└─ Plan: Add for SMS while keeping catalog on REST
```

### Zustand vs Jotai vs Redux
```
Zustand (Selected):
├─ Bundle: 2.2KB ✅
├─ DX: Excellent ✅
├─ React 19: Issues with object selectors ⚠️
└─ Mitigation: Flatten selectors MVP 0.5

Jotai (Fallback):
├─ Bundle: 3.1KB (slightly heavier)
├─ React 19: Better support ✅
├─ Atom-based: Different mental model
└─ Timeline: Migrate if Zustand issues persist (3-4 days)

Redux (Rejected):
└─ Bundle: 18KB (8x larger than Zustand)
```

---

## INFLECTION POINTS & RE-EVALUATION TIMELINE

### MVP 0.5 (Jan 5, 2026)
- 🔄 **Zustand refactor** - Flatten selectors, fix React 19 infinite loops
- ✅ **Add Drizzle** - SMS service database
- ✅ **Add TanStack Query** - SMS admin mutations
- ⚠️ **Monitor:** Bundle size at 150 vehicles

### MVP 1.0 (Jan 31, 2026)
- ✅ **Add Pino** - Logging framework
- ✅ **Add Sentry** - Basic error tracking
- ✅ **Add PayMob** - Payment integration
- ⚠️ **Evaluate:** QStash costs vs BullMQ

### MVP 1.5 (Feb 28, 2026)
- 🔄 **Final decision:** BullMQ vs QStash (cost vs latency trade-off)
- ✅ **Add:** Python FastAPI scheduler
- ✅ **Add:** Session replay monitoring

### MVP 2.0 (Mar 31, 2026)
- 📊 **Measure:** Cost, performance, stability
- 🔄 **Evaluate:** Any tech migration needs

---

## CONTINGENCY PATHS

### If Zustand Crashes at Scale
1. **Primary:** Refactor store to flat selectors (1-2 days)
2. **Secondary:** Migrate to Jotai (3-4 days, same API mostly)
3. **Fallback:** Context API (acceptable up to 150 vehicles)

### If PayMob Unavailable
1. **Primary:** Cash-on-Delivery option
2. **Secondary:** Integrate Telr (Egypt payment)
3. **Fallback:** Stripe (if available in Egypt)

### If SMS Provider Rate Hikes
1. **Primary:** Switch to different provider (30 min with plugin arch)
2. **Plan:** Contract multi-year rates with backup providers

### If Supabase Unavailable (Unlikely)
1. **Primary:** Migrate to Neon (same PostgreSQL)
2. **Timeline:** 1-2 weeks (dump + restore)
3. **Cost:** No increase

---

## BUNDLE SIZE TRACKING

### Current (MVP 0)
```
Core Dependencies:
├─ Next.js: 45KB
├─ React: ~30KB
├─ Zustand: 2.2KB
├─ SWR: 4.8KB
├─ Material UI: ~50KB
├─ TypeScript types: ~10KB
└─ Total: ~145KB

Egypt Impact:
├─ 4G speed: 2-3MB/s (145KB ≈ 50-70ms)
├─ Acceptable: <500ms first contentful paint
└─ ✅ Status: Good
```

### MVP 0.5 Addition
```
New:
├─ TanStack Query: 12.9KB
├─ Drizzle: 100KB (SMS service only)
└─ Total added: 13KB (catalog bundle)

Total after MVP 0.5:
├─ Catalog: 158KB ✅ Acceptable
├─ SMS service: 250KB (separate bundle)
└─ ✅ Status: Good
```

---

## DECISION CRITERIA WEIGHTS (Across All Decisions)

| Criterion | Avg Weight | Why |
|-----------|-----------|-----|
| **Egypt constraints** | 30% | Slow networks, payment providers, data sovereignty |
| **Performance** | 25% | Real UX impact on slow devices |
| **Bundle size** | 20% | Matters for Egypt 4G speeds |
| **Team capacity** | 15% | Small team, no DevOps |
| **Cost** | 10% | Startup budget |

---

## HOW TO USE THIS DOCUMENT

### For Implementing Features
1. Open TECHNOLOGY_STACK_DECISIONS-v1.0-20251207.md
2. Find relevant section (e.g., "5. DATA FETCHING: SWR 2.2.5")
3. Review decision rationale + implementation examples
4. Check inflection points (when to reconsider)

### For Debugging Tech Issues
1. Section lists known issues per technology
2. Escalation path clear: primary → secondary → fallback
3. Migration timeline provided

### For Evaluating New Tech
1. Compare scoring methodology (how SWR won)
2. Apply same criteria weights
3. Document decision in this file

---

## KEY PRINCIPLES

✅ **Stability over Innovation** - No beta/RC/alpha versions  
✅ **Egypt-Specific** - Bandwidth, payment, vendor constraints  
✅ **Future-Proof** - All decisions have fallback paths  
✅ **Deferred Complexity** - Booking complexity pushed to MVP 1.0  
✅ **Single Source of Truth** - This document + implementation code

---

**Read Full Document:** `/mnt/user-data/outputs/TECHNOLOGY_STACK_DECISIONS-v1.0-20251207.md`

