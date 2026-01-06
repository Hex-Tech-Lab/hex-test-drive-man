# ISSUES ROSTER - Living Document

**Purpose:** Capture all issues mentioned in daily conversation ("verbal voice scraper")  
**Owner:** PPLX (updated every session)  
**Last Updated:** 2026-01-06 17:42 EET (PPLX)  
**Status:** Active - continuous updates

---

## How This Works

This document tracks every bug, improvement, complaint, or design gap mentioned during sessions. Think of it as a "verbal voice scraper" that distills your 15-20 daily observations into a structured, actionable roster.

**Update frequency:** Every session  
**Classification:** Critical → High → Medium → Low + Lessons Learned  
**Action tracking:** Each item has status (🔴 Open, ⏳ In Progress, ✅ Fixed, ❌ Won't Fix)

---

## CRITICAL BLOCKERS (Shipping Stoppers)

### CB-001: Production React Hooks Error (**ACTIVE**)
**Status:** 🔴 Open → ⏳ BB investigating (Jan 6, 17:50 EET)  
**Severity:** CRITICAL  
**Impact:** 100% of catalog page visits failing  
**Error:** `Rendered more hooks than during the previous render` at `page.tsx:395`  
**Root cause:** CC's Phase 1 deployment (commits 648f31d, 2a19266) introduced conditional hook usage  
**First reported:** 2026-01-06 01:12 UTC (Sentry alert)  
**User frustration:** "Latest deployment is a repeat of what was happening all last night"  
**Action:** BB fixing hooks violation or reverting Phase 1 (30 min timebox)  
**Related:** Sentry issue #7b7556a3214a482597d11c2bc02ec094

---

## HIGH PRIORITY (UX Broken, Visible to Users)

### HP-001: Arabic Font Inter-Character Spacing (White Streaks)
**Status:** 🔴 Open  
**Severity:** HIGH  
**Impact:** Arabic text looks unprofessional, "very unbecoming"  
**Description:** White streaks of spacing connecting words in Arabic fonts on web  
**Observed:** Catalog hero section, general Arabic typography  
**User quote:** "The fonts are not displaying properly on the mobile, on the web, yeah, they look much nicer, but there's inter-character spacing which is very annoying, like white streaks of spacing that are connecting the words."  
**Root cause:** Likely artificial letter-spacing applied via CSS  
**Solution needed:** Use high-quality Arabic webfont without CSS letter-spacing hacks  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** Front-end LLM task (need design-savvy solution)

### HP-002: Search Box Duplication
**Status:** 🔴 Open  
**Severity:** HIGH  
**Impact:** Confusing UX, two search boxes visible  
**Description:** Two search boxes appearing on catalog page  
**Observed:** Screenshot shows duplicate search placement  
**User quote:** "The search box is placed in a very weird way, and there are two search boxes which is again interesting."  
**Solution needed:** Single search component (either in header OR hero, not both)  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** BB's catalog redesign (multiple commits Jan 6)

### HP-003: Top Tab System Alignment Issue
**Status:** 🔴 Open  
**Severity:** HIGH  
**Impact:** Visual inconsistency, looks unfinished  
**Description:** Tab system (SUV/Sedan/Hatchback/Electric) not aligned properly  
**Observed:** Screenshot at 50% scale shows misalignment clearly  
**User quote:** "There's an alignment issue with the top tap system."  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** BB's CatalogTabs.tsx component

### HP-004: Column Grid Logic Wrong for Mobile
**Status:** 🔴 Open  
**Severity:** HIGH  
**Impact:** Mobile UX broken (too many columns)  
**Description:** Grid offers 3/4/5 column options, but mobile can only display 1-2 columns comfortably  
**User quote:** "On the web, the number of columns should be changing instead of having three options of three, four, or five columns. It should be one and two because on the mobile, you can't actually see more than that."  
**Solution needed:** Responsive column logic (1-2 cols mobile, 3-5 cols desktop)  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** BB's grid defaults commit (fa4d6f4)

### HP-005: List View Broken on Web/Mobile-Web
**Status:** 🔴 Open  
**Severity:** HIGH  
**Impact:** Feature doesn't work on primary platform (web)  
**Description:** List view works on mobile app but not on web or mobile version of web  
**User quote:** "The list for some reason seems to work on the mobile, but not on the web or at least on the mobile version of the web."  
**First reported:** 2026-01-06 (catalog redesign review)

---

## MEDIUM (Polish, Sophistication Gaps)

### MP-001: Icons Lacking - No Visual Richness
**Status:** 🔴 Open  
**Severity:** MEDIUM  
**Impact:** Looks "simply done", not premium  
**Description:** Brand filter buttons show only text names, no logos, no sophisticated layout  
**User vision:** Brand name right-aligned, large logo taking 30-40% of button width (partially cut off for elegance)  
**User quote:** "For example, the icons are really lacking. When you choose, for example, to sort by brand name, you will find buttons for the brands, and just their names written. Nothing created there. I would imagine, for example, the brand would be right-aligned, and then a big logo would take over the rest of that order, that say that I up to 30% of the button, and sort of as if it's cut off. Something elegant, but you don't get that here."  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** Front-end LLM task (design sophistication)

### MP-002: No Fluid Motion / Accordion / Slider Feel
**Status:** 🔴 Open  
**Severity:** MEDIUM  
**Impact:** Doesn't feel sophisticated, static/cheap  
**Description:** Tab system and filters lack smooth animations, sliding indicators, accordion effects  
**User quote:** "There's no accordion or slider for this functionality, and it's not fluid motion, so you don't feel really something sophisticated."  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** Front-end LLM task (interaction design)

### MP-003: Inconsistent "By" Prefix in Labels
**Status:** 🔴 Open  
**Severity:** MEDIUM  
**Impact:** Confusing, unprofessional labeling  
**Description:** Three tabs use "by" prefix (by brand, by price, by...), but fourth tab (Electric/Hybrid) doesn't  
**User quote:** "You should make a brand (by price). You make it price for example, electrical hybrid, because you're using 'buy' in 3, and you're not using the word 'buy' in the 4th system (by price again). Blocks and that would make sense."  
**Solution needed:** Consistent labeling: "Brand", "Body Type", "Price", "Powertrain" (no "by" prefix anywhere)  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** BB's CatalogTabs.tsx component

### MP-004: Filter Collapse Button Spans Full Screen (Wrong on Desktop)
**Status:** 🔴 Open  
**Severity:** MEDIUM  
**Impact:** Desktop UX looks wrong (mobile pattern on desktop)  
**Description:** When collapsing filter from advanced to simple, button becomes full-width (works mobile, wrong for desktop)  
**User quote:** "When you want to collapse the filter from advanced to simple, the button becomes across the whole screen, which obviously works for mobile, but definitely doesn't work for web."  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** BB's FilterPanel component

---

## LOW PRIORITY (Nice-to-Have, Future Iterations)

### LP-001: Search Component Should Be Extractable to Header
**Status:** 🔴 Open  
**Severity:** LOW  
**Impact:** Architecture improvement (not blocking)  
**Description:** Search currently embedded in catalog; should be a standalone component placeable in header  
**User quote:** "It mentioned something about creating the component out of the search so it can be placed in the header bar, which makes a lot more sense."  
**First reported:** 2026-01-06 (catalog redesign review)  
**Related:** Architecture refactor (post-MVP 1.5)

---

## LESSONS LEARNED (Recurring Patterns)

### LL-001: Performance Defaults Not Automatic (**RECURRING**)
**Pattern:** User has to explicitly request deferring non-critical JS, lazy loading, FCP/LCP optimization  
**Frequency:** Every 2-3 sessions  
**Core Issue:** LLMs (including world-class ones like CC) don't apply 2026 best practices by default  
**User frustration statement:**  
> "Isn't it normal that when you create a page, you defer the loading of the unnecessary J scripts to later? Is this something that you need to ask for in 2026? I mean, it's kind of utterly stupid for me that I need to ask and now I'm not asking even a junior developer. I'm asking an LLM who's supposed to be acting as a world-class developer. Do you need to ask a world-class full-stack developer to defer loading the unnecessary things until everything necessary is loaded and to prioritize what is loaded and to ensure that the FCP is under an industry standard. Is that even conceivable?"  
**Status:** 🔴 Still recurring  
**What would actually fix this:**  
- Add "Performance Defaults Checklist" to PROMPT_FIXTURES.md  
- Mandatory pre-task check: "Does this page touch rendering? If yes, verify FCP/LCP targets first."  
- CC/BB/CCW must reference performance baseline (Amazon analysis) before writing any component  
**First reported:** 2026-01-06 (Amazon baseline discussion context)  
**Related:** Amazon performance analysis (docs/AMAZON_PERFORMANCE_ANALYSIS.md)

### LL-002: PR Scraping Exists But Not Used (**RECURRING**)
**Pattern:** User asks "Why do we have PR scraping if we don't use it?"  
**Frequency:** Every 2-3 sessions (last: Jan 5, Jan 4, Jan 2)  
**Core Issue:** PR scraper runs and outputs MERGE_BLOCKERS.md, but no one checks it before starting work  
**User frustration statement:**  
> "We have all these review tooling and we're not going to use it - why do we have it? And why did the people make it? Because actually you catch the problems before they happen."  
**Status:** 🔴 Still recurring  
**What would actually fix this:**  
- Agent checklist item (mandatory): "Before accepting any task, read latest MERGE_BLOCKERS.md"  
- OR: Auto-post summary at session start (Slack/Discord bot)  
- OR: GitHub Action comments on new PR with blockers from previous PRs  
**First reported:** Multiple sessions (Dec 2025, Jan 2026)  
**Related:** PR scraping workflow, MERGE_BLOCKERS.md output

### LL-003: Systems Created But Not Enforced (**RECURRING**)
**Pattern:** Great systems designed (Best Practices Repo, Self-Validating Agent Response System, Performance Targets Matrix) but never enforced  
**Examples:**  
1. **Best Practices Repository:** Created, documented, not referenced in agent prompts  
2. **Self-Validating Agent Response System:** Designed by PPLX, implemented by BB, never audited by CC, not enforced  
3. **Performance Targets Matrix:** Created during Amazon analysis, not in repo, not referenced by CC during Phase 1  
**Core Issue:** No follow-up loop to verify systems are actually being used  
**Status:** 🔴 Still recurring  
**What would actually fix this:**  
- Lifecycle tracking for all systems (🟢 Active, 🟡 Created but not enforced, 🔴 Abandoned)  
- Quarterly audit: "Which systems exist? Which are enforced? Which should be retired?"  
- Integration status required for any new system (not just "documented")  
**First reported:** 2026-01-06 (THOS redesign discussion)  
**Related:** Section 4 of new THOS prompt (Knowledge Cycles)

### LL-004: RTL Bug Took 2 Weeks Due to Incomplete Testing (**RESOLVED**)
**Pattern:** Bug fixed on one page (comparison), not tested on other pages (catalog)  
**Timeline:**  
- Fixed on comparison page: ~2 weeks before Jan 5  
- Discovered still broken on catalog page: Jan 5  
- Root cause: Different router.push() usage between pages  
- BB fixed in 15 min once given comparison page as reference  
**User frustration statement:**  
> "The RTL issue that was plaguing the system for over two weeks, we had fixed it two weeks ago or something like that before my vacation, and everything for the comparison page. So when you press the language button, you are automatically switched immediately without reload, but the reload kept happening on the catalog page, and we only discovered that yesterday."  
**Status:** ✅ Resolved (BB fixed Jan 5)  
**What prevented this:**  
- Comprehensive testing checklist: "If fixing bug on Page A, test Pages B, C, D with similar code"  
- Smoke test suite: "Language switch works on ALL pages" (automated)  
**Lesson:** Partial fixes are hidden time bombs  
**Related:** BB's RTL fix commit (Jan 5)

### LL-005: Cycles Not Tracked in THOSs (**NEW FINDING**)
**Pattern:** Multi-hour sessions contain multiple knowledge cycles (design reviews, baseline creation, system design), but THOS only captures linear timeline  
**Examples from recent sessions:**  
1. **Amazon Performance Baseline Cycle:** User got dump, PPLX analyzed, created performance target matrix → matrix not in repo, CC didn't reference it during Phase 1  
2. **Self-Validating Agent Response System Cycle:** PPLX designed, BB implemented, CC was supposed to audit → audit never happened  
3. **Best Practices Repository Cycle:** Discussed, designed, created → not enforced in agent prompts  
**Core Issue:** These cycles create valuable artifacts (tables, systems, baselines) but they get lost because THOS doesn't highlight them as discrete knowledge areas  
**Status:** 🟡 Improving (new THOS prompt includes Section 4: Knowledge Cycles)  
**What would actually fix this:**  
- THOS Section 4: Knowledge Cycles (now included in re-engineered prompt)  
- Lifecycle status for each cycle artifact (🟢 Active, 🟡 Created but not enforced, 🔴 Abandoned)  
- Integration status tracking (✅ In repo, ⏳ Documented but not enforced, ❌ Not integrated)  
**First reported:** 2026-01-06 (THOS re-engineering discussion)  
**Related:** Re-engineered THOS prompt (Section 4 addition)

### LL-006: "Agree First, Then Full Plan" Not Always Followed (**RECURRING**)
**Pattern:** LLM generates full-blown plan without getting user agreement first, wasting context/money  
**Example:** Security audit prompt generated without confirming user's "zero security on credentials until MVP 3.x" policy  
**User frustration statement:**  
> "Well before going ahead and giving me a full-blown plan, agree with me first because you are wasting so many resources for no reason - time and money. You have to agree with me and then you give me the full blown thing. You gave me a prompt and I didn't agree on security. Security has one clear distinction: I am all in for security except for credentials."  
**Status:** 🔴 Still recurring  
**What would actually fix this:**  
- Communication protocol: "For any plan >200 words, propose 1-2 sentence approach first, get approval, THEN elaborate"  
- User's documented working style: "Skip option offered → user usually says 'do it anyway' → learn this pattern"  
**First reported:** Multiple sessions (user referenced recent example today)  
**Related:** Communication preferences in Space Instructions

---

## HOUSEKEEPING REMINDERS (Process Enforcement)

### HR-001: CLAUDE.md Out of Sync (**ACTIVE**)
**Status:** 🔴 Open  
**Issue:** CLAUDE.md last updated Dec 24 (13 days ago), missing Jan 3-6 sessions  
**Impact:** Other LLMs (like CW) working with outdated context  
**User quote:** "I'm not sure if this is supposed to be the latest version or not, the one currently on the GitHub repo. Can you check that for me and ensure that this is actually the latest version?"  
**Solution needed:** Update CLAUDE.md with recent sessions, fix header timestamp format  
**First reported:** 2026-01-06 17:50 EET  
**Action:** PPLX updating now

### HR-002: CLAUDE.md Header Uses Wrong Timestamp Format (**ACTIVE**)
**Status:** 🔴 Open  
**Current format:** "Last Updated: 2025-12-24 1756 EET"  
**Correct format:** "2026-01-06 17:42 EET (Agent: PPLX, Version: 2.4.1)"  
**User requirement:** "It should be updated to use the proper time stamp which is date-time-agent and version if possible."  
**First reported:** 2026-01-06 17:50 EET  
**Action:** PPLX fixing in next commit

---

## ARCHIVE (Fixed or Won't Fix)

### FIXED-001: RTL Language Switch Reload (✅ Fixed Jan 5, BB)
**Original issue:** Catalog page reloaded on language switch (comparison page didn't)  
**Root cause:** Used router.push() instead of router.replace()  
**Fix:** BB changed to router.replace() in Header.tsx  
**Commit:** bb/rtl-reload-fix-20260105  
**Verified:** Jan 5 in production

### FIXED-002: Gray Placeholder Images (✅ Fixed Jan 4, CC)
**Original issue:** 59 gray placeholder images in production  
**Root cause:** Actual IMAGE FILES committed, not NULL URLs  
**Fix:** CC's comprehensive script (PIL RGB analysis → delete files → update DB)  
**Commits:** 648f31d, 2a19266  
**Verified:** Jan 4 (0 gray boxes remaining, 59% coverage achieved)

---

## USAGE NOTES

**For agents:**  
- Check this document at session start (like reading MERGE_BLOCKERS.md)  
- Update your section after completing work  
- Move items to ARCHIVE when fixed  
- Add new items as user mentions them verbally

**For user:**  
- This is your "memory" of all the little things mentioned in conversation  
- Reference by ID when assigning tasks (e.g., "Fix HP-002 and MP-001")  
- Review weekly to identify recurring patterns (→ becomes Lesson Learned)

**Update protocol:**  
- Every session: Add new items from user's verbal feedback  
- Every fix: Move to ARCHIVE with resolution details  
- Every week: Review MEDIUM/LOW for candidates to close or escalate