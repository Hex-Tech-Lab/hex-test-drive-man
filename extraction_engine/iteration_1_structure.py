#!/usr/bin/env python3
import json
import pdfplumber
from pathlib import Path

def explore_structure(pdf_path):
    """Iteration 1: Discover page/table/row/cell structure"""
    
    structure = {
        'pdf': str(pdf_path),
        'pages': [],
        'total_tables': 0,
        'total_rows': 0,
        'structure_map': []
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            page_data = {
                'page_num': page_num,
                'width': page.width,
                'height': page.height,
                'tables': []
            }
            
            # Extract tables with positional data
            tables = page.extract_tables()
            
            for table_idx, table in enumerate(tables, 1):
                table_structure = {
                    'table_id': f'p{page_num}_t{table_idx}',
                    'row_count': len(table),
                    'col_count': len(table[0]) if table else 0,
                    'rows': []
                }
                
                # Analyze each row's structure
                for row_idx, row in enumerate(table):
                    row_structure = {
                        'row_id': f'p{page_num}_t{table_idx}_r{row_idx}',
                        'cell_count': len(row),
                        'cells': [],
                        'grouping_candidate': None,
                        'is_header': row_idx == 0
                    }
                    
                    for cell_idx, cell in enumerate(row):
                        cell_structure = {
                            'cell_id': f'p{page_num}_t{table_idx}_r{row_idx}_c{cell_idx}',
                            'content': str(cell).strip() if cell else '',
                            'is_empty': not cell or str(cell).strip() == '',
                            'char_count': len(str(cell)) if cell else 0,
                            'col_index': cell_idx
                        }
                        row_structure['cells'].append(cell_structure)
                    
                    # Detect grouping candidates
                    first_cell = row_structure['cells'][0]['content'].lower()
                    if any(keyword in first_cell for keyword in ['engines', 'equipment', 'safety', 'performance', 'exterior', 'interior', 'technology']):
                        row_structure['grouping_candidate'] = 'section_header'
                    elif ':' in first_cell:
                        row_structure['grouping_candidate'] = 'package_header'
                    elif row_structure['is_header']:
                        row_structure['grouping_candidate'] = 'table_header'
                    else:
                        row_structure['grouping_candidate'] = 'content_row'
                    
                    table_structure['rows'].append(row_structure)
                
                page_data['tables'].append(table_structure)
                structure['total_tables'] += 1
                structure['total_rows'] += len(table)
            
            structure['pages'].append(page_data)
    
    # Build structure map for hierarchy
    for page in structure['pages']:
        for table in page['tables']:
            for row in table['rows']:
                structure['structure_map'].append({
                    'id': row['row_id'],
                    'grouping': row['grouping_candidate'],
                    'cell_count': row['cell_count'],
                    'first_cell_preview': row['cells'][0]['content'][:50] if row['cells'] else ''
                })
    
    return structure

# Execute
pdf_path = 'bmw_x5_page15_specs.pdf'
structure = explore_structure(pdf_path)

# Save
with open('iteration_1_structure.json', 'w', encoding='utf-8') as f:
    json.dump(structure, f, ensure_ascii=False, indent=2)

# Summary
print("🔍 ITERATION 1: STRUCTURE EXPLORATION")
print(f"   Pages: {len(structure['pages'])}")
print(f"   Tables: {structure['total_tables']}")
print(f"   Rows: {structure['total_rows']}")
print("\n📊 Grouping Candidates Detected:")

grouping_counts = {}
for item in structure['structure_map']:
    grouping_counts[item['grouping']] = grouping_counts.get(item['grouping'], 0) + 1

for group, count in sorted(grouping_counts.items()):
    print(f"   {group}: {count}")

print(f"\n✅ Structure map saved to iteration_1_structure.json")
