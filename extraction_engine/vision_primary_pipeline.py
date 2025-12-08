"""
Vision-Primary Extraction Pipeline for Vehicle Specifications

Strategy:
1. Claude Vision (PRIMARY) - Handles complex layouts, hierarchies, rotations
2. Quality Gate Validation - Ensures extraction meets standards
3. Fallback to pdfplumber - If Claude fails or quality gate rejects
4. Final validation - Cross-check results

This pipeline prioritizes accuracy over speed, using AI vision as the
primary extraction method with traditional engines as fallback/validation.
"""

import os
import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from pdf2image import convert_from_path

# Import extraction engines
try:
    from claude_vision_extractor import extract_specs_vision
    CLAUDE_AVAILABLE = True
except ImportError:
    CLAUDE_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# Import quality gate
try:
    from quality_gate import validate_extraction
    QUALITY_GATE_AVAILABLE = True
except ImportError:
    QUALITY_GATE_AVAILABLE = False


class VisionPrimaryPipeline:
    """Production pipeline for vehicle spec extraction"""

    def __init__(
        self,
        use_quality_gate: bool = True,
        strict_validation: bool = False,
        enable_fallback: bool = True,
        cache_dir: str = "extraction_cache"
    ):
        """
        Initialize extraction pipeline

        Args:
            use_quality_gate: Enable quality validation
            strict_validation: Fail on warnings (not just errors)
            enable_fallback: Use pdfplumber fallback if Claude fails
            cache_dir: Directory for caching intermediate results
        """
        self.use_quality_gate = use_quality_gate
        self.strict_validation = strict_validation
        self.enable_fallback = enable_fallback
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)

        # Verify dependencies
        if not CLAUDE_AVAILABLE:
            raise ImportError("Claude Vision not available - install anthropic SDK")
        if use_quality_gate and not QUALITY_GATE_AVAILABLE:
            raise ImportError("Quality gate not available")

    def extract(
        self,
        pdf_path: str,
        page_num: int,
        brand: str,
        model: str,
        vehicle_type: str = "default"
    ) -> Dict:
        """
        Extract vehicle specifications using vision-primary pipeline

        Args:
            pdf_path: Path to PDF file
            page_num: Page number to extract (1-indexed)
            brand: Vehicle brand name
            model: Vehicle model name
            vehicle_type: Type for quality thresholds (sedan, suv, luxury, etc.)

        Returns:
            {
                "success": bool,
                "engine_used": "claude_vision" | "pdfplumber_fallback",
                "data": {...},  # Extraction result
                "quality_report": {...},  # Validation report
                "metadata": {
                    "extraction_time": float,
                    "validation_time": float,
                    "cost_estimate": float,
                    "fallback_triggered": bool
                }
            }
        """
        start_time = time.time()
        result = {
            "success": False,
            "engine_used": None,
            "data": None,
            "quality_report": None,
            "metadata": {
                "extraction_time": 0,
                "validation_time": 0,
                "cost_estimate": 0,
                "fallback_triggered": False
            }
        }

        # Step 1: Convert PDF page to PNG (cached)
        png_path = self._get_or_create_png(pdf_path, page_num)
        if not png_path:
            result["error"] = "Failed to convert PDF to PNG"
            return result

        # Step 2: Try Claude Vision (PRIMARY)
        extraction_result, extraction_time = self._extract_with_claude(
            png_path, brand, model
        )
        result["metadata"]["extraction_time"] = extraction_time

        # Estimate cost (Sonnet 4.5: $3/M input, $15/M output)
        # Typical: 2K input + 8K output tokens per page
        tokens_in = extraction_result.get("metadata", {}).get("input_tokens", 2000)
        tokens_out = extraction_result.get("metadata", {}).get("output_tokens", 8000)
        cost = (tokens_in / 1_000_000 * 3) + (tokens_out / 1_000_000 * 15)
        result["metadata"]["cost_estimate"] = cost

        # Step 3: Validate with Quality Gate
        if self.use_quality_gate:
            passed, quality_report = self._validate(
                extraction_result,
                vehicle_type
            )
            result["quality_report"] = quality_report
            result["metadata"]["validation_time"] = quality_report.get("metrics", {}).get("validation_time", 0)

            if passed:
                # Claude Vision succeeded and passed validation
                result["success"] = True
                result["engine_used"] = "claude_vision"
                result["data"] = extraction_result
                return result
            else:
                # Claude Vision failed validation
                if not self.enable_fallback:
                    result["error"] = "Quality gate failed, fallback disabled"
                    result["data"] = extraction_result  # Return failed data for debugging
                    return result

        else:
            # No quality gate - accept Claude Vision result
            if "error" not in extraction_result:
                result["success"] = True
                result["engine_used"] = "claude_vision"
                result["data"] = extraction_result
                return result

        # Step 4: Fallback to pdfplumber
        if self.enable_fallback and PDFPLUMBER_AVAILABLE:
            result["metadata"]["fallback_triggered"] = True
            fallback_result, fallback_time = self._extract_with_pdfplumber(
                pdf_path, page_num
            )
            result["metadata"]["extraction_time"] += fallback_time

            # Validate fallback result
            if self.use_quality_gate:
                passed, fallback_report = self._validate(
                    fallback_result,
                    vehicle_type
                )
                result["quality_report"] = fallback_report

                if passed:
                    result["success"] = True
                    result["engine_used"] = "pdfplumber_fallback"
                    result["data"] = fallback_result
                    return result
                else:
                    # Both engines failed - return best effort (Claude)
                    result["success"] = False
                    result["engine_used"] = "both_failed"
                    result["data"] = extraction_result  # Claude data (higher quality)
                    result["error"] = "Both engines failed quality gate"
                    return result
            else:
                result["success"] = True
                result["engine_used"] = "pdfplumber_fallback"
                result["data"] = fallback_result
                return result

        # No fallback or all methods failed
        result["error"] = "Extraction failed and fallback unavailable"
        result["data"] = extraction_result
        return result

    def _get_or_create_png(self, pdf_path: str, page_num: int) -> Optional[str]:
        """Convert PDF page to PNG, using cache if available"""
        cache_key = f"{Path(pdf_path).stem}_page{page_num}.png"
        cache_path = self.cache_dir / cache_key

        if cache_path.exists():
            return str(cache_path)

        try:
            images = convert_from_path(
                pdf_path,
                first_page=page_num,
                last_page=page_num,
                dpi=150  # Balance quality vs size
            )
            images[0].save(cache_path)
            return str(cache_path)
        except Exception:
            return None

    def _extract_with_claude(
        self,
        png_path: str,
        brand: str,
        model: str
    ) -> Tuple[Dict, float]:
        """Extract using Claude Vision"""
        start = time.time()
        try:
            result = extract_specs_vision(png_path, brand, model)
            return result, time.time() - start
        except Exception as e:
            return {"error": str(e)}, time.time() - start

    def _extract_with_pdfplumber(
        self,
        pdf_path: str,
        page_num: int
    ) -> Tuple[Dict, float]:
        """Extract using pdfplumber (fallback)"""
        start = time.time()
        try:
            with pdfplumber.open(pdf_path) as pdf:
                page = pdf.pages[page_num - 1]
                tables = page.find_tables()

                if not tables:
                    return {"error": "No tables found"}, time.time() - start

                # Convert to Claude Vision-compatible format
                # (simplified - real implementation would need better mapping)
                specs = []
                for table in tables:
                    table_data = table.extract()
                    if table_data and len(table_data) > 1:
                        headers = table_data[0]  # First row as trims
                        for row in table_data[1:]:
                            if len(row) > 0:
                                label = row[0]
                                values = {}
                                for i, trim in enumerate(headers[1:], 1):
                                    if i < len(row):
                                        values[trim] = row[i]

                                specs.append({
                                    "category": "EXTRACTED",
                                    "label": label,
                                    "values": values
                                })

                return {
                    "trims": headers[1:] if headers else [],
                    "specs": specs,
                    "metadata": {
                        "extraction_time": time.time() - start,
                        "source": "pdfplumber"
                    }
                }, time.time() - start

        except Exception as e:
            return {"error": str(e)}, time.time() - start

    def _validate(
        self,
        extraction_result: Dict,
        vehicle_type: str
    ) -> Tuple[bool, Dict]:
        """Validate extraction with quality gate"""
        start = time.time()
        passed, report = validate_extraction(
            extraction_result,
            vehicle_type=vehicle_type,
            strict=self.strict_validation
        )
        report["metrics"]["validation_time"] = time.time() - start
        return passed, report


