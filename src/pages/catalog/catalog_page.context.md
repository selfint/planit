# Catalog Page

## Overview

The catalog page is the `/catalog` route for browsing requirement groups and
their courses from local IndexedDB data.

## Page Contents

- Console navigation mounted with `/catalog` active state.
- Degree selection panel mounted from `src/pages/catalog/components/DegreePicker.ts`.
- Requirement-group sections with title, subtitle, and horizontal course rows.
- Course cards rendered as links to `/course?code=<code>`.
- Info states for waiting, loading, pending picker sync, empty path, and missing requirements.
- Rows use `content-visibility: auto` with intrinsic-size hints and horizontal overflow containment.
- Card intrinsic sizes are aligned to real card breakpoints (`base`/`sm`/`lg`) so deferred rendering preserves row geometry.
- Row containers intentionally use zero row-level margin/padding so mobile/tablet rows span the full section width.
- Page gutters are applied per element in 1-column layouts and collapse at `xl` (2-column view), while course-row scrollers remain gutter-free.

## Data Flow

1. `CatalogPage()` mounts `DegreePicker()` and immediately renders lightweight
   skeleton rows using `CourseCard` placeholders.
2. The page reads active selection via global `state.userDegree.get()` and
   program requirements via `state.requirements.get(programId)`.
3. The requirement tree is filtered with `filterRequirementsByPath()` and then
   flattened into course-bearing requirement groups.
4. Each course code resolves to optional course details using `state.courses.get(code)`.
5. Courses render as linked `CourseCard` entries (`/course?code=<code>`).
6. All cards in each requirement group render in one horizontally scrollable row.
7. Cards inside each requirement are sorted by course median (highest first),
   and non-current courses (`current !== true`) are dimmed visually.
8. If picker values are changing and are not yet in sync with persisted
   selection, the requirements panel stays hidden until picker state is ready.
9. Degree picker changes, requirement table mutations, and window resize trigger
   a debounced re-render of the requirement-group panel.

## Unit Tests

These are Vitest/jsdom tests focused on logic implemented in
`catalog_page.ts` (state transitions and render decisions) with
mocked data dependencies.

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

### `renders all group cards in a single sorted row without paging`

WHAT: Verifies card ordering and no-paging row rendering.
WHY: Ensures requirement browsing stays predictable with a single-row interaction model.
HOW: Mocks selection + requirements + courses with medians, checks full sorted order in one row, and confirms pager UI is absent.

```python
set_viewport(width=620)
mock_active_selection_and_requirement_data()
mock_courses_with_medians_and_current_flags()
page = CatalogPage(); wait_for_ui()
assert row_links(page) == ['236363', '236501', '234123', '236343']
assert link_for('236501').has_class('opacity-70')
assert not exists('[data-catalog-group-page]')
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

### `renders all cards on narrow mobile width without pager controls`

WHAT: Verifies mobile width still renders the full row without paging controls.
WHY: Keeps behavior consistent across viewport sizes.
HOW: Sets narrow viewport, renders mocked data, and asserts all links are present and pager controls are absent.

```python
set_viewport(width=430)
mock_selection_and_courses()
page = CatalogPage(); wait_for_ui()
assert count('a[href^="/course?code="]') == 4
assert not exists('[data-catalog-group-page]')
```

### `renders all cards on tablet and wider view without pager controls`

WHAT: Verifies larger viewport also renders the full row with no pager.
WHY: Keeps behavior consistent and avoids viewport-specific paging logic.
HOW: Sets wide viewport, renders with 10 mock courses, and asserts all 10 links are visible.

```python
set_viewport(width=900)
mock_selection_and_ten_courses()
page = CatalogPage(); wait_for_ui()
assert count('a[href^="/course?code="]') == 10
```

## Integration Tests

These are Playwright route tests that validate browser navigation and visible
page regions end-to-end.

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
