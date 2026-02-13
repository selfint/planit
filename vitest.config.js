import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * @typedef {import('vite').Plugin} Plugin
 */

const VIRTUAL_PWA_REGISTER_ID = 'virtual:pwa-register';
const RESOLVED_VIRTUAL_PWA_REGISTER_ID = `\0${VIRTUAL_PWA_REGISTER_ID}`;

/**
 * @returns {Plugin}
 */
function virtualPwaRegister() {
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
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.js', 'src/**/*.spec.js'],
    },
});
