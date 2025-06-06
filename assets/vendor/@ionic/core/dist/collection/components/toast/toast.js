/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { h, Host } from "@stencil/core";
import { ENABLE_HTML_CONTENT_DEFAULT } from "../../utils/config";
import { raf } from "../../utils/helpers";
import { createLockController } from "../../utils/lock-controller";
import { printIonError, printIonWarning } from "../../utils/logging/index";
import { GESTURE, createDelegateController, createTriggerController, dismiss, eventMethod, isCancel, prepareOverlay, present, safeCall, setOverlayId, } from "../../utils/overlays";
import { sanitizeDOMString } from "../../utils/sanitization/index";
import { createColorClasses, getClassMap } from "../../utils/theme";
import { config } from "../../global/config";
import { getIonMode } from "../../global/ionic-global";
import { iosEnterAnimation } from "./animations/ios.enter";
import { iosLeaveAnimation } from "./animations/ios.leave";
import { mdEnterAnimation } from "./animations/md.enter";
import { mdLeaveAnimation } from "./animations/md.leave";
import { getAnimationPosition } from "./animations/utils";
import { createSwipeToDismissGesture } from "./gestures/swipe-to-dismiss";
// TODO(FW-2832): types
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @part button - Any button element that is displayed inside of the toast.
 * @part button cancel - Any button element with role "cancel" that is displayed inside of the toast.
 * @part container - The element that wraps all child elements.
 * @part header - The header text of the toast.
 * @part message - The body text of the toast.
 * @part icon - The icon that appears next to the toast content.
 */
