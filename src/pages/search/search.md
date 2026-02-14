# /search

High-level design for course search. This is a client-side route in the single-page application.

## Purpose

Enable fast text-based search across all courses in the selected degree.

## Core UI

- Search input with instant results list.
- Filters for all available course attributes (faculty, median, points, semester availability, requirement group, and more).
- Result cards showing code, title, credits, and availability summary.

## Key Behaviors

- Debounced text search over IndexedDB data.
- Results update as the user types; no submit required.
- Selecting a result opens the course page route.

## Data

- Source: course data from IndexedDB.
- Derived: match highlights and availability badges.

## Edge Cases

- If no matches, show an empty state with tips.
- If the catalog is still syncing, show partial results with a subtle syncing indicator.
