#!/usr/bin/env python3
"""
YOLO-Based Full PDF Extraction - All 84 Manufacturer PDFs
Uses YOLOv8 nano model for accurate vehicle detection

Expected success rate: 80-90% (based on 100% test batch)
"""

import pdfplumber
from PIL import Image
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import re

def normalize_model_name(filename, brand):
    """Extract model name from PDF filename"""
    name = Path(filename).stem
    # Remove brand prefix if present
    name = re.sub(f'^{brand}_', '', name, flags=re.IGNORECASE)
    # Replace underscores and spaces with hyphens
    name = name.replace('_', '-').replace(' ', '-')
    return name.lower()

def extract_vehicle_with_yolo(pdf_path, brand, model, yolo_model):
    """
    Extract vehicle image using YOLO detection:
    1. Render first 3 pages to images (200 DPI)
    2. Run YOLOv8 detection on each page
    3. Select page with highest confidence vehicle detection
    4. Crop with 10% margin
    5. Save to hero/hover directories
    """
    results = {
        'success': False,
        'page_selected': None,
        'confidence': 0.0,
        'bbox': None,
        'output_path': None,
        'error': None,
        'detections': []
    }

    try:
        with pdfplumber.open(pdf_path) as pdf:
            page_detections = []

            # Scan first 3 pages
            for page_num in range(min(3, len(pdf.pages))):
                page = pdf.pages[page_num]

                # Render to image at 200 DPI for better detection
                img_obj = page.to_image(resolution=200)
                pil_img = img_obj.original
                img_array = np.array(pil_img)

                # Run YOLO detection
                # classes: 2=car, 5=bus, 7=truck (COCO dataset)
                detections = yolo_model.predict(img_array, classes=[2, 5, 7], verbose=False)

                # Extract bounding boxes and confidences
                for detection in detections:
                    boxes = detection.boxes
                    for box in boxes:
                        conf = float(box.conf[0])
                        cls = int(box.cls[0])
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                        page_detections.append({
                            'page': page_num,
                            'confidence': conf,
                            'class': cls,
                            'bbox': (int(x1), int(y1), int(x2), int(y2)),
                            'pil_img': pil_img,
                            'img_array': img_array
                        })

            if not page_detections:
                results['error'] = "No vehicles detected in first 3 pages"
                return results

            # Select detection with highest confidence
            best_detection = max(page_detections, key=lambda x: x['confidence'])

            if best_detection['confidence'] < 0.3:  # Minimum confidence threshold
                results['error'] = f"Low confidence: {best_detection['confidence']:.2f}"
                return results

            results['page_selected'] = best_detection['page']
            results['confidence'] = best_detection['confidence']
            results['detections'] = len(page_detections)

            # Extract vehicle region with margin
            x1, y1, x2, y2 = best_detection['bbox']
            w = x2 - x1
            h = y2 - y1

            # Add 10% margin
            margin_w = int(w * 0.10)
            margin_h = int(h * 0.10)

            img_width = best_detection['img_array'].shape[1]
            img_height = best_detection['img_array'].shape[0]

            x1_crop = max(0, x1 - margin_w)
            y1_crop = max(0, y1 - margin_h)
            x2_crop = min(img_width, x2 + margin_w)
            y2_crop = min(img_height, y2 + margin_h)

            # Crop using PIL
            cropped = best_detection['pil_img'].crop((x1_crop, y1_crop, x2_crop, y2_crop))

            # Resize to standard width (1600px max)
            if cropped.width > 1600:
                target_width = 1600
                aspect = cropped.height / cropped.width
                target_height = int(target_width * aspect)
                cropped = cropped.resize((target_width, target_height), Image.LANCZOS)

            results['bbox'] = (x1_crop, y1_crop, x2_crop, y2_crop)

            # Save hero and hover
            filename = f"{brand.lower()}-{model.lower()}.jpg"
            hero_path = Path("public/images/vehicles/hero") / filename
            hover_path = Path("public/images/vehicles/hover") / filename

            cropped.save(hero_path, "JPEG", quality=90, optimize=True)
            cropped.save(hover_path, "JPEG", quality=90, optimize=True)

            results['success'] = True
            results['output_path'] = hero_path

            return results

    except Exception as e:
        results['error'] = str(e)
        return results

