# CodeRabbit AI Prompts for PR #7
**Total Comments:** 25
**Generated:** 2025-12-08T22:02:42.002213

## Comment 1: extraction_engine/auto_crop_validator.py:106
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:50Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟠 Major_

**Placeholder implementation returns meaningless bbox.**

`get_manual_crop_bbox` returns `(0, 0, crop_w, crop_h)` which doesn't represent the actual position of the manual crop in the full page. This makes the IoU calculation at line 279 meaningless since it compares against a fabricated bbox.

The function signature accepts `full_page_img` but never uses it. Either implement template matching to locate the crop, or require bbox metadata to be stored with manual crops.



```diff
 def get_manual_crop_bbox(manual_crop_img: Image.Image,
-                         full_page_img: Image.Image) -> Tuple[int, int, int, int]:
+                         full_page_img: Image.Image) -> Tuple[int, int, int, int] | None:
     """
     Determine bounding box of manual crop within full page
-
-    Strategy: Manual crop is already extracted, so we need to find where
-    it came from in the full page. We'll use dimensions and position matching.
-
-    For now, we'll use a simplified approach: extract location from manual crop
-    by comparing dimensions.
-
-    Args:
-        manual_crop_img: The manually cropped table image
-        full_page_img: The full page source image
-
-    Returns:
-        (x, y, w, h) bounding box in full page coordinates
+    
+    Returns None if bbox cannot be determined (caller should handle gracefully).
     """
-    # For this implementation, we'll need to match the crop to full page
-    # This is complex - for now, return the crop dimensions
-    # In production, we'd need to do template matching or have metadata
-
-    crop_w, crop_h = manual_crop_img.size
-
-    # Since we don't have the original coordinates, we'll estimate
-    # based on table position in the full page
-    # This is a limitation - ideally manual crops would include bbox metadata
-
-    return (0, 0, crop_w, crop_h)  # Placeholder
+    # TODO: Implement template matching using cv2.matchTemplate or require bbox metadata
+    return None  # Explicitly indicate this is not implemented
```


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

79-79: Unused function argument: `full_page_img`

(ARG001)

</details>

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 2: extraction_engine/auto_crop_validator.py:145
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:50Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**`detect_table_regions` is a no-op — just returns seed coordinates.**

The function creates `crop_region` but never uses it for refinement. The comment mentions future improvements (Hough transform, color detection), but currently this provides no value over using `DETECTION_SEED_COORDS` directly.

Consider either:
- Implementing basic refinement (e.g., trim whitespace borders)
- Removing the function and using seeds directly
- Adding a TODO/FIXME to track this limitation



```diff
-        # Simple refinement: Find content boundaries
-        # Extract region around seed
-        crop_region = img_array[y:y+h, x:x+w]
-
-        # Find actual content boundaries by detecting non-white pixels
-        # (This is a simplified approach)
+        # TODO: Implement actual refinement using:
+        # 1. Horizontal line detection (OpenCV Hough transform)
+        # 2. Color region detection for section headers
+        # 3. Text density analysis
+        # Currently returns seed coordinates unchanged
```

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

138-138: Local variable `crop_region` is assigned to but never used

Remove assignment to unused variable `crop_region`

(F841)

</details>

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 3: extraction_engine/auto_crop_validator.py:188
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:50Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Use specific exception handling instead of bare `except`.**



```diff
     try:
         font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
-    except:
+    except (OSError, IOError):
         font = ImageFont.load_default()
```

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    except (OSError, IOError):
        font = ImageFont.load_default()
```

</details>

<!-- suggestion_end -->

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

187-187: Do not use bare `except`

(E722)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/auto_crop_validator.py around lines 185 to 188, the code
uses a bare except when loading a truetype font; replace it with explicit
exception handling (catch OSError and IOError as e) to avoid swallowing
unrelated errors, and optionally log or propagate the exception before falling
back to ImageFont.load_default().
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 4: extraction_engine/auto_crop_validator.py:279
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:50Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟠 Major_

**IoU comparison uses fabricated manual_bbox — results are unreliable.**

The manual bbox is constructed as `(auto_x, auto_y, manual_w, manual_h)` — using the auto-detected x,y coordinates. This means the IoU will only measure width/height differences, not actual positional alignment. The validation report will show misleadingly high IoU scores even if crops are misaligned.

Either:
1. Store ground-truth bbox metadata with manual crops
2. Implement template matching in `get_manual_crop_bbox`
3. Clearly document this limitation in the output report

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/auto_crop_validator.py around lines 273–279, the code
fabricates a manual bbox using the auto-detected x,y which makes IoU
meaningless; replace that fabrication by obtaining an actual manual bbox
(preferred) or computing one: update the logic to call/get manual_bbox from
stored manual-crop metadata (e.g., crop metadata or a saved bbox field) and use
that for calculate_iou; if metadata is not available implement
get_manual_crop_bbox to compute alignment (e.g., template matching / normalized
cross-correlation or feature-based matching between the manual crop image and
the source to derive (x,y,w,h)), and add a clear fallback: if no reliable manual
bbox can be produced, set IoU to None and append a clear note in the validation
report that positional comparison was skipped due to missing ground-truth bbox.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 5: extraction_engine/auto_crop_validator.py:359
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:50Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Unused variables flagged by static analysis.**

Minor cleanup: rename unused loop variable and remove unused assignment.



```diff
-    for table_name, path in manual_crops.items():
+    for _table_name, path in manual_crops.items():
         if not Path(path).exists():
             print(f"Error: Manual crop not found: {path}")
             return 1

     # Run validation
