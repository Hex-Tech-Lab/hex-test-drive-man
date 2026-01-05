# Agent Response Validation Script - Technical Specification

**Version**: 1.0.0  
**Created**: 2026-01-05  
**Script Location**: `scripts/validate-agent-response.py`  
**Purpose**: Automated validation of agent responses against mandatory format checklist  
**Language**: Python 3.8+

---

## 🎯 OVERVIEW

This document specifies the technical requirements for the agent response validation script. The script automates checking of agent responses to ensure all mandatory fields are present before submission to user.

**Design Goals**:
1. **Automated**: No manual checklist review needed
2. **Fast**: <1 second validation time
3. **Clear**: Specific error messages for missing fields
4. **Flexible**: Works with file input or stdin pipe
5. **Extensible**: Easy to add new validation rules

---

## 📋 FUNCTIONAL REQUIREMENTS

### Input

**Supported Input Methods**:
1. File path (via `--input` flag)
2. Standard input (pipe from clipboard or other command)

**Input Format**: Markdown text (agent response)

**Example Usage**:
```bash
# From file
python scripts/validate-agent-response.py --agent CC --input response.md

# From stdin (macOS)
pbpaste | python scripts/validate-agent-response.py --agent BB

# From stdin (Linux)
xclip -o | python scripts/validate-agent-response.py --agent GC
```

---

### Output

**Success Case**:
```
✅ PASS: All required fields present
```

**Failure Case**:
```
❌ FAIL: Missing 3 required fields:
- Timebox: Time allocated not found
- Timebox: Variance not calculated
- Self-critique: "Lesson learned" section missing

Fix these issues and re-validate before submitting.
```

**Exit Codes**:
- `0`: All validations passed
- `1`: One or more validations failed
- `2`: Invalid arguments or script error

---

## 🔍 VALIDATION RULES

### 1. Task Summary Header

**Check**: Response starts with task completion header

**Pattern**: `✅ Task Complete - [Task Name]`

**Validation Logic**:
```python
def validate_task_header(text: str) -> tuple[bool, list[str]]:
    """
    Check if response has proper task completion header.
    
    Returns:
        (pass/fail, list of missing elements)
    """
    errors = []
    
    # Check for ✅ emoji
    if '✅' not in text[:200]:  # Check first 200 chars
        errors.append("Task header: Missing ✅ emoji")
    
    # Check for "Task Complete" phrase
    if 'Task Complete' not in text[:200]:
        errors.append("Task header: Missing 'Task Complete' phrase")
    
    return (len(errors) == 0, errors)
```

---

### 2. Timebox Metrics

**Check**: All timebox fields present and properly formatted

**Required Fields**:
- `Allocated: X min`
- `Actual: Y min`
- `Variance: Z% (over/under budget)`
- `Tokens: A / 200k (B%)`

**Validation Logic**:
```python
def validate_timebox(text: str) -> tuple[bool, list[str]]:
    """
    Check if all timebox metrics are present.
    
    Returns:
        (pass/fail, list of missing fields)
    """
    errors = []
    
    # Check for Timebox section
    if '**Timebox**:' not in text:
        errors.append("Timebox: Section not found")
        return (False, errors)
    
    # Extract timebox section (between **Timebox**: and next ** section)
    import re
    timebox_match = re.search(r'\*\*Timebox\*\*:(.*?)(?:\*\*[A-Z]|\Z)', text, re.DOTALL)
    if not timebox_match:
        errors.append("Timebox: Could not parse section")
        return (False, errors)
    
    timebox_text = timebox_match.group(1)
    
    # Check for required fields
    if not re.search(r'Allocated:\s*\d+\s*min', timebox_text):
        errors.append("Timebox: Time allocated not found")
    
    if not re.search(r'Actual:\s*\d+\s*min', timebox_text):
        errors.append("Timebox: Time actual not found")
    
    if not re.search(r'Variance:\s*[+-]?\d+%\s*\((?:over|under)\s+budget\)', timebox_text):
        errors.append("Timebox: Variance not calculated or missing direction")
    
    if not re.search(r'Tokens:\s*\d+\s*/\s*200k\s*\(\d+\.?\d*%\)', timebox_text):
        errors.append("Timebox: Token usage not found or missing percentage")
    
    return (len(errors) == 0, errors)
```

