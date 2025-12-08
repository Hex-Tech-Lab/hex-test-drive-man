#!/usr/bin/env python3
import pdfplumber
import base64
import io
from PIL import Image
import json

def crop_tables(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        
        # Full page 150 DPI (layout/colors)
        full_img = page.to_image(resolution=150)
        full_buf = io.BytesIO()
        full_img.original.save(full_buf, format='PNG')
        full_b64 = base64.b64encode(full_buf.getvalue()).decode('utf-8')
        
        # Auto-detect 3 tables → 300 DPI crops
        tables = page.find_tables()
        crops = []
        for i, table in enumerate(tables[:3]):
            crop_page = page.crop(table.bbox)
            crop_img = crop_page.to_image(resolution=300)
            crop_buf = io.BytesIO()
            crop_img.original.save(crop_buf, format='PNG')
            crop_b64 = base64.b64encode(crop_buf.getvalue()).decode('utf-8')
            crops.append({
                'table_id': i+1,
                'bbox': table.bbox,
                'image_b64': crop_b64,
                'rows': len(table.extract())
            })
        
        result = {
            'full_page_150dpi': full_b64,
            'table_crops_300dpi': crops,
            'table_count': len(tables)
        }
        
        with open('table_crops.json', 'w') as f:
            json.dump(result, f, indent=2)
        print(f"✅ Cropped {len(crops)} tables + full page")
        return result

if __name__ == "__main__":
    crop_tables('bmw_x5_page15_specs.pdf')
