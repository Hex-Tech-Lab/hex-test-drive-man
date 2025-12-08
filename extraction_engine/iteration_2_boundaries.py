#!/usr/bin/env python3
import pdfplumber
import sys
import json
import statistics
from pathlib import Path

def cluster_x_positions(words, tolerance=10):
    """Clusters word x0 positions."""
    if not words: return []
    x_coords = sorted([w['x0'] for w in words])
    clusters = []
    current_cluster = [x_coords[0]]
    for x in x_coords[1:]:
        if x - current_cluster[-1] <= tolerance:
            current_cluster.append(x)
        else:
            clusters.append(statistics.mean(current_cluster))
            current_cluster = [x]
    clusters.append(statistics.mean(current_cluster))
    return sorted(list(set([round(c, 1) for c in clusters])))

def analyze_boundaries(pdf_path, page_num):
    results = {
        "file": pdf_path,
        "page": page_num,
        "method": "unknown",
        "boundaries": [],
        "col_count": 0,
        "gap_split": False
    }

    try:
        with pdfplumber.open(pdf_path) as pdf:
            page = pdf.pages[int(page_num) - 1]
            
            # 1. Explicit Lines
            lines = page.lines
            v_lines = [l['x0'] for l in lines if l['height'] > 10]
            
            if len(v_lines) > 2:
                # CASE A: Explicit Lines (Corolla, BMW)
                results["method"] = "EXPLICIT_LINES"
                results["boundaries"] = sorted(list(set(map(lambda x: round(x, 1), v_lines))))
                
                gaps = [results["boundaries"][i+1] - results["boundaries"][i] for i in range(len(results["boundaries"])-1)]
                if any(g > 150 for g in gaps):
                    results["gap_split"] = True
                    results["note"] = "Bilingual Split Table Detected"
            else:
                # CASE B: Implicit (Chevrolet) - Filter by Font
                results["method"] = "HEADER_CLUSTERING"
                
                # Filter for bold/large text (headers usually)
                words = page.extract_words(extra_attrs=["fontname", "size"])
                
                # Heuristic: Filter top 20% largest fonts or "Bold" in name
                if words:
                    sizes = [w['size'] for w in words]
                    avg_size = statistics.mean(sizes)
                    header_words = [w for w in words if w['size'] > avg_size or "Bold" in w['fontname']]
                    
                    # If strict filtering removes everything, fallback to all
                    if len(header_words) < 2: header_words = words
                    
                    results["boundaries"] = cluster_x_positions(header_words, tolerance=15)
                
                results["note"] = "Inferred from Header Alignment"

            results["col_count"] = len(results["boundaries"])
            print(json.dumps(results, indent=2))

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    analyze_boundaries(sys.argv[1], sys.argv[2])
