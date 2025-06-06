import type { ComponentInterface, EventEmitter } from '../../stencil-public-runtime';
import type { AutocompleteTypes, Color, StyleEventDetail } from '../../interface';
import type { SearchbarChangeEventDetail, SearchbarInputEventDetail } from './searchbar-interface';
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
export declare class Searchbar implements ComponentInterface {
    private nativeInput?;
    private isCancelVisible;
    private shouldAlignLeft;
    private originalIonInput?;
    private inputId;
    private inheritedAttributes;
    /**
     * The value of the input when the textarea is focused.
     */
    private focusedValue?;
    el: HTMLIonSearchbarElement;
    focused: boolean;
    noAnimate: boolean;
    /**
     * lang and dir are globally enumerated attributes.
     * As a result, creating these as properties
     * can have unintended side effects. Instead, we
     * listen for attribute changes and inherit them
     * to the inner `<input>` element.
     */
    onLangChanged(newValue: string): void;
    onDirChanged(newValue: string): void;
    /**
     * The color to use from your application's color palette.
     * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
     * For more information on colors, see [theming](/docs/theming/basics).
     */
    color?: Color;
    /**
     * If `true`, enable searchbar animation.
     */
    animated: boolean;
    /**
     * Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user.
     * Available options: `"off"`, `"none"`, `"on"`, `"sentences"`, `"words"`, `"characters"`.
     */
    autocapitalize: string;
    /**
     * Set the input's autocomplete property.
     */
    autocomplete: AutocompleteTypes;
    /**
     * Set the input's autocorrect property.
     */
    autocorrect: 'on' | 'off';
    /**
     * Set the cancel button icon. Only applies to `md` mode.
     * Defaults to `arrow-back-sharp`.
     */
    cancelButtonIcon: string;
    /**
     * Set the cancel button text. Only applies to `ios` mode.
     */
    cancelButtonText: string;
    /**
     * Set the clear icon. Defaults to `close-circle` for `ios` and `close-sharp` for `md`.
     */
    clearIcon?: string;
    /**
     * Set the amount of time, in milliseconds, to wait to trigger the `ionInput` event after each keystroke.
     */
    debounce?: number;
    protected debounceChanged(): void;
    /**
     * If `true`, the user cannot interact with the input.
     */
    disabled: boolean;
    /**
     * A hint to the browser for which keyboard to display.
     * Possible values: `"none"`, `"text"`, `"tel"`, `"url"`,
     * `"email"`, `"numeric"`, `"decimal"`, and `"search"`.
     */
    inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    /**
     * A hint to the browser for which enter key to display.
     * Possible values: `"enter"`, `"done"`, `"go"`, `"next"`,
     * `"previous"`, `"search"`, and `"send"`.
     */
    enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
    /**
     * This attribute specifies the maximum number of characters that the user can enter.
     */
    maxlength?: number;
    /**
     * This attribute specifies the minimum number of characters that the user can enter.
     */
    minlength?: number;
    /**
     * If used in a form, set the name of the control, which is submitted with the form data.
     */
    name: string;
    /**
     * Set the input's placeholder.
     * `placeholder` can accept either plaintext or HTML as a string.
     * To display characters normally reserved for HTML, they
     * must be escaped. For example `<Ionic>` would become
     * `&lt;Ionic&gt;`
     *
     * For more information: [Security Documentation](https://ionicframework.com/docs/faq/security)
     */
    placeholder: string;
    /**
     * The icon to use as the search icon. Defaults to `search-outline` in
     * `ios` mode and `search-sharp` in `md` mode.
     */
    searchIcon?: string;
    /**
     * Sets the behavior for the cancel button. Defaults to `"never"`.
     * Setting to `"focus"` shows the cancel button on focus.
     * Setting to `"never"` hides the cancel button.
     * Setting to `"always"` shows the cancel button regardless
     * of focus state.
     */
    showCancelButton: 'never' | 'focus' | 'always';
    /**
     * Sets the behavior for the clear button. Defaults to `"focus"`.
     * Setting to `"focus"` shows the clear button on focus if the
     * input is not empty.
     * Setting to `"never"` hides the clear button.
     * Setting to `"always"` shows the clear button regardless
     * of focus state, but only if the input is not empty.
     */
    showClearButton: 'never' | 'focus' | 'always';
    /**
     * If `true`, enable spellcheck on the input.
     */
    spellcheck: boolean;
    /**
     * Set the type of the input.
     */
    type: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
    /**
     * the value of the searchbar.
     */
    value?: string | null;
    /**
     * Emitted when the `value` of the `ion-searchbar` element has changed.
     */
    ionInput: EventEmitter<SearchbarInputEventDetail>;
    /**
     * The `ionChange` event is fired for `<ion-searchbar>` elements when the user
     * modifies the element's value. Unlike the `ionInput` event, the `ionChange`
     * event is not necessarily fired for each alteration to an element's value.
     *
     * The `ionChange` event is fired when the value has been committed
     * by the user. This can happen when the element loses focus or
     * when the "Enter" key is pressed. `ionChange` can also fire
     * when clicking the clear or cancel buttons.
     *
     * This event will not emit when programmatically setting the `value` property.
     */
    ionChange: EventEmitter<SearchbarChangeEventDetail>;
    /**
     * Emitted when the cancel button is clicked.
     */
    ionCancel: EventEmitter<void>;
    /**
     * Emitted when the clear input button is clicked.
     */
    ionClear: EventEmitter<void>;
    /**
     * Emitted when the input loses focus.
     */
    ionBlur: EventEmitter<void>;
    /**
     * Emitted when the input has focus.
     */
    ionFocus: EventEmitter<void>;
    /**
     * Emitted when the styles change.
     * @internal
     */
    ionStyle: EventEmitter<StyleEventDetail>;
    protected valueChanged(): void;
    protected showCancelButtonChanged(): void;
    connectedCallback(): void;
    componentWillLoad(): void;
    componentDidLoad(): void;
    private emitStyle;
    /**
     * Sets focus on the native `input` in `ion-searchbar`. Use this method instead of the global
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
    setFocus(): Promise<void>;
    /**
     * Returns the native `<input>` element used under the hood.
     */
    getInputElement(): Promise<HTMLInputElement>;
    /**
     * Emits an `ionChange` event.
     *
     * This API should be called for user committed changes.
     * This API should not be used for external value changes.
     */
    private emitValueChange;
    /**
     * Emits an `ionInput` event.
     */
    private emitInputChange;
    /**
     * Clears the input field and triggers the control change.
     */
    private onClearInput;
    /**
     * Clears the input field and tells the input to blur since
     * the clearInput function doesn't want the input to blur
     * then calls the custom cancel function if the user passed one in.
     */
    private onCancelSearchbar;
    /**
     * Update the Searchbar input value when the input changes
     */
    private onInput;
    private onChange;
    /**
     * Sets the Searchbar to not focused and checks if it should align left
     * based on whether there is a value in the searchbar or not.
     */
    private onBlur;
    /**
     * Sets the Searchbar to focused and active on input focus.
     */
    private onFocus;
    /**
     * Positions the input search icon, placeholder, and the cancel button
     * based on the input value and if it is focused. (ios only)
     */
    private positionElements;
    /**
     * Positions the input placeholder
     */
    private positionPlaceholder;
    /**
     * Show the iOS Cancel button on focus, hide it offscreen otherwise
     */
    private positionCancelButton;
    private getValue;
    private hasValue;
    /**
     * Determines whether or not the cancel button should be visible onscreen.
     * Cancel button should be shown if one of two conditions applies:
     * 1. `showCancelButton` is set to `always`.
     * 2. `showCancelButton` is set to `focus`, and the searchbar has been focused.
     */
    private shouldShowCancelButton;
    /**
     * Determines whether or not the clear button should be visible onscreen.
     * Clear button should be shown if one of two conditions applies:
     * 1. `showClearButton` is set to `always`.
     * 2. `showClearButton` is set to `focus`, and the searchbar has been focused.
     */
    private shouldShowClearButton;
    render(): any;
}
