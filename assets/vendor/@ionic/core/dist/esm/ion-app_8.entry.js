/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { r as registerInstance, h, e as Host, f as getElement, c as createEvent, d as readTask, i as forceUpdate, w as writeTask } from './index-527b9e34.js';
import { shouldUseCloseWatcher } from './hardware-back-button-a7eb8233.js';
import { c as config, p as printIonWarning, d as printIonError } from './index-cfd9c1f2.js';
import { b as getIonMode, a as isPlatform } from './ionic-global-b26f573e.js';
import { i as inheritAriaAttributes, k as hasLazyBuild, c as componentOnReady, j as clamp, s as shallowEqualStringMap } from './helpers-d94bc8ad.js';
import { i as isRTL } from './dir-babeabeb.js';
import { c as createColorClasses, h as hostContext } from './theme-01f3f29c.js';
import { a as findIonContent, p as printIonContentErrorMsg, g as getScrollElement } from './index-9a17db3d.js';
import { c as createKeyboardController } from './keyboard-controller-ec5c2bfa.js';
import { g as getTimeGivenProgression } from './cubic-bezier-fe2083dc.js';
import { a as attachComponent, d as detachComponent } from './framework-delegate-56b467ad.js';
import { c as createLockController } from './lock-controller-316928be.js';
import { t as transition } from './index-68c0d151.js';
import './index-a5d50daf.js';
import './keyboard-73175e24.js';
import './capacitor-59395cbd.js';

const appCss = "html.plt-mobile ion-app{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}html.plt-mobile ion-app [contenteditable]{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}ion-app.force-statusbar-padding{--ion-safe-area-top:20px}";
const IonAppStyle0 = appCss;

const App = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    componentDidLoad() {
        {
            rIC(async () => {
                const isHybrid = isPlatform(window, 'hybrid');
                if (!config.getBoolean('_testing')) {
                    import('./index-be190feb.js').then((module) => module.startTapClick(config));
                }
                if (config.getBoolean('statusTap', isHybrid)) {
                    import('./status-tap-42a8af65.js').then((module) => module.startStatusTap());
                }
                if (config.getBoolean('inputShims', needInputShims())) {
                    /**
                     * needInputShims() ensures that only iOS and Android
                     * platforms proceed into this block.
                     */
                    const platform = isPlatform(window, 'ios') ? 'ios' : 'android';
                    import('./input-shims-279903e2.js').then((module) => module.startInputShims(config, platform));
                }
                const hardwareBackButtonModule = await import('./hardware-back-button-a7eb8233.js');
                const supportsHardwareBackButtonEvents = isHybrid || shouldUseCloseWatcher();
                if (config.getBoolean('hardwareBackButton', supportsHardwareBackButtonEvents)) {
                    hardwareBackButtonModule.startHardwareBackButton();
                }
                else {
                    /**
                     * If an app sets hardwareBackButton: false and experimentalCloseWatcher: true
                     * then the close watcher will not be used.
                     */
                    if (shouldUseCloseWatcher()) {
                        printIonWarning('[ion-app] - experimentalCloseWatcher was set to `true`, but hardwareBackButton was set to `false`. Both config options must be `true` for the Close Watcher API to be used.');
                    }
                    hardwareBackButtonModule.blockHardwareBackButton();
                }
                if (typeof window !== 'undefined') {
                    import('./keyboard-52278bd7.js').then((module) => module.startKeyboardAssist(window));
                }
                import('./focus-visible-dd40d69f.js').then((module) => (this.focusVisible = module.startFocusVisible()));
            });
        }
    }
    /**
     * Used to set focus on an element that uses `ion-focusable`.
     * Do not use this if focusing the element as a result of a keyboard
     * event as the focus utility should handle this for us. This method
     * should be used when we want to programmatically focus an element as
     * a result of another user action. (Ex: We focus the first element
     * inside of a popover when the user presents it, but the popover is not always
     * presented as a result of keyboard action.)
     */
    async setFocus(elements) {
        if (this.focusVisible) {
            this.focusVisible.setFocus(elements);
        }
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '03aa892f986330078d112b1e8b010df98fa7e39e', class: {
                [mode]: true,
                'ion-page': true,
                'force-statusbar-padding': config.getBoolean('_forceStatusbarPadding'),
            } }));
    }
    get el() { return getElement(this); }
};
const needInputShims = () => {
    /**
     * iOS always needs input shims
     */
    const needsShimsIOS = isPlatform(window, 'ios') && isPlatform(window, 'mobile');
    if (needsShimsIOS) {
        return true;
    }
    /**
     * Android only needs input shims when running
     * in the browser and only if the browser is using the
     * new Chrome 108+ resize behavior: https://developer.chrome.com/blog/viewport-resize-behavior/
     */
    const isAndroidMobileWeb = isPlatform(window, 'android') && isPlatform(window, 'mobileweb');
    if (isAndroidMobileWeb) {
        return true;
    }
    return false;
};
const rIC = (callback) => {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
    }
    else {
        setTimeout(callback, 32);
    }
};
App.style = IonAppStyle0;

const buttonsIosCss = ".sc-ion-buttons-ios-h{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);z-index:99}.sc-ion-buttons-ios-s ion-button{--padding-top:0;--padding-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}.sc-ion-buttons-ios-s ion-button{--padding-top:3px;--padding-bottom:3px;--padding-start:5px;--padding-end:5px;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px;min-height:32px}.sc-ion-buttons-ios-s .button-has-icon-only{--padding-top:0;--padding-bottom:0}.sc-ion-buttons-ios-s ion-button:not(.button-round){--border-radius:4px}.sc-ion-buttons-ios-h.ion-color.sc-ion-buttons-ios-s .button,.ion-color .sc-ion-buttons-ios-h.sc-ion-buttons-ios-s .button{--color:initial;--border-color:initial;--background-focused:var(--ion-color-contrast)}.sc-ion-buttons-ios-h.ion-color.sc-ion-buttons-ios-s .button-solid,.ion-color .sc-ion-buttons-ios-h.sc-ion-buttons-ios-s .button-solid{--background:var(--ion-color-contrast);--background-focused:#000;--background-focused-opacity:.12;--background-activated:#000;--background-activated-opacity:.12;--background-hover:var(--ion-color-base);--background-hover-opacity:0.45;--color:var(--ion-color-base);--color-focused:var(--ion-color-base)}.sc-ion-buttons-ios-h.ion-color.sc-ion-buttons-ios-s .button-clear,.ion-color .sc-ion-buttons-ios-h.sc-ion-buttons-ios-s .button-clear{--color-activated:var(--ion-color-contrast);--color-focused:var(--ion-color-contrast)}.sc-ion-buttons-ios-h.ion-color.sc-ion-buttons-ios-s .button-outline,.ion-color .sc-ion-buttons-ios-h.sc-ion-buttons-ios-s .button-outline{--color-activated:var(--ion-color-base);--color-focused:var(--ion-color-contrast);--background-activated:var(--ion-color-contrast)}.sc-ion-buttons-ios-s .button-clear,.sc-ion-buttons-ios-s .button-outline{--background-activated:transparent;--background-focused:currentColor;--background-hover:transparent}.sc-ion-buttons-ios-s .button-solid:not(.ion-color){--background-focused:#000;--background-focused-opacity:.12;--background-activated:#000;--background-activated-opacity:.12}.sc-ion-buttons-ios-s ion-icon[slot=start]{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-webkit-margin-end:0.3em;margin-inline-end:0.3em;font-size:1.41em;line-height:0.67}.sc-ion-buttons-ios-s ion-icon[slot=end]{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-webkit-margin-start:0.4em;margin-inline-start:0.4em;font-size:1.41em;line-height:0.67}.sc-ion-buttons-ios-s ion-icon[slot=icon-only]{padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;font-size:1.65em;line-height:0.67}";
const IonButtonsIosStyle0 = buttonsIosCss;

