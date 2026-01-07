# MVP ROADMAP - Living Product Development Timeline

**Version:** 1.0.0  
**Last Updated:** 2026-01-07 1118 AM EET | BB (Blackbox Pro)  
**Owner:** PPLX (Strategic Planning) + All Agents (Execution)  
**Purpose:** Single source of truth for MVP milestones, features, and sprint planning

---

## TABLE OF CONTENTS

1. MVP 1.0 - Core Mobile UX (Target: Week 2, Jan 2026)
2. MVP 1.5 - Double-Fold Flyout (Target: Week 3-4, Jan 2026)
3. MVP 2.0 - Visual Polish (Target: Week 5-6, Feb 2026)
4. MVP 2.5 - Discovery & Segmentation (Target: Week 7-8, Feb 2026)
5. MVP 3.0 - Analytics Infrastructure (Target: Week 9-10, Mar 2026)
6. MVP 3.5 - AI & Predictive (Target: Week 11-12, Mar 2026)
7. Backlog - Future Considerations

---

## 1. MVP 1.0 - Core Mobile UX (Target: Week 2, Jan 2026)

**Goal:** Fix critical mobile UX bugs blocking user adoption  
**Priority:** CRITICAL (production blockers)  
**Timeline:** 2026-01-07 to 2026-01-14 (7 days)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| BUG-005 | Counter stuck at 1 (won't decrement to 0) | Bug | CRITICAL | 2h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| BUG-006 | Retry button non-functional | Bug | HIGH | 2h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| BUG-007 | Filters expanded by default | Bug | HIGH | 1h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| BUG-008 | Drawer visibility on reload | Bug | MEDIUM | 1.5h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| BUG-009 | Slow navigation (0.5-1s delay) | Bug | HIGH | 3h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| BUG-010 | 24/7 support button (no service) | Bug | LOW | 0.5h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-001 | Collapse filters by default (mobile) | Feature | HIGH | 1h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-002 | Fix reservation counter logic | Feature | CRITICAL | 2h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-003 | Implement prefetch for instant navigation | Feature | HIGH | 4h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 17h  
**Sprint Capacity:** 2 agents × 8h/day × 7 days = 112h  
**Utilization:** 15% (leaves room for testing + polish)

**Success Criteria:**
- ✅ All 6 bugs resolved (BUG-005 to BUG-010)
- ✅ Navigation feels instant (<200ms perceived delay)
- ✅ Filters collapsed by default on mobile
- ✅ Counter accurately reflects reservation count (including 0)
- ✅ Error recovery works (retry button functional)

**Dependencies:**
- None (all self-contained mobile UX fixes)

**Risks:**
- Prefetch implementation may require Next.js 15 API changes (mitigation: use Link prefetch prop)
- Counter logic may be tied to complex state management (mitigation: isolate counter state)

---

## 2. MVP 1.5 - Double-Fold Flyout (Target: Week 3-4, Jan 2026)

**Goal:** Separate comparison from reservations with premium animated UX  
**Priority:** HIGH (user-requested feature, competitive differentiator)  
**Timeline:** 2026-01-15 to 2026-01-28 (14 days)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| FEAT-004 | Separate comparison flyout (independent from reservations) | Feature | HIGH | 8h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-005 | Double-fold animated flyout (2-panel slide + flip UX) | Feature | HIGH | 12h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-006 | Mobile comparison limit (2 cars) with red text warning | Feature | MEDIUM | 3h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-007 | Desktop comparison limit (5 cars) | Feature | MEDIUM | 2h | 🔴 OPEN | BB | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-008 | Drag-drop or mark-and-place for one-hand operation | Feature | HIGH | 10h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 35h  
**Sprint Capacity:** 2 agents × 8h/day × 14 days = 224h  
**Utilization:** 16% (leaves room for animation polish + testing)

**Success Criteria:**
- ✅ Two independent flyouts (reservations + comparison)
- ✅ Smooth 2-panel animation (slide + flip, <300ms total)
- ✅ Mobile: max 2 cars, red warning text when limit reached
- ✅ Desktop: max 5 cars
- ✅ One-hand operation (drag-drop OR mark-and-place)
- ✅ Premium feel (fluid motion, no jank)

**Dependencies:**
- MVP 1.0 complete (stable mobile UX foundation)
- MUI 6.4.3 animation APIs (no v7 upgrade)

**Risks:**
- Animation performance on low-end mobile devices (mitigation: use CSS transforms, not layout changes)
- Drag-drop may conflict with scroll gestures (mitigation: implement mark-and-place as fallback)

**User Quote:**
> "I want a double-fold flyout... one for reservations, one for comparison. Premium animated UX like luxury car configurators."

---

## 3. MVP 2.0 - Visual Polish (Target: Week 5-6, Feb 2026)

**Goal:** Replace pill buttons with animated icons, redesign catalog page  
**Priority:** MEDIUM (visual differentiation, premium positioning)  
**Timeline:** 2026-01-29 to 2026-02-11 (14 days)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| FEAT-009 | Replace pill buttons with animated icons (brands, price, body type) | Feature | MEDIUM | 8h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-010 | Catalog page redesign (icon-first approach) | Feature | MEDIUM | 12h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 20h  
**Sprint Capacity:** 2 agents × 8h/day × 14 days = 224h  
**Utilization:** 9% (leaves room for A/B testing + user feedback iteration)

**Success Criteria:**
- ✅ Pill buttons replaced with animated icons (hover/tap effects)
- ✅ Icon-first catalog page (brand logos prominent, not text-heavy)
- ✅ Consistent animation language (300ms ease-in-out)
- ✅ Responsive design (icons scale properly on mobile)

**Dependencies:**
- MVP 1.5 complete (stable flyout UX)
- Brand logo assets (30-40% button width, partially cut off)

**Risks:**
- Icon-only UI may reduce discoverability (mitigation: add tooltips, keep text labels on mobile)
- Brand logo licensing (mitigation: verify usage rights before implementation)

**User Quote:**
> "Replace those pill buttons with animated icons... make it feel premium, not generic."

---

## 4. MVP 2.5 - Discovery & Segmentation (Target: Week 7-8, Feb 2026)

**Goal:** Segment-based comparison + cross-brand similarity engine  
**Priority:** MEDIUM (discovery enhancement, competitive intelligence)  
**Timeline:** 2026-02-12 to 2026-02-25 (14 days)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| FEAT-011 | Segment-based comparison ("Find my segment" - Q3 → X3, GLC, XC60) | Feature | MEDIUM | 16h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-012 | Cross-brand similarity engine (luxury compact SUV → all competitors) | Feature | MEDIUM | 20h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 36h  
**Sprint Capacity:** 2 agents × 8h/day × 14 days = 224h  
**Utilization:** 16% (leaves room for algorithm tuning + testing)

**Success Criteria:**
- ✅ "Find my segment" button on vehicle cards
- ✅ Segment detection algorithm (price + body type + features)
- ✅ Cross-brand similarity scoring (0-100%)
- ✅ Automatic competitor suggestions (top 5 similar vehicles)
- ✅ Bilingual support (EN/AR segment names)

**Dependencies:**
- MVP 2.0 complete (stable catalog UI)
- Database schema: `segments` table (already exists, 6 tiers)
- Smart Rules Engine 50% coverage (currently 31.7%, needs expansion)

**Risks:**
- Similarity algorithm may produce poor matches (mitigation: manual tuning + user feedback loop)
- Segment boundaries may be subjective (mitigation: use industry-standard classifications)

**User Quote:**
> "When I look at a Q3, show me the X3, GLC, XC60... all the competitors in that segment."

---

## 5. MVP 3.0 - Analytics Infrastructure (Target: Week 9-10, Mar 2026)

**Goal:** Nimble event listener + consumer behavior pattern detection  
**Priority:** LOW (data foundation for MVP 3.5)  
**Timeline:** 2026-02-26 to 2026-03-11 (14 days)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| FEAT-013 | Nimble event listener architecture (non-intrusive tracking) | Feature | LOW | 12h | 🔴 OPEN | CCW | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-014 | Consumer behavior pattern detection (buying journey 2-5 weeks) | Feature | LOW | 16h | 🔴 OPEN | CCW | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 28h  
**Sprint Capacity:** 2 agents × 8h/day × 14 days = 224h  
**Utilization:** 13% (leaves room for privacy compliance + testing)

**Success Criteria:**
- ✅ Event listener captures: page views, comparisons, reservations, time-on-page
- ✅ Non-intrusive (no performance impact, <50ms overhead)
- ✅ Privacy-compliant (GDPR, no PII without consent)
- ✅ Pattern detection: identify 2-5 week buying journey stages
- ✅ Dashboard: visualize user behavior funnels

**Dependencies:**
- MVP 2.5 complete (stable feature set to track)
- Sentry 10.29.0 (already integrated, can piggyback on infrastructure)
- Database schema: `analytics_events` table (needs migration)

**Risks:**
- Privacy regulations may restrict tracking (mitigation: anonymize data, get consent)
- Event volume may overwhelm database (mitigation: batch writes, use time-series DB)

**User Quote:**
> "I need to understand the buying journey... 2-5 weeks from first visit to booking."

---

## 6. MVP 3.5 - AI & Predictive (Target: Week 11-12, Mar 2026)

**Goal:** Vector DB for pattern storage + predictive analytics + financing trigger ads  
**Priority:** LOW (advanced features, requires MVP 3.0 data)  
**Timeline:** 2026-03-12 to 2026-03-25 (14 days)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| FEAT-015 | Vector DB for pattern storage + predictive analytics | Feature | LOW | 20h | 🔴 OPEN | CC | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-016 | Financing trigger ads (context-aware in flyout) | Feature | LOW | 12h | 🔴 OPEN | CCW | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 32h  
**Sprint Capacity:** 2 agents × 8h/day × 14 days = 224h  
**Utilization:** 14% (leaves room for ML model training + testing)

**Success Criteria:**
- ✅ Vector DB stores user behavior embeddings (Pinecone or Supabase pgvector)
- ✅ Predictive model: recommend vehicles based on browsing history
- ✅ Financing trigger: detect high-intent users (3+ comparisons, 5+ page views)
- ✅ Context-aware ads: show financing options in flyout (non-intrusive)
- ✅ A/B test: measure conversion lift from predictive recommendations

**Dependencies:**
- MVP 3.0 complete (analytics data collected for 2+ weeks)
- Vector DB infrastructure (Pinecone API key OR Supabase pgvector extension)
- Financing partner integration (API for real-time rate quotes)

**Risks:**
- ML model may produce poor recommendations (mitigation: start with rule-based, iterate to ML)
- Financing ads may feel intrusive (mitigation: A/B test placement, allow dismissal)
- Vector DB costs may exceed budget (mitigation: use Supabase pgvector, not Pinecone)

**User Quote:**
> "When someone compares 3+ cars, show them financing options... context-aware, not spammy."

---

## 7. Backlog - Future Considerations

**Goal:** Features deferred beyond MVP 3.5 (Q2 2026+)  
**Priority:** BACKLOG (nice-to-have, not blocking launch)

| ID | Item | Type | Priority | Est Hours | Status | Assigned | Timestamp |
|----|------|------|----------|-----------|--------|----------|-----------|
| FEAT-017 | Virtual test drive (360° interior views) | Feature | BACKLOG | 40h | 🔵 DEFERRED | TBD | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-018 | AR vehicle placement (mobile camera overlay) | Feature | BACKLOG | 60h | 🔵 DEFERRED | TBD | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-019 | Social sharing (WhatsApp, Facebook, Instagram) | Feature | BACKLOG | 8h | 🔵 DEFERRED | TBD | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-020 | Dealer inventory integration (real-time availability) | Feature | BACKLOG | 80h | 🔵 DEFERRED | TBD | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-021 | Trade-in valuation tool (KBB-style estimator) | Feature | BACKLOG | 40h | 🔵 DEFERRED | TBD | 2026-01-07 11:18 AM EET \| PPLX |
| FEAT-022 | Insurance quote integration (partner API) | Feature | BACKLOG | 24h | 🔵 DEFERRED | TBD | 2026-01-07 11:18 AM EET \| PPLX |

**Total Estimated Hours:** 252h (6+ weeks of work)  
**Rationale for Deferral:**
- Virtual test drive: Requires 360° photography (not yet available)
- AR placement: Complex mobile implementation, low ROI for MVP
- Social sharing: Nice-to-have, not core to booking flow
- Dealer inventory: Requires API partnerships (not yet established)
- Trade-in valuation: Complex pricing algorithm, low priority
- Insurance quotes: Requires partner integration (not yet negotiated)

**Revisit Criteria:**
- User feedback requests (3+ users ask for same feature)
- Competitive pressure (competitor launches similar feature)
- Business opportunity (partner offers integration)

---

## APPENDIX: Roadmap Metrics

### Overall Timeline
- **MVP 1.0:** Week 2 (Jan 7-14, 2026) - 7 days
- **MVP 1.5:** Week 3-4 (Jan 15-28, 2026) - 14 days
- **MVP 2.0:** Week 5-6 (Jan 29 - Feb 11, 2026) - 14 days
- **MVP 2.5:** Week 7-8 (Feb 12-25, 2026) - 14 days
- **MVP 3.0:** Week 9-10 (Feb 26 - Mar 11, 2026) - 14 days
- **MVP 3.5:** Week 11-12 (Mar 12-25, 2026) - 14 days
- **Total:** 77 days (11 weeks)

### Effort Distribution
- **MVP 1.0:** 17h (9 items)
- **MVP 1.5:** 35h (5 items)
- **MVP 2.0:** 20h (2 items)
- **MVP 2.5:** 36h (2 items)
- **MVP 3.0:** 28h (2 items)
- **MVP 3.5:** 32h (2 items)
- **Backlog:** 252h (6 items, deferred)
- **Total Active:** 168h (22 items)

### Agent Allocation
- **BB:** 9 items (MVP 1.0 bugs + mobile UX)
- **CC:** 9 items (complex features: flyout, icons, similarity, vector DB)
- **CCW:** 4 items (analytics, financing, SMS/OTP)
- **TBD:** 6 items (backlog, deferred)

### Risk Assessment
- **HIGH RISK:** FEAT-005 (double-fold animation), FEAT-012 (similarity engine)
- **MEDIUM RISK:** FEAT-003 (prefetch), FEAT-011 (segment detection)
- **LOW RISK:** All bug fixes (BUG-005 to BUG-010)

---

**END OF MVP_ROADMAP.md v1.0.0**

**Maintained By:** PPLX (Strategic Planning) + All Agents (Execution)  
**Update Frequency:** Weekly (every Monday, review progress + adjust timeline)  
**Next Review:** 2026-01-13 (after MVP 1.0 sprint completes)
