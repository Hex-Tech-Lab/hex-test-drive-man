#!/usr/bin/env python3
"""
Agent Response Validation Script

Validates agent responses against mandatory format checklist.
See: docs/standards/AGENT_RESPONSE_VALIDATION.md

Usage:
    python scripts/validate-agent-response.py --agent CC --input response.md
    pbpaste | python scripts/validate-agent-response.py --agent BB
"""

import argparse
import re
import sys
from typing import Tuple, List, Dict


def validate_task_header(text: str) -> Tuple[bool, List[str]]:
    """
    Check if response has proper task completion header.
    
    Args:
        text: Full response text
        
    Returns:
        (pass/fail, list of missing elements)
    """
    errors = []
    
    # Check first 200 characters for header
    header_section = text[:200]
    
    # Check for ✅ emoji
    if '✅' not in header_section:
        errors.append("Task header: Missing ✅ emoji")
    
    # Check for "Task Complete" phrase
    if 'Task Complete' not in header_section:
        errors.append("Task header: Missing 'Task Complete' phrase")
    
    return (len(errors) == 0, errors)


def validate_timebox(text: str) -> Tuple[bool, List[str]]:
    """
    Check if all timebox metrics are present.
    
    Args:
        text: Full response text
        
    Returns:
        (pass/fail, list of missing fields)
    """
    errors = []
    
    # Check for Timebox section
    if '**Timebox**:' not in text:
        errors.append("Timebox: Section not found")
        return (False, errors)
    
    # Extract timebox section (between **Timebox**: and next ** section or end)
    timebox_match = re.search(
        r'\*\*Timebox\*\*:(.*?)(?:\n\*\*[A-Z]|\Z)',
        text,
        re.DOTALL | re.IGNORECASE
    )
    
    if not timebox_match:
        errors.append("Timebox: Could not parse section")
        return (False, errors)
    
    timebox_text = timebox_match.group(1)
    
    # Check for required fields
    if not re.search(r'Allocated:\s*\d+\s*min', timebox_text, re.IGNORECASE):
        errors.append("Timebox: Time allocated not found")
    
    if not re.search(r'Actual:\s*\d+\s*min', timebox_text, re.IGNORECASE):
        errors.append("Timebox: Time actual not found")
    
    if not re.search(
        r'Variance:\s*[+-]?\d+\.?\d*%\s*\((?:over|under)\s+budget\)',
        timebox_text,
        re.IGNORECASE
    ):
        errors.append("Timebox: Variance not calculated or missing direction")
    
    if not re.search(
        r'Tokens:\s*\d+\s*/\s*200k\s*\(\d+\.?\d*%\)',
        timebox_text,
        re.IGNORECASE
    ):
        errors.append("Timebox: Token usage not found or missing percentage")
    
    return (len(errors) == 0, errors)


def validate_deliverables(text: str) -> Tuple[bool, List[str]]:
    """
    Check if deliverables section is complete.
    
    Args:
        text: Full response text
        
    Returns:
        (pass/fail, list of missing fields)
    """
    errors = []
    
    # Check for Deliverables section
    if '**Deliverables**:' not in text:
        errors.append("Deliverables: Section not found")
        return (False, errors)
    
    # Extract deliverables section
    deliverables_match = re.search(
        r'\*\*Deliverables\*\*:(.*?)(?:\n\*\*[A-Z]|\Z)',
        text,
        re.DOTALL | re.IGNORECASE
    )
    
    if not deliverables_match:
        errors.append("Deliverables: Could not parse section")
        return (False, errors)
    
    deliverables_text = deliverables_match.group(1)
    
    # Check for Files subsection
    if not re.search(r'[-*]\s*Files:', deliverables_text, re.IGNORECASE):
        errors.append("Deliverables: Files list not found")
    
    # Check for Commits subsection
    if not re.search(r'[-*]\s*Commits:', deliverables_text, re.IGNORECASE):
        errors.append("Deliverables: Commits list not found")
    
    # Check for Build status
    if not re.search(r'[-*]\s*Build:', deliverables_text, re.IGNORECASE):
        errors.append("Deliverables: Build status not found")
    
    return (len(errors) == 0, errors)


def validate_self_critique(text: str) -> Tuple[bool, List[str]]:
    """
    Check if self-critique section is complete.
    
    Args:
        text: Full response text
        
    Returns:
        (pass/fail, list of missing subsections)
    """
    errors = []
    
    # Check for Self-Critique section
    if '**Self-Critique**:' not in text:
        errors.append("Self-critique: Section not found")
        return (False, errors)
    
    # Extract self-critique section
    critique_match = re.search(
        r'\*\*Self-Critique\*\*:(.*?)(?:\n\*\*[A-Z]|\Z)',
        text,
        re.DOTALL | re.IGNORECASE
    )
    
    if not critique_match:
        errors.append("Self-critique: Could not parse section")
        return (False, errors)
    
    critique_text = critique_match.group(1)
    
    # Check for required subsections
    if not re.search(r'[-*]\s*What went well:', critique_text, re.IGNORECASE):
        errors.append("Self-critique: 'What went well' subsection missing")
    
    if not re.search(r'[-*]\s*What could improve:', critique_text, re.IGNORECASE):
        errors.append("Self-critique: 'What could improve' subsection missing")
    
    if not re.search(r'[-*]\s*Lesson learned:', critique_text, re.IGNORECASE):
        errors.append("Self-critique: 'Lesson learned' subsection missing")
    
    return (len(errors) == 0, errors)


