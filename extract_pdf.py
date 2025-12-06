#!/usr/bin/env python3
"""
Quick PDF extraction script.
"""
import sys
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.expanduser(
    '~/.config/gcp/doc-ai-key.json'
)

# Import the extractor function
from google_documentai_extractor_v2 import extract_table_intelligent

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf.py <pdf_path> [output_json]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else pdf_path.replace('.pdf', '_extracted.json')
    
    extract_table_intelligent(pdf_path, output_path)
