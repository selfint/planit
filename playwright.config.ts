import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PW_BASE_URL ?? 'http://localhost:5173/planit/';
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
            testIgnore: ['tests/mobile-smoke.spec.ts'],
        },
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
            },
            testMatch: ['tests/mobile-smoke.spec.ts'],
        },
    ],
    webServer: {
        command: 'pnpm dev --host',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
