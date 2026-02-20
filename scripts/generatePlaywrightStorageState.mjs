import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STATE_DIR = join(process.cwd(), 'tests', 'state');
const DATA_DIR = join(process.cwd(), 'public', '_data');

const STORAGE_KEY = 'planit:dev-state';
const ORIGIN = 'http://localhost:6173';

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf-8'));
}

function readUserDegree() {
    const userDegree = readJson(join(STATE_DIR, 'userDegree.json'));
    if (typeof userDegree !== 'object' || userDegree === null) {
        throw new Error('tests/state/userDegree.json must be a JSON object');
    }
    if (
        typeof userDegree.catalogId !== 'string' ||
        typeof userDegree.facultyId !== 'string' ||
        typeof userDegree.programId !== 'string'
    ) {
        throw new Error(
            'tests/state/userDegree.json must include catalogId, facultyId, and programId as strings'
        );
    }
    return userDegree;
}

function readRequirementsForSelection(selection) {
    const path = join(
        DATA_DIR,
        '_catalogs',
        selection.catalogId,
        selection.facultyId,
        selection.programId,
        'requirementsData.json'
    );
    return readJson(path);
}

function buildDevState() {
    const userDegree = readUserDegree();
    const courses = readJson(join(DATA_DIR, 'courseData.json'));
    const catalogs = readJson(join(DATA_DIR, 'catalogs.json'));
    const requirements = readRequirementsForSelection(userDegree);

    return {
        courses,
        catalogs,
        userDegree,
        requirements,
    };
}

function buildStorageState() {
    const devState = buildDevState();
    const value = JSON.stringify(devState);

    return {
        cookies: [],
        origins: {
            origin: ORIGIN,
            localStorage: [
                {
                    name: STORAGE_KEY,
                    value,
                },
            ],
        },
    };
}

function main() {
    const outputPath = join(STATE_DIR, 'playwright.storage-state.json');
    const storageState = buildStorageState();
    writeFileSync(outputPath, JSON.stringify(storageState));
    console.log(`Wrote ${outputPath}`);
}

main();
