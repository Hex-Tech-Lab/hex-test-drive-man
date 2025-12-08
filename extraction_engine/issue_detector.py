"""
Detect text quality issues in extractions before cleaning.
"""
import json
import re
from collections import Counter

def detect_arabic_newline_issue(text: str) -> bool:
    """Detect if Arabic has excessive newlines (word-level breaks)."""
    if not text or not any('\u0600' <= c <= '\u06FF' for c in text):
        return False
    
    # Count newlines relative to Arabic characters
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
    newlines = text.count('\n')
    
    # If more than 1 newline per 5 Arabic chars, it's broken
    return newlines > (arabic_chars / 5)


def detect_ocr_errors(text: str) -> list:
    """Detect likely OCR errors in English text."""
    if not text:
        return []
    
    errors = []
    
    # Pattern 1: Missing vowels (e -> missing)
    if re.search(r'\b\w*[bcdfghjklmnpqrstvwxz]{4,}\w*\b', text, re.I):
        errors.append("missing_vowels")
    
    # Pattern 2: Common typo patterns
    typo_patterns = {
        'ght': 'light typo (ght)',
        'Actve': 'Active typo',
        'electrcaly': 'electrically typo',
        'ntegration': 'integration typo (n for i)',
    }
    
    for typo, description in typo_patterns.items():
        if typo in text:
            errors.append(description)
    
    return errors


def analyze_extraction_quality(extraction_file: str):
    """Analyze extraction quality and report issues."""
    with open(extraction_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    specs = data.get('specs', [])
    
    print("="*80)
    print("EXTRACTION QUALITY ANALYSIS")
    print("="*80)
    print(f"File: {extraction_file}")
    print(f"Total specs: {len(specs)}\n")
    
    # Issue counters
    arabic_newline_issues = 0
    english_ocr_issues = 0
    ocr_error_types = Counter()
    
    for spec in specs:
        # Check Arabic newlines
        if detect_arabic_newline_issue(spec['name_ar']):
            arabic_newline_issues += 1
        
        # Check English OCR
        errors = detect_ocr_errors(spec['name_en'])
        if errors:
            english_ocr_issues += 1
            for error in errors:
                ocr_error_types[error] += 1
    
    # Report
    print("ISSUES DETECTED:")
    print(f"  • Arabic newline issues: {arabic_newline_issues}/{len(specs)} ({arabic_newline_issues/len(specs)*100:.1f}%)")
    print(f"  • English OCR errors: {english_ocr_issues}/{len(specs)} ({english_ocr_issues/len(specs)*100:.1f}%)")
    
    if ocr_error_types:
        print("\n  OCR Error Breakdown:")
        for error, count in ocr_error_types.most_common():
            print(f"    - {error}: {count}x")
    
    # Recommendations
    print("\nRECOMMENDATIONS:")
    if arabic_newline_issues > len(specs) * 0.5:
        print("  ✅ Apply Arabic newline cleaning (affects >50% of specs)")
    
    if english_ocr_issues > len(specs) * 0.2:
        print("  ✅ Apply OCR error correction (affects >20% of specs)")
    
    print("="*80)


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python issue_detector.py <extraction.json>")
        sys.exit(1)
    
    analyze_extraction_quality(sys.argv[1])
