"""
Split merged cell artifacts detected by Document AI.
Handles rows with \n separators indicating multiple specs.
"""
import re
from typing import List, Dict, Tuple


def split_merged_specs(specs: List[Dict]) -> List[Dict]:
    """
    Split specs that contain \n (newlines) into separate spec entries.
    
    Args:
        specs: List of spec dicts from extraction
        
    Returns:
        Expanded list with merged cells split into individual specs
    """
    split_specs = []
    
    for spec in specs:
        name_en = spec.get('name_en', '')
        name_ar = spec.get('name_ar', '')
        
        # Check if this is a merged cell (contains \n)
        if '\n' in name_en or '\n' in name_ar:
            # Split into individual specs
            en_parts = [p.strip() for p in name_en.split('\n') if p.strip()]
            ar_parts = [p.strip() for p in name_ar.split('\n') if p.strip()]
            
            # Pair EN with AR (handle mismatched counts)
            max_parts = max(len(en_parts), len(ar_parts))
            
            for i in range(max_parts):
                new_spec = spec.copy()
                new_spec['name_en'] = en_parts[i] if i < len(en_parts) else ''
                new_spec['name_ar'] = ar_parts[i] if i < len(ar_parts) else ''
                new_spec['_split_from_index'] = spec.get('_original_index', 0)
                split_specs.append(new_spec)
            
            print(f"  ✂️  Split merged cell into {max_parts} specs: {en_parts[0][:40]}...")
        else:
            # Not merged, keep as-is
            split_specs.append(spec)
    
    return split_specs


def preprocess_extraction(extraction_data: Dict) -> Dict:
    """
    Preprocess extraction data to split merged cells.
    
    Args:
        extraction_data: Full extraction JSON
        
    Returns:
        Processed extraction with split specs
    """
    print("\n" + "="*80)
    print("PREPROCESSING: Splitting Merged Cells")
    print("="*80)
    
    original_count = len(extraction_data.get('specs', []))
    split_specs = split_merged_specs(extraction_data.get('specs', []))
    new_count = len(split_specs)
    
    extraction_data['specs'] = split_specs
    extraction_data['total_specs'] = new_count
    extraction_data['_preprocessing'] = {
        'original_count': original_count,
        'after_split_count': new_count,
        'split_count': new_count - original_count
    }
    
    print(f"\nOriginal specs: {original_count}")
    print(f"After splitting: {new_count}")
    print(f"New specs created: {new_count - original_count}")
    print("="*80 + "\n")
    
    return extraction_data


if __name__ == "__main__":
    import json
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python cell_splitter.py <extraction.json>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = input_file.replace('.json', '_split.json')
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    processed = preprocess_extraction(data)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to: {output_file}")
