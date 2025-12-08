#!/usr/bin/env python3
import json
from collections import Counter

def smart_analyze(extraction_path):
    with open(extraction_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    specs = data.get('specs', [])
    
    # 1. Structural completeness
    row_types = Counter(s.get('row_type', 'unknown') for s in specs)
    hierarchy_types = ['section_header', 'system']
    structural_coverage = sum(row_types[t] for t in hierarchy_types) / len(specs) * 100
    
    # 2. Completeness metrics
    has_hierarchy = any(s.get('level') for s in specs)
    has_bilingual = any(s.get('name_ar') for s in specs if s.get('name_ar'))
    has_trim_values = sum(1 for s in specs if s.get('trim_values'))
    
    # 3. Self-inferring coverage
    coverage = (
        structural_coverage * 0.4 +  # Hierarchy first
        (has_bilingual * 100 / len(specs)) * 0.3 +
        (has_trim_values / len(specs)) * 0.3
    )
    
    status = 'PASS' if coverage > 70 else 'FAIL'
    
    return {
        'status': status,
        'smart_coverage': round(coverage, 1),
        'structural_coverage': round(structural_coverage, 1),
        'row_types': dict(row_types),
        'has_hierarchy': has_hierarchy,
        'bilingual_ratio': round(sum(1 for s in specs if s.get('name_ar')) / len(specs) * 100, 1),
        'trim_complete': round(has_trim_values / len(specs) * 100, 1),
        'total_rows': len(specs)
    }

if __name__ == "__main__":
    import sys
    result = smart_analyze(sys.argv[1])
    print(json.dumps(result, indent=2))
