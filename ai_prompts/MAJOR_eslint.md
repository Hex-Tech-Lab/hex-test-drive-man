_🛠️ Refactor suggestion_ | _🟠 Major_

**Add missing trailing commas per project style.**

The new `no-restricted-imports` rule correctly enforces path alias usage, but is missing trailing commas that your own ESLint config requires.



Apply this diff to both blocks:

```diff
       'no-restricted-imports': [
         'error',
         {
           'patterns': [
             {
               'group': ['../*'],
-              'message': 'Use @/* path aliases instead of relative imports that traverse directories. See tsconfig.json paths.'
+              'message': 'Use @/* path aliases instead of relative imports that traverse directories. See tsconfig.json paths.',
-            }
+            },
-          ]
+          ],
-        }
+        },
       ],
```


Also applies to: 79-89

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 GitHub Check: quality-gate</summary>

[warning] 47-47: 
Missing trailing comma

---

[warning] 46-46: 
Missing trailing comma

---

[warning] 45-45: 
Missing trailing comma

---

[warning] 44-44: 
Missing trailing comma

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
In eslint.config.js around lines 38-48 (and similarly 79-89), the newly added
no-restricted-imports rule is missing trailing commas required by the project's
ESLint style; update the object and array literals in both rule blocks to
include trailing commas for each property/element (e.g., after the patterns
array, after the group and message entries, and after the rule object) so the
file conforms to the project's trailing-comma style.
```

</details>

<!-- fingerprinting:phantom:poseidon:puma -->

<!-- This is an auto-generated comment by CodeRabbit -->
