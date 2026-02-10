import './style.css';

import appTemplate from './app.html?raw';
import { initPWA } from './pwa.ts';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
    throw new Error('Missing #app element');
}
app.innerHTML = appTemplate;

initPWA(app);
