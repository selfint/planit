type TranslationMeta = {
    lang?: string;
    dir?: 'ltr' | 'rtl';
    title?: string;
};

type TranslationData = {
    meta?: TranslationMeta;
    [key: string]: unknown;
};

let activeTranslations: TranslationData | undefined;

type InitI18nOptions = {
    lang?: string;
    root?: ParentNode;
    path?: string;
};

function getValue(data: TranslationData, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
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

function applyTextTranslations(root: ParentNode, data: TranslationData): void {
    const nodes = root.querySelectorAll<HTMLElement>('[data-i18n]');
    nodes.forEach((node) => {
        const key = node.dataset.i18n;
        if (!key) {
            return;
        }
        const value = getValue(data, key);
        if (typeof value === 'string') {
            node.textContent = value;
        }
    });
}

function applyReplacements(
    text: string,
    replacements?: Record<string, string | number>
): string {
    if (!replacements) {
        return text;
    }
    return text.replace(/\{(\w+)\}/g, (match, key) => {
        if (!(key in replacements)) {
            return match;
        }
        return String(replacements[key]);
    });
}

export function translate(
    key: string,
    replacements?: Record<string, string | number>,
    fallback?: string
): string {
    const value = activeTranslations ? getValue(activeTranslations, key) : undefined;
    if (typeof value === 'string') {
        return applyReplacements(value, replacements);
    }
    if (fallback) {
        return applyReplacements(fallback, replacements);
    }
    return applyReplacements(key, replacements);
}

function applyAttributeTranslations(
    root: ParentNode,
    data: TranslationData
): void {
    const nodes = root.querySelectorAll<HTMLElement>('[data-i18n-attr]');
    nodes.forEach((node) => {
        const entries = node.dataset.i18nAttr;
        if (!entries) {
            return;
        }
        entries.split(',').forEach((entry) => {
            const [attr, key] = entry.split(':').map((part) => part.trim());
            if (!attr || !key) {
                return;
            }
            const value = getValue(data, key);
            if (typeof value === 'string') {
                node.setAttribute(attr, value);
            }
        });
    });
}

export async function initI18n(options: InitI18nOptions = {
}): Promise<void> {
    const lang = options.lang ?? 'he';
    const root = options.root ?? document;
    const path = options.path ?? `/i18n/${lang}.json`;

    try {
        const response = await fetch(path, {
 cache: 'no-store'
});
        if (!response.ok) {
            throw new Error(`Failed to load translations from ${path}`);
        }
        const data = (await response.json()) as TranslationData;
        activeTranslations = data;
        applyMeta(data.meta);
        applyAttributeTranslations(root, data);
        applyTextTranslations(root, data);
        document.dispatchEvent(
            new CustomEvent('i18n:loaded', { detail: { lang } })
        );
    } catch (error) {
        console.error('Failed to initialize i18n', error);
    }
}
