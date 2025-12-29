#!/usr/bin/env python3
"""
Image Normalization Script - IrfanView-Equivalent with Pillow
Normalizes vehicle images: sharpening, margin expansion, size optimization

Target: ~200KB per image
Margin variations: 10%, 20%, 30%
"""

from PIL import Image, ImageFilter, ImageEnhance
from pathlib import Path
import os

def unsharp_mask(image, radius=2, percent=150, threshold=3):
    """
    Apply unsharp mask for sharpening (equivalent to IrfanView sharpen)

    Args:
        radius: Blur radius (larger = more aggressive sharpening)
        percent: Sharpening strength (100 = normal, 150 = strong)
        threshold: Minimum brightness change to sharpen
    """
    return image.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=threshold))

def add_margin(image, margin_percent=10, bg_color=(255, 255, 255)):
    """
    Add margin around image (expand canvas)

    Args:
        margin_percent: Margin size as percentage of image dimensions
        bg_color: Background color (white default)
    """
    width, height = image.size

    # Calculate margin in pixels
    margin_w = int(width * (margin_percent / 100))
    margin_h = int(height * (margin_percent / 100))

    # Create new image with margins
    new_width = width + (margin_w * 2)
    new_height = height + (margin_h * 2)

    new_image = Image.new('RGB', (new_width, new_height), bg_color)
    new_image.paste(image, (margin_w, margin_h))

    return new_image

def optimize_to_target_size(image, target_kb=200, min_quality=50, max_quality=95):
    """
    Optimize image compression to target file size

    Binary search for optimal quality level
    """
    import io

    best_quality = max_quality
    best_data = None

    # Binary search for optimal quality
    low, high = min_quality, max_quality

    while low <= high:
        mid = (low + high) // 2

        # Test compression at this quality
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=mid, optimize=True)
        size_kb = len(buffer.getvalue()) / 1024

        if size_kb <= target_kb:
            # Under target, try higher quality
            best_quality = mid
            best_data = buffer.getvalue()
            low = mid + 1
        else:
            # Over target, reduce quality
            high = mid - 1

    return best_quality, best_data

def normalize_image(input_path, output_dir, margin_percent=10, target_kb=200, apply_sharpen=False):
    """
    Normalize a single image:
    1. Optional sharpening (unsharp mask)
    2. Add margin
    3. Optimize to target size

    Returns:
        dict with results (original_size, new_size, quality, etc.)
    """
    results = {
        'success': False,
        'input_file': Path(input_path).name,
        'original_size_kb': 0,
        'normalized_size_kb': 0,
        'quality_used': 0,
        'margin_percent': margin_percent,
        'sharpened': apply_sharpen,
        'output_file': None,
        'error': None
    }

    try:
        # Get original file size
        results['original_size_kb'] = os.path.getsize(input_path) / 1024

        # Load image
        image = Image.open(input_path)

        # Convert to RGB if needed (handles RGBA, grayscale, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Apply sharpening if requested
        if apply_sharpen:
            image = unsharp_mask(image, radius=2, percent=150, threshold=3)

        # Add margin
        image = add_margin(image, margin_percent=margin_percent)

        # Optimize to target size
        quality, data = optimize_to_target_size(image, target_kb=target_kb)

        results['quality_used'] = quality
        results['normalized_size_kb'] = len(data) / 1024

        # Generate output filename
        input_name = Path(input_path).stem
        output_filename = f"{input_name}_margin{margin_percent}.jpg"
        output_path = output_dir / output_filename

        # Save optimized image
        with open(output_path, 'wb') as f:
            f.write(data)

        results['success'] = True
        results['output_file'] = output_filename

    except Exception as e:
        results['error'] = str(e)

    return results

def select_test_images():
    """
    Select 5 diverse images for testing:
    1. Large file (400-600KB)
    2. Small file (29-49KB)
    3. Grainy image (Hyundai i20)
    4. Perfect image (BMW/Audi)
    5. Text overlay image
    """
    hero_dir = Path("public/images/vehicles/hero")

    # Get all images with sizes
    images = []
    for img_path in hero_dir.glob("*.jpg"):
        size_kb = os.path.getsize(img_path) / 1024
        images.append({
            'path': img_path,
            'name': img_path.name,
            'size_kb': size_kb
        })

    # Sort by size
    images.sort(key=lambda x: x['size_kb'])

    selected = {
        'large': None,
        'small': None,
        'grainy': None,
        'perfect': None,
        'text_overlay': None
    }

    # 1. Large file (400-600KB)
    for img in reversed(images):
        if 400 <= img['size_kb'] <= 600:
            selected['large'] = img['path']
            break

    # 2. Small file (29-49KB)
    for img in images:
        if 29 <= img['size_kb'] <= 49:
            selected['small'] = img['path']
            break

    # 3. Grainy image (search for Hyundai i20 or similar)
    for img in images:
        if 'i20' in img['name'].lower() or 'hyundai' in img['name'].lower():
            selected['grainy'] = img['path']
            break

    # 4. Perfect image (BMW or Audi)
    for img in images:
        if 'bmw' in img['name'].lower() or 'audi' in img['name'].lower():
            if selected['perfect'] is None:
                selected['perfect'] = img['path']
                break

    # 5. Text overlay (look for known examples)
    for img in images:
        if 'captiva' in img['name'].lower() or 'chevrolet' in img['name'].lower():
            selected['text_overlay'] = img['path']
            break

    # Fill missing with random samples
    for key, value in selected.items():
        if value is None and images:
            selected[key] = images[0]['path']
            images.pop(0)

    return selected

