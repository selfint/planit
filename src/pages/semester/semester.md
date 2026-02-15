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
+--------------------------------------------------------------------------------------------------+
| /semester?number=3                                                                               |
| סמסטר 3 • תצוגת סמסטר                                                                            |
| קורסים מהסמסטר מודגשים בנפרד, מתחתיהם קורסים נוספים מהקטלוג והרחבות לפי פקולטה                 |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------+  +-------------------------------------------+
| קורסי הסמסטר הנבחר (סמסטר 3)                     |  | קורסים נוספים מהקטלוג                    |
| [CourseCard] [CourseCard] [CourseCard]           |  | [CourseCard] [CourseCard] [CourseCard]   |
| [CourseCard] [CourseCard] [CourseCard]           |  | [CourseCard] [CourseCard] [CourseCard]   |
+--------------------------------------------------+  +-------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| בחירה חופשית: מדעי המחשב                                                                        |
| [CourseCard] [CourseCard] [CourseCard] [CourseCard] [CourseCard] [CourseCard]                  |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| בחירה חופשית: מתמטיקה                                                                           |
| [CourseCard] [CourseCard] [CourseCard] [CourseCard]                                             |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| בחירה חופשית: פיזיקה                                                                            |
| [CourseCard] [CourseCard] [CourseCard]                                                          |
+--------------------------------------------------------------------------------------------------+
```

### Mobile (<1024)

```text
+----------------------------------------------+
| /semester?number=3                           |
| סמסטר 3 • תצוגת סמסטר                        |
+----------------------------------------------+

+----------------------------------------------+
| קורסי הסמסטר הנבחר (סמסטר 3)                 |
| [CourseCard]                                 |
| [CourseCard]                                 |
| [CourseCard]                                 |
+----------------------------------------------+

+----------------------------------------------+
| קורסים נוספים מהקטלוג                        |
| [CourseCard]                                 |
| [CourseCard]                                 |
| [CourseCard]                                 |
+----------------------------------------------+

+----------------------------------------------+
| בחירה חופשית: מדעי המחשב                     |
| [CourseCard]                                 |
| [CourseCard]                                 |
| [CourseCard]                                 |
+----------------------------------------------+

+----------------------------------------------+
| בחירה חופשית: מתמטיקה                        |
| [CourseCard]                                 |
| [CourseCard]                                 |
+----------------------------------------------+

+----------------------------------------------+
| בחירה חופשית: פיזיקה                         |
| [CourseCard]                                 |
+----------------------------------------------+
```

## Layout Notes

- The selected semester courses are visually separated in a dedicated top block.
- The rest of the catalog courses appear right after the semester block.
- Non-catalog courses are grouped by faculty with titles in the format
  `בחירה חופשית: <פקולטה>`.
- Desktop uses denser multi-column grids; mobile collapses to a single column.
