"""
Core spec matching logic with fuzzy matching and forbidden pattern detection.
"""
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher


class SpecMatcher:
    """Matches extracted labels to canonical spec definitions."""
    
    def __init__(self, definitions_path: str = None):
        """
        Initialize matcher with spec definitions.
        
        Args:
            definitions_path: Path to spec_definitions.json
        """
        if definitions_path is None:
            # Default to definitions directory
            base_path = Path(__file__).parent.parent / "definitions"
            definitions_path = base_path / "spec_definitions.json"
        
        self.definitions_path = Path(definitions_path)
        self.specs = self._load_definitions()
        
    def _load_definitions(self) -> List[Dict]:
        """Load spec definitions from JSON."""
        with open(self.definitions_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('specs', [])
    
    @staticmethod
    def normalize_label(text: str) -> str:
        """
        Normalize label for matching.
        - Strip content in parentheses (feature details)
        - Lowercase
        - Remove punctuation except spaces
        - Collapse multiple spaces
        """
        if not text:
            return ""
        
        # Strip parentheses and their content BEFORE other normalization
        text = re.sub(r'\([^)]*\)', '', text)
        
        # Lowercase
        text = text.lower()
        
        # Remove punctuation but keep spaces and Arabic characters
        text = re.sub(r'[^\w\s\u0600-\u06FF]', ' ', text)
        
        # Collapse spaces
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    @staticmethod
    def fuzzy_similarity(a: str, b: str) -> float:
        """
        Calculate fuzzy string similarity using SequenceMatcher.
        
        Returns:
            Similarity score between 0.0 and 1.0
        """
        return SequenceMatcher(None, a, b).ratio()
    
    def _check_forbidden(self, label: str, forbidden_patterns: List[str]) -> bool:
        """
        Check if label matches any forbidden pattern.
        
        Args:
            label: Normalized label
            forbidden_patterns: List of forbidden patterns
            
        Returns:
            True if forbidden pattern found
        """
        for pattern in forbidden_patterns:
            normalized_pattern = self.normalize_label(pattern)
            # Exact substring match or high similarity
            if normalized_pattern in label or self.fuzzy_similarity(label, normalized_pattern) > 0.85:
                return True
        return False
    
    def _score_match(
        self, 
        label: str, 
        valid_list: List[str], 
        typo_list: List[str],
        forbidden_list: List[str],
        threshold: float = 0.75
    ) -> Tuple[float, List[str]]:
        """
        Score a label against valid/typo/forbidden lists.
        
        Args:
            label: Normalized label to match
            valid_list: List of valid variations
            typo_list: List of common typos
            forbidden_list: List of forbidden patterns
            threshold: Minimum similarity for typo matching
            
        Returns:
            (score, methods) where score is 0-1 and methods lists match types
        """
        methods = []
        score = 0.0
        
        # Check forbidden first - immediate rejection
        if self._check_forbidden(label, forbidden_list):
            return (0.0, ["rejected_forbidden"])
        
        # Check valid list (exact or high similarity)
        for valid in valid_list:
            normalized_valid = self.normalize_label(valid)
            similarity = self.fuzzy_similarity(label, normalized_valid)
            if similarity > 0.9:  # High confidence match
                score += 0.5
                methods.append("valid")
                break
        
        # Check typo list (fuzzy match)
        if score == 0.0:  # Only check typos if no valid match
            for typo in typo_list:
                normalized_typo = self.normalize_label(typo)
                similarity = self.fuzzy_similarity(label, normalized_typo)
                if similarity >= threshold:
                    score += 0.3
                    methods.append("typo")
                    break
        
        return (score, methods)
    
    def match_spec(
        self, 
        label_en: str, 
        label_ar: str,
        min_score: float = 0.3
    ) -> Tuple[Optional[str], float, List[str]]:
        """
        Match English and Arabic labels to canonical spec.
        
        Args:
            label_en: English label
            label_ar: Arabic label
            min_score: Minimum combined score to accept match
            
        Returns:
            (canonical_name, combined_score, methods)
            Returns (None, 0, []) if no match
        """
        norm_en = self.normalize_label(label_en)
        norm_ar = self.normalize_label(label_ar)
        
        best_match = None
        best_score = 0.0
        best_methods = []
        
        for spec in self.specs:
            canonical_name = spec['canonical_name']
            
            # Score English
            en_score, en_methods = self._score_match(
                norm_en,
                spec.get('valid_en', []),
                spec.get('common_typos_en', []),
                spec.get('forbidden_patterns_en', [])
            )
            
            # Check for forbidden rejection
            if en_methods == ["rejected_forbidden"]:
                continue
            
            # Score Arabic (if provided)
            ar_score = 0.0
            ar_methods = []
            if norm_ar:
                ar_score, ar_methods = self._score_match(
                    norm_ar,
                    spec.get('valid_ar', []),
                    spec.get('common_typos_ar', []),
                    spec.get('forbidden_patterns_ar', [])
                )
                
                # Check for forbidden rejection
                if ar_methods == ["rejected_forbidden"]:
                    continue
            
            # Combined score
            combined_score = en_score + ar_score
            combined_methods = []
            if en_score > 0:
                combined_methods.extend([f"en_{m}" for m in en_methods])
            if ar_score > 0:
                combined_methods.extend([f"ar_{m}" for m in ar_methods])
            
            # Update best match
            if combined_score > best_score:
                best_score = combined_score
                best_match = canonical_name
                best_methods = combined_methods
        
        # Return match if above threshold
        if best_score >= min_score:
            return (best_match, best_score, best_methods)
        
        return (None, 0.0, [])


def test_cli():
    """CLI test mode for matcher."""
    import sys
    
    if len(sys.argv) < 4:
        print("Usage: python spec_matcher.py test_row <label_en> <label_ar>")
        sys.exit(1)
    
    if sys.argv[1] != "test_row":
        print("Unknown command. Use 'test_row'")
        sys.exit(1)
    
    label_en = sys.argv[2]
    label_ar = sys.argv[3] if len(sys.argv) > 3 else ""
    
    matcher = SpecMatcher()
    canonical, score, methods = matcher.match_spec(label_en, label_ar)
    
    print(f"RESULT: {canonical} {score} {methods}")


if __name__ == "__main__":
    test_cli()
