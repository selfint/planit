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
    for route_dir, base_name in sorted(route_bases, key=lambda item: str(item[0] / item[1])):
        for suffix in REQUIRED_SUFFIXES:
            expected_file = route_dir / f'{base_name}{suffix}'
            if not expected_file.exists():
                missing.append(str(expected_file.relative_to(repo_root)))

    if missing:
        print('Missing page route files:', file=sys.stderr)
        for path in missing:
            print(path, file=sys.stderr)
        return 1

    print(
        'All page routes have .html, .ts, .stories.ts, .spec.ts, .test.ts, and .md files.'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
