/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { Host, forceUpdate, h } from "@stencil/core";
import { ENABLE_HTML_CONTENT_DEFAULT } from "../../utils/config";
import { createButtonActiveGesture } from "../../utils/gesture/button-active";
import { raf } from "../../utils/helpers";
import { createLockController } from "../../utils/lock-controller";
import { printIonWarning } from "../../utils/logging/index";
import { createDelegateController, createTriggerController, BACKDROP, dismiss, eventMethod, isCancel, prepareOverlay, present, safeCall, setOverlayId, } from "../../utils/overlays";
import { sanitizeDOMString } from "../../utils/sanitization/index";
import { getClassMap } from "../../utils/theme";
import { config } from "../../global/config";
import { getIonMode } from "../../global/ionic-global";
import { iosEnterAnimation } from "./animations/ios.enter";
import { iosLeaveAnimation } from "./animations/ios.leave";
import { mdEnterAnimation } from "./animations/md.enter";
import { mdLeaveAnimation } from "./animations/md.leave";
// TODO(FW-2832): types
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
export class Alert {
    constructor() {
        this.delegateController = createDelegateController(this);
        this.lockController = createLockController();
        this.triggerController = createTriggerController();
        this.customHTMLEnabled = config.get('innerHTMLTemplatesEnabled', ENABLE_HTML_CONTENT_DEFAULT);
        this.processedInputs = [];
        this.processedButtons = [];
        this.presented = false;
        this.onBackdropTap = () => {
            this.dismiss(undefined, BACKDROP);
        };
        this.dispatchCancelHandler = (ev) => {
            const role = ev.detail.role;
            if (isCancel(role)) {
                const cancelButton = this.processedButtons.find((b) => b.role === 'cancel');
                this.callButtonHandler(cancelButton);
            }
        };
        this.overlayIndex = undefined;
        this.delegate = undefined;
        this.hasController = false;
        this.keyboardClose = true;
        this.enterAnimation = undefined;
        this.leaveAnimation = undefined;
        this.cssClass = undefined;
        this.header = undefined;
        this.subHeader = undefined;
        this.message = undefined;
        this.buttons = [];
        this.inputs = [];
        this.backdropDismiss = true;
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
    onKeydown(ev) {
        var _a;
        const inputTypes = new Set(this.processedInputs.map((i) => i.type));
        /**
         * Based on keyboard navigation requirements, the
         * checkbox should not respond to the enter keydown event.
         */
        if (inputTypes.has('checkbox') && ev.key === 'Enter') {
            ev.preventDefault();
            return;
        }
        /**
         * Ensure when alert container is being focused, and the user presses the tab + shift keys, the focus will be set to the last alert button.
         */
        if (ev.target.classList.contains('alert-wrapper')) {
            if (ev.key === 'Tab' && ev.shiftKey) {
                ev.preventDefault();
                const lastChildBtn = (_a = this.wrapperEl) === null || _a === void 0 ? void 0 : _a.querySelector('.alert-button:last-child');
                lastChildBtn.focus();
                return;
            }
        }
        // The only inputs we want to navigate between using arrow keys are the radios
        // ignore the keydown event if it is not on a radio button
        if (!inputTypes.has('radio') ||
            (ev.target && !this.el.contains(ev.target)) ||
            ev.target.classList.contains('alert-button')) {
            return;
        }
        // Get all radios inside of the radio group and then
        // filter out disabled radios since we need to skip those
        const query = this.el.querySelectorAll('.alert-radio');
        const radios = Array.from(query).filter((radio) => !radio.disabled);
        // The focused radio is the one that shares the same id as
        // the event target
        const index = radios.findIndex((radio) => radio.id === ev.target.id);
        // We need to know what the next radio element should
        // be in order to change the focus
        let nextEl;
        // If hitting arrow down or arrow right, move to the next radio
        // If we're on the last radio, move to the first radio
        if (['ArrowDown', 'ArrowRight'].includes(ev.key)) {
            nextEl = index === radios.length - 1 ? radios[0] : radios[index + 1];
        }
        // If hitting arrow up or arrow left, move to the previous radio
        // If we're on the first radio, move to the last radio
        if (['ArrowUp', 'ArrowLeft'].includes(ev.key)) {
            nextEl = index === 0 ? radios[radios.length - 1] : radios[index - 1];
        }
        if (nextEl && radios.includes(nextEl)) {
            const nextProcessed = this.processedInputs.find((input) => input.id === (nextEl === null || nextEl === void 0 ? void 0 : nextEl.id));
            if (nextProcessed) {
                this.rbClick(nextProcessed);
                nextEl.focus();
            }
        }
    }
    buttonsChanged() {
        const buttons = this.buttons;
        this.processedButtons = buttons.map((btn) => {
            return typeof btn === 'string' ? { text: btn, role: btn.toLowerCase() === 'cancel' ? 'cancel' : undefined } : btn;
        });
    }
    inputsChanged() {
        const inputs = this.inputs;
        // Get the first input that is not disabled and the checked one
        // If an enabled checked input exists, set it to be the focusable input
        // otherwise we default to focus the first input
        // This will only be used when the input is type radio
        const first = inputs.find((input) => !input.disabled);
        const checked = inputs.find((input) => input.checked && !input.disabled);
        const focusable = checked || first;
        // An alert can be created with several different inputs. Radios,
        // checkboxes and inputs are all accepted, but they cannot be mixed.
        const inputTypes = new Set(inputs.map((i) => i.type));
        if (inputTypes.has('checkbox') && inputTypes.has('radio')) {
            printIonWarning(`[ion-alert] - Alert cannot mix input types: ${Array.from(inputTypes.values()).join('/')}. Please see alert docs for more info.`);
        }
        this.inputType = inputTypes.values().next().value;
        this.processedInputs = inputs.map((i, index) => {
            var _a;
            return ({
                type: i.type || 'text',
                name: i.name || `${index}`,
                placeholder: i.placeholder || '',
                value: i.value,
                label: i.label,
                checked: !!i.checked,
                disabled: !!i.disabled,
                id: i.id || `alert-input-${this.overlayIndex}-${index}`,
                handler: i.handler,
                min: i.min,
                max: i.max,
                cssClass: (_a = i.cssClass) !== null && _a !== void 0 ? _a : '',
                attributes: i.attributes || {},
                tabindex: i.type === 'radio' && i !== focusable ? -1 : 0,
            });
        });
    }
    connectedCallback() {
        prepareOverlay(this.el);
        this.triggerChanged();
    }
    componentWillLoad() {
        var _a;
        if (!((_a = this.htmlAttributes) === null || _a === void 0 ? void 0 : _a.id)) {
            setOverlayId(this.el);
        }
        this.inputsChanged();
        this.buttonsChanged();
    }
    disconnectedCallback() {
        this.triggerController.removeClickListener();
        if (this.gesture) {
            this.gesture.destroy();
            this.gesture = undefined;
        }
    }
    componentDidLoad() {
        /**
         * Only create gesture if:
         * 1. A gesture does not already exist
         * 2. App is running in iOS mode
         * 3. A wrapper ref exists
         */
        if (!this.gesture && getIonMode(this) === 'ios' && this.wrapperEl) {
            this.gesture = createButtonActiveGesture(this.wrapperEl, (refEl) => refEl.classList.contains('alert-button'));
            this.gesture.enable(true);
        }
        /**
         * If alert was rendered with isOpen="true"
         * then we should open alert immediately.
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
     * Present the alert overlay after it has been created.
     */
    async present() {
        const unlock = await this.lockController.lock();
        await this.delegateController.attachViewToDom();
        await present(this, 'alertEnter', iosEnterAnimation, mdEnterAnimation).then(() => {
            var _a, _b;
            /**
             * Check if alert has only one button and no inputs.
             * If so, then focus on the button. Otherwise, focus the alert wrapper.
             * This will map to the default native alert behavior.
             */
            if (this.buttons.length === 1 && this.inputs.length === 0) {
                const queryBtn = (_a = this.wrapperEl) === null || _a === void 0 ? void 0 : _a.querySelector('.alert-button');
                queryBtn.focus();
            }
            else {
                (_b = this.wrapperEl) === null || _b === void 0 ? void 0 : _b.focus();
            }
        });
        unlock();
    }
    /**
     * Dismiss the alert overlay after it has been presented.
     *
     * @param data Any data to emit in the dismiss events.
     * @param role The role of the element that is dismissing the alert.
     * This can be useful in a button handler for determining which button was
     * clicked to dismiss the alert.
     * Some examples include: ``"cancel"`, `"destructive"`, "selected"`, and `"backdrop"`.
     *
     * This is a no-op if the overlay has not been presented yet. If you want
     * to remove an overlay from the DOM that was never presented, use the
     * [remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method.
     */
    async dismiss(data, role) {
        const unlock = await this.lockController.lock();
        const dismissed = await dismiss(this, data, role, 'alertLeave', iosLeaveAnimation, mdLeaveAnimation);
        if (dismissed) {
            this.delegateController.removeViewFromDom();
        }
        unlock();
        return dismissed;
    }
    /**
     * Returns a promise that resolves when the alert did dismiss.
     */
    onDidDismiss() {
        return eventMethod(this.el, 'ionAlertDidDismiss');
    }
    /**
     * Returns a promise that resolves when the alert will dismiss.
     */
    onWillDismiss() {
        return eventMethod(this.el, 'ionAlertWillDismiss');
    }
    rbClick(selectedInput) {
        for (const input of this.processedInputs) {
            input.checked = input === selectedInput;
            input.tabindex = input === selectedInput ? 0 : -1;
        }
        this.activeId = selectedInput.id;
        safeCall(selectedInput.handler, selectedInput);
        forceUpdate(this);
    }
    cbClick(selectedInput) {
        selectedInput.checked = !selectedInput.checked;
        safeCall(selectedInput.handler, selectedInput);
        forceUpdate(this);
    }
    async buttonClick(button) {
        const role = button.role;
        const values = this.getValues();
        if (isCancel(role)) {
            return this.dismiss({ values }, role);
        }
        const returnData = await this.callButtonHandler(button, values);
        if (returnData !== false) {
            return this.dismiss(Object.assign({ values }, returnData), button.role);
        }
        return false;
    }
    async callButtonHandler(button, data) {
        if (button === null || button === void 0 ? void 0 : button.handler) {
            // a handler has been provided, execute it
            // pass the handler the values from the inputs
            const returnData = await safeCall(button.handler, data);
            if (returnData === false) {
                // if the return value of the handler is false then do not dismiss
                return false;
            }
            if (typeof returnData === 'object') {
                return returnData;
            }
        }
        return {};
    }
    getValues() {
        if (this.processedInputs.length === 0) {
            // this is an alert without any options/inputs at all
            return undefined;
        }
        if (this.inputType === 'radio') {
            // this is an alert with radio buttons (single value select)
            // return the one value which is checked, otherwise undefined
            const checkedInput = this.processedInputs.find((i) => !!i.checked);
            return checkedInput ? checkedInput.value : undefined;
        }
        if (this.inputType === 'checkbox') {
            // this is an alert with checkboxes (multiple value select)
            // return an array of all the checked values
            return this.processedInputs.filter((i) => i.checked).map((i) => i.value);
        }
        // this is an alert with text inputs
        // return an object of all the values with the input name as the key
        const values = {};
        this.processedInputs.forEach((i) => {
            values[i.name] = i.value || '';
        });
        return values;
    }
    renderAlertInputs() {
        switch (this.inputType) {
            case 'checkbox':
                return this.renderCheckbox();
            case 'radio':
                return this.renderRadio();
            default:
                return this.renderInput();
        }
    }
    renderCheckbox() {
        const inputs = this.processedInputs;
        const mode = getIonMode(this);
        if (inputs.length === 0) {
            return null;
        }
        return (h("div", { class: "alert-checkbox-group" }, inputs.map((i) => (h("button", { type: "button", onClick: () => this.cbClick(i), "aria-checked": `${i.checked}`, id: i.id, disabled: i.disabled, tabIndex: i.tabindex, role: "checkbox", class: Object.assign(Object.assign({}, getClassMap(i.cssClass)), { 'alert-tappable': true, 'alert-checkbox': true, 'alert-checkbox-button': true, 'ion-focusable': true, 'alert-checkbox-button-disabled': i.disabled || false }) }, h("div", { class: "alert-button-inner" }, h("div", { class: "alert-checkbox-icon" }, h("div", { class: "alert-checkbox-inner" })), h("div", { class: "alert-checkbox-label" }, i.label)), mode === 'md' && h("ion-ripple-effect", null))))));
    }
    renderRadio() {
        const inputs = this.processedInputs;
        if (inputs.length === 0) {
            return null;
        }
        return (h("div", { class: "alert-radio-group", role: "radiogroup", "aria-activedescendant": this.activeId }, inputs.map((i) => (h("button", { type: "button", onClick: () => this.rbClick(i), "aria-checked": `${i.checked}`, disabled: i.disabled, id: i.id, tabIndex: i.tabindex, class: Object.assign(Object.assign({}, getClassMap(i.cssClass)), { 'alert-radio-button': true, 'alert-tappable': true, 'alert-radio': true, 'ion-focusable': true, 'alert-radio-button-disabled': i.disabled || false }), role: "radio" }, h("div", { class: "alert-button-inner" }, h("div", { class: "alert-radio-icon" }, h("div", { class: "alert-radio-inner" })), h("div", { class: "alert-radio-label" }, i.label)))))));
    }
    renderInput() {
        const inputs = this.processedInputs;
        if (inputs.length === 0) {
            return null;
        }
        return (h("div", { class: "alert-input-group" }, inputs.map((i) => {
            var _a, _b, _c, _d;
            if (i.type === 'textarea') {
                return (h("div", { class: "alert-input-wrapper" }, h("textarea", Object.assign({ placeholder: i.placeholder, value: i.value, id: i.id, tabIndex: i.tabindex }, i.attributes, { disabled: (_b = (_a = i.attributes) === null || _a === void 0 ? void 0 : _a.disabled) !== null && _b !== void 0 ? _b : i.disabled, class: inputClass(i), onInput: (e) => {
                        var _a;
                        i.value = e.target.value;
                        if ((_a = i.attributes) === null || _a === void 0 ? void 0 : _a.onInput) {
                            i.attributes.onInput(e);
                        }
                    } }))));
            }
            else {
                return (h("div", { class: "alert-input-wrapper" }, h("input", Object.assign({ placeholder: i.placeholder, type: i.type, min: i.min, max: i.max, value: i.value, id: i.id, tabIndex: i.tabindex }, i.attributes, { disabled: (_d = (_c = i.attributes) === null || _c === void 0 ? void 0 : _c.disabled) !== null && _d !== void 0 ? _d : i.disabled, class: inputClass(i), onInput: (e) => {
                        var _a;
                        i.value = e.target.value;
                        if ((_a = i.attributes) === null || _a === void 0 ? void 0 : _a.onInput) {
                            i.attributes.onInput(e);
                        }
                    } }))));
            }
        })));
    }
    renderAlertButtons() {
        const buttons = this.processedButtons;
        const mode = getIonMode(this);
        const alertButtonGroupClass = {
            'alert-button-group': true,
            'alert-button-group-vertical': buttons.length > 2,
        };
        return (h("div", { class: alertButtonGroupClass }, buttons.map((button) => (h("button", Object.assign({}, button.htmlAttributes, { type: "button", id: button.id, class: buttonClass(button), tabIndex: 0, onClick: () => this.buttonClick(button) }), h("span", { class: "alert-button-inner" }, button.text), mode === 'md' && h("ion-ripple-effect", null))))));
    }
    renderAlertMessage(msgId) {
        const { customHTMLEnabled, message } = this;
        if (customHTMLEnabled) {
            return h("div", { id: msgId, class: "alert-message", innerHTML: sanitizeDOMString(message) });
        }
        return (h("div", { id: msgId, class: "alert-message" }, message));
    }
    render() {
        const { overlayIndex, header, subHeader, message, htmlAttributes } = this;
        const mode = getIonMode(this);
        const hdrId = `alert-${overlayIndex}-hdr`;
        const msgId = `alert-${overlayIndex}-msg`;
        const subHdrId = `alert-${overlayIndex}-sub-hdr`;
        const role = this.inputs.length > 0 || this.buttons.length > 0 ? 'alertdialog' : 'alert';
        /**
         * Use both the header and subHeader ids if they are defined.
         * If only the header is defined, use the header id.
         * If only the subHeader is defined, use the subHeader id.
         * If neither are defined, do not set aria-labelledby.
         */
        const ariaLabelledBy = header && subHeader ? `${hdrId} ${subHdrId}` : header ? hdrId : subHeader ? subHdrId : null;
        return (h(Host, { key: 'f8ee04fe6a97a2585b302c8e1a9eea3b122e3479', tabindex: "-1", style: {
                zIndex: `${20000 + overlayIndex}`,
            }, class: Object.assign(Object.assign({}, getClassMap(this.cssClass)), { [mode]: true, 'overlay-hidden': true, 'alert-translucent': this.translucent }), onIonAlertWillDismiss: this.dispatchCancelHandler, onIonBackdropTap: this.onBackdropTap }, h("ion-backdrop", { key: 'e9592e879f51c27ef20016beec12c986be632cf3', tappable: this.backdropDismiss }), h("div", { key: '5e9425c3c8acdea6f8006389689c73220e2ce423', tabindex: "0", "aria-hidden": "true" }), h("div", Object.assign({ key: '615465703e357619681fc36ed7276591a6fe3787', class: "alert-wrapper ion-overlay-wrapper", role: role, "aria-modal": "true", "aria-labelledby": ariaLabelledBy, "aria-describedby": message !== undefined ? msgId : null, tabindex: "0", ref: (el) => (this.wrapperEl = el) }, htmlAttributes), h("div", { key: '934eba3759456cd4660e10f274edc7859f908461', class: "alert-head" }, header && (h("h2", { key: '7d5d98d71f81f59a2cba227121b6fa01e6cc53b6', id: hdrId, class: "alert-title" }, header)), subHeader && !header && (h("h2", { key: 'e5f5d35748c58a98ee933eb15cb1dcaf8113e9a7', id: subHdrId, class: "alert-sub-title" }, subHeader)), subHeader && header && (h("h3", { key: 'a5cb89ca02bfa9c4828e694cb0835493a9088b05', id: subHdrId, class: "alert-sub-title" }, subHeader))), this.renderAlertMessage(msgId), this.renderAlertInputs(), this.renderAlertButtons()), h("div", { key: 'cacffc31c911882df73e6845d15c8bb2d4acab56', tabindex: "0", "aria-hidden": "true" })));
    }
    static get is() { return "ion-alert"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() {
        return {
            "ios": ["alert.ios.scss"],
            "md": ["alert.md.scss"]
        };
    }
    static get styleUrls() {
        return {
            "ios": ["alert.ios.css"],
            "md": ["alert.md.css"]
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
                    "text": "Animation to use when the alert is presented."
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
                    "text": "Animation to use when the alert is dismissed."
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
                    "text": "The main title in the heading of the alert."
                },
                "attribute": "header",
                "reflect": false
            },
            "subHeader": {
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
                    "text": "The subtitle in the heading of the alert. Displayed under the title."
                },
                "attribute": "sub-header",
                "reflect": false
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
                    "text": "The main message to be displayed in the alert.\n`message` can accept either plaintext or HTML as a string.\nTo display characters normally reserved for HTML, they\nmust be escaped. For example `<Ionic>` would become\n`&lt;Ionic&gt;`\n\nFor more information: [Security Documentation](https://ionicframework.com/docs/faq/security)\n\nThis property accepts custom HTML as a string.\nContent is parsed as plaintext by default.\n`innerHTMLTemplatesEnabled` must be set to `true` in the Ionic config\nbefore custom HTML can be used."
                },
                "attribute": "message",
                "reflect": false
            },
            "buttons": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "(AlertButton | string)[]",
                    "resolved": "(string | AlertButton)[]",
                    "references": {
                        "AlertButton": {
                            "location": "import",
                            "path": "./alert-interface",
                            "id": "src/components/alert/alert-interface.ts::AlertButton"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Array of buttons to be added to the alert."
                },
                "defaultValue": "[]"
            },
            "inputs": {
                "type": "unknown",
                "mutable": true,
                "complexType": {
                    "original": "AlertInput[]",
                    "resolved": "AlertInput[]",
                    "references": {
                        "AlertInput": {
                            "location": "import",
                            "path": "./alert-interface",
                            "id": "src/components/alert/alert-interface.ts::AlertInput"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Array of input to show in the alert."
                },
                "defaultValue": "[]"
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
                    "text": "If `true`, the alert will be dismissed when the backdrop is clicked."
                },
                "attribute": "backdrop-dismiss",
                "reflect": false,
                "defaultValue": "true"
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
                    "text": "If `true`, the alert will be translucent.\nOnly applies when the mode is `\"ios\"` and the device supports\n[`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility)."
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
                    "text": "If `true`, the alert will animate."
                },
                "attribute": "animated",
                "reflect": false,
                "defaultValue": "true"
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
                    "text": "Additional attributes to pass to the alert."
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
                    "text": "If `true`, the alert will open. If `false`, the alert will close.\nUse this if you need finer grained control over presentation, otherwise\njust use the alertController or the `trigger` property.\nNote: `isOpen` will not automatically be set back to `false` when\nthe alert dismisses. You will need to do that in your code."
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
                    "text": "An ID corresponding to the trigger element that\ncauses the alert to open when clicked."
                },
                "attribute": "trigger",
                "reflect": false
            }
        };
    }
    static get events() {
        return [{
                "method": "didPresent",
                "name": "ionAlertDidPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the alert has presented."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willPresent",
                "name": "ionAlertWillPresent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the alert has presented."
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "willDismiss",
                "name": "ionAlertWillDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted before the alert has dismissed."
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
                "name": "ionAlertDidDismiss",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted after the alert has dismissed."
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
                    "text": "Emitted after the alert has presented.\nShorthand for ionAlertWillDismiss."
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
                    "text": "Emitted before the alert has presented.\nShorthand for ionAlertWillPresent."
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
                    "text": "Emitted before the alert has dismissed.\nShorthand for ionAlertWillDismiss."
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
                    "text": "Emitted after the alert has dismissed.\nShorthand for ionAlertDidDismiss."
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
                        "HTMLButtonElement": {
                            "location": "global",
                            "id": "global::HTMLButtonElement"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Present the alert overlay after it has been created.",
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
                            "docs": "The role of the element that is dismissing the alert.\nThis can be useful in a button handler for determining which button was\nclicked to dismiss the alert.\nSome examples include: ``\"cancel\"`, `\"destructive\"`, \"selected\"`, and `\"backdrop\"`.\n\nThis is a no-op if the overlay has not been presented yet. If you want\nto remove an overlay from the DOM that was never presented, use the\n[remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method."
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<boolean>"
                },
                "docs": {
                    "text": "Dismiss the alert overlay after it has been presented.",
                    "tags": [{
                            "name": "param",
                            "text": "data Any data to emit in the dismiss events."
                        }, {
                            "name": "param",
                            "text": "role The role of the element that is dismissing the alert.\nThis can be useful in a button handler for determining which button was\nclicked to dismiss the alert.\nSome examples include: ``\"cancel\"`, `\"destructive\"`, \"selected\"`, and `\"backdrop\"`.\n\nThis is a no-op if the overlay has not been presented yet. If you want\nto remove an overlay from the DOM that was never presented, use the\n[remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) method."
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
                    "text": "Returns a promise that resolves when the alert did dismiss.",
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
                    "text": "Returns a promise that resolves when the alert will dismiss.",
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
            }, {
                "propName": "buttons",
                "methodName": "buttonsChanged"
            }, {
                "propName": "inputs",
                "methodName": "inputsChanged"
            }];
    }
    static get listeners() {
        return [{
                "name": "keydown",
                "method": "onKeydown",
                "target": "document",
                "capture": false,
                "passive": false
            }];
    }
}
const inputClass = (input) => {
    var _a, _b, _c;
    return Object.assign(Object.assign({ 'alert-input': true, 'alert-input-disabled': ((_b = (_a = input.attributes) === null || _a === void 0 ? void 0 : _a.disabled) !== null && _b !== void 0 ? _b : input.disabled) || false }, getClassMap(input.cssClass)), getClassMap(input.attributes ? (_c = input.attributes.class) === null || _c === void 0 ? void 0 : _c.toString() : ''));
};
const buttonClass = (button) => {
    return Object.assign({ 'alert-button': true, 'ion-focusable': true, 'ion-activatable': true, [`alert-button-role-${button.role}`]: button.role !== undefined }, getClassMap(button.cssClass));
};
