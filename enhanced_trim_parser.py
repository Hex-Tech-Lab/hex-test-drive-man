import numpy as np
from pdf2image import convert_from_path
import pytesseract
from pytesseract import Output
import json
import logging

logging.basicConfig(level=logging.INFO)

def detect_footnote_markers(rows):
    """Scan all text for footnote markers, return set of characters used"""
    markers = set()
    common_markers = '*†‡§¶#'
    
    for row_items in rows.values():
        for item in row_items:
            text = item['text']
            # Check for superscript numbers or trailing symbols
            for char in text:
                if char in common_markers or (char.isdigit() and len(text) > 1 and text[-1].isdigit()):
                    markers.add(char)
    
    # Also check for digit suffixes (1, 2, 3)
    if any(item['text'][-1].isdigit() for row in rows.values() for item in row if len(item['text']) > 1):
        markers.update('0123456789')
    
    return ''.join(markers) if markers else '*0123456789†‡§¶#'

def parse_trim_columns(pdf_path, page_num=3):
    """Parse trims with column awareness"""
    logging.info(f"Converting page {page_num}...")
    images = convert_from_path(pdf_path, first_page=page_num, last_page=page_num, dpi=300)
    image_np = np.array(images[0])
    
    # OCR with bbox
    logging.info("Running OCR...")
    ocr_data = pytesseract.image_to_data(image_np, output_type=Output.DICT)
    
    # Group by rows
    rows = {}
    for i, text in enumerate(ocr_data['text']):
        if text.strip():
            y = ocr_data['top'][i]
            x = ocr_data['left'][i]
            row_key = y // 20
            if row_key not in rows:
                rows[row_key] = []
            rows[row_key].append({'text': text, 'x': x})
    
    # Sort rows
    for row_key in rows:
        rows[row_key].sort(key=lambda item: item['x'])
    
    # Step 1: Find trim header row (contains ACTIVE, COMFORT, etc.)
    trim_row = None
    for row_key in sorted(rows.keys()):
        row_texts = [item['text'] for item in rows[row_key]]
        if 'ACTIVE' in row_texts or 'COMFORT' in row_texts:
            trim_row = rows[row_key]
            logging.info(f"Found trim header at row {row_key}")
            break
    
    if not trim_row:
        logging.error("Could not find trim header row")
        return None
    
    # Extract trim names and their x-positions
    # Detect footnote markers from entire document
    footnote_chars = detect_footnote_markers(rows)
    logging.info(f"Detected footnote markers: {footnote_chars}")
    
    trim_columns = []
    for item in trim_row:
        trim_name = item['text'].rstrip(footnote_chars).upper()
        # Filter: valid trim names only (not VEHICLE header, not Arabic garbage)
        valid_trims = ['ACTIVE', 'COMFORT', 'SMART', 'ELEGANCE', 'HEV', 'LUXURY', 'PREMIUM', 'BASE', 'SE', 'LE', 'XLE', 'LIMITED']
        if trim_name in valid_trims:
            trim_columns.append({'name': trim_name, 'x': item['x'], 'original': item['text']})
    
    logging.info(f"Trims (footnotes stripped): {[(t['original'], '->', t['name']) for t in trim_columns]}")
    # Merge "ELEGANCE" + "HEV" into "ELEGANCE HEV"
    merged_trims = []
    i = 0
    while i < len(trim_columns):
        if i < len(trim_columns) - 1 and trim_columns[i]['name'] == 'ELEGANCE' and trim_columns[i+1]['name'] == 'HEV':
            merged_trims.append({'name': 'ELEGANCE HEV', 'x': trim_columns[i]['x']})
            i += 2
        else:
            merged_trims.append(trim_columns[i])
            i += 1
    
    logging.info(f"Detected trims: {[t['name'] for t in merged_trims]}")
    
    # Step 2: Parse specs for each trim
    trims_data = {trim['name']: {} for trim in merged_trims}

    # Calculate dynamic column boundaries
    trim_ranges = {}
    spacings = [merged_trims[i+1]['x'] - merged_trims[i]['x'] for i in range(len(merged_trims)-1)]
    buffer = (sum(spacings) / len(spacings) * 0.5) if spacings else 100
    
    for i, trim in enumerate(merged_trims):
        x_start = 0 if i == 0 else trim['x'] - buffer
        x_end = 9999 if i == len(merged_trims)-1 else trim['x'] + buffer
        trim_ranges[trim['name']] = (x_start, x_end)
        logging.info(f"{trim['name']}: x={trim['x']}, range=[{x_start:.0f}, {x_end:.0f}]")

    
    for row_key in sorted(rows.keys()):
        row_items = rows[row_key]
        if not row_items:
            continue
        
        # First item is usually the spec label
        spec_label = row_items[0]['text']
        # Map items to trim columns using dynamic ranges
        # Label column: leftmost items (x < 800)
        label_items = [item for item in row_items if item['x'] < 800]
        spec_label = label_items[0]['text'] if label_items else row_items[0]['text']
        
        # Data columns: x >= 800, assign to trim ranges
        data_items = [item for item in row_items if item['x'] >= 800]
        for item in data_items:
            for trim_name, (x_start, x_end) in trim_ranges.items():
                if x_start <= item['x'] <= x_end:
                    trims_data[trim_name][spec_label] = item['text']
    
    # Diagnostic metadata
    metadata = {
        'trim_count': len(merged_trims),
        'trims_detected': [t['name'] for t in merged_trims],
        'column_boundaries': {name: {'x_center': next(t['x'] for t in merged_trims if t['name']==name), 
                                      'x_start': ranges[0], 'x_end': ranges[1], 'width': ranges[1]-ranges[0]}
                              for name, ranges in trim_ranges.items()},
        'avg_column_spacing': round(sum([merged_trims[j+1]['x'] - merged_trims[j]['x'] for j in range(len(merged_trims)-1)]) / (len(merged_trims)-1), 1) if len(merged_trims) > 1 else 0,
        'buffer_used': round(buffer, 1),
        'total_specs_extracted': len(set(spec for trim_data in trims_data.values() for spec in trim_data.keys())),
        'specs_per_trim': {name: len(specs) for name, specs in trims_data.items()}
    }
    
    return {'trims': trims_data, 'metadata': metadata}

if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1]
    page_num = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    trims = parse_trim_columns(pdf_path, page_num)
    
    if trims:
        print(json.dumps(trims, indent=2, ensure_ascii=False))
