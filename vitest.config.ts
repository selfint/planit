import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { resolve } from 'node:path';

const VIRTUAL_PWA_REGISTER_ID = 'virtual:pwa-register';
const RESOLVED_VIRTUAL_PWA_REGISTER_ID = `\0${VIRTUAL_PWA_REGISTER_ID}`;

function virtualPwaRegister(): Plugin {
    return {
        name: 'vitest-virtual-pwa-register',
        resolveId(id) {
            if (id === VIRTUAL_PWA_REGISTER_ID) {
                return RESOLVED_VIRTUAL_PWA_REGISTER_ID;
            }
            return null;
        },
        load(id) {
            if (id === RESOLVED_VIRTUAL_PWA_REGISTER_ID) {
                return `export function registerSW() { return async () => {}; }`;
            }
            return null;
        },
    };
}

export default defineConfig({
    plugins: [virtualPwaRegister()],
    resolve: {
        alias: {
            $lib: resolve('src/lib'),
            $components: resolve('src/components'),
            $assets: resolve('src/assets'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.{ts,js}'],
    },
});
