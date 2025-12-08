#!/usr/bin/env python3
import anthropic
import json
import pdfplumber
import base64
import io

client = anthropic.Anthropic()

with pdfplumber.open('bmw_x5_page15_specs.pdf') as pdf:
    page = pdf.pages[0]
    img = page.to_image(resolution=150)
    buf = io.BytesIO()
    img.original.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

# STRICT JSON TOOL
tools = [{
    "name": "analyze_layout",
    "description": "Analyze BMW spec table layout",
    "input_schema": {
        "type": "object",
        "properties": {
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "row_start": {"type": "integer"},
                        "row_count": {"type": "integer"}
                    },
                    "required": ["name", "row_start", "row_count"]
                }
            },
            "total_rows": {"type": "integer"}
        },
        "required": ["sections", "total_rows"]
    }
}]

msg = client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=1000,
    tools=tools,
    tool_choice={"type": "tool", "name": "analyze_layout"},
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {"type": "base64", "media_type": "image/png", "data": img_b64}
            },
            {
                "type": "text",
                "text": "BMW X5 EN/AR specs. Find sections (Engines, Interior, Safety). Return row ranges."
            }
        ]
    }]
)

# Extract tool result
if msg.stop_reason == "tool_use":
    tool_result = msg.content[-1].input
    print(f"✅ HAIKU LAYOUT: {json.dumps(tool_result, indent=2)}")
    
    with open('haiku_layout.json', 'w') as f:
        json.dump(tool_result, f, indent=2)
else:
    print(f"❌ Claude failed: {msg.content[0].text}")

