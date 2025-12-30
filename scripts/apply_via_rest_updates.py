#!/usr/bin/env python3
"""
Apply image mapping SQL via direct Supabase REST API PATCH requests.
No DATABASE_URL or custom RPC functions needed.
"""
import requests
import re
import sys
from pathlib import Path

SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNjI3MCwiZXhwIjoyMDc4MjEyMjcwfQ.vOteqNu-oD_10NRasipllTewUETEjiMsyCFetA3UzW8"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

print("="*80)
print("APPLYING IMAGE MAPPING VIA SUPABASE REST API")
print("="*80)
print()

# Parse SQL file
sql_file = Path("scripts/update_image_urls.sql")
print(f"📄 Reading: {sql_file}")

with open(sql_file, 'r') as f:
    sql = f.read()

# Extract UPDATE statements
pattern = r"UPDATE models SET (\w+_image_url) = '([^']+)' WHERE id = '([^']+)';"
matches = re.findall(pattern, sql)

print(f"📊 Found {len(matches)} UPDATE statements")
print()

if not matches:
    print("❌ No UPDATE statements found in SQL file!")
    sys.exit(1)

# Apply updates
success_count = 0
failed_updates = []

for i, (field, url, model_id) in enumerate(matches, 1):
    if i % 50 == 0 or i == 1:
        print(f"⏳ Progress: {i}/{len(matches)} ({(i/len(matches)*100):.1f}%)")

    try:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/models?id=eq.{model_id}",
            headers=headers,
            json={field: url},
            timeout=10
        )

        if response.status_code in [200, 204]:
            success_count += 1
        else:
            error_msg = f"Status {response.status_code}: {response.text[:100]}"
            failed_updates.append((model_id, field, error_msg))
            if i <= 10:  # Show first 10 errors
                print(f"   ❌ Failed {model_id} ({field}): {error_msg}")

    except Exception as e:
        failed_updates.append((model_id, field, str(e)))
        if i <= 10:
            print(f"   ❌ Exception {model_id}: {e}")

print()
print("="*80)
print("RESULTS")
print("="*80)
print(f"✅ Successful: {success_count}/{len(matches)} ({(success_count/len(matches)*100):.1f}%)")
print(f"❌ Failed: {len(failed_updates)}/{len(matches)}")
print()

# Verify coverage
print("📊 Verifying database coverage...")
try:
    verify = requests.get(
        f"{SUPABASE_URL}/rest/v1/models?select=id,hero_image_url,hover_image_url",
        headers=headers,
        timeout=30
    )

    if verify.status_code == 200:
        data = verify.json()
        hero_count = sum(1 for m in data if m.get('hero_image_url'))
        hover_count = sum(1 for m in data if m.get('hover_image_url'))

        print()
        print("="*80)
        print("DATABASE COVERAGE")
        print("="*80)
        print(f"Total models:  {len(data)}")
        print(f"Hero images:   {hero_count} ({(hero_count/len(data)*100):.1f}%)")
        print(f"Hover images:  {hover_count} ({(hover_count/len(data)*100):.1f}%)")
        print("="*80)

        # Save to file
        with open('docs/PRODUCTION-COVERAGE-POST-SQL.txt', 'w') as f:
            f.write(f"Production Image Coverage - Post-SQL Application\n")
            f.write(f"="*80 + "\n\n")
            f.write(f"Date: 2025-12-30\n")
            f.write(f"Method: Direct REST API PATCH updates\n")
            f.write(f"Success rate: {success_count}/{len(matches)} ({(success_count/len(matches)*100):.1f}%)\n\n")
            f.write(f"Database Coverage:\n")
            f.write(f"  Total models:  {len(data)}\n")
            f.write(f"  Hero images:   {hero_count} ({(hero_count/len(data)*100):.1f}%)\n")
            f.write(f"  Hover images:  {hover_count} ({(hover_count/len(data)*100):.1f}%)\n\n")
            f.write(f"Failed updates: {len(failed_updates)}\n")
            if failed_updates:
                f.write(f"\nFailed Update Details:\n")
                for model_id, field, error in failed_updates[:20]:
                    f.write(f"  - {model_id} ({field}): {error}\n")
                if len(failed_updates) > 20:
                    f.write(f"  ... and {len(failed_updates) - 20} more\n")

        print(f"\n📝 Coverage report saved to: docs/PRODUCTION-COVERAGE-POST-SQL.txt")

    else:
        print(f"❌ Verification failed: {verify.status_code} - {verify.text}")

except Exception as e:
    print(f"❌ Verification exception: {e}")

print()

if failed_updates and len(failed_updates) > 10:
    print(f"⚠️  {len(failed_updates)} updates failed. See docs/PRODUCTION-COVERAGE-POST-SQL.txt for details")

if success_count == len(matches):
    print("🎉 ALL UPDATES APPLIED SUCCESSFULLY!")
elif success_count >= len(matches) * 0.9:
    print("✅ MOSTLY SUCCESSFUL (>90%)")
else:
    print("⚠️  PARTIAL SUCCESS - review failed updates")

print()
