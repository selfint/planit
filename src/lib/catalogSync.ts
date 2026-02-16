import { getMeta, putCatalogs, setMeta } from '$lib/indexeddb';

const CATALOGS_DATA_URL =
    'https://raw.githubusercontent.com/selfint/degree-planner/main/static/catalogs.json';

const CATALOGS_META_KEYS = {
    etag: 'catalogsDataEtag',
    lastModified: 'catalogsDataLastModified',
    lastSync: 'catalogsDataLastSync',
    count: 'catalogsDataCount',
    remoteUpdatedAt: 'catalogsDataRemoteUpdatedAt',
    lastChecked: 'catalogsDataLastChecked',
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

async function fetchRemoteUpdatedAt(): Promise<string | undefined> {
    const response = await fetch(
        'https://api.github.com/repos/selfint/degree-planner/commits?path=static/catalogs.json&per_page=1',
        {
            headers: {
                Accept: 'application/vnd.github+json',
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch remote update metadata: ${String(
                response.status
            )} ${response.statusText}`
        );
    }

    const data = (await response.json()) as {
        commit?: { committer?: { date?: string } };
    }[];
    const date = data[0]?.commit?.committer?.date;
    if (typeof date === 'string' && date.length > 0) {
        return date;
    }

    return undefined;
}

async function shouldFetchCatalogs(
    remoteUpdatedAt: string | undefined
): Promise<boolean> {
    const [storedRemote, lastSync] = await Promise.all([
        getMeta(CATALOGS_META_KEYS.remoteUpdatedAt),
        getMeta(CATALOGS_META_KEYS.lastSync),
    ]);
    const storedRemoteValue =
        typeof storedRemote?.value === 'string'
            ? storedRemote.value
            : undefined;

    if (remoteUpdatedAt === undefined) {
        return true;
    }

    if (storedRemoteValue === undefined || storedRemoteValue.length === 0) {
        return true;
    }

    if (storedRemoteValue !== remoteUpdatedAt) {
        return true;
    }

    return lastSync?.value === undefined;
}

export async function syncCatalogs(): Promise<CatalogSyncResult> {
    if (!isOnline()) {
        return { status: 'offline' };
    }

    let remoteUpdatedAt: string | undefined;
    try {
        remoteUpdatedAt = await fetchRemoteUpdatedAt();
    } catch (error) {
        console.error('Failed to fetch remote catalog metadata', error);
    }

    if (remoteUpdatedAt !== undefined) {
        await setMeta({
            key: CATALOGS_META_KEYS.remoteUpdatedAt,
            value: remoteUpdatedAt,
        });
        await setMeta({
            key: CATALOGS_META_KEYS.lastChecked,
            value: new Date().toISOString(),
        });
    }

    if (!(await shouldFetchCatalogs(remoteUpdatedAt))) {
        return { status: 'skipped' };
    }

    const response = await fetchCatalogsData();
    if (response.status === 304) {
        await setMeta({
            key: CATALOGS_META_KEYS.lastSync,
            value: new Date().toISOString(),
        });
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
        remoteUpdatedAt !== undefined
            ? setMeta({
                  key: CATALOGS_META_KEYS.remoteUpdatedAt,
                  value: remoteUpdatedAt,
              })
            : Promise.resolve(),
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

    function handleOnline(): void {
        void runSync();
    }

    window.addEventListener('online', handleOnline);

    if (isOnline()) {
        void runSync();
    }
}
