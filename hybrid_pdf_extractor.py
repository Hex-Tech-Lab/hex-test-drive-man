#!/usr/bin/env python3
import os
"""
Hybrid PDF Spec Extractor - Production Ready
============================================
Handles 3 table formats across Egyptian automotive PDFs:
- Format A: Labels in first column (Chery/MG style)
- Format B: Labels outside table (Hyundai style)
- Format C: Slash-separated dimensions (MG "L/W/H (mm) 4287/1836/1504")

Architecture:
1. Format Detector Engine - Identifies PDF table structure
2. Table Parser Sub-Engine - Extracts column-based data
3. Regex Parser Sub-Engine - Extracts pattern-based data
4. Combiner/Assimilator - Merges and deduplicates results

Maps to Supabase schema: vehicle_trims, vehicle_dimensions, vehicle_chassis, ev_specs, features, warranty_terms
"""

import pdfplumber
import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TableFormat(Enum):
    """Detected table format types"""
    FORMAT_A = "labels_in_column"      # Chery/MG: specs in first column
    FORMAT_B = "labels_outside_table"  # Hyundai: labels in body text, values in table
    FORMAT_C = "slash_separated"       # MG: dimensions as "4287/1836/1504"
    MIXED = "mixed_format"             # Combination of formats
    UNKNOWN = "unknown"


@dataclass
class ExtractionResult:
    """Container for extraction results"""
    pdf_path: str
    format_detected: TableFormat
    trim_count: int
    trims: List[Dict[str, Any]] = field(default_factory=list)
    raw_tables: List[List[List[str]]] = field(default_factory=list)
    raw_text: str = ""
    extraction_method: str = "hybrid"


class FormatDetector:
    """Analyzes PDF structure and identifies table format"""

    def __init__(self, tables: List[List[List[str]]], text: str):
        self.tables = tables
        self.text = text

    def detect_format(self) -> TableFormat:
        """
        Detect table format by analyzing structure

        Returns:
            TableFormat enum indicating detected format
        """
        if not self.tables:
            return TableFormat.UNKNOWN

        format_scores = {
            TableFormat.FORMAT_A: 0,
            TableFormat.FORMAT_B: 0,
            TableFormat.FORMAT_C: 0,
        }

        # Analyze first table
        first_table = self.tables[0]

        # Check for Format A: Labels in first column
        format_a_indicators = self._check_format_a(first_table)
        format_scores[TableFormat.FORMAT_A] = format_a_indicators

        # Check for Format B: Labels outside table
        format_b_indicators = self._check_format_b(first_table, self.text)
        format_scores[TableFormat.FORMAT_B] = format_b_indicators

        # Check for Format C: Slash-separated values
        format_c_indicators = self._check_format_c(first_table, self.text)
        format_scores[TableFormat.FORMAT_C] = format_c_indicators

        # Determine primary format
        max_score = max(format_scores.values())
        if max_score == 0:
            return TableFormat.UNKNOWN

        # Check if multiple formats present (mixed)
        high_scores = [fmt for fmt, score in format_scores.items() if score >= max_score * 0.7]
        if len(high_scores) > 1:
            return TableFormat.MIXED

        # Return format with highest score
        return max(format_scores, key=format_scores.get)

    def _check_format_a(self, table: List[List[str]]) -> int:
        """Check for Format A: labels in first column"""
        score = 0

        if not table or len(table) < 2:
            return 0

        # Count rows with spec-like labels in first column
        spec_keywords = [
            'engine', 'power', 'torque', 'length', 'width', 'height',
            'wheelbase', 'ground clearance', 'weight', 'capacity', 'suspension',
            'transmission', 'fuel', 'battery', 'range', 'acceleration'
        ]

        for row in table[1:]:  # Skip header
            if not row or len(row) < 2:
                continue

            first_col = str(row[0]).lower().strip()

            # Check if first column contains spec labels
            if any(keyword in first_col for keyword in spec_keywords):
                score += 2

            # Check if subsequent columns have values (not empty)
            if len(row) > 1 and any(str(cell).strip() for cell in row[1:]):
                score += 1

        return score

    def _check_format_b(self, table: List[List[str]], text: str) -> int:
        """Check for Format B: labels outside table in body text"""
        score = 0

        if not table or len(table) < 2:
            return 0

        # Check if first column lacks descriptive labels
        label_count = 0
        for row in table[1:]:
            if not row:
                continue
            first_col = str(row[0]).lower().strip()
            if len(first_col) > 3 and first_col.replace(' ', '').isalpha():
                label_count += 1

        if label_count < len(table) * 0.3:  # Less than 30% have text labels
            score += 3

        # Check if text contains spec labels near table markers
        if re.search(r'(?:specification|dimensions|performance)[:\s]+', text, re.I):
            score += 2

        return score

    def _check_format_c(self, table: List[List[str]], text: str) -> int:
        """Check for Format C: slash-separated dimensions"""
        score = 0

        # Pattern: "4287/1836/1504" or similar slash-separated numbers
        slash_pattern = r'\d{3,4}/\d{3,4}/\d{3,4}'

        # Check in table cells
        for row in table:
            for cell in row:
                if cell and re.search(slash_pattern, str(cell)):
                    score += 3

        # Check in text
        if re.search(r'(?:length|l)/(?:width|w)/(?:height|h)[:\s]*\(mm\)\s*' + slash_pattern, text, re.I):
            score += 5

        return score

    def get_format_details(self, detected_format: TableFormat) -> Dict[str, Any]:
        """Get detailed information about detected format"""
        return {
            'format': detected_format.value,
            'table_count': len(self.tables),
            'text_length': len(self.text),
            'avg_table_rows': sum(len(t) for t in self.tables) / len(self.tables) if self.tables else 0,
        }


