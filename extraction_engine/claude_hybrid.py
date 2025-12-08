#!/usr/bin/env python3
import anthropic
import json
from table_cropper import crop_tables

client = anthropic.Anthropic()
model = "claude-sonnet-4-5-20250929"

# Load crops + raw tables
crops = json.load(open('table_crops.json'))
with open('bmw_x5_raw_tables.json') as f:
    raw_tables = json.load(f)

tools = [{"name": "parse_hierarchy", "input_schema": {
    "type": "object",
    "properties": {
        "tables": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "table_id": {"type": "integer"},
                    "table_type": {"type": "string", "enum": ["Specifications", "TechnicalData"]},
                    "is_continuation": {"type": "boolean"},
                    "hierarchy": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "level": {"type": "integer", "enum": [1,2]},
                                "color": {"type": "string"},
                                "name_en": {"type": "string"},
                                "name_ar": {"type": "string"},
                                "row_start": {"type": "integer"},
                                "row_count": {"type": "integer"},
                                "systems": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name_en": {"type": "string"},
                                            "components": {"type": "integer"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}}]

content = [
    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": crops['full_page_150dpi']}},
]

for crop in crops['table_crops_300dpi']:
    content.append({"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": crop['image_b64']}})

content.append({
    "type": "text",
    "text": f"""BMW X5 page 15 - 3 tables. Full page (layout/colors) + 300DPI crops + raw tables.

Images: 1=full 150DPI, 2-4=table crops 300DPI
Tables: {json.dumps(raw_tables['tables'][:3], indent=2)}

Parse hierarchy:
- Table 1+2 = Specifications continuum? (maroon headers)
- Table 3 = Technical Data (gold header)
- L1=dark blue, L2=blue headers
- Systems: Active Guard (4 comp), BMW Live Cockpit (7 comp), Parking Assistant (4 comp)

Output table-by-table hierarchy."""
})

msg = client.messages.create(
    model=model,
    max_tokens=3000,
    tools=tools,
    tool_choice={"type": "tool", "name": "parse_hierarchy"},
    messages=[{"role": "user", "content": content}]
)

hierarchy = msg.content[-1].input
with open('x5_full_hierarchy.json', 'w') as f:
    json.dump(hierarchy, f, indent=2)

print(json.dumps(hierarchy, indent=2))
