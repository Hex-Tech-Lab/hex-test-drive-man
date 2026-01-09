# PR #58 Review Analysis

**Generated**: 2026-01-09T09:58:18.211Z  
**Total Issues**: 22  
**Breakdown**: 3 CRITICAL, 3 HIGH, 3 MEDIUM, 13 LOW

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| CRITICAL | 3 | Fix immediately before merge |
| HIGH | 3 | Fix if <5 min each |
| MEDIUM | 3 | Document for later |
| LOW | 13 | Optional (style/formatting) |

---

## CRITICAL Issues (3)


### 1. SonarCloud

```
## [![Quality Gate Passed](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/checks/QualityGateBadge/qg-passed-20px.png 'Quality Gate Passed')](https://sonarcloud.io/dashboard?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58) **Quality Gate passed**  
Issues  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [13 New issues](https://sonarcloud.io/project/issues?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true)  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/accepted-16px.png '') [0 Accepted issues](https://sonarcloud.io/project/issues?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58&issueStatuses=ACCEPTED)

Measures  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0 Security Hotspots](https://sonarcloud.io/project/security_hotspots?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true)  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0.0% Coverage on New Code](https://sonarcloud.io/component_measures?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58&metric=new_coverage&view=list)  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0.0% Duplication on New Code](https://sonarcloud.io/component_measures?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58&metric=new_duplicated_lines_density&view=list)  
  
[See analysis details on SonarQube Cloud](https://sonarcloud.io/dashboard?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=58)


```


### 2. CodeRabbit - src/components/scanner/SmartScanner.tsx:55

```
_⚠️ Potential issue_ | _🔴 Critical_

**Video may not be ready when frame processing starts.**

`processFrames()` is called immediately after `video.play()` (line 48), but the video metadata (dimensions) may not be loaded yet. In `processFrame` (lines 78-79), `video.videoWidth` and `video.videoHeight` could be 0, resulting in a 0×0 canvas and failed detection.



<details>
<summary>🔧 Proposed fix: wait for video ready event</summary>

```diff
 async function startCamera() {
   try {
     const stream = await navigator.mediaDevices.getUserMedia({
       video: { facingMode: 'environment', width: 1280, height: 720 }
     });
     if (videoRef.current) {
       videoRef.current.srcObject = stream;
-      videoRef.current.play();
-      processFrames();
+      videoRef.current.onloadedmetadata = () => {
+        videoRef.current?.play();
+        processFrames();
+      };
     }
   } catch (err) {
     setError('Camera access denied');
   }
 }
```

</details>

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          processFrames();
        };
      }
    } catch (err) {
      setError('Camera access denied');
    }
  }
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 40 - 53, startCamera
currently calls processFrames immediately after videoRef.current.play(), but
video metadata (video.videoWidth/video.videoHeight) may not be available yet
causing a 0×0 canvas in processFrame; change startCamera to wait for the video's
ready event (e.g., 'loadedmetadata' or 'playing') on videoRef.current before
calling processFrames, and ensure any event listener is cleaned up; update
references in startCamera, processFrames, and processFrame to rely on the ready
event so processing only begins when video.videoWidth/video.videoHeight are
non-zero.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 3. CodeRabbit - src/components/scanner/SmartScanner.tsx:111

```
_⚠️ Potential issue_ | _🔴 Critical_

**Stale closure bug: `isCapturing` and `countdown` will always be their initial values.**

The `processFrame` function captures `isCapturing` and `countdown` from the closure when `processFrames` is first called. These values never update, so the condition on line 85 will malfunction—potentially triggering multiple countdowns or never triggering at all.

Additionally:
1. The `setInterval` timer (line 90) is not cleaned up on component unmount.
2. After capture completes, `processFrames` is never restarted, so the scanner stops working.


<details>
<summary>🔧 Proposed fix using refs and restart logic</summary>

```diff
+ const isCapturingRef = useRef(false);
+ const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  function processFrames() {
    // ... existing setup ...

    function processFrame() {
      if (!video || !canvas || !ctx) return;
+     if (video.videoWidth === 0 || video.videoHeight === 0) {
+       animationFrameRef.current = requestAnimationFrame(processFrame);
+       return;
+     }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const shouldCapture = detectIDCard(imageData);
-     if (shouldCapture && !isCapturing && countdown === null) {
-       setIsCapturing(true);
+     if (shouldCapture && !isCapturingRef.current) {
+       isCapturingRef.current = true;
+       setIsCapturing(true);
        let count = 3;
        setCountdown(count);
        
-       const timer = setInterval(() => {
+       countdownTimerRef.current = setInterval(() => {
          count--;
          if (count > 0) {
            setCountdown(count);
          } else {
-           clearInterval(timer);
+           clearInterval(countdownTimerRef.current!);
+           countdownTimerRef.current = null;
            setCountdown(null);
            canvas.toBlob(async (blob) => {
              if (blob) {
                await handleCapture(blob);
+               isCapturingRef.current = false;
                setIsCapturing(false);
+               // Restart frame processing for next scan
+               processFrames();
              }
            }, 'image/jpeg', 0.9);
          }
        }, 1000);
        
        return;
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
    processFrame();
  }

+ // Cleanup timer on unmount
+ useEffect(() => {
+   return () => {
+     if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
+   };
+ }, []);
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## HIGH Issues (3)


### 1. CodeRabbit - src/components/scanner/SmartScanner.tsx:109

```
_⚠️ Potential issue_ | _🟠 Major_

**Performance: canvas resized on every frame.**

Lines 78-79 set `canvas.width` and `canvas.height` on every frame, which clears the canvas and resets the drawing context. This is unnecessary overhead.



<details>
<summary>⚡ Proposed optimization: resize canvas only when dimensions change</summary>