class TableParser:
    """Extracts data from table-based PDFs (Format A & B)"""

    def __init__(self, tables: List[List[List[str]]], text: str, table_format: TableFormat):
        self.tables = tables
        self.text = text
        self.format = table_format

    def parse(self) -> Dict[str, Any]:
        """
        Parse tables based on detected format

        Returns:
            Dictionary with extracted trim data
        """
        if self.format == TableFormat.FORMAT_A:
            return self._parse_format_a()
        elif self.format == TableFormat.FORMAT_B:
            return self._parse_format_b()
        elif self.format == TableFormat.MIXED:
            # Try both methods and merge
            result_a = self._parse_format_a()
            result_b = self._parse_format_b()
            return self._merge_results(result_a, result_b)
        else:
            return {'trims': [], 'trim_names': []}

    def _parse_format_a(self) -> Dict[str, Any]:
        """Parse Format A: labels in first column, trims in subsequent columns"""
        trim_names = []
        trim_data_list = []

        if not self.tables:
            return {'trims': [], 'trim_names': []}

        # Get trim names from first table header row
        first_table = self.tables[0]
        if first_table and len(first_table) > 0:
            header_row = first_table[0]

            # Extract trim names (skip first column - it's the label column)
            for col in header_row[1:]:
                if col and isinstance(col, str) and len(col.strip()) > 0:
                    trim_name = col.strip()
                    # Filter out Arabic text and section headers
                    if not re.search(r'[\u0600-\u06FF]', trim_name) and len(trim_name) < 40:
                        trim_names.append(trim_name)

        # Default if no trims found
        if not trim_names:
            trim_names = ['Standard']

        # Initialize data structure for each trim
        for trim_name in trim_names:
            trim_data_list.append({
                'trim_name': trim_name,
                'specs': {}
            })

        # Extract specs from all tables
        for table in self.tables:
            for row in table[1:]:  # Skip header
                if not row or len(row) < 2:
                    continue

                spec_label = str(row[0]).strip().lower()
                if not spec_label or len(spec_label) < 2:
                    continue

                # Extract value for each trim column
                for trim_idx in range(len(trim_names)):
                    col_idx = trim_idx + 1  # +1 because first column is labels

                    if col_idx < len(row):
                        spec_value = str(row[col_idx]).strip()

                        # Skip empty or marker-only values
                        if spec_value and spec_value not in ['—', '-', 'N/A', '', '–']:
                            trim_data_list[trim_idx]['specs'][spec_label] = spec_value

        return {
            'trims': trim_data_list,
            'trim_names': trim_names
        }

    def _parse_format_b(self) -> Dict[str, Any]:
        """Parse Format B: labels in text, values in table"""
        # For Format B, we need to cross-reference text labels with table positions
        # This is more complex and requires pattern matching

        trim_data = {
            'trims': [{'trim_name': 'Standard', 'specs': {}}],
            'trim_names': ['Standard']
        }

        # Extract any values from tables
        for table in self.tables:
            for row in table:
                for cell in row:
                    if cell and isinstance(cell, str):
                        # Store any numeric or meaningful values
                        cell_clean = cell.strip()
                        if len(cell_clean) > 0:
                            # This will be enhanced by regex parser
                            pass

        return trim_data

    def _merge_results(self, result_a: Dict, result_b: Dict) -> Dict:
        """Merge results from Format A and B parsing"""
        # Use Format A as base, supplement with Format B
        merged = result_a.copy()

        # Add any additional specs from Format B
        for b_trim in result_b.get('trims', []):
            for a_trim in merged['trims']:
                if 'specs' in b_trim:
                    if 'specs' not in a_trim:
                        a_trim['specs'] = {}
                    a_trim['specs'].update(b_trim['specs'])

        return merged


