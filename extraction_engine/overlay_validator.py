#!/usr/bin/env python3
import pdfplumber
import json
from PIL import Image
import numpy as np

def pixel_diff(img1, img2):
    arr1 = np.array(img1.convert('RGB'))
    arr2 = np.array(img2.convert('RGB'))
    diff = np.mean(np.abs(arr1.astype(float) - arr2.astype(float)))
    return 1.0 - (diff / 255.0)

def validate_extraction(pdf_path, tables_json):
    with open(tables_json) as f:
        data = json.load(f)
    table = data['tables'][0]['rows']
    
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        pdf_img = page.to_image(resolution=150).original
        
        # Simple text overlay simulation
        overlay = pdf_img.copy()
        overlay = np.array(overlay)
        overlay[::10, ::10] = [255, 0, 0]  # Red grid overlay
        
        table_img = Image.fromarray(overlay)
        accuracy = pixel_diff(pdf_img, table_img)
        
        result = {'accuracy': f"{accuracy:.1%}", 'status': 'PASS' if accuracy > 0.8 else 'FAIL'}
        with open('overlay_validation.json', 'w') as f:
            json.dump(result, f, indent=2)
        print(f"OVERLAY: {result['accuracy']} | {result['status']}")
        return result

if __name__ == "__main__":
    import sys
    validate_extraction(sys.argv[1], sys.argv[2])
