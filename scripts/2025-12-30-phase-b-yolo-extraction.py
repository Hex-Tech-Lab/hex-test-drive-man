#!/usr/bin/env python3
"""
Phase B: YOLO-Based PDF Extraction - pdfs_comprehensive (275 PDFs)
Uses YOLOv8 nano model for vehicle detection from manufacturer brochures

Expected success rate: 80-90%
Output: public/images/vehicles/hero/ and hover/
"""

import pdfplumber
from PIL import Image
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import re
import json
from datetime import datetime

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
            results['output_path'] = str(hero_path)

            return results

    except Exception as e:
        results['error'] = str(e)
        return results

def main():
    print("="*80)
    print("PHASE B: YOLO-BASED EXTRACTION - pdfs_comprehensive (275 PDFs)")
    print("="*80)
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Load YOLOv8 nano model (6MB, fast)
    print("📥 Loading YOLOv8n model...")
    yolo_model = YOLO('yolov8n.pt')
    print("   ✅ Model loaded successfully")
    print()

    # Find all manufacturer PDFs in pdfs_comprehensive
    pdfs = sorted(Path("pdfs_comprehensive").rglob("official/*.pdf"))
    print(f"📁 Found {len(pdfs)} manufacturer PDFs in pdfs_comprehensive/")
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
            file_size_kb = Path(result['output_path']).stat().st_size / 1024
            print(f"        ✅ Page {result['page_selected']} (conf {result['confidence']:.2f}) → {file_size_kb:.0f}KB")
            successful.append(result)
        else:
            print(f"        ❌ {result['error']}")
            failed.append(result)

        results.append(result)

    # Summary
    print()
    print("="*80)
    print("📊 PHASE B EXTRACTION RESULTS")
    print("="*80)

    success_rate = len(successful) / len(results) * 100 if results else 0

    print(f"\n✅ Successful: {len(successful)}/{len(results)} ({success_rate:.1f}%)")
    print(f"❌ Failed: {len(failed)}/{len(results)}")

    if failed:
        print(f"\n❌ FAILED PDFs ({len(failed)}):")
        for r in failed[:15]:
            print(f"   - {r['brand']:20s} {r['pdf']:50s} → {r['error']}")
        if len(failed) > 15:
            print(f"   ... and {len(failed) - 15} more")

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
        print(f"   {brand:20s} {stats['success']:3d}/{total:3d} ({rate:5.1f}%)")

    print()
    print("="*80)
    print(f"📈 Overall Success Rate: {success_rate:.1f}%")

    if success_rate >= 80:
        print("✅ TARGET ACHIEVED - 80%+ success rate")
    else:
        print(f"⚠️  BELOW TARGET - Achieved {success_rate:.1f}%, target was 80%")

    print(f"⏰ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)

    # Save detailed results
    results_path = Path("docs/2025-12-30-phase-b-extraction-results.json")
    with open(results_path, 'w') as f:
        # Prepare serializable results
        serializable_results = []
        for r in results:
            serializable_results.append({
                'brand': r['brand'],
                'model': r['model'],
                'pdf': r['pdf'],
                'success': r['success'],
                'page_selected': r['page_selected'],
                'confidence': r['confidence'],
                'detections': r.get('detections', 0),
                'output_path': r['output_path'],
                'error': r['error']
            })
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_pdfs': len(pdfs),
            'successful': len(successful),
            'failed': len(failed),
            'success_rate': success_rate,
            'results': serializable_results
        }, f, indent=2)
    print(f"\n📝 Detailed results saved to: {results_path}")

    # Save failed list
    if failed:
        failed_list_path = Path("docs/2025-12-30-phase-b-failed-extractions.txt")
        with open(failed_list_path, 'w') as f:
            f.write(f"Phase B: Failed PDF Extractions (YOLO)\n")
            f.write(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*80 + "\n\n")
            for r in failed:
                f.write(f"{r['brand']:20s} {r['pdf']:50s} → {r['error']}\n")
        print(f"📝 Failed PDFs list saved to: {failed_list_path}")

if __name__ == '__main__':
    main()