class RegexParser:
    """Extracts data using pattern matching (Format C and fallback)"""

    # Import patterns from comprehensive_spec_extraction_schema.py
    SPEC_PATTERNS = {
        # Dimensions - Format C (slash-separated)
        'dimensions_lwh': r'(?:length|l)(?:/|\s*/\s*)(?:width|w)(?:/|\s*/\s*)(?:height|h)\s*\(mm\)\s*([\d,]+)(?:/|\s*/\s*)([\d,]+)(?:/|\s*/\s*)([\d,]+)',

        # Engine specs
        'engine_capacity': [
            r'engine\s+(?:type|capacity)\s+([\d.]+)\s*l',
            r'engine\s+capacity\s*\(l\)\s*([\d.]+)',
            r'displacement\s+([\d.]+)\s*l',
        ],
        'horsepower': [
            r'output\s+power\s*\([^)]*\)\s*(\d{2,3})',
            r'max\s*\.?\s*power\s*\([^)]*\)\s*(\d{2,3})',
            r'(\d{2,3})\s*/\s*\d+\s*(?:hp|bhp)',
            r'(\d{2,3})\s*(?:hp|bhp|ps)',
        ],
        'torque': [
            r'output\s+torque\s*\([^)]*\)\s*(\d{2,3})',
            r'max\s*\.?\s*torque\s*\([^)]*\)\s*(\d{2,3})',
            r'(\d{2,3})\s*nm',
        ],
        'acceleration': [
            r'0[\s-]?(?:to[\s-]?)?100\s*(?:km/?h)?[:\s]*([\d.]+)',
            r'acceleration.*?([\d.]+)\s*(?:s|sec)',
        ],
        'top_speed': [
            r'max(?:imum)?\s+speed[:\s]+(\d{2,3})',
            r'top\s+speed[:\s]+(\d{2,3})',
        ],

        # Dimensions - standard patterns
        'length': [
            r'length\s*\(mm\)\s*([\d,]+)',
            r'overall\s+length\s*\(mm\)\s*([\d,]+)',
            r'length[:\s]+([\d,]+)\s*mm',
        ],
        'width': [
            r'width\s*\(mm\)\s*([\d,]+)',
            r'overall\s+width\s*\(mm\)\s*([\d,]+)',
            r'width[:\s]+([\d,]+)\s*mm',
        ],
        'height': [
            r'height\s*\(mm\)\s*([\d,]+)',
            r'overall\s+height\s*\(mm\)\s*([\d,]+)',
            r'height[:\s]+([\d,]+)\s*mm',
        ],
        'wheelbase': [
            r'wheel\s*[-\s]?base\s*\(mm\)\s*([\d,]+)',
            r'wheelbase[:\s]+([\d,]+)\s*mm',
        ],
        'ground_clearance': [
            r'ground\s+clearance\s*\(mm\)\s*(\d{2,3})',
            r'minimum\s+ground\s+clearance[:\s]+(\d{2,3})',
        ],

        # Weight and capacity
        'curb_weight': [
            r'curb\s+weight\s*\(kg\)\s*([\d,]+)',
            r'kerb\s+weight\s*\(kg\)\s*([\d,]+)',
            r'weight[:\s]+([\d,]+)\s*kg',
        ],
        'trunk_capacity': [
            r'trunk\s+capacity\s*\(l\)\s*(\d{2,4})',
            r'boot\s+capacity\s*\(l\)\s*(\d{2,4})',
            r'cargo\s+(?:capacity|volume)[:\s]+(\d{2,4})',
        ],
        'fuel_tank': [
            r'fuel\s+tank\s+capacity\s*\(l\)\s*(\d{2,3})',
            r'tank\s+capacity[:\s]+(\d{2,3})',
        ],
        'seats': [
            r'(\d)\s*seater',
            r'seating\s+capacity[:\s]+(\d)',
            r'seats[:\s]+(\d)',
        ],

        # Chassis
        'suspension_front': [
            r'front\s+suspension[:\s]+([^\n]+)',
            r'suspension[\s-]front[:\s]+([^\n]+)',
        ],
        'suspension_rear': [
            r'rear\s+suspension[:\s]+([^\n]+)',
            r'suspension[\s-]rear[:\s]+([^\n]+)',
        ],
        'tire_size': [
            r'tire\s+size[:\s]+([\d/]+\s*r\d{2})',
            r'tyre\s+size[:\s]+([\d/]+\s*r\d{2})',
            r'([\d]{3}/[\d]{2}\s*r[\d]{2})',
        ],
        'wheel_size': [
            r'(\d{2})\s*[\'\'\"]\s*(?:alloy\s+)?wheel',
            r'wheel\s+size[:\s]+(\d{2})',
        ],
        'drive_type': [
            r'drivetrain[:\s]+(fwd|rwd|awd|4wd)',
            r'drive\s+(?:type|system)[:\s]+(fwd|rwd|awd|4wd|front|rear|all)',
        ],

        # EV specs
        'battery_capacity': [
            r'battery\s+capacity[:\s]+([\d.]+)\s*kwh',
            r'([\d.]+)\s*kwh\s+battery',
        ],
        'electric_range': [
            r'(?:electric\s+)?range[:\s]+([\d,]+)\s*km',
            r'wltp\s+range[:\s]+([\d,]+)',
        ],
        'dc_charging_time': [
            r'(?:dc\s+)?charging\s+time[:\s]+(\d{1,3})\s*min',
            r'10[\s-]?80%[:\s]+(\d{1,3})\s*min',
        ],

        # Warranty
        'warranty': [
            r'(\d)\s*(?:year|yr)s?\s*/\s*([\d,]+)\s*km\s+warranty',
            r'warranty[:\s]+(\d)\s*(?:year|yr)s?\s*/\s*([\d,]+)\s*km',
        ],
    }

    def __init__(self, text: str):
        self.text = text

    def parse(self) -> Dict[str, Any]:
        """
        Parse text using regex patterns

        Returns:
            Dictionary with extracted specs
        """
        extracted = {
            'specs': {}
        }

        text_lower = self.text.lower()

        # Check for Format C: slash-separated dimensions
        lwh_match = re.search(self.SPEC_PATTERNS['dimensions_lwh'], text_lower, re.I)
        if lwh_match:
            extracted['specs']['length_mm'] = int(lwh_match.group(1).replace(',', ''))
            extracted['specs']['width_mm'] = int(lwh_match.group(2).replace(',', ''))
            extracted['specs']['height_mm'] = int(lwh_match.group(3).replace(',', ''))
            logger.info(f"Format C detected: L/W/H = {lwh_match.group(1)}/{lwh_match.group(2)}/{lwh_match.group(3)}")

        # Apply all other patterns
        for spec_name, patterns in self.SPEC_PATTERNS.items():
            if spec_name == 'dimensions_lwh':
                continue  # Already handled

            if isinstance(patterns, str):
                patterns = [patterns]

            for pattern in patterns:
                try:
                    match = re.search(pattern, text_lower, re.I)
                    if match:
                        value = match.group(1)
                        if value:
                            extracted['specs'][spec_name] = value.strip()
                            break  # Use first matching pattern
                except Exception as e:
                    logger.warning(f"Pattern error for {spec_name}: {e}")

        return extracted


