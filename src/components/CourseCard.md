# CourseCard

## Overview

CourseCard renders a compact course tile matching the course card layout in
`src/assets/course-pic.webp`. It accepts a `CourseRecord` from
`src/lib/indexeddb.ts` and shows a status dot, two numeric meta values, the
course title, and the course code. The status dot color is derived from the
course code using an FNV-1a hash mapped into an HSL color.

## Template Structure

- Root `article` with rounded border, `text-xs`, `min-w-fit` sizing behavior,
  and `h-full` height so it can stretch with its parent container.
- Top row contains the status dot and meta numbers.
- Bottom block shows the title (clamped up to three lines) and the course code.

## Data Flow

1. `CourseCard(course, options)` clones the HTML template.
2. If `course` is undefined, `applySkeleton()` sets `data-skeleton="true"` and
   `aria-busy="true"` on the root. The template uses `group-data` selectors to
   show the shimmer placeholders; all text content is cleared so only the
   skeleton blocks are visible.
3. When data is present, `data-skeleton` and `aria-busy` are removed, then the
   title, code, points, and median are populated. Missing values fall back to
   `—` and a default title.
4. The status dot color is derived from the course code hash into HSL unless
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
- Card sizing is controlled by the parent wrapper (for example search and
  semester page links): wrappers provide explicit heights (`h-[7.5rem]` mobile,
  `sm:h-[6.5rem]`), while `CourseCard` keeps `h-full` so it fills that slot.
- For long result lists, wrappers should pair those heights with
  `content-visibility: auto` and matching `contain-intrinsic-size` values to
  defer offscreen rendering without layout jumps.
- For responsive sizing by screen width (same pattern as search page), set the
  mobile default first and then override at breakpoints, for example:
  `h-[7.5rem] sm:h-[6.5rem]` together with
  `[contain-intrinsic-size:7.5rem] sm:[contain-intrinsic-size:6.5rem]`.
  This keeps the placeholder size aligned with the actual card height at each
  breakpoint.
- Keep spacing around course cards on the `2` scale for consistency with search
  and semester layouts: use `gap-2` between cards and prefer matching
  `p-2`/`m-2` when local wrappers need padding or margins around the card area.
