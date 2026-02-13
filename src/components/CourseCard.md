# CourseCard

## Overview

CourseCard renders a compact course tile matching the course card layout in
`src/assets/course-pic.webp`. It accepts a `CourseRecord` from
`src/lib/indexeddb.ts` and shows a status dot, two numeric meta values, the
course title, and the course code.

## Template Structure

- Root `article` with rounded border and surface styling.
- Top row contains the status dot and meta numbers.
- Bottom block shows the title and the code.

## Data Flow

1. `CourseCard(course, options)` clones the HTML template.
2. When `course` is undefined, the card renders a shimmer skeleton for each
   text row and a square status dot placeholder.
3. Course data populates title, code, points, and median; empty values fall back
   to `—` and a default title.
4. Optional `statusClass` overrides the status dot color.

## Dependencies

- Template: `src/components/CourseCard.html`.
- Types: `src/lib/indexeddb.ts` (`CourseRecord`).

## Notes

- The template uses Hebrew copy to match the RTL UI.
- Skeleton shimmer uses the `skeleton-shimmer` utility defined in
  `src/style.css`.
