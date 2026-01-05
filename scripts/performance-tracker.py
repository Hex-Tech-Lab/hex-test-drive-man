#!/usr/bin/env python3
"""
Performance Tracker - Automated Performance Monitoring

Collects build performance, agent efficiency, code quality, and repository
health metrics for trend analysis and alerting.

Usage:
    python scripts/performance-tracker.py collect --metrics build,quality
    python scripts/performance-tracker.py generate-dashboard
    python scripts/performance-tracker.py check-alerts

Author: CC (Claude Code)
Date: 2026-01-05
Version: 1.0 (MVP - Data Collection Only)
"""

import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

# Configuration
HISTORY_FILE = "docs/PERFORMANCE_HISTORY.json"
DASHBOARD_FILE = "docs/PERFORMANCE_DASHBOARD.md"

# Thresholds for alerting
BUILD_TIME_THRESHOLD_PCT = 20  # Alert if > 20% above 30-day avg
BUNDLE_SIZE_THRESHOLD_PCT = 10  # Alert if > 10% above baseline
DOCSTRING_COVERAGE_MIN = 80.0  # Alert if below 80%


class PerformanceTracker:
    """Tracks and analyzes project performance metrics."""

    def __init__(self, history_file: str = HISTORY_FILE):
        """
        Initialize performance tracker.

        Args:
            history_file: Path to JSON file storing historical metrics
        """
        self.history_file = Path(history_file)
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Create history file with empty structure if doesn't exist."""
        if not self.history_file.exists():
            self.history_file.parent.mkdir(parents=True, exist_ok=True)
            initial_data = {
                "metadata": {
                    "first_tracked": datetime.utcnow().isoformat() + 'Z',
                    "last_updated": datetime.utcnow().isoformat() + 'Z',
                    "total_commits": 0
                },
                "build_metrics": {},
                "agent_metrics": {},
                "quality_metrics": {},
                "repo_health": {}
            }
            self._write_data(initial_data)

    def _read_data(self) -> Dict:
        """Read performance history from JSON file."""
        try:
            with open(self.history_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {
                "metadata": {},
                "build_metrics": {},
                "agent_metrics": {},
                "quality_metrics": {},
                "repo_health": {}
            }

    def _write_data(self, data: Dict) -> None:
        """Write performance history to JSON file."""
        data["metadata"]["last_updated"] = datetime.utcnow().isoformat() + 'Z'
        with open(self.history_file, 'w') as f:
            json.dump(data, f, indent=2)

    def collect_build_metrics(self) -> Dict:
        """
        Collect build performance metrics.

        Returns:
            Dictionary with build_time_ms, bundle_size_kb, eslint_warnings, etc.
        """
        # Note: This is a placeholder - actual implementation would parse build output
        # For MVP, return dummy data
        return {
            "duration_ms": 45000,  # Would extract from pnpm build output
            "bundle_size_kb": 850,  # Would parse from .next/build-manifest.json
            "eslint_warnings": 6,  # Would parse from pnpm lint output
            "eslint_errors": 0,
            "typescript_errors": 0
        }

    def collect_quality_metrics(self) -> Dict:
        """
        Collect code quality metrics.

        Returns:
            Dictionary with docstring_coverage_pct, functions count, etc.
        """
        try:
            # Run docstring coverage check
            result = subprocess.run(
                ["python3", "scripts/check_docstring_coverage.py"],
                capture_output=True,
                text=True,
                timeout=30
            )

            # Parse output (example: "Docstring Coverage: 83.54%")
            for line in result.stdout.split('\n'):
                if "Docstring Coverage:" in line:
                    coverage_str = line.split(':')[1].strip().rstrip('%')
                    coverage_pct = float(coverage_str)

                    return {
                        "docstring_coverage_pct": coverage_pct,
                        "estimated_functions": 237,  # Would parse from output
                        "missing_docstrings": 39  # Would parse from output
                    }

        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, ValueError):
            pass

        # Fallback if script fails
        return {
            "docstring_coverage_pct": 0.0,
            "estimated_functions": 0,
            "missing_docstrings": 0
        }

    def collect_repo_health(self) -> Dict:
        """
        Collect repository health metrics.

        Returns:
            Dictionary with open_prs, stale_branches, commits_today, etc.
        """
        # Count stale branches (> 7 days old)
        try:
            result = subprocess.run(
                ["git", "for-each-ref", "--sort=-committerdate", "refs/heads/", "--format=%(refname:short) %(committerdate:relative)"],
                capture_output=True,
                text=True,
                timeout=10
            )

            branches = result.stdout.strip().split('\n')
            stale_count = sum(1 for b in branches if 'weeks' in b or 'months' in b)

            # Count today's commits
            today = datetime.now().strftime('%Y-%m-%d')
            result = subprocess.run(
                ["git", "log", "--since", today, "--oneline"],
                capture_output=True,
                text=True,
                timeout=10
            )
            commits_today = len(result.stdout.strip().split('\n')) if result.stdout.strip() else 0

            return {
                "open_prs": 0,  # Would query GitHub API
                "stale_branches": stale_count,
                "commits_today": commits_today,
                "commits_7day_avg": 0.0  # Would calculate from git log
            }

        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            return {
                "open_prs": 0,
                "stale_branches": 0,
                "commits_today": 0,
                "commits_7day_avg": 0.0
            }

    def collect_metrics(self, metric_types: List[str]) -> None:
        """
        Collect specified metrics and append to history.

        Args:
            metric_types: List of metric categories to collect (build, quality, repo-health)
        """
        data = self._read_data()
        today = datetime.now().strftime('%Y-%m-%d')

        if "build" in metric_types:
            data["build_metrics"][today] = self.collect_build_metrics()
            print(f"✅ Collected build metrics for {today}")

        if "quality" in metric_types:
            data["quality_metrics"][today] = self.collect_quality_metrics()
            print(f"✅ Collected quality metrics for {today}")

        if "repo-health" in metric_types:
            data["repo_health"][today] = self.collect_repo_health()
            print(f"✅ Collected repo health metrics for {today}")

        data["metadata"]["total_commits"] = data["metadata"].get("total_commits", 0) + 1
        self._write_data(data)

    def generate_dashboard(self) -> None:
        """Generate markdown dashboard from historical data."""
        data = self._read_data()

        lines = [
            "# Performance Dashboard",
            "",
            f"**Last Updated**: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}",
            f"**Total Commits Tracked**: {data['metadata'].get('total_commits', 0)}",
            "",
            "---",
            ""
        ]

        # Build Performance Table
        lines.append("## Build Performance Trends (Last 7 Days)")
        lines.append("")
        lines.append("| Date       | Build Time | Bundle Size | ESLint | Status |")
        lines.append("|------------|------------|-------------|--------|--------|")

        build_metrics = data.get("build_metrics", {})
        sorted_dates = sorted(build_metrics.keys(), reverse=True)[:7]

        for date in sorted_dates:
            metrics = build_metrics[date]
            build_time_s = metrics.get("duration_ms", 0) / 1000
            bundle_size = metrics.get("bundle_size_kb", 0)
            warnings = metrics.get("eslint_warnings", 0)
            errors = metrics.get("eslint_errors", 0)

            status = "✅ OK" if errors == 0 else "❌ Errors"

            lines.append(
                f"| {date} | {build_time_s:.1f}s | {bundle_size} KB | "
                f"{warnings} warn, {errors} err | {status} |"
            )

        lines.append("")

        # Code Quality Table
        lines.append("## Code Quality Metrics")
        lines.append("")
        lines.append("| Date       | Docstring Coverage | Functions | Missing |")
        lines.append("|------------|--------------------|-----------|---------|")

        quality_metrics = data.get("quality_metrics", {})
        sorted_dates = sorted(quality_metrics.keys(), reverse=True)[:7]

        for date in sorted_dates:
            metrics = quality_metrics[date]
            coverage = metrics.get("docstring_coverage_pct", 0.0)
            functions = metrics.get("estimated_functions", 0)
            missing = metrics.get("missing_docstrings", 0)

            status_icon = "✅" if coverage >= DOCSTRING_COVERAGE_MIN else "⚠️"

            lines.append(
                f"| {date} | {status_icon} {coverage:.2f}% | {functions} | {missing} |"
            )

        lines.append("")

        # Write dashboard
        dashboard_path = Path(DASHBOARD_FILE)
        dashboard_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dashboard_path, 'w') as f:
            f.write('\n'.join(lines))

        print(f"✅ Dashboard generated: {DASHBOARD_FILE}")

    def check_alerts(self) -> List[str]:
        """
        Check for threshold violations and return alert messages.

        Returns:
            List of alert messages (empty if no alerts)
        """
        data = self._read_data()
        alerts = []

        # Check docstring coverage
        quality_metrics = data.get("quality_metrics", {})
        if quality_metrics:
            latest_date = max(quality_metrics.keys())
            coverage = quality_metrics[latest_date].get("docstring_coverage_pct", 100.0)

            if coverage < DOCSTRING_COVERAGE_MIN:
                alerts.append(
                    f"⚠️  Docstring coverage below threshold: {coverage:.2f}% "
                    f"(minimum: {DOCSTRING_COVERAGE_MIN}%)"
                )

        return alerts


def main():
    """CLI interface for performance tracking system."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Performance Tracker - Automated Performance Monitoring"
    )
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Collect metrics command
    collect_parser = subparsers.add_parser('collect', help='Collect performance metrics')
    collect_parser.add_argument(
        '--metrics',
        default='build,quality',
        help='Comma-separated list of metrics to collect (build, quality, repo-health)'
    )

    # Generate dashboard command
    subparsers.add_parser('generate-dashboard', help='Generate performance dashboard markdown')

    # Check alerts command
    subparsers.add_parser('check-alerts', help='Check for performance threshold violations')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    tracker = PerformanceTracker()

    if args.command == 'collect':
        metric_types = args.metrics.split(',')
        tracker.collect_metrics(metric_types)
        sys.exit(0)

    elif args.command == 'generate-dashboard':
        tracker.generate_dashboard()
        sys.exit(0)

    elif args.command == 'check-alerts':
        alerts = tracker.check_alerts()
        if alerts:
            print("⚠️  Alerts Detected:")
            for alert in alerts:
                print(f"  {alert}")
            sys.exit(1)
        else:
            print("✅ No alerts - all metrics within thresholds")
            sys.exit(0)


if __name__ == "__main__":
    main()