def validate_next_steps(text: str) -> Tuple[bool, List[str]]:
    """
    Check if next steps section is complete.
    
    Args:
        text: Full response text
        
    Returns:
        (pass/fail, list of missing fields)
    """
    errors = []
    
    # Check for Next Steps section
    if '**Next Steps**:' not in text:
        errors.append("Next steps: Section not found")
        return (False, errors)
    
    # Extract next steps section
    steps_match = re.search(
        r'\*\*Next Steps\*\*:(.*?)(?:\n\*\*[A-Z]|\Z)',
        text,
        re.DOTALL | re.IGNORECASE
    )
    
    if not steps_match:
        errors.append("Next steps: Could not parse section")
        return (False, errors)
    
    steps_text = steps_match.group(1)
    
    # Check for required fields
    if not re.search(r'[-*]\s*Immediate:', steps_text, re.IGNORECASE):
        errors.append("Next steps: 'Immediate' actions not found")
    
    if not re.search(r'[-*]\s*Blocked by:', steps_text, re.IGNORECASE):
        errors.append("Next steps: 'Blocked by' field not found")
    
    return (len(errors) == 0, errors)


def validate_response(text: str, agent: str, verbose: bool = False) -> Dict:
    """
    Orchestrate all validations.
    
    Args:
        text: Full response text
        agent: Agent identifier (CC, BB, GC, etc.)
        verbose: Show detailed results
        
    Returns:
        Dictionary with validation results
    """
    results = {
        'task_header': validate_task_header(text),
        'timebox': validate_timebox(text),
        'deliverables': validate_deliverables(text),
        'self_critique': validate_self_critique(text),
        'next_steps': validate_next_steps(text),
    }
    
    # Collect all errors
    all_errors = []
    for section, (passed, errors) in results.items():
        if not passed:
            all_errors.extend(errors)
    
    return {
        'passed': len(all_errors) == 0,
        'errors': all_errors,
        'results': results,
        'agent': agent,
    }


def format_output(validation_result: Dict, verbose: bool = False) -> str:
    """
    Format validation results for display.
    
    Args:
        validation_result: Results from validate_response()
        verbose: Show detailed section-by-section results
        
    Returns:
        Formatted output string
    """
    if validation_result['passed']:
        return "✅ PASS: All required fields present"
    
    errors = validation_result['errors']
    error_count = len(errors)
    
    output = f"❌ FAIL: Missing {error_count} required field{'s' if error_count != 1 else ''}:\n"
    
    for error in errors:
        output += f"- {error}\n"
    
    output += "\nFix these issues and re-validate before submitting."
    
    if verbose:
        output += "\n\n--- Detailed Results ---\n"
        for section, (passed, section_errors) in validation_result['results'].items():
            status = "✅ PASS" if passed else "❌ FAIL"
            output += f"{section}: {status}\n"
            if section_errors:
                for err in section_errors:
                    output += f"  - {err}\n"
    
    return output


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Validate agent response against mandatory format checklist',
        epilog='See: docs/standards/AGENT_RESPONSE_VALIDATION.md'
    )
    
    parser.add_argument(
        '--agent',
        type=str,
        required=True,
        choices=['CC', 'BB', 'GC', 'CCW', 'MSC', 'GPT', 'KWSL'],
        help='Agent identifier (for logging)'
    )
    
    parser.add_argument(
        '--input',
        type=str,
        help='Path to response file (if not using stdin)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed validation results'
    )
    
    args = parser.parse_args()
    
    # Read input
    try:
        if args.input:
            # Read from file
            import os
            if not os.path.exists(args.input):
                print(f"❌ ERROR: File not found: {args.input}", file=sys.stderr)
                sys.exit(2)
            
            with open(args.input, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            # Read from stdin
            text = sys.stdin.read()
        
        if not text.strip():
            print("❌ ERROR: Empty input (no text to validate)", file=sys.stderr)
            sys.exit(2)
    
    except UnicodeDecodeError:
        print("❌ ERROR: Invalid UTF-8 encoding", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(f"❌ ERROR: Failed to read input: {e}", file=sys.stderr)
        sys.exit(2)
    
    # Validate
    try:
        result = validate_response(text, args.agent, args.verbose)
        output = format_output(result, args.verbose)
        print(output)
        
        # Exit with appropriate code
        sys.exit(0 if result['passed'] else 1)
    
    except Exception as e:
        print(f"❌ ERROR: Validation failed: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == '__main__':
    main()
