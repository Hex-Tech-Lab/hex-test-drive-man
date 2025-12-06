"""
PDF Inspector: Analyze PDF content type and structure.
"""
import pdfplumber
from pypdf import PdfReader
import json

def inspect_pdf(pdf_path: str):
    """Inspect PDF structure."""
    print(f"Inspecting: {pdf_path}")
    print("="*80)
    
    analysis = {
        "path": pdf_path,
        "content_type": None,
        "tables": []
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        analysis["total_pages"] = len(pdf.pages)
        
        for i, page in enumerate(pdf.pages, 1):
            width = page.width
            height = page.height
            orientation = "landscape" if width > height else "portrait"
            
            text = page.extract_text() or ""
            has_text = len(text.strip()) > 50
            
            tables = page.find_tables()
            
            if tables:
                for t_idx, table in enumerate(tables, 1):
                    # Extract table data
                    table_data = table.extract()
                    rows = len(table_data) if table_data else 0
                    cols = len(table_data[0]) if rows > 0 else 0
                    
                    # Get header
                    header = table_data[0] if rows > 0 else []
                    
                    analysis["tables"].append({
                        "page": i,
                        "table_index": t_idx,
                        "rows": rows,
                        "columns": cols,
                        "orientation": orientation,
                        "header": header
                    })
                    
                    print(f"\nPage {i} - Table {t_idx}:")
                    print(f"  Orientation: {orientation} ({width:.0f}x{height:.0f})")
                    print(f"  Dimensions: {rows} rows × {cols} columns")
                    print(f"  Header: {header}")
                    print(f"  Has embedded text: {has_text}")
                    
                    # Show first 3 data rows
                    if rows > 1:
                        print(f"  Sample rows:")
                        for row_idx in range(1, min(4, rows)):
                            print(f"    Row {row_idx}: {table_data[row_idx]}")
    
    # Determine content type
    analysis["content_type"] = "text_based" if has_text else "image_based"
    
    print(f"\n{'='*80}")
    print(f"SUMMARY:")
    print(f"  Content Type: {analysis['content_type']}")
    print(f"  Tables: {len(analysis['tables'])}")
    
    # Save
    output_path = pdf_path.replace('.pdf', '_inspection.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Saved to: {output_path}")
    return analysis


if __name__ == "__main__":
    import sys
    inspect_pdf(sys.argv[1])
