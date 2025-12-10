188: ```
In extraction_engine/auto_crop_validator.py around lines 185 to 188, the code
uses a bare except when loading a truetype font; replace it with explicit
exception handling (catch OSError and IOError as e) to avoid swallowing
unrelated errors, and optionally log or propagate the exception before falling
back to ImageFont.load_default().
```

279: ```
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

null: ```
In extraction_engine/auto_crop_validator.py around lines 353 to 359, the
for-loop and the validate_crops assignment create unused variables; change the
loop to use an underscore for the unused table name (for _, path in
manual_crops.items():) and remove the unused report assignment by calling
validate_crops(full_page, manual_crops, output_dir="validation") without
assigning its return value (or assign to _ if you must), so there are no unused
variables left.
```

