import os
import pdfplumber
from pdf2image import convert_from_path
import pytesseract
import logging

logging.basicConfig(level=logging.INFO)

def is_text_based_pdf(pdf_path):
    """Check if PDF has extractable text"""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:3]:  # Check first 3 pages
            text = page.extract_text()
            if text and len(text.strip()) > 50:
                return True
    return False

def ocr_pdf_to_text_file(pdf_path, output_txt_path):
    """Extract text via OCR and save to txt file"""
    logging.info(f"Running OCR on {pdf_path}")
    images = convert_from_path(pdf_path, dpi=300)
    
    full_text = []
    for i, image in enumerate(images[:10]):  # First 10 pages
        logging.info(f"  OCR page {i+1}/{min(len(images), 10)}")
        page_text = pytesseract.image_to_string(image, lang='eng')
        full_text.append(page_text)
    
    combined_text = "\n\n=== PAGE BREAK ===\n\n".join(full_text)
    
    with open(output_txt_path, 'w', encoding='utf-8') as f:
        f.write(combined_text)
    
    logging.info(f"✅ OCR complete: {len(combined_text)} chars extracted")
    return combined_text

if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1]
    
    if is_text_based_pdf(pdf_path):
        print(f"✅ {pdf_path} is text-based. No OCR needed.")
    else:
        txt_path = pdf_path.replace('.pdf', '_ocr.txt')
        text = ocr_pdf_to_text_file(pdf_path, txt_path)
        print(f"✅ OCR complete. Saved to {txt_path}")
        print(f"Preview:\n{text[:500]}")
