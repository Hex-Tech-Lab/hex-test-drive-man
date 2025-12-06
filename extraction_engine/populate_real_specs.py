#!/usr/bin/env python3
import json

with open('x5_full_hierarchy.json') as f:
    hierarchy = json.load(f)
with open('bmw_x5_raw_tables.json') as f:
    raw_tables = json.load(f)
with open('bmw_x5_production.json') as f:
    production = json.load(f)

# SAFER population - respect actual row counts
spec_idx = 0
for table_idx, table in enumerate(hierarchy['tables']):
    if table_idx >= len(raw_tables['tables']):
        break
        
    raw_table = raw_tables['tables'][table_idx]['rows'][1:]  # Skip header
    
    cumulative_rows = 0
    for section in table['hierarchy']:
        section_rows = section.get('row_count', 0)
        
        # Populate section rows from raw table
        for row_offset in range(min(section_rows, len(raw_table) - cumulative_rows)):
            raw_row_idx = cumulative_rows + row_offset
            if raw_row_idx < len(raw_table) and spec_idx < len(production['specs']):
                raw_row = raw_table[raw_row_idx]
                production['specs'][spec_idx]['name_en'] = raw_row[0] or ''
                production['specs'][spec_idx]['name_ar'] = raw_row[3] or ''
                production['specs'][spec_idx]['trim_values'] = [
                    raw_row[1] or '', raw_row[2] or ''
                ]
                spec_idx += 1
        
        cumulative_rows += section_rows

with open('bmw_x5_final.json', 'w', encoding='utf-8') as f:
    json.dump(production, f, ensure_ascii=False, indent=2)

print(f"✅ Populated {spec_idx} real specs from {len(raw_tables['tables'])} tables")
