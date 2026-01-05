#!/usr/bin/env python3
"""
Parse Mercedes-Benz image filenames to extract model names.
Generates JSON file for SQL migration generation.
"""

import os
import json
from pathlib import Path

IMAGE_DIR = "/vercel/sandbox/public/images/vehicles/hero"
BRAND_PREFIX = "mercedes-benz-"
OUTPUT_FILE = "/vercel/sandbox/scripts/mercedes_models.json"

def parse_model_name(filename: str) -> str:
    """
    Extract clean model name from filename.
    
    Examples:
    - mercedes-benz-amg-c43.jpg → AMG C43
    - mercedes-benz-c-class.jpg → C-Class
    - mercedes-benz-eqe-sedan.jpg → EQE Sedan
    - mercedes-benz-maybach-s-class.jpg → Maybach S-Class
    """
    # Remove prefix and extension
    name = filename.replace(BRAND_PREFIX, '').replace('.jpg', '')
    
    # Split by hyphens
    parts = name.split('-')
    
    # Capitalize each part
    capitalized = []
    for part in parts:
        # Special handling for known acronyms
        if part.upper() in ['AMG', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'SUV', 'GLC', 'GLE', 'GLS', 'CLS']:
            capitalized.append(part.upper())
        elif part == 'class':
            capitalized.append('Class')
        elif part in ['coupe', 'sedan', 'saloon', 'roadster']:
            capitalized.append(part.capitalize())
        else:
            capitalized.append(part.upper() if len(part) <= 3 else part.capitalize())
    
    # Join with hyphens for compound names, spaces otherwise
    model_name = ' '.join(capitalized)
    
    # Clean up spacing around hyphens
    model_name = model_name.replace(' - ', '-')
    
    return model_name

def parse_mercedes_images():
    """Extract model names from Mercedes-Benz image filenames."""
    models = []
    
    for filename in sorted(os.listdir(IMAGE_DIR)):
        if not filename.startswith(BRAND_PREFIX):
            continue
        
        model_name = parse_model_name(filename)
        
        models.append({
            'name': model_name,
            'year': 2025,  # Default year (user can update later)
            'hero_image': filename,
            'filename': filename
        })
    
    return models

if __name__ == "__main__":
    models = parse_mercedes_images()
    
    print(f"✅ Found {len(models)} Mercedes-Benz models:\n")
    for idx, model in enumerate(models, 1):
        print(f"  {idx:2d}. {model['name']:<30} → {model['hero_image']}")
    
    # Export for SQL generation
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(models, f, indent=2)
    
    print(f"\n✅ Exported to {OUTPUT_FILE}")
    print(f"   Total models: {len(models)}")