---

### 3. Deliverables

**Check**: Deliverables section with files, commits, build status

**Required Fields**:
- `Files:` (with line counts)
- `Commits:` (with SHA)
- `Build:` (PASS or FAIL)

**Validation Logic**:
```python
def validate_deliverables(text: str) -> tuple[bool, list[str]]:
    """
    Check if deliverables section is complete.
    
    Returns:
        (pass/fail, list of missing fields)
    """
    errors = []
    
    # Check for Deliverables section
    if '**Deliverables**:' not in text:
        errors.append("Deliverables: Section not found")
        return (False, errors)
    
    # Extract deliverables section
    import re
    deliverables_match = re.search(r'\*\*Deliverables\*\*:(.*?)(?:\*\*[A-Z]|\Z)', text, re.DOTALL)
    if not deliverables_match:
        errors.append("Deliverables: Could not parse section")
        return (False, errors)
    
    deliverables_text = deliverables_match.group(1)
    
    # Check for Files subsection
    if 'Files:' not in deliverables_text and '- Files:' not in deliverables_text:
        errors.append("Deliverables: Files list not found")
    
    # Check for Commits subsection
    if 'Commits:' not in deliverables_text and '- Commits:' not in deliverables_text:
        errors.append("Deliverables: Commits list not found")
    
    # Check for Build status
    if 'Build:' not in deliverables_text and '- Build:' not in deliverables_text:
        errors.append("Deliverables: Build status not found")
    
    return (len(errors) == 0, errors)
```

---

### 4. Self-Critique

**Check**: Self-critique section with all three subsections

**Required Subsections**:
- `What went well:` (2-3 items)
- `What could improve:` (2-3 items)
- `Lesson learned:` (1-2 items)

**Validation Logic**:
```python
def validate_self_critique(text: str) -> tuple[bool, list[str]]:
    """
    Check if self-critique section is complete.
    
    Returns:
        (pass/fail, list of missing subsections)
    """
    errors = []
    
    # Check for Self-Critique section
    if '**Self-Critique**:' not in text:
        errors.append("Self-critique: Section not found")
        return (False, errors)
    
    # Extract self-critique section
    import re
    critique_match = re.search(r'\*\*Self-Critique\*\*:(.*?)(?:\*\*[A-Z]|\Z)', text, re.DOTALL)
    if not critique_match:
        errors.append("Self-critique: Could not parse section")
        return (False, errors)
    
    critique_text = critique_match.group(1)
    
    # Check for required subsections
    if 'What went well:' not in critique_text:
        errors.append("Self-critique: 'What went well' subsection missing")
    
    if 'What could improve:' not in critique_text:
        errors.append("Self-critique: 'What could improve' subsection missing")
    
    if 'Lesson learned:' not in critique_text:
        errors.append("Self-critique: 'Lesson learned' subsection missing")
    
    return (len(errors) == 0, errors)
```

---

### 5. Next Steps

**Check**: Next steps section with immediate actions and blockers

**Required Fields**:
- `Immediate:` (actions)
- `Blocked by:` (dependencies or "None")

**Validation Logic**:
```python
def validate_next_steps(text: str) -> tuple[bool, list[str]]:
    """
    Check if next steps section is complete.
    
    Returns:
        (pass/fail, list of missing fields)
    """
    errors = []
    
    # Check for Next Steps section
    if '**Next Steps**:' not in text:
        errors.append("Next steps: Section not found")
        return (False, errors)
    
    # Extract next steps section
    import re
    steps_match = re.search(r'\*\*Next Steps\*\*:(.*?)(?:\*\*[A-Z]|\Z)', text, re.DOTALL)
    if not steps_match:
        errors.append("Next steps: Could not parse section")
        return (False, errors)
    
    steps_text = steps_match.group(1)
    
    # Check for required fields
    if 'Immediate:' not in steps_text:
        errors.append("Next steps: 'Immediate' actions not found")
    
    if 'Blocked by:' not in steps_text:
        errors.append("Next steps: 'Blocked by' field not found")
    
    return (len(errors) == 0, errors)
```

---

## 🏗️ ARCHITECTURE

### Module Structure

