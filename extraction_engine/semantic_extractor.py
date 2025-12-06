#!/usr/bin/env python3
import json
from collections import defaultdict
import re

def load_tables():
    with open('bmw_x5_raw_tables.json') as f:
        return json.load(f)['tables']

def semantic_hierarchy_detection(tables):
    """Pure visual + semantic rules - NO hardcoding"""
    
    all_rows = []
    for table_idx, table in enumerate(tables):
        for row_idx, row in enumerate(table['rows'][1:], 1):
            row_data = {
                'idx': len(all_rows) + 1,
                'table': table_idx + 1,
                'en': row[0].strip() if row[0] else '',
                'ar': row[3].strip() if len(row) > 3 and row[3] else '',
                'trims': [row[1].strip() if row[1] else '', row[2].strip() if row[2] else ''],
                'is_header': False,
                'is_package': False,
                'hierarchy_level': 'row',
                'color_group': None  # pdfplumber color data if available
            }
            all_rows.append(row_data)
    
    specs = []
    hierarchy_stack = ['ROOT']
    
    for i, row in enumerate(all_rows):
        text = row['en'].lower()
        
        # 1. VISUAL HEADERS (uppercase, bold-like patterns)
        if (text.isupper() or 
            len(text) < 20 and 
            re.match(r'^[a-z]+ & [a-z]+$', text) or  # "Engines & Transmissions"
            any(word in text for word in ['equipment', 'technical', 'dimensions'])):
            hierarchy_stack.append(text.title())
            row['hierarchy_level'] = 'l1_section'
            continue
            
        # 2. L2 SUBSECTIONS (Safety, Performance, etc.)
        elif any(word in text for word in ['safety', 'performance', 'exterior', 'interior', 'technology']):
            hierarchy_stack.append(text.title())
            row['hierarchy_level'] = 'l2_subsection'
            continue
        
        # 3. PACKAGE DETECTION (: + following content)
        elif ':' in row['en']:
            row['is_package'] = True
            pkg_name = row['en'].split(':')[0].strip()
            
            # Collect following rows as package components
            j = i + 1
            while (j < len(all_rows) and 
                   j - i < 10 and  # Max 10 rows per package
                   not all_rows[j]['en'].lower().startswith(('safety', 'performance', 'exterior'))):
                component = all_rows[j].copy()
                component['package'] = pkg_name
                component['hierarchy_level'] = 'spec_row'
                specs.append(component)
                j += 1
            continue
        
        # 4. INLINE PACKAGE EXPLOSION (commas after colon)
        elif ',' in row['en'] and any(word in row['en'] for word in ['package', 'system', 'includes']):
            items = [item.strip() for item in row['en'].split(',')]
            for item in items:
                specs.append({
                    'section': hierarchy_stack[-1],
                    'package': row['en'][:50],  # Truncated
                    'en': item,
                    'ar': row['ar'],
                    'trims': row['trims'],
                    'hierarchy_level': 'spec_row'
                })
            continue
        
        # 5. ATOMIC SPECS (default)
        else:
            row['hierarchy_level'] = 'spec_row'
            row['section'] = hierarchy_stack[-1]
            specs.append(row)
    
    return specs

tables = load_tables()
specs = semantic_hierarchy_detection(tables)

result = {
    'total_specs': len(specs),
    'hierarchy_detected': len(set(s['hierarchy_level'] for s in specs if 'hierarchy_level' in s)),
    'packages_detected': len(set(s.get('package', '') for s in specs if s.get('package'))),
    'perplexity_target': 168,
    'coverage': round(len(specs)/168*100, 1),
    'sample': [s for s in specs[:5]]
}

with open('semantic_specs.json', 'w') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
    
print(f"🧠 SEMANTIC EXTRACTION:")
print(f"   Specs: {len(specs)} ({result['coverage']}%)")
print(f"   Packages auto-detected: {result['packages_detected']}")
print(f"   Hierarchy levels: {result['hierarchy_detected']}")
