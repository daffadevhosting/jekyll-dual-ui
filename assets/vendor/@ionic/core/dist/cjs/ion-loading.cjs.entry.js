/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-2e236a04.js');
const config = require('./config-f6225ae7.js');
const helpers = require('./helpers-8a48fdea.js');
const lockController = require('./lock-controller-6585a42a.js');
const overlays = require('./overlays-4c291a05.js');
const theme = require('./theme-d1c573d2.js');
const index$1 = require('./index-cc858e97.js');
const ionicGlobal = require('./ionic-global-6dea5a96.js');
const animation = require('./animation-ab2d3449.js');
require('./index-c8d52405.js');
require('./hardware-back-button-3d2b1004.js');
require('./framework-delegate-862d9d00.js');
require('./gesture-controller-9436f482.js');

/**
 * iOS Loading Enter Animation
 */
const iosEnterAnimation = (baseEl) => {
    const baseAnimation = animation.createAnimation();
    const backdropAnimation = animation.createAnimation();
    const wrapperAnimation = animation.createAnimation();
    backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop'))
        .fromTo('opacity', 0.01, 'var(--backdrop-opacity)')
        .beforeStyles({
        'pointer-events': 'none',
    })
        .afterClearStyles(['pointer-events']);
    wrapperAnimation.addElement(baseEl.querySelector('.loading-wrapper')).keyframes([
        { offset: 0, opacity: 0.01, transform: 'scale(1.1)' },
        { offset: 1, opacity: 1, transform: 'scale(1)' },
    ]);
    return baseAnimation
        .addElement(baseEl)
        .easing('ease-in-out')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

/**
 * iOS Loading Leave Animation
 */
const iosLeaveAnimation = (baseEl) => {
    const baseAnimation = animation.createAnimation();
    const backdropAnimation = animation.createAnimation();
    const wrapperAnimation = animation.createAnimation();
    backdropAnimation.addElement(baseEl.querySelector('ion-backdrop')).fromTo('opacity', 'var(--backdrop-opacity)', 0);
    wrapperAnimation.addElement(baseEl.querySelector('.loading-wrapper')).keyframes([
        { offset: 0, opacity: 0.99, transform: 'scale(1)' },
        { offset: 1, opacity: 0, transform: 'scale(0.9)' },
    ]);
    return baseAnimation
        .addElement(baseEl)
        .easing('ease-in-out')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

/**
 * Md Loading Enter Animation
 */
const mdEnterAnimation = (baseEl) => {
    const baseAnimation = animation.createAnimation();
    const backdropAnimation = animation.createAnimation();
    const wrapperAnimation = animation.createAnimation();
    backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop'))
        .fromTo('opacity', 0.01, 'var(--backdrop-opacity)')
        .beforeStyles({
        'pointer-events': 'none',
    })
        .afterClearStyles(['pointer-events']);
    wrapperAnimation.addElement(baseEl.querySelector('.loading-wrapper')).keyframes([
        { offset: 0, opacity: 0.01, transform: 'scale(1.1)' },
        { offset: 1, opacity: 1, transform: 'scale(1)' },
    ]);
    return baseAnimation
        .addElement(baseEl)
        .easing('ease-in-out')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

/**
 * Md Loading Leave Animation
 */
const mdLeaveAnimation = (baseEl) => {
    const baseAnimation = animation.createAnimation();
    const backdropAnimation = animation.createAnimation();
    const wrapperAnimation = animation.createAnimation();
    backdropAnimation.addElement(baseEl.querySelector('ion-backdrop')).fromTo('opacity', 'var(--backdrop-opacity)', 0);
    wrapperAnimation.addElement(baseEl.querySelector('.loading-wrapper')).keyframes([
        { offset: 0, opacity: 0.99, transform: 'scale(1)' },
        { offset: 1, opacity: 0, transform: 'scale(0.9)' },
    ]);
    return baseAnimation
        .addElement(baseEl)
        .easing('ease-in-out')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

const loadingIosCss = ".sc-ion-loading-ios-h{--min-width:auto;--width:auto;--min-height:auto;--height:auto;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:fixed;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;outline:none;font-family:var(--ion-font-family, inherit);contain:strict;-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:1001}.overlay-hidden.sc-ion-loading-ios-h{display:none}.loading-wrapper.sc-ion-loading-ios{display:-ms-flexbox;display:flex;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);opacity:0;z-index:10}ion-spinner.sc-ion-loading-ios{color:var(--spinner-color)}.sc-ion-loading-ios-h{--background:var(--ion-overlay-background-color, var(--ion-color-step-100, var(--ion-background-color-step-100, #f9f9f9)));--max-width:270px;--max-height:90%;--spinner-color:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666));--backdrop-opacity:var(--ion-backdrop-opacity, 0.3);color:var(--ion-text-color, #000);font-size:0.875rem}.loading-wrapper.sc-ion-loading-ios{border-radius:8px;-webkit-padding-start:34px;padding-inline-start:34px;-webkit-padding-end:34px;padding-inline-end:34px;padding-top:24px;padding-bottom:24px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.loading-translucent.sc-ion-loading-ios-h .loading-wrapper.sc-ion-loading-ios{background-color:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}}.loading-content.sc-ion-loading-ios{font-weight:bold}.loading-spinner.sc-ion-loading-ios+.loading-content.sc-ion-loading-ios{-webkit-margin-start:16px;margin-inline-start:16px}";
const IonLoadingIosStyle0 = loadingIosCss;

const loadingMdCss = ".sc-ion-loading-md-h{--min-width:auto;--width:auto;--min-height:auto;--height:auto;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:fixed;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;outline:none;font-family:var(--ion-font-family, inherit);contain:strict;-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:1001}.overlay-hidden.sc-ion-loading-md-h{display:none}.loading-wrapper.sc-ion-loading-md{display:-ms-flexbox;display:flex;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);opacity:0;z-index:10}ion-spinner.sc-ion-loading-md{color:var(--spinner-color)}.sc-ion-loading-md-h{--background:var(--ion-color-step-50, var(--ion-background-color-step-50, #f2f2f2));--max-width:280px;--max-height:90%;--spinner-color:var(--ion-color-primary, #0054e9);--backdrop-opacity:var(--ion-backdrop-opacity, 0.32);color:var(--ion-color-step-850, var(--ion-text-color-step-150, #262626));font-size:0.875rem}.loading-wrapper.sc-ion-loading-md{border-radius:2px;-webkit-padding-start:24px;padding-inline-start:24px;-webkit-padding-end:24px;padding-inline-end:24px;padding-top:24px;padding-bottom:24px;-webkit-box-shadow:0 16px 20px rgba(0, 0, 0, 0.4);box-shadow:0 16px 20px rgba(0, 0, 0, 0.4)}.loading-spinner.sc-ion-loading-md+.loading-content.sc-ion-loading-md{-webkit-margin-start:16px;margin-inline-start:16px}";
const IonLoadingMdStyle0 = loadingMdCss;

const Loading = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.didPresent = index.createEvent(this, "ionLoadingDidPresent", 7);
        this.willPresent = index.createEvent(this, "ionLoadingWillPresent", 7);
        this.willDismiss = index.createEvent(this, "ionLoadingWillDismiss", 7);
        this.didDismiss = index.createEvent(this, "ionLoadingDidDismiss", 7);
        this.didPresentShorthand = index.createEvent(this, "didPresent", 7);
        this.willPresentShorthand = index.createEvent(this, "willPresent", 7);
        this.willDismissShorthand = index.createEvent(this, "willDismiss", 7);
        this.didDismissShorthand = index.createEvent(this, "didDismiss", 7);
        this.delegateController = overlays.createDelegateController(this);
        this.lockController = lockController.createLockController();
        this.triggerController = overlays.createTriggerController();
        this.customHTMLEnabled = index$1.config.get('innerHTMLTemplatesEnabled', config.ENABLE_HTML_CONTENT_DEFAULT);
        this.presented = false;
        this.onBackdropTap = () => {
            this.dismiss(undefined, overlays.BACKDROP);
        };
        this.overlayIndex = undefined;
        this.delegate = undefined;
        this.hasController = false;
        this.keyboardClose = true;
        this.enterAnimation = undefined;
        this.leaveAnimation = undefined;
        this.message = undefined;
        this.cssClass = undefined;
        this.duration = 0;
        this.backdropDismiss = false;
        this.showBackdrop = true;
        this.spinner = undefined;
        this.translucent = false;
        this.animated = true;
        this.htmlAttributes = undefined;
        this.isOpen = false;
        this.trigger = undefined;
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
        overlays.prepareOverlay(this.el);
        this.triggerChanged();
    }
    componentWillLoad() {
        var _a;
        if (this.spinner === undefined) {
            const mode = ionicGlobal.getIonMode(this);
            this.spinner = index$1.config.get('loadingSpinner', index$1.config.get('spinner', mode === 'ios' ? 'lines' : 'crescent'));
        }
        if (!((_a = this.htmlAttributes) === null || _a === void 0 ? void 0 : _a.id)) {
            overlays.setOverlayId(this.el);
        }
    }
    componentDidLoad() {
        /**
         * If loading indicator was rendered with isOpen="true"
         * then we should open loading indicator immediately.
         */
        if (this.isOpen === true) {
            helpers.raf(() => this.present());
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
    disconnectedCallback() {
        this.triggerController.removeClickListener();
    }
    /**
     * Present the loading overlay after it has been created.
     */
    async present() {
        const unlock = await this.lockController.lock();
        await this.delegateController.attachViewToDom();
        await overlays.present(this, 'loadingEnter', iosEnterAnimation, mdEnterAnimation);
        if (this.duration > 0) {
            this.durationTimeout = setTimeout(() => this.dismiss(), this.duration + 10);
        }
        unlock();
    }
    /**
     * Dismiss the loading overlay after it has been presented.
     *
     * @param data Any data to emit in the dismiss events.
     * @param role The role of the element that is dismissing the loading.
     * This can be useful in a button handler for determining which button was
     * clicked to dismiss the loading.
     * Some examples include: ``"cancel"`, `"destructive"`, "selected"`, and `"backdrop"`.
     *
     * This is a no-op if the overlay has not been presented yet. If you want
     * to remove an overlay from the DOM that was never presented, use the
     * [remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method.
     */
    async dismiss(data, role) {
        const unlock = await this.lockController.lock();
        if (this.durationTimeout) {
            clearTimeout(this.durationTimeout);
        }
        const dismissed = await overlays.dismiss(this, data, role, 'loadingLeave', iosLeaveAnimation, mdLeaveAnimation);
        if (dismissed) {
            this.delegateController.removeViewFromDom();
        }
        unlock();
        return dismissed;
    }
    /**
     * Returns a promise that resolves when the loading did dismiss.
     */
    onDidDismiss() {
        return overlays.eventMethod(this.el, 'ionLoadingDidDismiss');
    }
    /**
     * Returns a promise that resolves when the loading will dismiss.
     */
    onWillDismiss() {
        return overlays.eventMethod(this.el, 'ionLoadingWillDismiss');
    }
    renderLoadingMessage(msgId) {
        const { customHTMLEnabled, message } = this;
        if (customHTMLEnabled) {
            return index.h("div", { class: "loading-content", id: msgId, innerHTML: config.sanitizeDOMString(message) });
        }
        return (index.h("div", { class: "loading-content", id: msgId }, message));
    }
    render() {
        const { message, spinner, htmlAttributes, overlayIndex } = this;
        const mode = ionicGlobal.getIonMode(this);
        const msgId = `loading-${overlayIndex}-msg`;
        /**
         * If the message is defined, use that as the label.
         * Otherwise, don't set aria-labelledby.
         */
        const ariaLabelledBy = message !== undefined ? msgId : null;
        return (index.h(index.Host, Object.assign({ key: 'd6066c8b56b1fe4b597a243a7dab191ef0d21286', role: "dialog", "aria-modal": "true", "aria-labelledby": ariaLabelledBy, tabindex: "-1" }, htmlAttributes, { style: {
                zIndex: `${40000 + this.overlayIndex}`,
            }, onIonBackdropTap: this.onBackdropTap, class: Object.assign(Object.assign({}, theme.getClassMap(this.cssClass)), { [mode]: true, 'overlay-hidden': true, 'loading-translucent': this.translucent }) }), index.h("ion-backdrop", { key: '2431eda00a2a3f510f5dfc39b7c7d47c056dfa3d', visible: this.showBackdrop, tappable: this.backdropDismiss }), index.h("div", { key: 'cf210aaf5e754e4eccdb49cf7ead4647b3f9b2d1', tabindex: "0", "aria-hidden": "true" }), index.h("div", { key: 'fa9375143d391656d70e181d25b952c77c2fc6ec', class: "loading-wrapper ion-overlay-wrapper" }, spinner && (index.h("div", { key: '8e4a4ed994f7f62df86b03696ac95162df41f52d', class: "loading-spinner" }, index.h("ion-spinner", { key: 'e5b323c272d365853ba92bd211e390b4fd4751d2', name: spinner, "aria-hidden": "true" }))), message !== undefined && this.renderLoadingMessage(msgId)), index.h("div", { key: 'cae35ec8c34800477bff3ebcec8010e632158233', tabindex: "0", "aria-hidden": "true" })));
    }
    get el() { return index.getElement(this); }
    static get watchers() { return {
        "isOpen": ["onIsOpenChange"],
        "trigger": ["triggerChanged"]
    }; }
};
Loading.style = {
    ios: IonLoadingIosStyle0,
    md: IonLoadingMdStyle0
};

exports.ion_loading = Loading;
