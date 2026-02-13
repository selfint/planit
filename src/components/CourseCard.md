# CourseCard

## Overview

CourseCard renders a compact course tile matching the course card layout in
`src/assets/course-pic.webp`. It shows a status dot, two numeric meta values,
the course title, and the course code.

## Template Structure

- Root `article` with rounded border and surface styling.
- Top row contains the status dot and meta numbers.
- Bottom block shows the title and the code.

## Data Flow

1. `CourseCard()` clones the HTML template.
2. Optional data overrides default values for title, code, points, median, and
   status color class.
3. Text content and status dot class are applied to data-role elements.

## Dependencies

- Template: `src/components/CourseCard.html`.

## Notes

- The template uses Hebrew copy to match the RTL UI.
