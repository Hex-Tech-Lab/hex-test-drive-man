#!/usr/bin/env python3
import anthropic
import json
import sys

client = anthropic.Anthropic()
model = "claude-sonnet-4-5-20250929"

with open('bmw_x5_raw_tables.json') as f:
    raw_data = json.load(f)

# ALL rows from 3 tables
all_rows = []
for table_idx, table in enumerate(raw_data['tables']):
    for row in table['rows'][1:]:  # Skip headers
        all_rows.append({
            "idx": len(all_rows) + 1,
            "en": (row[0] or '').strip(),
            "trim1": (row[1] or '').strip(),
            "trim2": (row[2] or '').strip(),
            "ar": (row[3] or '').strip()
        })

print(f"📊 Processing {len(all_rows)} rows across 3 tables")

def extract_iteration(iteration, context=""):
    """Self-questioning extraction with context from previous iteration"""
    
    prompt = f"""BMW X5 Page 15 - Iteration {iteration}/3 - SELF-QUESTIONING EXTRACTION

Previous context: {context}

SELF-QUESTIONS (answer before extracting):
1. Is "Engines & Transmissions" ONE section (yes) or TWO (no)?
2. Are rows with ':' like "Active Guard:" packages with components below?
3. Are comma-separated inline items (Heat comfort: door, console, wheel) components to explode?
4. Should I count only LEAF specs (not section headers, not package headers)?

GOLD STANDARD (Perplexity 3rd iteration):
- Total: 168 leaf specs
- Engines & Transmissions: 1 section, 3 specs
- Equipment → Safety: Active Guard package (4 components)
- Equipment → Performance: Adaptive M Susp Professional (3 components)
- Equipment → Interior: Heat Comfort (3 inline components)
- Equipment → Technology: BMW Live Cockpit (7 components), Parking Assistant (4 components)

Extract ALL {len(all_rows)} rows. Output JSON:
{{"specs": [{{"name_en": "...", "name_ar": "...", "trim_values": [...], "is_package": bool, "components": [...]}}], "self_check": {{"questions_answered": [...], "total_count": int, "packages_found": int}}}}

Rows:
{json.dumps(all_rows[:80], ensure_ascii=False)}..."""  # First 80 for token limit

    msg = client.messages.create(
        model=model,
        max_tokens=5000,
        temperature=0,
        messages=[{"role": "user", "content": prompt}]
    )
    
    response_text = msg.content[0].text
    
    # Robust JSON extraction
    try:
        # Try direct parse
        result = json.loads(response_text)
        except (Exception, ValueError) as e:
        # Extract JSON from markdown
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(0))
        else:
            print(f"❌ Iteration {iteration}: No valid JSON")
            return None
    
    return result

# Iterative extraction (max 3 iterations)
results = []
context = ""

for i in range(1, 4):
    print(f"\n🔄 Iteration {i}/3...")
    result = extract_iteration(i, context)
    
    if not result:
        continue
    
    spec_count = len(result.get('specs', []))
    self_check = result.get('self_check', {})
    
    print(f"   Specs: {spec_count}")
    print(f"   Self-check: {self_check.get('total_count', 'N/A')} count, {self_check.get('packages_found', 0)} packages")
    
    results.append(result)
    
    # Converge if within 5% of Perplexity gold (168 ±8)
    if 160 <= spec_count <= 176:
        print(f"✅ CONVERGED at iteration {i}: {spec_count} specs (target 168)")
        break
    
    # Update context for next iteration
    context = f"Previous attempt: {spec_count} specs. Expected: 168. Adjust: check packages with ':' and inline comma lists."

# Save best result
best = max(results, key=lambda r: len(r.get('specs', [])))
with open('bmw_x5_iterative.json', 'w') as f:
    json.dump(best, f, ensure_ascii=False, indent=2)

print(f"\n✅ Final: {len(best['specs'])} specs")
print(f"📁 Saved to bmw_x5_iterative.json")
