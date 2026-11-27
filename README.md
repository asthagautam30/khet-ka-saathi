# Khet Ka Saathi

A multilingual, voice-first farming companion for Indian farmers.

## First prototype flow
1. Choose a preferred language.
2. Record a farm activity or expense by speaking.
3. Review the recognized words and confirm before saving.
4. Keep entries in a simple farm diary.
5. Retrieve recent records.
6. Create a crop-damage report with notes and an optional photograph.

## Current prototype notes
- Voice input uses the browser Web Speech API where available.
- Spoken confirmations use browser speech synthesis.
- Language availability depends on the browser and operating system's installed speech services.
- Prototype records are stored in the current browser using local storage; they are not yet synced across devices.
- Crop-damage records are documentation, not insurance claims or verified agronomic diagnoses.
- The prototype does not provide fertilizer or pesticide recommendations.

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Docker
```bash
docker compose up --build
```

No API keys are required for this first prototype. Never commit credentials or private tokens.
