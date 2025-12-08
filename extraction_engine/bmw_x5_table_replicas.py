#!/usr/bin/env python3
"""
BMW X5 Three-Table Visual Replicas
Generates side-by-side comparisons of original PDF tables vs HTML replicas
Hard-coded for BMW X5 page 15 only
"""

import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, List, Tuple
import subprocess
import tempfile


# Hard-coded crop coordinates for BMW X5 page 15 tables (x, y, width, height)
TABLE_CROPS = {
    "table1": (27, 100, 625, 630),    # Top-left main specifications table
    "table2": (680, 100, 590, 500),   # Top-right continuation table
    "table3": (680, 655, 590, 190)    # Bottom TECHNICAL DATA table
}


def load_extraction_json(json_path: str) -> Dict:
    """Load Gemini extraction result"""
    with open(json_path, 'r') as f:
        return json.load(f)


def crop_table_from_pdf(pdf_image_path: str, table_name: str, output_dir: Path) -> str:
    """
    Crop a specific table region from the PDF image

    Args:
        pdf_image_path: Path to original PDF PNG
        table_name: Name of table (table1, table2, table3)
        output_dir: Directory to save cropped image

    Returns:
        Path to cropped image
    """
    img = Image.open(pdf_image_path)
    x, y, w, h = TABLE_CROPS[table_name]

    # Crop region
    cropped = img.crop((x, y, x + w, y + h))

    # Save cropped image
    output_path = output_dir / f"{table_name}_original_crop.png"
    cropped.save(output_path)

    return str(output_path)


def map_specs_to_table1(specs: List[Dict]) -> List[Dict]:
    """
    Map JSON specs to Table 1 (top-left big table)

    Includes categories:
    - Engines & Transmissions
    - Equipment (all subcategories except those in table2)
    - Performance
    - Exterior
    - Interior

    Deterministic rule: Categories that appear in left column of PDF
    """
    table1_categories = {
        "Engines & Transmissions",
        "Equipment",  # All Safety subcategory specs
        "Performance",
        "Exterior",
        "Interior"
    }

    return [
        spec for spec in specs
        if spec.get("category") in table1_categories
    ]


def map_specs_to_table2(specs: List[Dict]) -> List[Dict]:
    """
    Map JSON specs to Table 2 (top-right continuation table)

    Includes categories:
    - Technology
    - Parking Assistant Plus
    - Others
    - Interior Trims
    - Upholstery
    - Alloy Wheels

    Deterministic rule: Categories that appear in right column of PDF (non-Technical Data)
    """
    table2_categories = {
        "Technology",
        "Parking Assistant Plus :",
        "Others",
        "Interior Trims",
        "Upholstery",
        "Alloy Wheels"
    }

    return [
        spec for spec in specs
        if spec.get("category") in table2_categories
    ]


def map_specs_to_table3(specs: List[Dict]) -> List[Dict]:
    """
    Map JSON specs to Table 3 (bottom TECHNICAL DATA table)

    Includes only:
    - Technical Data category

    Deterministic rule: Category == "Technical Data"
    """
    return [
        spec for spec in specs
        if spec.get("category") == "Technical Data"
    ]


def generate_html_table(specs: List[Dict], trims: List[str], table_name: str) -> str:
    """
    Generate HTML table with BMW-style formatting

    Args:
        specs: List of spec dictionaries
        trims: List of trim names
        table_name: Name for title

    Returns:
        HTML string
    """
    # BMW brand colors
    header_bg = "#1C69D4"  # BMW blue
    header_text = "#FFFFFF"
    alt_row_bg = "#F5F5F5"
    border_color = "#CCCCCC"

    # Start HTML
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }}
        h2 {{
            color: {header_bg};
            font-size: 18px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }}
        th {{
            background-color: {header_bg};
            color: {header_text};
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            border: 1px solid {border_color};
            font-size: 9px;
        }}
        td {{
            padding: 6px 6px;
            border: 1px solid {border_color};
            vertical-align: top;
        }}
        tr:nth-child(even) {{
            background-color: {alt_row_bg};
        }}
        .category-header {{
            background-color: #E8E8E8;
            font-weight: bold;
            font-size: 10px;
        }}
        .subcategory {{
            font-style: italic;
            color: #555;
        }}
        .standard {{
            text-align: center;
        }}
    </style>
