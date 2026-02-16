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

- `renders a root element`: validates the page factory returns an `HTMLElement`.
- `mounts console navigation and login placeholder copy`: validates nav mount and
  placeholder heading text.

## Integration Tests

- `login_page.spec.ts` validates `/login` route render, heading visibility, and
  home link availability.
