# Tech Stack Verification (Complete)

Version: 2.4.0 | Last Updated: 2025-12-24 | Maintained By: CC

Last Verified: 2025-12-14 2000 UTC via package.json + Supabase REST API

## Frontend Framework

**Source**: package.json lines verified via Read tool

```json
{
  "next": "15.4.10",              // Line 23 - App Router, React 19 support
  "react": "19.2.0",             // Line 26 - Latest stable
  "react-dom": "19.2.0",         // Line 27
  "typescript": "5.7.3"          // Line 41 - Strict mode enabled
}
```

**Status**: ✅ All LTS/stable versions, zero CVEs

**Artifact Version Claims** [Dec 2-3 THOS]:
- Claimed: Next.js 16.0.6, React 19.2.0, TypeScript 5.7.x
- Verified: Next.js 15.4.10 (not 16.0.6), React 19.2.0 ✅, TypeScript 5.7.3 ✅
- Conclusion: Next.js version fabricated in artifact (likely future projection)

## UI & Styling

**Source**: package.json lines 17-18

```json
{
  "@mui/material": "6.4.3",          // ⚠️ NOT v7 (artifact claims incorrect)
  "@mui/icons-material": "6.4.3",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1"
}
```

**Artifact Version Claims** [Dec 2-3 THOS]:
- Claimed: MUI 7.3.5
- Verified: MUI 6.4.3 (not 7.3.5)
- Decision: STAY ON 6.4.3 (see Architecture Decisions)

