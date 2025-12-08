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

# First 30 rows only (token safe)
batch = all_rows[:30]

msg = client.messages.create(
    model=model,
    max_tokens=2000,
    temperature=0.1,
    messages=[{
        "role": "user",
        "content": f"""Classify these BMW X5 spec table rows (first 30). 

For each row output JSON object:
{{
  "global_index": ROW_NUMBER,
  "classification": "section_header" | "system" | "spec_row" | "noise",
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}}

Rules:
- section_header: "Engines & Transmissions", "Equipment", "Safety", "Interior" 
- system: "Active Guard", "BMW Live Cockpit Professional", "Parking Assistant Plus"
- spec_row: engine specs, "xDrive", "ABS", specs w/ ✓/– trims
- noise: empty, "Spec \\d+", artifacts

Rows:
{json.dumps(batch, indent=2, ensure_ascii=False)}"""
    }]
)

# Robust parsing - handles tool failure
response_text = msg.content[0].text
print("Raw Claude response:")
print(response_text[:500] + "..." if len(response_text) > 500 else response_text)

# Extract JSON objects with regex fallback
json_objects = []
json_match = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text)
for match in json_match:
    try:
        obj = json.loads(match)
        if 'global_index' in obj and 'classification' in obj:
            json_objects.append(obj)
    except:
        pass

if json_objects:
    with open('row_classification.json', 'w') as f:
        json.dump(json_objects, f, indent=2, ensure_ascii=False)
    print(f"✅ Parsed {len(json_objects)} classifications")
else:
    print("❌ No valid JSON found - using fallback heuristics")

# Fallback: simple keyword rules
fallback_classifications = []
section_keywords = ["engines", "equipment", "safety", "performance", "exterior", "interior", "technology", "others", "trims", "upholstery", "wheels"]
system_keywords = ["active guard", "cockpit", "parking assistant", "harman kardon"]
for row in batch:
    name_lower = row['name_en'].lower()
    if any(k in name_lower for k in section_keywords):
        classification = "section_header"
    elif any(k in name_lower for k in system_keywords):
        classification = "system"
    elif row['name_en'].strip() and (row['trim1'] or row['trim2']):
        classification = "spec_row"
    else:
        classification = "noise"
    
    fallback_classifications.append({
        "global_index": row['global_index'],
        "classification": classification,
        "confidence": 0.8,
        "reason": f"Keyword: {name_lower[:30]}"
    })

with open('row_classification_fallback.json', 'w') as f:
    json.dump(fallback_classifications, f, indent=2)

print(f"✅ Fallback: {len(fallback_classifications)} rows classified")
print(json.dumps(fallback_classifications[:5], indent=2))
