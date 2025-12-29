#!/usr/bin/env python3
"""
FIXED PDF Image Extraction - Extract Embedded Images Only
Filters for high-quality vehicle hero shots (NOT full page layouts)

Fixes:
- ❌ Hyundai Accent spec table overlay → ✅ Clean vehicle photo
- ❌ MG 4 EV dual view → ✅ Single hero shot
"""

import pdfplumber
from PIL import Image
from pathlib import Path
import io
import re

def normalize_model_name(filename):
    """Extract and normalize model name from PDF filename"""
    # Remove file extension
    name = Path(filename).stem

    # Remove brand prefix patterns
    name = re.sub(r'^[A-Z]+_', '', name)

    # Replace underscores with hyphens
    name = name.replace('_', '-')

    # Convert to lowercase
    name = name.lower()

    return name

def extract_embedded_images_from_pdf(pdf_path, output_dir, brand):
    """
    Extract high-quality embedded images from PDF (NOT full pages)

    Filters:
    - Width >= 1000px (high-res only)
    - Aspect ratio 1.2:1 to 2.5:1 (typical vehicle photos)
    - Largest image per PDF (hero image)
    """
    model = normalize_model_name(pdf_path.name)
    extracted = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            all_images = []

            # Scan first 5 pages for embedded images
            for page_num in range(min(5, len(pdf.pages))):
                page = pdf.pages[page_num]

                # Extract images embedded in PDF
                if hasattr(page, 'images') and page.images:
                    for img_info in page.images:
                        # Get image dimensions
                        width = img_info.get('width', 0)
                        height = img_info.get('height', 0)

                        if width >= 1000 and height >= 600:  # High-res filter
                            aspect_ratio = width / height if height > 0 else 0

                            # Vehicle photos typically 1.2:1 to 2.5:1 aspect ratio
                            if 1.2 <= aspect_ratio <= 2.5:
                                all_images.append({
                                    'page': page_num,
                                    'width': width,
                                    'height': height,
                                    'x0': img_info.get('x0', 0),
                                    'y0': img_info.get('y0', 0),
                                    'x1': img_info.get('x1', 0),
                                    'y1': img_info.get('y1', 0),
                                    'name': img_info.get('name', ''),
                                })

            if not all_images:
                print(f"  ⚠️  No suitable embedded images found in {pdf_path.name}")
                return []

            # Select largest image (likely the hero image)
            largest = max(all_images, key=lambda x: x['width'] * x['height'])
            page = pdf.pages[largest['page']]

            print(f"  📐 Found image: {largest['width']}x{largest['height']}px on page {largest['page']+1}")

            # Extract image using coordinates
            bbox = (largest['x0'], largest['y0'], largest['x1'], largest['y1'])

            # Crop to image bounds
            cropped = page.crop(bbox)
            img_obj = cropped.to_image(resolution=150)
            pil_image = img_obj.original

            # Resize to standard width (1600px max)
            if pil_image.width > 1600:
                target_width = 1600
                aspect = pil_image.height / pil_image.width
                target_height = int(target_width * aspect)
                pil_image = pil_image.resize((target_width, target_height), Image.LANCZOS)

            # Generate filename
            hero_filename = f"{brand.lower()}-{model}.jpg"

            # Save hero image
            hero_path = output_dir / "hero" / hero_filename
            pil_image.save(hero_path, "JPEG", quality=90, optimize=True)
            extracted.append(hero_path)

            # Save hover image (same source for now)
            hover_path = output_dir / "hover" / hero_filename
            pil_image.save(hover_path, "JPEG", quality=90, optimize=True)
            extracted.append(hover_path)

            file_size_kb = hero_path.stat().st_size / 1024
            print(f"  ✅ Extracted: {hero_filename} ({pil_image.width}x{pil_image.height}px, {file_size_kb:.0f}KB)")

    except Exception as e:
        print(f"  ❌ Extraction failed for {pdf_path.name}: {e}")
        return []

    return extracted

def main():
    print("="*70)
    print("FIXED PDF EXTRACTION - Embedded Images Only (NOT Full Pages)")
    print("="*70)
    print("Filters:")
    print("  - Width >= 1000px (high-res only)")
    print("  - Aspect ratio 1.2:1 to 2.5:1 (vehicle photos)")
    print("  - Largest image per PDF (hero shot)")
    print()

    output_dir = Path("public/images/vehicles")
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "hero").mkdir(exist_ok=True)
    (output_dir / "hover").mkdir(exist_ok=True)

    # Backup defective images first
    print("📦 Backing up defective images...")
    backup_dir = Path("/tmp/defective_extractions")
    backup_dir.mkdir(exist_ok=True)

    defective_patterns = [
        "hyundai-accent-rb-2024.jpg",
        "hyundai-accent-rb-gl-dab-abs-plus-prime-equiv-2025.jpg",
        "mg-mg-4-ev-2024.jpg",
        "mg-mg-4-ev-2025.jpg"
    ]

    for pattern in defective_patterns:
        hero_file = output_dir / "hero" / pattern
        if hero_file.exists():
            import shutil
            shutil.copy(hero_file, backup_dir / pattern)
            print(f"  💾 Backed up: {pattern}")

    print()

    # Process all PDFs
    total_extracted = 0
    total_failed = 0
    failed_pdfs = []

    pdfs = sorted(Path("pdfs").rglob("*_official/*.pdf"))
    print(f"📁 Found {len(pdfs)} manufacturer PDFs\n")

    for pdf_path in pdfs:
        brand = pdf_path.parent.parent.name

        print(f"📄 Processing: {brand} - {pdf_path.name}")

        images = extract_embedded_images_from_pdf(pdf_path, output_dir, brand)

        if images:
            total_extracted += len(images) // 2  # Count hero+hover as 1 model
        else:
            total_failed += 1
            failed_pdfs.append(str(pdf_path))

    print("\n" + "="*70)
    print("📊 EXTRACTION SUMMARY")
    print("="*70)
    print(f"✅ Successfully extracted: {total_extracted} models")
    print(f"❌ Failed (no embedded images): {total_failed} PDFs")
    print(f"📁 Total PDFs processed: {len(pdfs)}")
    print("="*70)

    if failed_pdfs:
        print("\n⚠️  PDFs without suitable embedded images:")
        for pdf in failed_pdfs[:10]:
            print(f"   - {pdf}")
        if len(failed_pdfs) > 10:
            print(f"   ... and {len(failed_pdfs) - 10} more")

        # Save failed list
        failed_list_path = Path("docs/2025-12-29-0210-CC-failed-pdf-extractions.txt")
        with open(failed_list_path, 'w') as f:
            f.write('\n'.join(failed_pdfs))
        print(f"\n📝 Failed PDFs list saved to: {failed_list_path}")

    print("\n✅ FIXED EXTRACTION COMPLETE")
    print("\nNext steps:")
    print("1. Verify quality of re-extracted images (Hyundai Accent, MG 4 EV)")
    print("2. Compare with reference quality (BMW X6, Toyota LC)")
    print("3. If all pass, execute Phase 3 SQL mapping")

if __name__ == '__main__':
    main()
