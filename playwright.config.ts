import { defineConfig } from '@playwright/test';

const baseURL = process.env.PW_BASE_URL ?? 'http://localhost:5173';
const videoMode = (process.env.PW_VIDEO ?? 'retain-on-failure') as
    | 'off'
    | 'on'
    | 'retain-on-failure'
    | 'on-first-retry';

export default defineConfig({
    testDir: 'tests',
    testMatch: ['**/*.spec.ts'],
    testIgnore: ['**/unit/**'],
    outputDir: 'test-results',
    use: {
        baseURL,
        video: videoMode,
    },
    webServer: {
        command: 'pnpm dev --host',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
