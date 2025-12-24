# BB Overnight Image Coverage Audit Prompt

**Agent:** Blackbox AI
**Objective:** Audit 199 vehicle models and identify top 50 models with missing hover images
**Timeline:** 90 minutes (can run overnight)
**Deadline:** 2025-12-25 08:00 EET

---

## TASK: Image Coverage Audit

### Context
- Production catalog has **199 models** with **100% hero image coverage**
- **133 models (66.8%)** are missing `hover_image_url`
- Need to prioritize **top 50 models** for hover image creation

### Required Environment
- **File:** `/home/kellyb_dev/projects/hex-test-drive-man/.env.local`
- **Keys:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (verified present ✅)

### Deliverable
Create `docs/IMAGE_COVERAGE_AUDIT_20251225.json` with structure:

```json
{
  "audit_timestamp": "2025-12-25T00:43:00+02:00",
  "total_models": 199,
  "hero_image_coverage": "100%",
  "hover_image_coverage": "33.2%",
  "missing_hover_images_count": 133,
  "top_50_priority_models": [
    {
      "id": "uuid",
      "model_name": "Toyota Corolla",
      "brand": "Toyota",
      "hero_image_url": "/images/vehicles/hero/toyota_corolla.jpg",
      "hover_image_url": null,
      "priority_score": 95,
      "priority_reason": "Best-selling sedan in Egypt, high catalog traffic"
    }
  ],
  "prioritization_criteria": [
    "Sales volume in Egyptian market",
    "Catalog page views (if available)",
    "Brand popularity",
    "Segment importance (luxury > economy)"
  ]
}
```

### Methodology
1. **Query** all models with `NULL hover_image_url` (133 models)
2. **Join** with brands, segments, vehicle_trims for context
3. **Prioritize** using sales data (if available) or brand/segment heuristics
4. **Extract** top 50 models
5. **Generate** JSON report

### Success Criteria
- ✅ All 133 missing hover images identified
- ✅ Top 50 prioritized with rationale
- ✅ JSON valid and ready for image work planning
- ✅ Audit completable in 90 minutes

### Supabase Access
```bash
# Test connection
ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)
curl -s "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/models?select=count&hover_image_url=is.null" \
  -H "apikey: $ANON_KEY"
# Expected: {"count":133}
```

### Prioritization Logic (Suggested)
```python
# If sales data unavailable, use heuristics:
priority_score = (
    brand_popularity_weight * 0.4 +  # Toyota=100, Chery=60, Supercar brands=50
    segment_weight * 0.3 +            # Luxury=100, Premium=80, Mid-range=60, Budget=40
    model_year_weight * 0.2 +         # 2025=100, 2024=80, 2023=60
    trim_count_weight * 0.1           # More trims = higher priority
)
```

---

**Generated:** 2025-12-25 00:43 EET
**By:** CC (Claude Code) - Option B Image Work Prep
**For:** Blackbox AI overnight execution
