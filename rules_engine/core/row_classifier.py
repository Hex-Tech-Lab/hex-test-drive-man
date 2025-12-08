"""
Row classifier for categorizing extracted rows.
"""
import re
from typing import Dict, List, Tuple
from enum import Enum


class RowType(Enum):
    """Types of rows in extracted data."""
    SPEC_ROW = "spec_row"
    SECTION_HEADER = "section_header"
    FOOTNOTE = "footnote"
    ENDNOTE = "endnote"
    NOISE = "noise"
    MERGED_CELL_ARTIFACT = "merged_cell_artifact"


class RowClassifier:
    """Classifies extracted rows by type."""
    
    # Patterns for section headers (strict - must be very short and all caps)
    SECTION_PATTERNS = [
        r'^[A-Z\s]{2,15}$',  # ALL CAPS 2-15 chars only
        r'^(ENGINE|TRANSMISSION|SUSPENSION|SAFETY|COMFORT|DIMENSIONS)$',
        r'^SPECIFICATIONS?$',
        r'^FEATURES?$',
    ]
    
    # Patterns for noise/junk
    NOISE_PATTERNS = [
        r'^\s*$',  # Empty
        r'^[-=•*]+$',  # Just punctuation
        r'^page \d+',  # Page numbers
        r'^\d+$',  # Just numbers
    ]
    
    # Patterns for merged cell artifacts (multiple specs in one label)
    MERGED_PATTERNS = [
        r'\b\w+\s+\w+\s+&\s+\w+\s+\w+',  # "Max Torque & Fuel System"
        r'(\w+\s+){6,}',  # 6+ words concatenated
    ]
    
    @staticmethod
    def classify_row(
        label_en: str,
        label_ar: str,
        trim_count: int,
        canonical: str = None
    ) -> Tuple[RowType, float]:
        """
        Classify a row by its characteristics.
        
        Args:
            label_en: English label
            label_ar: Arabic label
            trim_count: Number of non-empty trim values
            canonical: Matched canonical name (if any)
            
        Returns:
            (RowType, confidence) tuple
        """
        label_en = label_en.strip()
        label_ar = label_ar.strip()
        
        # Check noise first
        for pattern in RowClassifier.NOISE_PATTERNS:
            if re.match(pattern, label_en, re.IGNORECASE):
                return (RowType.NOISE, 0.9)
        
        # If matched to canonical spec, it's a spec row
        if canonical:
            return (RowType.SPEC_ROW, 0.95)
        
        # Check merged cell artifacts
        for pattern in RowClassifier.MERGED_PATTERNS:
            if re.search(pattern, label_en, re.IGNORECASE):
                return (RowType.MERGED_CELL_ARTIFACT, 0.8)
        
        # Check section headers (strict: all caps, short, no trim values)
        if trim_count == 0:
            for pattern in RowClassifier.SECTION_PATTERNS:
                if re.match(pattern, label_en):
                    return (RowType.SECTION_HEADER, 0.85)
        
        # If has trim values, likely spec row (just unmatched)
        if trim_count > 0:
            return (RowType.SPEC_ROW, 0.7)
        
        # Default: noise
        return (RowType.NOISE, 0.5)


def test_classifier():
    """Test row classifier."""
    classifier = RowClassifier()
    
    test_cases = [
        ("Max Output", "", 3, "max_output"),
        ("SPECIFICATIONS", "", 0, None),
        ("Max Torque Fuel System & Tank Capacity", "", 3, None),
        ("", "", 0, None),
        ("Page 1", "", 0, None),
        ("Unknown Spec", "", 2, None),
    ]
    
    for label_en, label_ar, trim_count, canonical in test_cases:
        row_type, confidence = classifier.classify_row(label_en, label_ar, trim_count, canonical)
        print(f"{label_en[:40]:40s} → {row_type.value:20s} ({confidence:.2f})")


if __name__ == "__main__":
    test_classifier()
