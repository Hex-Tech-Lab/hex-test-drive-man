import numpy as np
from pdf2image import convert_from_path
import pytesseract
from pytesseract import Output
import json
import logging

logging.basicConfig(level=logging.INFO)

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
    trim_columns = []
    for item in trim_row:
        if item['text'] in ['ACTIVE', 'COMFORT', 'SMART*', 'ELEGANCE', 'HEV']:
            trim_columns.append({'name': item['text'], 'x': item['x']})
    
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
    
    for row_key in sorted(rows.keys()):
        row_items = rows[row_key]
        if not row_items:
            continue
        
        # First item is usually the spec label
        spec_label = row_items[0]['text']
        
        # Map remaining items to trim columns
        for trim in merged_trims:
            # Find items in this trim's column (x-coordinate range)
            trim_x = trim['x']
            # Allow ±100px tolerance
            trim_values = [item['text'] for item in row_items if abs(item['x'] - trim_x) < 100 and item['text'] != spec_label]
            
            if trim_values:
                trims_data[trim['name']][spec_label] = ' '.join(trim_values)
    
    return trims_data

if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1]
    page_num = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    trims = parse_trim_columns(pdf_path, page_num)
    
    if trims:
        print(json.dumps(trims, indent=2, ensure_ascii=False))
