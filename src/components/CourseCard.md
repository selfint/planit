# CourseCard

## Overview

CourseCard renders a compact course tile matching the course card layout in
`src/assets/course-pic.webp`. It accepts a `CourseRecord` from
`src/lib/indexeddb.ts` and shows a status dot, two numeric meta values, the
course title, and the course code. The status dot color is derived from the
course code using a small hash and a fixed palette.

## Template Structure

- Root `article` with rounded border, `text-xs`, `min-w-fit` sizing behavior,
  and strict fixed height.
- Top row contains the status dot and meta numbers.
- Bottom block reserves exactly three lines for the title and one line for the
  course code.

## Data Flow

1. `CourseCard(course, options)` clones the HTML template.
2. If `course` is undefined, `applySkeleton()` sets `data-skeleton="true"` and
   `aria-busy="true"` on the root. The template uses `group-data` selectors to
   show the shimmer placeholders; all text content is cleared so only the
   skeleton blocks are visible.
3. When data is present, `data-skeleton` and `aria-busy` are removed, then the
   title, code, points, and median are populated. Missing values fall back to
   `—` and a default title.
4. The status dot color is derived from the course code hash unless
   `statusClass` is provided in `options`.

## Dependencies

- Template: `src/components/CourseCard.html`.
- Types: `src/lib/indexeddb.ts` (`CourseRecord`).

## Notes

- The template uses Hebrew copy to match the RTL UI.
- Skeleton shimmer uses the `skeleton-shimmer` utility defined in
  `src/style.css`.
- The shimmer only applies while `data-skeleton="true"` is present on the root
  element.