</head>
<body>
    <h2>{"SPECIFICATIONS" if table_name != "table3" else "TECHNICAL DATA"}</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 40%;">{"SPECIFICATIONS" if table_name != "table3" else "Technical Data"}</th>
"""

    # Add trim headers
    for trim in trims:
        html += f'                <th style="width: {60//len(trims)}%;">{trim}</th>\n'

    html += """            </tr>
        </thead>
        <tbody>
"""

    # Add specs rows
    current_category = None
    current_subcategory = None

    for spec in specs:
        category = spec.get("category", "")
        subcategory = spec.get("subcategory")
        label = spec.get("label", "")
        values = spec.get("values", {})

        # Category header row (only if category changes)
        if category != current_category and category:
            html += f'            <tr class="category-header">\n'
            html += f'                <td colspan="{len(trims) + 1}"><strong>{category}</strong></td>\n'
            html += f'            </tr>\n'
            current_category = category
            current_subcategory = None

        # Subcategory row (only if subcategory exists and changes)
        if subcategory and subcategory != current_subcategory:
            html += f'            <tr>\n'
            html += f'                <td colspan="{len(trims) + 1}" class="subcategory">{subcategory}</td>\n'
            html += f'            </tr>\n'
            current_subcategory = subcategory

        # Spec row
        html += '            <tr>\n'
        html += f'                <td>{label}</td>\n'

        # Add values for each trim
        for trim in trims:
            value = values.get(trim)
            if value is None or value == "":
                display_value = ""
            elif value == "Standard":
                display_value = '<span style="text-align: center; display: block;">◯</span>'
            else:
                display_value = str(value)

            html += f'                <td class="standard">{display_value}</td>\n'

        html += '            </tr>\n'

    html += """        </tbody>
    </table>