```
scripts/validate-agent-response.py
├── main()                    # Entry point, CLI argument parsing
├── validate_response()       # Orchestrates all validations
├── validate_task_header()    # Check task completion header
├── validate_timebox()        # Check timebox metrics
├── validate_deliverables()   # Check deliverables section
├── validate_self_critique()  # Check self-critique section
├── validate_next_steps()     # Check next steps section
└── format_output()           # Format validation results
```

### Data Flow

```
Input (file or stdin)
    ↓
Read text content
    ↓
Run all validators (parallel)
    ↓
Collect errors from each validator
    ↓
Format output (PASS or FAIL with details)
    ↓
Exit with appropriate code (0 or 1)
```

---

## 🔧 IMPLEMENTATION DETAILS

### CLI Arguments

```python
import argparse

parser = argparse.ArgumentParser(
    description='Validate agent response against mandatory format checklist'
)
parser.add_argument(
    '--agent',
    type=str,
    required=True,
    choices=['CC', 'BB', 'GC', 'CCW', 'MSC', 'GPT', 'KWSL'],
    help='Agent identifier (for logging)'
)
parser.add_argument(
    '--input',
    type=str,
    help='Path to response file (if not using stdin)'
)
parser.add_argument(
    '--verbose',
    action='store_true',
    help='Show detailed validation results'
)
```

### Error Handling

**File Not Found**:
```python
if args.input and not os.path.exists(args.input):
    print(f"❌ ERROR: File not found: {args.input}", file=sys.stderr)
    sys.exit(2)
```

**Empty Input**:
```python
if not text.strip():
    print("❌ ERROR: Empty input (no text to validate)", file=sys.stderr)
    sys.exit(2)
```

**Invalid UTF-8**:
```python
try:
    text = input_file.read()
except UnicodeDecodeError:
    print("❌ ERROR: Invalid UTF-8 encoding", file=sys.stderr)
    sys.exit(2)
```

---

## 🧪 TEST CASES

### Test Case 1: Good Response (Should PASS)

**File**: `tests/validation/good-response.md`

**Content**: Complete response with all required fields

**Expected Output**:
```
✅ PASS: All required fields present
```

**Expected Exit Code**: 0

---

### Test Case 2: Missing Timebox (Should FAIL)

**File**: `tests/validation/bad-response-missing-timebox.md`

**Content**: Response without timebox section

**Expected Output**:
```
❌ FAIL: Missing 1 required field:
- Timebox: Section not found

Fix these issues and re-validate before submitting.
```

**Expected Exit Code**: 1

---

### Test Case 3: Missing Self-Critique (Should FAIL)

**File**: `tests/validation/bad-response-missing-critique.md`

**Content**: Response without self-critique section

**Expected Output**:
```
❌ FAIL: Missing 1 required field:
- Self-critique: Section not found

Fix these issues and re-validate before submitting.
```

**Expected Exit Code**: 1

---

## 📊 PERFORMANCE REQUIREMENTS

- **Validation Time**: <1 second for typical response (500-1000 lines)
- **Memory Usage**: <50 MB
- **Python Version**: 3.8+ (no external dependencies beyond stdlib)

---

## 🔄 EXTENSIBILITY

### Adding New Validation Rules

1. Create new validator function:
```python
def validate_new_field(text: str) -> tuple[bool, list[str]]:
    errors = []
    # Validation logic here
    return (len(errors) == 0, errors)
```

2. Add to validation orchestrator:
```python
def validate_response(text: str, agent: str) -> dict:
    results = {
        'task_header': validate_task_header(text),
        'timebox': validate_timebox(text),
        'deliverables': validate_deliverables(text),
        'self_critique': validate_self_critique(text),
        'next_steps': validate_next_steps(text),
        'new_field': validate_new_field(text),  # Add here
    }
    return results
```

3. Update `AGENT_RESPONSE_VALIDATION.md` with new requirement

---

## 📚 RELATED DOCUMENTS

- `docs/standards/AGENT_RESPONSE_VALIDATION.md` - Validation checklist (user-facing)
- `docs/standards/VALIDATION_USAGE_GUIDE.md` - How to use validation script
- `scripts/validate-agent-response.py` - Implementation (this spec)

---

## 🔄 VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-05 | Initial specification | BB |

---

**END OF VALIDATION_SCRIPT_SPEC.md**
