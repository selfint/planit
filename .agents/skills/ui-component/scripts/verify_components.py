from __future__ import annotations

from pathlib import Path
import sys


REQUIRED_EXTENSIONS = ('.ts', '.html', '.stories.ts', '.md')


def find_repo_root(start: Path) -> Path | None:
    for candidate in [start, *start.parents]:
        if (candidate / 'src' / 'components').is_dir():
            return candidate
    return None


def main() -> int:
    script_path = Path(__file__).resolve()
    repo_root = find_repo_root(script_path)
    if repo_root is None:
        print('Unable to locate repo root with src/components.', file=sys.stderr)
        return 2

    components_dir = repo_root / 'src' / 'components'
    entries = [path for path in components_dir.iterdir() if path.is_file()]
    component_names: set[str] = set()
    for path in entries:
        name = path.name
        if name.startswith('.'):
            continue
        if name.endswith('.stories.ts'):
            component_names.add(name[: -len('.stories.ts')])
            continue
        for ext in ('.ts', '.html', '.md'):
            if name.endswith(ext):
                component_names.add(name[: -len(ext)])
                break

    missing: list[str] = []
    for component in sorted(component_names):
        for ext in REQUIRED_EXTENSIONS:
            file_path = components_dir / f'{component}{ext}'
            if not file_path.exists():
                missing.append(str(file_path.relative_to(repo_root)))

    if missing:
        print('Missing component files:', file=sys.stderr)
        for entry in missing:
            print(entry, file=sys.stderr)
        return 1

    print('All components have .ts, .html, .stories.ts, and .md files.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
