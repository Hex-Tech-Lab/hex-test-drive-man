#!/usr/bin/env python3
import json
import os
import glob

PRICING = {
    "models_gemini-2.0-flash-001": {"in": 0.075, "out": 0.30, "name": "2.0-Flash-001"},
    "models_gemini-2.5-pro": {"in": 1.25, "out": 5.00, "name": "2.5-Pro"},
    "models_gemini-2.5-flash": {"in": 0.075, "out": 0.30, "name": "2.5-Flash"},
    "models_gemini-3-pro-preview": {"in": 2.50, "out": 10.00, "name": "3.0-Pro"},
    "models_gemini-3-pro-image-preview": {"in": 2.50, "out": 10.00, "name": "3.0-Image"},
}

TOKENS_IN = 408
TOKENS_OUT = 1000

EXPECTED_TRIMS = {
    "chevrolet": 1,
    "kia": 7,
    "corolla": 5,
    "chery": None  # Unknown
}

def analyze():
    print(f"{'PDF':<12} | {'MODEL':<15} | {'TIME(s)':<7} | {'TRIMS':<5} | {'✓/✗':<3} | {'COST($)':<8}")
    print("-" * 80)
    
    files = sorted(glob.glob("extraction_results/*.json"))
    
    for filepath in files:
        fname = os.path.basename(filepath).replace(".json", "")
        
        # Parse filename: pdfname_models_modelname.json
        parts = fname.split("_models_")
        if len(parts) != 2:
            continue
            
        pdf = parts[0]
        model_key = "models_" + parts[1]
        
        pricing = PRICING.get(model_key, {"in": 1.0, "out": 5.0, "name": "Unknown"})
        model_display = pricing["name"]
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            if "error" in data:
                status = "ERR"
                trims = 0
                elapsed = 0
            else:
                status = "OK"
                trims = len(data.get("trim_names", []))
                elapsed = data.get("_meta", {}).get("elapsed_sec", 0)
            
            # Accuracy check
            expected = EXPECTED_TRIMS.get(pdf, None)
            accuracy = "✓" if (expected is None or trims == expected) else "✗"
            
            # Cost calculation
            cost = (TOKENS_IN/1e6 * pricing["in"]) + (TOKENS_OUT/1e6 * pricing["out"])
            
            print(f"{pdf[:12]:<12} | {model_display:<15} | {elapsed:<7.2f} | {trims:<5} | {accuracy:<3} | {cost:.5f}")
            
        except Exception as e:
            print(f"{pdf[:12]:<12} | {model_display:<15} | ERROR: {str(e)[:30]}")

if __name__ == "__main__":
    analyze()
