# Magic Dice Web App

**Description:**
A full-screen, stage-ready, realistic dice web app. Works offline and supports Add to Home Screen. Features:

- Black background with realistic white dice and dots.
- Random dice roll on click/swipe.
- Long press to set a fixed number (1–6).
- Volume button triggers the fixed number roll.
- Fully offline capable (PWA).
- Add to Home Screen for immersive full-screen experience.

**How to Use:**
1. Open `index.html` in a browser (preferably Chrome/Edge).
2. Click or swipe the dice for random rolls.
3. Long press the dice (5 seconds) to set a fixed number.
4. Press volume buttons to trigger the fixed number.
5. Add to Home Screen for full-screen experience.

**Offline Support:**
The app caches all essential files using a service worker. Internet connection is not required after first load.

**Files:**
- `index.html` – Main HTML file
- `manifest.json` – PWA configuration
- `service-worker.js` – Offline caching
- `service-worker-register.js` – Service worker registration
- `icon.png` – App icon
