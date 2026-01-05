# Agent Response Validation - Usage Guide

**Version**: 1.0.0  
**Created**: 2026-01-05  
**Audience**: All agents (CC, BB, GC, CCW, MSC, GPT, KWSL)  
**Purpose**: Quick reference for using the validation script

---

## 🚀 QUICK START

### 1. Validate from File

```bash
python scripts/validate-agent-response.py --agent CC --input response.md
```

**When to use**: You've written your response to a file and want to validate before submitting.

---

### 2. Validate from Clipboard (macOS)

```bash
pbpaste | python scripts/validate-agent-response.py --agent BB
```

**When to use**: You've copied your response to clipboard and want quick validation.

---

### 3. Validate from Clipboard (Linux)

```bash
xclip -o | python scripts/validate-agent-response.py --agent GC
```

**When to use**: Same as macOS, but for Linux systems.

---

### 4. Verbose Mode (Detailed Results)

```bash
python scripts/validate-agent-response.py --agent CC --input response.md --verbose
```

**When to use**: You want to see section-by-section validation results (helpful for debugging).

---

## 📋 WORKFLOW INTEGRATION

### When to Run Validation

**MANDATORY**: Before submitting ANY response to user

**Recommended Workflow**:
1. Write your response (in editor or draft)
2. Run validation script
3. If FAIL → fix missing fields
4. Re-run validation
5. If PASS → submit to user

---

### Example Workflow (File-Based)

```bash
# Step 1: Write response to file
vim response.md

# Step 2: Validate
python scripts/validate-agent-response.py --agent CC --input response.md

# Step 3: If FAIL, edit and re-validate
vim response.md
python scripts/validate-agent-response.py --agent CC --input response.md

# Step 4: If PASS, copy to clipboard and submit
cat response.md | pbcopy
```

---

### Example Workflow (Clipboard-Based)

```bash
# Step 1: Copy response to clipboard (from editor)

# Step 2: Validate
pbpaste | python scripts/validate-agent-response.py --agent BB

# Step 3: If FAIL, edit in editor, copy again, re-validate
pbpaste | python scripts/validate-agent-response.py --agent BB

# Step 4: If PASS, paste into chat
```

---

## 🔍 UNDERSTANDING OUTPUT

### Success Case

```
✅ PASS: All required fields present
```

**Meaning**: Your response has all mandatory fields. Safe to submit.

**Exit Code**: 0

---

### Failure Case

```
❌ FAIL: Missing 3 required fields:
- Timebox: Time allocated not found
- Timebox: Variance not calculated
- Self-critique: "Lesson learned" section missing

Fix these issues and re-validate before submitting.
```

**Meaning**: Your response is missing 3 required fields. Fix them before submitting.

**Exit Code**: 1

**Action**: 
1. Open `docs/standards/AGENT_RESPONSE_VALIDATION.md`
2. Find the missing sections
3. Add them to your response
4. Re-run validation

---

### Verbose Output

```bash
python scripts/validate-agent-response.py --agent CC --input response.md --verbose
```

**Output**:
```
❌ FAIL: Missing 2 required fields:
- Timebox: Variance not calculated
- Self-critique: "Lesson learned" section missing

Fix these issues and re-validate before submitting.

--- Detailed Results ---
task_header: ✅ PASS
timebox: ❌ FAIL
  - Timebox: Variance not calculated
deliverables: ✅ PASS
self_critique: ❌ FAIL
  - Self-critique: "Lesson learned" section missing
next_steps: ✅ PASS
```

**Meaning**: Shows which sections passed/failed individually. Helpful for debugging complex responses.

---

## 🐛 COMMON FAILURE SCENARIOS

### Scenario 1: Missing Timebox Section

**Error**:
```
❌ FAIL: Missing 1 required field:
- Timebox: Section not found
```

**Fix**: Add timebox section to your response:
```markdown
**Timebox**:
- Allocated: 60 min
- Actual: 72 min
- Variance: +20% (over budget)
- Tokens: 45000 / 200k (22.5%)
```

---

### Scenario 2: Incomplete Timebox (Missing Variance)

**Error**:
```
❌ FAIL: Missing 1 required field:
- Timebox: Variance not calculated or missing direction
```

**Fix**: Add variance calculation with direction:
```markdown
- Variance: +20% (over budget)  # or -15% (under budget)
```

**Calculation**:
```python
variance_pct = ((actual - allocated) / allocated) * 100
# Example: ((72 - 60) / 60) * 100 = +20%
```

---

### Scenario 3: Missing Self-Critique Subsection

**Error**:
```
❌ FAIL: Missing 1 required field:
- Self-critique: "Lesson learned" subsection missing
```

