import { getMeta, putCatalogs, setMeta } from '$lib/indexeddb';

function getEnvString(name: string, fallback: string): string {
    const env = import.meta.env as Record<string, unknown>;
    const value = env[name];

    if (typeof value === 'string' && value.length > 0) {
        return value;
    }

    return fallback;
}

const DATA_BASE_URL = getEnvString(
    'VITE_DATA_BASE_URL',
    '_data'
);

const CATALOGS_DATA_URL = `${DATA_BASE_URL}/catalogs.json`;
const DATA_GENERATED_AT_URL = `${DATA_BASE_URL}/generatedAt.json`;

const CATALOGS_META_KEYS = {
    etag: 'catalogsDataEtag',
    lastModified: 'catalogsDataLastModified',
    lastSync: 'catalogsDataLastSync',
    count: 'catalogsDataCount',
    generatedAt: 'catalogsDataGeneratedAt',
};

export const CATALOG_SYNC_EVENT = 'planit:catalog-sync';

export type CatalogSyncResult = {
    status: 'updated' | 'skipped' | 'offline';
    count?: number;
};

export type CatalogSyncOptions = {
    onSync?: (result: CatalogSyncResult) => void;
    onError?: (error: unknown) => void;
};

function isOnline(): boolean {
    return 'onLine' in navigator ? navigator.onLine : true;
}

async function fetchCatalogsData(): Promise<Response> {
    const [etagEntry, lastModifiedEntry] = await Promise.all([
        getMeta(CATALOGS_META_KEYS.etag),
        getMeta(CATALOGS_META_KEYS.lastModified),
    ]);

    const headers = new Headers();
    const etagValue =
        typeof etagEntry?.value === 'string' ? etagEntry.value : undefined;
    const lastModifiedValue =
        typeof lastModifiedEntry?.value === 'string'
            ? lastModifiedEntry.value
            : undefined;

    if (etagValue !== undefined && etagValue.length > 0) {
        headers.set('If-None-Match', etagValue);
    }
    if (lastModifiedValue !== undefined && lastModifiedValue.length > 0) {
        headers.set('If-Modified-Since', lastModifiedValue);
    }

    return fetch(CATALOGS_DATA_URL, { headers });
}

async function fetchGeneratedAt(): Promise<string> {
    const response = await fetch(DATA_GENERATED_AT_URL);
    if (!response.ok) {
        throw new Error(
            `Failed to fetch generated-at metadata: ${String(response.status)} ${
                response.statusText
            }`
        );
    }

    const payload = (await response.json()) as { timestamp?: unknown };
    if (typeof payload.timestamp !== 'number') {
        throw new Error(
            'generatedAt.json is missing a numeric "timestamp" field'
        );
    }

    const generatedAt = new Date(payload.timestamp);
    if (Number.isNaN(generatedAt.getTime())) {
        throw new Error(
            `generatedAt.json has invalid timestamp: ${String(payload.timestamp)}`
        );
    }

    return generatedAt.toISOString();
}

export async function syncCatalogs(): Promise<CatalogSyncResult> {
    if (!isOnline()) {
        return { status: 'offline' };
    }

    const response = await fetchCatalogsData();
    if (response.status === 304) {
        return { status: 'skipped' };
    }

    if (!response.ok) {
        throw new Error(
            `Failed to fetch catalog data: ${String(response.status)} ${
                response.statusText
            }`
        );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const count = Object.keys(data).length;
    const generatedAt = await fetchGeneratedAt();

    await putCatalogs(data);

    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');
    await Promise.all([
        etag !== null && etag.length > 0
            ? setMeta({ key: CATALOGS_META_KEYS.etag, value: etag })
            : Promise.resolve(),
        lastModified !== null && lastModified.length > 0
            ? setMeta({
                  key: CATALOGS_META_KEYS.lastModified,
                  value: lastModified,
              })
            : Promise.resolve(),
        setMeta({
            key: CATALOGS_META_KEYS.lastSync,
            value: new Date().toISOString(),
        }),
        setMeta({ key: CATALOGS_META_KEYS.count, value: count }),
        setMeta({
            key: CATALOGS_META_KEYS.generatedAt,
            value: generatedAt,
        }),
    ]);

    return { status: 'updated', count };
}

export function initCatalogSync(options?: CatalogSyncOptions): void {
    async function runSync(): Promise<void> {
        try {
            const result = await syncCatalogs();
            options?.onSync?.(result);
            window.dispatchEvent(
                new CustomEvent(CATALOG_SYNC_EVENT, { detail: result })
            );
        } catch (error) {
            console.error('Catalog sync failed', error);
            options?.onError?.(error);
        }
    }

    if (isOnline()) {
        void runSync();
    }
}
