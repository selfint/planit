# Login Page

## Overview

The login page is the `/login` route and currently serves as a placeholder for
future authentication flows.

## Page Contents

- `ConsoleNav` mounted with `/login` active state.
- Placeholder route label (`/login`) and heading.
- Explanatory text that the auth form will be added later.
- CTA link back to `/`.

## Data Flow

1. `LoginPage()` clones the template and validates required root elements.
2. The console navigation placeholder is replaced with `ConsoleNav({ activePath: '/login' })`.
3. The page renders static content only and does not read IndexedDB.

## Unit Tests

- `renders a root element`: calls `LoginPage()` and asserts the returned value
  is an `HTMLElement`.
- `mounts console navigation and login placeholder copy`: validates nav mount and
  placeholder heading text by mocking `ConsoleNav`, then asserting the mounted
  nav marker and Hebrew heading copy are present.

## Integration Tests

- `renders login placeholder page`: navigates to `/login` and asserts `<main>`
  visibility, heading text (`עמוד כניסה`), and presence of the home link.