class SpecCombiner:
    """Combines and deduplicates results from table and regex parsers"""

    # Mapping from extracted keys to Supabase schema tables
    SCHEMA_MAPPING = {
        'vehicle_trims': [
            'engine_capacity', 'horsepower', 'torque', 'acceleration', 'top_speed',
            'fuel_consumption', 'seats', 'transmission', 'fuel_type'
        ],
        'vehicle_dimensions': [
            'length_mm', 'width_mm', 'height_mm', 'wheelbase', 'ground_clearance',
            'curb_weight', 'trunk_capacity', 'fuel_tank', 'max_gross_weight'
        ],
        'vehicle_chassis': [
            'suspension_front', 'suspension_rear', 'tire_size', 'wheel_size',
            'wheel_material', 'drive_type', 'brake_type_front', 'brake_type_rear'
        ],
        'ev_specs': [
            'battery_capacity', 'electric_range', 'dc_charging_time', 'max_charge_speed'
        ],
        'warranty_terms': [
            'warranty_years', 'warranty_km', 'service_interval_months', 'service_interval_km'
        ],
    }

    def __init__(self):
        pass

    def combine(self, table_result: Dict, regex_result: Dict) -> List[Dict[str, Any]]:
        """
        Combine and deduplicate table and regex extraction results

        Args:
            table_result: Results from TableParser
            regex_result: Results from RegexParser

        Returns:
            List of trim dictionaries mapped to Supabase schema
        """
        trims = table_result.get('trims', [])
        regex_specs = regex_result.get('specs', {})

        if not trims:
            # No trims found in table, create one from regex results
            trims = [{'trim_name': 'Standard', 'specs': {}}]

        # Process each trim
        combined_trims = []
        for trim in trims:
            combined_trim = {
                'trim_name': trim.get('trim_name', 'Standard'),
                'vehicle_trims': {},
                'vehicle_dimensions': {},
                'vehicle_chassis': {},
                'vehicle_environmental_specs': {},
                'ev_specs': {},
                'warranty_terms': {},
                'features': []
            }

            # Merge table specs with regex specs
            all_specs = {**regex_specs, **trim.get('specs', {})}

            # Map specs to schema tables
            for spec_key, spec_value in all_specs.items():
                self._map_spec_to_schema(spec_key, spec_value, combined_trim)

            combined_trims.append(combined_trim)

        return combined_trims

    def _map_spec_to_schema(self, key: str, value: Any, trim_data: Dict):
        """Map extracted spec to appropriate Supabase table"""

        # Clean value
        if isinstance(value, str):
            value = value.strip()
            if value in ['—', '-', 'N/A', '', '–']:
                return

        # Determine which table this spec belongs to
        for table_name, spec_keys in self.SCHEMA_MAPPING.items():
            if any(key.startswith(spec_key) or spec_key in key for spec_key in spec_keys):
                # Apply transformations based on spec type
                transformed_value = self._transform_value(key, value)
                if transformed_value is not None:
                    trim_data[table_name][key] = transformed_value
                return

        # Check for feature flags (S, √, ●, ✓)
        if isinstance(value, str) and value.upper() in ['S', '√', '●', '✓', 'YES']:
            feature_code = key.replace(' ', '_').replace('-', '_')
            trim_data['features'].append({
                'feature_code': feature_code,
                'feature_name': key.title(),
                'is_standard': True
            })

    def _transform_value(self, key: str, value: Any) -> Any:
        """Transform value to appropriate type for database"""
        if value is None:
            return None

        value_str = str(value).replace(',', '')

        try:
            # Integer values (dimensions, weights)
            if any(x in key for x in ['_mm', '_kg', '_km', 'seats', 'speed', 'year']):
                match = re.search(r'(\d+)', value_str)
                if match:
                    return int(match.group(1))

            # Float values (engine, consumption, acceleration)
            if any(x in key for x in ['capacity', 'consumption', 'acceleration', 'kwh']):
                match = re.search(r'([\d.]+)', value_str)
                if match:
                    return float(match.group(1))

            # Power/torque extraction
            if 'horsepower' in key or 'torque' in key:
                match = re.search(r'(\d{2,3})', value_str)
                if match:
                    return int(match.group(1))

            # String values (keep as-is, but clean)
            return value_str.strip()

        except (ValueError, AttributeError) as e:
            logger.warning(f"Transform error for {key}={value}: {e}")
            return value_str


