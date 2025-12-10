#!/usr/bin/env python3
import json
import glob
import os

EXPECTED_TRIMS = {"chevrolet": 2, "kia": 5, "corolla": 5, "chery": 1}

# Categorize files by test run
old_script_files = []  # Files without "models_" prefix OR with exp-1206
new_script_files = []  # Files with "models_" and include 2.0-flash-001

for filepath in glob.glob("extraction_results/*.json"):
    fname = os.path.basename(filepath)
    if "_models_gemini-2.0-flash-001" in fname or "_models_gemini-" in fname:
        new_script_files.append(filepath)
    elif "exp-1206" in fname or (not "_models_" in fname and "gemini" in fname):
        old_script_files.append(filepath)

def analyze_file(filepath):
    """Extract key metrics from a result file."""
    try:
        with open(filepath) as f:
            data = json.load(f)
        
        # Parse filename to get pdf name and model
        fname = os.path.basename(filepath).replace(".json", "")
        
        # Determine PDF name (handle various naming patterns)
        for pdf in ["chevrolet", "chery", "corolla", "kia"]:
            if pdf in fname:
                pdf_name = pdf
                break
        else:
            return None
        
        # Determine model name
        if "gemini-1.5-pro" in fname:
            model = "1.5-Pro"
        elif "gemini-2.0-flash-exp" in fname:
            model = "2.0-Flash-Exp"
        elif "gemini-2.0-flash-001" in fname:
            model = "2.0-Flash-001"
        elif "gemini-2.5-pro" in fname:
            model = "2.5-Pro"
        elif "gemini-2.5-flash" in fname:
            model = "2.5-Flash"
        elif "gemini-3-pro-preview" in fname and "image" not in fname:
            model = "3.0-Pro"
        elif "gemini-3-pro-image" in fname:
            model = "3.0-Image"
        elif "exp-1206" in fname:
            model = "Exp-1206"
        else:
            model = "Unknown"
        
        trims = len(data.get("trim_names", []))
        elapsed = data.get("_meta", {}).get("elapsed_sec", 0)
        expected = EXPECTED_TRIMS.get(pdf_name, 0)
        accurate = trims == expected
        
        return {
            "pdf": pdf_name,
            "model": model,
            "trims": trims,
            "expected": expected,
            "accurate": accurate,
            "time": elapsed,
            "filepath": filepath
        }
        except (Exception, ValueError) as e:
        return None

# Analyze both runs
old_results = [analyze_file(f) for f in old_script_files]
old_results = [r for r in old_results if r]

new_results = [analyze_file(f) for f in new_script_files]
new_results = [r for r in new_results if r]

# Print comparison
print("=" * 90)
print("OLD SCRIPT RESULTS (with exp-1206)")
print("=" * 90)
print(f"{'PDF':<12} | {'MODEL':<15} | {'TIME(s)':<7} | {'TRIMS':<5} | {'✓/✗':<3}")
print("-" * 90)
for r in sorted(old_results, key=lambda x: (x['pdf'], x['model'])):
    acc = "✓" if r['accurate'] else "✗"
    print(f"{r['pdf']:<12} | {r['model']:<15} | {r['time']:<7.2f} | {r['trims']:<5} | {acc:<3}")

print("\n" + "=" * 90)
print("NEW SCRIPT RESULTS (with 2.0-flash-001)")
print("=" * 90)
print(f"{'PDF':<12} | {'MODEL':<15} | {'TIME(s)':<7} | {'TRIMS':<5} | {'✓/✗':<3}")
print("-" * 90)
for r in sorted(new_results, key=lambda x: (x['pdf'], x['model'])):
    acc = "✓" if r['accurate'] else "✗"
    print(f"{r['pdf']:<12} | {r['model']:<15} | {r['time']:<7.2f} | {r['trims']:<5} | {acc:<3}")

# Calculate timing differences for overlapping models
print("\n" + "=" * 90)
print("TIMING COMPARISON (Old vs New for same model)")
print("=" * 90)
print(f"{'PDF':<12} | {'MODEL':<15} | {'OLD(s)':<7} | {'NEW(s)':<7} | {'DIFF(s)':<8}")
print("-" * 90)

for pdf in ["chevrolet", "chery", "corolla", "kia"]:
    for model in ["2.5-Pro", "2.5-Flash", "3.0-Pro", "3.0-Image"]:
        old_match = [r for r in old_results if r['pdf'] == pdf and r['model'] == model]
        new_match = [r for r in new_results if r['pdf'] == pdf and r['model'] == model]
        
        if old_match and new_match:
            old_time = old_match[0]['time']
            new_time = new_match[0]['time']
            diff = new_time - old_time
            print(f"{pdf:<12} | {model:<15} | {old_time:<7.2f} | {new_time:<7.2f} | {diff:+7.2f}")