export class Toast {
    constructor() {
        this.delegateController = createDelegateController(this);
        this.lockController = createLockController();
        this.triggerController = createTriggerController();
        this.customHTMLEnabled = config.get('innerHTMLTemplatesEnabled', ENABLE_HTML_CONTENT_DEFAULT);
        this.presented = false;
        this.dispatchCancelHandler = (ev) => {
            const role = ev.detail.role;
            if (isCancel(role)) {
                const cancelButton = this.getButtons().find((b) => b.role === 'cancel');
                this.callButtonHandler(cancelButton);
            }
        };
        /**
         * Create a new swipe gesture so Toast
         * can be swiped to dismiss.
         */
        this.createSwipeGesture = (toastPosition) => {
            const gesture = (this.gesture = createSwipeToDismissGesture(this.el, toastPosition, () => {
                /**
                 * If the gesture completed then
                 * we should dismiss the toast.
                 */
                this.dismiss(undefined, GESTURE);
            }));
            gesture.enable(true);
        };
        /**
         * Destroy an existing swipe gesture
         * so Toast can no longer be swiped to dismiss.
         */
        this.destroySwipeGesture = () => {
            const { gesture } = this;
            if (gesture === undefined) {
                return;
            }
            gesture.destroy();
            this.gesture = undefined;
        };
        /**
         * Returns `true` if swipeGesture
         * is configured to a value that enables the swipe behavior.
         * Returns `false` otherwise.
         */
        this.prefersSwipeGesture = () => {
            const { swipeGesture } = this;
            return swipeGesture === 'vertical';
        };
        this.revealContentToScreenReader = false;
        this.overlayIndex = undefined;
        this.delegate = undefined;
        this.hasController = false;
        this.color = undefined;
        this.enterAnimation = undefined;
        this.leaveAnimation = undefined;
        this.cssClass = undefined;
        this.duration = config.getNumber('toastDuration', 0);
        this.header = undefined;
        this.layout = 'baseline';
        this.message = undefined;
        this.keyboardClose = false;
        this.position = 'bottom';
        this.positionAnchor = undefined;
        this.buttons = undefined;
        this.translucent = false;
        this.animated = true;
        this.icon = undefined;
        this.htmlAttributes = undefined;
        this.swipeGesture = undefined;
        this.isOpen = false;
        this.trigger = undefined;
    }
    swipeGestureChanged() {
        /**
         * If the Toast is presented, then we need to destroy
         * any actives gestures before a new gesture is potentially
         * created below.
         *
         * If the Toast is dismissed, then no gesture should be available
         * since the Toast is not visible. This case should never
         * happen since the "dismiss" method handles destroying
         * any active swipe gestures, but we keep this code
         * around to handle the first case.
         */
        this.destroySwipeGesture();
        /**
         * A new swipe gesture should only be created
         * if the Toast is presented. If the Toast is not
         * yet presented then the "present" method will
         * handle calling the swipe gesture setup function.
         */
        if (this.presented && this.prefersSwipeGesture()) {
            /**
             * If the Toast is presented then
             * lastPresentedPosition is defined.
             */
            this.createSwipeGesture(this.lastPresentedPosition);
        }
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
    connectedCallback() {
        prepareOverlay(this.el);
        this.triggerChanged();
    }
    disconnectedCallback() {
        this.triggerController.removeClickListener();
    }
    componentWillLoad() {
        var _a;
        if (!((_a = this.htmlAttributes) === null || _a === void 0 ? void 0 : _a.id)) {
            setOverlayId(this.el);
        }
    }
    componentDidLoad() {
        /**
         * If toast was rendered with isOpen="true"
         * then we should open toast immediately.
         */
        if (this.isOpen === true) {
            raf(() => this.present());
        }
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
     * Present the toast overlay after it has been created.
     */
    async present() {
        const unlock = await this.lockController.lock();
        await this.delegateController.attachViewToDom();
        const { el, position } = this;
        const anchor = this.getAnchorElement();
        const animationPosition = getAnimationPosition(position, anchor, getIonMode(this), el);
        /**
         * Cache the calculated position of the toast, so we can re-use it
         * in the dismiss animation.
         */
        this.lastPresentedPosition = animationPosition;
        await present(this, 'toastEnter', iosEnterAnimation, mdEnterAnimation, {
            position,
            top: animationPosition.top,
            bottom: animationPosition.bottom,
        });
        /**
         * Content is revealed to screen readers after
         * the transition to avoid jank since this
         * state updates will cause a re-render.
         */
        this.revealContentToScreenReader = true;
        if (this.duration > 0) {
            this.durationTimeout = setTimeout(() => this.dismiss(undefined, 'timeout'), this.duration);
        }
        /**
         * If the Toast has a swipe gesture then we can
         * create the gesture so users can swipe the
         * presented Toast.
         */
        if (this.prefersSwipeGesture()) {
            this.createSwipeGesture(animationPosition);
        }
        unlock();
    }
    /**
     * Dismiss the toast overlay after it has been presented.
     *
     * @param data Any data to emit in the dismiss events.
     * @param role The role of the element that is dismissing the toast.
     * This can be useful in a button handler for determining which button was
     * clicked to dismiss the toast.
     * Some examples include: ``"cancel"`, `"destructive"`, "selected"`, and `"backdrop"`.
     *
     * This is a no-op if the overlay has not been presented yet. If you want
     * to remove an overlay from the DOM that was never presented, use the
     * [remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method.
     */
    async dismiss(data, role) {
        var _a, _b;
        const unlock = await this.lockController.lock();
        const { durationTimeout, position, lastPresentedPosition } = this;
        if (durationTimeout) {
            clearTimeout(durationTimeout);
        }
        const dismissed = await dismiss(this, data, role, 'toastLeave', iosLeaveAnimation, mdLeaveAnimation, 
        /**
         * Fetch the cached position that was calculated back in the present
         * animation. We always want to animate the dismiss from the same
         * position the present stopped at, so the animation looks continuous.
         */
        {
            position,
            top: (_a = lastPresentedPosition === null || lastPresentedPosition === void 0 ? void 0 : lastPresentedPosition.top) !== null && _a !== void 0 ? _a : '',
            bottom: (_b = lastPresentedPosition === null || lastPresentedPosition === void 0 ? void 0 : lastPresentedPosition.bottom) !== null && _b !== void 0 ? _b : '',
        });
        if (dismissed) {
            this.delegateController.removeViewFromDom();
            this.revealContentToScreenReader = false;
        }
        this.lastPresentedPosition = undefined;
        /**
         * If the Toast has a swipe gesture then we can
         * safely destroy it now that it is dismissed.
         */
        this.destroySwipeGesture();
        unlock();
        return dismissed;
    }
    /**
     * Returns a promise that resolves when the toast did dismiss.
     */
    onDidDismiss() {
        return eventMethod(this.el, 'ionToastDidDismiss');
    }
    /**
     * Returns a promise that resolves when the toast will dismiss.
     */
    onWillDismiss() {
        return eventMethod(this.el, 'ionToastWillDismiss');
    }
    getButtons() {
        const buttons = this.buttons
            ? this.buttons.map((b) => {
                return typeof b === 'string' ? { text: b } : b;
            })
            : [];
        return buttons;
    }
    /**
     * Returns the element specified by the positionAnchor prop,
     * or undefined if prop's value is an ID string and the element
     * is not found in the DOM.
     */
    getAnchorElement() {
        const { position, positionAnchor, el } = this;
        /**
         * If positionAnchor is undefined then
         * no anchor should be used when presenting the toast.
         */
        if (positionAnchor === undefined) {
            return;
        }
        if (position === 'middle' && positionAnchor !== undefined) {
            printIonWarning('[ion-toast] - The positionAnchor property is ignored when using position="middle".', this.el);
            return undefined;
        }
        if (typeof positionAnchor === 'string') {
            /**
             * If the anchor is defined as an ID, find the element.
             * We do this on every present so the toast doesn't need
             * to account for the surrounding DOM changing since the
             * last time it was presented.
             */
            const foundEl = document.getElementById(positionAnchor);
            if (foundEl === null) {
                printIonWarning(`[ion-toast] - An anchor element with an ID of "${positionAnchor}" was not found in the DOM.`, el);
                return undefined;
            }
            return foundEl;
        }
        if (positionAnchor instanceof HTMLElement) {
            return positionAnchor;
        }
        printIonWarning('[ion-toast] - Invalid positionAnchor value:', positionAnchor, el);
        return undefined;
    }
    async buttonClick(button) {
        const role = button.role;
        if (isCancel(role)) {
            return this.dismiss(undefined, role);
        }
        const shouldDismiss = await this.callButtonHandler(button);
        if (shouldDismiss) {
            return this.dismiss(undefined, role);
        }
        return Promise.resolve();
    }
    async callButtonHandler(button) {
        if (button === null || button === void 0 ? void 0 : button.handler) {
            // a handler has been provided, execute it
            // pass the handler the values from the inputs
            try {
                const rtn = await safeCall(button.handler);
                if (rtn === false) {
                    // if the return value of the handler is false then do not dismiss
                    return false;
                }
            }
            catch (e) {
                printIonError('[ion-toast] - Exception in callButtonHandler:', e);
            }
        }
        return true;
    }
    renderButtons(buttons, side) {
        if (buttons.length === 0) {
            return;
        }
        const mode = getIonMode(this);
        const buttonGroupsClasses = {
            'toast-button-group': true,
            [`toast-button-group-${side}`]: true,
        };
        return (h("div", { class: buttonGroupsClasses }, buttons.map((b) => (h("button", Object.assign({}, b.htmlAttributes, { type: "button", class: buttonClass(b), tabIndex: 0, onClick: () => this.buttonClick(b), part: buttonPart(b) }), h("div", { class: "toast-button-inner" }, b.icon && (h("ion-icon", { "aria-hidden": "true", icon: b.icon, slot: b.text === undefined ? 'icon-only' : undefined, class: "toast-button-icon" })), b.text), mode === 'md' && (h("ion-ripple-effect", { type: b.icon !== undefined && b.text === undefined ? 'unbounded' : 'bounded' })))))));
    }
    /**
     * Render the `message` property.
     * @param key - A key to give the element a stable identity. This is used to improve compatibility with screen readers.
     * @param ariaHidden - If "true" then content will be hidden from screen readers.
     */
    renderToastMessage(key, ariaHidden = null) {
        const { customHTMLEnabled, message } = this;
        if (customHTMLEnabled) {
            return (h("div", { key: key, "aria-hidden": ariaHidden, class: "toast-message", part: "message", innerHTML: sanitizeDOMString(message) }));
        }
        return (h("div", { key: key, "aria-hidden": ariaHidden, class: "toast-message", part: "message" }, message));
    }
    /**
     * Render the `header` property.
     * @param key - A key to give the element a stable identity. This is used to improve compatibility with screen readers.
     * @param ariaHidden - If "true" then content will be hidden from screen readers.
     */
    renderHeader(key, ariaHidden = null) {
        return (h("div", { key: key, class: "toast-header", "aria-hidden": ariaHidden, part: "header" }, this.header));
    }
    render() {
        const { layout, el, revealContentToScreenReader, header, message } = this;
        const allButtons = this.getButtons();
        const startButtons = allButtons.filter((b) => b.side === 'start');
        const endButtons = allButtons.filter((b) => b.side !== 'start');
        const mode = getIonMode(this);
        const wrapperClass = {
            'toast-wrapper': true,
            [`toast-${this.position}`]: true,
            [`toast-layout-${layout}`]: true,
        };
        /**
         * Stacked buttons are only meant to be
         *  used with one type of button.
         */
        if (layout === 'stacked' && startButtons.length > 0 && endButtons.length > 0) {
            printIonWarning('[ion-toast] - This toast is using start and end buttons with the stacked toast layout. We recommend following the best practice of using either start or end buttons with the stacked toast layout.', el);
        }
        return (h(Host, Object.assign({ key: 'a2216d860255c99337464370dcb12f6125871a50', tabindex: "-1" }, this.htmlAttributes, { style: {
                zIndex: `${60000 + this.overlayIndex}`,
            }, class: createColorClasses(this.color, Object.assign(Object.assign({ [mode]: true }, getClassMap(this.cssClass)), { 'overlay-hidden': true, 'toast-translucent': this.translucent })), onIonToastWillDismiss: this.dispatchCancelHandler }), h("div", { key: 'd5adf8bc4c6c52431600033a76c4795689f9b412', class: wrapperClass }, h("div", { key: 'ab694497ae37ceba123217eb48800129b9bebb84', class: "toast-container", part: "container" }, this.renderButtons(startButtons, 'start'), this.icon !== undefined && (h("ion-icon", { key: '224854fa3989ce0eb69416cb5b0cc55fc9f131ea', class: "toast-icon", part: "icon", icon: this.icon, lazy: false, "aria-hidden": "true" })), h("div", { key: 'c8e11fb5bdac202987f5c8613a0ebbd42bda946e', class: "toast-content", role: "status", "aria-atomic": "true", "aria-live": "polite" }, !revealContentToScreenReader && header !== undefined && this.renderHeader('oldHeader', 'true'), !revealContentToScreenReader && message !== undefined && this.renderToastMessage('oldMessage', 'true'), revealContentToScreenReader && header !== undefined && this.renderHeader('header'), revealContentToScreenReader && message !== undefined && this.renderToastMessage('header')), this.renderButtons(endButtons, 'end')))));
    }
    static get is() { return "ion-toast"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "ios": ["toast.ios.scss"],
            "md": ["toast.md.scss"]
        };
    }
    static get styleUrls() {
        return {
            "ios": ["toast.ios.css"],
            "md": ["toast.md.css"]
        };
    }
    static get properties() {
        return {
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
            "color": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "Color",
                    "resolved": "\"danger\" | \"dark\" | \"light\" | \"medium\" | \"primary\" | \"secondary\" | \"success\" | \"tertiary\" | \"warning\" | string & Record<never, never> | undefined",
                    "references": {
                        "Color": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::Color"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The color to use from your application's color palette.\nDefault options are: `\"primary\"`, `\"secondary\"`, `\"tertiary\"`, `\"success\"`, `\"warning\"`, `\"danger\"`, `\"light\"`, `\"medium\"`, and `\"dark\"`.\nFor more information on colors, see [theming](/docs/theming/basics)."
                },
                "attribute": "color",
                "reflect": true
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
                    "text": "Animation to use when the toast is presented."
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
                    "text": "Animation to use when the toast is dismissed."
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
                    "tags": [],
                    "text": "Additional classes to apply for custom CSS. If multiple classes are\nprovided they should be separated by spaces."
                },
                "attribute": "css-class",
                "reflect": false
            },
            "duration": {
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
                    "text": "How many milliseconds to wait before hiding the toast. By default, it will show\nuntil `dismiss()` is called."
                },
                "attribute": "duration",
                "reflect": false,
                "defaultValue": "config.getNumber('toastDuration', 0)"
            },
            "header": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Header to be shown in the toast."
                },
                "attribute": "header",
                "reflect": false
            },
            "layout": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ToastLayout",
                    "resolved": "\"baseline\" | \"stacked\"",
                    "references": {
                        "ToastLayout": {
                            "location": "import",
                            "path": "./toast-interface",
                            "id": "src/components/toast/toast-interface.ts::ToastLayout"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Defines how the message and buttons are laid out in the toast.\n'baseline': The message and the buttons will appear on the same line.\nMessage text may wrap within the message container.\n'stacked': The buttons containers and message will stack on top\nof each other. Use this if you have long text in your buttons."
                },
                "attribute": "layout",
                "reflect": false,
                "defaultValue": "'baseline'"
            },
            "message": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string | IonicSafeString",
                    "resolved": "IonicSafeString | string | undefined",
                    "references": {
                        "IonicSafeString": {
                            "location": "import",
                            "path": "../../utils/sanitization",
                            "id": "src/utils/sanitization/index.ts::IonicSafeString"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Message to be shown in the toast.\nThis property accepts custom HTML as a string.\nContent is parsed as plaintext by default.\n`innerHTMLTemplatesEnabled` must be set to `true` in the Ionic config\nbefore custom HTML can be used."
                },
                "attribute": "message",
                "reflect": false
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
                "defaultValue": "false"
            },
            "position": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ToastPosition",
                    "resolved": "\"bottom\" | \"middle\" | \"top\"",
                    "references": {
                        "ToastPosition": {
                            "location": "import",
                            "path": "./toast-interface",
                            "id": "src/components/toast/toast-interface.ts::ToastPosition"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The starting position of the toast on the screen. Can be tweaked further\nusing the `positionAnchor` property."
                },
                "attribute": "position",
                "reflect": false,
                "defaultValue": "'bottom'"
            },
            "positionAnchor": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "HTMLElement | string",
                    "resolved": "HTMLElement | string | undefined",
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
                    "text": "The element to anchor the toast's position to. Can be set as a direct reference\nor the ID of the element. With `position=\"bottom\"`, the toast will sit above the\nchosen element. With `position=\"top\"`, the toast will sit below the chosen element.\nWith `position=\"middle\"`, the value of `positionAnchor` is ignored."
                },
                "attribute": "position-anchor",
                "reflect": false
            },
            "buttons": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "(ToastButton | string)[]",
                    "resolved": "(string | ToastButton)[] | undefined",
                    "references": {
                        "ToastButton": {
                            "location": "import",
                            "path": "./toast-interface",
                            "id": "src/components/toast/toast-interface.ts::ToastButton"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "An array of buttons for the toast."
                }
            },
            "translucent": {
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
                    "text": "If `true`, the toast will be translucent.\nOnly applies when the mode is `\"ios\"` and the device supports\n[`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility)."
                },
                "attribute": "translucent",
                "reflect": false,
                "defaultValue": "false"
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
                    "text": "If `true`, the toast will animate."
                },
                "attribute": "animated",
                "reflect": false,
                "defaultValue": "true"
            },
            "icon": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The name of the icon to display, or the path to a valid SVG file. See `ion-icon`.\nhttps://ionic.io/ionicons"
                },
                "attribute": "icon",
                "reflect": false
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
                    "text": "Additional attributes to pass to the toast."
                }
            },
            "swipeGesture": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ToastSwipeGestureDirection",
                    "resolved": "\"vertical\" | undefined",
                    "references": {
                        "ToastSwipeGestureDirection": {
                            "location": "import",
                            "path": "./toast-interface",
                            "id": "src/components/toast/toast-interface.ts::ToastSwipeGestureDirection"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "If set to 'vertical', the Toast can be dismissed with\na swipe gesture. The swipe direction is determined by\nthe value of the `position` property:\n`top`: The Toast can be swiped up to dismiss.\n`bottom`: The Toast can be swiped down to dismiss.\n`middle`: The Toast can be swiped up or down to dismiss."
                },
                "attribute": "swipe-gesture",
                "reflect": false
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
                    "text": "If `true`, the toast will open. If `false`, the toast will close.\nUse this if you need finer grained control over presentation, otherwise\njust use the toastController or the `trigger` property.\nNote: `isOpen` will not automatically be set back to `false` when\nthe toast dismisses. You will need to do that in your code."
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
                    "text": "An ID corresponding to the trigger element that\ncauses the toast to open when clicked."
                },
                "attribute": "trigger",
                "reflect": false
            }
        };
    }
    static get states() {
        return {
            "revealContentToScreenReader": {}
        };
    }
    static get events() {
        return [{
                "method": "didPresent",
                "name": "ionToastDidPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the toast has presented."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willPresent",
                "name": "ionToastWillPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the toast has presented."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willDismiss",
                "name": "ionToastWillDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the toast has dismissed."
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
                "name": "ionToastDidDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the toast has dismissed."
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
                "method": "didPresentShorthand",
                "name": "didPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the toast has presented.\nShorthand for ionToastWillDismiss."
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
                    "text": "Emitted before the toast has presented.\nShorthand for ionToastWillPresent."
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
                    "text": "Emitted before the toast has dismissed.\nShorthand for ionToastWillDismiss."
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
                    "text": "Emitted after the toast has dismissed.\nShorthand for ionToastDidDismiss."
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
                        "ToastPresentOptions": {
                            "location": "import",
                            "path": "./toast-interface",
                            "id": "src/components/toast/toast-interface.ts::ToastPresentOptions"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Present the toast overlay after it has been created.",
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
                            "docs": "The role of the element that is dismissing the toast.\nThis can be useful in a button handler for determining which button was\nclicked to dismiss the toast.\nSome examples include: ``\"cancel\"`, `\"destructive\"`, \"selected\"`, and `\"backdrop\"`.\n\nThis is a no-op if the overlay has not been presented yet. If you want\nto remove an overlay from the DOM that was never presented, use the\n[remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method."
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "ToastDismissOptions": {
                            "location": "import",
                            "path": "./toast-interface",
                            "id": "src/components/toast/toast-interface.ts::ToastDismissOptions"
                        }
                    },
                    "return": "Promise<boolean>"
                },
                "docs": {
                    "text": "Dismiss the toast overlay after it has been presented.",
                    "tags": [{
                            "name": "param",
                            "text": "data Any data to emit in the dismiss events."
                        }, {
                            "name": "param",
                            "text": "role The role of the element that is dismissing the toast.\nThis can be useful in a button handler for determining which button was\nclicked to dismiss the toast.\nSome examples include: ``\"cancel\"`, `\"destructive\"`, \"selected\"`, and `\"backdrop\"`.\n\nThis is a no-op if the overlay has not been presented yet. If you want\nto remove an overlay from the DOM that was never presented, use the\n[remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method."
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
                    "text": "Returns a promise that resolves when the toast did dismiss.",
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
                    "text": "Returns a promise that resolves when the toast will dismiss.",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "swipeGesture",
                "methodName": "swipeGestureChanged"
            }, {
                "propName": "isOpen",
                "methodName": "onIsOpenChange"
            }, {
                "propName": "trigger",
                "methodName": "triggerChanged"
            }];
    }
}
const buttonClass = (button) => {
    return {
        'toast-button': true,
        'toast-button-icon-only': button.icon !== undefined && button.text === undefined,
        [`toast-button-${button.role}`]: button.role !== undefined,
        'ion-focusable': true,
        'ion-activatable': true,
    };
};
const buttonPart = (button) => {
    return isCancel(button.role) ? 'button cancel' : 'button';
};
