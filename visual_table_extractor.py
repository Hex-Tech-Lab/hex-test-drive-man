import cv2
import numpy as np
from pdf2image import convert_from_path
import pytesseract
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)

def detect_table_structure(image_np):
    """Detect table grid lines and cell boundaries"""
    # Convert to grayscale
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    
    # Apply threshold
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    
    # Detect horizontal and vertical lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    
    horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
    vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
    
    # Combine lines
    table_grid = cv2.addWeighted(horizontal_lines, 0.5, vertical_lines, 0.5, 0.0)
    
    # Find contours (cells)
    contours, _ = cv2.findContours(table_grid, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter and sort cells by position
    cells = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 50 and h > 20:  # Minimum cell size
            cells.append((x, y, w, h))
    
    # Sort by row then column
    cells.sort(key=lambda c: (c[1] // 20, c[0]))  # Group by row (y-coord), then by x
    
    return cells

def ocr_cells(image_np, cells):
    """OCR each detected cell"""
    cell_texts = []
    for x, y, w, h in cells:
        cell_img = image_np[y:y+h, x:x+w]
        text = pytesseract.image_to_string(cell_img, config='--psm 6').strip()
        cell_texts.append({
            'text': text,
            'bbox': (x, y, w, h)
        })
    return cell_texts

def extract_structured_table(pdf_path, page_num=3):
    """Extract table with preserved structure"""
    logging.info(f"Converting PDF page {page_num} to image...")
    images = convert_from_path(pdf_path, first_page=page_num, last_page=page_num, dpi=300)
    
    if not images:
        return None
    
    # Convert PIL Image to numpy array
    image_np = np.array(images[0])
    
    logging.info("Detecting table structure...")
    cells = detect_table_structure(image_np)
    logging.info(f"Found {len(cells)} cells")
    
    logging.info("Running OCR on cells...")
    cell_data = ocr_cells(image_np, cells)
    
    return cell_data

if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1]
    page_num = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    cells = extract_structured_table(pdf_path, page_num)
    
    print(f"\n✅ Extracted {len(cells)} cells from page {page_num}")
    print("\nFirst 20 cells:")
    for i, cell in enumerate(cells[:20]):
        print(f"{i+1}. {cell['text'][:50]}")
