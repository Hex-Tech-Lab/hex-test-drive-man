#!/usr/bin/env python3
"""
Hex Test Drive MAN - Spec Extraction CLI
"""
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import argparse
from pipeline.orchestrator import ExtractionPipeline


def cmd_analyze(args):
    """Analyze extraction command."""
    pipeline = ExtractionPipeline(
        min_coverage=args.min_coverage,
        allow_duplicates=not args.no_duplicates
    )
    
    result = pipeline.run(args.extraction, args.output_dir)
    return 0 if result['passed'] else 1


def cmd_extract(args):
    """Extract PDF command (placeholder for future)."""
    print("PDF extraction not yet implemented - use google_documentai_extractor.py")
    return 1


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Hex Test Drive MAN - Vehicle Spec Extraction Engine',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Analyze existing extraction
  %(prog)s analyze toyota_extracted.json
  
  # Analyze with custom coverage threshold
  %(prog)s analyze toyota_extracted.json --min-coverage 0.40
  
  # Fail on duplicate specs
  %(prog)s analyze toyota_extracted.json --no-duplicates
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Analyze command
    analyze_parser = subparsers.add_parser('analyze', help='Analyze extraction JSON')
    analyze_parser.add_argument('extraction', help='Path to extraction JSON file')
    analyze_parser.add_argument('--output-dir', '-o', help='Output directory for reports')
    analyze_parser.add_argument('--min-coverage', type=float, default=0.25, 
                               help='Minimum coverage threshold (default: 0.25)')
    analyze_parser.add_argument('--no-duplicates', action='store_true',
                               help='Fail on duplicate specs')
    analyze_parser.set_defaults(func=cmd_analyze)
    
    # Extract command (placeholder)
    extract_parser = subparsers.add_parser('extract', help='Extract PDF (not implemented)')
    extract_parser.add_argument('pdf', help='Path to PDF file')
    extract_parser.set_defaults(func=cmd_extract)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