-    report = validate_crops(full_page, manual_crops, output_dir="validation")
+    validate_crops(full_page, manual_crops, output_dir="validation")
```

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

353-353: Loop control variable `table_name` not used within loop body

Rename unused `table_name` to `_table_name`

(B007)

---

359-359: Local variable `report` is assigned to but never used

Remove assignment to unused variable `report`

(F841)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/auto_crop_validator.py around lines 353 to 359, the
for-loop and the validate_crops assignment create unused variables; change the
loop to use an underscore for the unused table name (for _, path in
manual_crops.items():) and remove the unused report assignment by calling
validate_crops(full_page, manual_crops, output_dir="validation") without
assigning its return value (or assign to _ if you must), so there are no unused
variables left.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 6: extraction_engine/bmw_x5_table_replicas.py:312
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:50Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Temp file not cleaned up on exception paths.**

If `subprocess.run` raises an exception other than `CalledProcessError` or `FileNotFoundError`, or if WeasyPrint raises an exception other than `ImportError`, the temp file `html_path` won't be deleted.



```diff
 def html_to_png(html_content: str, output_path: str, width: int = 600) -> bool:
     # Save HTML to temp file
     with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
         f.write(html_content)
         html_path = f.name

     try:
         # Try wkhtmltoimage first
         subprocess.run([
             'wkhtmltoimage',
             '--quiet',
             '--width', str(width),
             '--quality', '100',
             html_path,
             output_path
         ], check=True, capture_output=True)
-
-        Path(html_path).unlink()  # Clean up temp file
         return True

     except (subprocess.CalledProcessError, FileNotFoundError):
         # Fallback: try weasyprint
         try:
             from weasyprint import HTML
             HTML(string=html_content).write_png(output_path)
-            Path(html_path).unlink()
             return True
         except ImportError:
             print("⚠️  Neither wkhtmltoimage nor weasyprint available")
             print("    Install with: sudo apt-fast install wkhtmltopdf")
             print("    Or: pip install weasyprint")
-            Path(html_path).unlink()
             return False
+    finally:
+        Path(html_path).unlink(missing_ok=True)  # Clean up temp file in all cases
```

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

288-288: `subprocess` call: check for execution of untrusted input

(S603)

---

288-295: Starting a process with a partial executable path

(S607)

---

298-298: Consider moving this statement to an `else` block

(TRY300)

---

306-306: Consider moving this statement to an `else` block

(TRY300)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
extraction_engine/bmw_x5_table_replicas.py around lines 281 to 312, the
temporary HTML file is only deleted in some exception branches so it can leak if
an unexpected exception occurs; ensure the temp file is always removed by moving
Path(html_path).unlink() into a finally block (or use a try/finally around the
conversion attempts) that calls unlink(..., missing_ok=True) or checks exists()
before unlinking, and keep existing return/exception behavior (return True on
success, return False on handled fallbacks, re-raise or propagate other
exceptions) so cleanup always runs regardless of which exception is raised.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 7: extraction_engine/bmw_x5_table_replicas.py:354
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Use specific exception handling instead of bare `except`.**



```diff
     try:
         title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
-    except:
+    except (OSError, IOError):
         title_font = ImageFont.load_default()
```

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except (OSError, IOError):
        title_font = ImageFont.load_default()
```

</details>

<!-- suggestion_end -->

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

353-353: Do not use bare `except`

(E722)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/bmw_x5_table_replicas.py around lines 351 to 354, the code
uses a bare except when loading a TrueType font; replace the bare except with
specific exception types (e.g., OSError or IOError) to only catch font-file
access/format errors, and keep the fallback to ImageFont.load_default().
Optionally, add a brief debug log or comment inside the except block noting the
failure and the font path, but do not catch broad Exception or use an empty
except.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 8: extraction_engine/bmw_x5_table_replicas.py:389
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Missing input file validation before processing.**