def main():
    print("="*70)
    print("IMAGE NORMALIZATION - Test Batch (5 images x 3 margins = 15 outputs)")
    print("="*70)
    print()

    # Create output directory
    output_dir = Path("public/images/vehicles/hero_test_normalized")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Select test images
    print("📁 Selecting 5 diverse test images...")
    test_images = select_test_images()

    for category, path in test_images.items():
        if path:
            size_kb = os.path.getsize(path) / 1024
            print(f"   {category:15s}: {path.name:40s} ({size_kb:6.1f} KB)")
    print()

    # Test with 3 margin variations
    margins = [10, 20, 30]
    all_results = []

    print("🔄 Processing with margin variations (10%, 20%, 30%)...")
    print()

    for category, path in test_images.items():
        if not path:
            continue

        print(f"📷 {category.upper()}: {path.name}")

        # Determine if sharpening needed (grainy images)
        apply_sharpen = (category == 'grainy')

        for margin in margins:
            result = normalize_image(
                input_path=path,
                output_dir=output_dir,
                margin_percent=margin,
                target_kb=200,
                apply_sharpen=apply_sharpen
            )

            result['category'] = category
            all_results.append(result)

            if result['success']:
                print(f"   ✅ Margin {margin:2d}%: {result['original_size_kb']:6.1f}KB → "
                      f"{result['normalized_size_kb']:6.1f}KB (Q{result['quality_used']})")
            else:
                print(f"   ❌ Margin {margin:2d}%: FAILED - {result['error']}")

        print()

    # Summary
    print("="*70)
    print("📊 TEST RESULTS SUMMARY")
    print("="*70)
    print()

    successful = [r for r in all_results if r['success']]
    failed = [r for r in all_results if not r['success']]

    print(f"✅ Successful: {len(successful)}/15")
    print(f"❌ Failed: {len(failed)}/15")
    print()

    # Quality assessment by category
    print("📈 QUALITY ASSESSMENT BY CATEGORY:")
    print()

    for category in ['large', 'small', 'grainy', 'perfect', 'text_overlay']:
        category_results = [r for r in successful if r.get('category') == category]

        if category_results:
            print(f"{category.upper()}:")
            for r in category_results:
                reduction = ((r['original_size_kb'] - r['normalized_size_kb']) / r['original_size_kb'] * 100)
                print(f"  Margin {r['margin_percent']:2d}%: "
                      f"{r['original_size_kb']:6.1f}KB → {r['normalized_size_kb']:6.1f}KB "
                      f"({reduction:+5.1f}% reduction, Q{r['quality_used']})")
            print()

    # Size distribution
    print("📊 SIZE DISTRIBUTION:")
    avg_size = sum(r['normalized_size_kb'] for r in successful) / len(successful) if successful else 0
    min_size = min(r['normalized_size_kb'] for r in successful) if successful else 0
    max_size = max(r['normalized_size_kb'] for r in successful) if successful else 0

    print(f"   Average: {avg_size:.1f} KB")
    print(f"   Min: {min_size:.1f} KB")
    print(f"   Max: {max_size:.1f} KB")
    print(f"   Target: 200.0 KB")
    print()

    # Margin comparison
    print("📐 MARGIN IMPACT:")
    for margin in margins:
        margin_results = [r for r in successful if r['margin_percent'] == margin]
        if margin_results:
            avg_quality = sum(r['quality_used'] for r in margin_results) / len(margin_results)
            avg_size = sum(r['normalized_size_kb'] for r in margin_results) / len(margin_results)
            print(f"   {margin:2d}% margin: Avg size {avg_size:6.1f}KB, Avg quality Q{avg_quality:.0f}")
    print()

    print("="*70)
    print("✅ TEST COMPLETE")
    print("="*70)
    print()
    print(f"📁 Output directory: {output_dir}")
    print(f"📸 Total images generated: {len(successful)}")
    print()
    print("Next steps:")
    print("1. Visual inspection of normalized images")
    print("2. Compare quality: 10% vs 20% vs 30% margins")
    print("3. If 4/5 categories pass → batch process all 174 images")

if __name__ == '__main__':
    main()