const buttonsMdCss = ".sc-ion-buttons-md-h{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);z-index:99}.sc-ion-buttons-md-s ion-button{--padding-top:0;--padding-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}.sc-ion-buttons-md-s ion-button{--padding-top:3px;--padding-bottom:3px;--padding-start:8px;--padding-end:8px;--box-shadow:none;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px;min-height:32px}.sc-ion-buttons-md-s .button-has-icon-only{--padding-top:0;--padding-bottom:0}.sc-ion-buttons-md-s ion-button:not(.button-round){--border-radius:2px}.sc-ion-buttons-md-h.ion-color.sc-ion-buttons-md-s .button,.ion-color .sc-ion-buttons-md-h.sc-ion-buttons-md-s .button{--color:initial;--color-focused:var(--ion-color-contrast);--color-hover:var(--ion-color-contrast);--background-activated:transparent;--background-focused:var(--ion-color-contrast);--background-hover:var(--ion-color-contrast)}.sc-ion-buttons-md-h.ion-color.sc-ion-buttons-md-s .button-solid,.ion-color .sc-ion-buttons-md-h.sc-ion-buttons-md-s .button-solid{--background:var(--ion-color-contrast);--background-activated:transparent;--background-focused:var(--ion-color-shade);--background-hover:var(--ion-color-base);--color:var(--ion-color-base);--color-focused:var(--ion-color-base);--color-hover:var(--ion-color-base)}.sc-ion-buttons-md-h.ion-color.sc-ion-buttons-md-s .button-outline,.ion-color .sc-ion-buttons-md-h.sc-ion-buttons-md-s .button-outline{--border-color:var(--ion-color-contrast)}.sc-ion-buttons-md-s .button-has-icon-only.button-clear{--padding-top:12px;--padding-end:12px;--padding-bottom:12px;--padding-start:12px;--border-radius:50%;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;width:3rem;height:3rem}.sc-ion-buttons-md-s .button{--background-hover:currentColor}.sc-ion-buttons-md-s .button-solid{--color:var(--ion-toolbar-background, var(--ion-background-color, #fff));--background:var(--ion-toolbar-color, var(--ion-text-color, #424242));--background-activated:transparent;--background-focused:currentColor}.sc-ion-buttons-md-s .button-outline{--color:initial;--background:transparent;--background-activated:transparent;--background-focused:currentColor;--background-hover:currentColor;--border-color:currentColor}.sc-ion-buttons-md-s .button-clear{--color:initial;--background:transparent;--background-activated:transparent;--background-focused:currentColor;--background-hover:currentColor}.sc-ion-buttons-md-s ion-icon[slot=start]{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-webkit-margin-end:0.3em;margin-inline-end:0.3em;font-size:1.4em}.sc-ion-buttons-md-s ion-icon[slot=end]{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-webkit-margin-start:0.4em;margin-inline-start:0.4em;font-size:1.4em}.sc-ion-buttons-md-s ion-icon[slot=icon-only]{padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;font-size:1.8em}";
const IonButtonsMdStyle0 = buttonsMdCss;

const Buttons = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.collapse = false;
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '58c1fc5eb867d0731c63549b1ccb3ec3bbbe6e1b', class: {
                [mode]: true,
                ['buttons-collapse']: this.collapse,
            } }, h("slot", { key: '0c8f95b9840c8fa0c4e50be84c5159620a3eb5c8' })));
    }
};
Buttons.style = {
    ios: IonButtonsIosStyle0,
    md: IonButtonsMdStyle0
};

const contentCss = ":host{--background:var(--ion-background-color, #fff);--color:var(--ion-text-color, #000);--padding-top:0px;--padding-bottom:0px;--padding-start:0px;--padding-end:0px;--keyboard-offset:0px;--offset-top:0px;--offset-bottom:0px;--overflow:auto;display:block;position:relative;-ms-flex:1;flex:1;width:100%;height:100%;margin:0 !important;padding:0 !important;font-family:var(--ion-font-family, inherit);contain:size style}:host(.ion-color) .inner-scroll{background:var(--ion-color-base);color:var(--ion-color-contrast)}#background-content{left:0px;right:0px;top:calc(var(--offset-top) * -1);bottom:calc(var(--offset-bottom) * -1);position:absolute;background:var(--background)}.inner-scroll{left:0px;right:0px;top:calc(var(--offset-top) * -1);bottom:calc(var(--offset-bottom) * -1);-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end);padding-top:calc(var(--padding-top) + var(--offset-top));padding-bottom:calc(var(--padding-bottom) + var(--keyboard-offset) + var(--offset-bottom));position:absolute;color:var(--color);-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;-ms-touch-action:pan-x pan-y pinch-zoom;touch-action:pan-x pan-y pinch-zoom}.scroll-y,.scroll-x{-webkit-overflow-scrolling:touch;z-index:0;will-change:scroll-position}.scroll-y{overflow-y:var(--overflow);overscroll-behavior-y:contain}.scroll-x{overflow-x:var(--overflow);overscroll-behavior-x:contain}.overscroll::before,.overscroll::after{position:absolute;width:1px;height:1px;content:\"\"}.overscroll::before{bottom:-1px}.overscroll::after{top:-1px}:host(.content-sizing){display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;min-height:0;contain:none}:host(.content-sizing) .inner-scroll{position:relative;top:0;bottom:0;margin-top:calc(var(--offset-top) * -1);margin-bottom:calc(var(--offset-bottom) * -1)}.transition-effect{display:none;position:absolute;width:100%;height:100vh;opacity:0;pointer-events:none}:host(.content-ltr) .transition-effect{left:-100%;}:host(.content-rtl) .transition-effect{right:-100%;}.transition-cover{position:absolute;right:0;width:100%;height:100%;background:black;opacity:0.1}.transition-shadow{display:block;position:absolute;width:100%;height:100%;-webkit-box-shadow:inset -9px 0 9px 0 rgba(0, 0, 100, 0.03);box-shadow:inset -9px 0 9px 0 rgba(0, 0, 100, 0.03)}:host(.content-ltr) .transition-shadow{right:0;}:host(.content-rtl) .transition-shadow{left:0;-webkit-transform:scaleX(-1);transform:scaleX(-1)}::slotted([slot=fixed]){position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0)}";
const IonContentStyle0 = contentCss;

