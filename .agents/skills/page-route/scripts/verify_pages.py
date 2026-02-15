#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path
import sys


REQUIRED_SUFFIXES = (
    '.html',
    '.ts',
    '.stories.ts',
    '.spec.ts',
    '.test.ts',
    '.md',
)


def reads_framework_import(path: Path, package_name: str) -> bool:
    try:
        contents = path.read_text(encoding='utf-8')
    except OSError:
        return False

    return (
        f"from '{package_name}'" in contents
        or f'from "{package_name}"' in contents
        or f"require('{package_name}')" in contents
        or f'require("{package_name}")' in contents
    )


def find_repo_root(start: Path) -> Path | None:
    for candidate in [start, *start.parents]:
        if (candidate / 'src' / 'pages').is_dir():
            return candidate
    return None


def extract_base_name(path: Path) -> str | None:
    name = path.name
    if '_page' not in name:
        return None

    for suffix in REQUIRED_SUFFIXES:
        if name.endswith(suffix):
            base = name[: -len(suffix)]
            if base.endswith('_page'):
                return base
    return None


def main() -> int:
    script_path = Path(__file__).resolve()
    repo_root = find_repo_root(script_path)
    if repo_root is None:
        print('Unable to locate repo root with src/pages.', file=sys.stderr)
        return 2

    pages_dir = repo_root / 'src' / 'pages'
    page_files = [path for path in pages_dir.rglob('*') if path.is_file()]

    route_bases: set[tuple[Path, str]] = set()
    for path in page_files:
        base_name = extract_base_name(path)
        if base_name is None:
            continue
        route_bases.add((path.parent, base_name))

    if not route_bases:
        print('No *_page route files found under src/pages.')
        return 0

    missing: list[str] = []
    invalid_playwright_specs: list[str] = []
    invalid_vitest_tests: list[str] = []
    invalid_storybook_stories: list[str] = []

    for route_dir, base_name in sorted(route_bases, key=lambda item: str(item[0] / item[1])):
        for suffix in REQUIRED_SUFFIXES:
            expected_file = route_dir / f'{base_name}{suffix}'
            if not expected_file.exists():
                missing.append(str(expected_file.relative_to(repo_root)))

        spec_file = route_dir / f'{base_name}.spec.ts'
        if spec_file.exists() and not reads_framework_import(spec_file, '@playwright/test'):
            invalid_playwright_specs.append(str(spec_file.relative_to(repo_root)))

        test_file = route_dir / f'{base_name}.test.ts'
        if test_file.exists() and not reads_framework_import(test_file, 'vitest'):
            invalid_vitest_tests.append(str(test_file.relative_to(repo_root)))

        stories_file = route_dir / f'{base_name}.stories.ts'
        if stories_file.exists() and not reads_framework_import(
            stories_file, '@storybook/html'
        ):
            invalid_storybook_stories.append(
                str(stories_file.relative_to(repo_root))
            )

    if missing:
        print('Missing page route files:', file=sys.stderr)
        for path in missing:
            print(path, file=sys.stderr)
        return 1

    if invalid_playwright_specs:
        print('Invalid page route .spec.ts files (must import @playwright/test):', file=sys.stderr)
        for path in invalid_playwright_specs:
            print(path, file=sys.stderr)
        return 1

    if invalid_vitest_tests:
        print('Invalid page route .test.ts files (must import vitest):', file=sys.stderr)
        for path in invalid_vitest_tests:
            print(path, file=sys.stderr)
        return 1

    if invalid_storybook_stories:
        print(
            'Invalid page route .stories.ts files (must import @storybook/html):',
            file=sys.stderr,
        )
        for path in invalid_storybook_stories:
            print(path, file=sys.stderr)
        return 1

    print(
        'All page routes have .html, .ts, .stories.ts, .spec.ts, .test.ts, and .md files, and use Playwright/Vitest/Storybook imports in route tests and stories.'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