**MUI Version Decision** [2025-12-13 17:15 UTC, CC]:
- Current: 6.4.3 (LTS until mid-2026)
- Latest Stable: 7.3.6 (released 2025-03-26)
- **Decision**: STAY ON 6.4.3
- **Rationale**:
  - Zero CVEs in 6.4.3 (verified via Snyk, Socket.dev)
  - MUI v7 requires breaking changes to slots/slotProps API across ALL components
  - Migration impact: HIGH (every Autocomplete, TextField, Modal, etc. needs refactor)
  - Business value: NONE (v7 improvements don't solve current MVP problems)
  - Revisit: After MVP 1.5 completion or if v6 CVE discovered
- **Sources**: MUI v7 Release, v7 Migration Guide, Snyk Security DB

### State Management

```json
{
  "zustand": "5.0.3"              // Line 30 - localStorage persistence
}
```

**Critical Anti-Pattern** [2025-12-11 22:00 EET, User]:

```javascript
// ❌ FORBIDDEN: Object selectors cause React 19 infinite loops
const { brands, types } = useFilterStore(s => ({
  brands: s.brands,
  types: s.types
}));

// ✅ REQUIRED: Primitive selectors only
const brands = useFilterStore(s => s.brands);
const types = useFilterStore(s => s.types);
```

**Root Cause**: Factory.ai agent created object selectors → infinite setState loops
**Impact**: Page crashes, infinite re-renders
**Enforcement**: ESLint rule needed to prevent recurrence

## Backend & Database

```json
{
  "@supabase/supabase-js": "2.50.0",     // Line 19 - PostgreSQL client
  "@sentry/nextjs": "10.29.0"            // Line 18 - Error tracking
}
```

**Artifact Version Claims** [Dec 2-3 THOS]:
- Claimed: @supabase/supabase-js 2.86.0
- Verified: @supabase/supabase-js 2.50.0 (not 2.86.0)
- Analysis: Artifact from Dec 2-3 claims newer version; package.json current as of Dec 14

**Supabase Connection** [Verified 2025-12-14 20:00 UTC]:
- URL: https://lbttmhwckcrfdymwyuhn.supabase.co
- Project ID: lbttmhwckcrfdymwyuhn
- Region: US East
- Client: src/lib/supabase.ts (10 lines, uses env vars)
- Credentials: Provided via env vars (ANON_KEY + SERVICE_ROLE_KEY)

### Data Fetching Pattern

**Current**: ✅ Repository Pattern (verified src/repositories/vehicleRepository.ts:1-135)

```javascript
// Source: vehicleRepository.ts line 1-15
import { supabase } from '@/lib/supabase';

export const vehicleRepository = {
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .order('model_year', { ascending: false })
      .limit(50);
    return { data: data as Vehicle[] | null, error };
  }
}
```

**SWR Status**: ❌ NOT INSTALLED (verified via grep package.json)
- Claimed: "MVP 0.5: Catalog + SWR + data quality" (old CLAUDE.md) - FALSE
- Reality: Repository pattern sufficient for now
- Planned: SWR for MVP 1.5+ (user confirmed 2025-12-13)
- TanStack Query: Earmarked for admin panel only (user confirmed)

**Consumption**: Server Components with async/await (verified src/app/[locale]/page.tsx:61)

## Package Manager

**Enforced**: pnpm 9.x+ ONLY (verified package.json:7 "packageManager": "pnpm@...")
- ❌ FORBIDDEN: npm, yarn
- Rationale: Monorepo-style, faster installs, strict dependency resolution

## TypeScript Configuration

**Aliases**: ✅ Configured (tsconfig.json:20-23)

```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

**Enforcement**: ❌ NOT 100% [Verified 2025-12-13 16:55 UTC]

**Violations Found** (2 files):
1. src/components/VehicleCard.tsx:26
   ```javascript
   import { BrandLogo } from './BrandLogo';  // ❌ Should use @/components/BrandLogo
   ```

2. src/services/sms/engine.ts:2
   ```javascript
   import { sendWhySMS } from './providers/whysms';  // ❌ Should use @/services/sms/providers/whysms
   ```

**Fix Required**:

```bash
# Automated fix:
sed -i "s|from './BrandLogo'|from '@/components/BrandLogo'|" src/components/VehicleCard.tsx
sed -i "s|from './providers/whysms'|from '@/services/sms/providers/whysms'|" src/services/sms/engine.ts

# Verify:
pnpm build
```

**ESLint Rule** (Add to prevent recurrence):

```javascript
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": ["../", "./"]
    }]
  }
}
```

## Python Environment (PDF Extraction Pipeline)

**From Dec 1-2 THOS** [2025-12-01 22:00 - 2025-12-02 01:42 EET]:

- **System**: Ubuntu 24.04 LTS (WSL2 on Windows)
- **Python**: 3.12.x
- **venv Location**: ~/projects/hex-test-drive-man/venv
- **Activation**: ALWAYS run `source venv/bin/activate` before working [Dec 4, 2025]

**Key Libraries**:
- pdfplumber: Latest (via pip3)
- pytesseract: 0.3.13
- pdf2image: 1.17.0
- Pillow: 11.3.0
- opencv-python: 4.12.0.88
- numpy: 2.2.6
- tesseract-ocr: 5.3.4 (system package)

## Google Cloud Document AI [From Dec 2-3 THOS]

**Libraries**:
- google-cloud-documentai: 3.7.0
- google-api-core: 2.28.1
- google-auth: 2.43.0
- grpcio: 1.76.0
- protobuf: 6.33.1

**GCP Project**:
- Project ID: gen-lang-client-0318181416 (NAME: HexTestDrive)
- Region: eu (multi-region including Frankfurt)
- Processor: projects/478059461322/locations/eu/processors/6a8873bffd24ad4
- Type: FORM_PARSER_PROCESSOR
- Version: pretrained-form-parser-v2.1-2023-06-26

**Service Account**:
- Email: doc-ai-extractor@gen-lang-client-0318181416.iam.gserviceaccount.com
- Role: roles/documentai.apiUser
- Key: /home/kellyb_dev/.config/gcp/doc-ai-key.json

**Status** [Dec 3, 2025]:
- ⚠️ Document AI deemed UNRELIABLE for production (BMW X5 session)
- Issues: PAGE_LIMIT_EXCEEDED, heavy OCR errors, Arabic broken with \n
- Match rate: only 8-9% on BMW specs
- Decision: pdfplumber + rule-based parser is preferred path

## API Keys & Credentials [Dec 3, 2025]

**Note**: Security not enforced for development; all keys will be rotated before MVP 1.5/2.0 demo
**Storage**: Keys stored in user's personal notes, NOT in CLAUDE.md (GitHub push protection enforced)

**Anthropic API**:
- Console: https://console.anthropic.com/settings/keys
- Key: sk-ant-api03-[REDACTED]
- Usage: Claude Sonnet 4 for LLM table parsing (experimental)

**Google AI Studio**:
- Console: https://aistudio.google.com/app/api-keys
- Key: AIzaSy[REDACTED]
- Usage: Gemini models (future use)

**Sentry Error Tracking**:
- Auth Token: sntrys_[REDACTED]
- Org: hex-org
- Project: hex-test-drive-man
- DSN: https://[REDACTED]@o4510320861839361.ingest.de.sentry.io/4510348150177872
- Region: de (Germany)

**Environment Variables**:
- Location: .env at project root
- Required: ANTHROPIC_API_KEY, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN
- Status: ⚠️ DO NOT commit .env to repository (use .env.template)
- Access: User has full keys in personal notes (Dec 3, 2025 artifact)