const Content = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.ionScrollStart = createEvent(this, "ionScrollStart", 7);
        this.ionScroll = createEvent(this, "ionScroll", 7);
        this.ionScrollEnd = createEvent(this, "ionScrollEnd", 7);
        this.watchDog = null;
        this.isScrolling = false;
        this.lastScroll = 0;
        this.queued = false;
        this.cTop = -1;
        this.cBottom = -1;
        this.isMainContent = true;
        this.resizeTimeout = null;
        this.inheritedAttributes = {};
        this.tabsElement = null;
        // Detail is used in a hot loop in the scroll event, by allocating it here
        // V8 will be able to inline any read/write to it since it's a monomorphic class.
        // https://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html
        this.detail = {
            scrollTop: 0,
            scrollLeft: 0,
            type: 'scroll',
            event: undefined,
            startX: 0,
            startY: 0,
            startTime: 0,
            currentX: 0,
            currentY: 0,
            velocityX: 0,
            velocityY: 0,
            deltaX: 0,
            deltaY: 0,
            currentTime: 0,
            data: undefined,
            isScrolling: true,
        };
        this.color = undefined;
        this.fullscreen = false;
        this.fixedSlotPlacement = 'after';
        this.forceOverscroll = undefined;
        this.scrollX = false;
        this.scrollY = true;
        this.scrollEvents = false;
    }
    componentWillLoad() {
        this.inheritedAttributes = inheritAriaAttributes(this.el);
    }
    connectedCallback() {
        this.isMainContent = this.el.closest('ion-menu, ion-popover, ion-modal') === null;
        /**
         * The fullscreen content offsets need to be
         * computed after the tab bar has loaded. Since
         * lazy evaluation means components are not hydrated
         * at the same time, we need to wait for the ionTabBarLoaded
         * event to fire. This does not impact dist-custom-elements
         * because there is no hydration there.
         */
        if (hasLazyBuild(this.el)) {
            /**
             * We need to cache the reference to the tabs.
             * If just the content is unmounted then we won't
             * be able to query for the closest tabs on disconnectedCallback
             * since the content has been removed from the DOM tree.
             */
            const closestTabs = (this.tabsElement = this.el.closest('ion-tabs'));
            if (closestTabs !== null) {
                /**
                 * When adding and removing the event listener
                 * we need to make sure we pass the same function reference
                 * otherwise the event listener will not be removed properly.
                 * We can't only pass `this.resize` because "this" in the function
                 * context becomes a reference to IonTabs instead of IonContent.
                 *
                 * Additionally, we listen for ionTabBarLoaded on the IonTabs
                 * instance rather than the IonTabBar instance. It's possible for
                 * a tab bar to be conditionally rendered/mounted. Since ionTabBarLoaded
                 * bubbles, we can catch any instances of child tab bars loading by listening
                 * on IonTabs.
                 */
                this.tabsLoadCallback = () => this.resize();
                closestTabs.addEventListener('ionTabBarLoaded', this.tabsLoadCallback);
            }
        }
    }
    disconnectedCallback() {
        this.onScrollEnd();
        if (hasLazyBuild(this.el)) {
            /**
             * The event listener and tabs caches need to
             * be cleared otherwise this will create a memory
             * leak where the IonTabs instance can never be
             * garbage collected.
             */
            const { tabsElement, tabsLoadCallback } = this;
            if (tabsElement !== null && tabsLoadCallback !== undefined) {
                tabsElement.removeEventListener('ionTabBarLoaded', tabsLoadCallback);
            }
            this.tabsElement = null;
            this.tabsLoadCallback = undefined;
        }
    }
    /**
     * Rotating certain devices can update
     * the safe area insets. As a result,
     * the fullscreen feature on ion-content
     * needs to be recalculated.
     *
     * We listen for "resize" because we
     * do not care what the orientation of
     * the device is. Other APIs
     * such as ScreenOrientation or
     * the deviceorientation event must have
     * permission from the user first whereas
     * the "resize" event does not.
     *
     * We also throttle the callback to minimize
     * thrashing when quickly resizing a window.
     */
    onResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        this.resizeTimeout = setTimeout(() => {
            /**
             * Resize should only happen
             * if the content is visible.
             * When the content is hidden
             * then offsetParent will be null.
             */
            if (this.el.offsetParent === null) {
                return;
            }
            this.resize();
        }, 100);
    }
    shouldForceOverscroll() {
        const { forceOverscroll } = this;
        const mode = getIonMode(this);
        return forceOverscroll === undefined ? mode === 'ios' && isPlatform('ios') : forceOverscroll;
    }
    resize() {
        /**
         * Only force update if the component is rendered in a browser context.
         * Using `forceUpdate` in a server context with pre-rendering can lead to an infinite loop.
         * The `hydrateDocument` function in `@stencil/core` will render the `ion-content`, but
         * `forceUpdate` will trigger another render, locking up the server.
         *
         * TODO: Remove if STENCIL-834 determines Stencil will account for this.
         */
        {
            if (this.fullscreen) {
                readTask(() => this.readDimensions());
            }
            else if (this.cTop !== 0 || this.cBottom !== 0) {
                this.cTop = this.cBottom = 0;
                forceUpdate(this);
            }
        }
    }
    readDimensions() {
        const page = getPageElement(this.el);
        const top = Math.max(this.el.offsetTop, 0);
        const bottom = Math.max(page.offsetHeight - top - this.el.offsetHeight, 0);
        const dirty = top !== this.cTop || bottom !== this.cBottom;
        if (dirty) {
            this.cTop = top;
            this.cBottom = bottom;
            forceUpdate(this);
        }
    }
    onScroll(ev) {
        const timeStamp = Date.now();
        const shouldStart = !this.isScrolling;
        this.lastScroll = timeStamp;
        if (shouldStart) {
            this.onScrollStart();
        }
        if (!this.queued && this.scrollEvents) {
            this.queued = true;
            readTask((ts) => {
                this.queued = false;
                this.detail.event = ev;
                updateScrollDetail(this.detail, this.scrollEl, ts, shouldStart);
                this.ionScroll.emit(this.detail);
            });
        }
    }
    /**
     * Get the element where the actual scrolling takes place.
     * This element can be used to subscribe to `scroll` events or manually modify
     * `scrollTop`. However, it's recommended to use the API provided by `ion-content`:
     *
     * i.e. Using `ionScroll`, `ionScrollStart`, `ionScrollEnd` for scrolling events
     * and `scrollToPoint()` to scroll the content into a certain point.
     */
    async getScrollElement() {
        /**
         * If this gets called in certain early lifecycle hooks (ex: Vue onMounted),
         * scrollEl won't be defined yet with the custom elements build, so wait for it to load in.
         */
        if (!this.scrollEl) {
            await new Promise((resolve) => componentOnReady(this.el, resolve));
        }
        return Promise.resolve(this.scrollEl);
    }
    /**
     * Returns the background content element.
     * @internal
     */
    async getBackgroundElement() {
        if (!this.backgroundContentEl) {
            await new Promise((resolve) => componentOnReady(this.el, resolve));
        }
        return Promise.resolve(this.backgroundContentEl);
    }
    /**
     * Scroll to the top of the component.
     *
     * @param duration The amount of time to take scrolling to the top. Defaults to `0`.
     */
    scrollToTop(duration = 0) {
        return this.scrollToPoint(undefined, 0, duration);
    }
    /**
     * Scroll to the bottom of the component.
     *
     * @param duration The amount of time to take scrolling to the bottom. Defaults to `0`.
     */
    async scrollToBottom(duration = 0) {
        const scrollEl = await this.getScrollElement();
        const y = scrollEl.scrollHeight - scrollEl.clientHeight;
        return this.scrollToPoint(undefined, y, duration);
    }
    /**
     * Scroll by a specified X/Y distance in the component.
     *
     * @param x The amount to scroll by on the horizontal axis.
     * @param y The amount to scroll by on the vertical axis.
     * @param duration The amount of time to take scrolling by that amount.
     */
    async scrollByPoint(x, y, duration) {
        const scrollEl = await this.getScrollElement();
        return this.scrollToPoint(x + scrollEl.scrollLeft, y + scrollEl.scrollTop, duration);
    }
    /**
     * Scroll to a specified X/Y location in the component.
     *
     * @param x The point to scroll to on the horizontal axis.
     * @param y The point to scroll to on the vertical axis.
     * @param duration The amount of time to take scrolling to that point. Defaults to `0`.
     */
    async scrollToPoint(x, y, duration = 0) {
        const el = await this.getScrollElement();
        if (duration < 32) {
            if (y != null) {
                el.scrollTop = y;
            }
            if (x != null) {
                el.scrollLeft = x;
            }
            return;
        }
        let resolve;
        let startTime = 0;
        const promise = new Promise((r) => (resolve = r));
        const fromY = el.scrollTop;
        const fromX = el.scrollLeft;
        const deltaY = y != null ? y - fromY : 0;
        const deltaX = x != null ? x - fromX : 0;
        // scroll loop
        const step = (timeStamp) => {
            const linearTime = Math.min(1, (timeStamp - startTime) / duration) - 1;
            const easedT = Math.pow(linearTime, 3) + 1;
            if (deltaY !== 0) {
                el.scrollTop = Math.floor(easedT * deltaY + fromY);
            }
            if (deltaX !== 0) {
                el.scrollLeft = Math.floor(easedT * deltaX + fromX);
            }
            if (easedT < 1) {
                // do not use DomController here
                // must use nativeRaf in order to fire in the next frame
                requestAnimationFrame(step);
            }
            else {
                resolve();
            }
        };
        // chill out for a frame first
        requestAnimationFrame((ts) => {
            startTime = ts;
            step(ts);
        });
        return promise;
    }
    onScrollStart() {
        this.isScrolling = true;
        this.ionScrollStart.emit({
            isScrolling: true,
        });
        if (this.watchDog) {
            clearInterval(this.watchDog);
        }
        // watchdog
        this.watchDog = setInterval(() => {
            if (this.lastScroll < Date.now() - 120) {
                this.onScrollEnd();
            }
        }, 100);
    }
    onScrollEnd() {
        if (this.watchDog)
            clearInterval(this.watchDog);
        this.watchDog = null;
        if (this.isScrolling) {
            this.isScrolling = false;
            this.ionScrollEnd.emit({
                isScrolling: false,
            });
        }
    }
    render() {
        const { fixedSlotPlacement, inheritedAttributes, isMainContent, scrollX, scrollY, el } = this;
        const rtl = isRTL(el) ? 'rtl' : 'ltr';
        const mode = getIonMode(this);
        const forceOverscroll = this.shouldForceOverscroll();
        const transitionShadow = mode === 'ios';
        this.resize();
        return (h(Host, Object.assign({ key: 'f2a24aa66dbf5c76f9d4b06f708eb73cadc239df', role: isMainContent ? 'main' : undefined, class: createColorClasses(this.color, {
                [mode]: true,
                'content-sizing': hostContext('ion-popover', this.el),
                overscroll: forceOverscroll,
                [`content-${rtl}`]: true,
            }), style: {
                '--offset-top': `${this.cTop}px`,
                '--offset-bottom': `${this.cBottom}px`,
            } }, inheritedAttributes), h("div", { key: '6480ca7648b278abb36477b3838bccbcd4995e2a', ref: (el) => (this.backgroundContentEl = el), id: "background-content", part: "background" }), fixedSlotPlacement === 'before' ? h("slot", { name: "fixed" }) : null, h("div", { key: '29a23b663f5f0215bb000820c01e1814c0d55985', class: {
                'inner-scroll': true,
                'scroll-x': scrollX,
                'scroll-y': scrollY,
                overscroll: (scrollX || scrollY) && forceOverscroll,
            }, ref: (scrollEl) => (this.scrollEl = scrollEl), onScroll: this.scrollEvents ? (ev) => this.onScroll(ev) : undefined, part: "scroll" }, h("slot", { key: '0fe1bd05609a4b88ae2ce9addf5d5dc5dc1806f0' })), transitionShadow ? (h("div", { class: "transition-effect" }, h("div", { class: "transition-cover" }), h("div", { class: "transition-shadow" }))) : null, fixedSlotPlacement === 'after' ? h("slot", { name: "fixed" }) : null));
    }
    get el() { return getElement(this); }
};
const getParentElement = (el) => {
    var _a;
    if (el.parentElement) {
        // normal element with a parent element
        return el.parentElement;
    }
    if ((_a = el.parentNode) === null || _a === void 0 ? void 0 : _a.host) {
        // shadow dom's document fragment
        return el.parentNode.host;
    }
    return null;
};
const getPageElement = (el) => {
    const tabs = el.closest('ion-tabs');
    if (tabs) {
        return tabs;
    }
    /**
     * If we're in a popover, we need to use its wrapper so we can account for space
     * between the popover and the edges of the screen. But if the popover contains
     * its own page element, we should use that instead.
     */
    const page = el.closest('ion-app, ion-page, .ion-page, page-inner, .popover-content');
    if (page) {
        return page;
    }
    return getParentElement(el);
};
// ******** DOM READ ****************
const updateScrollDetail = (detail, el, timestamp, shouldStart) => {
    const prevX = detail.currentX;
    const prevY = detail.currentY;
    const prevT = detail.currentTime;
    const currentX = el.scrollLeft;
    const currentY = el.scrollTop;
    const timeDelta = timestamp - prevT;
    if (shouldStart) {
        // remember the start positions
        detail.startTime = timestamp;
        detail.startX = currentX;
        detail.startY = currentY;
        detail.velocityX = detail.velocityY = 0;
    }
    detail.currentTime = timestamp;
    detail.currentX = detail.scrollLeft = currentX;
    detail.currentY = detail.scrollTop = currentY;
    detail.deltaX = currentX - detail.startX;
    detail.deltaY = currentY - detail.startY;
    if (timeDelta > 0 && timeDelta < 100) {
        const velocityX = (currentX - prevX) / timeDelta;
        const velocityY = (currentY - prevY) / timeDelta;
        detail.velocityX = velocityX * 0.7 + detail.velocityX * 0.3;
        detail.velocityY = velocityY * 0.7 + detail.velocityY * 0.3;
    }
};
Content.style = IonContentStyle0;

