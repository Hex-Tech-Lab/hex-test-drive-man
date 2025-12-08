#!/usr/bin/env python3
import anthropic
import json

client = anthropic.Anthropic()
model = "claude-sonnet-4-5-20250929"

with open('bmw_x5_raw_tables.json') as f:
    raw_data = json.load(f)

# Get ALL rows from all 3 tables
all_rows = []
for table_idx, table in enumerate(raw_data['tables']):
    for row_idx, row in enumerate(table['rows'][1:], 1):
        all_rows.append({
            "idx": len(all_rows) + 1,
            "en": row[0].strip(),
            "trim1": row[1].strip(),
            "trim2": row[2].strip(),
            "ar": row[3].strip()
        })

print(f"Processing ALL {len(all_rows)} rows...")

# Batch process: 60 rows per call (3 batches for 121 rows)
all_specs = []
batch_size = 60

for batch_start in range(0, len(all_rows), batch_size):
    batch = all_rows[batch_start:batch_start + batch_size]
    
    msg = client.messages.create(
        model=model,
        max_tokens=4000,
        temperature=0,
        messages=[{
            "role": "user",
            "content": f"""BMW X5 Page 15 - Extract EVERY spec.

Hierarchy rules (from Perplexity gold standard):
- L1: "Engines & Transmissions" (3 specs), "Equipment" (parent)
- L2 under Equipment: Safety, Performance, Exterior, Interior, Technology, Others
- Packages (explode components): Active Guard (4), Adaptive M Susp Professional (3), Heat Comfort (3), BMW Live Cockpit Professional (7), Parking Assistant Plus (4)

Output JSON array:
[{{"name_en": "...", "name_ar": "...", "trim_values": ["✓","–"], "is_package": bool, "components": [...]}}]

Rows {batch_start+1}-{batch_start+len(batch)}:
{json.dumps(batch, ensure_ascii=False)}"""
        }]
    )
    
    batch_specs = json.loads(msg.content[0].text)
    all_specs.extend(batch_specs)
    print(f"  Batch {batch_start//batch_size + 1}: {len(batch_specs)} specs")

with open('bmw_x5_complete.json', 'w') as f:
    json.dump({'total': len(all_specs), 'specs': all_specs}, f, ensure_ascii=False, indent=2)

print(f"✅ Complete extraction: {len(all_specs)} specs")
