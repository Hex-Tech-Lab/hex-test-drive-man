#!/usr/bin/env python3
import sys
import json
import subprocess
import os
from pathlib import Path

def run_production_pipeline(pdf_path):
    print(f"🚀 Processing {pdf_path}")
    
    # 1. Extract spec page (pdf_analyzer)
    print("1. Finding spec pages...")
    
    # 2. Table crops + classification
    print("2. Cropping tables...")
    subprocess.run(["python3", "extraction_engine/table_cropper.py", pdf_path])
    
    print("3. Sonnet 4.5 classification...")
    subprocess.run(["python3", "extraction_engine/refined_classifier.py"])
    
    # 4. Final quality gate
    print("4. Production validation...")
    result = subprocess.run(["python3", "final_production_gate.py"], 
                          capture_output=True, text=True)
    
    gate_result = json.loads(result.stdout)
    
    if gate_result['status'] == 'PASS':
        print(f"✅ PRODUCTION PASS: {gate_result['overall_coverage']}%")
        print(f"   Specs: {gate_result['bmw_benchmark']['spec_density']}%")
        return True
    else:
        print(f"❌ FAIL: {gate_result['overall_coverage']}%")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 cli/production.py <brochure.pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    success = run_production_pipeline(pdf_path)
    sys.exit(0 if success else 1)
