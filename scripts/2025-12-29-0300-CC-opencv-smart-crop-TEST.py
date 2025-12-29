#!/usr/bin/env python3
"""
TEST: Smart PDF Cropping with OpenCV - Process 5-10 PDFs for Quality Verification
Uses computer vision to detect and crop vehicle from full PDF pages
"""

import pdfplumber
from PIL import Image
import cv2
import numpy as np
from pathlib import Path
import re

def score_page_for_vehicle(img_array):
    """Score a page based on likelihood of containing a good vehicle image"""
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)

    # Edge detection
    edges = cv2.Canny(gray, 50, 150)

    # Count edge pixels (more edges = more detail = better vehicle image)
    edge_density = np.count_nonzero(edges) / edges.size

    # Check for large contiguous regions (vehicles)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return 0, None

    # Find largest contour
    largest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour)

    area_ratio = (w * h) / (img_array.shape[0] * img_array.shape[1])
    aspect_ratio = w / h if h > 0 else 0

    # Score: favor large objects with vehicle-like aspect ratios
    score = 0
    if 0.15 < area_ratio < 0.7:  # Object takes 15-70% of page
        score += 40
    if 1.3 < aspect_ratio < 2.5:  # Vehicle-like aspect ratio
        score += 40
    if edge_density > 0.05:  # Rich in detail
        score += 20

    bbox = (x, y, w, h)
    return score, bbox

def extract_vehicle_from_pdf(pdf_path, brand, model):
    """
    Extract vehicle image using smart cropping:
    1. Try first 3 pages
    2. Score each page for vehicle likelihood
    3. Select best page
    4. Detect vehicle bounding box with OpenCV
    5. Crop with margin
    """
    results = {
        'success': False,
        'page_selected': None,
        'score': 0,
        'bbox': None,
        'output_path': None,
        'error': None
    }

    try:
        with pdfplumber.open(pdf_path) as pdf:
            page_scores = []

            # Score first 3 pages
            for page_num in range(min(3, len(pdf.pages))):
                page = pdf.pages[page_num]

                # Render to image
                img_obj = page.to_image(resolution=150)
                pil_img = img_obj.original
                img_array = np.array(pil_img)

                # Score this page
                score, bbox = score_page_for_vehicle(img_array)
                page_scores.append((page_num, score, bbox, pil_img, img_array))

            # Select best page
            best_page_num, best_score, best_bbox, best_pil_img, best_img_array = max(
                page_scores, key=lambda x: x[1]
            )

            if best_score < 30:  # Threshold for minimum quality
                results['error'] = f"Low quality score: {best_score}"
                return results

            results['page_selected'] = best_page_num
            results['score'] = best_score

            # Extract vehicle region
            if best_bbox:
                x, y, w, h = best_bbox

                # Add 10% margin
                margin_w = int(w * 0.10)
                margin_h = int(h * 0.10)

                x1 = max(0, x - margin_w)
                y1 = max(0, y - margin_h)
                x2 = min(best_img_array.shape[1], x + w + margin_w)
                y2 = min(best_img_array.shape[0], y + h + margin_h)

                # Crop using PIL
                cropped = best_pil_img.crop((x1, y1, x2, y2))

                # Resize to standard width (1600px max)
                if cropped.width > 1600:
                    target_width = 1600
                    aspect = cropped.height / cropped.width
                    target_height = int(target_width * aspect)
                    cropped = cropped.resize((target_width, target_height), Image.LANCZOS)

                results['bbox'] = (x1, y1, x2, y2)

                # Save
                filename = f"{brand.lower()}-{model.lower()}.jpg"
                output_path = Path("public/images/vehicles/hero") / filename
                cropped.save(output_path, "JPEG", quality=90, optimize=True)

                results['success'] = True
                results['output_path'] = output_path

                return results
            else:
                results['error'] = "No suitable bounding box found"
                return results

    except Exception as e:
        results['error'] = str(e)
        return results

def normalize_model_name(filename, brand):
    """Extract model name from PDF filename"""
    name = Path(filename).stem
    # Remove brand prefix if present
    name = re.sub(f'^{brand}_', '', name, flags=re.IGNORECASE)
    # Replace underscores and spaces with hyphens
    name = name.replace('_', '-').replace(' ', '-')
    return name.lower()

def main():
    print("="*70)
    print("TEST: Smart PDF Cropping with OpenCV (5-10 PDFs)")
    print("="*70)
    print()

    # Select test PDFs from different brands
    test_pdfs = [
        # Known issues from previous attempts
        "pdfs/Hyundai/hyundai_official/Accent_RB_2024.pdf",
        "pdfs/MG/mg_official/MG_4_EV_2025.pdf",
        # Known good from previous attempts
        "pdfs/BMW/bmw_official/X6_2025.pdf",
        "pdfs/Toyota/toyota_official/Land_Cruiser_250_2025.pdf",
        # New tests
        "pdfs/Chery/chery_official/Tiggo_3_2024.pdf",
        "pdfs/Nissan/nissan_official/Sunny_2025.pdf",
        "pdfs/Renault/renault_official/Duster_2024.pdf",
        "pdfs/Chevrolet/chevrolet_official/Captiva_2025.pdf",
    ]

    # Filter to only existing PDFs
    test_pdfs = [p for p in test_pdfs if Path(p).exists()]

    print(f"📁 Testing {len(test_pdfs)} PDFs:\n")

    results = []

    for pdf_path_str in test_pdfs:
        pdf_path = Path(pdf_path_str)
        brand = pdf_path.parent.parent.name
        model = normalize_model_name(pdf_path.name, brand)

        print(f"🔄 Processing: {brand} - {pdf_path.name}")

        result = extract_vehicle_from_pdf(pdf_path, brand, model)
        result['brand'] = brand
        result['model'] = model
        result['pdf'] = pdf_path.name

        if result['success']:
            file_size_kb = result['output_path'].stat().st_size / 1024
            bbox = result['bbox']
            crop_width = bbox[2] - bbox[0]
            crop_height = bbox[3] - bbox[1]

            print(f"   ✅ SUCCESS")
            print(f"      Page: {result['page_selected']} (score: {result['score']})")
            print(f"      Crop: {crop_width}x{crop_height}px")
            print(f"      Output: {result['output_path'].name} ({file_size_kb:.0f}KB)")
        else:
            print(f"   ❌ FAILED: {result['error']}")

        print()
        results.append(result)

    # Summary
    print("="*70)
    print("📊 TEST RESULTS SUMMARY")
    print("="*70)

    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]

    print(f"\n✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")

    if successful:
        print(f"\n✅ EXTRACTED IMAGES:")
        for r in successful:
            print(f"   - {r['brand']:15s} {r['model']:30s} (page {r['page_selected']}, score {r['score']})")

    if failed:
        print(f"\n❌ FAILED PDFs:")
        for r in failed:
            print(f"   - {r['brand']:15s} {r['pdf']:40s} → {r['error']}")

    print("\n" + "="*70)
    print("✅ TEST COMPLETE - Ready for visual quality verification")
    print("="*70)

if __name__ == '__main__':
    main()
