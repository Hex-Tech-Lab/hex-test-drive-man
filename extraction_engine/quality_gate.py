"""
Quality Gate Validator for Vehicle Spec Extraction

Validates extraction results from vision/OCR engines to ensure:
- Completeness (minimum row count, trim coverage)
- Structural integrity (schema compliance, data types)
- Semantic accuracy (valid values, units, formatting)
- Cross-validation against fallback engines (optional)
"""

from typing import Dict, List, Tuple, Optional
import re


class QualityGate:
    """Validate vehicle spec extraction quality"""

    # Egyptian market typical spec counts by vehicle type
    MIN_SPECS = {
        "sedan": 45,
        "suv": 50,
        "luxury": 60,
        "electric": 40,
        "default": 40
    }

    # Required spec categories (should exist in most PDFs)
    REQUIRED_CATEGORIES = [
        "ENGINE",
        "TRANSMISSION",
        "CHASSIS",
        "DIMENSIONS"
    ]

    def __init__(self, vehicle_type: str = "default", strict: bool = False):
        """
        Initialize quality gate

        Args:
            vehicle_type: Vehicle type for min spec threshold
            strict: If True, fail on any warning (not just errors)
        """
        self.vehicle_type = vehicle_type
        self.strict = strict
        self.min_specs_required = self.MIN_SPECS.get(vehicle_type, self.MIN_SPECS["default"])

    def validate(self, extraction_result: Dict) -> tuple[bool, Dict]:
        """
        Run all quality checks on extraction result

        Args:
            extraction_result: Output from extraction engine

        Returns:
            (passed: bool, report: dict)
            - passed: True if all gates passed (or warnings only if not strict)
            - report: Detailed validation report with errors/warnings
        """
        report = {
            "passed": True,
            "errors": [],
            "warnings": [],
            "metrics": {},
            "gates": {}
        }

        # Skip validation if extraction failed
        if "error" in extraction_result:
            report["passed"] = False
            report["errors"].append(f"Extraction failed: {extraction_result['error']}")
            return False, report

        # Gate 1: Schema validation
        schema_ok, schema_errors = self._validate_schema(extraction_result)
        report["gates"]["schema"] = schema_ok
        if not schema_ok:
            report["errors"].extend(schema_errors)
            report["passed"] = False

        # Gate 2: Completeness check
        complete_ok, complete_report = self._validate_completeness(extraction_result)
        report["gates"]["completeness"] = complete_ok
        if not complete_ok:
            report["errors"].extend(complete_report["errors"])
            report["warnings"].extend(complete_report["warnings"])
            if self.strict or complete_report["errors"]:
                report["passed"] = False

        # Gate 3: Structural integrity
        struct_ok, struct_errors = self._validate_structure(extraction_result)
        report["gates"]["structure"] = struct_ok
        if not struct_ok:
            report["warnings"].extend(struct_errors)
            if self.strict:
                report["passed"] = False

        # Gate 4: Semantic validation
        semantic_ok, semantic_warnings = self._validate_semantics(extraction_result)
        report["gates"]["semantics"] = semantic_ok
        if not semantic_ok:
            report["warnings"].extend(semantic_warnings)
            if self.strict:
                report["passed"] = False

        # Collect metrics
        report["metrics"] = self._collect_metrics(extraction_result)

        return report["passed"], report

    def _validate_schema(self, result: Dict) -> tuple[bool, list[str]]:
        """Validate JSON schema compliance"""
        errors = []

        # Required top-level keys
        if "trims" not in result:
            errors.append("Missing 'trims' key in result")
        if "specs" not in result:
            errors.append("Missing 'specs' key in result")

        # Validate trims is list of strings
        if "trims" in result:
            if not isinstance(result["trims"], list):
                errors.append("'trims' must be a list")
            elif not all(isinstance(t, str) for t in result["trims"]):
                errors.append("All trims must be strings")

        # Validate specs is list of dicts
        if "specs" in result:
            if not isinstance(result["specs"], list):
                errors.append("'specs' must be a list")
            else:
                for i, spec in enumerate(result["specs"]):
                    if not isinstance(spec, dict):
                        errors.append(f"Spec {i} is not a dict")
                        continue

                    # Required fields in each spec
                    for field in ["label", "values"]:
                        if field not in spec:
                            errors.append(f"Spec {i} missing '{field}' field")

                    # Values must be dict
                    if "values" in spec and not isinstance(spec["values"], dict):
                        errors.append(f"Spec {i} 'values' must be a dict")

        return len(errors) == 0, errors

    def _validate_completeness(self, result: Dict) -> tuple[bool, Dict]:
        """Check if extraction is complete enough"""
        errors = []
        warnings = []

        trims = result.get("trims", [])
        specs = result.get("specs", [])

        # Minimum trim count
        if len(trims) < 2:
            errors.append(f"Only {len(trims)} trim(s) detected (minimum 2 expected)")

        # Minimum spec count
        if len(specs) < self.min_specs_required:
            warnings.append(
                f"Only {len(specs)} specs extracted (expected ≥{self.min_specs_required} for {self.vehicle_type})"
            )

        # Check for required categories
        categories = {spec.get("category", "").upper() for spec in specs if "category" in spec}
        missing_categories = set(self.REQUIRED_CATEGORIES) - categories
        if missing_categories:
            warnings.append(f"Missing categories: {', '.join(missing_categories)}")

        # Check spec coverage per trim
        for trim in trims:
            trim_specs = sum(1 for spec in specs if trim in spec.get("values", {}))
            coverage = (trim_specs / len(specs) * 100) if specs else 0

            if coverage < 50:
                warnings.append(
                    f"Trim '{trim}' has low coverage: {trim_specs}/{len(specs)} specs ({coverage:.1f}%)"
                )

        return len(errors) == 0, {"errors": errors, "warnings": warnings}

    def _validate_structure(self, result: Dict) -> tuple[bool, list[str]]:
        """Validate hierarchical structure and consistency"""
        warnings = []

        specs = result.get("specs", [])

        # Check for hierarchical consistency
        for spec in specs:
            category = spec.get("category", "")
            subcategory = spec.get("subcategory", "")

            # Warn if subcategory without category
            if subcategory and not category:
                warnings.append(
                    f"Spec '{spec.get('label')}' has subcategory but no category"
                )

        # Check for duplicate labels within same category
        seen = set()
        for spec in specs:
            key = (spec.get("category", ""), spec.get("subcategory", ""), spec.get("label", ""))
            if key in seen:
                warnings.append(f"Duplicate spec: {' > '.join(filter(None, key))}")
            seen.add(key)

        return len(warnings) == 0, warnings

    def _validate_semantics(self, result: Dict) -> tuple[bool, list[str]]:
        """Validate semantic accuracy of extracted values"""
        warnings = []

        specs = result.get("specs", [])

        # Common unit patterns
        unit_patterns = {
            "power": r"\d+\s*(HP|kW|PS)",
            "displacement": r"\d+\s*(CC|L|ml)",
            "torque": r"\d+\s*(Nm|lb-ft)",
            "dimension": r"\d+\s*(mm|cm|m)",
            "weight": r"\d+\s*(kg|lbs)",
            "speed": r"\d+\s*(km/h|mph)",
        }

        # Check if numeric values have units
        for spec in specs:
            label = spec.get("label", "").lower()
            values = spec.get("values", {})

            for trim, value in values.items():
                if value is None or value == "-" or value == "N/A":
                    continue

                # Check if label suggests numeric value should have units
                if any(keyword in label for keyword in ["power", "torque", "displacement", "weight"]):
                    # Check if value has units
                    has_units = any(re.search(pattern, str(value), re.IGNORECASE) for pattern in unit_patterns.values())

                    if not has_units and re.search(r"\d+", str(value)):
                        warnings.append(
                            f"Spec '{spec.get('label')}' for {trim} may be missing units: '{value}'"
                        )

        return len(warnings) == 0, warnings

    def _collect_metrics(self, result: Dict) -> Dict:
        """Collect extraction metrics for reporting"""
        trims = result.get("trims", [])
        specs = result.get("specs", [])

        # Category distribution
        categories = {}
        for spec in specs:
            cat = spec.get("category", "Uncategorized")
            categories[cat] = categories.get(cat, 0) + 1

        # Coverage per trim
        trim_coverage = {}
        for trim in trims:
            filled = sum(
                1 for spec in specs
                if spec.get("values", {}).get(trim) not in [None, "", "-", "N/A"]
            )
            trim_coverage[trim] = {
                "filled": filled,
                "total": len(specs),
                "percentage": (filled / len(specs) * 100) if specs else 0
            }

        return {
            "trim_count": len(trims),
            "spec_count": len(specs),
            "category_distribution": categories,
            "trim_coverage": trim_coverage,
            "extraction_time": result.get("metadata", {}).get("extraction_time", 0)
        }


def validate_extraction(
    extraction_result: Dict,
    vehicle_type: str = "default",
    strict: bool = False
) -> tuple[bool, Dict]:
    """
    Convenience function to validate extraction result

    Args:
        extraction_result: Output from extraction engine
        vehicle_type: Vehicle type (sedan, suv, luxury, electric)
        strict: If True, warnings count as failures

    Returns:
        (passed, report)
    """
    gate = QualityGate(vehicle_type=vehicle_type, strict=strict)
    return gate.validate(extraction_result)


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python quality_gate.py <extraction_result.json> [vehicle_type] [--strict]")
        sys.exit(1)

    result_path = sys.argv[1]
    vehicle_type = sys.argv[2] if len(sys.argv) > 2 else "default"
    strict = "--strict" in sys.argv

    with open(result_path) as f:
        result = json.load(f)

    passed, report = validate_extraction(result, vehicle_type, strict)

    print(json.dumps(report, indent=2))
    print()
    print(f"Status: {'✅ PASSED' if passed else '❌ FAILED'}")

    sys.exit(0 if passed else 1)
