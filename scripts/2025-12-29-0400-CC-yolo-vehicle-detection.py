#!/usr/bin/env python3
"""
YOLO-Based Vehicle Detection for PDF Extraction
Uses YOLOv8 nano model (6MB) for accurate vehicle detection and cropping

Expected success rate: 80-90%
Test batch: 5 failed PDFs from previous attempts
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

            # Save
            filename = f"{brand.lower()}-{model.lower()}.jpg"
            output_path = Path("public/images/vehicles/hero") / filename
            cropped.save(output_path, "JPEG", quality=90, optimize=True)

            results['success'] = True
            results['output_path'] = output_path

            return results

    except Exception as e:
        results['error'] = str(e)
        return results

def main():
    print("="*70)
    print("YOLO-BASED VEHICLE DETECTION - Test Batch (5 Failed PDFs)")
    print("="*70)
    print()

    # Load YOLOv8 nano model (6MB, fast)
    print("📥 Loading YOLOv8n model...")
    yolo_model = YOLO('yolov8n.pt')
    print("   ✅ Model loaded successfully")
    print()

    # Test on 5 PDFs that failed with OpenCV approach
    test_pdfs = [
        "pdfs/Hyundai/hyundai_official/Accent_RB_2024.pdf",
        "pdfs/Toyota/toyota_official/Land_Cruiser_250_2025.pdf",
        "pdfs/Nissan/nissan_official/Sunny_2025.pdf",
        "pdfs/Renault/renault_official/Duster_2024.pdf",
        "pdfs/MG/mg_official/MG_4_EV_2025.pdf",
    ]

    # Filter to only existing PDFs
    test_pdfs = [p for p in test_pdfs if Path(p).exists()]

    print(f"📁 Testing {len(test_pdfs)} PDFs that failed with OpenCV:\\n")

    results = []

    for pdf_path_str in test_pdfs:
        pdf_path = Path(pdf_path_str)
        brand = pdf_path.parent.parent.name
        model = normalize_model_name(pdf_path.name, brand)

        print(f"🔄 Processing: {brand} - {pdf_path.name}")

        result = extract_vehicle_with_yolo(pdf_path, brand, model, yolo_model)
        result['brand'] = brand
        result['model'] = model
        result['pdf'] = pdf_path.name

        if result['success']:
            file_size_kb = result['output_path'].stat().st_size / 1024
            bbox = result['bbox']
            crop_width = bbox[2] - bbox[0]
            crop_height = bbox[3] - bbox[1]

            print(f"   ✅ SUCCESS")
            print(f"      Page: {result['page_selected']} (confidence: {result['confidence']:.2f}, detections: {result['detections']})")
            print(f"      Crop: {crop_width}x{crop_height}px")
            print(f"      Output: {result['output_path'].name} ({file_size_kb:.0f}KB)")
        else:
            print(f"   ❌ FAILED: {result['error']}")

        print()
        results.append(result)

    # Summary
    print("="*70)
    print("📊 YOLO TEST BATCH RESULTS")
    print("="*70)

    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]

    print(f"\\n✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")

    if successful:
        print(f"\\n✅ EXTRACTED IMAGES:")
        for r in successful:
            print(f"   - {r['brand']:15s} {r['model']:30s} (page {r['page_selected']}, conf {r['confidence']:.2f})")

    if failed:
        print(f"\\n❌ FAILED PDFs:")
        for r in failed:
            print(f"   - {r['brand']:15s} {r['pdf']:40s} → {r['error']}")

    print("\\n" + "="*70)

    success_rate = len(successful) / len(results) * 100 if results else 0
    print(f"📈 Success Rate: {success_rate:.0f}% ({len(successful)}/{len(results)})")

    if success_rate >= 80:
        print("✅ TEST PASSED - Ready for full extraction on 84 PDFs")
    else:
        print("⚠️  TEST BELOW TARGET - Review and optimize before full run")

    print("="*70)

if __name__ == '__main__':
    main()
