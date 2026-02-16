import { defineConfig, devices } from '@playwright/test';

const port = process.env.PW_PORT ?? '4173';
const host = process.env.PW_HOST ?? '127.0.0.1';
const baseURL = process.env.PW_BASE_URL ?? `http://${host}:${port}/planit/`;
const videoMode = (process.env.PW_VIDEO ?? 'retain-on-failure') as
    | 'off'
    | 'on'
    | 'retain-on-failure'
    | 'on-first-retry';
const demoMode = process.env.PW_DEMO === 'on';
const slowMoMs = Number.parseInt(
    process.env.PW_SLOWMO ?? (demoMode ? '220' : '0'),
    10
);
const traceMode = (process.env.PW_TRACE ??
    (demoMode ? 'on' : 'retain-on-failure')) as
    | 'off'
    | 'on'
    | 'retain-on-failure'
    | 'on-first-retry';

export default defineConfig({
    testDir: '.',
    testMatch: ['tests/**/*.spec.ts', 'src/pages/**/*.spec.ts'],
    testIgnore: ['**/unit/**', '**/node_modules/**', '**/.*/**'],
    outputDir: 'test-results',
    workers: demoMode ? 1 : undefined,
    use: {
        baseURL,
        video: demoMode ? 'on' : videoMode,
        trace: traceMode,
        screenshot: 'only-on-failure',
        launchOptions: {
            slowMo: Number.isNaN(slowMoMs) ? 0 : Math.max(0, slowMoMs),
        },
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
