# Khet Ka Saathi 🌾

A multilingual, farmer-first voice diary and farm companion prototype.

## What is included
- One-tap speech entry. The browser ends the recording after the utterance; recognized voice notes are categorized and saved automatically.
- Hindi and English farmer-facing interface, with speech locale choices for other supported Indian languages.
- Rule-based splitting and classification of common activity, expense, observation and crop-damage phrases. Expense amounts are extracted when recognized.
- Guided farm-profile conversation by text or voice, with crop, acreage, crop-density and symptom notes.
- Crop-damage reports with an optional photo attachment (compressed-size limit enforced by the app) and a saved image preview.
- Cautious field notes based on farmer-entered crop density and symptoms; these are prompts to seek local expert advice, not diagnoses.
- History stored in IndexedDB on the current browser/device, with a localStorage fallback.
- Installable PWA metadata and a service worker that caches the app shell and same-origin assets for a basic offline experience.
- Monthly expense report with daily totals.
- Farmer-created reminders with browser notifications where supported; while the app is open, due reminders are checked every minute.
- On-demand local weather using browser geolocation and the free Open-Meteo forecast API. Location is requested only after the farmer taps the weather button.
- JSON backup download and restore for moving records between browsers/devices.
- Responsive layout for phone and desktop.

## Important limitations — read before judging or deployment
- **Cloud backup/synchronization is not enabled.** IndexedDB is local to one browser/device. JSON export/import is a manual backup, not cloud sync. A real cloud service needs a Firebase project, authentication, Firestore rules, Storage rules for photos, and environment configuration. Do not claim cross-device sync until those are configured and tested.
- Offline mode stores records locally and caches the app shell/assets previously visited. Speech recognition and weather need an internet connection; the weather panel also needs location permission. First visit must be online.
- Browser reminders are local. Notifications may require permission and generally work only while the site is open or reopened; they are not guaranteed background push notifications on every phone/browser.
- Weather is an estimate for the device's location, not a farm-station measurement or an agricultural warning service.
- Speech recognition and classification are best-effort. The classifier is keyword-based, can split or categorize a sentence incorrectly, and should not be described as a full AI understanding model. Review important records.
- This prototype does not diagnose crop disease or prescribe fertilizer/pesticide doses. Use a soil test and local Krishi Vigyan Kendra/agriculture officer for crop-specific advice.
- The interface is currently Hindi-first with English labels not yet fully localized throughout every panel. Other selected locales affect speech recognition, not complete translation.
- Crop-damage records are personal documentation, not official insurance claims or verified evidence.

## Run locally
Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Verify production output with `npm run build`.

## Deployment checklist
1. Deploy the Next.js app over HTTPS (required for microphone, geolocation and service-worker capabilities).
2. Test on Android Chrome and iPhone Safari; speech recognition differs by browser.
3. Test first online visit, then airplane mode, refresh, and verify saved history remains.
4. Test reminder permission and the weather permission flow.
5. Export a JSON backup and restore it in a clean browser profile.
6. Before enabling cloud sync, configure Firebase Authentication, Firestore, Storage and restrictive per-user security rules. Never put service-account secrets in client code or commit secrets.

No secret API key is required for the Open-Meteo weather endpoint. Never commit credentials or private tokens.
