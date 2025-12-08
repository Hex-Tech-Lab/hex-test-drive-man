"""
Hybrid extraction: Try native PDF text, fallback to OCR if poor quality.
"""
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
import json
import re

PROJECT_ID = "gen-lang-client-0318181416"
LOCATION = "eu"
PROCESSOR_ID = "6a8873bffd24ad4"

def count_ocr_errors(text: str) -> int:
    """Count likely OCR errors in text."""
    errors = 0
    
    # Check for common OCR patterns
    if re.search(r'\b\w*[bcdfghjklmnpqrstvwxz]{4,}\w*\b', text, re.I):
        errors += 1
    
    typos = ['Actve', 'ght', 'electrcaly', 'ntegration', 'Cuphoder', 'whch', 'sde']
    errors += sum(1 for typo in typos if typo in text)
    
    return errors


def extract_with_method(pdf_path: str, use_native_pdf: bool):
    """Extract with specified method."""
    opts = ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)
    
    processor_name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}"
    
    with open(pdf_path, 'rb') as f:
        pdf_content = f.read()
    
    raw_document = documentai.RawDocument(
        content=pdf_content,
        mime_type='application/pdf'
    )
    
    # Configure extraction method
    process_options = None
    if use_native_pdf:
        process_options = documentai.ProcessOptions(
            ocr_config=documentai.OcrConfig(
                enable_native_pdf_parsing=True,
                enable_image_quality_scores=False
            )
        )
    
    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document,
        process_options=process_options,
        skip_human_review=True
    )
    
    try:
        result = client.process_document(request=request)
        return result.document
    except Exception as e:
        print(f"ERROR: {e}")
        return None


def extract_hybrid(pdf_path: str, output_path: str):
    """Try native PDF first, fallback to OCR if quality is poor."""
    print(f"Processing: {pdf_path}")
    print("="*80)
    
    # Method 1: Native PDF parsing
    print("\n[1/2] Trying NATIVE PDF TEXT extraction...")
    doc_native = extract_with_method(pdf_path, use_native_pdf=True)
    
    if doc_native:
        # Quality check
        text_sample = doc_native.text[:500]
        native_errors = count_ocr_errors(text_sample)
        print(f"  ✓ Success. Quality check: {native_errors} OCR-like errors in sample")
        
        if native_errors < 3:
            print("  ✅ NATIVE PDF TEXT quality is GOOD - using this")
            document = doc_native
            method = "native_pdf"
        else:
            print(f"  ⚠️  NATIVE PDF TEXT has {native_errors} errors - trying OCR fallback")
            document = None
    else:
        print("  ❌ Native PDF extraction failed")
        document = None
    
    # Method 2: OCR fallback
    if document is None:
        print("\n[2/2] Fallback to OCR extraction...")
        doc_ocr = extract_with_method(pdf_path, use_native_pdf=False)
        
        if doc_ocr:
            text_sample = doc_ocr.text[:500]
            ocr_errors = count_ocr_errors(text_sample)
            print(f"  ✓ Success. Quality check: {ocr_errors} OCR errors in sample")
            document = doc_ocr
            method = "ocr"
        else:
            print("  ❌ OCR extraction also failed")
            return
    
    # Extract tables (same logic as before)
    print(f"\n✓ Using {method.upper()} extraction")
    print(f"  Document: {len(document.pages)} pages\n")
    
    all_specs = []
    for page_idx, page in enumerate(document.pages, 1):
        if not page.tables:
            continue
        
        for table_idx, table in enumerate(page.tables, 1):
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
                
                all_specs.append({
                    "name_en": label_en,
                    "name_ar": label_ar,
                    "trim_values": trim_values,
                    "extraction_method": method
                })
    
    # Save
    output = {
        "source_pdf": pdf_path,
        "extraction_method": method,
        "total_specs": len(all_specs),
        "specs": all_specs
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved {len(all_specs)} specs to {output_path}")


def get_cell_text(cell, document):
    text_segments = []
    for segment in cell.layout.text_anchor.text_segments:
        start = int(segment.start_index) if segment.start_index else 0
        end = int(segment.end_index) if segment.end_index else 0
        text_segments.append(document.text[start:end])
    return ''.join(text_segments)


def has_arabic(text):
    return any('\u0600' <= char <= '\u06FF' for char in text)


if __name__ == "__main__":
    import sys
    extract_hybrid(sys.argv[1], sys.argv[2])
