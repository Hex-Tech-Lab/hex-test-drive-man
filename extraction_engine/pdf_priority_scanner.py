#!/usr/bin/env python3
import pdfplumber
import sys
import signal
import logging
from pathlib import Path

# Suppress PDFPlumber internal warnings
logging.getLogger("pdfminer").setLevel(logging.ERROR)

TIMEOUT_SECONDS = 45

def handler(signum, frame):
    raise TimeoutError("Processing timed out")

signal.signal(signal.SIGALRM, handler)

def analyze_pdf(pdf_path, index):
    filename = pdf_path.name
    meta = {
        "idx": index,
        "filename": filename,
        "pages": 0,
        "total_tables": 0,  # RESTORED
        "table_pages": [],
        "raw_cols": 0,
        "est_trims": 0,
        "type": "UNKNOWN",
        "score": 0,
        "notes": []
    }

    try:
        signal.alarm(TIMEOUT_SECONDS)
        with pdfplumber.open(pdf_path) as pdf:
            meta["pages"] = len(pdf.pages)
            
            has_text = False
            has_tables = False
            
            for i, page in enumerate(pdf.pages):
                # Text check (sample first 5 pages)
                if i < 5 and not has_text:
                    txt = page.extract_text()
                    if txt and len(txt.strip()) > 50: has_text = True

                # Table check
                tables = page.extract_tables()
                if tables:
                    has_tables = True
                    meta["total_tables"] += len(tables) # Count total tables
                    
                    for table in tables:
                        clean_table = [[c for c in row if c is not None] for row in table]
                        if not clean_table: continue
                        
                        cols = max(len(r) for r in clean_table)
                        rows = len(clean_table)

                        # Valid spec table heuristic
                        if cols >= 3 and rows > 5:
                            meta["table_pages"].append(i + 1)
                            if cols > meta["raw_cols"]:
                                meta["raw_cols"] = cols
                                meta["est_trims"] = max(1, cols - 2) 

            # Classification Logic
            if has_tables:
                meta["type"] = "VECTOR"
                meta["score"] = 90
            elif has_text:
                meta["type"] = "TEXT_NO_GRID"
                meta["score"] = 50
                meta["notes"].append("Text found but no tables")
            else:
                meta["type"] = "IMAGE_BASED"
                meta["score"] = 0
                meta["notes"].append("OCR Required")

            # Penalties
            if meta["est_trims"] > 6: 
                meta["score"] -= 10
            if meta["pages"] > 100:
                meta["score"] = 10
                meta["type"] = "MANUAL"

            signal.alarm(0)

    except Exception as e:
        meta["notes"].append(f"Error: {str(e)}")
        meta["score"] = 0
    finally:
        signal.alarm(0)

    return meta

def run_batch(folder):
    folder_path = Path(folder)
    if not folder_path.exists():
        print(f"Error: Folder {folder} not found")
        return

    pdfs = sorted(list(folder_path.glob("*.pdf")))
    
    # FULL HEADER RESTORED
    print(f"{'#':<3} | {'FILENAME':<40} | {'Pg':<4} | {'Tbls':<4} | {'COLS':<4} | {'TRIMS':<5} | {'TYPE':<12} | {'LOC (Pg)':<15} | {'SCORE'}")
    print("-" * 115)

    for idx, pdf in enumerate(pdfs, 1):
        data = analyze_pdf(pdf, idx)
        
        # Format locations
        loc_str = str(data['table_pages'][:3]) 
        if len(data['table_pages']) > 3: loc_str = loc_str[:-1] + ", ...]"
        
        print(f"{data['idx']:<3} | {data['filename'][:40]:<40} | {data['pages']:<4} | {data['total_tables']:<4} | {data['raw_cols']:<4} | {data['est_trims']:<5} | {data['type']:<12} | {loc_str:<15} | {data['score']}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "pdf_samples"
    run_batch(target)