**Fix**: Add lesson learned subsection:
```markdown
**Self-Critique**:
- What went well: [items]
- What could improve: [items]
- Lesson learned:
  - Template-first approach saves 20% time
  - Automated validation catches 90% of format errors
```

---

### Scenario 4: Missing Next Steps

**Error**:
```
❌ FAIL: Missing 2 required fields:
- Next steps: 'Immediate' actions not found
- Next steps: 'Blocked by' field not found
```

**Fix**: Add next steps section:
```markdown
**Next Steps**:
- Immediate:
  - User: Review validation script output format
  - CC: Audit CLAUDE.md Section 1 update
- Blocked by: None
```

---

## 🔧 TROUBLESHOOTING

### Issue: Script Not Found

**Error**:
```bash
python: can't open file 'scripts/validate-agent-response.py': [Errno 2] No such file or directory
```

**Fix**: Run from project root directory:
```bash
cd /vercel/sandbox
python scripts/validate-agent-response.py --agent CC --input response.md
```

---

### Issue: Invalid Agent Name

**Error**:
```
usage: validate-agent-response.py [-h] --agent {CC,BB,GC,CCW,MSC,GPT,KWSL} [--input INPUT] [--verbose]
validate-agent-response.py: error: argument --agent: invalid choice: 'XYZ' (choose from 'CC', 'BB', 'GC', 'CCW', 'MSC', 'GPT', 'KWSL')
```

**Fix**: Use valid agent identifier:
```bash
python scripts/validate-agent-response.py --agent CC --input response.md
```

---

### Issue: Empty Input

**Error**:
```
❌ ERROR: Empty input (no text to validate)
```

**Fix**: Ensure file has content or clipboard is not empty:
```bash
# Check file content
cat response.md

# Check clipboard (macOS)
pbpaste

# Check clipboard (Linux)
xclip -o
```

---

### Issue: File Not Found

**Error**:
```
❌ ERROR: File not found: response.md
```

**Fix**: Verify file path:
```bash
# Check if file exists
ls -la response.md

# Use absolute path
python scripts/validate-agent-response.py --agent CC --input /full/path/to/response.md
```

---

### Issue: UTF-8 Encoding Error

**Error**:
```
❌ ERROR: Invalid UTF-8 encoding
```

**Fix**: Ensure file is UTF-8 encoded:
```bash
# Check file encoding
file -I response.md

# Convert to UTF-8 (if needed)
iconv -f ISO-8859-1 -t UTF-8 response.md > response-utf8.md
```

---

## 📚 RELATED DOCUMENTS

- **Validation Checklist**: `docs/standards/AGENT_RESPONSE_VALIDATION.md` (user-facing checklist)
- **Technical Spec**: `docs/standards/VALIDATION_SCRIPT_SPEC.md` (implementation details)
- **Script Source**: `scripts/validate-agent-response.py` (Python implementation)
- **Test Cases**: `tests/validation/*.md` (example responses)

---

## 💡 TIPS & BEST PRACTICES

### Tip 1: Validate Early and Often

Don't wait until response is complete. Validate sections as you write them:

```bash
# After writing timebox section
pbpaste | python scripts/validate-agent-response.py --agent CC --verbose

# Check which sections are still missing
```

---

### Tip 2: Use Verbose Mode for Debugging

If validation fails and you're not sure why, use `--verbose`:

```bash
python scripts/validate-agent-response.py --agent CC --input response.md --verbose
```

This shows section-by-section results, making it easier to identify the problem.

---

### Tip 3: Keep Template Handy

Keep a template file with all required sections:

```bash
# Create template
cat > response-template.md << 'EOF'
✅ Task Complete - [Task Name]

**Timebox**:
- Allocated: X min
- Actual: Y min
- Variance: Z% (over/under budget)
- Tokens: A / 200k (B%)

**Deliverables**:
- Files: [list]
- Commits: [SHA + messages]
- Build: ✅ PASS / ❌ FAIL
- Coverage: X%

**Self-Critique**:
- What went well: [items]
- What could improve: [items]
- Lesson learned: [items]

**Next Steps**:
- Immediate: [actions]
- Blocked by: [dependencies or None]
EOF

# Copy template for new response
cp response-template.md new-response.md
```

---

### Tip 4: Automate with Shell Alias

Add to your shell config (`~/.bashrc` or `~/.zshrc`):

```bash
# Validate from clipboard (macOS)
alias validate-response='pbpaste | python scripts/validate-agent-response.py --agent CC'

# Validate from file
alias validate-file='python scripts/validate-agent-response.py --agent CC --input'
```

Usage:
```bash
# From clipboard
validate-response

# From file
validate-file response.md
```

---

## 🔄 VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-05 | Initial release | BB |

---

**END OF VALIDATION_USAGE_GUIDE.md**
