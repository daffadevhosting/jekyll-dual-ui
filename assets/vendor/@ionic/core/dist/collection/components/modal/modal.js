/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { Host, h, writeTask } from "@stencil/core";
import { findIonContent, printIonContentErrorMsg } from "../../utils/content/index";
import { CoreDelegate, attachComponent, detachComponent } from "../../utils/framework-delegate";
import { raf, inheritAttributes, hasLazyBuild } from "../../utils/helpers";
import { createLockController } from "../../utils/lock-controller";
import { printIonWarning } from "../../utils/logging/index";
import { Style as StatusBarStyle, StatusBar } from "../../utils/native/status-bar";
import { GESTURE, BACKDROP, dismiss, eventMethod, prepareOverlay, present, createTriggerController, setOverlayId, FOCUS_TRAP_DISABLE_CLASS, } from "../../utils/overlays";
import { getClassMap } from "../../utils/theme";
import { deepReady, waitForMount } from "../../utils/transition/index";
import { config } from "../../global/config";
import { getIonMode } from "../../global/ionic-global";
import { KEYBOARD_DID_OPEN } from "../../utils/keyboard/keyboard";
import { iosEnterAnimation } from "./animations/ios.enter";
import { iosLeaveAnimation } from "./animations/ios.leave";
import { mdEnterAnimation } from "./animations/md.enter";
import { mdLeaveAnimation } from "./animations/md.leave";
import { createSheetGesture } from "./gestures/sheet";
import { createSwipeToCloseGesture } from "./gestures/swipe-to-close";
import { setCardStatusBarDark, setCardStatusBarDefault } from "./utils";
// TODO(FW-2832): types
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - Content is placed inside of the `.modal-content` element.
 *
 * @part backdrop - The `ion-backdrop` element.
 * @part content - The wrapper element for the default slot.
 * @part handle - The handle that is displayed at the top of the sheet modal when `handle="true"`.
 */
