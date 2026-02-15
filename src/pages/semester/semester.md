# Semester Page

## Overview

The semester page displays a focused view of one semester from the URL query,
for example `/semester?number=3`.

It separates three course scopes:

1. Courses currently in the selected semester.
2. Other courses from the active user catalog.
3. All remaining non-catalog courses grouped by faculty under:
   `בחירה חופשית: <פקולטה>`.

## ASCII Layout

### Desktop (>=1024)

```text
סמסטר 3 • חורף תשפ"ז

2-column page layout

+------------------------------------------+  +------------------------------------------------------+
| קורסי הסמסטר הנבחר                       |  | קורסים נוספים מהקטלוג                                |
| (עמודה קבועה: כרטיס אחד בכל שורה)        |  | [CourseCard] [CourseCard] [CourseCard] [CourseCard] |
| [CourseCard]                             |  | [CourseCard] [CourseCard] [CourseCard] [CourseCard] |
| [CourseCard]                             |  +------------------------------------------------------+
| [CourseCard]                             |
| [CourseCard]                             |  בחירה חופשית: מדעי המחשב
+------------------------------------------+  [CourseCard] [CourseCard] [CourseCard] [CourseCard] [CourseCard]
                                              [CourseCard]

                                              בחירה חופשית: מתמטיקה
                                              [CourseCard] [CourseCard] [CourseCard] [CourseCard]

                                              בחירה חופשית: פיזיקה
                                              [CourseCard] [CourseCard] [CourseCard]
```

### Mobile (<1024)

```text
סמסטר 3 • חורף תשפ"ז

קורסי הסמסטר הנבחר
[CourseCard]
[CourseCard]
[CourseCard]

קורסים נוספים מהקטלוג
[CourseCard]
[CourseCard]
[CourseCard]

בחירה חופשית: מדעי המחשב
[CourseCard]
[CourseCard]
[CourseCard]

בחירה חופשית: מתמטיקה
[CourseCard]
[CourseCard]

בחירה חופשית: פיזיקה
[CourseCard]
```

## Layout Notes

- The main title only shows semester number, year, and season.
- Desktop uses a 2-column layout.
- The selected semester is the side column with one course card per row.
- The right column contains all other groups and may render multiple courses per row.
- Mobile places the current semester block first, then all other groups.
- Each non-semester group is rendered as a title plus one course row (catalog style),
  without wrapping each group in a card container.
- The rest of the catalog courses appear right after the current semester section.
- Non-catalog courses are grouped by faculty with titles in the format
  `בחירה חופשית: <פקולטה>`.
- Mobile collapses to a single column.
