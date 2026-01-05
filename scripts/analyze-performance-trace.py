#!/usr/bin/env python3
"""
Amazon Performance Trace Analyzer
Extracts key metrics and loading patterns from Chrome DevTools trace
"""

import json
import sys
from collections import defaultdict
from typing import Dict, List, Any

def analyze_trace(trace_path: str) -> Dict[str, Any]:
    """
    Analyze Chrome DevTools performance trace.

    Args:
        trace_path: Path to decompressed JSON trace file

    Returns:
        Dictionary with performance metrics and patterns
    """
    print(f"Loading trace from {trace_path}...")

    with open(trace_path, 'r') as f:
        trace = json.load(f)

    metrics = {
        'web_vitals': {},
        'resources': defaultdict(list),
        'loading_sequence': [],
        'critical_path': [],
    }

    # Extract Web Vitals from trace events
    events = trace.get('traceEvents', [])

    for event in events:
        name = event.get('name', '')

        # Look for Web Vitals markers
        if name == 'largestContentfulPaint::Candidate':
            lcp_time = event.get('ts', 0) / 1000  # microseconds to ms
            metrics['web_vitals']['LCP'] = lcp_time

        elif name == 'firstContentfulPaint':
            fcp_time = event.get('ts', 0) / 1000
            metrics['web_vitals']['FCP'] = fcp_time

        elif name == 'TimeToInteractive':
            tti_time = event.get('ts', 0) / 1000
            metrics['web_vitals']['TTI'] = tti_time

        # Track resource loading
        elif name in ['ResourceSendRequest', 'ResourceReceiveResponse', 'ResourceFinish']:
            args = event.get('args', {}).get('data', {})
            url = args.get('url', '')

            if url and not url.startswith('data:'):
                resource_type = 'unknown'

                if '.js' in url:
                    resource_type = 'javascript'
                elif '.css' in url:
                    resource_type = 'css'
                elif any(ext in url for ext in ['.jpg', '.png', '.webp', '.svg']):
                    resource_type = 'image'
                elif '.woff' in url or '.ttf' in url:
                    resource_type = 'font'

                metrics['resources'][resource_type].append({
                    'url': url[:100],  # Truncate long URLs
                    'event': name,
                    'time': event.get('ts', 0) / 1000000,  # Convert to seconds
                    'priority': args.get('priority', 'unknown'),
                })

    # Calculate loading sequence (first 10 resources)
    all_resources = []
    for rtype, resources in metrics['resources'].items():
        for r in resources:
            if r['event'] == 'ResourceSendRequest':
                all_resources.append((r['time'], rtype, r['url'], r['priority']))

    all_resources.sort()
    metrics['loading_sequence'] = [
        {'time': f"{t:.3f}s", 'type': rt, 'url': url[:60], 'priority': pri}
        for t, rt, url, pri in all_resources[:20]
    ]

    return metrics

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze-performance-trace.py <trace.json>")
        sys.exit(1)

    trace_path = sys.argv[1]
    metrics = analyze_trace(trace_path)

    print("\n=== WEB VITALS ===")
    for metric, value in metrics['web_vitals'].items():
        if isinstance(value, (int, float)):
            print(f"  {metric}: {value:.2f}ms")
        else:
            print(f"  {metric}: {value}")

    print("\n=== RESOURCE COUNTS ===")
    for rtype, resources in metrics['resources'].items():
        print(f"  {rtype}: {len(resources)} requests")

    print("\n=== LOADING SEQUENCE (First 20 Resources) ===")
    for i, res in enumerate(metrics['loading_sequence'], 1):
        print(f"  {i:2d}. {res['time']:>8s} [{res['type']:>10s}] {res['url'][:50]} (priority: {res['priority']})")

    # Save detailed output
    output_path = trace_path.replace('.json', '-analysis.json')
    with open(output_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"\n✅ Detailed analysis saved to: {output_path}")

if __name__ == '__main__':
    main()
