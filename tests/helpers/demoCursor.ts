import type { Page } from '@playwright/test';

const DEMO_CURSOR_SCRIPT = String.raw`
(() => {
    const STYLE_ID = 'pw-demo-cursor-style';
    const CURSOR_ID = 'pw-demo-cursor';
    const RIPPLE_CLASS = 'pw-demo-cursor-ripple';

    const cursorSize = 40;
    const cursorHalf = cursorSize / 2;
    const rippleSize = Math.round(cursorSize * 0.9);

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
        'border: 3px solid rgba(255,255,255,0.94);',
        'background: rgba(20,184,166,0.66);',
        'box-shadow: 0 0 0 3px rgba(15,23,42,0.62), 0 0 0 8px rgba(45,212,191,0.2), 0 8px 20px rgba(15,23,42,0.46);',
        'pointer-events: none;',
        'z-index: 2147483647;',
        'left: 0;',
        'top: 0;',
        'transform: translate('+String(cursorHalf)+'px, '+String(cursorHalf)+'px);',
        'transition: transform 22ms linear;',
        'backdrop-filter: saturate(115%);',
        '}',
        '#'+CURSOR_ID+'::after {',
        'content: "";',
        'position: absolute;',
        'left: 50%;',
        'top: 50%;',
        'width: 7px;',
        'height: 7px;',
        'border-radius: 9999px;',
        'background: rgba(255,255,255,0.95);',
        'transform: translate(-50%, -50%);',
        '}',
        '.'+RIPPLE_CLASS+' {',
        'position: fixed;',
        'width: '+String(rippleSize)+'px;',
        'height: '+String(rippleSize)+'px;',
        'border-radius: 9999px;',
        'border: 4px solid rgba(45,212,191,0.82);',
        'background: rgba(45,212,191,0.2);',
        'pointer-events: none;',
        'z-index: 2147483646;',
        'left: 0;',
        'top: 0;',
        'transform: translate(-50%, -50%) scale(0.9);',
        'animation: pw-demo-cursor-click 520ms ease-out forwards;',
        '}',
        '@keyframes pw-demo-cursor-click {',
        '0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.86); }',
        '100% { opacity: 0; transform: translate(-50%, -50%) scale(2.7); }',
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
        window.addEventListener('pointerdown', onDown, { passive: true });
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
