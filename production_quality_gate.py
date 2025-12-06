#!/usr/bin/env python3
import json

def production_gate(classification_path):
    with open(classification_path) as f:
        data = json.load(f)
    
    l1 = sum(1 for r in data if r.get('hierarchy_level') == 'l1_section')
    l2 = sum(1 for r in data if r.get('hierarchy_level') == 'l2_subsection')
    packages = sum(1 for r in data if r.get('hierarchy_level') == 'package')
    specs = sum(1 for r in data if r.get('hierarchy_level') == 'spec_row')
    
    # BMW X5 benchmark: 5% L1/L2 + 3% packages + 90% specs
    structural = (l1 + l2 + packages) / len(data) * 100
    spec_density = specs / len(data) * 100
    
    overall = (structural * 0.4) + (spec_density * 0.6)
    
    return {
        'status': 'PASS' if overall > 85 else 'FAIL',
        'overall_coverage': round(overall, 1),
        'structural_coverage': round(structural, 1),
        'spec_density': round(spec_density, 1),
        'l1_sections': l1,
        'l2_subsections': l2,
        'packages': packages,
        'spec_rows': specs,
        'total_rows': len(data),
        'confidence_avg': round(sum(r.get('confidence', 0) for r in data) / len(data), 2)
    }

print(json.dumps(production_gate('refined_classification.json'), indent=2))