Unlike `auto_crop_validator.py` which validates file existence, this script will crash with an unclear error if `pdf_image` or `extraction_json` don't exist. Add existence checks for user-friendly error messages.



```diff
     # Paths
     pdf_image = "pdf_images/bmw_x5_page15-15.png"
     extraction_json = "extraction_engine/results/bmw_x5_gemini_flash.json"
     validation_dir = Path("validation")
     temp_dir = Path("validation/temp")

+    # Validate input files exist
+    if not Path(pdf_image).exists():
+        print(f"❌ Error: PDF image not found: {pdf_image}")
+        return
+    if not Path(extraction_json).exists():
+        print(f"❌ Error: Extraction JSON not found: {extraction_json}")
+        return
+
     # Create directories
     validation_dir.mkdir(exist_ok=True)
     temp_dir.mkdir(exist_ok=True)
```

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/bmw_x5_table_replicas.py around lines 374 to 389, the
script currently assumes pdf_image and extraction_json exist and will crash with
an unclear error if they are missing; add explicit existence checks for both
paths before proceeding, converting pdf_image and extraction_json to Path
objects, and if either is missing raise or log a clear error message and exit
(e.g., print error and sys.exit(1) or use logger) so the user knows which file
is missing; only create validation and temp directories after validating input
files to avoid creating directories on bad inputs.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 9: extraction_engine/gemini_vision_extractor.py:33
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Consider adding type annotations for modern Python style.**

Static analysis flagged deprecated `Dict`/`List` imports (use built-in `dict`/`list`) and missing return type annotation for `__init__`.



```diff
-from typing import Dict, List, Optional
+from typing import Optional


 class GeminiVisionExtractor:
     """Extract vehicle specs using Gemini Vision API"""

-    def __init__(self, model_name: str = "gemini-2.5-flash", api_key: Optional[str] = None):
+    def __init__(self, model_name: str = "gemini-2.5-flash", api_key: Optional[str] = None) -> None:
```

And update method signatures to use `dict` and `list` instead of `Dict` and `List`.


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

19-19: Missing return type annotation for special method `__init__`

Add return type annotation: `None`

(ANN204)

---

30-30: Avoid specifying long messages outside the exception class

(TRY003)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/gemini_vision_extractor.py around lines 19 to 33, add
modern type annotations by giving __init__ an explicit return type of None,
replace any uses of typing.Dict/typing.List in method signatures with built-in
dict and list, and remove deprecated Dict/List imports from typing (or update
import lines accordingly); ensure function signatures, attribute annotations and
any type hints in this file use the built-in types and that imports only include
needed typing names.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 10: extraction_engine/gemini_vision_extractor.py:None
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Missing file existence check before opening image.**

If `png_path` doesn't exist, `open()` will raise `FileNotFoundError` which gets caught by the broad `except Exception` and returns a generic error. Consider explicit validation for better error messages.



```diff
         start_time = time.time()

         # Load image
+        if not os.path.exists(png_path):
+            return {
+                "error": f"Image file not found: {png_path}",
+                "metadata": {
+                    "model_used": self.model_name,
+                    "extraction_time": time.time() - start_time
+                }
+            }
+
         with open(png_path, "rb") as f:
             image_data = f.read()
```

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
        # Load image
        if not os.path.exists(png_path):
            return {
                "error": f"Image file not found: {png_path}",
                "metadata": {
                    "model_used": self.model_name,
                    "extraction_time": time.time() - start_time
                }
            }

        with open(png_path, "rb") as f:
            image_data = f.read()
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/gemini_vision_extractor.py around lines 70-72, the code
opens png_path without verifying it exists; add an explicit existence and
file-type check (e.g., use pathlib.Path(png_path).exists() and .is_file())
before attempting to open it, and if the check fails return or raise a clear
FileNotFoundError/ValueError with a descriptive message rather than letting a
generic exception handler mask the cause; ensure any new import (pathlib.Path)
is added at the top and keep the open() call only after the validation.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

✅ Addressed in commit 4d42df4

---

## Comment 11: extraction_engine/gemini_vision_extractor.py:110
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟠 Major_

**Blind exception catching swallows API errors and loses context.**

Catching `Exception` (Line 98) is too broad and hides the specific failure cause. For production reliability, you should:
1. Catch specific exceptions from the Gemini SDK
2. Add timeout to prevent indefinite hangs
3. Preserve error context for debugging



