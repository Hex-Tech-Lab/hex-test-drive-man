"""
Enhanced Document AI extractor with working imageless mode.
"""
import os
import json
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions

PROJECT_ID = "gen-lang-client-0318181416"
LOCATION = "eu"
PROCESSOR_ID = "6a8873bffd24ad4"

def extract_table_intelligent(pdf_path: str, output_path: str):
    """Extract table from PDF using Document AI."""
    print(f"Processing: {pdf_path}")
    
    opts = ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)
    
    processor_name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}"
    print(f"Processor: {processor_name}")
    
    print("Reading PDF...")
    with open(pdf_path, 'rb') as f:
        pdf_content = f.read()
    
    # Simple request - Document AI should auto-enable imageless for 16-30 pages
    raw_document = documentai.RawDocument(
        content=pdf_content,
        mime_type='application/pdf'
    )
    
    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document,
        skip_human_review=True
    )
    
    print("Sending request to Document AI...")
    try:
        result = client.process_document(request=request)
        document = result.document
    except Exception as e:
        print(f"ERROR: {e}")
        print("\nForm Parser doesn't support imageless mode automatically.")
        print("Solution: Split PDF into <15 page chunks or use Layout Parser processor.")
        return
    
    print(f"✓ Document processed ({len(document.pages)} pages)")
    
    # Extract specs
    all_specs = []
    
    for page_idx, page in enumerate(document.pages, 1):
        print(f"\n--- Page {page_idx} ---")
        
        if not page.tables:
            continue
        
        for table_idx, table in enumerate(page.tables, 1):
            num_cols = len(table.header_rows[0].cells) if table.header_rows else len(table.body_rows[0].cells) if table.body_rows else 0
            print(f"  Table {table_idx} ({num_cols} columns):")
            
            for row_idx, row in enumerate(table.body_rows):
                cells = row.cells
                if len(cells) < 2:
                    continue
                
                leftmost_text = get_cell_text(cells[0], document).strip()
                rightmost_text = get_cell_text(cells[-1], document).strip()
                
                is_leftmost_arabic = has_arabic(leftmost_text)
                
                label_en = rightmost_text if is_leftmost_arabic else leftmost_text
                label_ar = leftmost_text if is_leftmost_arabic else rightmost_text
                
                trim_values = [get_cell_text(cell, document).strip() for cell in cells[1:-1]]
                
                is_section = is_section_header(label_en, label_ar, trim_values)
                
                all_specs.append({
                    "name_en": label_en,
                    "name_ar": label_ar,
                    "trim_values": trim_values,
                    "row_type": "section_header" if is_section else "spec_row",
                    "page": page_idx,
                    "table": table_idx,
                    "row": row_idx
                })
                
                row_marker = "[SECTION]" if is_section else f"[{len(all_specs)-1:2d}]"
                print(f"    {row_marker} EN: {label_en[:50]:50s} | AR: {label_ar[:35]:35s} | Trims: {len([v for v in trim_values if v])}")
    
    # Save
    arabic_count = sum(1 for spec in all_specs if spec['name_ar'])
    
    output = {
        "source_pdf": pdf_path,
        "total_specs": len(all_specs),
        "specs_with_arabic": arabic_count,
        "specs": all_specs
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*80}")
    print(f"✓ Saved {len(all_specs)} specs to {output_path}")
    print(f"\nSummary:")
    print(f"  Total rows: {len(all_specs)}")
    print(f"  With Arabic labels: {arabic_count} ({arabic_count/len(all_specs)*100:.1f}%)")
    print(f"{'='*80}")


def get_cell_text(cell, document):
    text_segments = []
    for segment in cell.layout.text_anchor.text_segments:
        start = int(segment.start_index) if segment.start_index else 0
        end = int(segment.end_index) if segment.end_index else 0
        text_segments.append(document.text[start:end])
    return ''.join(text_segments)


def has_arabic(text):
    return any('\u0600' <= char <= '\u06FF' for char in text)


def is_section_header(label_en, label_ar, trim_values):
    all_empty = all(not v for v in trim_values)
    short_label = len(label_en) < 30 and len(label_en.split()) <= 3
    return all_empty and short_label


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python google_documentai_extractor_v2_imageless.py <pdf_path> [output_json]")
        sys.exit(1)
    
    extract_table_intelligent(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else sys.argv[1].replace('.pdf', '_extracted.json'))
