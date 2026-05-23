# Firestore Security Notes

## Codebase findings

- Web app: static HTML/JavaScript.
- Firebase SDK: browser modular SDK from CDN.
- Firestore collection: `contacts`.
- Query used by app: `query(collection(db, "contacts"), orderBy("createdAt", "desc"))`.
- CRUD operations:
  - Create contact with `addDoc`.
  - Read contacts with realtime `onSnapshot`.
  - Update contact with `updateDoc`.
  - Delete contact with `deleteDoc`.
- Data model:
  - `name`: string, required, max 80 in UI.
  - `email`: string, required, max 120 in UI.
  - `phone`: string, required, max 30 in UI.
  - `status`: string, required, allowed values `active` or `inactive`.
  - `notes`: string, optional, max 300 in UI.
  - `createdAt`: timestamp, set on create.
  - `updatedAt`: timestamp, set on create/update.
- Authentication pattern: none currently implemented in the app.
- Security concern: contact documents contain PII, so public unauthenticated access is not appropriate for production.

## Rules approach

The prototype rules require Firebase Authentication for all `contacts` reads and writes, validate the schema, enforce field length limits, restrict `status`, and prevent `createdAt` from being changed after creation.

Because the current app has no sign-in flow, these rules require adding Firebase Auth before production use. For local UI testing before Auth is added, the app still has a localStorage demo mode when Firebase config is absent.

## Attack review

- Public list exploit: blocked by `isAuthenticated()`.
- Unauthorized unauthenticated read/write: blocked by `isAuthenticated()`.
- Update bypass: blocked by running the same validator on update.
- Immutable field modification: `createdAt` is protected on update.
- Type juggling: blocked by type checks.
- Required field omission: blocked by required field checks.
- Schema pollution: blocked by allowed field checks.
- Resource exhaustion: string fields have size limits.
- Query mismatch: authenticated users can list `contacts` ordered by `createdAt`.

These are prototype findings and should be reviewed before broad sharing.
