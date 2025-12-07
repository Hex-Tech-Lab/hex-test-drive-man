**Date**: 2025-12-07 14:25 EET

# Frontend & Infrastructure Notes

## Stack
*   **Next.js**: 15.1.9
*   **React**: 19.2.0
*   **TypeScript**: 5.7.3

## ESLint
The project uses ESLint 9 with a flat configuration.
Next.js's built-in lint runner may print a non-fatal "Invalid Options: useEslintrc, extensions" warning. This is expected and intentionally ignored, as builds still pass.
To lint locally, run:
```bash
pnpm lint
```

## Routing & RTL Behavior (Current Implementation)

*   **Catalog Page**: Locale switches (e.g., between English and Arabic) use client-side navigation. This means there is no full page reload, and the scroll position and any selected filters are preserved.
*   **Comparison Page**:
    *   **Back Button**: The "Back" button explicitly navigates to the catalog page for the current locale. It restores the last scroll position from `sessionStorage` where the user left off on the catalog.
    *   **RTL Switch**: Toggling between English and Arabic within the comparison page uses `{ scroll: false }` in the navigation options, ensuring the viewport remains stable and does not scroll to the top.

## Deployment
Pushing changes to the `main` branch automatically triggers a production deployment on Vercel.

The latest known production URL is:
[https://hex-test-drive-k7m1gdf2o-techhypexps-projects.vercel.app](https://hex-test-drive-k7m1gdf2o-techhypexps-projects.vercel.app)

For manual redeployments, you can use the Vercel CLI with the `--force` flag:
```bash
vercel deploy --prod --force
```
