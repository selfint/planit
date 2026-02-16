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

### `renders a root element`

WHAT: Verifies the login page factory returns a valid root element.
WHY: Catches template parsing failures early in route-level placeholder pages.
HOW: Calls `LoginPage()` and asserts the output type.

```python
page = LoginPage()
assert isinstance(page, HTMLElement)
```

### `mounts console navigation and login placeholder copy`

WHAT: Verifies static placeholder content and nav composition are mounted.
WHY: Ensures login route stays navigable even before auth form implementation.
HOW: Mocks `ConsoleNav`, renders page, then asserts nav marker and heading text presence.

```python
mock(ConsoleNav).returns(marker('ConsoleNav'))
page = LoginPage()
assert page.query('[data-component="ConsoleNav"]') is not None
assert 'עמוד כניסה' in page.text
```

## Integration Tests

### `renders login placeholder page`

WHAT: Verifies end-to-end rendering of the `/login` placeholder route.
WHY: Confirms routing, content visibility, and fallback navigation all work in-browser.
HOW: Navigates to `/login`, then checks main region, heading, and home-link selector.

```python
page.goto('/login')
assert page.main().is_visible()
assert page.heading('עמוד כניסה').is_visible()
assert page.locator('a[href="/"]').is_visible()
```