```diff
         # Call Gemini Vision API
         try:
             response = self.model.generate_content(
                 [prompt, {"mime_type": "image/png", "data": image_data}],
                 generation_config=genai.GenerationConfig(
                     temperature=0,
                     response_mime_type="application/json"
-                )
+                ),
+                request_options={"timeout": 120}  # 2 minute timeout
             )
 
             # Parse response
             result = self._parse_response(response.text)
+        except json.JSONDecodeError as e:
+            return {
+                "error": f"JSON parsing failed: {e}",
+                "metadata": {
+                    "model_used": self.model_name,
+                    "extraction_time": time.time() - start_time
+                }
+            }
+        except genai.types.BlockedPromptException as e:
+            return {
+                "error": f"Content blocked: {e}",
+                "metadata": {
+                    "model_used": self.model_name,
+                    "extraction_time": time.time() - start_time
+                }
+            }
-        except Exception as e:
+        except Exception as e:  # Fallback for unexpected errors
+            import logging
+            logging.exception("Unexpected error during extraction")
             return {
-                "error": str(e),
+                "error": f"Unexpected error: {type(e).__name__}: {e}",
                 "metadata": {
                     "model_used": self.model_name,
                     "extraction_time": time.time() - start_time
                 }
             }
```


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

96-96: Consider moving this statement to an `else` block

(TRY300)

---

98-98: Do not catch blind exception: `Exception`

(BLE001)

</details>

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 12: extraction_engine/gemini_vision_extractor.py:201
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟡 Minor_

**JSON parsing fallback loses original exception context.**

Line 195 raises `ValueError` without chaining from the original `JSONDecodeError`, which loses the traceback. Also, the nested `json.loads` calls (Lines 190, 193) could raise their own exceptions that are not handled.



```diff
     def _parse_response(self, response_text: str) -> Dict:
         """Parse Gemini's response"""
         try:
             # Gemini should return pure JSON with response_mime_type set
-            result = json.loads(response_text)
-            return result
+            return json.loads(response_text)
         except json.JSONDecodeError as e:
             # Fallback: try to extract JSON from markdown blocks
-            if "```json" in response_text:
-                response_text = response_text.split("```json")[1].split("```")[0].strip()
-                return json.loads(response_text)
-            elif "```" in response_text:
-                response_text = response_text.split("```")[1].split("```")[0].strip()
-                return json.loads(response_text)
-            else:
-                raise ValueError(f"Failed to parse JSON response: {e}")
+            try:
+                if "```json" in response_text:
+                    cleaned = response_text.split("```json")[1].split("```")[0].strip()
+                    return json.loads(cleaned)
+                elif "```" in response_text:
+                    cleaned = response_text.split("```")[1].split("```")[0].strip()
+                    return json.loads(cleaned)
+            except (json.JSONDecodeError, IndexError):
+                pass  # Fall through to raise with original error
+            raise ValueError(f"Failed to parse JSON response: {e}") from e
```

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

185-185: Consider moving this statement to an `else` block

(TRY300)

---

195-195: Within an `except` clause, raise exceptions with `raise ... from err` or `raise ... from None` to distinguish them from errors in exception handling

(B904)

---

195-195: Avoid specifying long messages outside the exception class

(TRY003)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/gemini_vision_extractor.py around lines 180 to 196, the
JSON parsing fallback currently raises a new ValueError without exception
chaining and does not handle errors from the nested json.loads calls; update the
except block to (1) wrap the fallback parsing in its own try/except that catches
json.JSONDecodeError and IndexError from the split/json.loads attempts, (2) if
those fallback attempts succeed return the parsed dict, otherwise raise
ValueError(...) from e to preserve the original JSONDecodeError context, and (3)
avoid swallowing the original exception so traceback and cause are preserved.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 13: extraction_engine/requirements.txt:75
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Multiple OpenCV package variants may cause conflicts.**

Four OpenCV packages are installed:
- `opencv-contrib-python==4.10.0.84` (Line 72)
- `opencv-contrib-python-headless==4.12.0.88` (Line 73)
- `opencv-python==4.12.0.88` (Line 74)
- `opencv-python-headless==4.12.0.88` (Line 75)

These packages provide overlapping functionality and can conflict. Typically only one variant should be used per environment. For a server/extraction pipeline, the `-headless` variant is preferred.



Consider keeping only one:
```diff
-opencv-contrib-python==4.10.0.84
-opencv-contrib-python-headless==4.12.0.88
-opencv-python==4.12.0.88
+opencv-contrib-python-headless==4.12.0.88
```


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/requirements.txt around lines 72 to 75, multiple
overlapping OpenCV packages are listed which can conflict at install/runtime;
retain only a single headless variant appropriate for server/extraction
pipelines (e.g., opencv-contrib-python-headless or opencv-python-headless) and
remove the other three entries, ensuring the chosen package version meets
project needs and updating any imports or dependency notes if your code requires
contrib modules.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 14: extraction_engine/requirements.txt:106
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟠 Major_

<details>
<summary>🧩 Analysis chain</summary>

🏁 Script executed:

```shell
#!/bin/bash
# Check which files actually import PyPDF2 vs pypdf
echo "=== Files importing PyPDF2 ==="
rg -l "import PyPDF2|from PyPDF2" --type=py

