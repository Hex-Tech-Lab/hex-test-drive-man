import sys
import logging
import pdfplumber
from pdf2image import convert_from_path
import pytesseract
from hybrid_pdf_extractor import HybridExtractor, extract_pdf_batch

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def is_text_based_pdf(pdf_path):
    """Check if PDF has extractable text"""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:3]:
            text = page.extract_text()
            if text and len(text.strip()) > 50:
                return True
    return False

def ocr_pdf(pdf_path):
    """Extract text via OCR"""
    logging.info(f"🔍 Running OCR on {pdf_path}")
    images = convert_from_path(pdf_path, dpi=300)
    
    full_text = []
    for i, image in enumerate(images[:10]):
        logging.info(f"  OCR page {i+1}/{min(len(images), 10)}")
        page_text = pytesseract.image_to_string(image, lang='eng')
        full_text.append(page_text)
    
    return "\n\n".join(full_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python3 run_quality_gate.py file1.pdf file2.pdf ...")
        sys.exit(1)

    pdfs_to_process = sys.argv[1:]
    print(f"🚀 Running Quality Gate on {len(pdfs_to_process)} PDFs...")

    results = {}
    for pdf_path in pdfs_to_process:
        logging.info(f"Processing: {pdf_path}")
        
        # Check if OCR needed
        if not is_text_based_pdf(pdf_path):
            ocr_text = ocr_pdf(pdf_path)
            # Save OCR text alongside PDF for manual inspection
            ocr_txt_path = pdf_path.replace('.pdf', '_ocr.txt')
            with open(ocr_txt_path, 'w') as f:
                f.write(ocr_text)
            logging.info(f"✅ OCR text saved to {ocr_txt_path}")
        
        # Now run normal extraction (it will pick up the text via pdfplumber or our OCR)
        try:
            extractor = HybridExtractor(pdf_path)
            result = extractor.extract_to_dict()
            results[pdf_path] = result
        except Exception as e:
            logging.error(f"Failed: {pdf_path} - {e}")
            results[pdf_path] = {"error": str(e)}

    # Save results
    import json
    with open('quality_gate_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Quality Gate Complete. Results in 'quality_gate_results.json'")
