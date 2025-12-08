"""
Clean extracted text from Document AI (fix OCR errors and formatting).
"""
import re
import json

def clean_arabic_text(text: str) -> str:
    """Remove excessive newlines from Arabic text."""
    if not text:
        return text
    
    # Replace single newlines with spaces (words were split)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    
    # Clean up multiple spaces
    text = re.sub(r' +', ' ', text)
    
    return text.strip()


def clean_english_text(text: str) -> str:
    """Fix common OCR errors in English text."""
    if not text:
        return text
    
    # Common OCR typos in BMW PDFs
    replacements = {
        'Actve': 'Active',
        'ght': 'light',
        'electrcaly': 'electrically',
        'adjustabe': 'adjustable',
        'Cuphoder': 'Cupholder',
        'temperate': 'temperature',
        'whch': 'which',
        'incudes': 'includes',
        'armrests': 'armrests',
        'Roler': 'Roller',
        'sde': 'side',
        'electrcal': 'electrical',
        'Dispay': 'Display',
        'Contro': 'Control',
        'ntegration': 'integration',
        'Wreless': 'Wireless',
        'Automatc': 'Automatic',
        'automatc': 'automatic',
        'hod': 'hold',
        'Parkng': 'Parking',
        'finshers': 'finishers',
        'pane': 'panel',
        'eather': 'leather',
        'ndivdual': 'Individual',
        'headliner': 'headliner',
        'Alcantara': 'Alcantara',
        'anthracte': 'anthracite',
        'vaves': 'valves',
        'Dsplacement': 'Displacement',
        'Acceeraton': 'Acceleration',
        'Consumpton': 'Consumption',
        'combned': 'combined',
        'Lter': 'Liter',
        'Liter': 'Liter',
        'weght': 'weight',
        'cearance': 'clearance',
        'TwnPower': 'TwinPower',
        'petro': 'petrol',
        'Steptronic': 'Steptronic',
        'Stabity': 'Stability',
        'Assst': 'Assist',
        'Regeneraton': 'Regeneration',
        'indcator': 'indicator',
        'locking': 'locking',
        'arbags': 'airbags',
        'colson': 'collision',
        'nterventon': 'intervention',
        'warnng': 'warning',
        'montorng': 'monitoring',
        'limt': 'limit',
        'assst': 'assist',
        'kdney': 'kidney',
        'grle': 'grille',
        'talgate': 'tailgate',
        'seective': 'selective',
        'mrror': 'mirror',
        'mrrors': 'mirrors',
        'ant-d': 'anti-dazzle',
        'gass': 'glass',
        'glazng': 'glazing',
        'ventiation': 'ventilation',
        'appication': 'application',
        'steerng': 'steering',
        'whee': 'wheel',
    }
    
    # Apply replacements (case-insensitive for some)
    for typo, correct in replacements.items():
        text = re.sub(r'\b' + typo + r'\b', correct, text, flags=re.IGNORECASE)
    
    # Fix multiple newlines in English
    text = re.sub(r'\n+', '\n', text)
    
    return text.strip()


def clean_extraction(extraction_file: str, output_file: str = None):
    """Clean an entire extraction JSON file."""
    with open(extraction_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Cleaning extraction: {extraction_file}")
    print(f"Total specs: {len(data.get('specs', []))}")
    
    cleaned_count = 0
    for spec in data.get('specs', []):
        original_en = spec['name_en']
        original_ar = spec['name_ar']
        
        spec['name_en'] = clean_english_text(spec['name_en'])
        spec['name_ar'] = clean_arabic_text(spec['name_ar'])
        
        if spec['name_en'] != original_en or spec['name_ar'] != original_ar:
            cleaned_count += 1
    
    output_file = output_file or extraction_file.replace('.json', '_cleaned.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Cleaned {cleaned_count} specs")
    print(f"✓ Saved to: {output_file}")
    return output_file


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python text_cleaner.py <extraction.json> [output.json]")
        sys.exit(1)
    
    clean_extraction(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
