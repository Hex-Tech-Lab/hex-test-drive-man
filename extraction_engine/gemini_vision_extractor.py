"""
Gemini Vision Extractor for Vehicle Specifications

Uses Google's Gemini 2.5 models (flash/pro) to extract structured data
from vehicle specification PDFs.
"""

import os
import base64
import json
import time
from typing import Optional
import google.generativeai as genai


class GeminiVisionExtractor:
    """Extract vehicle specs using Gemini Vision API"""

    def __init__(self, model_name: str = "gemini-2.5-flash", api_key: Optional[str] = None) -> None:
        """
        Initialize Gemini Vision extractor

        Args:
            model_name: Gemini model to use (gemini-2.5-flash or gemini-2.5-pro)
            api_key: Optional API key (defaults to GEMINI_API_KEY env var)
        """
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name)

    def extract_specs(
        self,
        png_path: str,
        brand: str,
        model_name: str,
        expected_trims: Optional[list[str]] = None
    ) -> dict:
        """
        Extract vehicle specifications from PNG image

        Args:
            png_path: Path to PNG image of specification table
            brand: Vehicle brand name
            model_name: Vehicle model name
            expected_trims: Optional list of expected trim names

        Returns:
            {
                "trims": ["trim1", "trim2", ...],
                "specs": [
                    {
                        "category": "ENGINE",
                        "subcategory": "Performance",
                        "label": "Max Power",
                        "values": {"ACTIVE": "122 HP", ...}
                    }
                ],
                "metadata": {
                    "model_used": "gemini-2.5-flash",
                    "extraction_time": 12.5
                }
            }
        """
        start_time = time.time()

        # Validate and load image
        from pathlib import Path
        image_path = Path(png_path)
        if not image_path.exists():
            return {"error": f"Image file not found: {png_path}", "metadata": {"model_used": self.model_name}}

        with open(image_path, "rb") as f:
            image_data = f.read()

        # Build extraction prompt
        prompt = self._build_extraction_prompt(brand, model_name, expected_trims)

        # Call Gemini Vision API
        try:
            response = self.model.generate_content(
                [prompt, {"mime_type": "image/png", "data": image_data}],
                generation_config=genai.GenerationConfig(
                    temperature=0,
                    response_mime_type="application/json"
                )
            )

            # Parse response
            result = self._parse_response(response.text)

            # Add metadata
            result["metadata"] = {
                "model_used": self.model_name,
                "extraction_time": time.time() - start_time
            }

            return result

        except Exception as e:
            return {
                "error": str(e),
                "metadata": {
                    "model_used": self.model_name,
                    "extraction_time": time.time() - start_time
                }
            }

    def _build_extraction_prompt(
        self,
        brand: str,
        model_name: str,
        expected_trims: Optional[list[str]] = None
    ) -> str:
        """Build extraction prompt for Gemini"""

        trim_hint = ""
        if expected_trims:
            trim_hint = f"\n\nExpected trim names: {', '.join(expected_trims)}"

        return f"""
Analyze this vehicle specifications table for {brand} {model_name}.{trim_hint}

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
  ]
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

    def _parse_response(self, response_text: str) -> dict:
        """Parse Gemini's response"""
        try:
            # Gemini should return pure JSON with response_mime_type set
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError as e:
            # Fallback: try to extract JSON from markdown blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
                return json.loads(response_text)
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
                return json.loads(response_text)
            else:
                raise ValueError(f"Failed to parse JSON response: {e}")


def extract_specs_vision(
    png_path: str,
    brand: str,
    model_name: str,
    gemini_model: str = "gemini-2.5-flash",
    expected_trims: Optional[list[str]] = None
) -> dict:
    """
    Convenience function for single extraction

    Args:
        png_path: Path to PNG image
        brand: Vehicle brand
        model_name: Vehicle model
        gemini_model: Gemini model to use (flash/pro)
        expected_trims: Optional list of expected trims

    Returns:
        Extraction result dict
    """
    extractor = GeminiVisionExtractor(model_name=gemini_model)
    return extractor.extract_specs(png_path, brand, model_name, expected_trims)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: python gemini_vision_extractor.py <png_path> <brand> <model> [gemini_model]")
        print()
        print("Example:")
        print("  python gemini_vision_extractor.py pdf_images/bmw_x5_page15-15.png BMW X5 gemini-2.5-flash")
        sys.exit(1)

    png_path = sys.argv[1]
    brand = sys.argv[2]
    model_name = sys.argv[3]
    gemini_model = sys.argv[4] if len(sys.argv) > 4 else "gemini-2.5-flash"

    print(f"Extracting specs for {brand} {model_name} using {gemini_model}...")
    print()

    result = extract_specs_vision(png_path, brand, model_name, gemini_model)

    if "error" in result:
        print(f"Error: {result['error']}")
        sys.exit(1)

    # Pretty print result
    print(json.dumps(result, indent=2, ensure_ascii=False))
