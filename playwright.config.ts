import { defineConfig, devices } from '@playwright/test';

const port = process.env.PW_PORT ?? '6173';
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
const demoDesktopViewport = {
    width: 1400,
    height: 1050,
};
const demoMobileViewport = {
    width: 430,
    height: 932,
};
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
        storageState: 'tests/state/playwright.storage-state.json',
        video: demoMode
            ? {
                  mode: 'on',
              }
            : videoMode,
        trace: traceMode,
        screenshot: 'only-on-failure',
        launchOptions: {
            slowMo: slowMoMs,
        },
    },
    projects: [
        {
            name: 'desktop-chrome-light',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'light',
                viewport: demoDesktopViewport,
                ...(demoMode
                    ? {
                          video: {
                              mode: 'on',
                              size: demoDesktopViewport,
                          },
                      }
                    : {}),
            },
        },
        {
            name: 'desktop-chrome-dark',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'dark',
                viewport: demoDesktopViewport,
                ...(demoMode
                    ? {
                          video: {
                              mode: 'on',
                              size: demoDesktopViewport,
                          },
                      }
                    : {}),
            },
        },
        {
            name: 'mobile-chrome-light',
            use: {
                ...devices['Pixel 5'],
                colorScheme: 'light',
                viewport: demoMobileViewport,
                ...(demoMode
                    ? {
                          video: {
                              mode: 'on',
                              size: demoMobileViewport,
                          },
                      }
                    : {}),
            },
        },
        {
            name: 'mobile-chrome-dark',
            use: {
                ...devices['Pixel 5'],
                colorScheme: 'dark',
                viewport: demoMobileViewport,
                ...(demoMode
                    ? {
                          video: {
                              mode: 'on',
                              size: demoMobileViewport,
                          },
                      }
                    : {}),
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
