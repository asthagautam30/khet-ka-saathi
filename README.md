# Khet Ka Saathi 🌾

A multilingual, voice-first farm diary prototype for Indian farmers.

## Features
- One-tap voice diary: speech recognition stops when the browser ends the utterance and voice entries are saved automatically.
- Voice-based farm profile answers are submitted automatically after speech recognition ends.
- Undo the most recent automatically saved voice batch.
- Typed diary entries still have an explicit save action so text is not stored unexpectedly.
- Speak or type a farm update in a selected speech-recognition language.
- Automatically classify updates as an activity, expense, crop-damage report, or field observation. No manual category dropdown.
- Split simple combined updates into separate records; extract common numeric expense amounts and calculate expense totals.
- Review the transcript and detected categories before saving.
- Speak a short confirmation where browser speech synthesis supports the selected language.
- Collect the basic farm profile through a short conversation, asking only for missing crop or field-area details; add crop-damage notes with a small photo and export records as JSON.
- Show cautious reminders based on farmer-entered crop observations and planting-density notes.

## Important limitations
- This is a hackathon prototype, not a production agricultural advisory service.
- Speech recognition depends on browser/device support, network availability and speech services for the selected language. Haryanvi currently uses the Hindi speech-recognition locale.
- The interface is currently translated for Hindi and English. Other listed languages can be selected as speech-recognition locales, but their interface labels are not all translated yet.
- Automatic categorization uses keyword rules. Farmers should review the transcript and category before saving; ambiguous sentences can be misclassified.
- The app does not diagnose crop disease, calculate fertilizer dosage, or replace a soil test or advice from a local Krishi Vigyan Kendra (KVK)/agriculture officer.
- Records are currently stored only in the current browser on the current device. They are not synced to a cloud account and are not guaranteed to survive clearing browser data or changing devices. Export records regularly. Cloud sync is not implemented because this repository has no configured authentication/database backend or deployment secrets.
- Crop-damage records are personal documentation, not official insurance claims or verified evidence.

## Run locally
Requires Node.js 20.9 or later. Run npm install, then npm run dev, and open http://localhost:3000.
Run npm run build before deployment. Docker is configured with docker compose up --build.

No API keys are required. Never commit credentials or private tokens.
