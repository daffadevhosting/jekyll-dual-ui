/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { Build, Host, forceUpdate, h, } from "@stencil/core";
import { createNotchController } from "../../utils/forms/index";
import { inheritAriaAttributes, debounceEvent, inheritAttributes, componentOnReady } from "../../utils/helpers";
import { createSlotMutationController } from "../../utils/slot-mutation-controller";
import { createColorClasses, hostContext } from "../../utils/theme";
import { closeCircle, closeSharp } from "ionicons/icons";
import { getIonMode } from "../../global/ionic-global";
import { getCounterText } from "./input.utils";
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot label - The label text to associate with the input. Use the `labelPlacement` property to control where the label is placed relative to the input. Use this if you need to render a label with custom HTML. (EXPERIMENTAL)
 * @slot start - Content to display at the leading edge of the input. (EXPERIMENTAL)
 * @slot end - Content to display at the trailing edge of the input. (EXPERIMENTAL)
 */
export class Input {
    constructor() {
        this.inputId = `ion-input-${inputIds++}`;
        this.helperTextId = `${this.inputId}-helper-text`;
        this.errorTextId = `${this.inputId}-error-text`;
        this.inheritedAttributes = {};
        this.isComposing = false;
        /**
         * `true` if the input was cleared as a result of the user typing
         * with `clearOnEdit` enabled.
         *
         * Resets when the input loses focus.
         */
        this.didInputClearOnEdit = false;
        this.onInput = (ev) => {
            const input = ev.target;
            if (input) {
                this.value = input.value || '';
            }
            this.emitInputChange(ev);
        };
        this.onChange = (ev) => {
            this.emitValueChange(ev);
        };
        this.onBlur = (ev) => {
            this.hasFocus = false;
            if (this.focusedValue !== this.value) {
                /**
                 * Emits the `ionChange` event when the input value
                 * is different than the value when the input was focused.
                 */
                this.emitValueChange(ev);
            }
            this.didInputClearOnEdit = false;
            this.ionBlur.emit(ev);
        };
        this.onFocus = (ev) => {
            this.hasFocus = true;
            this.focusedValue = this.value;
            this.ionFocus.emit(ev);
        };
        this.onKeydown = (ev) => {
            this.checkClearOnEdit(ev);
        };
        this.onCompositionStart = () => {
            this.isComposing = true;
        };
        this.onCompositionEnd = () => {
            this.isComposing = false;
        };
        this.clearTextInput = (ev) => {
            if (this.clearInput && !this.readonly && !this.disabled && ev) {
                ev.preventDefault();
                ev.stopPropagation();
                // Attempt to focus input again after pressing clear button
                this.setFocus();
            }
            this.value = '';
            this.emitInputChange(ev);
        };
        /**
         * Stops propagation when the label is clicked,
         * otherwise, two clicks will be triggered.
         */
        this.onLabelClick = (ev) => {
            // Only stop propagation if the click was directly on the label
            // and not on the input or other child elements
            if (ev.target === ev.currentTarget) {
                ev.stopPropagation();
            }
        };
        this.hasFocus = false;
        this.color = undefined;
        this.autocapitalize = 'off';
        this.autocomplete = 'off';
        this.autocorrect = 'off';
        this.autofocus = false;
        this.clearInput = false;
        this.clearInputIcon = undefined;
        this.clearOnEdit = undefined;
        this.counter = false;
        this.counterFormatter = undefined;
        this.debounce = undefined;
        this.disabled = false;
        this.enterkeyhint = undefined;
        this.errorText = undefined;
        this.fill = undefined;
        this.inputmode = undefined;
        this.helperText = undefined;
        this.label = undefined;
        this.labelPlacement = 'start';
        this.max = undefined;
        this.maxlength = undefined;
        this.min = undefined;
        this.minlength = undefined;
        this.multiple = undefined;
        this.name = this.inputId;
        this.pattern = undefined;
        this.placeholder = undefined;
        this.readonly = false;
        this.required = false;
        this.shape = undefined;
        this.spellcheck = false;
        this.step = undefined;
        this.type = 'text';
        this.value = '';
    }
    debounceChanged() {
        const { ionInput, debounce, originalIonInput } = this;
        /**
         * If debounce is undefined, we have to manually revert the ionInput emitter in case
         * debounce used to be set to a number. Otherwise, the event would stay debounced.
         */
        this.ionInput = debounce === undefined ? originalIonInput !== null && originalIonInput !== void 0 ? originalIonInput : ionInput : debounceEvent(ionInput, debounce);
    }
    /**
     * Whenever the type on the input changes we need
     * to update the internal type prop on the password
     * toggle so that that correct icon is shown.
     */
    onTypeChange() {
        const passwordToggle = this.el.querySelector('ion-input-password-toggle');
        if (passwordToggle) {
            passwordToggle.type = this.type;
        }
    }
    /**
     * Update the native input element when the value changes
     */
    valueChanged() {
        const nativeInput = this.nativeInput;
        const value = this.getValue();
        if (nativeInput && nativeInput.value !== value && !this.isComposing) {
            /**
             * Assigning the native input's value on attribute
             * value change, allows `ionInput` implementations
             * to override the control's value.
             *
             * Used for patterns such as input trimming (removing whitespace),
             * or input masking.
             */
            nativeInput.value = value;
        }
    }
    /**
     * dir is a globally enumerated attribute.
     * As a result, creating these as properties
     * can have unintended side effects. Instead, we
     * listen for attribute changes and inherit them
     * to the inner `<input>` element.
     */
    onDirChanged(newValue) {
        this.inheritedAttributes = Object.assign(Object.assign({}, this.inheritedAttributes), { dir: newValue });
        forceUpdate(this);
    }
    /**
     * This prevents the native input from emitting the click event.
     * Instead, the click event from the ion-input is emitted.
     */
    onClickCapture(ev) {
        const nativeInput = this.nativeInput;
        if (nativeInput && ev.target === nativeInput) {
            ev.stopPropagation();
            this.el.click();
        }
    }
    componentWillLoad() {
        this.inheritedAttributes = Object.assign(Object.assign({}, inheritAriaAttributes(this.el)), inheritAttributes(this.el, ['tabindex', 'title', 'data-form-type', 'dir']));
    }
    connectedCallback() {
        const { el } = this;
        this.slotMutationController = createSlotMutationController(el, ['label', 'start', 'end'], () => forceUpdate(this));
        this.notchController = createNotchController(el, () => this.notchSpacerEl, () => this.labelSlot);
        this.debounceChanged();
        if (Build.isBrowser) {
            document.dispatchEvent(new CustomEvent('ionInputDidLoad', {
                detail: this.el,
            }));
        }
    }
    componentDidLoad() {
        this.originalIonInput = this.ionInput;
        /**
         * Set the type on the password toggle in the event that this input's
         * type was set async and does not match the default type for the password toggle.
         * This can happen when the type is bound using a JS framework binding syntax
         * such as [type] in Angular.
         */
        this.onTypeChange();
        this.debounceChanged();
    }
    componentDidRender() {
        var _a;
        (_a = this.notchController) === null || _a === void 0 ? void 0 : _a.calculateNotchWidth();
    }
    disconnectedCallback() {
        if (Build.isBrowser) {
            document.dispatchEvent(new CustomEvent('ionInputDidUnload', {
                detail: this.el,
            }));
        }
        if (this.slotMutationController) {
            this.slotMutationController.destroy();
            this.slotMutationController = undefined;
        }
        if (this.notchController) {
            this.notchController.destroy();
            this.notchController = undefined;
        }
    }
    /**
     * Sets focus on the native `input` in `ion-input`. Use this method instead of the global
     * `input.focus()`.
     *
     * Developers who wish to focus an input when a page enters
     * should call `setFocus()` in the `ionViewDidEnter()` lifecycle method.
     *
     * Developers who wish to focus an input when an overlay is presented
     * should call `setFocus` after `didPresent` has resolved.
     *
     * See [managing focus](/docs/developing/managing-focus) for more information.
     */
    async setFocus() {
        if (this.nativeInput) {
            this.nativeInput.focus();
        }
    }
    /**
     * Returns the native `<input>` element used under the hood.
     */
    async getInputElement() {
        /**
         * If this gets called in certain early lifecycle hooks (ex: Vue onMounted),
         * nativeInput won't be defined yet with the custom elements build, so wait for it to load in.
         */
        if (!this.nativeInput) {
            await new Promise((resolve) => componentOnReady(this.el, resolve));
        }
        return Promise.resolve(this.nativeInput);
    }
    /**
     * Emits an `ionChange` event.
     *
     * This API should be called for user committed changes.
     * This API should not be used for external value changes.
     */
    emitValueChange(event) {
        const { value } = this;
        // Checks for both null and undefined values
        const newValue = value == null ? value : value.toString();
        // Emitting a value change should update the internal state for tracking the focused value
        this.focusedValue = newValue;
        this.ionChange.emit({ value: newValue, event });
    }
    /**
     * Emits an `ionInput` event.
     */
    emitInputChange(event) {
        const { value } = this;
        // Checks for both null and undefined values
        const newValue = value == null ? value : value.toString();
        this.ionInput.emit({ value: newValue, event });
    }
    shouldClearOnEdit() {
        const { type, clearOnEdit } = this;
        return clearOnEdit === undefined ? type === 'password' : clearOnEdit;
    }
    getValue() {
        return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString();
    }
    checkClearOnEdit(ev) {
        if (!this.shouldClearOnEdit()) {
            return;
        }
        /**
         * The following keys do not modify the
         * contents of the input. As a result, pressing
         * them should not edit the input.
         *
         * We can't check to see if the value of the input
         * was changed because we call checkClearOnEdit
         * in a keydown listener, and the key has not yet
         * been added to the input.
         */
        const IGNORED_KEYS = ['Enter', 'Tab', 'Shift', 'Meta', 'Alt', 'Control'];
        const pressedIgnoredKey = IGNORED_KEYS.includes(ev.key);
        /**
         * Clear the input if the control has not been previously cleared during focus.
         * Do not clear if the user hitting enter to submit a form.
         */
        if (!this.didInputClearOnEdit && this.hasValue() && !pressedIgnoredKey) {
            this.value = '';
            this.emitInputChange(ev);
        }
        /**
         * Pressing an IGNORED_KEYS first and
         * then an allowed key will cause the input to not
         * be cleared.
         */
        if (!pressedIgnoredKey) {
            this.didInputClearOnEdit = true;
        }
    }
    hasValue() {
        return this.getValue().length > 0;
    }
    /**
     * Renders the helper text or error text values
     */
    renderHintText() {
        const { helperText, errorText, helperTextId, errorTextId } = this;
        return [
            h("div", { id: helperTextId, class: "helper-text" }, helperText),
            h("div", { id: errorTextId, class: "error-text" }, errorText),
        ];
    }
    getHintTextID() {
        const { el, helperText, errorText, helperTextId, errorTextId } = this;
        if (el.classList.contains('ion-touched') && el.classList.contains('ion-invalid') && errorText) {
            return errorTextId;
        }
        if (helperText) {
            return helperTextId;
        }
        return undefined;
    }
    renderCounter() {
        const { counter, maxlength, counterFormatter, value } = this;
        if (counter !== true || maxlength === undefined) {
            return;
        }
        return h("div", { class: "counter" }, getCounterText(value, maxlength, counterFormatter));
    }
    /**
     * Responsible for rendering helper text,
     * error text, and counter. This element should only
     * be rendered if hint text is set or counter is enabled.
     */
    renderBottomContent() {
        const { counter, helperText, errorText, maxlength } = this;
        /**
         * undefined and empty string values should
         * be treated as not having helper/error text.
         */
        const hasHintText = !!helperText || !!errorText;
        const hasCounter = counter === true && maxlength !== undefined;
        if (!hasHintText && !hasCounter) {
            return;
        }
        return (h("div", { class: "input-bottom" }, this.renderHintText(), this.renderCounter()));
    }
    renderLabel() {
        const { label } = this;
        return (h("div", { class: {
                'label-text-wrapper': true,
                'label-text-wrapper-hidden': !this.hasLabel,
            } }, label === undefined ? h("slot", { name: "label" }) : h("div", { class: "label-text" }, label)));
    }
    /**
     * Gets any content passed into the `label` slot,
     * not the <slot> definition.
     */
    get labelSlot() {
        return this.el.querySelector('[slot="label"]');
    }
    /**
     * Returns `true` if label content is provided
     * either by a prop or a content. If you want
     * to get the plaintext value of the label use
     * the `labelText` getter instead.
     */
    get hasLabel() {
        return this.label !== undefined || this.labelSlot !== null;
    }
    /**
     * Renders the border container
     * when fill="outline".
     */
    renderLabelContainer() {
        const mode = getIonMode(this);
        const hasOutlineFill = mode === 'md' && this.fill === 'outline';
        if (hasOutlineFill) {
            /**
             * The outline fill has a special outline
             * that appears around the input and the label.
             * Certain stacked and floating label placements cause the
             * label to translate up and create a "cut out"
             * inside of that border by using the notch-spacer element.
             */
            return [
                h("div", { class: "input-outline-container" }, h("div", { class: "input-outline-start" }), h("div", { class: {
                        'input-outline-notch': true,
                        'input-outline-notch-hidden': !this.hasLabel,
                    } }, h("div", { class: "notch-spacer", "aria-hidden": "true", ref: (el) => (this.notchSpacerEl = el) }, this.label)), h("div", { class: "input-outline-end" })),
                this.renderLabel(),
            ];
        }
        /**
         * If not using the outline style,
         * we can render just the label.
         */
        return this.renderLabel();
    }
    render() {
        const { disabled, fill, readonly, shape, inputId, labelPlacement, el, hasFocus, clearInputIcon } = this;
        const mode = getIonMode(this);
        const value = this.getValue();
        const inItem = hostContext('ion-item', this.el);
        const shouldRenderHighlight = mode === 'md' && fill !== 'outline' && !inItem;
        const defaultClearIcon = mode === 'ios' ? closeCircle : closeSharp;
        const clearIconData = clearInputIcon !== null && clearInputIcon !== void 0 ? clearInputIcon : defaultClearIcon;
        const hasValue = this.hasValue();
        const hasStartEndSlots = el.querySelector('[slot="start"], [slot="end"]') !== null;
        /**
         * If the label is stacked, it should always sit above the input.
         * For floating labels, the label should move above the input if
         * the input has a value, is focused, or has anything in either
         * the start or end slot.
         *
         * If there is content in the start slot, the label would overlap
         * it if not forced to float. This is also applied to the end slot
         * because with the default or solid fills, the input is not
         * vertically centered in the container, but the label is. This
         * causes the slots and label to appear vertically offset from each
         * other when the label isn't floating above the input. This doesn't
         * apply to the outline fill, but this was not accounted for to keep
         * things consistent.
         *
         * TODO(FW-5592): Remove hasStartEndSlots condition
         */
        const labelShouldFloat = labelPlacement === 'stacked' || (labelPlacement === 'floating' && (hasValue || hasFocus || hasStartEndSlots));
        return (h(Host, { key: '41b2526627e7d2773a80f011b123284203a71ca0', class: createColorClasses(this.color, {
                [mode]: true,
                'has-value': hasValue,
                'has-focus': hasFocus,
                'label-floating': labelShouldFloat,
                [`input-fill-${fill}`]: fill !== undefined,
                [`input-shape-${shape}`]: shape !== undefined,
                [`input-label-placement-${labelPlacement}`]: true,
                'in-item': inItem,
                'in-item-color': hostContext('ion-item.ion-color', this.el),
                'input-disabled': disabled,
            }) }, h("label", { key: '9ab078363e32528102b441ad1791d83f86fdcbdc', class: "input-wrapper", htmlFor: inputId, onClick: this.onLabelClick }, this.renderLabelContainer(), h("div", { key: 'e34b594980ec62e4c618e827fadf7669a39ad0d8', class: "native-wrapper", onClick: this.onLabelClick }, h("slot", { key: '12dc04ead5502e9e5736240e918bf9331bf7b5d9', name: "start" }), h("input", Object.assign({ key: 'df356eb4ced23109b2c0242f36dc043aba8782d6', class: "native-input", ref: (input) => (this.nativeInput = input), id: inputId, disabled: disabled, autoCapitalize: this.autocapitalize, autoComplete: this.autocomplete, autoCorrect: this.autocorrect, autoFocus: this.autofocus, enterKeyHint: this.enterkeyhint, inputMode: this.inputmode, min: this.min, max: this.max, minLength: this.minlength, maxLength: this.maxlength, multiple: this.multiple, name: this.name, pattern: this.pattern, placeholder: this.placeholder || '', readOnly: readonly, required: this.required, spellcheck: this.spellcheck, step: this.step, type: this.type, value: value, onInput: this.onInput, onChange: this.onChange, onBlur: this.onBlur, onFocus: this.onFocus, onKeyDown: this.onKeydown, onCompositionstart: this.onCompositionStart, onCompositionend: this.onCompositionEnd, "aria-describedby": this.getHintTextID(), "aria-invalid": this.getHintTextID() === this.errorTextId }, this.inheritedAttributes)), this.clearInput && !readonly && !disabled && (h("button", { key: 'aa7cb47ac287140a68c5cb0ee9359abaa611e21b', "aria-label": "reset", type: "button", class: "input-clear-icon", onPointerDown: (ev) => {
                /**
                 * This prevents mobile browsers from
                 * blurring the input when the clear
                 * button is activated.
                 */
                ev.preventDefault();
            }, onFocusin: (ev) => {
                /**
                 * Prevent the focusin event from bubbling otherwise it will cause the focusin
                 * event listener in scroll assist to fire. When this fires, focus will be moved
                 * back to the input even if the clear button was never tapped. This poses issues
                 * for screen readers as it means users would be unable to swipe past the clear button.
                 */
                ev.stopPropagation();
            }, onClick: this.clearTextInput }, h("ion-icon", { key: 'cd03e46b97299d9db5cedf81944ae9bbe72bacdc', "aria-hidden": "true", icon: clearIconData }))), h("slot", { key: 'de36b79a89c4b413beba22e8a74c53dbf57a84ab', name: "end" })), shouldRenderHighlight && h("div", { key: 'f088509073845bf767ea7ccfde1e917e1cf93cc1', class: "input-highlight" })), this.renderBottomContent()));
    }
    static get is() { return "ion-input"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() {
        return {
            "ios": ["input.ios.scss"],
            "md": ["input.md.scss"]
        };
    }
    static get styleUrls() {
        return {
            "ios": ["input.ios.css"],
            "md": ["input.md.css"]
        };
    }
    static get properties() {
        return {
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
            "autocapitalize": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user.\nAvailable options: `\"off\"`, `\"none\"`, `\"on\"`, `\"sentences\"`, `\"words\"`, `\"characters\"`."
                },
                "attribute": "autocapitalize",
                "reflect": false,
                "defaultValue": "'off'"
            },
            "autocomplete": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "AutocompleteTypes",
                    "resolved": "\"name\" | \"email\" | \"tel\" | \"url\" | \"on\" | \"off\" | \"honorific-prefix\" | \"given-name\" | \"additional-name\" | \"family-name\" | \"honorific-suffix\" | \"nickname\" | \"username\" | \"new-password\" | \"current-password\" | \"one-time-code\" | \"organization-title\" | \"organization\" | \"street-address\" | \"address-line1\" | \"address-line2\" | \"address-line3\" | \"address-level4\" | \"address-level3\" | \"address-level2\" | \"address-level1\" | \"country\" | \"country-name\" | \"postal-code\" | \"cc-name\" | \"cc-given-name\" | \"cc-additional-name\" | \"cc-family-name\" | \"cc-number\" | \"cc-exp\" | \"cc-exp-month\" | \"cc-exp-year\" | \"cc-csc\" | \"cc-type\" | \"transaction-currency\" | \"transaction-amount\" | \"language\" | \"bday\" | \"bday-day\" | \"bday-month\" | \"bday-year\" | \"sex\" | \"tel-country-code\" | \"tel-national\" | \"tel-area-code\" | \"tel-local\" | \"tel-extension\" | \"impp\" | \"photo\"",
                    "references": {
                        "AutocompleteTypes": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::AutocompleteTypes"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Indicates whether the value of the control can be automatically completed by the browser."
                },
                "attribute": "autocomplete",
                "reflect": false,
                "defaultValue": "'off'"
            },
            "autocorrect": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'on' | 'off'",
                    "resolved": "\"off\" | \"on\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether auto correction should be enabled when the user is entering/editing the text value."
                },
                "attribute": "autocorrect",
                "reflect": false,
                "defaultValue": "'off'"
            },
            "autofocus": {
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
                    "text": "Sets the [`autofocus` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus) on the native input element.\n\nThis may not be sufficient for the element to be focused on page load. See [managing focus](/docs/developing/managing-focus) for more information."
                },
                "attribute": "autofocus",
                "reflect": false,
                "defaultValue": "false"
            },
            "clearInput": {
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
                    "text": "If `true`, a clear icon will appear in the input when there is a value. Clicking it clears the input."
                },
                "attribute": "clear-input",
                "reflect": false,
                "defaultValue": "false"
            },
            "clearInputIcon": {
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
                    "text": "The icon to use for the clear button. Only applies when `clearInput` is set to `true`."
                },
                "attribute": "clear-input-icon",
                "reflect": false
            },
            "clearOnEdit": {
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
                    "text": "If `true`, the value will be cleared after focus upon edit. Defaults to `true` when `type` is `\"password\"`, `false` for all other types."
                },
                "attribute": "clear-on-edit",
                "reflect": false
            },
            "counter": {
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
                    "text": "If `true`, a character counter will display the ratio of characters used and the total character limit. Developers must also set the `maxlength` property for the counter to be calculated correctly."
                },
                "attribute": "counter",
                "reflect": false,
                "defaultValue": "false"
            },
            "counterFormatter": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "(inputLength: number, maxLength: number) => string",
                    "resolved": "((inputLength: number, maxLength: number) => string) | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "A callback used to format the counter text.\nBy default the counter text is set to \"itemLength / maxLength\".\n\nSee https://ionicframework.com/docs/troubleshooting/runtime#accessing-this\nif you need to access `this` from within the callback."
                }
            },
            "debounce": {
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
                    "text": "Set the amount of time, in milliseconds, to wait to trigger the `ionInput` event after each keystroke."
                },
                "attribute": "debounce",
                "reflect": false
            },
            "disabled": {
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
                    "text": "If `true`, the user cannot interact with the input."
                },
                "attribute": "disabled",
                "reflect": true,
                "defaultValue": "false"
            },
            "enterkeyhint": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'",
                    "resolved": "\"done\" | \"enter\" | \"go\" | \"next\" | \"previous\" | \"search\" | \"send\" | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "A hint to the browser for which enter key to display.\nPossible values: `\"enter\"`, `\"done\"`, `\"go\"`, `\"next\"`,\n`\"previous\"`, `\"search\"`, and `\"send\"`."
                },
                "attribute": "enterkeyhint",
                "reflect": false
            },
            "errorText": {
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
                    "text": "Text that is placed under the input and displayed when an error is detected."
                },
                "attribute": "error-text",
                "reflect": false
            },
            "fill": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'outline' | 'solid'",
                    "resolved": "\"outline\" | \"solid\" | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The fill for the item. If `\"solid\"` the item will have a background. If\n`\"outline\"` the item will be transparent with a border. Only available in `md` mode."
                },
                "attribute": "fill",
                "reflect": false
            },
            "inputmode": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'",
                    "resolved": "\"decimal\" | \"email\" | \"none\" | \"numeric\" | \"search\" | \"tel\" | \"text\" | \"url\" | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "A hint to the browser for which keyboard to display.\nPossible values: `\"none\"`, `\"text\"`, `\"tel\"`, `\"url\"`,\n`\"email\"`, `\"numeric\"`, `\"decimal\"`, and `\"search\"`."
                },
                "attribute": "inputmode",
                "reflect": false
            },
            "helperText": {
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
                    "text": "Text that is placed under the input and displayed when no error is detected."
                },
                "attribute": "helper-text",
                "reflect": false
            },
            "label": {
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
                    "text": "The visible label associated with the input.\n\nUse this if you need to render a plaintext label.\n\nThe `label` property will take priority over the `label` slot if both are used."
                },
                "attribute": "label",
                "reflect": false
            },
            "labelPlacement": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'start' | 'end' | 'floating' | 'stacked' | 'fixed'",
                    "resolved": "\"end\" | \"fixed\" | \"floating\" | \"stacked\" | \"start\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Where to place the label relative to the input.\n`\"start\"`: The label will appear to the left of the input in LTR and to the right in RTL.\n`\"end\"`: The label will appear to the right of the input in LTR and to the left in RTL.\n`\"floating\"`: The label will appear smaller and above the input when the input is focused or it has a value. Otherwise it will appear on top of the input.\n`\"stacked\"`: The label will appear smaller and above the input regardless even when the input is blurred or has no value.\n`\"fixed\"`: The label has the same behavior as `\"start\"` except it also has a fixed width. Long text will be truncated with ellipses (\"...\")."
                },
                "attribute": "label-placement",
                "reflect": false,
                "defaultValue": "'start'"
            },
            "max": {
                "type": "any",
                "mutable": false,
                "complexType": {
                    "original": "string | number",
                    "resolved": "number | string | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The maximum value, which must not be less than its minimum (min attribute) value."
                },
                "attribute": "max",
                "reflect": false
            },
            "maxlength": {
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
                    "text": "If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter."
                },
                "attribute": "maxlength",
                "reflect": false
            },
            "min": {
                "type": "any",
                "mutable": false,
                "complexType": {
                    "original": "string | number",
                    "resolved": "number | string | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The minimum value, which must not be greater than its maximum (max attribute) value."
                },
                "attribute": "min",
                "reflect": false
            },
            "minlength": {
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
                    "text": "If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter."
                },
                "attribute": "minlength",
                "reflect": false
            },
            "multiple": {
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
                    "text": "If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `\"email\"`, otherwise it is ignored."
                },
                "attribute": "multiple",
                "reflect": false
            },
            "name": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The name of the control, which is submitted with the form data."
                },
                "attribute": "name",
                "reflect": false,
                "defaultValue": "this.inputId"
            },
            "pattern": {
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
                    "text": "A regular expression that the value is checked against. The pattern must match the entire value, not just some subset. Use the title attribute to describe the pattern to help the user. This attribute applies when the value of the type attribute is `\"text\"`, `\"search\"`, `\"tel\"`, `\"url\"`, `\"email\"`, `\"date\"`, or `\"password\"`, otherwise it is ignored. When the type attribute is `\"date\"`, `pattern` will only be used in browsers that do not support the `\"date\"` input type natively. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date for more information."
                },
                "attribute": "pattern",
                "reflect": false
            },
            "placeholder": {
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
                    "text": "Instructional text that shows before the input has a value.\nThis property applies only when the `type` property is set to `\"email\"`,\n`\"number\"`, `\"password\"`, `\"search\"`, `\"tel\"`, `\"text\"`, or `\"url\"`, otherwise it is ignored."
                },
                "attribute": "placeholder",
                "reflect": false
            },
            "readonly": {
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
                    "text": "If `true`, the user cannot modify the value."
                },
                "attribute": "readonly",
                "reflect": true,
                "defaultValue": "false"
            },
            "required": {
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
                    "text": "If `true`, the user must fill in a value before submitting a form."
                },
                "attribute": "required",
                "reflect": false,
                "defaultValue": "false"
            },
            "shape": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'round'",
                    "resolved": "\"round\" | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The shape of the input. If \"round\" it will have an increased border radius."
                },
                "attribute": "shape",
                "reflect": false
            },
            "spellcheck": {
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
                    "text": "If `true`, the element will have its spelling and grammar checked."
                },
                "attribute": "spellcheck",
                "reflect": false,
                "defaultValue": "false"
            },
            "step": {
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
                    "text": "Works with the min and max attributes to limit the increments at which a value can be set.\nPossible values are: `\"any\"` or a positive floating point number."
                },
                "attribute": "step",
                "reflect": false
            },
            "type": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "TextFieldTypes",
                    "resolved": "\"date\" | \"datetime-local\" | \"email\" | \"month\" | \"number\" | \"password\" | \"search\" | \"tel\" | \"text\" | \"time\" | \"url\" | \"week\"",
                    "references": {
                        "TextFieldTypes": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::TextFieldTypes"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The type of control to display. The default type is text."
                },
                "attribute": "type",
                "reflect": false,
                "defaultValue": "'text'"
            },
            "value": {
                "type": "any",
                "mutable": true,
                "complexType": {
                    "original": "string | number | null",
                    "resolved": "null | number | string | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The value of the input."
                },
                "attribute": "value",
                "reflect": false,
                "defaultValue": "''"
            }
        };
    }
    static get states() {
        return {
            "hasFocus": {}
        };
    }
    static get events() {
        return [{
                "method": "ionInput",
                "name": "ionInput",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "The `ionInput` event is fired each time the user modifies the input's value.\nUnlike the `ionChange` event, the `ionInput` event is fired for each alteration\nto the input's value. This typically happens for each keystroke as the user types.\n\nFor elements that accept text input (`type=text`, `type=tel`, etc.), the interface\nis [`InputEvent`](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent); for others,\nthe interface is [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event). If\nthe input is cleared on edit, the type is `null`."
                },
                "complexType": {
                    "original": "InputInputEventDetail",
                    "resolved": "InputInputEventDetail",
                    "references": {
                        "InputInputEventDetail": {
                            "location": "import",
                            "path": "./input-interface",
                            "id": "src/components/input/input-interface.ts::InputInputEventDetail"
                        }
                    }
                }
            }, {
                "method": "ionChange",
                "name": "ionChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "The `ionChange` event is fired when the user modifies the input's value.\nUnlike the `ionInput` event, the `ionChange` event is only fired when changes\nare committed, not as the user types.\n\nDepending on the way the users interacts with the element, the `ionChange`\nevent fires at a different moment:\n- When the user commits the change explicitly (e.g. by selecting a date\nfrom a date picker for `<ion-input type=\"date\">`, pressing the \"Enter\" key, etc.).\n- When the element loses focus after its value has changed: for elements\nwhere the user's interaction is typing.\n\nThis event will not emit when programmatically setting the `value` property."
                },
                "complexType": {
                    "original": "InputChangeEventDetail",
                    "resolved": "InputChangeEventDetail",
                    "references": {
                        "InputChangeEventDetail": {
                            "location": "import",
                            "path": "./input-interface",
                            "id": "src/components/input/input-interface.ts::InputChangeEventDetail"
                        }
                    }
                }
            }, {
                "method": "ionBlur",
                "name": "ionBlur",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the input loses focus."
                },
                "complexType": {
                    "original": "FocusEvent",
                    "resolved": "FocusEvent",
                    "references": {
                        "FocusEvent": {
                            "location": "global",
                            "id": "global::FocusEvent"
                        }
                    }
                }
            }, {
                "method": "ionFocus",
                "name": "ionFocus",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the input has focus."
                },
                "complexType": {
                    "original": "FocusEvent",
                    "resolved": "FocusEvent",
                    "references": {
                        "FocusEvent": {
                            "location": "global",
                            "id": "global::FocusEvent"
                        }
                    }
                }
            }];
    }
    static get methods() {
        return {
            "setFocus": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Sets focus on the native `input` in `ion-input`. Use this method instead of the global\n`input.focus()`.\n\nDevelopers who wish to focus an input when a page enters\nshould call `setFocus()` in the `ionViewDidEnter()` lifecycle method.\n\nDevelopers who wish to focus an input when an overlay is presented\nshould call `setFocus` after `didPresent` has resolved.\n\nSee [managing focus](/docs/developing/managing-focus) for more information.",
                    "tags": []
                }
            },
            "getInputElement": {
                "complexType": {
                    "signature": "() => Promise<HTMLInputElement>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "HTMLInputElement": {
                            "location": "global",
                            "id": "global::HTMLInputElement"
                        }
                    },
                    "return": "Promise<HTMLInputElement>"
                },
                "docs": {
                    "text": "Returns the native `<input>` element used under the hood.",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "debounce",
                "methodName": "debounceChanged"
            }, {
                "propName": "type",
                "methodName": "onTypeChange"
            }, {
                "propName": "value",
                "methodName": "valueChanged"
            }, {
                "propName": "dir",
                "methodName": "onDirChanged"
            }];
    }
    static get listeners() {
        return [{
                "name": "click",
                "method": "onClickCapture",
                "target": undefined,
                "capture": true,
                "passive": false
            }];
    }
}
let inputIds = 0;
