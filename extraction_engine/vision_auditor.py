#!/usr/bin/env python3
import json, sys, pdfplumber, re, glob, os

def load_text(pdf_path, page_num):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[page_num - 1]
        return page.extract_text() or ""

def values_from_json(path):
    """Extract non-boolean, non-null values for auditing."""
    with open(path) as f:
        data = json.load(f)
    vals = []
    for sec in data.get("sections", []):
        for feat in sec.get("features", []):
            for v in feat.get("values", {}).values():
                if v is None:
                    continue
                # Skip booleans (they're normalized from symbols)
                if isinstance(v, bool):
                    continue
                # Keep only numeric/string values that should appear in PDF
                vals.append(str(v))
    return vals

def audit_one(json_path, pdf_path, page_num):
    text = load_text(pdf_path, page_num)
    vals = values_from_json(json_path)
    
    # More lenient matching: check if value appears as substring
    # (handles formatting differences like "1,206" vs "1206")
    missing = []
    for v in vals:
        # Strip common separators for numeric matching
        search_val = v.replace(",", "").replace(" ", "")
        text_clean = text.replace(",", "").replace(" ", "")
        if search_val not in text_clean:
            missing.append(v)
    
    return len(vals), len(missing)

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    proj = os.path.dirname(root)
    pdf_dir = os.path.join(proj, "pdf_samples")

    mappings = {
        "chevrolet_page3-3": ("Chevrolet_Move_Van_2024.pdf", 3),
        "kia_page4-4": ("Kia_Sportage_2025.pdf", 4),
        "corolla_page3-3": ("Toyota_Corolla_2026.pdf", 3),
        "chery_page6-6": ("Chery_Tiggo_3_2024.pdf", 6),
        "bmw_x5_page15-15": ("BMW_X5_LCI_2025.pdf", 15),
        "bmw_x1_page16-16": ("BMW_X1-iX1_2025.pdf", 16),
        "mg4_page6-6": ("MG_4_EV_2025.pdf", 6),
    }

    print(f"{'FILE':<20} | {'MODEL':<10} | {'TOTAL':<5} | {'MISS':<5} | {'%':<6}")
    print("-" * 60)
    
    for base, (pdf_name, page) in mappings.items():
        pdf_path = os.path.join(pdf_dir, pdf_name)
        if not os.path.exists(pdf_path):
            continue
            
        for suffix in ["models_gemini-2.5-flash", "models_gemini-2.5-pro"]:
            json_path = os.path.join(proj, "extraction_results", f"{base}_{suffix}.json")
            if not os.path.exists(json_path):
                continue
            
            try:
                total, miss = audit_one(json_path, pdf_path, page)
                pct = f"{100*miss/total:.0f}%" if total > 0 else "N/A"
                model_label = "Flash" if "flash" in suffix else "Pro"
                print(f"{base:<20} | {model_label:<10} | {total:<5} | {miss:<5} | {pct:<6}")
            except Exception as e:
                print(f"{base:<20} | ERROR: {str(e)[:30]}")

if __name__ == "__main__":
    main()