echo ""
echo "=== Files importing pypdf ==="
rg -l "import pypdf|from pypdf" --type=py
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 205

---

🏁 Script executed:

```shell
#!/bin/bash
echo "=== pypdf usage in extraction_engine/pdf_analyzer.py ==="
rg -A 2 "from pypdf|import pypdf" extraction_engine/pdf_analyzer.py

echo ""
echo "=== pypdf usage in extraction_engine/pdf_inspector.py ==="
rg -A 2 "from pypdf|import pypdf" extraction_engine/pdf_inspector.py
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 270

---



</details>

**Remove PyPDF2==3.0.1 dependency—it is unused.**

PyPDF2 has no imports anywhere in the codebase, while pypdf is actively used in pdf_analyzer.py and pdf_inspector.py. PyPDF2 is deprecated and has been merged into pypdf. Removing this unused dependency eliminates both the redundancy and the flagged MEDIUM severity vulnerabilities (infinite loop vulnerability when comment lacks EOF marker).

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/requirements.txt around lines 105 to 106, the file pins
both pypdf==5.9.0 and PyPDF2==3.0.1; PyPDF2 is unused and deprecated (merged
into pypdf) and introduces a MEDIUM security issue. Remove the PyPDF2==3.0.1
line from requirements.txt, leaving only pypdf==5.9.0, then run pip-tools/poetry
lock or regenerate the lockfile and CI dependency checks to ensure the change is
reflected.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 15: extraction_engine/requirements.txt:144
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🔴 Critical_

<details>
<summary>🧩 Analysis chain</summary>

🌐 Web query:

`GHSA-2xpw-w6gg-jr37 urllib3 security vulnerability`

💡 Result:

Summary — GHSA-2xpw-w6gg-jr37 (urllib3)
- Advisory: "Streaming API improperly handles highly compressed data" (GitHub advisory). Impact: urllib3 may fully decompress a small amount of highly compressed streamed data, causing very high CPU and memory use (denial-of-service). Affects urllib3 >=1.0, <2.6.0. CVE: CVE-2025-66471. [1][2]

Affected versions
- urllib3 1.0 through 2.5.0 (upgrade target: ≥ 2.6.0). [1][2][3]

Risk and technical note
- Rated High (CVSSv4 8.9). Triggered when streaming compressed responses (gzip/deflate/br/zstd); decompressor can expand tiny input into very large output and fill internal buffers. Exploitable by a malicious server sending crafted compressed responses to a client using urllib3 streaming APIs. [2][3]

Remediation / mitigations
- Upgrade urllib3 to 2.6.0 or later (fix avoids decompressing more than requested). [1][2]
- If you cannot upgrade immediately: use preload_content=False and validate/limit resp.headers["content-encoding"] (ensure a safe number/chain of encodings) before reading streamed content; avoid streaming untrusted compressed content. [4][5]

References
[1] GitHub security advisory GHSA-2xpw-w6gg-jr37 — urllib3.  
[2] OSV entry / CVE-2025-66471.  
[3] Tenable vulnerability entry for CVE-2025-66471.  
[4] Openwall / oss-security discussion (notes and workaround).  
[5] Additional vulnerability summaries (Resolved Security / Cybersecurity Help).

---

🌐 Web query:

`GHSA-gm62-xv2j-4w53 urllib3 vulnerability 2025`

💡 Result:

Summary — GHSA-gm62-xv2j-4w53 (CVE-2025-66418):
- Issue: urllib3 allowed an unbounded number of links in the HTTP response decompression chain (e.g., Content-Encoding: gzip, zstd), enabling a malicious server to cause very high CPU and huge memory allocation. [1][2]
- Affected versions: >= 1.24 and < 2.6.0 (includes 2.5.0 and earlier). [1][3]
- Impact: Denial-of-service via resource exhaustion when requesting from untrusted servers. CVSSv4 score ~8.9 (High). [2][3]
- Fix / Mitigation: Upgrade to urllib3 v2.6.0 or later (limits chain length to 5). As a temporary mitigation, disable automatic content decoding when calling untrusted servers. [1][2]

Sources:
[1] urllib3 security advisory GHSA-gm62-xv2j-4w53 (GitHub).  
[2] OSV / CVE-2025-66418 entry.  
[3] oss-security / Openwall post summarizing the fix (Dec 5, 2025).

---

🌐 Web query:

`urllib3 latest version December 2025 security`

💡 Result:

Latest urllib3 (as of Dec 8, 2025): 2.6.0 — released Dec 5, 2025. It fixes multiple security issues including decompression/streaming "decompression bomb" DoS and unbounded chained Content-Encoding decodings (limits chained encodings to 5). Upgrade to urllib3>=2.6.0. [1][2][3]

Sources:
- urllib3 2.6.0 changelog (Dec 5, 2025). [1]
- CVE / vulnerability notes on chained encodings (CVE-2025-66418) and streaming decompression (CVE-2025-66471). [2][3]

---



</details>

**Upgrade urllib3 to 2.6.0+ to fix HIGH severity vulnerabilities.**

urllib3 2.5.0 contains two High severity vulnerabilities (CVSSv4 8.9):
- **CVE-2025-66471 (GHSA-2xpw-w6gg-jr37)**: Streaming API improperly handles highly compressed data, enabling denial-of-service via CPU/memory exhaustion
- **CVE-2025-66418 (GHSA-gm62-xv2j-4w53)**: Unbounded decompression chain allows malicious servers to cause resource exhaustion

Both vulnerabilities are directly exploitable when processing untrusted content (PDFs, images, etc.). Upgrade to urllib3 ≥ 2.6.0 (released Dec 5, 2025), which limits decompression chains and validates stream decompression boundaries.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/requirements.txt around line 144, urllib3 is pinned to
2.5.0 which contains high-severity vulnerabilities; update the requirement to
urllib3>=2.6.0 (or a specific patched version like 2.6.0+) to mitigate
CVE-2025-66471 and CVE-2025-66418; after updating the line, regenerate any
lockfiles or dependency pins (pip-compile/poetry lock/poetry update or pip
install -r) and run the test suite and dependency-scan/security-scan to verify
no downstream conflicts.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 16: extraction_engine/results/bmw_x5_claude_haiku45.json:33
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟠 Major_

**Duplicate spec entries detected.**

The label `"Twin-Turbo V-8 with Bi-Turbo petrol engine"` appears twice (lines 19 and 28) with different trim values. This appears to be an extraction artifact where the same spec was captured multiple times. Similar duplicates exist for:
- `"Dynamic Traction Control (DTC)"` (appears twice)
- `"Ambient light (5 Colours)"` (appears twice)
- `"Cabin air filtration"` (appears twice)
- `"Energetic Brake Assist Brake Assist"` (appears twice)

These duplicates should be deduplicated or flagged as extraction quality issues.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/results/bmw_x5_claude_haiku45.json around lines 16 to 33,
multiple spec objects share the exact same category/subcategory/label (e.g.,
"Twin-Turbo V-8 with Bi-Turbo petrol engine" and others) creating duplicate
entries with split values across trims; deduplicate by collapsing entries with
identical category+subcategory+label into a single object, merging their values
maps so each trim key is set to the non-null value (if both non-null and
different, prefer the latest extraction and add a "conflict": true flag or log
the conflict), and remove the redundant objects; ensure the output contains only
unique spec entries and add a unit test or validation step to detect future
duplicate extractions.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 17: extraction_engine/results/bmw_x5_claude_haiku45.json:798
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟡 Minor_

**Category/content mismatch: wheel specs under "ROOF DETAILS".**

Alloy wheel specifications are categorized under `"ROOF DETAILS"` instead of an appropriate category like `"Alloy Wheels"`. This indicates category extraction errors.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/results/bmw_x5_claude_haiku45.json around lines 782 to 798,
wheel specification entries are incorrectly placed under "ROOF DETAILS"; change
the "category" (and optionally "subcategory") for these two objects to an
appropriate category such as "Alloy Wheels" (e.g., set "category": "Alloy
Wheels" and "subcategory": "Wheel Details" or similar consistent existing key),
leaving the "label" and "values" intact so the wheel specs remain correct but
are classified under the proper category.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 18: extraction_engine/results/bmw_x5_claude_haiku45.json:897
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟠 Major_

**Technical Data contains implausible values.**

Several values appear incorrect or malformed:
- Line 805: `"X5 M50d xDrive": "4,785"` kg kerb weight is implausible (BMW X5 is ~2,300 kg)
- Line 814: `"X5 M50d xDrive": "3,0"` displacement appears truncated (should be `"3,000"` cc)
- Line 893: `"Unladen weight (mm)"` — unit should be `kg`, not `mm`

These suggest extraction hallucinations that will propagate errors to downstream validation and comparison workflows.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/results/bmw_x5_claude_haiku45.json around lines 800-897,
fix three extraction errors: replace the implausible Kerb Weight for "X5 M50d
xDrive" from "4,785" to the correct value "2,505" (match other curb/curb-weight
entries), change Displacement for "X5 M50d xDrive" from the truncated "3,0" to
the full "3,000", and correct the label "Unladen weight (mm)" to "Unladen weight
(kg)" and update its values to realistic weights (e.g., "X5 xDrive50i": "2,085",
"X5 M50d xDrive": "2,505") so units and numbers are consistent and not
malformed.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 19: extraction_engine/results/bmw_x5_claude_haiku45.json:913
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_⚠️ Potential issue_ | _🟡 Minor_

**Metadata model mismatch: filename says "haiku45" but metadata says "claude-sonnet-4.5".**

The filename is `bmw_x5_claude_haiku45.json` but `model_used` in metadata is `"claude-sonnet-4.5"`. This inconsistency will cause confusion when comparing model performance. Rename the file or correct the metadata.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/results/bmw_x5_claude_haiku45.json around lines 899 to 913,
the metadata field "model_used" is "claude-sonnet-4.5" which conflicts with the
filename that references "haiku45"; update either the filename or the metadata
so they match: choose the correct model identifier (haiku45 vs
claude-sonnet-4.5), then rename the file to reflect the metadata or change
"model_used" to "claude-haiku-4.5" (or the exact canonical model name you
intend) ensuring consistency across storage, tests, and any references.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 20: extraction_engine/visual_validator.py:11
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Use built-in generic types instead of deprecated `typing` imports.**

Python 3.9+ supports `dict` and `list` as generic types directly.



```diff
-from typing import Dict, List
+from typing import Dict, List  # Consider using dict, list directly for Python 3.9+
```

Or if targeting Python 3.9+:
```diff
-from typing import Dict, List
```
And replace `Dict` → `dict`, `List` → `list` in type hints.

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
from typing import Dict, List  # Consider using dict, list directly for Python 3.9+
```