```diff
 function processFrames() {
   const video = videoRef.current;
   const canvas = canvasRef.current;
   if (!video || !canvas) return;
   const ctx = canvas.getContext('2d');
   if (!ctx) return;
+  let lastWidth = 0;
+  let lastHeight = 0;
 
   function processFrame() {
     if (!video || !canvas || !ctx) return;
-    canvas.width = video.videoWidth;
-    canvas.height = video.videoHeight;
+    if (video.videoWidth !== lastWidth || video.videoHeight !== lastHeight) {
+      canvas.width = lastWidth = video.videoWidth;
+      canvas.height = lastHeight = video.videoHeight;
+    }
     ctx.drawImage(video, 0, 0);
     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
     const shouldCapture = detectIDCard(imageData);
     if (shouldCapture) {
       canvas.toBlob(async (blob) => { 
         if (blob) await handleCapture(blob); 
       }, 'image/jpeg', 0.9);
       return;
     }
     animationFrameRef.current = requestAnimationFrame(processFrame);
   }
   processFrame();
 }
```

</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 76 - 90, In
processFrame(), avoid resetting the canvas and drawing context each frame by
only assigning canvas.width and canvas.height when they actually differ from
video.videoWidth/video.videoHeight; check if canvas.width !== video.videoWidth
|| canvas.height !== video.videoHeight before setting them so you don't clear
the context every render, then proceed to ctx.drawImage/video capture logic and
leave the rest of the function (detectIDCard, canvas.toBlob,
requestAnimationFrame) unchanged.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 2. CodeRabbit - src/hooks/useSmartScanner.ts:36

```
_🧹 Nitpick_ | _🔵 Trivial_

**Consider adding cleanup for OpenCV script on unmount.**

The useEffect loads the OpenCV.js script but doesn't clean it up when the component unmounts. If the component remounts, this could lead to duplicate script tags and potential memory leaks.



<details>
<summary>♻️ Proposed cleanup implementation</summary>

```diff
  useEffect(() => {
+   let mounted = true;
    loadOpenCVWithFallback()
      .then(() => {
+       if (!mounted) return;
        cvRef.current = (window as any).cv;
        setLevel(2);
        setState('ready');
      })
      .catch(() => {
+       if (!mounted) return;
        // Fallback to level 1 (manual capture only)
        setState('ready');
      });
+   
+   return () => {
+     mounted = false;
+   };
  }, []);
```
</details>

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
  useEffect(() => {
    let mounted = true;
    loadOpenCVWithFallback()
      .then(() => {
        if (!mounted) return;
        cvRef.current = (window as any).cv;
        setLevel(2);
        setState('ready');
      })
      .catch(() => {
        if (!mounted) return;
        // Fallback to level 1 (manual capture only)
        setState('ready');
      });
    
    return () => {
      mounted = false;
    };
  }, []);
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/hooks/useSmartScanner.ts around lines 25 - 36, The useEffect that calls
loadOpenCVWithFallback should remove any injected OpenCV script and reset
related refs/state on unmount to prevent duplicate scripts and leaks: in the
same useEffect that calls loadOpenCVWithFallback(), return a cleanup function
that aborts or ignores pending promises from loadOpenCVWithFallback (if
possible), removes the script element added by that loader (querying by src or
an identifiable id), clears cvRef.current, and resets level/state (e.g.,
setLevel(0) or setState('idle')) so remounts start cleanly; update
loadOpenCVWithFallback or its caller to expose the script element or selector if
needed and ensure the .catch branch still leaves cleanup intact.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 3. CodeRabbit - src/hooks/useSmartScanner.ts:53

```
_🧹 Nitpick_ | _🔵 Trivial_

**Consider adding logging for CDN fallback debugging.**

The function silently tries each CDN without logging which attempts failed or succeeded. This could make debugging production issues difficult.



<details>
<summary>♻️ Proposed logging addition</summary>