const handleFooterFade = (scrollEl, baseEl) => {
    readTask(() => {
        const scrollTop = scrollEl.scrollTop;
        const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
        /**
         * Toolbar background will fade
         * out over fadeDuration in pixels.
         */
        const fadeDuration = 10;
        /**
         * Begin fading out maxScroll - 30px
         * from the bottom of the content.
         * Also determine how close we are
         * to starting the fade. If we are
         * before the starting point, the
         * scale value will get clamped to 0.
         * If we are after the maxScroll (rubber
         * band scrolling), the scale value will
         * get clamped to 1.
         */
        const fadeStart = maxScroll - fadeDuration;
        const distanceToStart = scrollTop - fadeStart;
        const scale = clamp(0, 1 - distanceToStart / fadeDuration, 1);
        writeTask(() => {
            baseEl.style.setProperty('--opacity-scale', scale.toString());
        });
    });
};

const footerIosCss = "ion-footer{display:block;position:relative;-ms-flex-order:1;order:1;width:100%;z-index:10}ion-footer.footer-toolbar-padding ion-toolbar:last-of-type{padding-bottom:var(--ion-safe-area-bottom, 0)}.footer-ios ion-toolbar:first-of-type{--border-width:0.55px 0 0}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.footer-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}.footer-translucent-ios ion-toolbar{--opacity:.8}}.footer-ios.ion-no-border ion-toolbar:first-of-type{--border-width:0}.footer-collapse-fade ion-toolbar{--opacity-scale:inherit}";
const IonFooterIosStyle0 = footerIosCss;

const footerMdCss = "ion-footer{display:block;position:relative;-ms-flex-order:1;order:1;width:100%;z-index:10}ion-footer.footer-toolbar-padding ion-toolbar:last-of-type{padding-bottom:var(--ion-safe-area-bottom, 0)}.footer-md{-webkit-box-shadow:0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);box-shadow:0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12)}.footer-md.ion-no-border{-webkit-box-shadow:none;box-shadow:none}";
const IonFooterMdStyle0 = footerMdCss;

const Footer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.keyboardCtrl = null;
        this.checkCollapsibleFooter = () => {
            const mode = getIonMode(this);
            if (mode !== 'ios') {
                return;
            }
            const { collapse } = this;
            const hasFade = collapse === 'fade';
            this.destroyCollapsibleFooter();
            if (hasFade) {
                const pageEl = this.el.closest('ion-app,ion-page,.ion-page,page-inner');
                const contentEl = pageEl ? findIonContent(pageEl) : null;
                if (!contentEl) {
                    printIonContentErrorMsg(this.el);
                    return;
                }
                this.setupFadeFooter(contentEl);
            }
        };
        this.setupFadeFooter = async (contentEl) => {
            const scrollEl = (this.scrollEl = await getScrollElement(contentEl));
            /**
             * Handle fading of toolbars on scroll
             */
            this.contentScrollCallback = () => {
                handleFooterFade(scrollEl, this.el);
            };
            scrollEl.addEventListener('scroll', this.contentScrollCallback);
            handleFooterFade(scrollEl, this.el);
        };
        this.keyboardVisible = false;
        this.collapse = undefined;
        this.translucent = false;
    }
    componentDidLoad() {
        this.checkCollapsibleFooter();
    }
    componentDidUpdate() {
        this.checkCollapsibleFooter();
    }
    async connectedCallback() {
        this.keyboardCtrl = await createKeyboardController(async (keyboardOpen, waitForResize) => {
            /**
             * If the keyboard is hiding, then we need to wait
             * for the webview to resize. Otherwise, the footer
             * will flicker before the webview resizes.
             */
            if (keyboardOpen === false && waitForResize !== undefined) {
                await waitForResize;
            }
            this.keyboardVisible = keyboardOpen; // trigger re-render by updating state
        });
    }
    disconnectedCallback() {
        if (this.keyboardCtrl) {
            this.keyboardCtrl.destroy();
        }
    }
    destroyCollapsibleFooter() {
        if (this.scrollEl && this.contentScrollCallback) {
            this.scrollEl.removeEventListener('scroll', this.contentScrollCallback);
            this.contentScrollCallback = undefined;
        }
    }
    render() {
        const { translucent, collapse } = this;
        const mode = getIonMode(this);
        const tabs = this.el.closest('ion-tabs');
        const tabBar = tabs === null || tabs === void 0 ? void 0 : tabs.querySelector(':scope > ion-tab-bar');
        return (h(Host, { key: 'ddc228f1a1e7fa4f707dccf74db2490ca3241137', role: "contentinfo", class: {
                [mode]: true,
                // Used internally for styling
                [`footer-${mode}`]: true,
                [`footer-translucent`]: translucent,
                [`footer-translucent-${mode}`]: translucent,
                ['footer-toolbar-padding']: !this.keyboardVisible && (!tabBar || tabBar.slot !== 'bottom'),
                [`footer-collapse-${collapse}`]: collapse !== undefined,
            } }, mode === 'ios' && translucent && h("div", { key: 'e16ed4963ff94e06de77eb8038201820af73937c', class: "footer-background" }), h("slot", { key: 'f186934febf85d37133d9351a96c1a64b0a4b203' })));
    }
    get el() { return getElement(this); }
};
Footer.style = {
    ios: IonFooterIosStyle0,
    md: IonFooterMdStyle0
};

