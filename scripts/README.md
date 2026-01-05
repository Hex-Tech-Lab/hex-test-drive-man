# Scripts Directory

This directory contains automation scripts for the Hex Test Drive platform.

---

## Vehicle Image Mapping

### Quick Start

```bash
# 1. Generate SQL mapping (requires credentials)
./scripts/run_image_mapping.sh

# 2. Execute SQL to update database
psql $SUPABASE_URL < scripts/update_image_urls.sql
```

### Files

- **`generate_image_updates.py`** - Python script that scans image directories and generates SQL
- **`run_image_mapping.sh`** - Wrapper script that loads credentials and runs generator
- **`update_image_urls.sql`** - Generated SQL UPDATE statements (gitignored if contains data)

### How It Works

1. **Scans** `public/images/vehicles/hero/*.jpg` and `public/images/vehicles/hover/*.jpg`
2. **Parses** filenames to extract brand, model, year
3. **Queries** Supabase to find matching model records
4. **Generates** SQL UPDATE statements with image paths
5. **Outputs** clean SQL file ready for execution

### Requirements

- Python 3.x (standard library only, no pip dependencies)
- Supabase credentials (set via environment or `supabase_helper.sh`)

### Environment Variables

```bash
export SUPABASE_URL="https://lbttmhwckcrfdymwyuhn.supabase.co"
export SUPABASE_ANON_KEY="eyJ..."
```

Or create `scripts/supabase_helper.sh`:

```bash
#!/bin/bash
export SUPABASE_URL="https://lbttmhwckcrfdymwyuhn.supabase.co"
export SUPABASE_ANON_KEY="your_anon_key"
export SUPABASE_SERVICE_KEY="your_service_key"
export WHYSMS_API_TOKEN="your_whysms_token"
```

### Output

- **SQL File**: `scripts/update_image_urls.sql` (8KB, 129 UPDATE statements)
- **Warnings**: `/tmp/image_mapping_warnings.txt` (6.6KB, unmatched images)
- **Report**: `docs/IMAGE_MAPPING_REPORT.md` (detailed analysis)

### Statistics (Current Run)

- Hero images: 75 (71 matched, 36 unmatched)
- Hover images: 60 (58 matched, 28 unmatched)
- SQL statements: 129 total
- Unmatched: 40 images (models not in database)

### Common Issues

**Error: SUPABASE_ANON_KEY not set**
- Solution: Source `supabase_helper.sh` or export manually

**Warning: No match for X**
- Cause: Model not in database or naming mismatch
- Solution: Add model to database or update normalization rules

**Multiple matches for X**
- Cause: One image matches multiple model years (expected behavior)
- Result: Image applied to all matching years

---

## Agent Response Validation

### Quick Start

```bash
# Validate from file
python scripts/validate-agent-response.py --agent CC --input response.md

# Validate from clipboard (macOS)
pbpaste | python scripts/validate-agent-response.py --agent BB

# Validate from clipboard (Linux)
xclip -o | python scripts/validate-agent-response.py --agent GC

# Verbose mode (detailed results)
python scripts/validate-agent-response.py --agent CC --input response.md --verbose
```

### Purpose

Validates agent responses against mandatory format checklist to ensure all required fields are present before submission to user.

### Files

- **`validate-agent-response.py`** - Python validation script (367 lines)
- **`docs/standards/AGENT_RESPONSE_VALIDATION.md`** - Validation checklist (363 lines)
- **`docs/standards/VALIDATION_SCRIPT_SPEC.md`** - Technical specification (499 lines)
- **`docs/standards/VALIDATION_USAGE_GUIDE.md`** - Usage guide (442 lines)
- **`tests/validation/*.md`** - Test cases (3 files)

### Required Fields

Every agent response MUST include:

1. **Task Summary**: `✅ Task Complete - [Task Name]`
2. **Timebox**: Allocated/Actual/Variance/Tokens
3. **Deliverables**: Files/Commits/Build/Coverage
4. **Self-Critique**: What went well/What could improve/Lesson learned
5. **Next Steps**: Immediate/Blocked by

### Output

**Success**:
```
✅ PASS: All required fields present
```

**Failure**:
```
❌ FAIL: Missing 3 required fields:
- Timebox: Time allocated not found
- Timebox: Variance not calculated
- Self-critique: "Lesson learned" section missing

Fix these issues and re-validate before submitting.
```

### Requirements

- Python 3.8+ (standard library only, no external dependencies)
- Valid agent identifier: CC, BB, GC, CCW, MSC, GPT, KWSL

### Integration

**Agent Files Updated**:
- `CLAUDE.md` Section 1 item #14 (CC mandatory instructions)
- `BLACKBOX.md` Section 1 item #14 (BB mandatory instructions)
- `GEMINI.md` Section 1 (pending GC sync)

**Enforcement**: User will reject responses missing required fields.

### Documentation

- **Full Checklist**: `docs/standards/AGENT_RESPONSE_VALIDATION.md`
- **Usage Guide**: `docs/standards/VALIDATION_USAGE_GUIDE.md`
- **Technical Spec**: `docs/standards/VALIDATION_SCRIPT_SPEC.md`

---

## Other Scripts

(Add documentation for other scripts as they are created)

---

**Last Updated**: 2026-01-05 by BB