```diff
  async function loadOpenCVWithFallback() {
    for (const url of OPENCV_CDN_PRIORITY) {
      try {
        await loadScript(url, 3000);
+       console.log('[useSmartScanner] Loaded OpenCV from:', url);
        return;
      } catch {
+       console.warn('[useSmartScanner] Failed to load from:', url);
        // Try next CDN
      }
    }
+   console.error('[useSmartScanner] All OpenCV CDNs failed');
    throw new Error('All CDNs failed');
  }
```
</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/hooks/useSmartScanner.ts around lines 43 - 53, Update
loadOpenCVWithFallback to log each CDN attempt and outcome to aid debugging:
inside the loop over OPENCV_CDN_PRIORITY, call the logger (e.g.,
console.warn/info or the project's logger) before trying loadScript(url, 3000)
and log success when loadScript resolves and the URL used; in the catch block
log the url and the caught error so you know which CDN failed; after the loop,
include the aggregated failure info or at minimum the last error in the thrown
Error('All CDNs failed') to surface why all attempts failed. Ensure references:
function name loadOpenCVWithFallback, constant OPENCV_CDN_PRIORITY, and helper
loadScript are used so the changes are localized.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## MEDIUM Issues (3)


### 1. CodeRabbit

```
<!-- This is an auto-generated comment: summarize by coderabbit.ai -->
<!-- walkthrough_start -->

## Walkthrough

Updates the ID scanning system by adding react-webcam dependency, refactoring SmartScanner to use frame-driven camera detection, modifying the OCR endpoint to process form-data and extract national ID and name from mock OCR text, and introducing a new ocr service module with text extraction utilities.

## Changes

| Cohort / File(s) | Summary |
|---|---|
| **Dependencies** <br> `package.json` | Added react-webcam v7.2.0 as a new dependency |
| **OCR API & Services** <br> `src/app/api/ocr/route.ts`, `src/services/ocr.ts` | OCR endpoint now parses form-data with image blob instead of JSON; returns response with text, nationalId, name, and warning fields. New ocr service provides `extractTextFromImage()`, `extractNationalID()`, and `extractName()` utilities for client-side text/data extraction |
| **Scanner Component & Hook** <br> `src/components/scanner/SmartScanner.tsx`, `src/hooks/useSmartScanner.ts` | SmartScanner changed from default to named export; refactored from complex state-driven system to frame-driven camera approach with simplified API. useSmartScanner hook replaced with lean implementation exporting level, state, and `detectIDCard()` method; added CDN fallback for OpenCV loading |
| **Scanner Consumer** <br> `src/components/booking/IDUpload.tsx` | Updated SmartScanner import from default to named export |

## Estimated code review effort

🎯 3 (Moderate) | ⏱️ ~25 minutes

## Possibly related PRs

- **Hex-Tech-Lab/hex-test-drive-man#51** — Overlapping scanner/OCR refactoring affecting SmartScanner component, useSmartScanner hook, and /api/ocr endpoint with similar API surface and export changes.

<!-- walkthrough_end -->


<!-- pre_merge_checks_walkthrough_start -->

<details>
<summary>🚥 Pre-merge checks | ✅ 2 | ❌ 1</summary>

<details>
<summary>❌ Failed checks (1 warning)</summary>

|  Check name | Status     | Explanation                                                                                                                                                                                            | Resolution                                                                                                                                                                                                             |
| :---------: | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title check | ⚠️ Warning | The PR title mentions 'Smart Scanner with 3-2-1 Countdown' but the actual implementation adds a 4-level progressive scanner (Levels 1-4) with OpenCV.js, OCR, and haptics/TTS—not a countdown feature. | Update the title to accurately reflect the main change, such as 'feat(mvp1.6): Progressive 4-level Smart Scanner with OpenCV.js and OCR' or similar to better represent the actual multi-level scanner implementation. |

</details>
<details>
<summary>✅ Passed checks (2 passed)</summary>

|     Check name     | Status   | Explanation                                                                         |
| :----------------: | :------- | :---------------------------------------------------------------------------------- |
| Docstring Coverage | ✅ Passed | Docstring coverage is 93.33% which is sufficient. The required threshold is 80.00%. |
|  Description Check | ✅ Passed | Check skipped - CodeRabbit’s high-level summary is enabled.                         |

</details>

<sub>✏️ Tip: You can configure your own custom pre-merge checks in the settings.</sub>

</details>

<!-- pre_merge_checks_walkthrough_end -->

<!-- finishing_touch_checkbox_start -->

<details>
<summary>✨ Finishing touches</summary>

- [ ] <!-- {"checkboxId": "7962f53c-55bc-4827-bfbf-6a18da830691"} --> 📝 Generate docstrings
<details>
<summary>🧪 Generate unit tests (beta)</summary>

- [ ] <!-- {"checkboxId": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "radioGroupId": "utg-output-choice-group-unknown_comment_id"} -->   Create PR with unit tests
- [ ] <!-- {"checkboxId": "07f1e7d6-8a8e-4e23-9900-8731c2c87f58", "radioGroupId": "utg-output-choice-group-unknown_comment_id"} -->   Post copyable unit tests in a comment
- [ ] <!-- {"checkboxId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "radioGroupId": "utg-output-choice-group-unknown_comment_id"} -->   Commit unit tests in branch `bb/mvp1.6-smart-scanner`

</details>

</details>

<!-- finishing_touch_checkbox_end -->

<!-- tips_start -->

---

Thanks for using [CodeRabbit](https://coderabbit.ai?utm_source=oss&utm_medium=github&utm_campaign=Hex-Tech-Lab/hex-test-drive-man&utm_content=58)! It's free for OSS, and your support helps us grow. If you like it, consider giving us a shout-out.

<details>
<summary>❤️ Share</summary>

- [X](https://twitter.com/intent/tweet?text=I%20just%20used%20%40coderabbitai%20for%20my%20code%20review%2C%20and%20it%27s%20fantastic%21%20It%27s%20free%20for%20OSS%20and%20offers%20a%20free%20trial%20for%20the%20proprietary%20code.%20Check%20it%20out%3A&url=https%3A//coderabbit.ai)
- [Mastodon](https://mastodon.social/share?text=I%20just%20used%20%40coderabbitai%20for%20my%20code%20review%2C%20and%20it%27s%20fantastic%21%20It%27s%20free%20for%20OSS%20and%20offers%20a%20free%20trial%20for%20the%20proprietary%20code.%20Check%20it%20out%3A%20https%3A%2F%2Fcoderabbit.ai)
- [Reddit](https://www.reddit.com/submit?title=Great%20tool%20for%20code%20review%20-%20CodeRabbit&text=I%20just%20used%20CodeRabbit%20for%20my%20code%20review%2C%20and%20it%27s%20fantastic%21%20It%27s%20free%20for%20OSS%20and%20offers%20a%20free%20trial%20for%20proprietary%20code.%20Check%20it%20out%3A%20https%3A//coderabbit.ai)
- [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fcoderabbit.ai&mini=true&title=Great%20tool%20for%20code%20review%20-%20CodeRabbit&summary=I%20just%20used%20CodeRabbit%20for%20my%20code%20review%2C%20and%20it%27s%20fantastic%21%20It%27s%20free%20for%20OSS%20and%20offers%20a%20free%20trial%20for%20proprietary%20code)

</details>

<sub>Comment `@coderabbitai help` to get the list of available commands and usage tips.</sub>

<!-- tips_end -->

<!-- internal state start -->


<!-- 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 -->

<!-- internal state end -->
```


### 2. CodeRabbit - src/app/api/ocr/route.ts:49

```
_⚠️ Potential issue_ | _🟠 Major_

**Eliminate code duplication with src/services/ocr.ts.**

The national ID and name extraction logic (lines 36-43) duplicates the exact same logic from `src/services/ocr.ts` (lines 31-53). This violates the DRY principle and creates maintenance burden.




As per coding guidelines: eliminate duplicate code through abstractions.

<details>
<summary>♻️ Proposed refactor to reuse service functions</summary>

```diff
+ import { extractNationalID, extractName } from '@/services/ocr';
+
  export async function POST(request: NextRequest) {
    // ... validation ...
    
    // Mock extracted text (Egyptian National ID format)
    const mockText = `
      جمهورية مصر العربية
      بطاقة تحقيق شخصية
      محمد أحمد علي
      12345678901234
      تاريخ الميلاد: 1990/01/15
    `;
    
-   // Extract National ID (14 digits)
-   const idMatch = mockText.match(/\b\d{14}\b/);
-   const nationalId = idMatch ? idMatch[0] : undefined;
-   
-   // Extract name (simplified - first Arabic line with 3+ words)
-   const lines = mockText.split('\n').map(l => l.trim()).filter(Boolean);
-   const nameMatch = lines.find(line => 
-     /^[\u0600-\u06FF\s]{10,}$/.test(line) && line.split(/\s+/).length >= 3
-   );
+   // Extract National ID and name using service functions
+   const nationalId = extractNationalID(mockText);
+   const name = extractName(mockText);
    
    return NextResponse.json({
      text: mockText,
      nationalId,
-     name: nameMatch,
+     name,
      warning: 'Mock OCR data - actual implementation pending'
    });
```
</details>

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
    // Mock extracted text (Egyptian National ID format)
    const mockText = `
      جمهورية مصر العربية
      بطاقة تحقيق شخصية
      محمد أحمد علي
      12345678901234
      تاريخ الميلاد: 1990/01/15
    `;
    
    // Extract National ID and name using service functions
    const nationalId = extractNationalID(mockText);
    const name = extractName(mockText);
    
    return NextResponse.json({
      text: mockText,
      nationalId,
      name,
      warning: 'Mock OCR data - actual implementation pending'
    });
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/app/api/ocr/route.ts around lines 26 - 49, The route handler duplicates
the ID/name extraction logic found in src/services/ocr.ts; remove the inline
extraction (the idMatch/nationalId and lines/nameMatch logic) and instead import
and call the shared extractor functions from src/services/ocr.ts (e.g.,
extractNationalId(mockText) and extractName(mockText) — or export equivalent
functions if they don’t exist yet), pass the existing mockText to those
functions, and return their results in the JSON payload (nationalId and name)
while keeping the mockText and warning unchanged.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 3. CodeRabbit - src/components/scanner/SmartScanner.tsx:undefined

```
_🧹 Nitpick_ | _🔵 Trivial_

**Optional: extract hardcoded JPEG quality to constant.**

The JPEG quality value `0.9` is hardcoded in two places (lines 86 and 142). Consider extracting to a named constant for maintainability.



<details>
<summary>♻️ Proposed refactor</summary>

```diff
+const CAPTURE_JPEG_QUALITY = 0.9;
+
 /**
  * Smart ID card scanner with progressive enhancement
```

```diff
       canvas.toBlob(async (blob) => { 
         if (blob) await handleCapture(blob); 
-      }, 'image/jpeg', 0.9);
+      }, 'image/jpeg', CAPTURE_JPEG_QUALITY);
```

```diff
     canvas.toBlob(async (blob) => { 
       if (blob) await handleCapture(blob); 
-    }, 'image/jpeg', 0.9);
+    }, 'image/jpeg', CAPTURE_JPEG_QUALITY);
```

</details>


Also applies to: 142-142

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx at line 86, The JPEG quality literal
0.9 is duplicated in SmartScanner; define a descriptive constant (e.g.,
JPEG_QUALITY = 0.9) near the top of the SmartScanner component or module and
replace both hardcoded occurrences (the image/jpeg conversion calls on lines
where canvas.toDataURL or toBlob is invoked) with that constant; update any
relevant variable scope/imports so both usages (the calls currently passing 0.9)
reference the new named constant for maintainability.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## LOW Issues (13)


### 1. CodeRabbit - src/app/api/ocr/route.ts:21

```
_⚠️ Potential issue_ | _🟠 Major_

**Add type validation for the image Blob.**

The code uses a type assertion `as Blob` without validating that the form field is actually a Blob. If a client sends a string or other type, this could cause runtime errors.



<details>
<summary>🔒 Proposed validation fix</summary>

```diff
  const formData = await request.formData();
  const image = formData.get('image') as Blob;
  
- if (!image) {
+ if (!image || !(image instanceof Blob)) {
    return NextResponse.json(
-     { error: 'No image provided' },
+     { error: 'Invalid image: must be a Blob' },
      { status: 400 }
    );
  }
```
</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/app/api/ocr/route.ts around lines 13 - 21, The code currently asserts
formData.get('image') as Blob without runtime checking; change to validate the
type before use by replacing the blind assertion with a runtime check: get the
value via const imageField = formData.get('image'), verify it is an instance of
Blob (e.g., if (!(imageField instanceof Blob)) return NextResponse.json({ error:
'Invalid image: expected file/blob' }, { status: 400 });), then assign const
image = imageField as Blob and proceed; update any subsequent uses of image in
this route handler to rely on the validated Blob.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 2. CodeRabbit - src/components/scanner/SmartScanner.tsx:123

```
_🧹 Nitpick_ | _🔵 Trivial_

**Memory concern: base64 conversion for large images.**

Converting high-resolution images to base64 strings (lines 100-104) can be memory-intensive. For 1280×720 JPEG images, this is manageable, but consider passing the `Blob` directly or using object URLs if memory becomes a concern.



If the consumer can accept Blob or object URL:

<details>
<summary>♻️ Alternative: use object URL</summary>

```diff
 async function handleCapture(blob: Blob) {
   try {
-    // Convert blob to base64 for storage
-    const reader = new FileReader();
-    const imageData = await new Promise<string>((resolve) => {
-      reader.onloadend = () => resolve(reader.result as string);
-      reader.readAsDataURL(blob);
-    });
+    // Create object URL (caller must revoke when done)
+    const imageData = URL.createObjectURL(blob);
 
     // Extract text using OCR (only for front side)
     let extractedData: { nationalId?: string; name?: string } = {};
```

Note: This changes the public API contract; document that callers must revoke the URL.

</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 100 - 104, The current
SmartScanner code converts the captured Blob to a base64 string via FileReader
(reader.onloadend, reader.readAsDataURL) which can be memory-heavy for large
images; change the implementation in SmartScanner to pass the Blob directly or
create an object URL (URL.createObjectURL(blob)) instead of reading as base64,
update any consumer-facing types/contract to accept Blob or object URL, and if
using object URLs ensure callers (or this component) call URL.revokeObjectURL
when the image is no longer needed and update documentation/comments to reflect
the new API contract.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->

✅ Addressed in commits 934f80a to 9db9af3
```


### 3. CodeRabbit - src/components/scanner/SmartScanner.tsx:140

```
_⚠️ Potential issue_ | _🟠 Major_

**Missing user feedback during OCR processing.**

OCR extraction (lines 111-116) can take several seconds, but there's no visual feedback to the user. Additionally, when OCR fails (lines 117-120), the error is only logged to the console—users receive no indication that text extraction failed.



<details>
<summary>💡 Suggested improvements</summary>

1. **Add loading state for OCR:**

```diff
 export function SmartScanner({ mode, onScanComplete, language = 'en' }: SmartScannerProps) {
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const { level, state, detectIDCard } = useSmartScanner();
   const [error, setError] = useState<string | null>(null);
+  const [isProcessing, setIsProcessing] = useState(false);
   const animationFrameRef = useRef<number | null>(null);
   const isArabic = language === 'ar';
```

```diff
 async function handleCapture(blob: Blob) {
   try {
+    setIsProcessing(true);
     // Convert blob to base64 for storage
     const reader = new FileReader();
```

2. **Display processing status in UI** (around line 190):

```diff
       <Typography variant="caption" color="text.secondary" display="block">
         {isArabic ? `الحالة: ${state}` : `Status: ${state}`}
       </Typography>
+      {isProcessing && (
+        <Typography variant="caption" color="primary" display="block">
+          {isArabic ? 'جاري معالجة الصورة...' : 'Processing image...'}
+        </Typography>
+      )}
```

3. **Notify user of OCR failure:**

```diff
       } catch (ocrError) {
         console.error('OCR extraction failed:', ocrError);
-        // Continue without OCR data
+        // Show warning but continue
+        console.warn(isArabic 
+          ? 'تعذر استخراج النص تلقائيًا' 
+          : 'Automatic text extraction failed');
       }
```

</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 109 - 121, In
SmartScanner.tsx, when mode === 'front' wrap the async OCR block
(extractTextFromImage, extractNationalID, extractName, and extractedData
assignment) with a component/state-driven loading flag (e.g., ocrLoading) so the
UI shows a processing indicator while OCR runs; set ocrLoading=true before
calling extractTextFromImage and false in finally. On failure catch (ocrError)
call your user-facing notification/updater (e.g., setOcrError or toast) instead
of only console.error so the UI displays "Text extraction failed" and
clear/disable the loading indicator; ensure the component renders a visual
status (spinner or message) when ocrLoading is true and displays the ocrError
message when present.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->

✅ Addressed in commits 934f80a to 9db9af3
```


### 4. CodeRabbit - src/components/scanner/SmartScanner.tsx:169

```
_🧹 Nitpick_ | _🔵 Trivial_

**Consider softer error recovery instead of full page reload.**

`window.location.reload()` (line 149) reloads the entire page, which is disruptive and loses application state. For transient errors (e.g., temporary camera issues), consider resetting component state instead.



<details>
<summary>♻️ Proposed alternative</summary>

```diff
       <Alert severity="error" sx={{ mb: 2 }}>
         {error}
-        <Button onClick={() => window.location.reload()}>
+        <Button onClick={() => { setError(null); startCamera(); }}>
           {isArabic ? 'إعادة المحاولة' : 'Retry'}
         </Button>
       </Alert>
```

This resets the error state and restarts the camera without a full page reload. If camera permissions were denied, the browser will re-prompt automatically.

</details>

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
        <Button onClick={() => { setError(null); startCamera(); }}>
          {isArabic ? 'إعادة المحاولة' : 'Retry'}
        </Button>
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 149 - 150, Replace the
disruptive window.location.reload() used in the Button onClick inside
SmartScanner.tsx with logic that clears the component error state and restarts
the scanner/camera flow; locate the Button (uses isArabic for label) and remove
the reload, instead call your existing error-reset and camera-init helpers
(e.g., setError(null), resetScanState(), startCamera()/initScanner()) or add
small functions with those names to re-request permissions and re-initialize the
scanner component so the app state is preserved rather than reloading the whole
page.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 5. CodeRabbit - src/hooks/useSmartScanner.ts:148

```
_⚠️ Potential issue_ | _🟠 Major_

**Add error handling for OpenCV operations and document magic numbers.**

The function has several concerns:

1. **No error handling for OpenCV operations** - OpenCV methods can throw exceptions if given invalid input. The entire detection could fail silently.
2. **Magic numbers lack justification** - The area threshold (5000), aspect ratio range (1.3-1.9), stable frame threshold (10), and timeout (30000ms) are hardcoded without explanation or configuration.
3. **Rapid state updates** - Calling `setState('detecting')` and `setState('locked')` on every frame could cause excessive re-renders.




<details>
<summary>🔧 Proposed fixes</summary>

**1. Add try-catch for OpenCV operations:**

```diff
  function detectIDCard(imageData: ImageData): boolean {
    if (!cvRef.current || level < 2) return false;
    const cv = cvRef.current;
-   const src = cv.matFromImageData(imageData);
-   const gray = new cv.Mat();
-   const edges = new cv.Mat();
-   const contours = new cv.MatVector();
-   const hierarchy = new cv.Mat();

    try {
+     const src = cv.matFromImageData(imageData);
+     const gray = new cv.Mat();
+     const edges = new cv.Mat();
+     const contours = new cv.MatVector();
+     const hierarchy = new cv.Mat();
+     
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.Canny(gray, edges, 50, 150);
      // ... rest of detection logic ...
+   } catch (error) {
+     console.error('[useSmartScanner] OpenCV detection error:', error);
+     setState('error');
+     return false;
    } finally {
      src.delete();
      // ... cleanup ...
    }
  }
```

**2. Extract magic numbers as constants at the top of the file:**

```diff
+// Detection thresholds
+const MIN_CARD_AREA = 5000; // Minimum contour area in pixels
+const EGYPTIAN_ID_ASPECT_RATIO = 1.586; // 85.6mm × 54mm
+const ASPECT_RATIO_TOLERANCE = 0.286; // ±18% tolerance
+const MIN_ASPECT_RATIO = EGYPTIAN_ID_ASPECT_RATIO - ASPECT_RATIO_TOLERANCE; // 1.3
+const MAX_ASPECT_RATIO = EGYPTIAN_ID_ASPECT_RATIO + ASPECT_RATIO_TOLERANCE; // 1.9
+const STABLE_FRAME_THRESHOLD = 10; // Frames needed to lock
+const DETECTION_TIMEOUT = 30000; // 30 seconds max detection time
+
 const OPENCV_CDN_PRIORITY = [
   // ...
 ];
```

Then use them in the detection logic:

```diff
-       if (area > 5000 && aspectRatio > 1.3 && aspectRatio < 1.9) {
+       if (area > MIN_CARD_AREA && 
+           aspectRatio > MIN_ASPECT_RATIO && 
+           aspectRatio < MAX_ASPECT_RATIO) {
          foundCard = true;
          stableFrameCount.current++;
          break;
        }
      }

      if (!foundCard) stableFrameCount.current = 0;

      const elapsedTime = Date.now() - startTimeRef.current;
      
-     // Lock after 10 stable frames or 30 seconds timeout
-     if (stableFrameCount.current >= 10 || elapsedTime > 30000) {
+     // Lock after stable frames or timeout
+     if (stableFrameCount.current >= STABLE_FRAME_THRESHOLD || 
+         elapsedTime > DETECTION_TIMEOUT) {
```

**3. Prevent excessive state updates:**

```diff
+     const prevStateRef = useRef<ScannerState>('loading');
+     
      // Inside detectIDCard:
-     if (foundCard) setState('detecting');
+     if (foundCard && prevStateRef.current !== 'detecting') {
+       setState('detecting');
+       prevStateRef.current = 'detecting';
+     }
      
-     if (stableFrameCount.current >= STABLE_FRAME_THRESHOLD || 
-         elapsedTime > DETECTION_TIMEOUT) {
-       setState('locked');
+     if ((stableFrameCount.current >= STABLE_FRAME_THRESHOLD || 
+          elapsedTime > DETECTION_TIMEOUT) && 
+         prevStateRef.current !== 'locked') {
+       setState('locked');
+       prevStateRef.current = 'locked';
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/hooks/useSmartScanner.ts around lines 89 - 148, detectIDCard currently
runs raw OpenCV calls without error handling, uses hardcoded "magic" numbers,
and calls setState every frame which can cause excess renders; wrap the OpenCV
block inside a try/catch that logs or handles exceptions (using cvRef, src,
contours, etc.), extract thresholds into named constants (e.g., AREA_THRESHOLD,
ASPECT_RATIO_MIN, ASPECT_RATIO_MAX, STABLE_FRAME_THRESHOLD, TIMEOUT_MS) defined
at the top of the module and replace literals (5000, 1.3, 1.9, 10, 30000), and
avoid repeated setState calls by checking the current state before updating
(e.g., only call setState('detecting') if state !== 'detecting' and
setState('locked') once when transitioning, continuing to use
stableFrameCount.current and startTimeRef.current as now but ensuring you reset
or debounce updates to prevent per-frame churn).
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 6. CodeRabbit - src/services/ocr.ts:23

```
_🧹 Nitpick_ | _🔵 Trivial_

**Improve error handling and logging for OCR failures.**

The function returns an empty string when `data.text` is missing, which might mask errors. Additionally, when the fetch fails, the error message is generic and doesn't include response details.



<details>
<summary>♻️ Proposed error handling improvements</summary>

```diff
  export async function extractTextFromImage(imageBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
-     throw new Error('OCR extraction failed');
+     const error = await response.json().catch(() => ({ error: 'Unknown error' }));
+     throw new Error(`OCR extraction failed: ${error.error || response.statusText}`);
    }
    
    const data = await response.json();
+   
+   if (!data.text) {
+     console.warn('[OCR] No text extracted from image');
+   }
+   
    return data.text || '';
  }
```
</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 7. CodeRabbit - src/services/ocr.ts:34

```
_🧹 Nitpick_ | _🔵 Trivial_

**Consider adding Egyptian National ID format validation.**

The function only checks for 14 digits but doesn't validate the Egyptian National ID format. Egyptian IDs encode birth date (7 digits: century + YYMMDD) and governorate codes, which could be validated.




Do you want me to generate a more robust validation function that checks:
- Century digit (2 or 3)
- Valid date format (YYMMDD)
- Governorate code validity
- Optional checksum validation

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/services/ocr.ts around lines 31 - 34, extractNationalID currently only
matches any 14 consecutive digits; update it to validate Egyptian National ID
structure by: ensure the first digit (century) is 2 or 3, parse digits 2–7 as a
valid YYMMDD date (validate month/day ranges and leap years), check the
governorate code (digits 8–9) against the known list of governorate codes, and
optionally validate the final checksum digit using the official algorithm;
return the matched ID only if all validations pass (otherwise return undefined).
Use the existing extractNationalID function as the location to implement these
checks and keep the API the same.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 8. CodeRabbit - src/services/ocr.ts:53

```
_🧹 Nitpick_ | _🔵 Trivial_

**Document or expose configurable thresholds for name extraction.**

The function uses hardcoded values (10 minimum characters, 3 words) and requires Arabic-only text. This might fail for:
- Shorter names (e.g., "علي محمد حسن" is 13 chars with spaces)
- Names with Latin characters or numbers
- Names with hyphens or apostrophes



Consider either:
1. **Documenting the assumptions** in the docstring (e.g., "Assumes names are 10+ Arabic characters with 3+ words")
2. **Making thresholds configurable** via function parameters

<details>
<summary>♻️ Option 1: Document assumptions</summary>

```diff
  /**
   * Extracts name from Arabic text
   * Looks for lines with 3+ Arabic words
+  * 
+  * Assumptions:
+  * - Name contains only Arabic characters and spaces (10+ chars total)
+  * - Name has at least 3 words (typical for Egyptian names)
+  * - Name appears before other text (returns first match)
   * 
   * @param text - OCR extracted text
   * @returns Name string or undefined
   */
```
</details>

<details>
<summary>♻️ Option 2: Configurable thresholds</summary>

```diff
  /**
   * Extracts name from Arabic text
   * Looks for lines with 3+ Arabic words
   * 
   * @param text - OCR extracted text
+  * @param minLength - Minimum character count (default: 10)
+  * @param minWords - Minimum word count (default: 3)
   * @returns Name string or undefined
   */
- export function extractName(text: string): string | undefined {
+ export function extractName(
+   text: string, 
+   minLength = 10, 
+   minWords = 3
+ ): string | undefined {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Find first line with 3+ Arabic words (likely the name)
    const nameMatch = lines.find(line => {
-     const arabicOnly = /^[\u0600-\u06FF\s]{10,}$/;
+     const arabicOnly = new RegExp(`^[\\u0600-\\u06FF\\s]{${minLength},}$`);
      const wordCount = line.split(/\s+/).length;
-     return arabicOnly.test(line) && wordCount >= 3;
+     return arabicOnly.test(line) && wordCount >= minWords;
    });
    
    return nameMatch;
  }
```
</details>

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
/**
 * Extracts name from Arabic text
 * Looks for lines with 3+ Arabic words
 * 
 * Assumptions:
 * - Name contains only Arabic characters and spaces (10+ chars total)
 * - Name has at least 3 words (typical for Egyptian names)
 * - Name appears before other text (returns first match)
 * 
 * @param text - OCR extracted text
 * @returns Name string or undefined
 */
export function extractName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find first line with 3+ Arabic words (likely the name)
  const nameMatch = lines.find(line => {
    const arabicOnly = /^[\u0600-\u06FF\s]{10,}$/;
    const wordCount = line.split(/\s+/).length;
    return arabicOnly.test(line) && wordCount >= 3;
  });
  
  return nameMatch;
}
```

```suggestion
/**
 * Extracts name from Arabic text
 * Looks for lines with 3+ Arabic words
 * 
 * @param text - OCR extracted text
 * @param minLength - Minimum character count (default: 10)
 * @param minWords - Minimum word count (default: 3)
 * @returns Name string or undefined
 */
export function extractName(
  text: string,
  minLength = 10,
  minWords = 3,
): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find first line with 3+ Arabic words (likely the name)
  const nameMatch = lines.find(line => {
    const arabicOnly = new RegExp(`^[\\u0600-\\u06FF\\s]{${minLength},}$`);
    const wordCount = line.split(/\s+/).length;
    return arabicOnly.test(line) && wordCount >= minWords;
  });
  
  return nameMatch;
}
```

</details>

<!-- suggestion_end -->

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 9. CodeRabbit - src/components/scanner/SmartScanner.tsx:37

```
_⚠️ Potential issue_ | _🟠 Major_

**Missing dependency in useEffect may cause stale closure issues.**

The `useEffect` calls `startCamera` which is defined inside the component, but it's not listed in the dependency array. While this mount-only pattern is intentional, `startCamera` captures `videoRef` and calls `processFrames`, which references `isCapturing` and `countdown` state that will be stale in the closure.

Consider using `useCallback` for `startCamera` or moving the camera initialization logic to be more resilient to stale closures.


<details>
<summary>🔧 Recommended fix using refs for mutable state</summary>

```diff
+ const isCapturingRef = useRef(false);
+ const countdownRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Keep refs in sync with state
+ useEffect(() => { isCapturingRef.current = isCapturing; }, [isCapturing]);
+ useEffect(() => { countdownRef.current = countdown; }, [countdown]);
```

Then in `processFrame`, use `isCapturingRef.current` and `countdownRef.current` instead of the state values directly.
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 34 - 37, The useEffect
mounts the camera by calling startCamera which closes over component state
(isCapturing, countdown) leading to stale values in processFrames; fix by making
startCamera stable and having processFrames read mutable refs instead of state:
create isCapturingRef and countdownRef, update those refs wherever isCapturing
or countdown state changes, and change processFrames (and any camera frame loop)
to use isCapturingRef.current and countdownRef.current; alternatively wrap
startCamera in useCallback with appropriate deps so the effect can include it
safely—update references to startCamera, processFrames, isCapturing, and
countdown accordingly.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 10. CodeRabbit - src/components/scanner/SmartScanner.tsx:54

```
_⚠️ Potential issue_ | _🟡 Minor_

**`video.play()` returns a Promise that should be awaited.**

The `play()` method returns a Promise that can reject (e.g., if autoplay is blocked). Also, `processFrames()` is called immediately after `play()` without waiting for the video to actually start, which could cause the first few frames to be empty.

Additionally, the error message is hardcoded in English despite the component supporting Arabic.


<details>
<summary>🔧 Proposed fix</summary>

```diff
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
-       videoRef.current.play();
-       processFrames();
+       await videoRef.current.play();
+       videoRef.current.onloadedmetadata = () => processFrames();
      }
    } catch (err) {
-     setError('Camera access denied');
+     setError(isArabic ? 'تم رفض الوصول إلى الكاميرا' : 'Camera access denied');
    }
  }
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 42 - 54, In
startCamera, await the Promise returned by videoRef.current.play() and handle
rejections so autoplay blocks don’t break startup; move the call to
processFrames() to after a successful await of videoRef.current.play() (and wrap
that await in a try/catch to call setError on failure), and replace the
hardcoded English error string in setError('Camera access denied') with the
component’s localization mechanism (e.g., use the i18n/translation function or a
localized prop) so the error message is shown in Arabic when appropriate; refer
to startCamera, videoRef, processFrames, and setError when applying these
changes.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 11. CodeRabbit - src/components/scanner/SmartScanner.tsx:162

```
_⚠️ Potential issue_ | _🟡 Minor_

**Manual capture button can be clicked multiple times during processing.**

There's no guard preventing multiple clicks on the manual capture button while a capture is already in progress. This could lead to multiple simultaneous OCR requests.


<details>
<summary>🔧 Proposed fix</summary>

```diff
  function manualCapture() {
+   if (isCapturing) return;
+   setIsCapturing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => { 
-     if (blob) await handleCapture(blob); 
+     if (blob) {
+       await handleCapture(blob);
+       setIsCapturing(false);
+     }
    }, 'image/jpeg', 0.9);
  }
```

And update the button (line 243):
```diff
- <Button onClick={manualCapture} variant="outlined" sx={{ mt: 1 }}>
+ <Button onClick={manualCapture} variant="outlined" sx={{ mt: 1 }} disabled={isCapturing}>
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 156 - 162, Add a
capture-in-progress guard: introduce a boolean state (e.g., isCapturing /
captureInProgress) and in manualCapture() check it at the start and return early
if true; set it true immediately before calling canvas.toBlob and only clear it
after the async handleCapture(blob) completes or fails (use try/finally to
ensure reset). Update the manual capture button to be disabled (and/or visually
indicate busy) while this flag is true so users cannot click again during
processing; reference manualCapture, canvasRef, and handleCapture when making
these changes.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 12. CodeRabbit - src/components/scanner/SmartScanner.tsx:173

```
_🧹 Nitpick_ | _🔵 Trivial_

**Consider retry logic instead of full page reload.**

Using `window.location.reload()` loses all component state. A more user-friendly approach would retry camera initialization directly.


<details>
<summary>♻️ Optional improvement</summary>

```diff
+ const [retryCount, setRetryCount] = useState(0);
+
+ useEffect(() => {
+   setError(null);
+   startCamera();
+   return () => stopCamera();
+ }, [retryCount]);

  // In error render:
- <Button onClick={() => window.location.reload()}>
+ <Button onClick={() => setRetryCount(c => c + 1)}>
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 164 - 173, The current
error UI calls window.location.reload() which discards component state; instead,
implement a retry that resets the error and re-runs the scanner init logic:
locate the error rendering branch in SmartScanner (the if (error) block and the
Button onClick) and replace the reload with a call to an existing init function
(e.g., initializeCamera, startScanner, or startVideoStream) or create a retry
handler that does setError(null), resets any relevant state (loading flags,
device selection) and then calls that init function; ensure the retry handler
also re-applies any permissions/device checks and cleans up previous streams if
present so retry behaves like a fresh init without reloading the page.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 13. CodeRabbit - src/components/scanner/SmartScanner.tsx:233

```
_🧹 Nitpick_ | _🔵 Trivial_

**Add accessibility attributes and `muted` for autoplay compatibility.**

The static analysis hint about captions is a false positive for live camera feeds. However, the video element should have accessibility attributes and `muted` to ensure autoplay works across browsers.


<details>
<summary>♻️ Proposed fix</summary>

```diff
  <video 
    ref={videoRef} 
+   muted
+   aria-label={isArabic ? 'معاينة الكاميرا لمسح البطاقة' : 'Camera preview for ID card scanning'}
    style={{ 
      width: '100%', 
      display: state === 'loading' ? 'none' : 'block',
      borderRadius: '8px',
      border: state === 'detecting' ? '3px solid #4caf50' : '1px solid #ccc'
    }} 
    playsInline 
  />
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/scanner/SmartScanner.tsx around lines 224 - 233, The video
element in SmartScanner.tsx (the JSX using videoRef and state) needs
accessibility attributes and the muted attribute for reliable autoplay; update
the <video> rendered by the SmartScanner component to include muted, an
accessible label (e.g., aria-label="Live camera preview" or title), and an
appropriate role (e.g., role="img" or aria-live if you need screen reader
announcements) while keeping playsInline and the existing style logic based on
state (e.g., 'loading'/'detecting'); ensure these attributes are added where
videoRef is referenced so autoplay and accessibility are handled together.
```

</details>

<!-- fingerprinting:phantom:medusa:ocelot -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## Next Steps

1. **Fix CRITICAL issues** (3 found) - Block merge until resolved
2. **Fix HIGH issues** (3 found) - Fix if <5 min each, otherwise document
3. **Document MEDIUM/LOW** (16 found) - Create follow-up issues

**Generated by**: `pnpm run pr:scrape 58`
