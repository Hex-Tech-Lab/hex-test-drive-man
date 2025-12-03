"""
Smart spec splitter - distinguishes between extraction artifacts and valid labels.
"""
import re
from typing import List, Dict, Tuple


class SmartSplitter:
    """Intelligently splits merged cells based on context."""
    
    # Patterns that indicate intentional multi-spec labels (split these)
    INTENTIONAL_MULTI_SPEC_PATTERNS = [
        r'\+',  # "BA + HAC" or "ABS + EBD"
        r'&',   # "Front & Back Parking Sensors"
    ]
    
    # Patterns that indicate a single spec (don't split)
    SINGLE_SPEC_PATTERNS = [
        r'\(.*\)',  # Anything in parentheses is clarification, not separate spec
        r'Multi-Function',
        r'Disp\+Tel\+Voice',  # Feature list within one spec
    ]
    
    def should_split_on_newline(self, text: str) -> bool:
        """Determine if text with \n should be split."""
        if '\n' not in text:
            return False
        
        parts = [p.strip() for p in text.split('\n') if p.strip()]
        
        # If any part looks like a separate spec label, split it
        # Heuristic: Each part has > 3 words or starts with capital letter
        separate_specs = sum(1 for p in parts if len(p.split()) >= 3 or p[0].isupper())
        
        return separate_specs >= 2
    
    def should_split_on_operator(self, text: str) -> Tuple[bool, str]:
        """Check if text should split on + or & operators."""
        # Don't split if it's just feature details in parentheses
        if re.search(r'\([^)]*[\+&][^)]*\)', text):
            return False, None
        
        # Split on + or & if they're separating spec names
        if ' + ' in text and not text.startswith('('):
            return True, ' + '
        if ' & ' in text and not text.startswith('('):
            return True, ' & '
        
        return False, None
    
    def split_spec(self, spec: Dict) -> List[Dict]:
        """
        Intelligently split a spec entry into one or more specs.
        
        Returns:
            List of spec dicts (single item if no split needed)
        """
        name_en = spec.get('name_en', '')
        name_ar = spec.get('name_ar', '')
        
        # Strategy 1: Split on newlines if they indicate separate specs
        if self.should_split_on_newline(name_en):
            return self._split_on_newline(spec, name_en, name_ar)
        
        # Strategy 2: Split on operators (+ or &) between specs
        should_split, operator = self.should_split_on_operator(name_en)
        if should_split:
            return self._split_on_operator(spec, name_en, name_ar, operator)
        
        # No split needed
        return [spec]
    
    def _split_on_newline(self, spec: Dict, name_en: str, name_ar: str) -> List[Dict]:
        """Split on newline separators."""
        en_parts = [p.strip() for p in name_en.split('\n') if p.strip()]
        ar_parts = [p.strip() for p in name_ar.split('\n') if p.strip()]
        
        result = []
        for i in range(max(len(en_parts), len(ar_parts))):
            new_spec = spec.copy()
            new_spec['name_en'] = en_parts[i] if i < len(en_parts) else ''
            new_spec['name_ar'] = ar_parts[i] if i < len(ar_parts) else ''
            new_spec['_split_from'] = 'newline'
            new_spec['_split_parent'] = spec.get('name_en', '')[:50]
            result.append(new_spec)
        
        print(f"  ✂️  Newline split: {len(result)} specs from '{en_parts[0][:40]}...'")
        return result
    
    def _split_on_operator(self, spec: Dict, name_en: str, name_ar: str, operator: str) -> List[Dict]:
        """Split on + or & operators."""
        en_parts = [p.strip() for p in name_en.split(operator)]
        
        # For Arabic, try same operator or look for Arabic equivalents
        ar_operator = ' + ' if operator == ' + ' else ' و '
        ar_parts = [p.strip() for p in name_ar.split(ar_operator)] if ar_operator in name_ar else [''] * len(en_parts)
        
        result = []
        for i, en_part in enumerate(en_parts):
            # Clean up common patterns like "(BA)" from "Brake Assist (BA)"
            en_clean = re.sub(r'\s*\([A-Z]+\)\s*$', '', en_part).strip()
            
            new_spec = spec.copy()
            new_spec['name_en'] = en_clean
            new_spec['name_ar'] = ar_parts[i] if i < len(ar_parts) else ''
            new_spec['_split_from'] = 'operator'
            new_spec['_split_parent'] = spec.get('name_en', '')[:50]
            # Important: All split specs share same trim values
            result.append(new_spec)
        
        print(f"  ✂️  Operator split: {len(result)} specs from '{en_parts[0][:30]}...'")
        return result


def preprocess_with_smart_splitting(extraction_data: Dict) -> Dict:
    """Apply smart splitting to extraction data."""
    print("\n" + "="*80)
    print("SMART PREPROCESSING: Intelligent Spec Splitting")
    print("="*80)
    
    splitter = SmartSplitter()
    original_specs = extraction_data.get('specs', [])
    split_specs = []
    
    for spec in original_specs:
        split_results = splitter.split_spec(spec)
        split_specs.extend(split_results)
    
    original_count = len(original_specs)
    new_count = len(split_specs)
    
    extraction_data['specs'] = split_specs
    extraction_data['total_specs'] = new_count
    extraction_data['_preprocessing'] = {
        'original_count': original_count,
        'after_split_count': new_count,
        'split_count': new_count - original_count,
        'method': 'smart_splitting'
    }
    
    print(f"\nOriginal specs: {original_count}")
    print(f"After smart splitting: {new_count}")
    print(f"New specs created: {new_count - original_count}")
    print("="*80 + "\n")
    
    return extraction_data


if __name__ == "__main__":
    import json
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python smart_splitter.py <extraction.json>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = input_file.replace('.json', '_smart_split.json')
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    processed = preprocess_with_smart_splitting(data)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to: {output_file}")
