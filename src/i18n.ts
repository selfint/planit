import translations from './i18n/he.json';

type TranslationMeta = {
    lang?: string;
    dir?: string;
    title?: string;
};

type TranslationData = {
    meta?: TranslationMeta;
    [key: string]: unknown;
};

let activeTranslations: TranslationData = translations;

type InitI18nOptions = {
    lang?: string;
    root?: ParentNode;
};

function getValue(data: TranslationData, path: string[]): unknown {
    return path.reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, data);
}

function applyMeta(meta?: TranslationMeta): void {
    if (!meta) {
        return;
    }

    if (meta.lang) {
        document.documentElement.lang = meta.lang;
    }

    if (meta.dir) {
        document.documentElement.dir = meta.dir;
    }

    if (meta.title) {
        document.title = meta.title;
    }
}

function parseI18nAttribute(name: string): {
    attribute?: string;
    path: string[];
} | null {
    const prefix = 'data-i18n-';
    if (!name.startsWith(prefix)) {
        return null;
    }

    const parts = name.slice(prefix.length).split('-').filter(Boolean);
    if (parts.length === 0) {
        return null;
    }

    if (parts[0] === 'alt') {
        return { attribute: 'alt', path: parts.slice(1) };
    }

    if (parts[0] === 'title') {
        return { attribute: 'title', path: parts.slice(1) };
    }

    if (parts[0] === 'placeholder') {
        return { attribute: 'placeholder', path: parts.slice(1) };
    }

    if (parts[0] === 'aria' && parts[1] === 'label') {
        return { attribute: 'aria-label', path: parts.slice(2) };
    }

    return { path: parts };
}

function applyTranslations(root: ParentNode, data: TranslationData): void {
    const nodes = root.querySelectorAll<HTMLElement>('*');
    nodes.forEach((node) => {
        Array.from(node.attributes).forEach((attribute) => {
            const info = parseI18nAttribute(attribute.name);
            if (!info) {
                return;
            }
            const value = getValue(data, info.path);
            if (typeof value !== 'string') {
                return;
            }
            if (info.attribute) {
                node.setAttribute(info.attribute, value);
            } else {
                node.textContent = value;
            }
        });
    });
}

export async function initI18n(options: InitI18nOptions = {}): Promise<void> {
    const root = options.root ?? document;
    const lang = options.lang ?? activeTranslations.meta?.lang ?? 'he';

    applyMeta(activeTranslations.meta);
    applyTranslations(root, activeTranslations);
    document.dispatchEvent(
        new CustomEvent('i18n:loaded', { detail: { lang } })
    );
}