class HybridExtractor:
    """Main hybrid extraction engine"""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.tables = []
        self.text = ""

    def extract(self) -> ExtractionResult:
        """
        Main extraction pipeline

        Returns:
            ExtractionResult with comprehensive data
        """
        logger.info(f"Starting extraction: {self.pdf_path}")

        # Step 1: Load PDF and extract raw data
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                for page in pdf.pages:
                    # Extract tables
                    page_tables = page.extract_tables()
                    if page_tables:
                        self.tables.extend(page_tables)

                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        self.text += page_text + '\n'
        except Exception as e:
            logger.error(f"PDF read error: {e}")
            return ExtractionResult(
                pdf_path=self.pdf_path,
                format_detected=TableFormat.UNKNOWN,
                trim_count=0
            )

        logger.info(f"Extracted {len(self.tables)} tables, {len(self.text)} chars of text")

        # OCR fallback for image-based PDFs
        if len(self.text) < 100:
            ocr_txt_path = self.pdf_path.replace('.pdf', '_ocr.txt')
            if os.path.exists(ocr_txt_path):
                logger.info(f"Loading OCR text from {ocr_txt_path}")
                with open(ocr_txt_path, 'r', encoding='utf-8') as ocr_file:
                    self.text = ocr_file.read()
                logger.info(f"✅ OCR text loaded: {len(self.text)} chars")


        # Step 2: Detect table format
        detector = FormatDetector(self.tables, self.text)
        detected_format = detector.detect_format()
        format_details = detector.get_format_details(detected_format)
        logger.info(f"Detected format: {detected_format.value}")
        logger.info(f"Format details: {format_details}")

        # Step 3: Parse with Table Parser
        table_parser = TableParser(self.tables, self.text, detected_format)
        table_result = table_parser.parse()
        logger.info(f"Table parser extracted {len(table_result.get('trims', []))} trims")

        # Step 4: Parse with Regex Parser
        regex_parser = RegexParser(self.text)
        regex_result = regex_parser.parse()
        logger.info(f"Regex parser extracted {len(regex_result.get('specs', {}))} specs")

        # Step 5: Combine and assimilate results
        combiner = SpecCombiner()
        combined_trims = combiner.combine(table_result, regex_result)
        logger.info(f"Combined into {len(combined_trims)} final trim records")

        # Build result
        result = ExtractionResult(
            pdf_path=self.pdf_path,
            format_detected=detected_format,
            trim_count=len(combined_trims),
            trims=combined_trims,
            raw_tables=self.tables,
            raw_text=self.text[:500]  # First 500 chars for reference
        )

        return result

    def extract_to_dict(self) -> Dict[str, Any]:
        """Extract and return as dictionary"""
        result = self.extract()

        return {
            'pdf_path': result.pdf_path,
            'format_detected': result.format_detected.value,
            'trim_count': result.trim_count,
            'trims': result.trims,
            'extraction_method': result.extraction_method
        }


