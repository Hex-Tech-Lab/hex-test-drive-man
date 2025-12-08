"""LLM-powered table parser."""
import json
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

PARSING_PROMPT = """Parse this BMW spec table. Return ONLY valid JSON with this exact structure:
{"specs": [{"name_en": "...", "name_ar": "...", "section": "...", "trim_values": ["...", "..."], "row_type": "section_header|spec_row"}]}

Rules:
- Section headers have empty trim columns (row_type: "section_header")
- Spec rows have values/checkmarks (row_type: "spec_row")
- Empty string or "○" in trim columns means standard equipment (use empty string "")
- Split merged cells into separate specs
- Column order: [English, Trim1, Trim2, Arabic]
- Return ONLY the JSON object, no markdown, no explanation"""

def parse_table_with_llm(raw_tables_file: str, output_file: str):
    print(f"Parsing: {raw_tables_file}")
    print("="*80)
    
    with open(raw_tables_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    table_json = json.dumps(raw_data['tables'], indent=2, ensure_ascii=False)
    full_prompt = PARSING_PROMPT + "\n\n" + table_json
    
    print(f"Sending {len(raw_data['tables'])} tables to Claude...")
    print(f"Prompt size: {len(full_prompt)} chars")
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("\n❌ ERROR: ANTHROPIC_API_KEY not found!")
        return None
    
    client = anthropic.Anthropic(api_key=api_key)
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=16000,
        messages=[{"role": "user", "content": full_prompt}]
    )
    
    response_text = message.content[0].text.strip()
    
    # Save raw response for debugging
    with open('debug_llm_response.txt', 'w', encoding='utf-8') as f:
        f.write(response_text)
    print(f"✓ Saved raw LLM response to debug_llm_response.txt ({len(response_text)} chars)")
    
    # Extract JSON from markdown
    marker = chr(96)*3
    if marker in response_text:
        parts = response_text.split(marker)
        for part in parts:
            clean = part.strip()
            if clean.startswith('json'):
                response_text = clean[4:].strip()
                break
            elif clean.startswith('{'):
                response_text = clean
                break
    
    # Try to parse
    try:
        parsed_data = json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON Parse Error: {e}")
        print(f"Error at line {e.lineno}, column {e.colno}")
        print(f"\nShowing context around error:")
        lines = response_text.split('\n')
        start = max(0, e.lineno - 3)
        end = min(len(lines), e.lineno + 2)
        for i in range(start, end):
            marker = ">>>" if i == e.lineno - 1 else "   "
            print(f"{marker} {i+1:3d}: {lines[i][:100]}")
        return None
    
    parsed_data['source_pdf'] = raw_data['source_pdf']
    parsed_data['extraction_method'] = 'llm_parsed_pdfplumber'
    parsed_data['total_specs'] = len(parsed_data['specs'])
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(parsed_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Parsed {parsed_data['total_specs']} specs")
    print(f"✓ Saved to: {output_file}")
    
    return parsed_data


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python llm_table_parser.py <raw_tables.json> [output.json]")
        sys.exit(1)
    
    raw_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else raw_file.replace('_raw_tables.json', '_llm_parsed.json')
    
    parse_table_with_llm(raw_file, output_file)
