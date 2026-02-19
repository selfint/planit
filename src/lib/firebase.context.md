# firebase

## Overview

Runtime Firebase boundary for Planit. This module owns SDK loading from Firebase
CDN, app/auth/firestore initialization, emulator wiring, and auth helpers used by
the global state provider and UI.

## Exports

- `preloadFirebase()`: initializes Firebase runtime eagerly (used by bootstrap).
- `login()`: Google auth sign-in. Uses popup in normal mode and emulator-safe
  credential flow when `VITE_FIREBASE_EMULATOR=on`.
- `logout()`: signs out current auth session.
- `getUser()`: returns raw current Firebase user (`User | null` shape at runtime).
- `onUserChange(listener)`: subscribes to auth state updates for UI toggles.

## Data Flow

1. `ensureFirebaseRuntime()` loads `firebase-app`, `firebase-auth`, and
   `firebase-firestore` from CDN `12.9.0` exactly once.
2. Initializes app with inlined `DEFAULT_FIREBASE_WEB_CONFIG`.
3. If emulator mode is enabled, connects auth/firestore clients to emulator
   hosts from env.
4. Registers `onAuthStateChanged` and stores the latest user snapshot.
5. `login/logout/getUser` operate through the singleton runtime.

## Dependencies

- Firebase Web SDK modules loaded from `https://www.gstatic.com/firebasejs/12.9.0/*`.

## Notes

- Runtime app code keeps Firebase usage centralized here to avoid SDK spread.
- Emulator login path uses `signInWithCredential` with a mock Google ID token so
  CI/e2e tests are non-interactive.

## Tests

- `src/lib/firebase.test.ts` validates singleton preload, popup login path,
  emulator credential login path, emulator connection calls, and logout.
