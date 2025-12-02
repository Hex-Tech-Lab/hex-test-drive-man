"""
Quality gate for validating extraction results.
"""
import json
from typing import Dict, List, Tuple
from collections import Counter


class QualityGate:
    """Validates extraction quality and flags issues."""
    
    def __init__(self, min_coverage: float = 0.25, allow_duplicates: bool = True):
        """
        Initialize quality gate.
        
        Args:
            min_coverage: Minimum match coverage (0.0-1.0)
            allow_duplicates: Whether duplicate canonical specs are allowed
        """
        self.min_coverage = min_coverage
        self.allow_duplicates = allow_duplicates
    
    def validate(self, report: Dict) -> Tuple[bool, List[str]]:
        """
        Validate analysis report against quality rules.
        
        Args:
            report: Analysis report from SpecAnalyzer
            
        Returns:
            (passed, issues) tuple where issues is list of failure reasons
        """
        issues = []
        
        # Check coverage
        coverage = report['coverage_percent'] / 100.0
        if coverage < self.min_coverage:
            issues.append(f"Coverage {coverage:.1%} below minimum {self.min_coverage:.1%}")
        
        # Check for duplicates (if not allowed)
        if not self.allow_duplicates:
            canonical_names = [m['canonical'] for m in report['matches']]
            duplicates = [name for name, count in Counter(canonical_names).items() if count > 1]
            if duplicates:
                issues.append(f"Duplicate specs found: {', '.join(duplicates)}")
        
        # Check for high-ratio merged cell artifacts (FAIL if >20% of unknowns)
        total_unknowns = len(report['unknowns'])
        if total_unknowns > 0:
            merged_artifacts = [
                u for u in report['unknowns'] 
                if len(u['label_en'].split()) > 6 and u['trim_count'] > 0
            ]
            merged_ratio = len(merged_artifacts) / total_unknowns
            if merged_ratio > 0.30:  # More than 20% of unknowns are artifacts
                issues.append(
                    f"High merged cell artifact ratio: {merged_ratio:.1%} "
                    f"({len(merged_artifacts)}/{total_unknowns} unknowns)"
                )
        
        # Check for empty labels with trim data (CRITICAL ERROR)
        empty_with_data = [
            m for m in report['matches'] + report['unknowns']
            if not m['label_en'].strip() and m['trim_count'] > 0
        ]
        if empty_with_data:
            issues.append(f"CRITICAL: Empty labels with trim data: {len(empty_with_data)} rows")
        
        passed = len(issues) == 0
        return (passed, issues)
    
    def generate_report(self, analysis_report: Dict) -> Dict:
        """
        Generate quality gate report.
        
        Args:
            analysis_report: Analysis report from SpecAnalyzer
            
        Returns:
            Quality gate report with pass/fail status and details
        """
        passed, issues = self.validate(analysis_report)
        
        # Identify duplicate specs
        canonical_names = [m['canonical'] for m in analysis_report['matches']]
        duplicate_stats = {
            name: count 
            for name, count in Counter(canonical_names).items() 
            if count > 1
        }
        
        # Identify high-confidence unknowns (likely specs that need definitions)
        high_conf_unknowns = [
            u for u in analysis_report['unknowns']
            if u['trim_count'] >= 2 and len(u['label_en'].split()) <= 5
        ]
        
        # Count merged cell artifacts
        merged_count = len([
            u for u in analysis_report['unknowns']
            if len(u['label_en'].split()) > 6 and u['trim_count'] > 0
        ])
        
        report = {
            'status': 'PASS' if passed else 'FAIL',
            'passed': passed,
            'issues': issues,
            'coverage': analysis_report['coverage_percent'],
            'min_coverage_required': self.min_coverage * 100,
            'total_matches': analysis_report['matched'],
            'duplicate_specs': duplicate_stats,
            'merged_cell_artifacts': merged_count,
            'high_confidence_unknowns': len(high_conf_unknowns),
            'recommendations': self._generate_recommendations(
                analysis_report, 
                duplicate_stats, 
                high_conf_unknowns,
                merged_count
            )
        }
        
        return report
    
    def _generate_recommendations(
        self, 
        analysis_report: Dict,
        duplicate_stats: Dict,
        high_conf_unknowns: List[Dict],
        merged_count: int
    ) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        if duplicate_stats:
            recommendations.append(
                f"Review {len(duplicate_stats)} duplicate specs - may indicate table structure issues or valid section repeats"
            )
        
        if high_conf_unknowns:
            top_unknowns = sorted(high_conf_unknowns, key=lambda x: x['trim_count'], reverse=True)[:5]
            unknown_labels = [u['label_en'] for u in top_unknowns]
            recommendations.append(
                f"Add definitions for top unknowns: {', '.join(unknown_labels[:3])}"
            )
        
        if merged_count > 0:
            recommendations.append(
                f"Found {merged_count} merged cell artifacts - consider PDF preprocessing to split concatenated labels"
            )
        
        if analysis_report['coverage_percent'] < 50:
            recommendations.append(
                "Coverage below 50% - expand spec definitions to increase match rate"
            )
        
        return recommendations
    
    def print_report(self, gate_report: Dict):
        """Print quality gate report."""
        status_symbol = "✅" if gate_report['passed'] else "❌"
        
        print("\n" + "="*80)
        print(f"{status_symbol} QUALITY GATE: {gate_report['status']}")
        print("="*80)
        print(f"Coverage: {gate_report['coverage']:.1f}% (min: {gate_report['min_coverage_required']:.1f}%)")
        print(f"Total Matches: {gate_report['total_matches']}")
        print(f"Merged Cell Artifacts: {gate_report['merged_cell_artifacts']}")
        
        if gate_report['issues']:
            print("\n⚠️  ISSUES:")
            for issue in gate_report['issues']:
                print(f"  • {issue}")
        
        if gate_report['duplicate_specs']:
            print("\n🔁 DUPLICATE SPECS:")
            for spec, count in gate_report['duplicate_specs'].items():
                print(f"  • {spec}: {count}x")
        
        if gate_report['recommendations']:
            print("\n💡 RECOMMENDATIONS:")
            for rec in gate_report['recommendations']:
                print(f"  • {rec}")
        
        print("="*80)


def main():
    """CLI entry point."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python quality_gate.py <analysis_report.json>")
        sys.exit(1)
    
    report_path = sys.argv[1]
    
    with open(report_path, 'r', encoding='utf-8') as f:
        analysis_report = json.load(f)
    
    gate = QualityGate(min_coverage=0.25, allow_duplicates=True)
    gate_report = gate.generate_report(analysis_report)
    gate.print_report(gate_report)
    
    # Save gate report
    output_path = report_path.replace('_analysis.json', '_quality_gate.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(gate_report, f, indent=2)
    print(f"\n✓ Quality gate report saved to: {output_path}")
    
    # Exit with error code if failed
    sys.exit(0 if gate_report['passed'] else 1)


if __name__ == "__main__":
    main()
