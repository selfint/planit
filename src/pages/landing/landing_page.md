# /landing

High-level design for the landing page. This is a client-side route in the single-page application.

## Purpose

Introduce Planit, highlight the value quickly, and guide users into the planner experience.

## Core UI

- Hero section with product name, short value statement, and primary CTA (start planning).
- Secondary CTA (view demo or explore features).
- Feature overview section with video previews and short text descriptions.
- Trust or context strip (offline-first, sync, Technion degree focus).

## Key Behaviors

- Hero CTAs route into the main app flow without full reload.
- Video previews are lightweight, poster-first, and play on user action.
- Feature cards link to the relevant routes (/plan, /catalog, /search, /semester, /course).

## Data

- Static content; no IndexedDB dependency.
- Video preview assets loaded lazily to keep the initial paint fast.

## Edge Cases

- If video previews fail to load, show a poster image and keep text visible.
- On small screens, features stack vertically with the video above text.
