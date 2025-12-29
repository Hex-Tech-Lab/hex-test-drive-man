#!/usr/bin/env python3
"""
PDF Image Extraction - Extract vehicle images from manufacturer PDFs
Extracts high-resolution images from 84 official manufacturer PDFs
to populate missing vehicle images (92 models)
"""

import pdfplumber
from pathlib import Path
import re
import json
import subprocess

def normalize_filename(brand, model, year):
    """Generate standardized filename: brand-model-year.jpg"""
    filename = f"{brand}-{model}"
    if year and year != "0":
        filename += f"-{year}"

    # Normalize to lowercase-kebab-case
    filename = filename.lower()
    filename = filename.replace(" ", "-")
    filename = re.sub(r'[^a-z0-9-]', '-', filename)
    filename = re.sub(r'-+', '-', filename)  # Remove duplicate hyphens

    return filename + ".jpg"

def extract_pdf_metadata(pdf_path):
    """Extract brand, model, year from PDF filename
    Example: Tiggo_3_2024.pdf -> (Chery, Tiggo 3, 2024)
    """
    brand_dir = pdf_path.parent.parent.name
    filename = pdf_path.stem

    # Extract year (4 digits at end)
    year_match = re.search(r'(\d{4})$', filename)
    year = year_match.group(1) if year_match else None

    # Remove year from filename
    model = re.sub(r'_\d{4}$', '', filename)
    model = model.replace('_', ' ')

    return (brand_dir, model, year)

def get_missing_models():
    """Fetch models with NULL hero_image_url from database"""
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4"
    URL = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/models?select=id,name,brands(name)&hero_image_url=is.null"

    result = subprocess.run(
        ['curl', '-s', '-H', f'apikey: {API_KEY}', '-H', 'Accept: application/json', URL],
        capture_output=True,
        text=True
    )

    return json.loads(result.stdout)

def extract_hero_image_from_pdf(pdf_path, output_path, page_num=0):
    """Extract first page as hero image"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            if page_num >= len(pdf.pages):
                return False

            page = pdf.pages[page_num]
            pil_image = page.to_image(resolution=150)

            # Save as JPG
            pil_image.original.save(output_path, 'JPEG', quality=90, optimize=True)

            return True
    except Exception as e:
        print(f"   ❌ Error extracting from {pdf_path.name}: {e}")
        return False

def main():
    print("="*70)
    print("PDF IMAGE EXTRACTION - Manufacturer PDFs → Vehicle Images")
    print("="*70)

    pdfs_dir = Path("pdfs")
    hero_dir = Path("public/images/vehicles/hero")
    hover_dir = Path("public/images/vehicles/hover")

    hero_dir.mkdir(parents=True, exist_ok=True)
    hover_dir.mkdir(parents=True, exist_ok=True)

    # Find all PDFs in *_official directories
    official_pdfs = list(pdfs_dir.glob("*/*_official/*.pdf"))
    print(f"\n📁 Found {len(official_pdfs)} manufacturer PDFs\n")

    # Get missing models from database
    print("📊 Fetching missing models from database...")
    missing_models = get_missing_models()
    print(f"   Missing: {len(missing_models)} models\n")

    # Extract images from each PDF
    stats = {
        'extracted': 0,
        'skipped': 0,
        'failed': 0
    }

    extracted_files = []

    for pdf_path in sorted(official_pdfs):
        brand, model, year = extract_pdf_metadata(pdf_path)
        hero_filename = normalize_filename(brand, model, year)
        hero_path = hero_dir / hero_filename
        hover_filename = normalize_filename(brand, model, year)
        hover_path = hover_dir / hover_filename

        # Skip if already exists
        if hero_path.exists():
            print(f"⏭️  Skip (exists): {hero_filename}")
            stats['skipped'] += 1
            continue

        # Extract hero image (page 0)
        print(f"🔄 Extracting: {brand} {model} {year}")

        if extract_hero_image_from_pdf(pdf_path, hero_path, page_num=0):
            print(f"   ✅ Hero:  {hero_filename}")
            stats['extracted'] += 1
            extracted_files.append(str(hero_path))
        else:
            print(f"   ❌ Failed: {hero_filename}")
            stats['failed'] += 1
            continue

        # Extract hover image (page 1 or last page)
        page_for_hover = min(1, len(pdfplumber.open(pdf_path).pages) - 1)

        if extract_hero_image_from_pdf(pdf_path, hover_path, page_num=page_for_hover):
            print(f"   ✅ Hover: {hover_filename}")
            extracted_files.append(str(hover_path))
        else:
            print(f"   ⚠️  Hover failed, using hero as fallback")
            # Copy hero as hover
            import shutil
            shutil.copy(hero_path, hover_path)

    print("\n" + "="*70)
    print("📊 EXTRACTION SUMMARY")
    print("="*70)
    print(f"Total PDFs processed: {len(official_pdfs)}")
    print(f"Images extracted:     {stats['extracted']}")
    print(f"Already existed:      {stats['skipped']}")
    print(f"Failed:               {stats['failed']}")
    print(f"\n📁 Output directories:")
    print(f"   Hero:  {hero_dir}")
    print(f"   Hover: {hover_dir}")
    print("="*70)

    # List extracted files
    if extracted_files:
        print(f"\n📝 Extracted files (first 20):")
        for f in extracted_files[:20]:
            print(f"   - {Path(f).name}")
        if len(extracted_files) > 20:
            print(f"   ... and {len(extracted_files) - 20} more")

    print("\n✅ EXTRACTION COMPLETE")
    print("\nNext steps:")
    print("1. Run Phase 3 corrected SQL to map extracted images to database")
    print("2. Verify images match vehicle models correctly")
    print("3. Download remaining missing images from manufacturer websites")

if __name__ == '__main__':
    main()
