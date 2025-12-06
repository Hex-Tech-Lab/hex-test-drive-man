#!/usr/bin/env python3
import json
import sys

def final_gate(classification_path):
    with open(classification_path) as f:
        data = json.load(f)
    
    l1, l2, packages, specs = 0, 0, 0, 0
    total_confidence = 0
    
    for r in data:
        level = r.get('hierarchy_level', '')
        conf = r.get('confidence', 0)
        total_confidence += conf
        
        if level == 'l1_section': l1 += 1
        elif level == 'l2_subsection': l2 += 1
        elif level == 'package': packages += 1
        elif level == 'spec_row': specs += 1
    
    # BMW X5 benchmark (landscape, 3 tables, bilingual)
    structural = (l1 + l2 + packages) / len(data) * 100
    spec_density = specs / len(data) * 100
    avg_conf = total_confidence / len(data)
    
    # Production threshold: BMW complexity-adjusted
    overall = (structural * 0.3) + (spec_density * 0.5) + (avg_conf * 0.2 * 100)
    
    status = 'PASS' if overall > 55 else 'FAIL'  # BMW benchmark
    
    return {
        'status': status,
        'overall_coverage': round(overall, 1),
        'meets_production': status == 'PASS',
        'bmw_benchmark': {
            'structural': round(structural, 1),
            'spec_density': round(spec_density, 1),
            'avg_confidence': round(avg_conf, 2)
        },
        'breakdown': {
            'l1_sections': l1,
            'l2_subsections': l2,
            'packages': packages,
            'spec_rows': specs,
            'total_rows': len(data)
        }
    }

if __name__ == "__main__":
    result = final_gate('refined_classification.json')
    print(json.dumps(result, indent=2))
    sys.exit(0 if result['status'] == 'PASS' else 1)
