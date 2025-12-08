"""
Claude Vision-based Table Extraction Engine
Uses Anthropic's Claude Sonnet 4.5 with vision capabilities to extract
vehicle specification tables from PDF page images.

Handles:
- Multi-level hierarchical headers
- Color-coded visual groupings
- 90-degree rotated section spanners
- Complex merged cells with visual context
"""

import os
import json
import base64
import time
from pathlib import Path
from typing import Dict, List, Optional

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class ClaudeVisionExtractor:
    """Extract structured data from vehicle spec tables using Claude Vision"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize extractor with Anthropic API key

        Args:
            api_key: Anthropic API key (defaults to ANTHROPIC_API_KEY env var)
        """
        if not ANTHROPIC_AVAILABLE:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")

        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        self.client = anthropic.Anthropic(api_key=self.api_key)

    def extract_specs(
        self,
        png_path: str,
        brand: str,
        model: str,
        expected_trims: Optional[list[str]] = None
    ) -> Dict:
        """
        Extract vehicle specifications from PNG image

        Args:
            png_path: Path to PNG image of specification table
            brand: Vehicle brand name (for context)
            model: Vehicle model name (for context)
            expected_trims: Optional list of expected trim names for validation

        Returns:
            {
                "trims": ["ACTIVE", "COMFORT", ...],
                "specs": [
                    {
                        "category": "ENGINE",
                        "subcategory": "Performance",
                        "label": "Max Power",
                        "values": {
                            "ACTIVE": "122 HP @ 6000 RPM",
                            "COMFORT": "142 HP @ 6000 RPM"
                        }
                    }
                ],
                "metadata": {
                    "layout_type": "multi_column",
                    "has_rotated_headers": true,
                    "color_coded_sections": true,
                    "extraction_time": 12.5,
                    "model_used": "claude-sonnet-4.5"
                }
            }
        """
        start_time = time.time()

        # Validate image path
        image_path = Path(png_path)
        if not image_path.exists():
            return {
                "error": f"Image file not found: {png_path}",
                "trims": [],
                "specs": [],
                "metadata": {"extraction_time": 0, "success": False}
            }

        # Load and encode image
        with open(image_path, "rb") as f:
            image_data = base64.standard_b64encode(f.read()).decode("utf-8")

        # Build vision prompt
        prompt = self._build_extraction_prompt(brand, model, expected_trims)

        # Call Claude Vision API
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",  # Latest Sonnet with vision
                max_tokens=16000,  # Large tables need more tokens
                temperature=0,  # Deterministic extraction
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/png",
                                    "data": image_data,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )

            # Parse response
            response_text = message.content[0].text
            result = self._parse_response(response_text)

            # Add metadata
            result["metadata"] = result.get("metadata", {})
            result["metadata"]["extraction_time"] = time.time() - start_time
            result["metadata"]["model_used"] = "claude-sonnet-4.5"
            result["metadata"]["input_tokens"] = message.usage.input_tokens
            result["metadata"]["output_tokens"] = message.usage.output_tokens

            return result

        except Exception as e:
            return {
                "error": str(e),
                "trims": [],
                "specs": [],
                "metadata": {
                    "extraction_time": time.time() - start_time,
                    "success": False
                }
            }

    def _build_extraction_prompt(
        self,
        brand: str,
        model: str,
        expected_trims: Optional[list[str]]
    ) -> str:
        """Build detailed extraction prompt for Claude"""

        trim_hint = ""
        if expected_trims:
            trim_hint = f"\n\nExpected trim names: {', '.join(expected_trims)}"

        return f"""
Analyze this vehicle specifications table for {brand} {model}.{trim_hint}

Extract ALL specifications into structured JSON with this EXACT schema:

{{
  "trims": ["trim1", "trim2", ...],
  "specs": [
    {{
      "category": "ENGINE",
      "subcategory": "Performance",
      "label": "Max Power",
      "values": {{
        "ACTIVE": "122 HP @ 6000 RPM",
        "COMFORT": "142 HP @ 6000 RPM"
      }}
    }}
  ],
  "metadata": {{
    "layout_type": "multi_column" | "single_column" | "complex",
    "has_rotated_headers": true | false,
    "color_coded_sections": true | false,
    "section_colors": ["blue", "green", ...]
  }}
}}

CRITICAL INSTRUCTIONS:

1. **Trim Detection** (column headers):
   - Look for trim names in the TOP row (ACTIVE, COMFORT, SMART, etc.)
   - Handle rotated text (90° vertical headers)
   - Strip footnote markers (*, †, 1, 2, etc.)

2. **Hierarchical Structure**:
   - `category`: Top-level section (often color-coded backgrounds)
     Examples: ENGINE, TRANSMISSION, CHASSIS, SAFETY, COMFORT
   - `subcategory`: Sub-section within category (may be bold or indented)
     Examples: Performance, Fuel, Type, Brakes, Airbags
   - `label`: Individual specification name
     Examples: Max Power, Displacement, Wheel Size

3. **Visual Cues**:
   - Use color-coded backgrounds to group related specs into categories
   - Respect indentation levels (indented = subcategory or sub-spec)
   - Handle 90° rotated section headers (e.g., "EXTERIOR" vertically)
   - Merged cells spanning multiple columns = shared value for those trims

4. **Value Extraction**:
   - Include units (HP, CC, mm, kg, etc.)
   - Preserve "N/A", "-", "Standard", "Optional" as-is
   - For empty cells, use null (not empty string)
   - For specs that apply to all trims, repeat the value in each trim's object

5. **Completeness**:
   - Extract EVERY row, even if it's a header or separator
   - Don't skip rows because some cells are empty
   - Aim for 50+ specs (typical vehicle spec sheet)

6. **Output Format**:
   - Return ONLY valid JSON
   - No markdown code blocks
   - No explanations or comments
   - Escape special characters properly

Begin extraction now.
"""

    def _parse_response(self, response_text: str) -> Dict:
        """Parse Claude's response, handling markdown if present"""

        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Parse JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {e}\n\nResponse:\n{response_text}")


def extract_specs_vision(
    png_path: str,
    brand: str,
    model: str,
    api_key: Optional[str] = None
) -> Dict:
    """
    Convenience function for single extraction

    Args:
        png_path: Path to PNG image
        brand: Vehicle brand
        model: Vehicle model
        api_key: Optional Anthropic API key

    Returns:
        Extraction result dict
    """
    extractor = ClaudeVisionExtractor(api_key=api_key)
    return extractor.extract_specs(png_path, brand, model)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: python claude_vision_extractor.py <png_path> <brand> <model>")
        print("Example: python claude_vision_extractor.py pdf_images/bmw_x5_page15-15.png BMW X5")
        sys.exit(1)

    png_path = sys.argv[1]
    brand = sys.argv[2]
    model = sys.argv[3]

    print(f"Extracting specs for {brand} {model} from {png_path}...")
    print()

    result = extract_specs_vision(png_path, brand, model)

    if "error" in result:
        print(f"ERROR: {result['error']}")
        sys.exit(1)

    print(json.dumps(result, indent=2, ensure_ascii=False))

    # Print summary
    print(f"\nExtraction Summary:")
    print(f"  Trims: {len(result.get('trims', []))}")
    print(f"  Specs: {len(result.get('specs', []))}")
    print(f"  Time: {result.get('metadata', {}).get('extraction_time', 0):.2f}s")
    print(f"  Tokens: {result.get('metadata', {}).get('input_tokens', 0)} in + {result.get('metadata', {}).get('output_tokens', 0)} out")