</details>

<!-- suggestion_end -->

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

11-11: `typing.Dict` is deprecated, use `dict` instead

(UP035)

---

11-11: `typing.List` is deprecated, use `list` instead

(UP035)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/visual_validator.py around line 11, the import uses
typing.Dict and typing.List which are deprecated in favor of built-in generics
on Python 3.9+; remove those typing imports and update all type hints in this
file to use built-in lowercase generics (dict, list) instead of Dict and List so
annotations use modern syntax and the typing import can be dropped.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 21: extraction_engine/visual_validator.py:50
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:51Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Use specific exception handling instead of bare `except`.**

Bare `except` catches all exceptions including `KeyboardInterrupt` and `SystemExit`, which can mask bugs and make debugging difficult.



```diff
     try:
         font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
         font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size + 2)
-    except:
+    except (OSError, IOError):
         font = ImageFont.load_default()
         font_bold = font
```

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
    # Try to use a decent font, fall back to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size + 2)
    except (OSError, IOError):
        font = ImageFont.load_default()
        font_bold = font
```

</details>

<!-- suggestion_end -->

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

48-48: Do not use bare `except`

(E722)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/visual_validator.py around lines 44 to 50, the current bare
except swallows all exceptions; change it to catch specific exceptions (e.g.,
OSError or IOError thrown when font files are missing/unreadable) and optionally
log the caught exception before falling back to ImageFont.load_default() so
KeyboardInterrupt/SystemExit are not suppressed and debugging info is preserved.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 22: extraction_engine/visual_validator.py:55
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:52Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Hard-coded "Gemini 2.5-flash" title ignores actual model from metadata.**

The title is hard-coded as `"Gemini 2.5-flash Extraction Result"` but the actual model could be different (e.g., Claude). Use the model from metadata instead.



```diff
-    draw.text((10, y_offset), "Gemini 2.5-flash Extraction Result", fill='black', font=font_bold)
+    model_name = data.get('metadata', {}).get('model_used', 'Unknown Model')
+    draw.text((10, y_offset), f"{model_name} Extraction Result", fill='black', font=font_bold)
```

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
    # Title
    model_name = data.get('metadata', {}).get('model_used', 'Unknown Model')
    draw.text((10, y_offset), f"{model_name} Extraction Result", fill='black', font=font_bold)
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/visual_validator.py around lines 54-55, the image title is
hard-coded to "Gemini 2.5-flash Extraction Result" which ignores the actual
model in the metadata; replace the hard-coded string with the model from the
metadata (e.g., metadata.get('model') or metadata.get('model_name')), fall back
to a safe default like "Extraction Result" if missing, sanitize/normalize the
model string for display, and compose the title as f"{model_display} Extraction
Result" before passing it to draw.text.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 23: extraction_engine/visual_validator.py:165
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:24:52Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Use specific exception handling instead of bare `except`.**

Same issue as above — catch specific font-loading exceptions.



```diff
     try:
         title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
