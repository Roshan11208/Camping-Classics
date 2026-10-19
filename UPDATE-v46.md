# Camping Classics v46 — update only

This ZIP contains four changed website files, plus these instructions.

## What changed

- index.html: one visible, semantic SEO section above the footer with the requested heading, paragraph, and four feature highlights. Suggested-items summary now announces live updates.
- styles.css: styles scoped to the new section, with responsive columns and the existing palette, typography, and rounded-card treatment.
- script.js: suggested items and recommended counts update on input/change using trip details. Suggestions no longer mirror the checklist's starting zero quantities. Generated checklist items still start at quantity 0, unchecked; existing/custom items are not changed by editing the preview.
- sw.js: cache version bumped to v46 for the existing update prompt and offline support.

## How to update GitHub / Cloudflare Pages

1. Extract this ZIP.
2. Replace index.html, styles.css, script.js, and sw.js in your existing repository's root. You can upload/replace the files directly, or open each matching file and replace its ENTIRE contents with the new contents. Do not append the contents to the old code.
3. Commit the four files together and wait for your existing deployment to finish.
4. Keep manifest.webmanifest, robots.txt, sitemap.xml, verification files, images, and other existing files. They are not changed or included here. UPDATE-v46.md is instructions only; it does not need to be uploaded.
5. Refresh your site, or use Refresh in the new-version prompt when it appears. Do not clear website data; that could remove saved trips.

These replacements are based on v45 from this conversation. If you made separate changes inside these four files since v45 (including SEO metadata in the head), preserve/merge those edits before replacing the files. Files outside this ZIP are not affected.

## Checks

Verified the one static SEO section, requested wording and H2/H3 structure. Exercised live suggestions for camper counts, days, camping styles, weather, activities, and extra needs, and checked that editing suggestions does not alter packing state. JavaScript syntax checks passed. Browser visual testing was unavailable.
