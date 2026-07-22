# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is a Vue 3 + Vite single-page app ("DFM Invoice Creator", package name `invoice-generator`) for creating/printing invoices. It has two parts:

- Frontend (repo root): Vue 3, Vite, Pinia, Vue Router, Tailwind v4, reka-ui/shadcn-vue components. Backed by Firebase (Auth, Firestore, Storage) and Algolia (invoice search). Standard commands live in `package.json` (`dev`, `build`, `test:unit`, `lint`, `format`) and `README.md`.
- Firebase Functions (`functions/`): Node 22, TypeScript, `firebase-functions` v2 HTTP functions for admin/customer user creation. Standard commands live in `functions/package.json` (`build`, `lint`, `serve`, `deploy`).

Dependencies for both `package.json` files are installed by the startup update script; you do not need to reinstall them.

### Required environment variables (non-obvious gotcha)

The frontend has NO local fallback and NO Firebase emulator wiring. `src/main.ts` calls `onAuthStateChanged` and `src/lib/firebase.ts` calls `getAuth()` at module load, BEFORE the app mounts. If the `VITE_FIREBASE_*` values are missing/invalid, Firebase throws `auth/invalid-api-key` and the app renders a completely blank page (no sign-in form). So valid Firebase config is mandatory just to see any UI.

Create a `.env` (or `.env.local`) at the repo root (git-ignored via `*.local`) with, at minimum:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ALGOLIA_APP_ID`, `VITE_ALGOLIA_API_KEY` (invoice list/search on the dashboard)
- `VITE_FIREBASE_FUNCTIONS_URL`, `VITE_FIREBASE_FUNCTIONS_SECRET` (used by `src/lib/firebase-auth.ts` for user-management calls)
- `VITE_SITE_URL` (forgot-password redirect)

Vite only exposes vars prefixed with `VITE_`. Restart `npm run dev` after editing env files.

Signing in and creating an invoice also requires a valid Firebase Auth account on the configured project (there is no sign-up flow in the UI — accounts are provisioned via the `createAdminUser` / `createCustomerUser` functions or the Firebase console).

### Lint status (pre-existing)

`npm run lint` (root) and `npm run lint` (functions) currently report many pre-existing errors on a clean checkout (root: `vue/multi-word-component-names`, `no-explicit-any`, etc.; functions: `eslint-config-google` 2-space indent vs. the code's 4-space style). These are not environment problems — do not treat them as regressions introduced by your changes.

### Notes

- `npm run create-admin` references `scripts/createAdminUser.ts`, which does not exist in the repo; that script is not runnable as-is.
- Egress is unrestricted in this environment, so Firebase/Algolia endpoints are reachable once credentials are supplied.
