import cv2
import numpy as np
from pdf2image import convert_from_path
import pytesseract
from pytesseract import Output
import logging

logging.basicConfig(level=logging.INFO)

def extract_with_column_detection(pdf_path, page_num=3):
    """Extract table by detecting text column positions"""
    logging.info(f"Converting page {page_num}...")
    images = convert_from_path(pdf_path, first_page=page_num, last_page=page_num, dpi=300)
    image_np = np.array(images[0])
    
    # Get detailed OCR data with bounding boxes
    logging.info("Running OCR with bbox detection...")
    ocr_data = pytesseract.image_to_data(image_np, output_type=Output.DICT)
    
    # Group text by approximate vertical position (rows)
    rows = {}
    for i, text in enumerate(ocr_data['text']):
        if text.strip():
            y = ocr_data['top'][i]
            x = ocr_data['left'][i]
            # Group by y-coordinate (±20px tolerance for same row)
            row_key = y // 20
            if row_key not in rows:
                rows[row_key] = []
            rows[row_key].append({
                'text': text,
                'x': x,
                'y': y,
                'width': ocr_data['width'][i],
                'height': ocr_data['height'][i]
            })
    
    # Sort each row by x-coordinate (left to right)
    for row_key in rows:
        rows[row_key].sort(key=lambda item: item['x'])
    
    # Display structured output
    print(f"\n✅ Found {len(rows)} rows\n")
    for row_key in sorted(rows.keys())[:30]:  # First 30 rows
        row_text = " | ".join([item['text'] for item in rows[row_key]])
        print(f"Row {row_key}: {row_text}")
    
    return rows

if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1]
    page_num = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    extract_with_column_detection(pdf_path, page_num)
