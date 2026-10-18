# GACEB Scholar — Update report

## Changes in this package
- Preserved the existing green/gold visual theme, page structure and styling; added components using the same style.
- Corrected coin packages to 150 / UGX 10,000, 500 / UGX 25,000, and 1,000 / UGX 40,000.
- Corrected Premium plans to daily UGX 2,000, weekly UGX 7,000, monthly UGX 20,000, and yearly UGX 150,000.
- Added student/teacher account selection and teacher profile fields for name, gender, phone, school and education/qualification.
- Added a separate teacher dashboard using the student dashboard styling, with gender-based Mr./Ms. display, editable profile fields, referral link, library, Gauge and calendar links. No teacher profile-photo field or upload was added.
- Added a small Join Us button to the upper-right of both dashboards.
- Removed personal/teacher photographs from the About page and from the package. The Sr. Gauge portrait remains only on the Gauge Assistant profile.
- Added a calendar that opens on November 2026 and highlights 6 November, plus a live countdown on Home and Study Planner.
- Removed student/teacher PDF upload workflow; only admin upload UI is available, and included SQL policies restrict storage/document creation to admins.
- Added per-document Free/Coins/Premium settings, coin unlock checks, Premium access checks, and manual transaction submission with an admin review queue in the existing Mobile Money flow.
- Removed automatic 5-coin upload/referral reward promises and removed the automatic coin bonus from the included approval functions.
- Added recent payment request and subscription history display to signed-in dashboards.

## Checks performed
- JavaScript syntax check (`node --check app.js`): passed.
- HTML local-reference check: passed; all referenced local pages/assets were present.
- Duplicate HTML ID check: passed for all HTML pages.
- About page check: no personal-photo/gallery references remain.
- Gauge portrait check: `assets/sr-gauge-portrait.png` is referenced by `assistant.html`.
- Price text search: no old weekly UGX 10,000 / monthly UGX 30,000 prices found in the website UI.

## Not yet verified
- The Supabase migration has **not** been run against the live project. The actual live schema, RLS policies, storage bucket and RPC compatibility must be reviewed before applying it.
- Live account registration, payment submission/approval, coin deduction, signed PDF downloads and subscription activation have not been tested against the real Supabase backend.
- Gauge remains an offline study helper, not a live generative AI service.
- The payment form and admin queue require the included existing-project migration to be reviewed and applied to the matching schema. Do not run SQL against the live project without backing it up and reviewing it first.
