"""
Analyzer for extracted specs against canonical definitions.
"""
import json
import sys
from pathlib import Path
from typing import Dict, List

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from spec_matcher import SpecMatcher


class SpecAnalyzer:
    """Analyzes extracted specs and generates match report."""
    
    def __init__(self, definitions_path: str = None):
        """Initialize with spec matcher."""
        self.matcher = SpecMatcher(definitions_path)
    
    def analyze_extraction(self, extraction_path: str) -> Dict:
        """
        Analyze extracted specs from JSON file.
        
        Args:
            extraction_path: Path to extraction JSON (e.g., toyota_extracted.json)
            
        Returns:
            Analysis report with matches, unknowns, and statistics
        """
        # Load extraction
        with open(extraction_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        specs = data.get('specs', [])
        
        matches = []
        unknowns = []
        
        for idx, row in enumerate(specs):
            label_en = row.get('name_en', '')
            label_ar = row.get('name_ar', '')
            trims = row.get('trims', {})
            
            # Count non-empty trim values
            trim_count = sum(1 for v in trims.values() if v)
            
            # Match spec
            canonical, score, methods = self.matcher.match_spec(label_en, label_ar)
            
            result = {
                'index': idx,
                'label_en': label_en,
                'label_ar': label_ar,
                'canonical': canonical,
                'score': score,
                'methods': methods,
                'trim_count': trim_count,
                'trims': trims
            }
            
            if canonical:
                matches.append(result)
            else:
                unknowns.append(result)
        
        # Generate statistics
        total = len(specs)
        matched = len(matches)
        unknown = len(unknowns)
        coverage = (matched / total * 100) if total > 0 else 0
        
        report = {
            'extraction_file': extraction_path,
            'total_rows': total,
            'matched': matched,
            'unknown': unknown,
            'coverage_percent': round(coverage, 1),
            'matches': matches,
            'unknowns': unknowns
        }
        
        return report
    
    def print_report(self, report: Dict):
        """Print human-readable analysis report."""
        print("\n" + "="*80)
        print("SPEC ANALYSIS REPORT")
        print("="*80)
        print(f"Extraction: {report['extraction_file']}")
        print(f"Total Rows: {report['total_rows']}")
        print(f"Matched: {report['matched']}/{report['total_rows']} ({report['coverage_percent']}%)")
        print(f"Unknown: {report['unknown']}/{report['total_rows']}")
        print("="*80)
        
        print("\n📊 MATCHED SPECS:")
        for match in report['matches']:
            print(f"  [{match['index']:3d}] {match['canonical']:20s} "
                  f"(score: {match['score']:.2f}, "
                  f"methods: {', '.join(match['methods'])}, "
                  f"trims: {match['trim_count']})")
            print(f"        EN: {match['label_en']}")
            if match['label_ar']:
                print(f"        AR: {match['label_ar']}")
        
        print("\n❓ UNKNOWN SPECS:")
        for unknown in report['unknowns']:
            print(f"  [{unknown['index']:3d}] EN: {unknown['label_en']}")
            if unknown['label_ar']:
                print(f"        AR: {unknown['label_ar']}")
            print(f"        Trims: {unknown['trim_count']}")
        
        print("\n" + "="*80)


def main():
    """CLI entry point."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python analyzer.py <extraction_json>")
        sys.exit(1)
    
    extraction_path = sys.argv[1]
    
    analyzer = SpecAnalyzer()
    report = analyzer.analyze_extraction(extraction_path)
    analyzer.print_report(report)
    
    # Save report
    report_path = Path(extraction_path).stem + "_analysis.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Report saved to: {report_path}")


if __name__ == "__main__":
    main()
