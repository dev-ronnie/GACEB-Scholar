# GACEB Scholar — Super Multi-page Edition

## Pages included
- Home (`index.html`)
- Courses (`courses.html`)
- PDF Library and upload (`resources.html`)
- Quick quizzes (`quizzes.html`)
- Weekly study planner (`planner.html`)
- Coins, referrals, Premium and donations (`coins.html`)
- Gauge Assistant (`assistant.html`)
- About (`about.html`, personal photos removed)
- Contact (`contact.html`)
- Student dashboard, teacher dashboard and admin tools (`dashboard.html`, `teacher-dashboard.html`)

## Upload to GitHub Pages from Android
1. Download and extract `GACEB_Scholar_Super_Multipage.zip` on your phone or computer.
2. Open your existing repository: `dev-ronnie/Gaceb-e-scholar-platform`.
3. Upload **all files and folders inside the extracted folder** into the repository root. Keep the `assets` folder, including `gaceb-logo.png` and `sr-gauge-portrait.png`. Personal/teacher photos are not included in the About page. Do not upload only `index.html`; do not nest everything inside another folder.
4. If GitHub asks whether to replace existing files, replace the old `index.html`, `styles.css`, `app.js`, `config.js`, and `supabase-schema.sql` with these package versions. Keep all `assets/` files.
5. Commit changes. Keep Pages set to branch `main`, folder `/(root)`.
6. Open the published site and refresh. If old images are cached, clear browser cache or open in a private tab. The site uses relative `assets/...` paths and includes the image files in this ZIP.

## Connect database and accounts
1. Use your existing Supabase project: `https://wwiedsnmkqjlhxlkfquj.supabase.co`. The project URL and publishable key have already been placed in `config.js`.
2. In Supabase SQL Editor, run all of `supabase-schema.sql` in a new project.
3. The project URL and publishable key are already set in `config.js`. Never put a `service_role` key, payment secret, password or Mobile Money PIN in website files.
4. In Supabase Authentication URL settings, set the Site URL and allowed redirect URL to the exact published website URL.
5. Register your account, then use Supabase SQL Editor to promote only your own account to admin:
   `update public.profiles set role='admin' where email='YOUR-LOGIN-EMAIL';`
7. Log in again and visit `dashboard.html` to use moderation and student/referral tables.

## Important scope and honest limitations
- **Image/logo fix:** all image assets are bundled under `assets/`; upload the folder along with the HTML files. File names and letter case must remain exactly as shown.
- **PDFs, accounts, coin rewards, referrals and admin tables:** require the Supabase steps above. The included SQL defines private PDF storage, role-aware profiles, owner-only document uploads, per-document Free/Coins/Premium access, and server-side document unlocking. No automatic referral or upload rewards are promised.
- **Quizzes:** this version includes a working five-question sample quiz; it is a starter bank, not a complete official exam question bank.
- **Study planner:** works offline and saves on the current browser/device only.
- **Gauge Assistant:** provides built-in study guidance, not live generative AI. Live AI needs a server-side AI provider function and secret kept on the server.
- **Payments/donations:** the page keeps the existing Mobile Money numbers and includes a transaction-ID submission form. The existing-project migration creates the payment request and admin approval functions. Until that migration has been reviewed and applied to the matching schema, the form will not work. No payment is considered approved until the administrator verifies it.
- Do not upload copyrighted or private material without permission.


## Calendar and countdown
- The Study Planner and Home page include a calendar highlighting 6 November 2026 and a live countdown to that date.

## Existing project migration (important)
Your provided Supabase project may already contain live data. **Do not run `supabase-schema.sql` or `supabase-migration-existing-project.sql` yet.** First make a database backup and review the current tables, RLS policies, storage buckets, and existing functions. The migration script is included for review only; it may need adjustments to match your current schema. Existing records are not intentionally deleted, but policy/function changes can affect access.

## Owner-only document uploads
The public PDF Library does not offer user uploads. Uploads must be made by the owner/admin only, and Supabase Storage/database policies must enforce this. Promote only your own account after confirming its email: `update public.profiles set role='admin' where email='YOUR-LOGIN-EMAIL';` Teachers and students must not be given admin role. Per-document Free/Coins/Premium access controls and the secure unlock function are included in the SQL; verify the migration against your actual existing schema before applying it.

## Manual payments and Premium timing
The coins page lists the approved coin packs and Premium prices and the mobile-money numbers supplied by the owner. The migration adds payment-request records and database functions for manual transaction submission, administrator approval, coin crediting, and subscription activation. The website includes the matching form and admin approval queue. Never treat a screenshot or transaction ID alone as automatic confirmation; verify it manually. Test with a non-production request after the migration has been reviewed and applied.
