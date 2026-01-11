# PR #59 Review Analysis

**Generated**: 2026-01-11T20:29:49.607Z  
**Total Issues**: 10  
**Breakdown**: 1 CRITICAL, 1 HIGH, 3 MEDIUM, 5 LOW

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| CRITICAL | 1 | Fix immediately before merge |
| HIGH | 1 | Fix if <5 min each |
| MEDIUM | 3 | Document for later |
| LOW | 5 | Optional (style/formatting) |

---

## CRITICAL Issues (1)


### 1. CodeRabbit - src/components/booking/ReservationForm.tsx:170

```
_⚠️ Potential issue_ | _🔴 Critical_

**Implement required image fallback system.**

The `CardMedia` component directly uses `selectedVehicle.image` without the established image fallback pattern. This violates project learnings and could cause image loading failures, performance issues, and infinite loops on error.


Based on learnings, vehicle images must use:
1. `getVehicleImage()` helper function
2. `srcSet` attribute for 2x/3x responsive images
3. `onError` handler to prevent infinite loops
4. Lazy loading

<details>
<summary>🖼️ Proposed fix to implement image fallback system</summary>

First, ensure the `getVehicleImage()` helper is imported (add to imports if not present):

```typescript
import { getVehicleImage } from '@/lib/utils/image';
```

Then update the CardMedia implementation:

```diff
               {selectedVehicle.image && (
                 <CardMedia
                   component="img"
                   sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, mr: 2 }}
-                  image={selectedVehicle.image}
+                  image={getVehicleImage(selectedVehicle.image)}
+                  srcSet={`${getVehicleImage(selectedVehicle.image)} 1x, ${getVehicleImage(selectedVehicle.image, '2x')} 2x, ${getVehicleImage(selectedVehicle.image, '3x')} 3x`}
+                  loading="lazy"
+                  onError={(e) => {
+                    const target = e.target as HTMLImageElement;
+                    if (target.src !== getVehicleImage()) {
+                      target.src = getVehicleImage(); // fallback to default
+                    }
+                  }}
                   alt={selectedVehicle.name}
                 />
               )}
```

Note: Adjust the `getVehicleImage()` helper signature based on your actual implementation.
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/booking/ReservationForm.tsx around lines 162 - 169, The
CardMedia currently uses selectedVehicle.image directly; replace it with the
project's image fallback pattern by importing and using
getVehicleImage(selectedVehicle) to supply image src and srcSet (2x/3x), add
loading="lazy" and an onError handler that swaps to the fallback returned by
getVehicleImage and prevents infinite loops (e.g., check current src before
replacing), and apply these props to the CardMedia component that renders the
selectedVehicle image.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## HIGH Issues (1)


### 1. Sourcery - src/components/booking/ReservationForm.tsx:169

```
**issue (bug_risk):** When the initialVehicleId is not found in the fetched list, users are left without any vehicle UI or a way to select one.

