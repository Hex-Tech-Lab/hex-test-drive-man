import json
with open('bmw_x5_raw_tables.json') as f:
    data = json.load(f)

specs = {
    'source_pdf': 'X5_LCI_2025.pdf',
    'extraction_method': 'pdfplumber+haiku',
    'total_specs': 0,
    'specs': []
}

for table in data['tables']:
    for i, row in enumerate(table['rows']):
        if i == 0: continue  # Skip header
        specs['specs'].append({
            'name_en': row[0] or '',
            'name_ar': row[3] or '',
            'trim_values': [row[1] or '', row[2] or ''],
            'row_type': 'spec_row'
        })

with open('bmw_x5_schema_ready.json', 'w', encoding='utf-8') as f:
    json.dump(specs, f, ensure_ascii=False, indent=2)

print(f"✅ Schema ready: {len(specs['specs'])} rows")
