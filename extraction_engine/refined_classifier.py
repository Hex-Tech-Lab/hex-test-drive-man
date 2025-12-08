#!/usr/bin/env python3
import anthropic
import json
import re

client = anthropic.Anthropic()
model = "claude-sonnet-4-5-20250929"

with open('bmw_x5_raw_tables.json') as f:
    raw_data = json.load(f)

all_rows = []
for table_idx, table in enumerate(raw_data['tables']):
    for row_idx, row in enumerate(table['rows'][1:], 1):
        all_rows.append({
            "global_index": len(all_rows) + 1,
            "name_en": row[0] or '',
            "trim1": row[1] or '',
            "trim2": row[2] or '',
            "name_ar": row[3] or ''
        })

batch = all_rows[:40]

msg = client.messages.create(
    model=model,
    max_tokens=2500,
    temperature=0.1,
    messages=[{
        "role": "user",
        "content": f"""BMW X5 specs - REFINED CLASSIFICATION for first 40 rows.

NEW CATEGORIES:
1. l1_section: Top-level (Equipment, Engines & Transmissions)
2. l2_subsection: Under L1 (Safety, Performance under Equipment)
3. package: Feature packages (Active Guard, BMW Live Cockpit Professional) 
   - Split: "Active Guard: Lane Departure" → package="Active Guard", component="Lane Departure"
4. spec_row: Atomic specs (xDrive, ABS)
5. noise: Empty/artifacts

Output JSON list:
{{
  "global_index": N,
  "hierarchy_level": "l1_section" | "l2_subsection" | "package" | "spec_row" | "noise",
  "confidence": 0.0-1.0,
  "package_name": "Active Guard" (if package),
  "component_name": "Lane Departure Warning" (if package component),
  "reason": "explanation"
}}

Examples:
- "Equipment" → l1_section
- "Safety" → l2_subsection (under Equipment)
- "Active Guard: Lane Departure Warning..." → package="Active Guard", component_name="Lane Departure Warning"

Rows:
{json.dumps(batch, indent=2, ensure_ascii=False)}"""
    }]
)

response_text = msg.content[0].text
print("Raw response preview:")
print(response_text[:800])

# Robust JSON extraction
json_objects = []
json_match = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
for match in json_match:
    try:
        obj = json.loads(match)
        if 'global_index' in obj:
            json_objects.append(obj)
    except:
        continue

print(f"✅ Parsed {len(json_objects)} classifications")

with open('refined_classification.json', 'w') as f:
    json.dump(json_objects, f, indent=2, ensure_ascii=False)

print("\nFirst 10 classifications:")
print(json.dumps(json_objects[:10], indent=2, ensure_ascii=False))
