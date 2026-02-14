# /course

High-level design for a course detail page. This is a client-side route in the single-page application.

## Purpose

Show full details for a single course, including its semester placement (if any), requirement mapping, and key stats like median, faculty, points, and connections.

## Core UI

- Course header with code, title, credits, and availability.
- Sections for description, prerequisites, co-requisites, and requirements mapping.
- Actions: add to semester, add to wishlist, add to exemptions, view in plan, and view in catalog group.

## Key Behaviors

- Data loads from IndexedDB and is cached in memory.
- If the course is already in the plan, show its current semester.
- Actions update IndexedDB and reflect immediately in the UI.

## Data

- Source: course data and degree requirements from IndexedDB.
- Derived: placement in semester, requirements mapping, and unmet prerequisites.

## Edge Cases

- If the course is not found, show a 404-style empty state with search link.
- If data is partially synced, show what is available and a subtle sync indicator.
