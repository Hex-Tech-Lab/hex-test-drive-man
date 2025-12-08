#!/usr/bin/env python3
import json
from collections import defaultdict

def load_raw_tables():
    with open('bmw_x5_raw_tables.json') as f:
        return json.load(f)['tables']

def extract_perplexity_style(raw_tables):
    all_rows = []
    for table in raw_tables:
        for row in table['rows'][1:]:
            all_rows.append({
                'en': row[0].strip(),
                'ar': row[3].strip() if len(row) > 3 else '',
                'trims': [row[1].strip(), row[2].strip()]
            })
    
    # Perplexity 3-iteration logic
    sections = defaultdict(list)
    current_section = "Uncategorized"
    
    section_keywords = {
        'engines': 'Engines & Transmissions',
        'transmission': 'Engines & Transmissions',
        'equipment': 'Equipment',
        'safety': 'Safety',
        'performance': 'Performance', 
        'exterior': 'Exterior',
        'interior': 'Interior',
        'technology': 'Technology',
        'technical': 'Technical Data'
    }
    
    for row in all_rows:
        text = row['en'].lower()
        
        # Exact section detection
        for keyword, section_name in section_keywords.items():
            if keyword in text:
                current_section = section_name
                break
        
        sections[current_section].append(row)
    
    # Package explosion (colon detection)
    specs = []
    for section, rows in sections.items():
        i = 0
        while i < len(rows):
            row = rows[i]
            
            if ':' in row['en'] and i+1 < len(rows):
                # Package: collect next rows as components
                pkg_name = row['en'].split(':')[0].strip()
                j = i + 1
                while (j < len(rows) and 
                       ':' not in rows[j]['en'] and 
                       not any(k in rows[j]['en'].lower() for k in section_keywords)):
                    specs.append({
                        'section': section,
                        'package': pkg_name,
                        'en': rows[j]['en'],
                        'ar': rows[j]['ar'],
                        'trims': rows[j]['trims']
                    })
                    j += 1
                i = j
            else:
                specs.append({
                    'section': section,
                    'package': None,
                    'en': row['en'],
                    'ar': row['ar'],
                    'trims': row['trims']
                })
                i += 1
    
    return specs

tables = load_raw_tables()
specs = extract_perplexity_style(tables)

result = {
    'total_specs': len(specs),
    'target': 168,
    'coverage': round(len(specs)/168*100, 1),
    'breakdown': defaultdict(int)
}

for spec in specs:
    result['breakdown'][spec['section']] += 1

with open('perplexity_auto.json', 'w') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"✅ {len(specs)} specs ({result['coverage']}%)")
print(json.dumps(dict(result['breakdown']), indent=2))
