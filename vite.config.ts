import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

function resolveBuildSha(): string {
    if (process.env.GITHUB_SHA) {
        return process.env.GITHUB_SHA.slice(0, 7);
    }
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
        return 'dev';
    }
}

const buildSha = resolveBuildSha();

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    base: '/planit/',
    define: {
        __BUILD_SHA__: JSON.stringify(buildSha),
    },
    resolve: {
        alias: {
            // Keep aliases in sync with .storybook/main.ts (manual).
            $lib: resolve('src/lib'),
            $components: resolve('src/components'),
            $assets: resolve('src/assets'),
        },
    },
    plugins: [
        tailwindcss(),
        imagetools(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,

            pwaAssets: {
                disabled: false,
                config: true,
            },

            manifest: {
                name: 'planit',
                short_name: 'planit',
                description: 'Technion degree planner',
                start_url: '/planit/',
                scope: '/planit/',
                theme_color: '#4ca9a1',
            },

            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
            },

            devOptions: {
                enabled: false,
                navigateFallback: 'index.html',
                suppressWarnings: true,
                type: 'module',
            },
        }),
    ],
}));