const TRANSITION = 'all 0.2s ease-in-out';
const cloneElement = (tagName) => {
    const getCachedEl = document.querySelector(`${tagName}.ion-cloned-element`);
    if (getCachedEl !== null) {
        return getCachedEl;
    }
    const clonedEl = document.createElement(tagName);
    clonedEl.classList.add('ion-cloned-element');
    clonedEl.style.setProperty('display', 'none');
    document.body.appendChild(clonedEl);
    return clonedEl;
};
const createHeaderIndex = (headerEl) => {
    if (!headerEl) {
        return;
    }
    const toolbars = headerEl.querySelectorAll('ion-toolbar');
    return {
        el: headerEl,
        toolbars: Array.from(toolbars).map((toolbar) => {
            const ionTitleEl = toolbar.querySelector('ion-title');
            return {
                el: toolbar,
                background: toolbar.shadowRoot.querySelector('.toolbar-background'),
                ionTitleEl,
                innerTitleEl: ionTitleEl ? ionTitleEl.shadowRoot.querySelector('.toolbar-title') : null,
                ionButtonsEl: Array.from(toolbar.querySelectorAll('ion-buttons')),
            };
        }),
    };
};
const handleContentScroll = (scrollEl, scrollHeaderIndex, contentEl) => {
    readTask(() => {
        const scrollTop = scrollEl.scrollTop;
        const scale = clamp(1, 1 + -scrollTop / 500, 1.1);
        // Native refresher should not cause titles to scale
        const nativeRefresher = contentEl.querySelector('ion-refresher.refresher-native');
        if (nativeRefresher === null) {
            writeTask(() => {
                scaleLargeTitles(scrollHeaderIndex.toolbars, scale);
            });
        }
    });
};
const setToolbarBackgroundOpacity = (headerEl, opacity) => {
    /**
     * Fading in the backdrop opacity
     * should happen after the large title
     * has collapsed, so it is handled
     * by handleHeaderFade()
     */
    if (headerEl.collapse === 'fade') {
        return;
    }
    if (opacity === undefined) {
        headerEl.style.removeProperty('--opacity-scale');
    }
    else {
        headerEl.style.setProperty('--opacity-scale', opacity.toString());
    }
};
const handleToolbarBorderIntersection = (ev, mainHeaderIndex, scrollTop) => {
    if (!ev[0].isIntersecting) {
        return;
    }
    /**
     * There is a bug in Safari where overflow scrolling on a non-body element
     * does not always reset the scrollTop position to 0 when letting go. It will
     * set to 1 once the rubber band effect has ended. This causes the background to
     * appear slightly on certain app setups.
     *
     * Additionally, we check if user is rubber banding (scrolling is negative)
     * as this can mean they are using pull to refresh. Once the refresher starts,
     * the content is transformed which can cause the intersection observer to erroneously
     * fire here as well.
     */
    const scale = ev[0].intersectionRatio > 0.9 || scrollTop <= 0 ? 0 : ((1 - ev[0].intersectionRatio) * 100) / 75;
    setToolbarBackgroundOpacity(mainHeaderIndex.el, scale === 1 ? undefined : scale);
};
/**
 * If toolbars are intersecting, hide the scrollable toolbar content
 * and show the primary toolbar content. If the toolbars are not intersecting,
 * hide the primary toolbar content and show the scrollable toolbar content
 */
const handleToolbarIntersection = (ev, // TODO(FW-2832): type (IntersectionObserverEntry[] triggers errors which should be sorted)
mainHeaderIndex, scrollHeaderIndex, scrollEl) => {
    writeTask(() => {
        const scrollTop = scrollEl.scrollTop;
        handleToolbarBorderIntersection(ev, mainHeaderIndex, scrollTop);
        const event = ev[0];
        const intersection = event.intersectionRect;
        const intersectionArea = intersection.width * intersection.height;
        const rootArea = event.rootBounds.width * event.rootBounds.height;
        const isPageHidden = intersectionArea === 0 && rootArea === 0;
        const leftDiff = Math.abs(intersection.left - event.boundingClientRect.left);
        const rightDiff = Math.abs(intersection.right - event.boundingClientRect.right);
        const isPageTransitioning = intersectionArea > 0 && (leftDiff >= 5 || rightDiff >= 5);
        if (isPageHidden || isPageTransitioning) {
            return;
        }
        if (event.isIntersecting) {
            setHeaderActive(mainHeaderIndex, false);
            setHeaderActive(scrollHeaderIndex);
        }
        else {
            /**
             * There is a bug with IntersectionObserver on Safari
             * where `event.isIntersecting === false` when cancelling
             * a swipe to go back gesture. Checking the intersection
             * x, y, width, and height provides a workaround. This bug
             * does not happen when using Safari + Web Animations,
             * only Safari + CSS Animations.
             */
            const hasValidIntersection = (intersection.x === 0 && intersection.y === 0) || (intersection.width !== 0 && intersection.height !== 0);
            if (hasValidIntersection && scrollTop > 0) {
                setHeaderActive(mainHeaderIndex);
                setHeaderActive(scrollHeaderIndex, false);
                setToolbarBackgroundOpacity(mainHeaderIndex.el);
            }
        }
    });
};
const setHeaderActive = (headerIndex, active = true) => {
    const headerEl = headerIndex.el;
    const toolbars = headerIndex.toolbars;
    const ionTitles = toolbars.map((toolbar) => toolbar.ionTitleEl);
    if (active) {
        headerEl.classList.remove('header-collapse-condense-inactive');
        ionTitles.forEach((ionTitle) => {
            if (ionTitle) {
                ionTitle.removeAttribute('aria-hidden');
            }
        });
    }
    else {
        headerEl.classList.add('header-collapse-condense-inactive');
        /**
         * The small title should only be accessed by screen readers
         * when the large title collapses into the small title due
         * to scrolling.
         *
         * Originally, the header was given `aria-hidden="true"`
         * but this caused issues with screen readers not being
         * able to access any focusable elements within the header.
         */
        ionTitles.forEach((ionTitle) => {
            if (ionTitle) {
                ionTitle.setAttribute('aria-hidden', 'true');
            }
        });
    }
};
const scaleLargeTitles = (toolbars = [], scale = 1, transition = false) => {
    toolbars.forEach((toolbar) => {
        const ionTitle = toolbar.ionTitleEl;
        const titleDiv = toolbar.innerTitleEl;
        if (!ionTitle || ionTitle.size !== 'large') {
            return;
        }
        titleDiv.style.transition = transition ? TRANSITION : '';
        titleDiv.style.transform = `scale3d(${scale}, ${scale}, 1)`;
    });
};
const handleHeaderFade = (scrollEl, baseEl, condenseHeader) => {
    readTask(() => {
        const scrollTop = scrollEl.scrollTop;
        const baseElHeight = baseEl.clientHeight;
        const fadeStart = condenseHeader ? condenseHeader.clientHeight : 0;
        /**
         * If we are using fade header with a condense
         * header, then the toolbar backgrounds should
         * not begin to fade in until the condense
         * header has fully collapsed.
         *
         * Additionally, the main content should not
         * overflow out of the container until the
         * condense header has fully collapsed. When
         * using just the condense header the content
         * should overflow out of the container.
         */
        if (condenseHeader !== null && scrollTop < fadeStart) {
            baseEl.style.setProperty('--opacity-scale', '0');
            scrollEl.style.setProperty('clip-path', `inset(${baseElHeight}px 0px 0px 0px)`);
            return;
        }
        const distanceToStart = scrollTop - fadeStart;
        const fadeDuration = 10;
        const scale = clamp(0, distanceToStart / fadeDuration, 1);
        writeTask(() => {
            scrollEl.style.removeProperty('clip-path');
            baseEl.style.setProperty('--opacity-scale', scale.toString());
        });
    });
};

