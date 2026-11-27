# Firebase setup for Khet Ka Saathi

Firebase cloud sync is **not active yet**. The app currently saves to the current browser/device and supports manual JSON backup. These files prepare the secure Firebase configuration; they do not create a Firebase project or enable synchronization by themselves.

## One-time project setup

1. Open https://console.firebase.google.com/ and sign in with the Google account that should own the project.
2. Select **Add project** and name it `khet-ka-saathi`. Follow the console prompts.
3. In **Project settings → General**, add a **Web app** and register it as `Khet Ka Saathi`. Keep the displayed configuration available.
4. In **Build → Authentication → Get started → Sign-in method**, enable **Email/Password**.
5. In **Build → Firestore Database**, create the database. Choose a region close to the intended users; for Haryana, select Delhi (`asia-south2`) if the console offers it at project creation.
6. In **Firestore → Rules**, publish the contents of `firestore.rules` from this repository.
7. In **Build → Storage**, get started and publish the contents of `storage.rules`. Storage may require a billing-enabled plan depending on Firebase's current plan and account terms; check the console before enabling it.
8. From **Project settings → General → Your apps → SDK setup and configuration**, copy the Web app config values into a local `.env.local` file using `.env.example` as the key template.
9. Never download or add a service-account JSON file to this web app. Never commit `.env.local`.

## Important status

- The rules restrict each signed-in user to their own `users/{uid}` data and image paths.
- The app still needs the Firebase Authentication / Firestore / Storage client integration and end-to-end testing before cloud backup can be enabled. Do not treat creating the Firebase project or publishing rules as proof that sync is working.
- Until that integration is complete and tested, continue using **Download backup** and **Restore backup**. Keep a copy of the JSON backup somewhere safe.