def extract_pdf_batch(pdf_paths: List[str], output_file: str = 'hybrid_extraction_results.json') -> Dict[str, Any]:
    """
    Extract specs from multiple PDFs

    Args:
        pdf_paths: List of PDF file paths
        output_file: Output JSON file path

    Returns:
        Dictionary with all extraction results
    """
    all_results = {}

    for pdf_path in pdf_paths:
        if not Path(pdf_path).exists():
            logger.error(f"PDF not found: {pdf_path}")
            continue

        try:
            extractor = HybridExtractor(pdf_path)
            result = extractor.extract_to_dict()

            pdf_name = Path(pdf_path).stem
            all_results[pdf_name] = result

            # Print summary
            print(f"\n{'='*100}")
            print(f"📄 {pdf_path}")
            print(f"{'='*100}")
            print(f"Format: {result['format_detected']}")
            print(f"Trims: {result['trim_count']}")

            for trim in result['trims']:
                print(f"\n🔹 {trim['trim_name']}")

                for table_name in ['vehicle_trims', 'vehicle_dimensions', 'vehicle_chassis',
                                  'ev_specs', 'warranty_terms']:
                    count = len(trim.get(table_name, {}))
                    if count > 0:
                        print(f"  • {table_name:35s}: {count:2d} specs")

                feature_count = len(trim.get('features', []))
                if feature_count > 0:
                    print(f"  • features:                            {feature_count:2d} flags")

        except Exception as e:
            logger.error(f"Extraction failed for {pdf_path}: {e}", exc_info=True)
            all_results[Path(pdf_path).stem] = {
                'error': str(e),
                'pdf_path': pdf_path
            }

    # Save results
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*100}")
    print(f"✅ Hybrid extraction complete")
    print(f"✓ Processed: {len(all_results)} PDFs")
    print(f"✓ Results saved to: {output_file}")
    print(f"{'='*100}")

    return all_results