const headerIosCss = "ion-header{display:block;position:relative;-ms-flex-order:-1;order:-1;width:100%;z-index:10}ion-header ion-toolbar:first-of-type{padding-top:var(--ion-safe-area-top, 0)}.header-ios ion-toolbar:last-of-type{--border-width:0 0 0.55px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.header-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}.header-translucent-ios ion-toolbar{--opacity:.8}.header-collapse-condense-inactive .header-background{-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}}.header-ios.ion-no-border ion-toolbar:last-of-type{--border-width:0}.header-collapse-fade ion-toolbar{--opacity-scale:inherit}.header-collapse-condense{z-index:9}.header-collapse-condense ion-toolbar{position:-webkit-sticky;position:sticky;top:0}.header-collapse-condense ion-toolbar:first-of-type{padding-top:0px;z-index:1}.header-collapse-condense ion-toolbar{--background:var(--ion-background-color, #fff);z-index:0}.header-collapse-condense ion-toolbar:last-of-type{--border-width:0px}.header-collapse-condense ion-toolbar ion-searchbar{padding-top:0px;padding-bottom:13px}.header-collapse-main{--opacity-scale:1}.header-collapse-main ion-toolbar{--opacity-scale:inherit}.header-collapse-main ion-toolbar.in-toolbar ion-title,.header-collapse-main ion-toolbar.in-toolbar ion-buttons{-webkit-transition:all 0.2s ease-in-out;transition:all 0.2s ease-in-out}.header-collapse-condense-inactive:not(.header-collapse-condense) ion-toolbar.in-toolbar ion-title,.header-collapse-condense-inactive:not(.header-collapse-condense) ion-toolbar.in-toolbar ion-buttons.buttons-collapse{opacity:0;pointer-events:none}.header-collapse-condense-inactive.header-collapse-condense ion-toolbar.in-toolbar ion-title,.header-collapse-condense-inactive.header-collapse-condense ion-toolbar.in-toolbar ion-buttons.buttons-collapse{visibility:hidden}ion-header.header-ios:not(.header-collapse-main):has(~ion-content ion-header.header-ios[collapse=condense],~ion-content ion-header.header-ios.header-collapse-condense){opacity:0}";
const IonHeaderIosStyle0 = headerIosCss;

const headerMdCss = "ion-header{display:block;position:relative;-ms-flex-order:-1;order:-1;width:100%;z-index:10}ion-header ion-toolbar:first-of-type{padding-top:var(--ion-safe-area-top, 0)}.header-md{-webkit-box-shadow:0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);box-shadow:0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12)}.header-collapse-condense{display:none}.header-md.ion-no-border{-webkit-box-shadow:none;box-shadow:none}";
const IonHeaderMdStyle0 = headerMdCss;

const Header = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.inheritedAttributes = {};
        this.setupFadeHeader = async (contentEl, condenseHeader) => {
            const scrollEl = (this.scrollEl = await getScrollElement(contentEl));
            /**
             * Handle fading of toolbars on scroll
             */
            this.contentScrollCallback = () => {
                handleHeaderFade(this.scrollEl, this.el, condenseHeader);
            };
            scrollEl.addEventListener('scroll', this.contentScrollCallback);
            handleHeaderFade(this.scrollEl, this.el, condenseHeader);
        };
        this.collapse = undefined;
        this.translucent = false;
    }
    componentWillLoad() {
        this.inheritedAttributes = inheritAriaAttributes(this.el);
    }
    componentDidLoad() {
        this.checkCollapsibleHeader();
    }
    componentDidUpdate() {
        this.checkCollapsibleHeader();
    }
    disconnectedCallback() {
        this.destroyCollapsibleHeader();
    }
    async checkCollapsibleHeader() {
        const mode = getIonMode(this);
        if (mode !== 'ios') {
            return;
        }
        const { collapse } = this;
        const hasCondense = collapse === 'condense';
        const hasFade = collapse === 'fade';
        this.destroyCollapsibleHeader();
        if (hasCondense) {
            const pageEl = this.el.closest('ion-app,ion-page,.ion-page,page-inner');
            const contentEl = pageEl ? findIonContent(pageEl) : null;
            // Cloned elements are always needed in iOS transition
            writeTask(() => {
                const title = cloneElement('ion-title');
                title.size = 'large';
                cloneElement('ion-back-button');
            });
            await this.setupCondenseHeader(contentEl, pageEl);
        }
        else if (hasFade) {
            const pageEl = this.el.closest('ion-app,ion-page,.ion-page,page-inner');
            const contentEl = pageEl ? findIonContent(pageEl) : null;
            if (!contentEl) {
                printIonContentErrorMsg(this.el);
                return;
            }
            const condenseHeader = contentEl.querySelector('ion-header[collapse="condense"]');
            await this.setupFadeHeader(contentEl, condenseHeader);
        }
    }
    destroyCollapsibleHeader() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = undefined;
        }
        if (this.scrollEl && this.contentScrollCallback) {
            this.scrollEl.removeEventListener('scroll', this.contentScrollCallback);
            this.contentScrollCallback = undefined;
        }
        if (this.collapsibleMainHeader) {
            this.collapsibleMainHeader.classList.remove('header-collapse-main');
            this.collapsibleMainHeader = undefined;
        }
    }
    async setupCondenseHeader(contentEl, pageEl) {
        if (!contentEl || !pageEl) {
            printIonContentErrorMsg(this.el);
            return;
        }
        if (typeof IntersectionObserver === 'undefined') {
            return;
        }
        this.scrollEl = await getScrollElement(contentEl);
        const headers = pageEl.querySelectorAll('ion-header');
        this.collapsibleMainHeader = Array.from(headers).find((header) => header.collapse !== 'condense');
        if (!this.collapsibleMainHeader) {
            return;
        }
        const mainHeaderIndex = createHeaderIndex(this.collapsibleMainHeader);
        const scrollHeaderIndex = createHeaderIndex(this.el);
        if (!mainHeaderIndex || !scrollHeaderIndex) {
            return;
        }
        setHeaderActive(mainHeaderIndex, false);
        setToolbarBackgroundOpacity(mainHeaderIndex.el, 0);
        /**
         * Handle interaction between toolbar collapse and
         * showing/hiding content in the primary ion-header
         * as well as progressively showing/hiding the main header
         * border as the top-most toolbar collapses or expands.
         */
        const toolbarIntersection = (ev) => {
            handleToolbarIntersection(ev, mainHeaderIndex, scrollHeaderIndex, this.scrollEl);
        };
        this.intersectionObserver = new IntersectionObserver(toolbarIntersection, {
            root: contentEl,
            threshold: [0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        });
        this.intersectionObserver.observe(scrollHeaderIndex.toolbars[scrollHeaderIndex.toolbars.length - 1].el);
        /**
         * Handle scaling of large iOS titles and
         * showing/hiding border on last toolbar
         * in primary header
         */
        this.contentScrollCallback = () => {
            handleContentScroll(this.scrollEl, scrollHeaderIndex, contentEl);
        };
        this.scrollEl.addEventListener('scroll', this.contentScrollCallback);
        writeTask(() => {
            if (this.collapsibleMainHeader !== undefined) {
                this.collapsibleMainHeader.classList.add('header-collapse-main');
            }
        });
    }
    render() {
        const { translucent, inheritedAttributes } = this;
        const mode = getIonMode(this);
        const collapse = this.collapse || 'none';
        // banner role must be at top level, so remove role if inside a menu
        const roleType = hostContext('ion-menu', this.el) ? 'none' : 'banner';
        return (h(Host, Object.assign({ key: 'b6cc27f0b08afc9fcc889683525da765d80ba672', role: roleType, class: {
                [mode]: true,
                // Used internally for styling
                [`header-${mode}`]: true,
                [`header-translucent`]: this.translucent,
                [`header-collapse-${collapse}`]: true,
                [`header-translucent-${mode}`]: this.translucent,
            } }, inheritedAttributes), mode === 'ios' && translucent && h("div", { key: '395766d4dcee3398bc91960db21f922095292f14', class: "header-background" }), h("slot", { key: '09a67ece27b258ff1248805d43d92a49b2c6859a' })));
    }
    get el() { return getElement(this); }
};
Header.style = {
    ios: IonHeaderIosStyle0,
    md: IonHeaderMdStyle0
};

const routerOutletCss = ":host{left:0;right:0;top:0;bottom:0;position:absolute;contain:layout size style;z-index:0}";
const IonRouterOutletStyle0 = routerOutletCss;

