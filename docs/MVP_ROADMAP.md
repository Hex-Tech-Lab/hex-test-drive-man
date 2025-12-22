# MVP Roadmap - Hex Test Drive

## MVP 1.0 (Current - Stabilization) ✅
**Target:** December 23, 2025
- [x] OTP single SMS fix
- [x] Placeholder images (118 models)
- [x] Locale persistence
- [x] Show all 409 vehicles (removed 50-vehicle limit)
- [x] Dynamic price range filter (already implemented)
- [x] Fix Grid card spacing
- [ ] Image cropping/centering consistency
- [ ] Brand logos 2-3x larger
- [ ] Remove double reload on language switch

## MVP 1.1 (UX Polish)
**Target:** December 24-25, 2025
- [ ] One card per model (price range display)
- [ ] Trim comparison page (side-by-side)
- [ ] Enhanced placeholder watermark (80% width, 15° slant)
- [ ] Consistent card spacing (Material UI Grid)
- [ ] Fix image onError fallback for Hyundai models

## MVP 1.2 (Performance)
**Target:** December 26-27, 2025
- [ ] Lazy load images (Intersection Observer)
- [ ] Optimize WebP compression (50% size reduction)
- [ ] Server-side filtering (reduce client load)
- [ ] Cache vehicle data (5min TTL)

## MVP 2.0 (Booking Enhancements)
**Target:** January 2026
- [ ] Multi-language SMS (AR/EN based on booking locale)
- [ ] Booking history for returning users
- [ ] Admin dashboard for booking management
- [ ] Email confirmations (SendGrid integration)

## MVP 3.0 (Security Hardening)
**Target:** February 2026
- [ ] Rotate all credentials (post-demo)
- [ ] Remove credential files from repo
- [ ] Implement rate limiting (API protection)
- [ ] Add CSRF protection
- [ ] Security audit (Snyk/Dependabot fixes)

---

**Last Updated:** 2025-12-23 00:23 UTC
**Maintained By:** CC (Claude Code)
