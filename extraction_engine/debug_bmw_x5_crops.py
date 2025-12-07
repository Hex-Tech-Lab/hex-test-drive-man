#!/usr/bin/env python3
"""
BMW X5 Debug Crop Script
Generates individual cropped table images for visual inspection
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path


# Current crop coordinates from bmw_x5_table_replicas.py
# Format: (x, y, width, height)
CROP_COORDINATES = {
    "table-1": {
        "coords": (27, 100, 625, 630),
        "description": "Top-left main specifications table"
    },
    "table-2": {
        "coords": (680, 100, 590, 500),
        "description": "Top-right continuation table"
    },
    "table-3": {
        "coords": (680, 655, 590, 190),
        "description": "Bottom TECHNICAL DATA table"
    }
}


def add_border_and_label(img: Image.Image, label: str, coords: tuple) -> Image.Image:
    """
    Add red border and coordinate label to cropped image for debugging

    Args:
        img: Cropped image
        label: Label text (e.g., "Table 1")
        coords: Crop coordinates (x, y, w, h)

    Returns:
        Image with border and label
    """
    # Create new image with padding for border
    border_width = 5
    new_width = img.width + (border_width * 2)
    new_height = img.height + (border_width * 2) + 40  # Extra space for label

    bordered = Image.new('RGB', (new_width, new_height), color='white')

    # Draw red border
    draw = ImageDraw.Draw(bordered)
    draw.rectangle(
        [(0, 0), (new_width - 1, new_height - 41)],
        outline='red',
        width=border_width
    )

    # Paste original image
    bordered.paste(img, (border_width, border_width))

    # Add label with coordinates
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except:
        font = ImageFont.load_default()

    x, y, w, h = coords
    label_text = f"{label}: x={x}, y={y}, w={w}, h={h}"
    draw.text((10, new_height - 30), label_text, fill='black', font=font)

    return bordered


def crop_and_save_debug_images(
    source_image_path: str,
    output_dir: str = "pdf_images"
) -> None:
    """
    Crop BMW X5 tables and save debug images

    Args:
        source_image_path: Path to original PDF page image
        output_dir: Directory to save debug crops
    """
    print(f"\n{'='*80}")
    print("BMW X5 Debug Crop Script")
    print(f"{'='*80}\n")

    # Load source image
    print(f"📂 Loading source image: {source_image_path}")
    source_img = Image.open(source_image_path)
    print(f"  ✅ Image dimensions: {source_img.width}x{source_img.height}px\n")

    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # Process each table
    for table_name, config in CROP_COORDINATES.items():
        coords = config["coords"]
        description = config["description"]

        print(f"🔧 Processing {table_name}: {description}")
        print(f"  📐 Coordinates: x={coords[0]}, y={coords[1]}, w={coords[2]}, h={coords[3]}")

        # Extract coordinates
        x, y, w, h = coords

        # Crop region (Pillow uses: left, upper, right, lower)
        cropped = source_img.crop((x, y, x + w, y + h))
        print(f"  ✅ Cropped region: {cropped.width}x{cropped.height}px")

        # Add border and label for debugging
        debug_img = add_border_and_label(cropped, table_name.upper(), coords)

        # Save debug image
        base_name = Path(source_image_path).stem
        output_file = output_path / f"{base_name}-{table_name}-debug.png"
        debug_img.save(output_file)
        print(f"  💾 Saved: {output_file}")
        print()

    print(f"{'='*80}")
    print("✅ DEBUG CROPS COMPLETE")
    print(f"{'='*80}\n")

    print("Generated files:")
    for table_name in CROP_COORDINATES.keys():
        base_name = Path(source_image_path).stem
        print(f"  • {output_dir}/{base_name}-{table_name}-debug.png")
    print()

    print("Next steps:")
    print("  1. Open each debug PNG and visually verify:")
    print("     - Table is completely visible (not cut off)")
    print("     - No extra whitespace or adjacent content")
    print("     - Header and all rows are included")
    print("  2. If crops are incorrect, adjust coordinates in CROP_COORDINATES")
    print("  3. Re-run this script until crops are perfect")
    print("  4. Update bmw_x5_table_replicas.py with final coordinates")
    print()


def main():
    """Main execution"""
    source_image = "pdf_images/bmw_x5_page15-15.png"

    # Verify source image exists
    if not Path(source_image).exists():
        print(f"❌ Error: Source image not found: {source_image}")
        print("   Expected path: pdf_images/bmw_x5_page15-15.png")
        return 1

    crop_and_save_debug_images(source_image)
    return 0


if __name__ == "__main__":
    exit(main())