const RouterOutlet = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.ionNavWillLoad = createEvent(this, "ionNavWillLoad", 7);
        this.ionNavWillChange = createEvent(this, "ionNavWillChange", 3);
        this.ionNavDidChange = createEvent(this, "ionNavDidChange", 3);
        this.lockController = createLockController();
        this.gestureOrAnimationInProgress = false;
        this.mode = getIonMode(this);
        this.delegate = undefined;
        this.animated = true;
        this.animation = undefined;
        this.swipeHandler = undefined;
    }
    swipeHandlerChanged() {
        if (this.gesture) {
            this.gesture.enable(this.swipeHandler !== undefined);
        }
    }
    async connectedCallback() {
        const onStart = () => {
            this.gestureOrAnimationInProgress = true;
            if (this.swipeHandler) {
                this.swipeHandler.onStart();
            }
        };
        this.gesture = (await import('./swipe-back-0184f6b3.js')).createSwipeBackGesture(this.el, () => !this.gestureOrAnimationInProgress && !!this.swipeHandler && this.swipeHandler.canStart(), () => onStart(), (step) => { var _a; return (_a = this.ani) === null || _a === void 0 ? void 0 : _a.progressStep(step); }, (shouldComplete, step, dur) => {
            if (this.ani) {
                this.ani.onFinish(() => {
                    this.gestureOrAnimationInProgress = false;
                    if (this.swipeHandler) {
                        this.swipeHandler.onEnd(shouldComplete);
                    }
                }, { oneTimeCallback: true });
                // Account for rounding errors in JS
                let newStepValue = shouldComplete ? -0.001 : 0.001;
                /**
                 * Animation will be reversed here, so need to
                 * reverse the easing curve as well
                 *
                 * Additionally, we need to account for the time relative
                 * to the new easing curve, as `stepValue` is going to be given
                 * in terms of a linear curve.
                 */
                if (!shouldComplete) {
                    this.ani.easing('cubic-bezier(1, 0, 0.68, 0.28)');
                    newStepValue += getTimeGivenProgression([0, 0], [1, 0], [0.68, 0.28], [1, 1], step)[0];
                }
                else {
                    newStepValue += getTimeGivenProgression([0, 0], [0.32, 0.72], [0, 1], [1, 1], step)[0];
                }
                this.ani.progressEnd(shouldComplete ? 1 : 0, newStepValue, dur);
            }
            else {
                this.gestureOrAnimationInProgress = false;
            }
        });
        this.swipeHandlerChanged();
    }
    componentWillLoad() {
        this.ionNavWillLoad.emit();
    }
    disconnectedCallback() {
        if (this.gesture) {
            this.gesture.destroy();
            this.gesture = undefined;
        }
    }
    /** @internal */
    async commit(enteringEl, leavingEl, opts) {
        const unlock = await this.lockController.lock();
        let changed = false;
        try {
            changed = await this.transition(enteringEl, leavingEl, opts);
        }
        catch (e) {
            printIonError('[ion-router-outlet] - Exception in commit:', e);
        }
        unlock();
        return changed;
    }
    /** @internal */
    async setRouteId(id, params, direction, animation) {
        const changed = await this.setRoot(id, params, {
            duration: direction === 'root' ? 0 : undefined,
            direction: direction === 'back' ? 'back' : 'forward',
            animationBuilder: animation,
        });
        return {
            changed,
            element: this.activeEl,
        };
    }
    /** @internal */
    async getRouteId() {
        const active = this.activeEl;
        return active
            ? {
                id: active.tagName,
                element: active,
                params: this.activeParams,
            }
            : undefined;
    }
    async setRoot(component, params, opts) {
        if (this.activeComponent === component && shallowEqualStringMap(params, this.activeParams)) {
            return false;
        }
        // attach entering view to DOM
        const leavingEl = this.activeEl;
        const enteringEl = await attachComponent(this.delegate, this.el, component, ['ion-page', 'ion-page-invisible'], params);
        this.activeComponent = component;
        this.activeEl = enteringEl;
        this.activeParams = params;
        // commit animation
        await this.commit(enteringEl, leavingEl, opts);
        await detachComponent(this.delegate, leavingEl);
        return true;
    }
    async transition(enteringEl, leavingEl, opts = {}) {
        if (leavingEl === enteringEl) {
            return false;
        }
        // emit nav will change event
        this.ionNavWillChange.emit();
        const { el, mode } = this;
        const animated = this.animated && config.getBoolean('animated', true);
        const animationBuilder = opts.animationBuilder || this.animation || config.get('navAnimation');
        await transition(Object.assign(Object.assign({ mode,
            animated,
            enteringEl,
            leavingEl, baseEl: el,
            /**
             * We need to wait for all Stencil components
             * to be ready only when using the lazy
             * loaded bundle.
             */
            deepWait: hasLazyBuild(el), progressCallback: opts.progressAnimation
                ? (ani) => {
                    /**
                     * Because this progress callback is called asynchronously
                     * it is possible for the gesture to start and end before
                     * the animation is ever set. In that scenario, we should
                     * immediately call progressEnd so that the transition promise
                     * resolves and the gesture does not get locked up.
                     */
                    if (ani !== undefined && !this.gestureOrAnimationInProgress) {
                        this.gestureOrAnimationInProgress = true;
                        ani.onFinish(() => {
                            this.gestureOrAnimationInProgress = false;
                            if (this.swipeHandler) {
                                this.swipeHandler.onEnd(false);
                            }
                        }, { oneTimeCallback: true });
                        /**
                         * Playing animation to beginning
                         * with a duration of 0 prevents
                         * any flickering when the animation
                         * is later cleaned up.
                         */
                        ani.progressEnd(0, 0, 0);
                    }
                    else {
                        this.ani = ani;
                    }
                }
                : undefined }, opts), { animationBuilder }));
        // emit nav changed event
        this.ionNavDidChange.emit();
        return true;
    }
    render() {
        return h("slot", { key: 'e34e02b5154172c8d5cdd187b6ea58119b6946eb' });
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "swipeHandler": ["swipeHandlerChanged"]
    }; }
};
RouterOutlet.style = IonRouterOutletStyle0;

const titleIosCss = ":host{--color:initial;display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}.toolbar-title{display:block;width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;pointer-events:auto}:host(.title-small) .toolbar-title{white-space:normal}:host{top:0;-webkit-padding-start:90px;padding-inline-start:90px;-webkit-padding-end:90px;padding-inline-end:90px;padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);position:absolute;width:100%;height:100%;-webkit-transform:translateZ(0);transform:translateZ(0);font-size:min(1.0625rem, 20.4px);font-weight:600;text-align:center;-webkit-box-sizing:border-box;box-sizing:border-box;pointer-events:none}:host{inset-inline-start:0}:host(.title-small){-webkit-padding-start:9px;padding-inline-start:9px;-webkit-padding-end:9px;padding-inline-end:9px;padding-top:6px;padding-bottom:16px;position:relative;font-size:min(0.8125rem, 23.4px);font-weight:normal}:host(.title-large){-webkit-padding-start:12px;padding-inline-start:12px;-webkit-padding-end:12px;padding-inline-end:12px;padding-top:2px;padding-bottom:4px;-webkit-transform-origin:left center;transform-origin:left center;position:static;-ms-flex-align:end;align-items:flex-end;min-width:100%;font-size:min(2.125rem, 61.2px);font-weight:700;text-align:start}:host(.title-large.title-rtl){-webkit-transform-origin:right center;transform-origin:right center}:host(.title-large.ion-cloned-element){--color:var(--ion-text-color, #000);font-family:var(--ion-font-family)}:host(.title-large) .toolbar-title{-webkit-transform-origin:inherit;transform-origin:inherit;width:auto}:host-context([dir=rtl]):host(.title-large) .toolbar-title,:host-context([dir=rtl]).title-large .toolbar-title{-webkit-transform-origin:calc(100% - inherit);transform-origin:calc(100% - inherit)}@supports selector(:dir(rtl)){:host(.title-large:dir(rtl)) .toolbar-title{-webkit-transform-origin:calc(100% - inherit);transform-origin:calc(100% - inherit)}}";
const IonTitleIosStyle0 = titleIosCss;

const titleMdCss = ":host{--color:initial;display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}.toolbar-title{display:block;width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;pointer-events:auto}:host(.title-small) .toolbar-title{white-space:normal}:host{-webkit-padding-start:20px;padding-inline-start:20px;-webkit-padding-end:20px;padding-inline-end:20px;padding-top:0;padding-bottom:0;font-size:1.25rem;font-weight:500;letter-spacing:0.0125em}:host(.title-small){width:100%;height:100%;font-size:0.9375rem;font-weight:normal}";
const IonTitleMdStyle0 = titleMdCss;

