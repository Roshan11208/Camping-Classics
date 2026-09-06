# Camping Classics

A beginner-friendly camping website with:

- Trip planner
- Packing checklist
- Beginner guides
- Camping games
- Mobile-friendly layout
- Browser-saved checklist progress

## Run it locally

Option 1:
Double-click `index.html`.

Option 2:
If you have VS Code, install the Live Server extension and open `index.html` with Live Server.

## Publish with GitHub Pages

1. Create a GitHub repository called `camping-classics`.
2. Upload `index.html`, `styles.css`, and `script.js`.
3. Open the repository Settings.
4. Go to Pages.
5. Choose the `main` branch and `/root`.
6. Save.
7. GitHub will give you a public website link.

## Good next upgrades

- Add real campsite guides.
- Add more trip-planner options.
- Add user feedback form.
- Add analytics.
- Add database/accounts later.
- Add custom domain later.


## V15 features

- Personalized checklist quantities
- Add/remove custom checklist items
- Packing progress bar
- Official campground website links when available
- Saved trips stored locally in the browser
- Saved trips remember planner settings, quantities, custom items, and checked items


## V21 product polish

- Quantity-0 items no longer count toward packing progress
- Expand All / Collapse All checklist controls
- Set all quantities to zero
- Checklist search
- Optional start/end dates
- Current-trip summary
- Saved-trip duplicate, rename, last-edited time, and packed-count display
- Active saved trips persist while edited
- Duplicate custom-item protection
- Camp Finder Try Again button
- Active sidebar section highlighting
- Long-text layout hardening


## Analytics

Google Analytics 4 is configured with Measurement ID `G-FJWTZ4NWHB`.
Custom events track major feature usage without sending trip names, ZIP codes,
or coordinates as custom event parameters.


## V28 upgrades

- Share saved trips with a link using the Web Share API when supported, with copy-link fallback
- Shared-trip links can be imported into another browser as a new saved trip
- Saved Trips now use improved cards with camping-type icons, detail chips, clearer progress, and status
- Completed trips can be archived into a Past Trips section and restored later
- Added structured, anonymous feedback collection through Google Analytics (usefulness + improvement area only)
- No free-text feedback, trip names, ZIP codes, or coordinates are sent as feedback analytics parameters


## V29 feedback UI

- Made the floating feedback button smaller and positioned it closer to the bottom-right edge
- Added an optional 30-character quick-comment field
- Free-text comments are not sent to Google Analytics
- The browser temporarily stores recent short comments locally until a dedicated feedback backend is connected


## V30 feedback cleanup

- Removed the note about local comment storage from the feedback modal
- Removed the post-submit confirmation text
- Feedback modal now closes immediately after submission


## V31 share fix

- Removed the native Web Share API call because some desktop browsers can crash when handed the long shared-trip URL
- Share now copies the trip link directly to the clipboard
- A brief “Share link copied.” status appears and disappears automatically
- Shared-trip import behavior remains unchanged


## V32 checkbox and quantity sync

- Checking an item at quantity 0 automatically sets quantity to 1
- Increasing quantity above 0 automatically checks the item
- Reducing quantity to 0 automatically unchecks the item
- Clicking the displayed quantity checks the item when quantity is above 0 and unchecks it when quantity is 0
