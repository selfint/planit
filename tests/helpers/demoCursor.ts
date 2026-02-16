import type { Page } from '@playwright/test';

const DEMO_CURSOR_SCRIPT = String.raw`
(() => {
    const STYLE_ID = 'pw-demo-cursor-style';
    const CURSOR_ID = 'pw-demo-cursor';
    const RIPPLE_CLASS = 'pw-demo-cursor-ripple';

    const cursorSize = 48;
    const cursorHalf = cursorSize / 2;

    const mount = () => {
        if (document.getElementById(STYLE_ID) !== null) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
        '#'+CURSOR_ID+' {',
        'position: fixed;',
        'width: '+String(cursorSize)+'px;',
        'height: '+String(cursorSize)+'px;',
        'border-radius: 9999px;',
        'border: 4px solid rgba(255,255,255,1);',
        'background: rgba(20,184,166,0.78);',
        'box-shadow: 0 0 0 4px rgba(15,23,42,0.75), 0 0 0 10px rgba(45,212,191,0.28), 0 10px 28px rgba(15,23,42,0.55);',
        'pointer-events: none;',
        'z-index: 2147483647;',
        'left: 0;',
        'top: 0;',
        'transform: translate(24px, 24px);',
        'transition: transform 26ms linear;',
        'backdrop-filter: saturate(115%);',
        '}',
        '#'+CURSOR_ID+'::after {',
        'content: "";',
        'position: absolute;',
        'left: 50%;',
        'top: 50%;',
        'width: 8px;',
        'height: 8px;',
        'border-radius: 9999px;',
        'background: rgba(255,255,255,0.95);',
        'transform: translate(-50%, -50%);',
        '}',
        '.'+RIPPLE_CLASS+' {',
        'position: fixed;',
        'width: '+String(cursorSize)+'px;',
        'height: '+String(cursorSize)+'px;',
        'border-radius: 9999px;',
        'border: 5px solid rgba(45,212,191,0.95);',
        'background: rgba(45,212,191,0.35);',
        'pointer-events: none;',
        'z-index: 2147483646;',
        'left: 0;',
        'top: 0;',
        'transform: translate(-50%, -50%) scale(0.9);',
        'animation: pw-demo-cursor-click 620ms ease-out forwards;',
        '}',
        '@keyframes pw-demo-cursor-click {',
        '0% { opacity: 0.98; transform: translate(-50%, -50%) scale(0.9); }',
        '100% { opacity: 0; transform: translate(-50%, -50%) scale(3.2); }',
        '}',
    ].join('');
        const styleHost = document.head ?? document.documentElement;
        styleHost.append(style);

        const cursor = document.createElement('div');
        cursor.id = CURSOR_ID;
        document.documentElement.append(cursor);

        const moveCursor = (clientX, clientY) => {
            cursor.style.transform = 'translate(' + String(clientX - cursorHalf) + 'px, ' + String(clientY - cursorHalf) + 'px)';
        };

        const onMove = (event) => {
            moveCursor(event.clientX, event.clientY);
        };

        const onDown = (event) => {
            moveCursor(event.clientX, event.clientY);
            const ripple = document.createElement('div');
            ripple.className = RIPPLE_CLASS;
            ripple.style.left = String(event.clientX) + 'px';
            ripple.style.top = String(event.clientY) + 'px';
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
            document.documentElement.append(ripple);
        };

        moveCursor(Math.max(cursorHalf + 12, window.innerWidth * 0.35), Math.max(cursorHalf + 12, window.innerHeight * 0.24));

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('mousedown', onDown, { passive: true });
        window.addEventListener('click', onDown, { passive: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount, { once: true });
        return;
    }

    mount();
})();
`;

export async function installDemoCursor(page: Page): Promise<void> {
    await page.addInitScript(DEMO_CURSOR_SCRIPT);
}

export async function primeDemoCursor(page: Page): Promise<void> {
    await page.mouse.move(520, 260, { steps: 12 });
}

export function isDemoModeEnabled(): boolean {
    return process.env.PW_DEMO === 'on';
}
