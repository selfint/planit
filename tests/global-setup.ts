import type { FullConfig } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';

const STORAGE_STATE_PATH = path.join(
    process.cwd(),
    'test-results',
    'playwright.storage-state.json'
);

const DEV_STATE_STORAGE_KEY = 'planit:dev-state';

type UserDegree = {
    catalogId: string;
    facultyId: string;
    programId: string;
    path?: string;
};

async function globalSetup(config: FullConfig): Promise<void> {
    const [courses, catalogs, requirements, userDegree] = await Promise.all([
        readJsonFile<Record<string, unknown>>('tests/state/courseData.json'),
        readJsonFile<Record<string, unknown>>('tests/state/catalogs.json'),
        readJsonFile<unknown>('tests/state/requirementsData.json'),
        readJsonFile<UserDegree>('tests/state/userDegree.json'),
    ]);

    const baseURL =
        config.projects[0]?.use?.baseURL !== undefined
            ? String(config.projects[0].use.baseURL)
            : 'http://localhost:4173/planit/';
    const origin = new URL(baseURL).origin;

    const devState = JSON.stringify({
        courses,
        catalogs,
        userDegree,
        requirements,
    });

    const storageState = {
        cookies: [],
        origins: [
            {
                origin,
                localStorage: [
                    {
                        name: DEV_STATE_STORAGE_KEY,
                        value: devState,
                    },
                ],
            },
        ],
    };

    await fs.mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });
    await fs.writeFile(
        STORAGE_STATE_PATH,
        JSON.stringify(storageState),
        'utf8'
    );
}

async function readJsonFile<T>(relativePath: string): Promise<T> {
    const absolutePath = path.join(process.cwd(), relativePath);
    const raw = await fs.readFile(absolutePath, 'utf8');
    return JSON.parse(raw) as T;
}

export default globalSetup;
