import translations from './i18n/he.json';

type TranslationMeta = {
    lang: 'he';
    dir?: 'ltr' | 'rtl';
    title?: string;
};

type TranslationData = {
    meta?: TranslationMeta;
    [key: string]: unknown;
};

const activeTranslations = translations as TranslationData;

type InitI18nOptions = {
    lang?: string;
    root: ParentNode;
};

function getValue(data: TranslationData, path: string[]): unknown {
    return path.reduce<unknown>((acc, key) => {
        if (acc !== null && typeof acc === 'object' && key in acc) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, data);
}

function applyMeta(meta?: TranslationMeta): void {
    if (meta === undefined) {
        return;
    }

    if (typeof meta.lang === 'string' && meta.lang.length > 0) {
        document.documentElement.lang = meta.lang;
    }

    if (typeof meta.dir === 'string' && meta.dir.length > 0) {
        document.documentElement.dir = meta.dir;
    }

    if (typeof meta.title === 'string' && meta.title.length > 0) {
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
            if (info === null) {
                return;
            }
            const value = getValue(data, info.path);
            if (typeof value !== 'string') {
                return;
            }
            if (typeof info.attribute === 'string') {
                node.setAttribute(info.attribute, value);
            } else {
                node.textContent = value;
            }
        });
    });
}

export function initI18n(options: InitI18nOptions): void {
    const root = options.root;
    const meta = activeTranslations.meta;
    let lang = options.lang;
    if (
        lang === undefined &&
        meta !== undefined &&
        typeof meta.lang === 'string' &&
        meta.lang.length > 0
    ) {
        lang = meta.lang;
    }
    lang ??= 'he';

    applyMeta(activeTranslations.meta);
    applyTranslations(root, activeTranslations);
    document.dispatchEvent(
        new CustomEvent('i18n:loaded', { detail: { lang } })
    );
}