Because `selectedVehicle` stays null when no fetched vehicle matches `initialVehicleId`, the "Selected Vehicle" card never renders. And since the selector is hidden whenever `initialVehicleId` is truthy, the user is left with no vehicle shown and no way to pick one. You could instead render the selector when no matching vehicle is found (e.g., track a "no match" state and treat it like `initialVehicleId` was not provided).
```


---

## MEDIUM Issues (3)


### 1. SonarCloud

```
## [![Quality Gate Passed](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/checks/QualityGateBadge/qg-passed-20px.png 'Quality Gate Passed')](https://sonarcloud.io/dashboard?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59) **Quality Gate passed**  
Issues  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0 New issues](https://sonarcloud.io/project/issues?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true)  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/accepted-16px.png '') [0 Accepted issues](https://sonarcloud.io/project/issues?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59&issueStatuses=ACCEPTED)

Measures  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0 Security Hotspots](https://sonarcloud.io/project/security_hotspots?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true)  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0.0% Coverage on New Code](https://sonarcloud.io/component_measures?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59&metric=new_coverage&view=list)  
![](https://sonarsource.github.io/sonarcloud-github-static-resources/v2/common/passed-16px.png '') [0.0% Duplication on New Code](https://sonarcloud.io/component_measures?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59&metric=new_duplicated_lines_density&view=list)  
  
[See analysis details on SonarQube Cloud](https://sonarcloud.io/dashboard?id=Hex-Tech-Lab_hex-test-drive-man&pullRequest=59)


```


### 2. CodeRabbit - src/components/booking/ReservationForm.tsx:63

```
_🛠️ Refactor suggestion_ | _🟠 Major_

**Use canonical Vehicle type from types file.**

The state declarations use inline types instead of the canonical `Vehicle` type from `src/types/vehicle.ts`. This creates type inconsistency across the codebase.


Based on learnings, vehicle types should be imported from the canonical types file.

<details>
<summary>♻️ Proposed fix to use canonical types</summary>

Add import at the top of the file:

```diff
 import type { TimeSlot } from '@/types/reservation';
+import type { Vehicle } from '@/types/vehicle';
```

Then update the state declarations:

```diff
-  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string; image?: string }>>([]);
-  const [selectedVehicle, setSelectedVehicle] = useState<{ id: string; name: string; image?: string } | null>(null);
+  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
+  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
```
</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/booking/ReservationForm.tsx around lines 61 - 62, The
component is using inline vehicle types for vehicles and selectedVehicle; import
and use the canonical Vehicle type from src/types/vehicle.ts instead of inline
definitions to ensure consistency. Update the top of ReservationForm.tsx to
import { Vehicle } and change the state declarations for vehicles
(useState<Array<Vehicle>>) and selectedVehicle (useState<Vehicle | null>) so
they reference the Vehicle type rather than the inline shape.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 3. CodeRabbit - src/components/booking/ReservationForm.tsx:82

```
_⚠️ Potential issue_ | _🟡 Minor_

**Replace `any` type with proper typing.**

Line 77 uses `(v: any)` which bypasses TypeScript's type safety. This violates strict mode guidelines.


<details>
<summary>🔧 Proposed fix to use proper typing</summary>

```diff
         // If initialVehicleId provided, find and set the vehicle
         if (initialVehicleId) {
-          const vehicle = (data.vehicles || []).find((v: any) => v.id === initialVehicleId);
+          const vehicle = (data.vehicles || []).find((v) => v.id === initialVehicleId);
           if (vehicle) {
             setSelectedVehicle(vehicle);
           }
```

The type will be inferred from the `vehicles` state type (or from the canonical `Vehicle` type once refactored).
</details>

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
        
        // If initialVehicleId provided, find and set the vehicle
        if (initialVehicleId) {
          const vehicle = (data.vehicles || []).find((v) => v.id === initialVehicleId);
          if (vehicle) {
            setSelectedVehicle(vehicle);
          }
        }
```

</details>

<!-- suggestion_end -->

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/booking/ReservationForm.tsx around lines 74 - 81, The find
callback is using an unsafe any cast; update the search to use the proper
vehicle type instead of (v: any) — e.g. use the project's Vehicle interface (or
the inferred type of data.vehicles) in the callback so the line becomes (v:
Vehicle) => v.id === initialVehicleId; keep the surrounding logic
(initialVehicleId check, data.vehicles access, and setSelectedVehicle) unchanged
and ensure Vehicle is imported or the correct type alias is referenced where
ReservationForm.tsx defines selectedVehicle/setSelectedVehicle.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## LOW Issues (5)


### 1. Sourcery

```
<!-- Generated by sourcery-ai[bot]: start review_guide -->

## Reviewer's Guide

Updates the ReservationForm to hide the vehicle dropdown when a vehicle is pre-selected, instead showing a card with the selected vehicle’s image and name populated from the vehicles API, while preserving the dropdown for bookings without an initial vehicle context.

#### Sequence diagram for ReservationForm behavior with and without initialVehicleId

```mermaid
sequenceDiagram
  actor User
  participant CatalogPage
  participant NavMenu
  participant ReservationForm
  participant VehiclesAPI as Api_vehicles

  rect rgb(230,230,250)
    User->>CatalogPage: Click BookTestDrive
    CatalogPage->>ReservationForm: Mount with initialVehicleId
  end

  rect rgb(220,255,220)
    ReservationForm->>Api_vehicles: GET /api/vehicles
    Api_vehicles-->>ReservationForm: vehicles[id, name, image]
    ReservationForm->>ReservationForm: setVehicles
    alt initialVehicleId provided
      ReservationForm->>ReservationForm: find vehicle by initialVehicleId
      ReservationForm->>ReservationForm: setSelectedVehicle
      ReservationForm-->>User: Render SelectedVehicleCard (image + name)
    else no initialVehicleId
      ReservationForm-->>User: Render VehicleDropdown with all vehicles
    end
  end

  rect rgb(255,250,205)
    User->>NavMenu: Click BookTestDrive
    NavMenu->>ReservationForm: Mount without initialVehicleId
    ReservationForm->>Api_vehicles: GET /api/vehicles
    Api_vehicles-->>ReservationForm: vehicles[id, name, image]
    ReservationForm->>ReservationForm: setVehicles
    ReservationForm-->>User: Render VehicleDropdown
  end
```

#### Updated class diagram for ReservationForm component state and props

```mermaid
classDiagram
  class ReservationFormProps {
    +string language
    +string? vehicleId
    +Date initialDate
    +function onSubmit
  }

  class ReservationForm {
    +ReservationFormProps props
    +TimeSlot[] timeSlots
    +boolean loading
    +string error
    +Vehicle[] vehicles
    +Vehicle selectedVehicle
    +boolean isArabic
    +useEffect_fetchVehicles(initialVehicleId)
    +useEffect_fetchTimeSlots(selectedVehicleId, selectedDate)
    +renderForm()
  }

  class Vehicle {
    +string id
    +string name
    +string image
  }

  ReservationFormProps <.. ReservationForm : uses
  ReservationForm "1" --> "*" Vehicle : manages
```

### File-Level Changes

| Change | Details | Files |
| ------ | ------- | ----- |
| Add support for selected vehicle details including optional image fetched from the vehicles API. | <ul><li>Extend vehicles state items to include an optional image field in addition to id and name.</li><li>Introduce selectedVehicle state to hold the currently chosen vehicle’s full details.</li><li>After fetching vehicles, if an initial vehicle ID is provided, locate the matching vehicle in the response and set it as selectedVehicle.</li><li>Update the vehicles-fetching effect dependency to react to changes in the initial vehicle ID.</li></ul> | `src/components/booking/ReservationForm.tsx` |
| Conditionally render either a selected vehicle card or the vehicle dropdown based on whether a vehicle is pre-selected. | <ul><li>Render a Card showing the selected vehicle’s image (if available), label text (localized), and name with an icon when initialVehicleId and selectedVehicle are present.</li><li>Restrict the vehicle dropdown to only render when there is no initialVehicleId and vehicles have been loaded.</li><li>Clarify component documentation comments to describe the new behavior when a vehicleId is provided.</li><li>Update the file header metadata to record the new change.</li></ul> | `src/components/booking/ReservationForm.tsx` |

---

<details>
<summary>Tips and commands</summary>

#### Interacting with Sourcery

- **Trigger a new review:** Comment `@sourcery-ai review` on the pull request.
- **Continue discussions:** Reply directly to Sourcery's review comments.
- **Generate a GitHub issue from a review comment:** Ask Sourcery to create an
  issue from a review comment by replying to it. You can also reply to a
  review comment with `@sourcery-ai issue` to create an issue from it.
- **Generate a pull request title:** Write `@sourcery-ai` anywhere in the pull
  request title to generate a title at any time. You can also comment
  `@sourcery-ai title` on the pull request to (re-)generate the title at any time.
- **Generate a pull request summary:** Write `@sourcery-ai summary` anywhere in
  the pull request body to generate a PR summary at any time exactly where you
  want it. You can also comment `@sourcery-ai summary` on the pull request to
  (re-)generate the summary at any time.
- **Generate reviewer's guide:** Comment `@sourcery-ai guide` on the pull
  request to (re-)generate the reviewer's guide at any time.
- **Resolve all Sourcery comments:** Comment `@sourcery-ai resolve` on the
  pull request to resolve all Sourcery comments. Useful if you've already
  addressed all the comments and don't want to see them anymore.
- **Dismiss all Sourcery reviews:** Comment `@sourcery-ai dismiss` on the pull
  request to dismiss all existing Sourcery reviews. Especially useful if you
  want to start fresh with a new review - don't forget to comment
  `@sourcery-ai review` to trigger a new review!

#### Customizing Your Experience

Access your [dashboard](https://app.sourcery.ai) to:
- Enable or disable review features such as the Sourcery-generated pull request
  summary, the reviewer's guide, and others.
- Change the review language.
- Add, remove or edit custom review instructions.
- Adjust other review settings.

#### Getting Help

- [Contact our support team](mailto:support@sourcery.ai) for questions or feedback.
- Visit our [documentation](https://docs.sourcery.ai) for detailed guides and information.
- Keep in touch with the Sourcery team by following us on [X/Twitter](https://x.com/SourceryAI), [LinkedIn](https://www.linkedin.com/company/sourcery-ai/) or [GitHub](https://github.com/sourcery-ai).

</details>

<!-- Generated by sourcery-ai[bot]: end review_guide -->
```


### 2. CodeRabbit

```
<!-- This is an auto-generated comment: summarize by coderabbit.ai -->
<!-- walkthrough_start -->

## Walkthrough

The ReservationForm now supports a pre-selected vehicle display when a `vehicleId` prop is provided. Vehicle objects may include an optional `image` field; the component fetches vehicles, sets `selectedVehicle` when an initial id exists, and conditionally renders a vehicle Card (with image) or the existing dropdown selector.

## Changes

| Cohort / File(s) | Summary |
|---|---|
| **Vehicle Selection UI Enhancement** <br> `src/components/booking/ReservationForm.tsx` | Add optional `image` on vehicle items and a `selectedVehicle` state. On mount, fetch vehicles and pre-select when `initialVehicleId` (aliased from `vehicleId`) is provided. Render a Card with `CardMedia` and localized "Selected Vehicle" label when pre-selected; otherwise render the vehicle dropdown selector. Minor text localization for Arabic included. |

## Estimated code review effort

🎯 3 (Moderate) | ⏱️ ~20 minutes

<!-- walkthrough_end -->


<!-- pre_merge_checks_walkthrough_start -->

<details>
<summary>🚥 Pre-merge checks | ✅ 3</summary>

<details>
<summary>✅ Passed checks (3 passed)</summary>

|     Check name     | Status   | Explanation                                                                                                                                                         |
| :----------------: | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  Description Check | ✅ Passed | Check skipped - CodeRabbit’s high-level summary is enabled.                                                                                                         |
|     Title check    | ✅ Passed | The title accurately captures the main change: hiding the vehicle dropdown when a vehicle is pre-selected and adding vehicle image display to the reservation form. |
| Docstring Coverage | ✅ Passed | Docstring coverage is 100.00% which is sufficient. The required threshold is 80.00%.                                                                                |

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
- [ ] <!-- {"checkboxId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "radioGroupId": "utg-output-choice-group-unknown_comment_id"} -->   Commit unit tests in branch `kwsl/fix-booking-dropdown-with-image`

</details>

</details>

<!-- finishing_touch_checkbox_end -->

<!-- tips_start -->

---

Thanks for using [CodeRabbit](https://coderabbit.ai?utm_source=oss&utm_medium=github&utm_campaign=Hex-Tech-Lab/hex-test-drive-man&utm_content=59)! It's free for OSS, and your support helps us grow. If you like it, consider giving us a shout-out.

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


### 3. Sourcery - src/components/booking/ReservationForm.tsx:82

```
**suggestion:** Avoid using `any` for the vehicle type in the `find` call and reuse the existing vehicle type instead.

Since `vehicles` is already typed as `{ id: string; name: string; image?: string }`, use that type instead of `(v: any)`—either by inferring from `data.vehicles` or reusing the same type alias. This preserves type safety and lets TypeScript catch future changes to the vehicle shape.

```suggestion
        // If initialVehicleId provided, find and set the vehicle
        if (initialVehicleId) {
          const vehicle = (data.vehicles || []).find(
            (v: { id: string; name: string; image?: string }) => v.id === initialVehicleId
          );
          if (vehicle) {
            setSelectedVehicle(vehicle);
          }
        }
```
```


### 4. CodeRabbit - src/components/booking/ReservationForm.tsx:185

```
_⚠️ Potential issue_ | _🟠 Major_

**Handle case when pre-selected vehicle is not found.**

If `initialVehicleId` is provided but the vehicle is not found in the API response, neither the vehicle card nor the dropdown will render, leaving users unable to proceed.


<details>
<summary>🛡️ Proposed fix to add error handling</summary>

Add state to track if vehicle fetch failed:

```diff
   const [selectedVehicle, setSelectedVehicle] = useState<{ id: string; name: string; image?: string } | null>(null);
+  const [vehicleNotFound, setVehicleNotFound] = useState(false);
```

Update the vehicle fetch logic:

```diff
         // If initialVehicleId provided, find and set the vehicle
         if (initialVehicleId) {
           const vehicle = (data.vehicles || []).find((v: any) => v.id === initialVehicleId);
           if (vehicle) {
             setSelectedVehicle(vehicle);
+          } else {
+            setVehicleNotFound(true);
           }
         }
```

Add error message in JSX before the vehicle card:

```diff
         )}

+        {/* Vehicle not found error */}
+        {initialVehicleId && vehicleNotFound && (
+          <Alert severity="warning" sx={{ mb: 2 }}>
+            {isArabic 
+              ? 'السيارة المحددة غير متاحة. يرجى اختيار سيارة أخرى.' 
+              : 'Selected vehicle not available. Please choose another vehicle.'}
+          </Alert>
+        )}
+
         {/* Vehicle Image + Name (when pre-selected from catalog) */}
```

Update dropdown condition to show when vehicle not found:

```diff
-        {!initialVehicleId && vehicles.length > 0 && (
+        {(!initialVehicleId || vehicleNotFound) && vehicles.length > 0 && (
```
</details>


> Committable suggestion skipped: line range outside the PR's diff.

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
```


### 5. CodeRabbit - src/components/booking/ReservationForm.tsx:182

```
_⚠️ Potential issue_ | _🟡 Minor_

<details>
<summary>🧩 Analysis chain</summary>

🏁 Script executed:

```shell
# Find getVehicleImage helper function
rg -t ts -t tsx "export.*getVehicleImage|function\s+getVehicleImage" -A 15
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 102

---

🏁 Script executed:

```shell
# Search for how getVehicleImage is currently used in codebase
rg -t ts -t tsx "getVehicleImage" -B 2 -A 2
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 102

---

🏁 Script executed:

```shell
# Check the ReservationForm.tsx file in full to understand the context
wc -l src/components/booking/ReservationForm.tsx
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 121

---

🏁 Script executed:

```shell
# Find getVehicleImage without type restriction
rg "export.*getVehicleImage|function\s+getVehicleImage" -A 15
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 2141

---

🏁 Script executed:

```shell
# View the ReservationForm.tsx around the flagged lines
sed -n '150,190p' src/components/booking/ReservationForm.tsx
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 1720

---

🏁 Script executed:

```shell
# Search for existing onError patterns in components
rg "onError.*=>" --max-count 10 -B 2 -A 4
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 1564

---

🏁 Script executed:

```shell
# Check the line lengths in proposed onError handler
python3 << 'EOF'
lines = [
'                onError={(e) => {',
'                  const img = e.currentTarget;',
'                  if (img.dataset.fallbackApplied) return;',
'                  img.dataset.fallbackApplied = \'1\';',
'                  img.src = getVehicleImage(null);',
'                }}',
]
for i, line in enumerate(lines, 1):
    # Count actual characters (not indentation spaces count as per guidelines)
    content = line.rstrip()
    print(f"Line {i}: {len(content)} chars | {content}")
EOF
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 161

---

🏁 Script executed:

```shell
# Check PLACEHOLDER_IMAGE constant definition
rg "PLACEHOLDER_IMAGE\s*=" -A 2 src/lib/imageHelper.ts
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 290

---

🏁 Script executed:

```shell
# View full imageHelper.ts to understand all image helpers
cat -n src/lib/imageHelper.ts | head -50
```

Repository: Hex-Tech-Lab/hex-test-drive-man

Length of output: 2352

---



</details>

**Add onError fallback and always render the image element to prevent gaps in the "Selected Vehicle" card.**

The card currently hides the image area when `selectedVehicle.image` is missing or falsy. Removing the conditional is safe because `getVehicleImage()` handles null/undefined by returning the placeholder image (`/images/vehicles/hero/placeholder.webp`). However, the proposed `onError` handler is missing the TypeScript type annotation required by strict mode. Use `React.SyntheticEvent<HTMLImageElement>` to match the existing pattern in `VehicleCard.tsx` and `compare/page.tsx`. Also, align the fallback detection with the established codebase pattern: check `if (!img.src.includes('/images/vehicles/hero/placeholder'))` rather than using a dataset flag, for consistency.

<details>
<summary>Corrected approach</summary>

```diff
              <CardMedia
                component="img"
                sx={{
                  width: 120,
                  height: 80,
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: 1,
                  mr: 2,
                }}
                image={getVehicleImage(selectedVehicle.image)}
                alt={selectedVehicle.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const img = e.currentTarget;
                  if (!img.src.includes('/images/vehicles/hero/placeholder')) {
                    img.src = getVehicleImage(null);
                  }
                }}
              />
```
</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In @src/components/booking/ReservationForm.tsx around lines 159 - 182, The
Selected Vehicle card conditionally omits the image when selectedVehicle.image
is falsy, causing layout gaps; always render the img using
getVehicleImage(selectedVehicle.image) and add an onError handler typed as
React.SyntheticEvent<HTMLImageElement> (matching VehicleCard.tsx and
compare/page.tsx) that replaces the broken src with the placeholder only if the
current src does not already include '/images/vehicles/hero/placeholder' to
avoid infinite loops; remove the conditional around the CardMedia and implement
this typed onError fallback.
```

</details>

<!-- This is an auto-generated comment by CodeRabbit -->
```


---

## Next Steps

1. **Fix CRITICAL issues** (1 found) - Block merge until resolved
2. **Fix HIGH issues** (1 found) - Fix if <5 min each, otherwise document
3. **Document MEDIUM/LOW** (8 found) - Create follow-up issues

**Generated by**: `pnpm run pr:scrape 59`