export class Modal {
    constructor() {
        this.lockController = createLockController();
        this.triggerController = createTriggerController();
        this.coreDelegate = CoreDelegate();
        this.isSheetModal = false;
        this.inheritedAttributes = {};
        this.inline = false;
        // Whether or not modal is being dismissed via gesture
        this.gestureAnimationDismissing = false;
        this.onHandleClick = () => {
            const { sheetTransition, handleBehavior } = this;
            if (handleBehavior !== 'cycle' || sheetTransition !== undefined) {
                /**
                 * The sheet modal should not advance to the next breakpoint
                 * if the handle behavior is not `cycle` or if the handle
                 * is clicked while the sheet is moving to a breakpoint.
                 */
                return;
            }
            this.moveToNextBreakpoint();
        };
        this.onBackdropTap = () => {
            const { sheetTransition } = this;
            if (sheetTransition !== undefined) {
                /**
                 * When the handle is double clicked at the largest breakpoint,
                 * it will start to move to the first breakpoint. While transitioning,
                 * the backdrop will often receive the second click. We prevent the
                 * backdrop from dismissing the modal while moving between breakpoints.
                 */
                return;
            }
            this.dismiss(undefined, BACKDROP);
        };
        this.onLifecycle = (modalEvent) => {
            const el = this.usersElement;
            const name = LIFECYCLE_MAP[modalEvent.type];
            if (el && name) {
                const ev = new CustomEvent(name, {
                    bubbles: false,
                    cancelable: false,
                    detail: modalEvent.detail,
                });
                el.dispatchEvent(ev);
            }
        };
        this.presented = false;
        this.hasController = false;
        this.overlayIndex = undefined;
        this.delegate = undefined;
        this.keyboardClose = true;
        this.enterAnimation = undefined;
        this.leaveAnimation = undefined;
        this.breakpoints = undefined;
        this.expandToScroll = true;
        this.initialBreakpoint = undefined;
        this.backdropBreakpoint = 0;
        this.handle = undefined;
        this.handleBehavior = 'none';
        this.component = undefined;
        this.componentProps = undefined;
        this.cssClass = undefined;
        this.backdropDismiss = true;
        this.showBackdrop = true;
        this.animated = true;
        this.presentingElement = undefined;
        this.htmlAttributes = undefined;
        this.isOpen = false;
        this.trigger = undefined;
        this.keepContentsMounted = false;
        this.focusTrap = true;
        this.canDismiss = true;
    }
    onIsOpenChange(newValue, oldValue) {
        if (newValue === true && oldValue === false) {
            this.present();
        }
        else if (newValue === false && oldValue === true) {
            this.dismiss();
        }
    }
    triggerChanged() {
        const { trigger, el, triggerController } = this;
        if (trigger) {
            triggerController.addClickListener(el, trigger);
        }
    }
    breakpointsChanged(breakpoints) {
        if (breakpoints !== undefined) {
            this.sortedBreakpoints = breakpoints.sort((a, b) => a - b);
        }
    }
    connectedCallback() {
        const { el } = this;
        prepareOverlay(el);
        this.triggerChanged();
    }
    disconnectedCallback() {
        this.triggerController.removeClickListener();
    }
    componentWillLoad() {
        var _a;
        const { breakpoints, initialBreakpoint, el, htmlAttributes } = this;
        const isSheetModal = (this.isSheetModal = breakpoints !== undefined && initialBreakpoint !== undefined);
        const attributesToInherit = ['aria-label', 'role'];
        this.inheritedAttributes = inheritAttributes(el, attributesToInherit);
        /**
         * When using a controller modal you can set attributes
         * using the htmlAttributes property. Since the above attributes
         * need to be inherited inside of the modal, we need to look
         * and see if these attributes are being set via htmlAttributes.
         *
         * We could alternatively move this to componentDidLoad to simplify the work
         * here, but we'd then need to make inheritedAttributes a State variable,
         * thus causing another render to always happen after the first render.
         */
        if (htmlAttributes !== undefined) {
            attributesToInherit.forEach((attribute) => {
                const attributeValue = htmlAttributes[attribute];
                if (attributeValue) {
                    /**
                     * If an attribute we need to inherit was
                     * set using htmlAttributes then add it to
                     * inheritedAttributes and remove it from htmlAttributes.
                     * This ensures the attribute is inherited and not
                     * set on the host.
                     *
                     * In this case, if an inherited attribute is set
                     * on the host element and using htmlAttributes then
                     * htmlAttributes wins, but that's not a pattern that we recommend.
                     * The only time you'd need htmlAttributes is when using modalController.
                     */
                    this.inheritedAttributes = Object.assign(Object.assign({}, this.inheritedAttributes), { [attribute]: htmlAttributes[attribute] });
                    delete htmlAttributes[attribute];
                }
            });
        }
        if (isSheetModal) {
            this.currentBreakpoint = this.initialBreakpoint;
        }
        if (breakpoints !== undefined && initialBreakpoint !== undefined && !breakpoints.includes(initialBreakpoint)) {
            printIonWarning('[ion-modal] - Your breakpoints array must include the initialBreakpoint value.');
        }
        if (!((_a = this.htmlAttributes) === null || _a === void 0 ? void 0 : _a.id)) {
            setOverlayId(this.el);
        }
    }
    componentDidLoad() {
        /**
         * If modal was rendered with isOpen="true"
         * then we should open modal immediately.
         */
        if (this.isOpen === true) {
            raf(() => this.present());
        }
        this.breakpointsChanged(this.breakpoints);
        /**
         * When binding values in frameworks such as Angular
         * it is possible for the value to be set after the Web Component
         * initializes but before the value watcher is set up in Stencil.
         * As a result, the watcher callback may not be fired.
         * We work around this by manually calling the watcher
         * callback when the component has loaded and the watcher
         * is configured.
         */
        this.triggerChanged();
    }
    /**
     * Determines whether or not an overlay
     * is being used inline or via a controller/JS
     * and returns the correct delegate.
     * By default, subsequent calls to getDelegate
     * will use a cached version of the delegate.
     * This is useful for calling dismiss after
     * present so that the correct delegate is given.
     */
    getDelegate(force = false) {
        if (this.workingDelegate && !force) {
            return {
                delegate: this.workingDelegate,
                inline: this.inline,
            };
        }
        /**
         * If using overlay inline
         * we potentially need to use the coreDelegate
         * so that this works in vanilla JS apps.
         * If a developer has presented this component
         * via a controller, then we can assume
         * the component is already in the
         * correct place.
         */
        const parentEl = this.el.parentNode;
        const inline = (this.inline = parentEl !== null && !this.hasController);
        const delegate = (this.workingDelegate = inline ? this.delegate || this.coreDelegate : this.delegate);
        return { inline, delegate };
    }
    /**
     * Determines whether or not the
     * modal is allowed to dismiss based
     * on the state of the canDismiss prop.
     */
    async checkCanDismiss(data, role) {
        const { canDismiss } = this;
        if (typeof canDismiss === 'function') {
            return canDismiss(data, role);
        }
        return canDismiss;
    }
    /**
     * Present the modal overlay after it has been created.
     */
    async present() {
        const unlock = await this.lockController.lock();
        if (this.presented) {
            unlock();
            return;
        }
        const { presentingElement, el } = this;
        /**
         * If the modal is presented multiple times (inline modals), we
         * need to reset the current breakpoint to the initial breakpoint.
         */
        this.currentBreakpoint = this.initialBreakpoint;
        const { inline, delegate } = this.getDelegate(true);
        /**
         * Emit ionMount so JS Frameworks have an opportunity
         * to add the child component to the DOM. The child
         * component will be assigned to this.usersElement below.
         */
        this.ionMount.emit();
        this.usersElement = await attachComponent(delegate, el, this.component, ['ion-page'], this.componentProps, inline);
        /**
         * When using the lazy loaded build of Stencil, we need to wait
         * for every Stencil component instance to be ready before presenting
         * otherwise there can be a flash of unstyled content. With the
         * custom elements bundle we need to wait for the JS framework
         * mount the inner contents of the overlay otherwise WebKit may
         * get the transition incorrect.
         */
        if (hasLazyBuild(el)) {
            await deepReady(this.usersElement);
            /**
             * If keepContentsMounted="true" then the
             * JS Framework has already mounted the inner
             * contents so there is no need to wait.
             * Otherwise, we need to wait for the JS
             * Framework to mount the inner contents
             * of this component.
             */
        }
        else if (!this.keepContentsMounted) {
            await waitForMount();
        }
        writeTask(() => this.el.classList.add('show-modal'));
        const hasCardModal = presentingElement !== undefined;
        /**
         * We need to change the status bar at the
         * start of the animation so that it completes
         * by the time the card animation is done.
         */
        if (hasCardModal && getIonMode(this) === 'ios') {
            // Cache the original status bar color before the modal is presented
            this.statusBarStyle = await StatusBar.getStyle();
            setCardStatusBarDark();
        }
        await present(this, 'modalEnter', iosEnterAnimation, mdEnterAnimation, {
            presentingEl: presentingElement,
            currentBreakpoint: this.initialBreakpoint,
            backdropBreakpoint: this.backdropBreakpoint,
            expandToScroll: this.expandToScroll,
        });
        /* tslint:disable-next-line */
        if (typeof window !== 'undefined') {
            /**
             * This needs to be setup before any
             * non-transition async work so it can be dereferenced
             * in the dismiss method. The dismiss method
             * only waits for the entering transition
             * to finish. It does not wait for all of the `present`
             * method to resolve.
             */
            this.keyboardOpenCallback = () => {
                if (this.gesture) {
                    /**
                     * When the native keyboard is opened and the webview
                     * is resized, the gesture implementation will become unresponsive
                     * and enter a free-scroll mode.
                     *
                     * When the keyboard is opened, we disable the gesture for
                     * a single frame and re-enable once the contents have repositioned
                     * from the keyboard placement.
                     */
                    this.gesture.enable(false);
                    raf(() => {
                        if (this.gesture) {
                            this.gesture.enable(true);
                        }
                    });
                }
            };
            window.addEventListener(KEYBOARD_DID_OPEN, this.keyboardOpenCallback);
        }
        if (this.isSheetModal) {
            this.initSheetGesture();
        }
        else if (hasCardModal) {
            this.initSwipeToClose();
        }
        unlock();
    }
    initSwipeToClose() {
        var _a;
        if (getIonMode(this) !== 'ios') {
            return;
        }
        const { el } = this;
        // All of the elements needed for the swipe gesture
        // should be in the DOM and referenced by now, except
        // for the presenting el
        const animationBuilder = this.leaveAnimation || config.get('modalLeave', iosLeaveAnimation);
        const ani = (this.animation = animationBuilder(el, {
            presentingEl: this.presentingElement,
            expandToScroll: this.expandToScroll,
        }));
        const contentEl = findIonContent(el);
        if (!contentEl) {
            printIonContentErrorMsg(el);
            return;
        }
        const statusBarStyle = (_a = this.statusBarStyle) !== null && _a !== void 0 ? _a : StatusBarStyle.Default;
        this.gesture = createSwipeToCloseGesture(el, ani, statusBarStyle, () => {
            /**
             * While the gesture animation is finishing
             * it is possible for a user to tap the backdrop.
             * This would result in the dismiss animation
             * being played again. Typically this is avoided
             * by setting `presented = false` on the overlay
             * component; however, we cannot do that here as
             * that would prevent the element from being
             * removed from the DOM.
             */
            this.gestureAnimationDismissing = true;
            /**
             * Reset the status bar style as the dismiss animation
             * starts otherwise the status bar will be the wrong
             * color for the duration of the dismiss animation.
             * The dismiss method does this as well, but
             * in this case it's only called once the animation
             * has finished.
             */
            setCardStatusBarDefault(this.statusBarStyle);
            this.animation.onFinish(async () => {
                await this.dismiss(undefined, GESTURE);
                this.gestureAnimationDismissing = false;
            });
        });
        this.gesture.enable(true);
    }
    initSheetGesture() {
        const { wrapperEl, initialBreakpoint, backdropBreakpoint } = this;
        if (!wrapperEl || initialBreakpoint === undefined) {
            return;
        }
        const animationBuilder = this.enterAnimation || config.get('modalEnter', iosEnterAnimation);
        const ani = (this.animation = animationBuilder(this.el, {
            presentingEl: this.presentingElement,
            currentBreakpoint: initialBreakpoint,
            backdropBreakpoint,
            expandToScroll: this.expandToScroll,
        }));
        ani.progressStart(true, 1);
        const { gesture, moveSheetToBreakpoint } = createSheetGesture(this.el, this.backdropEl, wrapperEl, initialBreakpoint, backdropBreakpoint, ani, this.sortedBreakpoints, this.expandToScroll, () => { var _a; return (_a = this.currentBreakpoint) !== null && _a !== void 0 ? _a : 0; }, () => this.sheetOnDismiss(), (breakpoint) => {
            if (this.currentBreakpoint !== breakpoint) {
                this.currentBreakpoint = breakpoint;
                this.ionBreakpointDidChange.emit({ breakpoint });
            }
        });
        this.gesture = gesture;
        this.moveSheetToBreakpoint = moveSheetToBreakpoint;
        this.gesture.enable(true);
    }
    sheetOnDismiss() {
        /**
         * While the gesture animation is finishing
         * it is possible for a user to tap the backdrop.
         * This would result in the dismiss animation
         * being played again. Typically this is avoided
         * by setting `presented = false` on the overlay
         * component; however, we cannot do that here as
         * that would prevent the element from being
         * removed from the DOM.
         */
        this.gestureAnimationDismissing = true;
        this.animation.onFinish(async () => {
            this.currentBreakpoint = 0;
            this.ionBreakpointDidChange.emit({ breakpoint: this.currentBreakpoint });
            await this.dismiss(undefined, GESTURE);
            this.gestureAnimationDismissing = false;
        });
    }
    /**
     * Dismiss the modal overlay after it has been presented.
     *
     * @param data Any data to emit in the dismiss events.
     * @param role The role of the element that is dismissing the modal. For example, 'cancel' or 'backdrop'.
     *
     * This is a no-op if the overlay has not been presented yet. If you want
     * to remove an overlay from the DOM that was never presented, use the
     * [remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method.
     */
    async dismiss(data, role) {
        var _a;
        if (this.gestureAnimationDismissing && role !== GESTURE) {
            return false;
        }
        /**
         * Because the canDismiss check below is async,
         * we need to claim a lock before the check happens,
         * in case the dismiss transition does run.
         */
        const unlock = await this.lockController.lock();
        /**
         * If a canDismiss handler is responsible
         * for calling the dismiss method, we should
         * not run the canDismiss check again.
         */
        if (role !== 'handler' && !(await this.checkCanDismiss(data, role))) {
            unlock();
            return false;
        }
        const { presentingElement } = this;
        /**
         * We need to start the status bar change
         * before the animation so that the change
         * finishes when the dismiss animation does.
         */
        const hasCardModal = presentingElement !== undefined;
        if (hasCardModal && getIonMode(this) === 'ios') {
            setCardStatusBarDefault(this.statusBarStyle);
        }
        /* tslint:disable-next-line */
        if (typeof window !== 'undefined' && this.keyboardOpenCallback) {
            window.removeEventListener(KEYBOARD_DID_OPEN, this.keyboardOpenCallback);
            this.keyboardOpenCallback = undefined;
        }
        const dismissed = await dismiss(this, data, role, 'modalLeave', iosLeaveAnimation, mdLeaveAnimation, {
            presentingEl: presentingElement,
            currentBreakpoint: (_a = this.currentBreakpoint) !== null && _a !== void 0 ? _a : this.initialBreakpoint,
            backdropBreakpoint: this.backdropBreakpoint,
            expandToScroll: this.expandToScroll,
        });
        if (dismissed) {
            const { delegate } = this.getDelegate();
            await detachComponent(delegate, this.usersElement);
            writeTask(() => this.el.classList.remove('show-modal'));
            if (this.animation) {
                this.animation.destroy();
            }
            if (this.gesture) {
                this.gesture.destroy();
            }
        }
        this.currentBreakpoint = undefined;
        this.animation = undefined;
        unlock();
        return dismissed;
    }
    /**
     * Returns a promise that resolves when the modal did dismiss.
     */
    onDidDismiss() {
        return eventMethod(this.el, 'ionModalDidDismiss');
    }
    /**
     * Returns a promise that resolves when the modal will dismiss.
     */
    onWillDismiss() {
        return eventMethod(this.el, 'ionModalWillDismiss');
    }
    /**
     * Move a sheet style modal to a specific breakpoint. The breakpoint value must
     * be a value defined in your `breakpoints` array.
     */
    async setCurrentBreakpoint(breakpoint) {
        if (!this.isSheetModal) {
            printIonWarning('[ion-modal] - setCurrentBreakpoint is only supported on sheet modals.');
            return;
        }
        if (!this.breakpoints.includes(breakpoint)) {
            printIonWarning(`[ion-modal] - Attempted to set invalid breakpoint value ${breakpoint}. Please double check that the breakpoint value is part of your defined breakpoints.`);
            return;
        }
        const { currentBreakpoint, moveSheetToBreakpoint, canDismiss, breakpoints, animated } = this;
        if (currentBreakpoint === breakpoint) {
            return;
        }
        if (moveSheetToBreakpoint) {
            this.sheetTransition = moveSheetToBreakpoint({
                breakpoint,
                breakpointOffset: 1 - currentBreakpoint,
                canDismiss: canDismiss !== undefined && canDismiss !== true && breakpoints[0] === 0,
                animated,
            });
            await this.sheetTransition;
            this.sheetTransition = undefined;
        }
    }
    /**
     * Returns the current breakpoint of a sheet style modal
     */
    async getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }
    async moveToNextBreakpoint() {
        const { breakpoints, currentBreakpoint } = this;
        if (!breakpoints || currentBreakpoint == null) {
            /**
             * If the modal does not have breakpoints and/or the current
             * breakpoint is not set, we can't move to the next breakpoint.
             */
            return false;
        }
        const allowedBreakpoints = breakpoints.filter((b) => b !== 0);
        const currentBreakpointIndex = allowedBreakpoints.indexOf(currentBreakpoint);
        const nextBreakpointIndex = (currentBreakpointIndex + 1) % allowedBreakpoints.length;
        const nextBreakpoint = allowedBreakpoints[nextBreakpointIndex];
        /**
         * Sets the current breakpoint to the next available breakpoint.
         * If the current breakpoint is the last breakpoint, we set the current
         * breakpoint to the first non-zero breakpoint to avoid dismissing the sheet.
         */
        await this.setCurrentBreakpoint(nextBreakpoint);
        return true;
    }
    render() {
        const { handle, isSheetModal, presentingElement, htmlAttributes, handleBehavior, inheritedAttributes, focusTrap, expandToScroll, } = this;
        const showHandle = handle !== false && isSheetModal;
        const mode = getIonMode(this);
        const isCardModal = presentingElement !== undefined && mode === 'ios';
        const isHandleCycle = handleBehavior === 'cycle';
        return (h(Host, Object.assign({ key: '0991b2e4e32da511e59fb1463b47e4ac1b86d1ca', "no-router": true, tabindex: "-1" }, htmlAttributes, { style: {
                zIndex: `${20000 + this.overlayIndex}`,
            }, class: Object.assign({ [mode]: true, ['modal-default']: !isCardModal && !isSheetModal, [`modal-card`]: isCardModal, [`modal-sheet`]: isSheetModal, [`modal-no-expand-scroll`]: isSheetModal && !expandToScroll, 'overlay-hidden': true, [FOCUS_TRAP_DISABLE_CLASS]: focusTrap === false }, getClassMap(this.cssClass)), onIonBackdropTap: this.onBackdropTap, onIonModalDidPresent: this.onLifecycle, onIonModalWillPresent: this.onLifecycle, onIonModalWillDismiss: this.onLifecycle, onIonModalDidDismiss: this.onLifecycle }), h("ion-backdrop", { key: 'ca9453ffe1021fb252ad9460676cfabb5633f00f', ref: (el) => (this.backdropEl = el), visible: this.showBackdrop, tappable: this.backdropDismiss, part: "backdrop" }), mode === 'ios' && h("div", { key: '9f8da446a7b0f3b26aec856e13f6d6d131a7e37b', class: "modal-shadow" }), h("div", Object.assign({ key: '9d08bf600571849c97b58f66df40b496a358d1e1',
            /*
              role and aria-modal must be used on the
              same element. They must also be set inside the
              shadow DOM otherwise ion-button will not be highlighted
              when using VoiceOver: https://bugs.webkit.org/show_bug.cgi?id=247134
            */
            role: "dialog" }, inheritedAttributes, { "aria-modal": "true", class: "modal-wrapper ion-overlay-wrapper", part: "content", ref: (el) => (this.wrapperEl = el) }), showHandle && (h("button", { key: 'f8bf0d1126e5376519101225d9965727121ee042', class: "modal-handle",
            // Prevents the handle from receiving keyboard focus when it does not cycle
            tabIndex: !isHandleCycle ? -1 : 0, "aria-label": "Activate to adjust the size of the dialog overlaying the screen", onClick: isHandleCycle ? this.onHandleClick : undefined, part: "handle" })), h("slot", { key: '6d52849df98f2c6c8fbc03996a931ea6a39a512b' }))));
    }
    static get is() { return "ion-modal"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "ios": ["modal.ios.scss"],
            "md": ["modal.md.scss"]
        };
    }
    static get styleUrls() {
        return {
            "ios": ["modal.ios.css"],
            "md": ["modal.md.css"]
        };
    }
    static get properties() {
        return {
            "hasController": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": ""
                },
                "attribute": "has-controller",
                "reflect": false,
                "defaultValue": "false"
            },
            "overlayIndex": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": ""
                },
                "attribute": "overlay-index",
                "reflect": false
            },
            "delegate": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "FrameworkDelegate",
                    "resolved": "FrameworkDelegate | undefined",
                    "references": {
                        "FrameworkDelegate": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::FrameworkDelegate"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": ""
                }
            },
            "keyboardClose": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, the keyboard will be automatically dismissed when the overlay is presented."
                },
                "attribute": "keyboard-close",
                "reflect": false,
                "defaultValue": "true"
            },
            "enterAnimation": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "AnimationBuilder",
                    "resolved": "((baseEl: any, opts?: any) => Animation) | undefined",
                    "references": {
                        "AnimationBuilder": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::AnimationBuilder"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Animation to use when the modal is presented."
                }
            },
            "leaveAnimation": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "AnimationBuilder",
                    "resolved": "((baseEl: any, opts?: any) => Animation) | undefined",
                    "references": {
                        "AnimationBuilder": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::AnimationBuilder"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Animation to use when the modal is dismissed."
                }
            },
            "breakpoints": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "number[]",
                    "resolved": "number[] | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The breakpoints to use when creating a sheet modal. Each value in the\narray must be a decimal between 0 and 1 where 0 indicates the modal is fully\nclosed and 1 indicates the modal is fully open. Values are relative\nto the height of the modal, not the height of the screen. One of the values in this\narray must be the value of the `initialBreakpoint` property.\nFor example: [0, .25, .5, 1]"
                }
            },
            "expandToScroll": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Controls whether scrolling or dragging within the sheet modal expands\nit to a larger breakpoint. This only takes effect when `breakpoints`\nand `initialBreakpoint` are set.\n\nIf `true`, scrolling or dragging anywhere in the modal will first expand\nit to the next breakpoint. Once fully expanded, scrolling will affect the\ncontent.\nIf `false`, scrolling will always affect the content. The modal will\nonly expand when dragging the header or handle. The modal will close when\ndragging the header or handle. It can also be closed when dragging the\ncontent, but only if the content is scrolled to the top."
                },
                "attribute": "expand-to-scroll",
                "reflect": false,
                "defaultValue": "true"
            },
            "initialBreakpoint": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "A decimal value between 0 and 1 that indicates the\ninitial point the modal will open at when creating a\nsheet modal. This value must also be listed in the\n`breakpoints` array."
                },
                "attribute": "initial-breakpoint",
                "reflect": false
            },
            "backdropBreakpoint": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "A decimal value between 0 and 1 that indicates the\npoint after which the backdrop will begin to fade in\nwhen using a sheet modal. Prior to this point, the\nbackdrop will be hidden and the content underneath\nthe sheet can be interacted with. This value is exclusive\nmeaning the backdrop will become active after the value\nspecified."
                },
                "attribute": "backdrop-breakpoint",
                "reflect": false,
                "defaultValue": "0"
            },
            "handle": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The horizontal line that displays at the top of a sheet modal. It is `true` by default when\nsetting the `breakpoints` and `initialBreakpoint` properties."
                },
                "attribute": "handle",
                "reflect": false
            },
            "handleBehavior": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ModalHandleBehavior",
                    "resolved": "\"cycle\" | \"none\" | undefined",
                    "references": {
                        "ModalHandleBehavior": {
                            "location": "import",
                            "path": "./modal-interface",
                            "id": "src/components/modal/modal-interface.ts::ModalHandleBehavior"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The interaction behavior for the sheet modal when the handle is pressed.\n\nDefaults to `\"none\"`, which  means the modal will not change size or position when the handle is pressed.\nSet to `\"cycle\"` to let the modal cycle between available breakpoints when pressed.\n\nHandle behavior is unavailable when the `handle` property is set to `false` or\nwhen the `breakpoints` property is not set (using a fullscreen or card modal)."
                },
                "attribute": "handle-behavior",
                "reflect": false,
                "defaultValue": "'none'"
            },
            "component": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ComponentRef",
                    "resolved": "Function | HTMLElement | null | string | undefined",
                    "references": {
                        "ComponentRef": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::ComponentRef"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": "The component to display inside of the modal."
                },
                "attribute": "component",
                "reflect": false
            },
            "componentProps": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "ComponentProps",
                    "resolved": "undefined | { [key: string]: any; }",
                    "references": {
                        "ComponentProps": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::ComponentProps"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": "The data to pass to the modal component."
                }
            },
            "cssClass": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string | string[]",
                    "resolved": "string | string[] | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": "Additional classes to apply for custom CSS. If multiple classes are\nprovided they should be separated by spaces."
                },
                "attribute": "css-class",
                "reflect": false
            },
            "backdropDismiss": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, the modal will be dismissed when the backdrop is clicked."
                },
                "attribute": "backdrop-dismiss",
                "reflect": false,
                "defaultValue": "true"
            },
            "showBackdrop": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, a backdrop will be displayed behind the modal.\nThis property controls whether or not the backdrop\ndarkens the screen when the modal is presented.\nIt does not control whether or not the backdrop\nis active or present in the DOM."
                },
                "attribute": "show-backdrop",
                "reflect": false,
                "defaultValue": "true"
            },
            "animated": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, the modal will animate."
                },
                "attribute": "animated",
                "reflect": false,
                "defaultValue": "true"
            },
            "presentingElement": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "HTMLElement",
                    "resolved": "HTMLElement | undefined",
                    "references": {
                        "HTMLElement": {
                            "location": "global",
                            "id": "global::HTMLElement"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The element that presented the modal. This is used for card presentation effects\nand for stacking multiple modals on top of each other. Only applies in iOS mode."
                }
            },
            "htmlAttributes": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "{ [key: string]: any }",
                    "resolved": "undefined | { [key: string]: any; }",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Additional attributes to pass to the modal."
                }
            },
            "isOpen": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, the modal will open. If `false`, the modal will close.\nUse this if you need finer grained control over presentation, otherwise\njust use the modalController or the `trigger` property.\nNote: `isOpen` will not automatically be set back to `false` when\nthe modal dismisses. You will need to do that in your code."
                },
                "attribute": "is-open",
                "reflect": false,
                "defaultValue": "false"
            },
            "trigger": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string | undefined",
                    "resolved": "string | undefined",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "An ID corresponding to the trigger element that\ncauses the modal to open when clicked."
                },
                "attribute": "trigger",
                "reflect": false
            },
            "keepContentsMounted": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, the component passed into `ion-modal` will\nautomatically be mounted when the modal is created. The\ncomponent will remain mounted even when the modal is dismissed.\nHowever, the component will be destroyed when the modal is\ndestroyed. This property is not reactive and should only be\nused when initially creating a modal.\n\nNote: This feature only applies to inline modals in JavaScript\nframeworks such as Angular, React, and Vue."
                },
                "attribute": "keep-contents-mounted",
                "reflect": false,
                "defaultValue": "false"
            },
            "focusTrap": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "If `true`, focus will not be allowed to move outside of this overlay.\nIf `false`, focus will be allowed to move outside of the overlay.\n\nIn most scenarios this property should remain set to `true`. Setting\nthis property to `false` can cause severe accessibility issues as users\nrelying on assistive technologies may be able to move focus into\na confusing state. We recommend only setting this to `false` when\nabsolutely necessary.\n\nDevelopers may want to consider disabling focus trapping if this\noverlay presents a non-Ionic overlay from a 3rd party library.\nDevelopers would disable focus trapping on the Ionic overlay\nwhen presenting the 3rd party overlay and then re-enable\nfocus trapping when dismissing the 3rd party overlay and moving\nfocus back to the Ionic overlay."
                },
                "attribute": "focus-trap",
                "reflect": false,
                "defaultValue": "true"
            },
            "canDismiss": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean | ((data?: any, role?: string) => Promise<boolean>)",
                    "resolved": "((data?: any, role?: string | undefined) => Promise<boolean>) | boolean",
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Determines whether or not a modal can dismiss\nwhen calling the `dismiss` method.\n\nIf the value is `true` or the value's function returns `true`, the modal will close when trying to dismiss.\nIf the value is `false` or the value's function returns `false`, the modal will not close when trying to dismiss.\n\nSee https://ionicframework.com/docs/troubleshooting/runtime#accessing-this\nif you need to access `this` from within the callback."
                },
                "attribute": "can-dismiss",
                "reflect": false,
                "defaultValue": "true"
            }
        };
    }
    static get states() {
        return {
            "presented": {}
        };
    }
    static get events() {
        return [{
                "method": "didPresent",
                "name": "ionModalDidPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the modal has presented."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willPresent",
                "name": "ionModalWillPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the modal has presented."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willDismiss",
                "name": "ionModalWillDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the modal has dismissed."
                },
                "complexType": {
                    "original": "OverlayEventDetail",
                    "resolved": "OverlayEventDetail<any>",
                    "references": {
                        "OverlayEventDetail": {
                            "location": "import",
                            "path": "../../utils/overlays-interface",
                            "id": "src/utils/overlays-interface.ts::OverlayEventDetail"
                        }
                    }
                }
            }, {
                "method": "didDismiss",
                "name": "ionModalDidDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the modal has dismissed."
                },
                "complexType": {
                    "original": "OverlayEventDetail",
                    "resolved": "OverlayEventDetail<any>",
                    "references": {
                        "OverlayEventDetail": {
                            "location": "import",
                            "path": "../../utils/overlays-interface",
                            "id": "src/utils/overlays-interface.ts::OverlayEventDetail"
                        }
                    }
                }
            }, {
                "method": "ionBreakpointDidChange",
                "name": "ionBreakpointDidChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the modal breakpoint has changed."
                },
                "complexType": {
                    "original": "ModalBreakpointChangeEventDetail",
                    "resolved": "ModalBreakpointChangeEventDetail",
                    "references": {
                        "ModalBreakpointChangeEventDetail": {
                            "location": "import",
                            "path": "./modal-interface",
                            "id": "src/components/modal/modal-interface.ts::ModalBreakpointChangeEventDetail"
                        }
                    }
                }
            }, {
                "method": "didPresentShorthand",
                "name": "didPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the modal has presented.\nShorthand for ionModalDidPresent."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willPresentShorthand",
                "name": "willPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the modal has presented.\nShorthand for ionModalWillPresent."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willDismissShorthand",
                "name": "willDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the modal has dismissed.\nShorthand for ionModalWillDismiss."
                },
                "complexType": {
                    "original": "OverlayEventDetail",
                    "resolved": "OverlayEventDetail<any>",
                    "references": {
                        "OverlayEventDetail": {
                            "location": "import",
                            "path": "../../utils/overlays-interface",
                            "id": "src/utils/overlays-interface.ts::OverlayEventDetail"
                        }
                    }
                }
            }, {
                "method": "didDismissShorthand",
                "name": "didDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the modal has dismissed.\nShorthand for ionModalDidDismiss."
                },
                "complexType": {
                    "original": "OverlayEventDetail",
                    "resolved": "OverlayEventDetail<any>",
                    "references": {
                        "OverlayEventDetail": {
                            "location": "import",
                            "path": "../../utils/overlays-interface",
                            "id": "src/utils/overlays-interface.ts::OverlayEventDetail"
                        }
                    }
                }
            }, {
                "method": "ionMount",
                "name": "ionMount",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": "Emitted before the modal has presented, but after the component\nhas been mounted in the DOM.\nThis event exists so iOS can run the entering\ntransition properly"
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }];
    }
    static get methods() {
        return {
            "present": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "ModalPresentOptions": {
                            "location": "global",
                            "id": "global::ModalPresentOptions"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Present the modal overlay after it has been created.",
                    "tags": []
                }
            },
            "dismiss": {
                "complexType": {
                    "signature": "(data?: any, role?: string) => Promise<boolean>",
                    "parameters": [{
                            "name": "data",
                            "type": "any",
                            "docs": "Any data to emit in the dismiss events."
                        }, {
                            "name": "role",
                            "type": "string | undefined",
                            "docs": "The role of the element that is dismissing the modal. For example, 'cancel' or 'backdrop'.\n\nThis is a no-op if the overlay has not been presented yet. If you want\nto remove an overlay from the DOM that was never presented, use the\n[remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method."
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "ModalDismissOptions": {
                            "location": "global",
                            "id": "global::ModalDismissOptions"
                        }
                    },
                    "return": "Promise<boolean>"
                },
                "docs": {
                    "text": "Dismiss the modal overlay after it has been presented.",
                    "tags": [{
                            "name": "param",
                            "text": "data Any data to emit in the dismiss events."
                        }, {
                            "name": "param",
                            "text": "role The role of the element that is dismissing the modal. For example, 'cancel' or 'backdrop'.\n\nThis is a no-op if the overlay has not been presented yet. If you want\nto remove an overlay from the DOM that was never presented, use the\n[remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method."
                        }]
                }
            },
            "onDidDismiss": {
                "complexType": {
                    "signature": "<T = any>() => Promise<OverlayEventDetail<T>>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "OverlayEventDetail": {
                            "location": "import",
                            "path": "../../utils/overlays-interface",
                            "id": "src/utils/overlays-interface.ts::OverlayEventDetail"
                        },
                        "T": {
                            "location": "global",
                            "id": "global::T"
                        }
                    },
                    "return": "Promise<OverlayEventDetail<T>>"
                },
                "docs": {
                    "text": "Returns a promise that resolves when the modal did dismiss.",
                    "tags": []
                }
            },
            "onWillDismiss": {
                "complexType": {
                    "signature": "<T = any>() => Promise<OverlayEventDetail<T>>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "OverlayEventDetail": {
                            "location": "import",
                            "path": "../../utils/overlays-interface",
                            "id": "src/utils/overlays-interface.ts::OverlayEventDetail"
                        },
                        "T": {
                            "location": "global",
                            "id": "global::T"
                        }
                    },
                    "return": "Promise<OverlayEventDetail<T>>"
                },
                "docs": {
                    "text": "Returns a promise that resolves when the modal will dismiss.",
                    "tags": []
                }
            },
            "setCurrentBreakpoint": {
                "complexType": {
                    "signature": "(breakpoint: number) => Promise<void>",
                    "parameters": [{
                            "name": "breakpoint",
                            "type": "number",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Move a sheet style modal to a specific breakpoint. The breakpoint value must\nbe a value defined in your `breakpoints` array.",
                    "tags": []
                }
            },
            "getCurrentBreakpoint": {
                "complexType": {
                    "signature": "() => Promise<number | undefined>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<number | undefined>"
                },
                "docs": {
                    "text": "Returns the current breakpoint of a sheet style modal",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "isOpen",
                "methodName": "onIsOpenChange"
            }, {
                "propName": "trigger",
                "methodName": "triggerChanged"
            }];
    }
}
const LIFECYCLE_MAP = {
    ionModalDidPresent: 'ionViewDidEnter',
    ionModalWillPresent: 'ionViewWillEnter',
    ionModalWillDismiss: 'ionViewWillLeave',
    ionModalDidDismiss: 'ionViewDidLeave',
};
