#!/usr/bin/env python3
import anthropic
import json
import re

client = anthropic.Anthropic()
model = "claude-sonnet-4-5-20250929"

with open('bmw_x5_raw_tables.json') as f:
    raw_data = json.load(f)

# ALL 115 rows (exclude headers)
all_rows = []
for table in raw_data['tables']:
    for row in table['rows'][1:]:
        all_rows.append({
            "en": row[0] or '',
            "ar": row[3] or '',
            "trims": [row[1] or '', row[2] or '']
        })

print(f"📊 {len(all_rows)} rows ready")

def perplexity_prompt_1():
    """Iteration 1: Basic listing"""
    return f"""List ALL sections, subsections, spec data points from BMW X5 page 15 table.

English LEFT column, Arabic RIGHT column (exact text).

Sections → subsections → specs hierarchy.
Total leaf-level spec count (exclude sections).

Rows:
{json.dumps(all_rows[:60], ensure_ascii=False)}"""

def perplexity_prompt_2(feedback):
    """Iteration 2: Fix hierarchy"""
    return f"""FIXED hierarchy:
1. 'Engines & Transmissions' = ONE section (3 specs)
2. 'Equipment' = parent → Safety/Performance/Exterior (L2 subsections)
3. Packages w/ ':' explode components (Active Guard → 4 specs)

Previous feedback: {feedback}

Extract again:
{json.dumps(all_rows[:60], ensure_ascii=False)}"""

def perplexity_prompt_3(feedback):
    """Iteration 3: Perfect extraction"""
    return f"""PERFECT extraction (168 specs total):
- Engines & Transmissions: 3 specs ✓
- Equipment → Safety: Active Guard package (4 components exploded)
- Performance: Adaptive M Suspension Professional (3 components)
- Interior: Heat Comfort package (3 inline: door/center/steering heated)
- Technology: BMW Live Cockpit (7), Parking Assistant (4)

Previous: {feedback}

FINAL JSON specs list (leaf-level only):
{{"specs": [{{"en": "...", "ar": "...", "trims": ["✓","-"]}}]}}

Rows:
{json.dumps(all_rows, ensure_ascii=False)}"""

# 3 iterations like Perplexity
results = []
feedback = ""

for i, prompt_func in enumerate([perplexity_prompt_1, perplexity_prompt_2, perplexity_prompt_3], 1):
    print(f"\n🔄 Perplexity Iteration {i}/3")
    
    prompt = prompt_func(feedback)
    msg = client.messages.create(
        model=model,
        max_tokens=8000,
        temperature=0,
        messages=[{"role": "user", "content": prompt}]
    )
    
    response = msg.content[0].text
    print(f"Response preview: {response[:200]}...")
    
    # Robust JSON extraction
    json_match = re.search(r'\{.*\}', response, re.DOTALL | re.MULTILINE)
    if json_match:
        try:
            result = json.loads(json_match.group(0))
            specs_count = len(result.get('specs', []))
            print(f"✅ Iteration {i}: {specs_count} specs")
            results.append(result)
            
            # Feedback for next iteration
            feedback = f"Iteration {i}: {specs_count} specs. Target: 168"
            
            if specs_count >= 160:
                break
                
        except Exception as e:
            print(f"❌ JSON parse error: {e}")
    else:
        print(f"❌ No JSON in response")

# Save best result
if results:
    best = max(results, key=lambda r: len(r.get('specs', [])))
    with open('perplexity_replica.json', 'w') as f:
        json.dump(best, f, ensure_ascii=False, indent=2)
    print(f"\n🎉 Final: {len(best.get('specs', []))} specs ✓")
else:
    print("❌ All iterations failed")

