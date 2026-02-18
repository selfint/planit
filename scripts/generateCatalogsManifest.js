import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'public', '_catalogs');
const manifestPath = join(process.cwd(), 'public', 'catalogs.json');

function parseI18N(path) {
    const en = readFileSync(join(path, 'en')).toString();
    const he = readFileSync(join(path, 'he')).toString();

    return {
        en,
        he,
    };
}

function parseDir(path, depth) {
    if (depth === 0) {
        return {
            ...parseI18N(path),
        };
    }

    const subdirs = readdirSync(path)
        .filter((entry) => !['en', 'he'].includes(entry))
        .map((entry) => [entry, parseDir(join(path, entry), depth - 1)]);

    return {
        ...parseI18N(path),
        ...Object.fromEntries(subdirs),
    };
}

function parseDb(path) {
    const years = readdirSync(path)
        .filter((entry) => statSync(join(path, entry)).isDirectory())
        .map((year) => [year, parseDir(join(path, year), 2)]);

    return { ...Object.fromEntries(years) };
}

const manifest = parseDb(dbPath);
writeFileSync(manifestPath, JSON.stringify(manifest));