-    except:
+    except (OSError, IOError):
         title_font = ImageFont.load_default()
```

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except (OSError, IOError):
        title_font = ImageFont.load_default()
```

</details>

<!-- suggestion_end -->

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 Ruff (0.14.7)</summary>

164-164: Do not use bare `except`

(E722)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/visual_validator.py around lines 162 to 165, the try/except
uses a bare except when loading the font; replace the bare except with a
specific exception tuple (e.g., except (OSError, IOError):) so only
file/OS-related font-loading errors are caught and then fall back to
ImageFont.load_default(); optionally log the exception before falling back for
visibility.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 24: extraction_engine/claude_vision_extractor.py:99
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:50:08Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Align missing‑file error shape and use `is_file()` for robustness**

Good call adding an explicit image path check. Two small improvements:

- Use `image_path.is_file()` instead of `exists()` so a directory with that name fails fast before `open`.
- Return metadata that matches other error paths (and Gemini’s) so downstream code can rely on a stable contract, e.g. include `model_used` and compute `extraction_time` instead of hard‑coding `0`.

Example:

```diff
-        image_path = Path(png_path)
-        if not image_path.exists():
-            return {
-                "error": f"Image file not found: {png_path}",
-                "trims": [],
-                "specs": [],
-                "metadata": {"extraction_time": 0, "success": False}
-            }
+        image_path = Path(png_path)
+        if not image_path.is_file():
+            return {
+                "error": f"Image file not found: {png_path}",
+                "trims": [],
+                "specs": [],
+                "metadata": {
+                    "extraction_time": time.time() - start_time,
+                    "success": False,
+                    "model_used": "claude-sonnet-4.5",
+                },
+            }
```



> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/claude_vision_extractor.py around lines 87 to 99, the
missing-image branch currently uses Path.exists() and returns metadata with
extraction_time=0 and no model_used; change image_path.exists() to
image_path.is_file() to reject directories, and update the returned error
payload to match other error paths (and Gemini’s) by including the same metadata
keys: compute and return a real extraction_time (e.g., time elapsed from
function start to error), include model_used with the model name in use, and
keep success=False plus the same top-level keys ("error", "trims", "specs",
"metadata") so downstream consumers see a stable contract.
```

</details>

<!-- fingerprinting:phantom:poseidon:olive -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

## Comment 25: extraction_engine/gemini_vision_extractor.py:78
**Author:** coderabbitai[bot]
**Created:** 2025-12-08T15:50:09Z

### 📝 Full Comment:
_🧹 Nitpick_ | _🔵 Trivial_

**Unify missing‑file error contract and include timing**

The new existence check is good, but the error payload is thinner than other paths and than Claude’s extractor:

- No `trims` / `specs` keys, so callers have to special‑case this error.
- No `extraction_time` despite recording `start_time`.

Consider aligning with the other error shapes:

```diff
-        if not image_path.exists():
-            return {"error": f"Image file not found: {png_path}", "metadata": {"model_used": self.model_name}}
+        if not image_path.exists():
+            return {
+                "error": f"Image file not found: {png_path}",
+                "trims": [],
+                "specs": [],
+                "metadata": {
+                    "model_used": self.model_name,
+                    "extraction_time": time.time() - start_time,
+                },
+            }
```

This keeps downstream handling simple and consistent across engines.

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
        start_time = time.time()

        # Validate and load image
        from pathlib import Path
        image_path = Path(png_path)
        if not image_path.exists():
            return {
                "error": f"Image file not found: {png_path}",
                "trims": [],
                "specs": [],
                "metadata": {
                    "model_used": self.model_name,
                    "extraction_time": time.time() - start_time,
                },
            }

        with open(image_path, "rb") as f:
            image_data = f.read()
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In extraction_engine/gemini_vision_extractor.py around lines 68 to 78, the
early-return for a missing image file returns an inconsistent, thin error
payload; update the return to match the extractor's standard error contract by
including "error" with the message, "metadata" containing "model_used", include
empty or default "trims" and "specs" keys as used elsewhere, and add
"extraction_time" computed as time.time() - start_time (and any other fields
present in other error paths) so callers receive a consistent shape.
```

</details>

<!-- fingerprinting:phantom:poseidon:olive -->

<!-- This is an auto-generated comment by CodeRabbit -->

---

