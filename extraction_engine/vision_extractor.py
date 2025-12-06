#!/usr/bin/env python3
import os, sys, json, time
from google import genai
from google.genai import types

PROMPT = """Extract this automotive specification table into structured JSON.
REQUIREMENTS:
- Capture Section name, Feature name, and values for each Trim
- Handle rotated text and invisible grids
- Handle bilingual layouts (prefer English keys)
- Extract EXACT values (no rounding). Use null for empty cells.
- Use booleans where the source uses symbols (●, ○, O, -) when possible.

OUTPUT FORMAT (Strict JSON):
{"trim_names": ["Trim1"], "sections": [{"section_name": "Performance", "features": [{"feature_name": "Engine", "values": {"Trim1": "1.6L"}}]}]}"""

SYMBOL_MAP = {
    "●": True,
    "○": True,
    "O": True,
    "o": True,
    "S": True,
    "-": False,
    "—": False,
    "N/A": None,
    "": None,
}

def normalize_values(values: dict):
    out = {}
    for k, v in values.items():
        if v is None:
            out[k] = None
            continue
        if isinstance(v, bool) or isinstance(v, (int, float)):
            out[k] = v
            continue
        s = str(v).strip()
        if s in SYMBOL_MAP:
            out[k] = SYMBOL_MAP[s]
        else:
            out[k] = s
    return out

def clean_response_text(resp):
    # Some models wrap JSON in markdown fences
    text = resp.text or ""
    fence = "`" * 3
    return text.replace(fence + "json", "").replace(fence, "").strip()

def extract(image_path, model_name, output_path):
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        with open(output_path, "w") as f:
            json.dump({"error": "API key missing"}, f)
        return

    client = genai.Client(api_key=api_key)

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/png")
    config = types.GenerateContentConfig(response_mime_type="application/json")

    start = time.time()
    try:
        resp = client.models.generate_content(
            model=model_name,
            contents=[image_part, PROMPT],
            config=config,
        )
        elapsed = time.time() - start

        clean = clean_response_text(resp)
        data = json.loads(clean)

        # Normalize symbol values
        for section in data.get("sections", []):
            for feat in section.get("features", []):
                if "values" in feat and isinstance(feat["values"], dict):
                    feat["values"] = normalize_values(feat["values"])

        data["_meta"] = {
            "model": model_name,
            "elapsed_sec": round(elapsed, 2),
            "image_path": image_path,
        }

        with open(output_path, "w") as f:
            json.dump(data, f, indent=2)

        print(f"✓ {model_name} -> {output_path} ({elapsed:.2f}s)")
    except Exception as e:
        with open(output_path, "w") as f:
            json.dump({"error": str(e)}, f)
        print(f"✗ {model_name} FAILED: {e}")

if __name__ == "__main__":
    extract(sys.argv[1], sys.argv[2], sys.argv[3])
