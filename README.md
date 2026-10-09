# Camping Classics — refreshed version

## Publish on GitHub Pages

1. Extract this ZIP.
2. Upload all six files directly into the root of your GitHub repository. Replace the old files with the same names.
3. The homepage must be named `index.html`, not `index(1).html`.
4. In repository Settings → Pages, choose Deploy from a branch, then main and / (root). Save.
5. Wait for the Pages deployment to finish, then open your GitHub Pages website.

No build command or dependencies are needed.

## Included files

- index.html — webpage
- styles.css — design and responsive layout
- script.js — planner, checklist, daily plans, saved trips, guides, games, and campground finder
- manifest.webmanifest — web app metadata
- sw.js — offline support and update handling
- README.md — these instructions

## Improvements

- Refreshed layout and navigation
- Compact trip planner
- Packing-list search
- Daily Plans hover and keyboard-focus explanation
- Uncheck all items preserves trip settings, quantities, custom items, and day notes
- Updated offline cache with network-first refresh

## Notes

Saved trips are stored in the current browser and website address. Trips saved on another website address do not automatically transfer; use Share Trip on the old site and import on the new one.

The campsite photo remains hosted on Unsplash, as in the supplied site. Campground search and analytics require internet access. The existing Google Analytics measurement ID is retained.

If the old version remains visible after a completed deployment, hard-refresh the page. If necessary, unregister the old service worker in browser developer tools and reload. Avoid clearing browser storage if you want to keep saved trips.
