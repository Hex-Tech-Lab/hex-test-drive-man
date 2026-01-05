#!/usr/bin/env python3
"""
Extract Web Vitals from Chrome DevTools trace
Handles relative timestamps correctly
"""

import json
import sys

def extract_metrics(trace_path: str):
    """Extract Web Vitals and key timing metrics."""
    with open(trace_path, 'r') as f:
        trace = json.load(f)

    # Get metadata
    metadata = trace.get('metadata', {})
    start_time = metadata.get('startTime', '')

    print(f"Trace start time: {start_time}")
    print(f"Source: {metadata.get('source')}")
    print(f"Version: {metadata.get('enhancedTraceVersion')}")

    # Look for lighthouse results in trace
    events = trace.get('traceEvents', [])

    # Find navigation start (baseline for relative timestamps)
    nav_start = None
    for event in events:
        if event.get('name') == 'navigationStart':
            nav_start = event.get('ts', 0)
            break

    if not nav_start:
        # Use first event as baseline
        nav_start = events[0].get('ts', 0) if events else 0

    print(f"\nNavigation start: {nav_start / 1000:.0f}ms (baseline)")

    # Extract Web Vitals relative to navigation start
    vitals = {}

    for event in events:
        ts = event.get('ts', 0)
        relative_ms = (ts - nav_start) / 1000  # Microseconds to milliseconds
        name = event.get('name', '')

        # Web Vitals events
        if name == 'firstContentfulPaint':
            vitals['FCP'] = relative_ms
        elif name == 'largestContentfulPaint::Candidate':
            vitals['LCP_Candidate'] = relative_ms
        elif name == 'largestContentfulPaint::Invalidate':
            print(f"  LCP invalidated at {relative_ms:.0f}ms")
        elif name == 'firstPaint':
            vitals['FP'] = relative_ms
        elif name == 'domContentLoadedEventEnd':
            vitals['DCL'] = relative_ms
        elif name == 'loadEventEnd':
            vitals['Load'] = relative_ms

    print("\n=== WEB VITALS (Relative to Navigation Start) ===")
    for metric in ['FP', 'FCP', 'LCP_Candidate', 'DCL', 'Load']:
        if metric in vitals:
            value = vitals[metric]
            # Clamp to reasonable range (0-10000ms)
            if 0 <= value <= 10000:
                print(f"  {metric:20s}: {value:>8.2f}ms")
            else:
                print(f"  {metric:20s}: {value:>8.2f}ms (out of range, likely invalid)")

    # Extract key resources
    print("\n=== CRITICAL RESOURCES (First 10) ===")
    resources = []

    for event in events:
        if event.get('name') == 'ResourceSendRequest':
            ts = event.get('ts', 0)
            relative_ms = (ts - nav_start) / 1000

            args = event.get('args', {}).get('data', {})
            url = args.get('url', '')
            priority = args.get('priority', 'unknown')

            if url and not url.startswith('data:') and 0 <= relative_ms <= 5000:
                resources.append((relative_ms, url, priority))

    resources.sort()

    for i, (time, url, priority) in enumerate(resources[:10], 1):
        # Determine resource type
        rtype = 'other'
        if '.css' in url:
            rtype = 'CSS'
        elif '.js' in url:
            rtype = 'JS'
        elif any(ext in url for ext in ['.jpg', '.png', '.webp', '.svg']):
            rtype = 'IMG'

        print(f"  {i:2d}. {time:>7.0f}ms [{rtype:>5s}] {url[:70]} ({priority})")

    return vitals

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 extract-web-vitals.py <trace.json>")
        sys.exit(1)

    extract_metrics(sys.argv[1])