def extract_vehicle_specs(
    pdf_path: str,
    page_num: int,
    brand: str,
    model: str,
    vehicle_type: str = "default",
    **kwargs
) -> Dict:
    """
    Convenience function for single extraction

    Args:
        pdf_path: Path to PDF
        page_num: Page number (1-indexed)
        brand: Vehicle brand
        model: Vehicle model
        vehicle_type: Type (sedan, suv, luxury, electric)
        **kwargs: Additional pipeline options

    Returns:
        Extraction result dict
    """
    pipeline = VisionPrimaryPipeline(**kwargs)
    return pipeline.extract(pdf_path, page_num, brand, model, vehicle_type)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 5:
        print("Usage: python vision_primary_pipeline.py <pdf_path> <page_num> <brand> <model> [vehicle_type]")
        print()
        print("Example:")
        print("  python vision_primary_pipeline.py pdf_samples/BMW_X5_LCI_2025.pdf 15 BMW X5 luxury")
        sys.exit(1)

    pdf_path = sys.argv[1]
    page_num = int(sys.argv[2])
    brand = sys.argv[3]
    model = sys.argv[4]
    vehicle_type = sys.argv[5] if len(sys.argv) > 5 else "default"

    print(f"Extracting specs: {brand} {model} (page {page_num})")
    print(f"Vehicle type: {vehicle_type}")
    print()

    result = extract_vehicle_specs(
        pdf_path,
        page_num,
        brand,
        model,
        vehicle_type
    )

    # Print summary
    print("=" * 80)
    print(f"Status: {'✅ SUCCESS' if result['success'] else '❌ FAILED'}")
    print(f"Engine: {result['engine_used']}")
    if result.get("metadata"):
        print(f"Time: {result['metadata']['extraction_time']:.1f}s")
        print(f"Cost: ${result['metadata']['cost_estimate']:.4f}")
        if result['metadata'].get('fallback_triggered'):
            print("⚠️  Fallback triggered")
    print("=" * 80)

    # Print quality report if available
    if result.get("quality_report"):
        qr = result["quality_report"]
        print()
        print("Quality Report:")
        print(f"  Gates: {sum(1 for v in qr['gates'].values() if v)}/{len(qr['gates'])} passed")
        print(f"  Errors: {len(qr['errors'])}")
        print(f"  Warnings: {len(qr['warnings'])}")
        if qr.get("metrics"):
            print(f"  Specs: {qr['metrics'].get('spec_count', 0)}")
            print(f"  Trims: {qr['metrics'].get('trim_count', 0)}")

    # Print errors if any
    if result.get("error"):
        print()
        print(f"Error: {result['error']}")

    # Save full result
    output_file = f"{brand}_{model}_page{page_num}_result.json"
    with open(output_file, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print()
    print(f"Full result saved to: {output_file}")
