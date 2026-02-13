#!/usr/bin/env python3

from __future__ import annotations

import os
import sys
from typing import Iterable, List, Sequence, Tuple


ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")
)
LIB_DIR = os.path.join(ROOT, "src", "lib")


def list_modules(lib_dir: str) -> List[str]:
    modules = []
    for name in os.listdir(lib_dir):
        if not name.endswith(".ts"):
            continue
        if name.endswith(".test.ts"):
            continue
        modules.append(name[:-3])
    return sorted(modules)


def check_files(module: str) -> List[str]:
    missing = []
    ts_path = os.path.join(LIB_DIR, f"{module}.ts")
    test_path = os.path.join(LIB_DIR, f"{module}.test.ts")
    md_path = os.path.join(LIB_DIR, f"{module}.md")

    if not os.path.exists(ts_path):
        missing.append(ts_path)
    if not os.path.exists(test_path):
        missing.append(test_path)
    if not os.path.exists(md_path):
        missing.append(md_path)

    return missing


def find_orphans(lib_dir: str) -> Tuple[List[str], List[str]]:
    md_orphans: List[str] = []
    test_orphans: List[str] = []

    for name in os.listdir(lib_dir):
        if name.endswith(".md"):
            base = name[:-3]
            ts_path = os.path.join(lib_dir, f"{base}.ts")
            if not os.path.exists(ts_path):
                md_orphans.append(os.path.join(lib_dir, name))
        if name.endswith(".test.ts"):
            base = name[:-8]
            ts_path = os.path.join(lib_dir, f"{base}.ts")
            if not os.path.exists(ts_path):
                test_orphans.append(os.path.join(lib_dir, name))

    return sorted(md_orphans), sorted(test_orphans)


def format_list(title: str, paths: Sequence[str]) -> str:
    if not paths:
        return ""
    lines = [title]
    lines.extend(f"  - {path}" for path in paths)
    return "\n".join(lines)


def main() -> int:
    if not os.path.isdir(LIB_DIR):
        print(f"src/lib directory not found at {LIB_DIR}")
        return 2

    modules = list_modules(LIB_DIR)
    missing_files: List[str] = []
    for module in modules:
        missing_files.extend(check_files(module))

    md_orphans, test_orphans = find_orphans(LIB_DIR)

    if missing_files or md_orphans or test_orphans:
        if missing_files:
            print(format_list("Missing required files:", missing_files))
        if md_orphans:
            print(format_list("Orphaned .md docs (no matching .ts):", md_orphans))
        if test_orphans:
            print(
                format_list("Orphaned .test.ts files (no matching .ts):", test_orphans)
            )
        return 1

    print("All src/lib modules have .ts, .test.ts, and .md files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
