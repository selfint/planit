export type RequirementNode = {
    name?: string;
    en?: string;
    he?: string;
    courses?: string[];
    nested?: RequirementNode[];
};

export type PathOption = {
    id: string;
    label: string;
    node: RequirementNode;
};

export function detectPathOptions(root?: RequirementNode): RequirementNode[] {
    if (root?.nested === undefined) {
        return [];
    }

    return root.nested.filter((node) => isPathNode(node));
}

export function buildPathOptions(root?: RequirementNode): PathOption[] {
    return detectPathOptions(root)
        .map((node) => {
            const id = getRequirementId(node);
            if (id === undefined) {
                return undefined;
            }
            return {
                id,
                label: getRequirementLabel(node, id),
                node,
            } satisfies PathOption;
        })
        .filter((option): option is PathOption => option !== undefined);
}

export function filterRequirementsByPath(
    root: RequirementNode,
    selectedPath?: string
): RequirementNode {
    if (root.nested === undefined) {
        return root;
    }

    const pathOptions = detectPathOptions(root);
    if (pathOptions.length === 0 || selectedPath === undefined) {
        return root;
    }

    const selected = pathOptions.find(
        (node) => getRequirementId(node) === selectedPath
    );
    if (selected === undefined) {
        return root;
    }

    const electives = root.nested.filter((node) => isElectiveNode(node));
    const selectedNested = Array.isArray(selected.nested)
        ? selected.nested
        : [];

    return {
        ...root,
        nested: [...selectedNested, ...electives],
    };
}

export function countUniqueCourses(node?: RequirementNode): number {
    if (node === undefined) {
        return 0;
    }

    const courses = new Set<string>();
    collectCourses(node, courses);
    return courses.size;
}

export function getRequirementLabel(
    node: RequirementNode,
    fallback: string
): string {
    if (typeof node.he === 'string' && node.he.length > 0) {
        return node.he;
    }
    if (typeof node.en === 'string' && node.en.length > 0) {
        return node.en;
    }
    return fallback;
}

export function getRequirementId(node: RequirementNode): string | undefined {
    if (typeof node.name === 'string' && node.name.length > 0) {
        return node.name;
    }
    if (typeof node.en === 'string' && node.en.length > 0) {
        return node.en;
    }
    return undefined;
}

function collectCourses(node: RequirementNode, courses: Set<string>): void {
    if (Array.isArray(node.courses)) {
        for (const course of node.courses) {
            if (typeof course === 'string' && course.length > 0) {
                courses.add(course);
            }
        }
    }

    if (Array.isArray(node.nested)) {
        for (const child of node.nested) {
            collectCourses(child, courses);
        }
    }
}

function isPathNode(node: RequirementNode): boolean {
    if (typeof node.he === 'string') {
        const normalized = node.he.toLowerCase();
        return (
            node.he.includes('מסלול') ||
            node.he.includes('נתיב') ||
            normalized.includes('path')
        );
    }

    if (typeof node.en === 'string') {
        return node.en.toLowerCase().includes('path');
    }

    return false;
}

function isElectiveNode(node: RequirementNode): boolean {
    if (typeof node.he === 'string') {
        return node.he.includes('בחירה');
    }

    if (typeof node.en === 'string') {
        return node.en.toLowerCase().includes('elective');
    }

    return false;
}
