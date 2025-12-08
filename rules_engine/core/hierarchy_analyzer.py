#!/usr/bin/env python3
import json
from typing import Dict, Any

def analyze_hierarchy(extraction_path: str) -> Dict[str, Any]:
    with open(extraction_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # NEW: Hierarchy metrics
    sections_l1 = len([s for s in data['specs'] if s.get('row_type') == 'section_header' and s.get('level') == 1])
    sections_l2 = len([s for s in data['specs'] if s.get('row_type') == 'section_header' and s.get('level') == 2])
    systems = len([s for s in data['specs'] if s.get('row_type') == 'system'])
    
    total_hierarchical = sections_l1 + sections_l2 + systems
    coverage = (total_hierarchical / len(data['specs'])) * 100
    
    return {
        'status': 'PASS' if coverage > 70 else 'FAIL',
        'coverage': coverage,
        'hierarchy_score': total_hierarchical,
        'l1_sections': sections_l1,
        'l2_sections': sections_l2,
        'systems_detected': systems,
        'total_rows': len(data['specs'])
    }

if __name__ == "__main__":
    import sys
    result = analyze_hierarchy(sys.argv[1])
    print(json.dumps(result, indent=2))
