# /catalog

High-level design for browsing the degree catalog. This is a client-side route in the single-page application.

## Purpose

Let users explore all courses for the selected degree, grouped by requirement areas.

## Core UI

- Requirement groups as sections.
- Course list cards inside each requirement group.
- Degree selector at top with last selection persisted.

## Key Behaviors

- Loading uses IndexedDB as the source of truth; no network blocking.
- Each requirement group shows completion status based on the current plan.
- Tapping a course opens its course page route.

## Data

- Source: degree requirements from catalogs data in IndexedDB.
- Derived: requirement completion (completed/planned/total).
    - Completed means all courses in semesters before the user's current semester.

## Edge Cases

- If a requirement has no courses (data issue), show an inline notice in that group.
- If degree selection changes, update groups and completion state without full reload.
