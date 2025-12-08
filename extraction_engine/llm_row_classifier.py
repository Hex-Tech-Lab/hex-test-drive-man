#!/usr/bin/env python3
import anthropic
import json

client = anthropic.Anthropic()
model = "claude-sonnet-4-5-20250929"

with open('bmw_x5_raw_tables.json') as f:
    raw_data = json.load(f)

# Flatten all tables (skip headers)
all_rows = []
for table_idx, table in enumerate(raw_data['tables']):
    for row_idx, row in enumerate(table['rows'][1:], 1):
        all_rows.append({
            "global_index": len(all_rows) + 1,
            "table_id": table_idx + 1,
            "row_index": row_idx,
            "name_en": row[0] or '',
            "trim1": row[1] or '',
            "trim2": row[2] or '',
            "name_ar": row[3] or ''
        })

# Batch first 50 rows (token limit)
batch = all_rows[:50]

tools = [{
    "name": "classify_rows",
    "input_schema": {
        "type": "object",
        "properties": {
            "classifications": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "global_index": {"type": "integer"},
                        "classification": {
                            "type": "string",
                            "enum": ["section_header", "system", "spec_row", "noise"]
                        },
                        "confidence": {"type": "number"},
                        "reason": {"type": "string"}
                    },
                    "required": ["global_index", "classification", "confidence"]
                }
            }
        }
    }
}]

msg = client.messages.create(
    model=model,
    max_tokens=2000,
    tools=tools,
    tool_choice={"type": "tool", "name": "classify_rows"},
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": f"""BMW X5 specs table rows. Classify each as:

section_header: Section/subsection titles (Equipment, Safety, Interior)
system: Feature packages w/ components (Active Guard, BMW Live Cockpit Professional)  
spec_row: Individual specs w/ ✓/– trim values (xDrive, ABS)
noise: Empty, placeholders, table artifacts

First 50 rows:
{json.dumps(batch, indent=2, ensure_ascii=False)}"""
            }
        ]
    }]
)

classifications = msg.content[-1].input['classifications']
with open('row_classification.json', 'w') as f:
    json.dump(classifications, f, indent=2, ensure_ascii=False)

print(f"✅ Classified {len(classifications)} rows")
print(json.dumps(classifications[:10], indent=2, ensure_ascii=False))
