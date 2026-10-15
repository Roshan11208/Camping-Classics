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
- Reset Checklist restores default items and keeps trip settings and day notes
- Updated offline cache with network-first refresh

## Notes

Saved trips are stored in the current browser and website address. Trips saved on another website address do not automatically transfer; use Share Trip on the old site and import on the new one.

The campsite photo remains hosted on Unsplash, as in the supplied site. Campground search and analytics require internet access. The existing Google Analytics measurement ID is retained.

If the old version remains visible after a completed deployment, hard-refresh the page. If necessary, unregister the old service worker in browser developer tools and reload. Avoid clearing browser storage if you want to keep saved trips.

## Version 40

- Sidebar collapses to icons until hovered, focused, or pinned open.
- New-trip checklists start collapsed; generating a list opens them automatically.
- Existing trips open with their checklist visible; Open Checklist is always available.
- Removing items shows Undo. Multiple removals can be undone in reverse order until dismissed or the trip changes.
- Reset Checklist restores the default packing list and clears progress while preserving the current trip details and daily notes.

## Version 41

- Removed the redundant Collapse Checklist button. The arrow beside Daily Plans controls collapsing. Open Checklist appears only while collapsed.
- Undo restores focus to the item without scrolling to the checklist heading.

## Version 42

Expand All, Collapse All, and Print Checklist are on the left of the search field in a single row. Narrow screens stack the toolbar without overflowing.

## Version 43

Find an item is on the left; Expand All, Collapse All, and Print Checklist are on the right.

## Version 44

- Start/end dates and number of days synchronize immediately (both dates count).
- End dates before the start date are disabled in the calendar and corrected if typed.
- Daily Plans has one card per trip day; existing day notes survive regeneration and date shifts. Shortening asks before removing written notes.
- Custom items have no quantity field; they start at quantity 1 and unchecked.
- Nearby campsite results can be hidden and shown without another search.
- Sticky Done button closes Daily Plans on mobile and desktop.
- Feedback displays a confirmation popup. Written comments remain local to the visitor's browser; no central comment collection was added.

## Version 45 — usability and trip backups

- Sidebar icons align with the logo in the collapsed rail.
- Daily Plans uses different arrival, activity, departure, and one-day examples, tailored to selected activities. Examples are placeholders, never saved as your notes.
- Print Checklist builds a clean document with trip details, packing boxes, item names, and quantities. It includes the complete list regardless of search or collapse state.
- Phone toolbar buttons fit in one balanced row below search; quantity controls keep their existing size.
- Reset Checklist asks before removing custom items and clearing packing progress.
- Category collapse preferences are preserved; the main checklist arrow remembers your choice for an existing trip. Generating a new list still opens it.
- Search shows No items found when appropriate. Searching temporarily opens matching categories without overwriting collapse preferences.
- Current-trip status distinguishes a device-saved draft from a trip added to Saved Trips.
- Download trip backup exports saved trips and the current draft to JSON. Restore from backup validates the complete file and adds new copies to Saved Trips; existing trips and the current draft are preserved. Maximum import: 2 MB and 200 trips.
- Custom items start at quantity 0 and unchecked.
- New-version prompt offers Refresh or Later. Refresh saves current state before activating the waiting update. This workflow applies once this version is installed; browsers still running older code may need a manual refresh first.

### Future file updates

Change CACHE_NAME in sw.js for each release (for example camping-classics-v46), and upload sw.js together with the changed HTML, CSS, and JavaScript. The update prompt detects a newly installed waiting service worker. Upload the six files to your repository root; no build is required.

### Verification

JavaScript syntax, print-output content, example generation, reset cancellation, trip backup validation and restoration, search behavior, and update activation logic were checked. Browser visual and physical print testing were unavailable in the authoring environment.
