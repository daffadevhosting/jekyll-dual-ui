/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { d as readTask, w as writeTask } from './index-527b9e34.js';
import { f as findClosestIonContent, s as scrollToTop } from './index-9a17db3d.js';
import { c as componentOnReady } from './helpers-d94bc8ad.js';
import './index-cfd9c1f2.js';

const startStatusTap = () => {
    const win = window;
    win.addEventListener('statusTap', () => {
        readTask(() => {
            const width = win.innerWidth;
            const height = win.innerHeight;
            const el = document.elementFromPoint(width / 2, height / 2);
            if (!el) {
                return;
            }
            const contentEl = findClosestIonContent(el);
            if (contentEl) {
                new Promise((resolve) => componentOnReady(contentEl, resolve)).then(() => {
                    writeTask(async () => {
                        /**
                         * If scrolling and user taps status bar,
                         * only calling scrollToTop is not enough
                         * as engines like WebKit will jump the
                         * scroll position back down and complete
                         * any in-progress momentum scrolling.
                         */
                        contentEl.style.setProperty('--overflow', 'hidden');
                        await scrollToTop(contentEl, 300);
                        contentEl.style.removeProperty('--overflow');
                    });
                });
            }
        });
    });
};

export { startStatusTap };
