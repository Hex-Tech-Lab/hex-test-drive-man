import re

# Read the current extractor
with open('hybrid_pdf_extractor.py', 'r') as f:
    content = f.read()

# Add OCR imports at the top (after existing imports)
ocr_imports = """
# OCR Fallback for image-based PDFs
try:
    from pdf2image import convert_from_path
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
"""

# Find the extract method and add OCR fallback
# We insert OCR logic after text extraction fails
ocr_method = '''
    def _extract_with_ocr(self):
        """Fallback OCR extraction for image-based PDFs"""
        if not OCR_AVAILABLE:
            self.logger.warning("OCR libraries not available. Install: pip install pytesseract pdf2image")
            return ""
        
        self.logger.info("PDF appears to be image-based. Using OCR...")
        full_text = []
        images = convert_from_path(self.pdf_path, dpi=300)
        
        for i, image in enumerate(images[:10]):  # Limit to first 10 pages for speed
            self.logger.info(f"OCR processing page {i+1}/{len(images[:10])}")
            page_text = pytesseract.image_to_string(image, lang='eng')
            full_text.append(page_text)
        
        return "\\n\\n".join(full_text)
'''

# Insert OCR imports after the first import block
import_pattern = r'(import logging\nimport re.*?\n)'
content = re.sub(import_pattern, r'\1' + ocr_imports + '\n', content, count=1, flags=re.DOTALL)

# Find the class definition and add the OCR method
class_pattern = r'(class HybridExtractor.*?def extract\(self\):.*?text_content = self\.extract_text\(\))'
replacement = r'\1\n        # OCR fallback if no text extracted\n        if not text_content or len(text_content) < 100:\n            text_content = self._extract_with_ocr()'

content = re.sub(class_pattern, replacement, content, flags=re.DOTALL)

# Add the OCR method to the class (before the extract method)
method_insert_pattern = r'(class HybridExtractor.*?)(    def extract\(self\):)'
content = re.sub(method_insert_pattern, r'\1' + ocr_method + '\n\n\2', content, flags=re.DOTALL)

# Write patched version
with open('hybrid_pdf_extractor.py', 'w') as f:
    f.write(content)

print("✅ OCR fallback patched into hybrid_pdf_extractor.py")