</body>
</html>
"""

    return html


def html_to_png(html_content: str, output_path: str, width: int = 600) -> bool:
    """
    Convert HTML to PNG using wkhtmltoimage

    Args:
        html_content: HTML string
        output_path: Path to save PNG
        width: Output width in pixels

    Returns:
        True if successful
    """
    # Save HTML to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html_content)
        html_path = f.name

    try:
        # Try wkhtmltoimage first
        subprocess.run([
            'wkhtmltoimage',
            '--quiet',
            '--width', str(width),
            '--quality', '100',
            html_path,
            output_path
        ], check=True, capture_output=True)

        Path(html_path).unlink()  # Clean up temp file
        return True

    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fallback: try weasyprint
        try:
            from weasyprint import HTML
            HTML(string=html_content).write_png(output_path)
            Path(html_path).unlink()
            return True
        except ImportError:
            print("⚠️  Neither wkhtmltoimage nor weasyprint available")
            print("    Install with: sudo apt-fast install wkhtmltopdf")
            print("    Or: pip install weasyprint")
            Path(html_path).unlink()
            return False


def create_side_by_side(original_crop: str, replica_png: str, output_path: str) -> None:
    """
    Create side-by-side comparison PNG

    Args:
        original_crop: Path to cropped original PDF table
        replica_png: Path to HTML replica PNG
        output_path: Path to save comparison
    """
    orig_img = Image.open(original_crop)
    replica_img = Image.open(replica_png)

    # Resize to same height
    target_height = max(orig_img.height, replica_img.height)

    if orig_img.height != target_height:
        ratio = target_height / orig_img.height
        orig_img = orig_img.resize(
            (int(orig_img.width * ratio), target_height),
            Image.LANCZOS
        )

    if replica_img.height != target_height:
        ratio = target_height / replica_img.height
        replica_img = replica_img.resize(
            (int(replica_img.width * ratio), target_height),
            Image.LANCZOS
        )

    # Create combined image
    gap = 40
    total_width = orig_img.width + replica_img.width + gap
    combined = Image.new('RGB', (total_width, target_height + 60), color='white')

    # Add title
    draw = ImageDraw.Draw(combined)
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except:
        title_font = ImageFont.load_default()

    draw.text((20, 10), "ORIGINAL PDF", fill='#1C69D4', font=title_font)
    draw.text((orig_img.width + 60, 10), "HTML REPLICA", fill='#D49B1C', font=title_font)

    # Paste images
    combined.paste(orig_img, (20, 50))
    combined.paste(replica_img, (orig_img.width + 40, 50))

    # Save
    combined.save(output_path)
    print(f"  ✅ Saved: {output_path}")


def main():
    """Main execution"""
    print(f"\n{'='*80}")
    print("BMW X5 Three-Table Visual Replicas")
    print(f"{'='*80}\n")

    # Paths
    pdf_image = "pdf_images/bmw_x5_page15-15.png"
    extraction_json = "extraction_engine/results/bmw_x5_gemini_flash.json"
    validation_dir = Path("validation")
    temp_dir = Path("validation/temp")

    # Create directories
    validation_dir.mkdir(exist_ok=True)
    temp_dir.mkdir(exist_ok=True)

    # Load extraction data
    print("📂 Loading extraction data...")
    data = load_extraction_json(extraction_json)
    specs = data.get("specs", [])
    trims = data.get("trims", [])
    print(f"  ✅ Loaded {len(specs)} specs, {len(trims)} trims\n")

    # Process each table
    tables = {
        "table1": ("Table 1: Top-Left Main Specifications", map_specs_to_table1),
        "table2": ("Table 2: Top-Right Continuation", map_specs_to_table2),
        "table3": ("Table 3: Bottom Technical Data", map_specs_to_table3)
    }

    for table_name, (table_desc, map_func) in tables.items():
        print(f"🔧 Processing {table_desc}...")

        # 1. Crop original table from PDF
        print(f"  📐 Cropping original table...")
        original_crop = crop_table_from_pdf(pdf_image, table_name, temp_dir)

        # 2. Map specs to this table
        table_specs = map_func(specs)
        print(f"  📊 Mapped {len(table_specs)} specs to {table_name}")

        # 3. Generate HTML
        print(f"  🖼️  Generating HTML table...")
        html_content = generate_html_table(table_specs, trims, table_name)

        # 4. Convert HTML to PNG
        print(f"  🎨 Rendering HTML to PNG...")
        replica_png = temp_dir / f"{table_name}_replica.png"
        success = html_to_png(html_content, str(replica_png), width=600)

        if not success:
            print(f"  ❌ Failed to render {table_name}")
            continue

        # 5. Create side-by-side comparison
        print(f"  🖼️  Creating side-by-side comparison...")
        output_path = validation_dir / f"bmw_x5_{table_name}_orig_vs_replica.png"
        create_side_by_side(original_crop, str(replica_png), str(output_path))
        print()

    print(f"{'='*80}")
    print("✅ ALL THREE TABLES COMPLETE")
    print(f"{'='*80}\n")

    print("Output files:")
    print(f"  • validation/bmw_x5_table1_orig_vs_replica.png")
    print(f"  • validation/bmw_x5_table2_orig_vs_replica.png")
    print(f"  • validation/bmw_x5_table3_orig_vs_replica.png")
    print()

    print("Next Steps:")
    print("  1. Open each PNG and visually verify replica accuracy")
    print("  2. Check for:")
    print("     - Correct row order and grouping")
    print("     - Accurate category/subcategory hierarchy")
    print("     - Proper Standard (◯) markers")
    print("     - Complete value rendering")
    print()


if __name__ == "__main__":
    main()