const ToolbarTitle = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.ionStyle = createEvent(this, "ionStyle", 7);
        this.color = undefined;
        this.size = undefined;
    }
    sizeChanged() {
        this.emitStyle();
    }
    connectedCallback() {
        this.emitStyle();
    }
    emitStyle() {
        const size = this.getSize();
        this.ionStyle.emit({
            [`title-${size}`]: true,
        });
    }
    getSize() {
        return this.size !== undefined ? this.size : 'default';
    }
    render() {
        const mode = getIonMode(this);
        const size = this.getSize();
        return (h(Host, { key: '3f7b19c99961dbb86c0a925218332528b22e6880', class: createColorClasses(this.color, {
                [mode]: true,
                [`title-${size}`]: true,
                'title-rtl': document.dir === 'rtl',
            }) }, h("div", { key: '12054fbdd60e40a15875e442c20143766fc34fc3', class: "toolbar-title" }, h("slot", { key: '9f14fb14a67d4bd1e4536a4d64a637fbe5a151c7' }))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "size": ["sizeChanged"]
    }; }
};
ToolbarTitle.style = {
    ios: IonTitleIosStyle0,
    md: IonTitleMdStyle0
};

const toolbarIosCss = ":host{--border-width:0;--border-style:solid;--opacity:1;--opacity-scale:1;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:block;position:relative;width:100%;padding-right:var(--ion-safe-area-right);padding-left:var(--ion-safe-area-left);color:var(--color);font-family:var(--ion-font-family, inherit);contain:content;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}:host(.ion-color){color:var(--ion-color-contrast)}:host(.ion-color) .toolbar-background{background:var(--ion-color-base)}.toolbar-container{-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);display:-ms-flexbox;display:flex;position:relative;-ms-flex-direction:row;flex-direction:row;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;width:100%;min-height:var(--min-height);contain:content;overflow:hidden;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}.toolbar-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);contain:strict;opacity:calc(var(--opacity) * var(--opacity-scale));z-index:-1;pointer-events:none}::slotted(ion-progress-bar){left:0;right:0;bottom:0;position:absolute}:host{--background:var(--ion-toolbar-background, var(--ion-color-step-50, var(--ion-background-color-step-50, #f7f7f7)));--color:var(--ion-toolbar-color, var(--ion-text-color, #000));--border-color:var(--ion-toolbar-border-color, var(--ion-border-color, var(--ion-color-step-150, var(--ion-background-color-step-150, rgba(0, 0, 0, 0.2)))));--padding-top:3px;--padding-bottom:3px;--padding-start:4px;--padding-end:4px;--min-height:44px}.toolbar-content{-ms-flex:1;flex:1;-ms-flex-order:4;order:4;min-width:0}:host(.toolbar-segment) .toolbar-content{display:-ms-inline-flexbox;display:inline-flex}:host(.toolbar-searchbar) .toolbar-container{padding-top:0;padding-bottom:0}:host(.toolbar-searchbar) ::slotted(*){-ms-flex-item-align:start;align-self:start}:host(.toolbar-searchbar) ::slotted(ion-chip){margin-top:3px}::slotted(ion-buttons){min-height:38px}::slotted([slot=start]){-ms-flex-order:2;order:2}::slotted([slot=secondary]){-ms-flex-order:3;order:3}::slotted([slot=primary]){-ms-flex-order:5;order:5;text-align:end}::slotted([slot=end]){-ms-flex-order:6;order:6;text-align:end}:host(.toolbar-title-large) .toolbar-container{-ms-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-align:start;align-items:flex-start}:host(.toolbar-title-large) .toolbar-content ion-title{-ms-flex:1;flex:1;-ms-flex-order:8;order:8;min-width:100%}";
const IonToolbarIosStyle0 = toolbarIosCss;

const toolbarMdCss = ":host{--border-width:0;--border-style:solid;--opacity:1;--opacity-scale:1;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:block;position:relative;width:100%;padding-right:var(--ion-safe-area-right);padding-left:var(--ion-safe-area-left);color:var(--color);font-family:var(--ion-font-family, inherit);contain:content;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}:host(.ion-color){color:var(--ion-color-contrast)}:host(.ion-color) .toolbar-background{background:var(--ion-color-base)}.toolbar-container{-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);display:-ms-flexbox;display:flex;position:relative;-ms-flex-direction:row;flex-direction:row;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;width:100%;min-height:var(--min-height);contain:content;overflow:hidden;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}.toolbar-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);contain:strict;opacity:calc(var(--opacity) * var(--opacity-scale));z-index:-1;pointer-events:none}::slotted(ion-progress-bar){left:0;right:0;bottom:0;position:absolute}:host{--background:var(--ion-toolbar-background, var(--ion-background-color, #fff));--color:var(--ion-toolbar-color, var(--ion-text-color, #424242));--border-color:var(--ion-toolbar-border-color, var(--ion-border-color, var(--ion-color-step-150, var(--ion-background-color-step-150, #c1c4cd))));--padding-top:0;--padding-bottom:0;--padding-start:0;--padding-end:0;--min-height:56px}.toolbar-content{-ms-flex:1;flex:1;-ms-flex-order:3;order:3;min-width:0;max-width:100%}::slotted(.buttons-first-slot){-webkit-margin-start:4px;margin-inline-start:4px}::slotted(.buttons-last-slot){-webkit-margin-end:4px;margin-inline-end:4px}::slotted([slot=start]){-ms-flex-order:2;order:2}::slotted([slot=secondary]){-ms-flex-order:4;order:4}::slotted([slot=primary]){-ms-flex-order:5;order:5;text-align:end}::slotted([slot=end]){-ms-flex-order:6;order:6;text-align:end}";
const IonToolbarMdStyle0 = toolbarMdCss;

const Toolbar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.childrenStyles = new Map();
        this.color = undefined;
    }
    componentWillLoad() {
        const buttons = Array.from(this.el.querySelectorAll('ion-buttons'));
        const firstButtons = buttons.find((button) => {
            return button.slot === 'start';
        });
        if (firstButtons) {
            firstButtons.classList.add('buttons-first-slot');
        }
        const buttonsReversed = buttons.reverse();
        const lastButtons = buttonsReversed.find((button) => button.slot === 'end') ||
            buttonsReversed.find((button) => button.slot === 'primary') ||
            buttonsReversed.find((button) => button.slot === 'secondary');
        if (lastButtons) {
            lastButtons.classList.add('buttons-last-slot');
        }
    }
    childrenStyle(ev) {
        ev.stopPropagation();
        const tagName = ev.target.tagName;
        const updatedStyles = ev.detail;
        const newStyles = {};
        const childStyles = this.childrenStyles.get(tagName) || {};
        let hasStyleChange = false;
        Object.keys(updatedStyles).forEach((key) => {
            const childKey = `toolbar-${key}`;
            const newValue = updatedStyles[key];
            if (newValue !== childStyles[childKey]) {
                hasStyleChange = true;
            }
            if (newValue) {
                newStyles[childKey] = true;
            }
        });
        if (hasStyleChange) {
            this.childrenStyles.set(tagName, newStyles);
            forceUpdate(this);
        }
    }
    render() {
        const mode = getIonMode(this);
        const childStyles = {};
        this.childrenStyles.forEach((value) => {
            Object.assign(childStyles, value);
        });
        return (h(Host, { key: '402afe7ce0c97883cedd0e48a5a0492a9bfe76ae', class: Object.assign(Object.assign({}, childStyles), createColorClasses(this.color, {
                [mode]: true,
                'in-toolbar': hostContext('ion-toolbar', this.el),
            })) }, h("div", { key: '2465a6dc8d507ec650538378d1be2abd399c58ad', class: "toolbar-background", part: "background" }), h("div", { key: '6075096afd12303b961e4fe9ad345ef2887573af', class: "toolbar-container", part: "container" }, h("slot", { key: '8b7eec1148cfeb339d87cdf9273f2104703e7601', name: "start" }), h("slot", { key: 'b102d3926cade24faf78b7af78ad5e192c4c0308', name: "secondary" }), h("div", { key: 'c6ab2e978328324c6f9e7892024cbcd8b8987067', class: "toolbar-content", part: "content" }, h("slot", { key: '86f8952c4355a9df5b4bbb95e9d0cafefd272d5b' })), h("slot", { key: '501e43431da6b9dd35b47b79222f948d445f7a78', name: "primary" }), h("slot", { key: '84bf1a15a5e52e8e94df9f479c4ce18004f5ab57', name: "end" }))));
    }
    get el() { return getElement(this); }
};
Toolbar.style = {
    ios: IonToolbarIosStyle0,
    md: IonToolbarMdStyle0
};

export { App as ion_app, Buttons as ion_buttons, Content as ion_content, Footer as ion_footer, Header as ion_header, RouterOutlet as ion_router_outlet, ToolbarTitle as ion_title, Toolbar as ion_toolbar };
