# /semester

High-level design for a single-semester focus view. This is a client-side route in the single-page application.

## Purpose

Let users focus on one semester and browse all courses that could be taken then, including ineligible ones.

## Core UI

- Semester header with term name and credit totals.
- Course list for the semester, including ineligible courses.
- Ineligible courses appear grayed out with a note explaining why in the card header.

## Key Behaviors

- Eligibility is derived from prerequisites and semester availability.
- Ineligible cards are visible but clearly disabled.
- Adding a course updates the plan and returns to the list state.

## Data

- Source: semester plan from IndexedDB and full course catalog.
- Derived: eligibility and reason (missing prereq, not offered, credit limit).

## Edge Cases

- Multiple ineligibility reasons are prioritized with a single clear message.
- If no courses are offered that term, still show the list with availability notes.
