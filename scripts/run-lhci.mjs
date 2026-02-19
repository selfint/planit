import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

function resolveChromePath() {
    const chromePath = chromium.executablePath();
    if (chromePath === '') {
        return null;
    }

    if (fs.existsSync(chromePath) === false) {
        return null;
    }

    return chromePath;
}

const chromePath = resolveChromePath();
if (chromePath === null) {
    console.error('Unable to find a Playwright Chromium executable.');
    console.error('Run: pnpm exec playwright install chromium');
    process.exit(1);
}

const lhciCommand = process.argv[2] ?? 'collect';
const additionalArgs = process.argv.slice(3);
const result = spawnSync(
    'pnpm',
    [
        'exec',
        'lhci',
        lhciCommand,
        '--config=.lighthouserc.json',
        ...additionalArgs,
    ],
    {
        stdio: 'inherit',
        env: {
            ...process.env,
            CHROME_PATH: chromePath,
        },
    }
);

if (result.status !== 0) {
    process.exit(result.status ?? 1);
}
