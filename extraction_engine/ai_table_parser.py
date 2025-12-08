"""
AI-powered table parser: Use LLM to interpret table structure.
"""
import pdfplumber
import json
import os

def extract_tables_with_ai(pdf_path: str, output_path: str):
    """Extract tables using pdfplumber, then use AI to parse."""
    print(f"Extracting tables from: {pdf_path}")
    print("="*80)
    
    all_tables_data = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            tables = page.find_tables()
            
            for table_idx, table in enumerate(tables, 1):
                table_data = table.extract()
                
                if not table_data:
                    continue
                
                print(f"\n✓ Extracted Page {page_num}, Table {table_idx}")
                print(f"  Dimensions: {len(table_data)} rows × {len(table_data[0])} columns")
                print(f"  Header: {table_data[0]}")
                
                all_tables_data.append({
                    "page": page_num,
                    "table_index": table_idx,
                    "header": table_data[0],
                    "rows": table_data[1:],  # All data rows
                    "total_rows": len(table_data) - 1
                })
    
    # Save raw extraction
    raw_output = {
        "source_pdf": pdf_path,
        "extraction_method": "pdfplumber_raw",
        "tables": all_tables_data
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(raw_output, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*80}")
    print(f"✓ Saved {len(all_tables_data)} tables to: {output_path}")
    print(f"\nNext step: Pass this to LLM for intelligent parsing")
    
    return raw_output


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python ai_table_parser.py <pdf_path> [output_json]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else pdf_path.replace('.pdf', '_raw_tables.json')
    
    extract_tables_with_ai(pdf_path, output_path)
