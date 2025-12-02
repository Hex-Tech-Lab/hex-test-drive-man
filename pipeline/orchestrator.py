"""
Pipeline orchestrator for end-to-end PDF extraction and analysis.
"""
import sys
import json
from pathlib import Path
from typing import Dict, Optional

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from rules_engine.core.spec_matcher import SpecMatcher
from rules_engine.core.analyzer import SpecAnalyzer
from rules_engine.core.quality_gate import QualityGate
from rules_engine.core.row_classifier import RowClassifier, RowType


class ExtractionPipeline:
    """End-to-end pipeline for PDF extraction and validation."""
    
    def __init__(
        self,
        definitions_path: Optional[str] = None,
        min_coverage: float = 0.25,
        allow_duplicates: bool = True
    ):
        """
        Initialize pipeline.
        
        Args:
            definitions_path: Path to spec definitions JSON
            min_coverage: Minimum match coverage for quality gate
            allow_duplicates: Whether to allow duplicate specs
        """
        self.analyzer = SpecAnalyzer(definitions_path)
        self.quality_gate = QualityGate(min_coverage, allow_duplicates)
        self.classifier = RowClassifier()
    
    def run(
        self,
        extraction_path: str,
        output_dir: Optional[str] = None
    ) -> Dict:
        """
        Run full pipeline on extraction JSON.
        
        Args:
            extraction_path: Path to extraction JSON
            output_dir: Directory for output files (default: same as input)
            
        Returns:
            Pipeline results with analysis and quality gate reports
        """
        extraction_path = Path(extraction_path)
        if output_dir is None:
            output_dir = extraction_path.parent
        else:
            output_dir = Path(output_dir)
        
        print("\n" + "="*80)
        print("EXTRACTION PIPELINE")
        print("="*80)
        print(f"Input: {extraction_path}")
        print(f"Output: {output_dir}")
        
        # Stage 1: Analyze extraction
        print("\n[1/3] Analyzing extraction...")
        analysis_report = self.analyzer.analyze_extraction(str(extraction_path))
        
        # Add row classification
        print("[2/3] Classifying rows...")
        for match in analysis_report['matches']:
            row_type, confidence = self.classifier.classify_row(
                match['label_en'],
                match['label_ar'],
                match['trim_count'],
                match['canonical']
            )
            match['row_type'] = row_type.value
            match['classification_confidence'] = confidence
        
        for unknown in analysis_report['unknowns']:
            row_type, confidence = self.classifier.classify_row(
                unknown['label_en'],
                unknown['label_ar'],
                unknown['trim_count'],
                None
            )
            unknown['row_type'] = row_type.value
            unknown['classification_confidence'] = confidence
        
        # Stage 2: Quality gate
        print("[3/3] Running quality gate...")
        gate_report = self.quality_gate.generate_report(analysis_report)
        
        # Save reports
        base_name = extraction_path.stem
        
        analysis_path = output_dir / f"{base_name}_analysis.json"
        with open(analysis_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_report, f, indent=2, ensure_ascii=False)
        
        gate_path = output_dir / f"{base_name}_quality_gate.json"
        with open(gate_path, 'w', encoding='utf-8') as f:
            json.dump(gate_report, f, indent=2, ensure_ascii=False)
        
        # Print reports
        print("\n" + "="*80)
        print("ANALYSIS SUMMARY")
        print("="*80)
        print(f"Total Rows: {analysis_report['total_rows']}")
        print(f"Matched: {analysis_report['matched']} ({analysis_report['coverage_percent']:.1f}%)")
        print(f"Unknown: {analysis_report['unknown']}")
        
        # Row type breakdown
        all_rows = analysis_report['matches'] + analysis_report['unknowns']
        row_types = {}
        for row in all_rows:
            rt = row['row_type']
            row_types[rt] = row_types.get(rt, 0) + 1
        
        print("\nRow Types:")
        for rt, count in sorted(row_types.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {rt}: {count}")
        
        self.quality_gate.print_report(gate_report)
        
        print(f"\n✓ Analysis saved to: {analysis_path}")
        print(f"✓ Quality gate saved to: {gate_path}")
        
        # Overall result
        result = {
            'status': gate_report['status'],
            'passed': gate_report['passed'],
            'analysis_report': analysis_report,
            'gate_report': gate_report,
            'output_files': {
                'analysis': str(analysis_path),
                'quality_gate': str(gate_path)
            }
        }
        
        return result


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Run extraction analysis pipeline')
    parser.add_argument('extraction', help='Path to extraction JSON file')
    parser.add_argument('--output-dir', '-o', help='Output directory for reports')
    parser.add_argument('--min-coverage', type=float, default=0.25, help='Minimum coverage (0.0-1.0)')
    parser.add_argument('--no-duplicates', action='store_true', help='Fail on duplicate specs')
    
    args = parser.parse_args()
    
    pipeline = ExtractionPipeline(
        min_coverage=args.min_coverage,
        allow_duplicates=not args.no_duplicates
    )
    
    result = pipeline.run(args.extraction, args.output_dir)
    
    sys.exit(0 if result['passed'] else 1)


if __name__ == "__main__":
    main()
