# Catalog Page

## Overview

The catalog page is the `/catalog` route for browsing requirement groups and
their courses from local IndexedDB data.

## Page Contents

- Console navigation mounted with `/catalog` active state.
- Degree selection panel mounted from `src/pages/catalog/components/DegreePicker.ts`.
- Requirement-group sections with title, subtitle, page label, and next/previous controls.
- Course cards rendered as links to `/course?code=<code>`.
- Info states for waiting, loading, pending picker sync, empty path, and missing requirements.

## Data Flow

1. `CatalogPage()` mounts `DegreePicker()` and immediately renders lightweight
   skeleton rows using `CourseCard` placeholders.
2. The page reads active selection via `getActiveRequirementsSelection()` and
   program requirements via `getRequirement(programId)` from IndexedDB.
3. The requirement tree is filtered with `filterRequirementsByPath()` and then
   flattened into course-bearing requirement groups.
4. Each course code resolves to optional course details using `getCourse(code)`.
5. Courses render as linked `CourseCard` entries (`/course?code=<code>`).
6. Cards per page are viewport-aware: 3 on mobile widths and 9 on tablet and wider widths.
7. Cards inside each requirement are sorted by course median (highest first),
   and non-current courses (`current !== true`) are dimmed visually.
8. If picker values are changing and are not yet in sync with persisted
   selection, the requirements panel stays hidden until picker state is ready.
9. Degree picker changes, requirement table mutations, and window resize trigger
   a debounced re-render of the requirement-group panel.

## Unit Tests

### `renders waiting state when no active selection exists`

WHAT: Verifies the page renders a waiting prompt when no selection is stored.
WHY: Avoids showing stale or incorrect requirement groups before the user picks a track.
HOW: Mocks active selection as `undefined`, renders the page, then asserts the state text content.

```python
mock(getActiveRequirementsSelection).returns(None)
page = CatalogPage()
wait_for_ui()
assert 'בחרו תכנית ומסלול' in page.query('[data-catalog-state]').text
```

### `renders one page of three course cards and supports paging`

WHAT: Verifies card ordering, page size, and next-page navigation.
WHY: Ensures requirement browsing stays predictable on mobile-sized rendering.
HOW: Mocks selection + requirements + courses with medians, checks first-page order and dimming, clicks `הבא`, then checks second-page contents.

```python
set_viewport(width=620)
mock_active_selection_and_requirement_data()
mock_courses_with_medians_and_current_flags()
page = CatalogPage(); wait_for_ui()
assert first_page_links(page) == ['236363', '236501', '234123']
assert link_for('236501').has_class('opacity-70')
click_button('הבא'); wait_for_ui()
assert current_page_links(page) == ['236343']
```

### `hides rendered requirements while picker selection is changing`

WHAT: Verifies requirement cards disappear during transient picker state.
WHY: Prevents flashing mismatched requirements while selection inputs are mid-update.
HOW: Renders loaded page, clears program select, dispatches `change`, then checks cards are gone and pending copy is displayed.

```python
page = CatalogPage(); wait_for_ui()
program_select = page.query('[data-degree-program]')
program_select.value = ''
program_select.dispatch('change')
wait_for_ui()
assert count('[data-component="CourseCard"]') == 0
assert 'מעדכן בחירה' in page.query('[data-catalog-state]').text
```

### `renders three cards per page on narrow mobile width`

WHAT: Verifies mobile page-size behavior for requirement cards.
WHY: Keeps the layout readable and horizontal scroll manageable on narrow screens.
HOW: Sets narrow viewport, renders with mocked data, and asserts first page contains exactly three course links.

```python
set_viewport(width=430)
mock_selection_and_courses()
page = CatalogPage(); wait_for_ui()
assert count('a[href^="/course?code="]') == 3
```

### `renders nine cards per page on tablet and wider view`

WHAT: Verifies larger viewport page-size behavior.
WHY: Uses available width efficiently on tablet/desktop without unnecessary paging.
HOW: Sets wide viewport, renders with 10 mock courses, and asserts first page shows nine links.

```python
set_viewport(width=900)
mock_selection_and_ten_courses()
page = CatalogPage(); wait_for_ui()
assert count('a[href^="/course?code="]') == 9
```

## Integration Tests

### `renders catalog route and picker section`

WHAT: Verifies core catalog route shell elements are visible in-browser.
WHY: Confirms routing and primary interactive regions are mounted end-to-end.
HOW: Navigates to `/catalog` and asserts visibility of `<main>`, degree picker select, and group container.

```python
page.goto('/catalog')
assert page.main().is_visible()
assert page.locator('[data-degree-catalog]').is_visible()
assert page.locator('[data-catalog-groups]').is_visible()
```
