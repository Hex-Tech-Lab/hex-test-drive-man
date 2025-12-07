# Vehicle Images Directory Structure

This directory contains all vehicle images for the hex-test-drive-man application.

## Directory Layout

```
images/
├── placeholders/
│   ├── vehicle-hero.jpg      # Default hero/exterior placeholder
│   └── vehicle-interior.jpg  # Default interior/dashboard placeholder
├── vehicles/
│   └── {brand-slug}/
│       └── {model-slug}/
│           └── {year}/
│               ├── hero.jpg   # Exterior/side view
│               └── hover.jpg  # Interior/dashboard view
└── README.md (this file)
```

## Examples

### BMW X5 2024
```
vehicles/bmw/x5/2024/
  ├── hero.jpg
  └── hover.jpg
```

### Mercedes-Benz C-Class 2024
```
vehicles/mercedes-benz/c-class/2024/
  ├── hero.jpg
  └── hover.jpg
```

## Naming Conventions

- **Brand slugs**: Lowercase, kebab-case (e.g., `bmw`, `mercedes-benz`, `toyota`)
- **Model slugs**: Lowercase, kebab-case (e.g., `x5`, `c-class`, `camry`)
- **Year**: Four-digit year (e.g., `2024`)
- **Image files**: Always `hero.jpg` (exterior) and `hover.jpg` (interior)

## Image Requirements

### Quality Standards
- **Format**: JPG or JPEG
- **Dimensions**: Minimum 800x600px, recommended 1200x800px
- **Aspect Ratio**: 16:9 or 4:3
- **File Size**: Under 500KB (optimized for web)
- **Quality**: High-resolution, professional photography

### Content Guidelines
- **Hero Image**: Exterior view, preferably 3/4 angle showing front and side
- **Hover Image**: Interior view showing dashboard and front cabin
- **Match Exact Trim**: Use images matching the exact brand, model, year, and trim
- **Fallback**: If exact trim unavailable, use closest visual equivalent

### License Requirements
All images must be:
- Royalty-free, or
- OEM-approved, or
- Properly licensed for commercial use

Document the source URL in `src/config/vehicleImages.ts` for each image.

## Adding New Vehicle Images

1. **Source Images**: Find high-quality royalty-free images matching exact vehicle specs
2. **Create Directory**: `mkdir -p public/images/vehicles/{brand}/{model}/{year}`
3. **Add Images**: Place `hero.jpg` and `hover.jpg` in the directory
4. **Update Config**: Add entry to `src/config/vehicleImages.ts`
5. **Document Source**: Include source URL in config for audit

Example config entry:
```typescript
{
  brand: 'BMW',
  model: 'X5',
  year: 2024,
  trim: 'M Sport',
  heroPath: '/images/vehicles/bmw/x5/2024/hero.jpg',
  hoverPath: '/images/vehicles/bmw/x5/2024/hover.jpg',
  license: 'royalty_free',
  sourceUrl: 'https://example.com/source',
}
```

## Placeholders

If no specific images are configured, the system will fall back to:
- `/images/placeholders/vehicle-hero.jpg` - Generic hero placeholder
- `/images/placeholders/vehicle-interior.jpg` - Generic interior placeholder

These placeholders should be high-quality generic vehicle images.

## Current Configured Vehicles

The following vehicles have configured image paths (as of 2025-12-07):
- BMW X5 2024
- Mercedes-Benz C-Class 2024
- Toyota Camry 2024
- Audi Q7 2024

**Note**: Images need to be manually sourced and placed in the directories. The directories are created but images are not included in the repository. Please source appropriate royalty-free images.
