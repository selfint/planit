import { defineConfig, devices } from '@playwright/test';

const port = process.env.PW_PORT ?? '4173';
const host = process.env.PW_HOST ?? 'localhost';
const baseURL = process.env.PW_BASE_URL ?? `http://${host}:${port}/planit/`;

const demoMode = process.env.PW_DEMO === 'on';
const videoMode = (process.env.PW_VIDEO ?? 'retain-on-failure') as
    | 'off'
    | 'on'
    | 'retain-on-failure'
    | 'on-first-retry';
const slowMoMs = Number.parseInt(
    process.env.PW_SLOWMO ?? (demoMode ? '450' : '0'),
    10
);
const demoVideoWidth = Number.parseInt(
    process.env.PW_VIDEO_WIDTH ?? '1920',
    10
);
const demoVideoHeight = Number.parseInt(
    process.env.PW_VIDEO_HEIGHT ?? '1080',
    10
);
const traceMode = (process.env.PW_TRACE ??
    (demoMode ? 'off' : 'retain-on-failure')) as
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
        video: demoMode
            ? {
                  mode: 'on',
                  size: {
                      width: demoVideoWidth,
                      height: demoVideoHeight,
                  },
              }
            : videoMode,
        trace: traceMode,
        screenshot: 'only-on-failure',
        viewport: demoMode
            ? {
                  width: demoVideoWidth,
                  height: demoVideoHeight,
              }
            : undefined,
        launchOptions: {
            slowMo: slowMoMs,
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
