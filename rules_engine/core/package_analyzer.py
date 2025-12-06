#!/usr/bin/env python3
import json
from collections import Counter

def analyze_packages(classification_path):
    with open(classification_path) as f:
        classifications = json.load(f)
    
    # Package hierarchy metrics
    l1_count = sum(1 for c in classifications if c.get('hierarchy_level') == 'l1_section')
    l2_count = sum(1 for c in classifications if c.get('hierarchy_level') == 'l2_subsection')
    package_count = sum(1 for c in classifications if c.get('hierarchy_level') == 'package')
    spec_count = sum(1 for c in classifications if c.get('hierarchy_level') == 'spec_row')
    
    structural_score = (l1_count + l2_count + package_count) / len(classifications) * 100
    
    status = 'PASS' if structural_score > 25 else 'FAIL'
    
    return {
        'status': status,
        'structural_coverage': round(structural_score, 1),
        'l1_sections': l1_count,
        'l2_subsections': l2_count,
        'packages_detected': package_count,
        'spec_rows': spec_count,
        'total_rows': len(classifications)
    }

if __name__ == "__main__":
    import sys
    result = analyze_packages(sys.argv[1])
    print(json.dumps(result, indent=2))
