"""
Enhanced Document AI extractor v2 - handles Arabic + English mixed labels.
Based on working v1 client initialization.
"""
import os
import re
import json
from typing import Dict, List, Optional
from google.api_core.client_options import ClientOptions
from google.cloud import documentai_v1 as documentai

# --- Configuration (EU location as confirmed working) ---
PROJECT_ID = "gen-lang-client-0318181416"
LOCATION = "eu"
PROCESSOR_ID = "6a8873bffd24ad4"

# Set credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.expanduser(
    '~/.config/gcp/doc-ai-key.json'
)


def is_arabic_text(text: str) -> bool:
    """Check if text contains significant Arabic characters."""
    if not text:
        return False
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
    total_chars = sum(1 for c in text if c.strip() and not c.isspace())
    if total_chars == 0:
        return False
    return arabic_chars > 0 and (arabic_chars / total_chars) > 0.2


def get_text_from_layout(layout: documentai.Document.Page.Layout, full_text: str) -> str:
    """Extract text from a layout element."""
    if not layout or not layout.text_anchor or not layout.text_anchor.text_segments:
        return ""
    
    text_parts = []
    for segment in layout.text_anchor.text_segments:
        start_idx = int(segment.start_index) if segment.start_index else 0
        end_idx = int(segment.end_index) if segment.end_index else len(full_text)
        text_parts.append(full_text[start_idx:end_idx])
    
    return "".join(text_parts).strip()


def extract_table_intelligent(pdf_path: str, output_path: str):
    """
    Extract table with intelligent leftmost/rightmost column detection.
    Uses working DocumentProcessorServiceClient initialization.
    """
    print(f"Processing: {pdf_path}")
    print(f"Processor: projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}")
    
    try:
        # Initialize client (same as working v1)
        docai_client = documentai.DocumentProcessorServiceClient(
            client_options=ClientOptions(
                api_endpoint=f"{LOCATION}-documentai.googleapis.com"
            )
        )
        
        resource_name = docai_client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
        
        print("Reading PDF...")
        with open(pdf_path, "rb") as f:
            pdf_content = f.read()
        
        raw_document = documentai.RawDocument(
            content=pdf_content,
            mime_type='application/pdf'
        )
        
        print("Sending request to Document AI...")
        request = documentai.ProcessRequest(
            name=resource_name,
            raw_document=raw_document
        )
        
        result = docai_client.process_document(request=request)
        document = result.document
        
        print(f"✓ Document processed ({len(document.pages)} pages)")
        
    except Exception as e:
        print(f"ERROR during Document AI processing: {e}")
        return
    
    # Extract all tables
    all_specs = []
    section_name = ""
    full_text = document.text
    
    for page_num, page in enumerate(document.pages):
        print(f"\n--- Page {page_num + 1} ---")
        
        for table_num, table in enumerate(page.tables):
            # Detect number of columns
            num_cols = 0
            if table.header_rows:
                num_cols = len(table.header_rows[0].cells)
            elif table.body_rows:
                num_cols = max(len(row.cells) for row in table.body_rows)
            
            print(f"  Table {table_num + 1} ({num_cols} columns):")
            
            # Process each row
            for row_num, row in enumerate(table.body_rows):
                cells = row.cells
                
                if len(cells) < 2:
                    continue
                
                # Strategy: leftmost = English, rightmost = Arabic (+ English)
                leftmost_cell = cells[0]
                rightmost_cell = cells[-1]
                middle_cells = cells[1:-1]
                
                # Extract text
                name_en = get_text_from_layout(leftmost_cell.layout, full_text)
                name_ar_raw = get_text_from_layout(rightmost_cell.layout, full_text)
                
                # Validate rightmost is Arabic (not just English trim value)
                name_ar = ""
                if is_arabic_text(name_ar_raw):
                    name_ar = name_ar_raw
                
                # Detect section headers (all caps, no values)
                is_section = (
                    name_en and 
                    name_en.isupper() and 
                    len(name_en.split()) <= 4 and
                    all(not get_text_from_layout(c.layout, full_text).strip() 
                        for c in middle_cells)
                )
                
                if is_section:
                    section_name = name_en
                    print(f"    [SECTION] {section_name}")
                    continue
                
                # Skip if no English label
                if not name_en:
                    continue
                
                # Extract trim values
                trims = {}
                for i, cell in enumerate(middle_cells):
                    value = get_text_from_layout(cell.layout, full_text)
                    if value:  # Only store non-empty values
                        trims[f"Trim_{i+1}"] = value
                
                spec_row = {
                    "name_en": name_en,
                    "name_ar": name_ar,
                    "section": section_name,
                    "trims": trims
                }
                
                all_specs.append(spec_row)
                
                # Debug output
                trim_count = len(trims)
                ar_preview = (name_ar[:30] + "...") if len(name_ar) > 30 else name_ar
                print(f"    [{row_num:2d}] EN: {name_en[:40]:40s} | AR: {ar_preview:30s} | Trims: {trim_count}")
    
    # Save results
    output_data = {
        "pdf_file": pdf_path,
        "total_specs": len(all_specs),
        "specs": all_specs
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*80}")
    print(f"✓ Saved {len(all_specs)} specs to {output_path}")
    
    # Summary
    with_arabic = sum(1 for s in all_specs if s['name_ar'])
    print(f"\nSummary:")
    print(f"  Total rows: {len(all_specs)}")
    print(f"  With Arabic labels: {with_arabic} ({with_arabic/len(all_specs)*100:.1f}%)")
    print(f"{'='*80}")


if __name__ == "__main__":
    pdf_path = "pdfs/Toyota/toyota_official/Corolla_2026.pdf"
    output_path = "toyota_extracted_v2.json"
    
    extract_table_intelligent(pdf_path, output_path)