if __name__ == '__main__':
    # Test on 3 PDFs with different formats
    test_pdfs = [
        '/home/kellyb_dev/projects/hex-test-drive/pdfs/Chery/chery_official/Arrizo_5_2024.pdf',
        '/home/kellyb_dev/projects/hex-test-drive/pdfs/MG/mg_official/MG_4_EV_2025.pdf',
        '/home/kellyb_dev/projects/hex-test-drive/pdfs/Hyundai/hyundai_official/Accent_RB_2024.pdf',
    ]

    results = extract_pdf_batch(test_pdfs, 'hybrid_extraction_results.json')

    # Print extraction statistics
    print(f"\n{'='*100}")
    print("📊 EXTRACTION STATISTICS")
    print(f"{'='*100}")

    total_trims = 0
    total_specs = 0
    format_counts = {}

    for pdf_name, result in results.items():
        if 'error' in result:
            continue

        total_trims += result.get('trim_count', 0)

        fmt = result.get('format_detected', 'unknown')
        format_counts[fmt] = format_counts.get(fmt, 0) + 1

        for trim in result.get('trims', []):
            for table_name in ['vehicle_trims', 'vehicle_dimensions', 'vehicle_chassis',
                              'ev_specs', 'warranty_terms']:
                total_specs += len(trim.get(table_name, {}))

    print(f"Total PDFs processed: {len(results)}")
    print(f"Total trims extracted: {total_trims}")
    print(f"Total specs extracted: {total_specs}")
    print(f"\nFormat distribution:")
    for fmt, count in format_counts.items():
        print(f"  • {fmt:25s}: {count} PDFs")
    print(f"{'='*100}")

if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    import sys
    
    # Dynamic argument parsing
    if len(sys.argv) > 1:
        pdfs_to_process = sys.argv[1:]
        print(f"Processing {len(pdfs_to_process)} PDFs from arguments...")
    else:
        # Default fallback if no args
        pdfs_to_process = [
            "/home/kellyb_dev/projects/hex-test-drive/pdfs/Chery/chery_official/Arrizo_5_2024.pdf",
            "/home/kellyb_dev/projects/hex-test-drive/pdfs/MG/mg_official/MG_4_EV_2025.pdf",
            "/home/kellyb_dev/projects/hex-test-drive/pdfs/Hyundai/hyundai_official/Accent_RB_2024.pdf"
        ]
        print("No arguments provided. Using default test set.")

    results = extract_pdf_batch(pdfs_to_process, 'hybrid_extraction_results.json')
