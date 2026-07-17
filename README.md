# GarageBlock

A single-user home gym tracker for a 12-week training block (Technique, Build, Progress, Deload/Test), built as a static site for GitHub Pages. No accounts, no server. All data lives in your browser's localStorage, with JSON export/import so a cleared cache never costs you your history.

## Deploy to GitHub Pages

1. Create a new repository (for example `garageblock`).
2. Upload all files in this folder to the repository root: `index.html`, `app.js`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`.
3. In the repository, go to Settings > Pages, set Source to "Deploy from a branch", branch `main`, folder `/ (root)`, and save.
4. Your app will be live at `https://<username>.github.io/garageblock/` within a minute or two.

On your phone, open the URL and use "Add to Home Screen". It installs as an app and works offline after the first load.

## Data safety

Your data is stored per browser, per device. Use More > Data safety to:

- Export backup (JSON): full snapshot, re-importable on any device.
- Import backup: restores a snapshot (replaces current data after confirmation).
- Workouts CSV / Nutrition CSV: flat files for Excel or Sheets.

The app reminds you with a banner if you have not exported in 14 days.



## Rolling schedule

By default GarageBlock runs in Rolling mode: your next workout is always the first unfinished session in the program, in order. Miss two days and nothing shifts or breaks; the missed session simply waits as "Next up" until you do it or skip it. Skipping (for a rained-out game or a session you're deliberately dropping) moves the queue forward, shows as a hollow dot in Plan, and can be undone by opening that day from Plan and tapping Unskip. Sessions logged in Rolling mode record the date you actually trained. Switch to Calendar mode in More > Targets & settings if you'd rather have Today always show the actual weekday's session.

## Gist sync (cross-device)

Sync between your phone and desktop through a private GitHub Gist. Setup takes about two minutes:

1. Go to github.com/settings/tokens and choose "Generate new token (classic)". Name it "garageblock", set an expiration you're comfortable with, and check ONLY the `gist` scope. Generate and copy it.
2. In the app, More > Gist sync, paste the token, and press Connect.
3. Press "Push to Gist" once. This creates a private Gist and saves its ID.
4. On your other device, open the app, paste the same token, and Connect. Then export a backup from device one and import it on device two once (this carries over the Gist ID), or just push from one device and pull from the other after editing app state. Easiest path: on device two, import the JSON backup from device one, then both devices point at the same Gist.
5. Turn on "Auto-push a few seconds after every change" on the device you log from most.

Pull is always safe: it only offers to replace local data when the Gist copy is strictly newer, and asks before doing it. The token lives only in that browser's storage and is never written into JSON backups.

## Plate math

Set your straight bar and SSB weights and your per-side plate inventory in More > Plate math. While logging any barbell or SSB lift, typing a weight shows the per-side loadout under the set rows (e.g. 205 lb: 45 + 35). If a weight isn't loadable with your plates it shows the closest weight that is.

## What's inside

- Today: the day's session from the 12-week plan, tap-to-log sets with weight and reps, "last time" prefills, RPE and notes, automatic rest timer from the plan's rest column, extra exercise logging, PR detection (Epley estimated 1RM).
- Plan: all 12 weeks with phase colors, per-day completion, open any day to log or backfill.
- Fuel: daily weight, waist, calories, protein, steps, water, sleep, hunger, with target bars, weekly averages, logging streak, and the meal builder.
- Progress: bodyweight chart with 7-day average and goal line, estimated 1RM charts for the four main lifts, weekly adherence bars, PR table.
- More: targets and settings, exercise library with substitutions, equipment list, export/import.

## Changing the program

The weekly template, phases, exercise library, and meals are plain JavaScript constants at the top of `app.js` (`TEMPLATE`, `PHASES`, `LIBRARY`, `MEALS`). Edit them there and commit; logged data keys reference template row order, so avoid reordering rows mid-block (append instead).
