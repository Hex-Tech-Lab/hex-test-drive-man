#!/usr/bin/env python3
"""
Visual Validation Tool for Gemini Extraction Results
Generates side-by-side comparison PNG: Original PDF + Extracted Table
"""

import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
# Built-in generics used instead of dict/List


def load_extraction_result(json_path: str) -> dict:
    """Load extraction JSON result"""
    with open(json_path, 'r') as f:
        return json.load(f)


def create_table_image(data: dict, width: int = 1200, font_size: int = 12) -> Image.Image:
    """
    Render extraction result as table image

    Args:
        data: Extraction result JSON
        width: Target image width
        font_size: Base font size

    Returns:
        PIL Image of rendered table
    """
    specs = data.get('specs', [])
    trims = data.get('trims', [])

    # Estimate height based on spec count
    row_height = font_size + 10
    header_height = font_size + 15
    height = header_height + (len(specs) * row_height) + 100

    # Create image with white background
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    # Try to use a decent font, fall back to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size + 2)
    except (OSError, IOError):
        font = ImageFont.load_default()
        font_bold = font

    y_offset = 20

    # Title
    draw.text((10, y_offset), "Gemini 2.5-flash Extraction Result", fill='black', font=font_bold)
    y_offset += header_height + 10

    # Draw table headers
    draw.text((10, y_offset), "Category", fill='black', font=font_bold)
    draw.text((250, y_offset), "Subcategory", fill='black', font=font_bold)
    draw.text((500, y_offset), "Label", fill='black', font=font_bold)

    # Draw trim headers (dynamic based on trims)
    trim_x = 800
    for i, trim in enumerate(trims):
        draw.text((trim_x + i * 200, y_offset), trim, fill='black', font=font_bold)

    y_offset += header_height

    # Draw horizontal line under headers
    draw.line([(10, y_offset), (width - 10, y_offset)], fill='gray', width=2)
    y_offset += 10

    # Draw specs
    current_category = None
    for spec in specs:
        category = spec.get('category', '')
        subcategory = spec.get('subcategory', '')
        label = spec.get('label', '')
        values = spec.get('values', {})

        # Category separator (light gray background if category changes)
        if category != current_category:
            draw.rectangle([(0, y_offset), (width, y_offset + row_height)], fill='#f0f0f0')
            current_category = category

        # Draw spec row (handle None values)
        draw.text((10, y_offset), (category or '')[:30], fill='black', font=font)
        draw.text((250, y_offset), (subcategory or '')[:30], fill='black', font=font)
        draw.text((500, y_offset), (label or '')[:40], fill='black', font=font)

        # Draw values for each trim
        trim_x = 800
        for i, trim in enumerate(trims):
            value = values.get(trim, '-')
            draw.text((trim_x + i * 200, y_offset), str(value)[:25], fill='black', font=font)

        y_offset += row_height

    # Summary footer
    y_offset += 20
    draw.line([(10, y_offset), (width - 10, y_offset)], fill='gray', width=2)
    y_offset += 15

    summary = f"Total Specs: {len(specs)} | Trims: {len(trims)} | Model: {data.get('metadata', {}).get('model_used', 'N/A')}"
    draw.text((10, y_offset), summary, fill='blue', font=font_bold)

    # Crop to actual content
    return img.crop((0, 0, width, y_offset + 40))


def create_side_by_side_comparison(
    original_pdf_path: str,
    extraction_json_path: str,
    output_path: str
) -> dict:
    """
    Create side-by-side comparison PNG

    Args:
        original_pdf_path: Path to original PDF page image
        extraction_json_path: Path to extraction JSON
        output_path: Output PNG path

    Returns:
        Validation metrics dict
    """
    # Load extraction result
    data = load_extraction_result(extraction_json_path)

    # Load original PDF image
    original_img = Image.open(original_pdf_path)

    # Create table image from extraction
    table_img = create_table_image(data)

    # Resize images to same height for side-by-side
    target_height = max(original_img.height, table_img.height)

    # Resize original if needed (maintain aspect ratio)
    if original_img.height != target_height:
        ratio = target_height / original_img.height
        original_img = original_img.resize(
            (int(original_img.width * ratio), target_height),
            Image.LANCZOS
        )

    # Resize table if needed
    if table_img.height != target_height:
        ratio = target_height / table_img.height
        table_img = table_img.resize(
            (int(table_img.width * ratio), target_height),
            Image.LANCZOS
        )

    # Create side-by-side canvas
    total_width = original_img.width + table_img.width + 40  # 40px gap
    combined = Image.new('RGB', (total_width, target_height + 60), color='white')

    # Add title
    draw = ImageDraw.Draw(combined)
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except (OSError, IOError):
        title_font = ImageFont.load_default()

    draw.text((20, 10), "ORIGINAL PDF (Left)", fill='red', font=title_font)
    draw.text((original_img.width + 60, 10), "GEMINI EXTRACTION (Right)", fill='blue', font=title_font)

    # Paste images
    combined.paste(original_img, (20, 50))
    combined.paste(table_img, (original_img.width + 40, 50))

    # Save
    combined.save(output_path)

    # Generate validation metrics
    specs_count = len(data.get('specs', []))
    trims_count = len(data.get('trims', []))

    metrics = {
        "specs_extracted": specs_count,
        "trims_detected": trims_count,
        "output_path": output_path,
        "requires_manual_review": True,
        "threshold": "95%+ (116/122 specs)",
        "model": data.get('metadata', {}).get('model_used', 'Unknown')
    }

    return metrics


def main():
    if len(sys.argv) < 3:
        print("Usage: python visual_validator.py <extraction_json> <original_pdf_png> [output_png]")
        print("Example: python visual_validator.py results/bmw_x5_gemini_flash.json ../pdf_images/bmw_x5_page15-15.png")
        sys.exit(1)

    extraction_json = sys.argv[1]
    original_pdf_png = sys.argv[2]
    output_png = sys.argv[3] if len(sys.argv) > 3 else "../validation/bmw_x5_flash_visual.png"

    print(f"\n{'='*80}")
    print("VISUAL VALIDATION - BMW X5 Baseline")
    print(f"{'='*80}\n")

    print(f"Input JSON: {extraction_json}")
    print(f"Original PDF: {original_pdf_png}")
    print(f"Output PNG: {output_png}")
    print()

    # Create validation directory
    Path(output_png).parent.mkdir(parents=True, exist_ok=True)

    # Generate comparison
    metrics = create_side_by_side_comparison(
        original_pdf_png,
        extraction_json,
        output_png
    )

    print("✅ Visual comparison generated successfully!")
    print()
    print("Validation Metrics:")
    print(f"  Specs Extracted: {metrics['specs_extracted']}")
    print(f"  Trims Detected: {metrics['trims_detected']}")
    print(f"  Model Used: {metrics['model']}")
    print(f"  Output: {metrics['output_path']}")
    print()
    print(f"⚠️  MANUAL REVIEW REQUIRED")
    print(f"  Threshold: {metrics['threshold']}")
    print(f"  Action: Open {output_png} and visually verify:")
    print(f"    1. No hallucinated specs")
    print(f"    2. 95%+ specs match PDF (116/122 minimum)")
    print(f"    3. Correct hierarchical structure")
    print()
    print("Next Steps:")
    print("  PASS (≥95%): Proceed to Phase 2 (BMW X1, Corolla, Chevrolet)")
    print("  FAIL (<95%): Refine prompt → Re-run → Re-validate")
    print()


if __name__ == "__main__":
    main()
