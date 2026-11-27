# Burkan TKD — mobile app (iOS + Android)

A native version of the Burkan Taekwondo Portal, built with **Expo (React Native)** and
**Firebase**. It has the same screens and role rules as the web portal (student, parent,
coach, admin) and fixes two problems with the Replit version:

| Replit portal | This app |
| --- | --- |
| Has to be republished every ~20 days | Nothing to republish. Firebase's free tier is always on. |
| Every account is admitted by hand | **Join codes**: each student gets a 6-character code. A parent or student who signs up with it is approved and linked to that student **automatically**. Coaches use a coach code. Only people who sign up *without* a code wait for approval, which takes one tap in **More → Accounts**. |
| Data lived in server memory (lost on restart) | Data is stored permanently in Cloud Firestore and syncs live across devices |

## 1. One-time Firebase setup (about 10 minutes, free)

1. Go to <https://console.firebase.google.com> → **Add project** (Google Analytics is optional).
2. **Build → Authentication → Get started → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** → *production mode* → pick a region
   close to Jordan (e.g. `europe-west1` or `me-central2`).
4. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app.
   Copy the values from the `firebaseConfig` it shows.
5. In this folder, copy `.env.example` to `.env` and paste the values.
   (These keys are public by design. The security rules are what protect your data.)
6. Deploy the security rules (this signs you in to Google in a browser the first time):

   ```powershell
   npx firebase-tools@latest login
   ```
   ```powershell
   npx firebase-tools@latest use --add
   ```
   ```powershell
   npm run deploy:rules
   ```

## 2. Run it on your phone

```powershell
npm install
```
```powershell
npx expo start
```

Install **Expo Go** from the App Store / Play Store and scan the QR code.

**The first account you create becomes the club administrator.** Create yours right away.
Then, in **More → Settings → Load starter data**, you can import the portal's sample
athletes, branches, schedule, belt tests and news. Or skip that and add your own students
in **More → Students → Add**.

## 3. Admitting members (no more manual approvals)

* **Students / parents:** open **More → Students → tap a student**. You'll see their join
  code. Tap **Share** and send it over WhatsApp. When they create an account with it, they
  get access straight away, already linked to that student. Parents with several children
  can link the others later in **Settings → Link another child**.
* **Coaches:** **More → Accounts → Coach invite code → Create code**, then share it.
* **No code?** The account waits in **More → Accounts → Awaiting approval**. Tap
  *Review & approve*, pick the role and the linked student(s), and you're done.
* A code that leaks can be replaced at any time with **New code**. Accounts that are
  already linked keep working.

## 4. Publishing to the App Store and Google Play

Builds run in Expo's cloud (EAS). You don't need a Mac or Android Studio.

```powershell
npx eas-cli@latest login
```
```powershell
npx eas-cli@latest build:configure
```

* **Android test APK** (install directly on phones, no store needed): `npm run build:android`
* **iOS** (needs an Apple Developer account, $99/year): `npm run build:ios`, then
  `npx eas-cli@latest submit -p ios`
* **Google Play** (one-time $25): `npx eas-cli@latest build -p android --profile production`,
  then `npx eas-cli@latest submit -p android`

Make sure `.env` exists before building. EAS uploads it with the project, because it is
not git-ignored.

## Project layout

```
src/app/            screens (Expo Router — every file is a route)
  (auth)/           login, signup
  (app)/(tabs)/     Home, Schedule, Attendance, Feedback, More
  (app)/            Students, Belt Tests, Finances, News, Locations, About, Settings, Accounts
src/lib/            firebase.ts, auth.tsx (session + join codes), data.ts (live queries), seed.ts
src/components/     UI kit (ui.tsx), bottom-sheet forms, toast
firestore.rules     who can read/write what (deploy with `npm run deploy:rules`)
```

## Role matrix

| Screen | Student | Parent | Coach | Admin |
| --- | --- | --- | --- | --- |
| Home, Schedule, Attendance, Feedback, Belt Tests, News, Locations, About | ✓ own | ✓ children | ✓ all | ✓ all |
| Students | – | children | all (can update belt) | all + add/edit, join codes |
| Finances | own | children | – | all + charges, mark paid |
| Record attendance / send feedback | – | – | ✓ | ✓ |
| Time-off & coverage requests | – | – | send | approve |
| Accounts & approvals | – | – | – | ✓ |

## Languages

The app comes in English and Arabic (العربية), laid out right to left in Arabic.
It starts in the phone's language. You can switch from the globe button on the
sign-in screen or from **Settings → Language**. Translations are in
`src/lib/ar.ts`, keyed by the English text: to change a translation, edit that
file. Content you type yourself, such as news, names and class names, appears
exactly as you entered it.

## Notes

* Payments are recorded by the admin (**Mark paid**). Collecting card payments inside the
  app would need a payment provider. That can be added later.
* The notification toggles are saved per user. Sending real push notifications is a
  possible next step (Expo Notifications plus a small Cloud Function).
* Amounts are shown in JOD.