def main():
    print("="*70)
    print("YOLO-BASED FULL EXTRACTION - 84 Manufacturer PDFs")
    print("="*70)
    print()

    # Load YOLOv8 nano model (6MB, fast)
    print("📥 Loading YOLOv8n model...")
    yolo_model = YOLO('yolov8n.pt')
    print("   ✅ Model loaded successfully")
    print()

    # Find all manufacturer PDFs
    pdfs = sorted(Path("pdfs").rglob("*_official/*.pdf"))
    print(f"📁 Found {len(pdfs)} manufacturer PDFs")
    print()

    results = []
    successful = []
    failed = []

    for idx, pdf_path in enumerate(pdfs, 1):
        brand = pdf_path.parent.parent.name
        model = normalize_model_name(pdf_path.name, brand)

        print(f"[{idx}/{len(pdfs)}] 🔄 {brand} - {pdf_path.name}")

        result = extract_vehicle_with_yolo(pdf_path, brand, model, yolo_model)
        result['brand'] = brand
        result['model'] = model
        result['pdf'] = pdf_path.name

        if result['success']:
            file_size_kb = result['output_path'].stat().st_size / 1024
            print(f"        ✅ Page {result['page_selected']} (conf {result['confidence']:.2f}) → {file_size_kb:.0f}KB")
            successful.append(result)
        else:
            print(f"        ❌ {result['error']}")
            failed.append(result)

        results.append(result)

    # Summary
    print()
    print("="*70)
    print("📊 FULL EXTRACTION RESULTS")
    print("="*70)

    success_rate = len(successful) / len(results) * 100 if results else 0

    print(f"\n✅ Successful: {len(successful)}/{len(results)} ({success_rate:.1f}%)")
    print(f"❌ Failed: {len(failed)}/{len(results)}")

    if failed:
        print(f"\n❌ FAILED PDFs ({len(failed)}):")
        for r in failed[:10]:
            print(f"   - {r['brand']:15s} {r['pdf']:40s} → {r['error']}")
        if len(failed) > 10:
            print(f"   ... and {len(failed) - 10} more")

    # Group by brand
    print(f"\n📈 SUCCESS BY BRAND:")
    brand_stats = {}
    for r in results:
        brand = r['brand']
        if brand not in brand_stats:
            brand_stats[brand] = {'success': 0, 'failed': 0}
        if r['success']:
            brand_stats[brand]['success'] += 1
        else:
            brand_stats[brand]['failed'] += 1

    for brand in sorted(brand_stats.keys()):
        stats = brand_stats[brand]
        total = stats['success'] + stats['failed']
        rate = stats['success'] / total * 100 if total > 0 else 0
        print(f"   {brand:15s} {stats['success']:2d}/{total:2d} ({rate:5.1f}%)")

    print()
    print("="*70)
    print(f"📈 Overall Success Rate: {success_rate:.1f}%")

    if success_rate >= 80:
        print("✅ TARGET ACHIEVED - 80%+ success rate")
    else:
        print(f"⚠️  BELOW TARGET - Achieved {success_rate:.1f}%, target was 80%")

    print("="*70)

    # Save failed list
    if failed:
        failed_list_path = Path("docs/2025-12-29-0430-CC-yolo-failed-extractions.txt")
        with open(failed_list_path, 'w') as f:
            f.write("Failed PDF Extractions (YOLO)\n")
            f.write("="*70 + "\n\n")
            for r in failed:
                f.write(f"{r['brand']:15s} {r['pdf']:40s} → {r['error']}\n")
        print(f"\n📝 Failed PDFs list saved to: {failed_list_path}")

if __name__ == '__main__':
    main()
