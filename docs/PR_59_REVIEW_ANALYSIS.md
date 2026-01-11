# PR #59 Review Analysis

**Generated**: 2026-01-11T15:00:36.684Z  
**Total Issues**: 9  
**Breakdown**: 1 CRITICAL, 2 HIGH, 3 MEDIUM, 3 LOW

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| CRITICAL | 1 | Fix immediately before merge |
| HIGH | 2 | Fix if <5 min each |
| MEDIUM | 3 | Document for later |
| LOW | 3 | Optional (style/formatting) |

---

## CRITICAL Issues (1)


### 1. CodeRabbit - src/components/booking/ReservationForm.tsx:169

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

## HIGH Issues (2)


### 1. CodeRabbit

```
<!-- This is an auto-generated comment: summarize by coderabbit.ai -->
<!-- walkthrough_start -->

## Walkthrough

The ReservationForm component now supports displaying a pre-selected vehicle when a vehicleId is provided via props. Vehicle data is extended to include an optional image field, and conditional rendering shows either a vehicle card display or a dropdown selector based on whether an initial vehicle is specified.

## Changes

| Cohort / File(s) | Summary |
|---|---|
| **Vehicle Selection UI Enhancement** <br> `src/components/booking/ReservationForm.tsx` | Added vehicle image support with optional image field in vehicle data shape. Introduces selectedVehicle state to pre-select vehicles when initialVehicleId is provided. Replaces dropdown with Card display (including CardMedia for images) when vehicle is pre-selected; otherwise renders vehicle selector. Updated text labels for selected vehicle display with language-aware support (English and Arabic). |

## Estimated code review effort

🎯 3 (Moderate) | ⏱️ ~20 minutes

<!-- walkthrough_end -->


<!-- pre_merge_checks_walkthrough_start -->

<details>
<summary>🚥 Pre-merge checks | ✅ 3</summary>

<details>
<summary>✅ Passed checks (3 passed)</summary>

|     Check name     | Status   | Explanation                                                                                                                                                       |
| :----------------: | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  Description Check | ✅ Passed | Check skipped - CodeRabbit’s high-level summary is enabled.                                                                                                       |
|     Title check    | ✅ Passed | The title accurately describes the main changes: hiding the vehicle dropdown when a vehicle is pre-selected and adding vehicle image support to the booking form. |
| Docstring Coverage | ✅ Passed | Docstring coverage is 100.00% which is sufficient. The required threshold is 80.00%.                                                                              |

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


<!-- DwQgtGAEAqAWCWBnSTIEMB26CuAXA9mAOYCmGJATmriQCaQDG+Ats2bgFyQAOFk+AIwBWJBrngA3EsgEBPRvlqU0AgfFwA6NPEgQAfACgjoCEYDEZyAAUASpETZWaCrKPR1AGxJcAZvAAeABQC+PgA1vAYRACUXAhKkLQU+Ny0+ADuWOmwZJBSCAxePBQkYIgkXmJ0kADU6LT08MxopAYAco4ClFwArACcBgCqNgAycbi43IgcAPQzROqw2AIaTMwzABIk/mDQorBgIyozOTs0iLhgSZKlzRgz3NgeHjP9Q+UUXHsMsBuy3CQABpWAwAZXw2AoDBIkAEVAwPy4YXSiBefh2IXCkSIV2SqQyGDA6UWYCaLRIBmgzlIuFh8MRkGakTBuGo2Gm/ABGAMAGEStRqtQuAAmAAMwoAbGBRQBGaV9aAymUcYXKsUALSMABFpAwKPBuOJ8BgOAYoFZkgIvMwuAB1HJYdmUZCFeAMMKQABEACFQh69hdIFr9VJPZAfMlmOg8iQCkUGNQ0B58EQUDQo4ESBoiBoADSQNpIRCYSCg7AYDCyaL53A5WF+7Hh/AUKOIWAZZBoRJ4tKZSDE2voZ6QAB+PVFopjcekKAwFxIaHo+B8kFrMMiNAwSnovFK5UqNHo+TdXg0ZtL+A8eHgxtNkF0kA28ASa6nJ5hSRSvayDvQWEi6jwEmABqsbvgAkjueIoMgvD4BIz50Ge95QAAgg00bHoU67NKQjDOPQtbUIkSDcB4aCyMgr77qIh5vthADkyAYGgbB/ju7YEMhD4AKJzpCMKvp++J9saHjyGg3AAs4yDZLkmIRFEMH2KyFB0QO7Z4JhYHYQoGA0P4tKZtmebhpGq51ixEiMmQ2DRNxUAAGIkLgPz0UUSisvAHjIIEkSFNgtCNmSpDRGZLCQDMknwDMWFeFR+A8CkTwChZMIJhQtBnlAwFINgSaMLAmCkNMBgoZA3okD4zbeN2X4Ev2iyQOOop1BlyAkFIP65GsjYRhFXaIACDDwH4DDuTC3Dkg5kCoT4NCfPhmX2O2xJKdRFS0dUcU4eS7GQCxbAANwHYlwnfv2v4AeIIE6V4kHKbu5T6dlMDSOISkAhQ1UtnQd4Pm0aAIUQqX9VGO34ayyapoASYRer64RvYGwY3J6XBSPqPjyBgZ09g1mBHnd6UEStBIzaCqm0gpfXmVZNkYNg6OUKN8jnfjUkLhQslNUmHgTYgM2gZj8gQyFMLJouLrNiUYjiYLzN+NUkT1oOfFEB4SCwPtqFUGoDCvY53kzj8xV/WVD6IFCMxrNwxrsIgMzU1EMw2NIlASNQN4YI5zbMBouCIP4XA1AALAAzJFug9JAGvkMggAoBPU272JtVS0KB04qQK+aLsnPIkzbdv6U2fBiyRQ3kbIOdbnpQVGixfMlFuzNKV0uDpCQuRs32BMTUtWXnq75GHlwhv+DOToUGAJS22p1RO6m3dYAI2CpoE5y0uUiCIF7kBipK0pyqKfT2ZAruIJeUjIGYADa4GgqCgw8QA+m0gwALLejxNgALpnmaYBDAGBMFAMgS4VxoDwIQUg5AqB0TWGwfSXBeD8GELRG4Mh5BMCULrNQmhtC6EAcA8AUA4CoFQCWSBBBiBkGUPAlgiDOCQCoOkewjhmguFhFgxQyhVDqC0DofQRhiGmAMJbBg1sWC23IPpB2C8XZuwoB7euPsWz+0DqaT0WiDAWFmuBGhsCBT0AcE4Thy5Cqm0QEYNCDRkCi1wjCBwUlmy0l7ruMoqdDxgAhkFCuFFLq5C7DtB6qA4IIWTghLscEpgaEgOBfSyRaDYGhMgGiacM7vizjQfaTccGdkgPnZaGlOT1wKmXXuh11xzhoIufgK5Xw+Lxn2ZWRFaQJnKK9HihkwF2KJokRMK1JKCUSv5K8CQSwpFKXzMuisPC0BOjtVJrJsk41Ybgf41RinPnzJU/MYsAD8BsXI/BnIs9i+Y5L/gwIBW604QmwRKM9XA+Z3FpIDmlBQFBHnSKCkpUWWALipUCG8ugGTsL2XPO4NgZRky0h8MchASlVmJBIFyWgyBjSzhuR4MF916CBEiZAbAqQjFYpujiomD0ipbljjEewiVXmeO2kTZAkQfBXjINCMlQE+a0AGRLAeUBXZkTQCklFPhIEeFpI0+qfZilRJKB4g8zLM6+JFfIS5E17nFHgoheZ/A1wUGJOUfMXQioIWbMwkgTI5yrkSrkyg2lM5vObK9dC6KCkk17oU2g786BARQMwWe7ze5MC+dIH5jZBjgUZM4MIxKS4fMZcqwmqrSKVxOsweCM4l5WubvqVuYEa5dnIKwpgW5ALGlevE3AiTkkzmujy3FJBIJgDQOkZwMIHUFqIFwNsHZoygiZfQZt/cAlXOxc27V5RcAnXiDODaB5LUtKKpvaELF9T4Feu/SIlryJRHyqQNtHaSirm2LSYlfLzh2rYc4tS5d1WNkADgEQ6U2QGbYAXAIY4qAqPtJ9gByMEACJggBmMEAFJg/7ACMYIASjBIBAcAKJggA6MEAFRgkGoNfuVjrFQboTolC8ra7YSAPqLwFDMcQbE3m73ZRkf+wjzTLA1uNHeRAWK4AEhyNoiUTZRGGR88+7tPbGlUVGQuMjcCAEwCDq/hg3VCYyxgS/BS7vMeFaN0s4FoSuhLEuAk1oLBMaEs7yfNRXQkNHQU1WlXzYKqQtBu4khxAS3mmG9jbbkQX1TjSA57KAN1mlYGNXG8KoG2LbcogqCwkFYRubzBVAXZN7t2xscJMAnOQGkU6ripWOuCy46o6yAQyBILIY0jR9LRd5QMtsQzICBFzkrBx4Z4AVEIolUW6ZOzFoOhFlOKbR2xZIBC4BMwgo+B8M/Agz8TEcPgAALxIEAkYkRjbUtILQYO4cZhgB6EYHiFwyT0ISCUBCXWqo/SYX6oKjgDBaM9NYohIjQE13MVQ6BtC4HVAQewLgLC2GmPkHIBQOCVB4IEYQwwICFCsHUM/Z8iBn6Hcax3WgE3Kag+MCQxIAgei0BlGgCUwoSAAHZtwAA4ZQkFVLQTHBOZQE8xzKCUeO+hhwEMKMOYpaAE67EI+7EPmBQ5h3DzqCO6DPzAaj8Hu5n5sAoKQZ+Jz3Sw8Bfe7nABvc2nokC2G9Mmd0dAeQMPYFYfA85aBo3DEmE16v+1PFoNr/A7pbBm4lT5EguZ1dIAAPIY31A0MgTuLeu/V0FWgNhyxantxTHtiAeQ5HdGb2t2BA/3k9MH0PGB3C4C8DH0QYR48UET275Pqew+6n1IaL22e4++AD4Xr0scwh0HAtvRPiBI9m60bXz05ELiV7COfJ4Aczc33NveNX95x9enl2EQGbB286kQHqA09cCmx9z7XifnpYvsjzwXkf4/PTBf3QJjA7fe/2AiBzegUB9dKBsED9QEnIAICIAcLwUg+aTecPIILLErRIU9OvvvlmkoO3ietclEAAXvsns2PAAsA3L3jPiQO3koAvmXvXDdhPgAL6AFj4T6T6r6IHt4Z7xir6QF4Fehb6IA75J54EH5SZH7oFcCejaarieAwjGaQgCh2YoGL5dBUR1g2oWLcYcjxCNgNJ9K5qapBJ9KhKKogr0C9y5yNj2J7ROLBo3qvgLwlx+xkG0GPKXjXjGhm4MzPCAHJ7AFIFMFgHYi6Eb4yzGh+BEACT+4u5mFegwFwFJgIGsSWFejiCZ5IF77YF764Eb5T6EFMHh4MAXA9oFLZpUCkC2H76UHUFuF0EiosZexz724xGNhMAYx7SoAygTgaATgACkl0boWsqADgI2bojWL0MAdYJQAAjtgPACUIRLAI8u2HMspMTqKKUaKGURoEkeYTwqAc4OAUQGMe4fqJ4R4N4bPkwWkNEbWtiFQUEebD/J3t3rgLYPPovuXkYUwT0D0ATj0DKAICHJcdcbjj4KKLQCHCHCQDjhcZTjKAwCHAIAwL8bQD4AIBKj4CHATgTiCSNjTp3CHDKH0H0PThKKKBKCHA0BKGHGgLoV3mgBcLYMQb4QfsTsKOcQIAST0D4MThKLQEiQILQAwDjn0C8WgISb8X0KKMTj0GiWzj0GKGgOTiQKKC1DKGKCHMKD4NTjKNCcCTKMTsiRiasbkVEPrgUaQDWmVhTAKGbqERQVbCJvbI7A2M7HxkosfkJuov4BqVAX4fgFDI5OWGIF7FQVwDKGkT4LafXIgLaIsFEfKUQA6ZADKFsfeJgQYEGTzpLtLrLlPrDmLvoEAA=== -->

<!-- internal state end -->
```


### 2. Sourcery - src/components/booking/ReservationForm.tsx:168

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


### 2. CodeRabbit - src/components/booking/ReservationForm.tsx:62

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


### 3. CodeRabbit - src/components/booking/ReservationForm.tsx:81

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

## LOW Issues (3)


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


### 2. Sourcery - src/components/booking/ReservationForm.tsx:81

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


### 3. CodeRabbit - src/components/booking/ReservationForm.tsx:184

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


---

## Next Steps

1. **Fix CRITICAL issues** (1 found) - Block merge until resolved
2. **Fix HIGH issues** (2 found) - Fix if <5 min each, otherwise document
3. **Document MEDIUM/LOW** (6 found) - Create follow-up issues

**Generated by**: `pnpm run pr:scrape 59`
