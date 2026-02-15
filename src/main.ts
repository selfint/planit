import './style.css';

import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';

function main(): void {
    try {
        initRouter();
        initPWA();
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

main();
