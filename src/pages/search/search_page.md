# Search Page

## Overview

The search page is the `/search` route and provides fast, local course lookup over IndexedDB without waiting for network responses.

## Page Contents

- A search form with text input, submit button, clear button, and quick suggestion chips.
- Live status text for search progress, result count, and latest sync metadata.
- A responsive results grid that renders `CourseCard` items.
- An empty/error panel for no-query, no-results, and failure states.

## Data Flow

1. The page reads the initial `q` query parameter from the browser URL.
2. User input is normalized and debounced before calling `searchCourses` from `$lib/indexeddb`.
3. Matching `CourseRecord` items are rendered into linked `CourseCard` nodes in the results grid.
4. The current query is written back to the URL with `history.replaceState` and sync metadata is read from `getMeta('courseDataLastSync')`.

## Unit Tests

- Validates the results container keeps a 3+ columns grid contract (`grid-cols-3`, `sm:grid-cols-4`).
- Validates URL query bootstrapping calls search and renders linked course cards.

## Integration Tests

- Validates `/search` route renders the main heading, search field, and results container.
