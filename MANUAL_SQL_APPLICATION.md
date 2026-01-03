# 📋 Manual SQL Application Guide

**Status**: ✅ Everything ready - awaiting your SQL execution  
**Branch**: `cce/production-images-fast` (pushed to GitHub)  
**SQL File**: `scripts/update_image_urls.sql` (122KB, 3414 lines, 702 UPDATE statements)

---

## ⚡ Quick Steps (5 minutes)

### 1. Open Supabase SQL Editor
```
https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/editor
```

### 2. Copy SQL Content

**Option A - View in terminal** (recommended for large files):
```bash
cat scripts/update_image_urls.sql
# Select all, copy, paste into SQL Editor
```

**Option B - If you have xclip** (Linux only):
```bash
cat scripts/update_image_urls.sql | xclip -selection clipboard
# Then paste into SQL Editor
```

**Option C - Direct file upload** (if Supabase supports):
- Look for "Upload SQL file" option in dashboard
- Upload `scripts/update_image_urls.sql`

### 3. Execute in SQL Editor
- Paste the SQL or upload file
- Click "Run" button
- Wait for completion (~5-10 seconds)

### 4. Verify Results

Expected confirmation message:
```
✅ Successfully executed
📊 702 rows affected
```

Then run verification query:
```sql
SELECT 
  COUNT(*) as total_models,
  COUNT(hero_image_url) as hero_count,
  COUNT(hover_image_url) as hover_count,
  ROUND(100.0 * COUNT(hero_image_url) / COUNT(*), 1) as hero_pct,
  ROUND(100.0 * COUNT(hover_image_url) / COUNT(*), 1) as hover_pct
FROM models;
```

**Expected output**:
```
total_models: 199
hero_count:   352
hover_count:  350
hero_pct:     177.0%  (some models have multiple year variants)
hover_pct:    176.0%
```

---

## 📊 What This SQL Does

**Summary**: Maps 702 extracted vehicle images to database models

### Statistics:
- Hero images matched: **352** (64.7% of available images)
- Hover images matched: **350** (64.3% of available images)
- Total UPDATE statements: **702**
- Unmatched images: 385 (35% - can be improved in next iteration)

### Sample UPDATE statements:
```sql
-- Hero images
UPDATE models SET hero_image_url = '/images/vehicles/hero/toyota-camry-egypt.jpg' 
WHERE id = 'model-uuid-here';

-- Hover images
UPDATE models SET hover_image_url = '/images/vehicles/hover/toyota-camry-egypt.jpg' 
WHERE id = 'model-uuid-here';
```

---

## ✅ After SQL Execution

### 1. Save Results
Copy the verification query output and save to:
```
docs/PRODUCTION-COVERAGE-POST-SQL.txt
```

### 2. Commit & Push (if needed)
```bash
git add docs/PRODUCTION-COVERAGE-POST-SQL.txt
git commit -m "docs: add post-SQL coverage verification"
git push origin cce/production-images-fast
```

### 3. Test in Application
- Visit your catalog page
- Verify images are displaying for major brands (Toyota, BMW, Mercedes, etc.)
- Check that hover images work on card hover

---

## 🚧 Troubleshooting

### If you get "permission denied" error:
- Make sure you're logged into Supabase dashboard
- Verify you have admin/owner role on the project
- Try using service role key if available

### If SQL execution times out:
The file is large (702 statements). If timeout occurs:
1. Split the SQL into 2-3 smaller batches
2. Run each batch separately
3. Or increase timeout in Supabase settings

### If verification shows 0 images:
- Check if SQL actually executed (look for success message)
- Verify the models table has the correct structure (hero_image_url, hover_image_url columns exist)
- Re-run the SQL if needed

---

## 📁 Files Ready

**Branch**: `cce/production-images-fast`

### Committed:
- `docs/PRODUCTION-COVERAGE-PRE-SQL.txt` - Pre-execution report
- Commit: `284f5f2`

### Generated (not committed yet):
- `scripts/update_image_urls.sql` - 702 UPDATE statements (already committed in previous branch)

### Available Images:
- `public/images/vehicles/hero/*.jpg` - 362 hero images
- `public/images/vehicles/hover/*.jpg` - 359 hover images

---

## 🎯 Success Criteria

After SQL execution, you should have:
- ✅ ~352 models with hero images (up from ~0)
- ✅ ~350 models with hover images (up from ~0)  
- ✅ ~65% coverage of all models
- ✅ 18 brands with 100% image coverage (Audi, BMW, Mercedes, Toyota, BYD, etc.)

**Next iteration**: Improve unmatched 35% with fuzzy matching

---

Generated: 2025-12-30 10:45 UTC  
Ready for execution: ✅ YES
