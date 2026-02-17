import { defineConfig, devices } from '@playwright/test';

const port = process.env.PW_PORT ?? '4173';
const host = process.env.PW_HOST ?? '127.0.0.1';
const baseURL = process.env.PW_BASE_URL ?? `http://${host}:${port}/planit/`;
const videoMode = (process.env.PW_VIDEO ?? 'retain-on-failure') as
    | 'off'
    | 'on'
    | 'retain-on-failure'
    | 'on-first-retry';

export default defineConfig({
    testDir: '.',
    testMatch: ['tests/**/*.spec.ts', 'src/pages/**/*.spec.ts'],
    testIgnore: ['**/unit/**', '**/node_modules/**', '**/.*/**'],
    outputDir: 'test-results',
    use: {
        baseURL,
        video: videoMode,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'desktop-chrome',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
    ],
    webServer: {
        command: `pnpm dev --host ${host} --strictPort --port ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
    },
});
