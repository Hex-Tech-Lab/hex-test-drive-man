"""
Comprehensive PDF analyzer - finds spec tables using multiple methods.
"""
import pdfplumber
from pypdf import PdfReader
import re

def analyze_pdf_structure(pdf_path: str):
    """Analyze PDF structure to find spec table pages."""
    print(f"Analyzing: {pdf_path}")
    print("="*80)
    
    reader = PdfReader(pdf_path)
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")
        
        spec_pages = []
        
        for i, page in enumerate(pdf.pages, 1):
            # Method 1: pdfplumber table detection
            tables = page.find_tables()
            
            # Method 2: Text-based detection (look for spec keywords)
            text = page.extract_text() or ""
            
            # Count spec-related keywords
            spec_keywords = [
                'cylinder', 'engine', 'horsepower', 'torque', 'acceleration',
                'fuel consumption', 'displacement', 'transmission', 'maximum output',
                'top speed', 'curb weight', 'ground clearance',
                'الأسطوانات', 'المحرك', 'القدرة', 'العزم', 'التسارع',
                'استهلاك الوقود', 'سعة المحرك', 'ناقل الحركة'
            ]
            
            keyword_count = sum(1 for kw in spec_keywords if kw.lower() in text.lower())
            
            # Method 3: Line count (spec tables have many short lines)
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            line_count = len(lines)
            
            # Method 4: Check for numerical patterns (specs have lots of numbers)
            numbers = re.findall(r'\d+', text)
            number_density = len(numbers) / max(len(text), 1) * 1000
            
            # Scoring
            score = 0
            reasons = []
            
            if tables:
                score += 30
                reasons.append(f"{len(tables)} table(s)")
            
            if keyword_count > 5:
                score += keyword_count * 2
                reasons.append(f"{keyword_count} spec keywords")
            
            if line_count > 50:
                score += 20
                reasons.append(f"{line_count} lines")
            
            if number_density > 10:
                score += 15
                reasons.append(f"high number density")
            
            # Report
            if score > 30:
                marker = "✓ LIKELY SPEC TABLE"
                spec_pages.append(i)
            else:
                marker = ""
            
            print(f"Page {i:2d}: score={score:3d} | {', '.join(reasons) if reasons else 'no indicators'} {marker}")
        
        print(f"\n{'='*80}")
        print(f"Spec table pages: {spec_pages}")
        return spec_pages


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python pdf_analyzer.py <pdf_path>")
        sys.exit(1)
    
    analyze_pdf_structure(sys.argv[1])
