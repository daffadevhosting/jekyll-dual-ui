import type { ComponentInterface, EventEmitter } from '../../stencil-public-runtime';
import type { AnchorInterface, ButtonInterface } from "../../utils/element-interface";
import type { AnimationBuilder, Color } from '../../interface';
import type { RouterDirection } from '../router/utils/interface';
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - Content is placed between the named slots if provided without a slot.
 * @slot icon-only - Should be used on an icon in a button that has no text.
 * @slot start - Content is placed to the left of the button text in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the button text in LTR, and to the left in RTL.
 *
 * @part native - The native HTML button or anchor element that wraps all child elements.
 */
export declare class Button implements ComponentInterface, AnchorInterface, ButtonInterface {
    private inItem;
    private inListHeader;
    private inToolbar;
    private formButtonEl;
    private formEl;
    private inheritedAttributes;
    el: HTMLElement;
    /**
     * If `true`, the button only has an icon.
     */
    isCircle: boolean;
    /**
     * The color to use from your application's color palette.
     * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
     * For more information on colors, see [theming](/docs/theming/basics).
     */
    color?: Color;
    /**
     * The type of button.
     */
    buttonType: string;
    /**
     * If `true`, the user cannot interact with the button.
     */
    disabled: boolean;
    disabledChanged(): void;
    /**
     * Set to `"block"` for a full-width button or to `"full"` for a full-width button
     * with square corners and no left or right borders.
     */
    expand?: 'full' | 'block';
    /**
     * Set to `"clear"` for a transparent button that resembles a flat button, to `"outline"`
     * for a transparent button with a border, or to `"solid"` for a button with a filled background.
     * The default fill is `"solid"` except inside of a toolbar, where the default is `"clear"`.
     */
    fill?: 'clear' | 'outline' | 'solid' | 'default';
    /**
     * When using a router, it specifies the transition direction when navigating to
     * another page using `href`.
     */
    routerDirection: RouterDirection;
    /**
     * When using a router, it specifies the transition animation when navigating to
     * another page using `href`.
     */
    routerAnimation: AnimationBuilder | undefined;
    /**
     * This attribute instructs browsers to download a URL instead of navigating to
     * it, so the user will be prompted to save it as a local file. If the attribute
     * has a value, it is used as the pre-filled file name in the Save prompt
     * (the user can still change the file name if they want).
     */
    download: string | undefined;
    /**
     * Contains a URL or a URL fragment that the hyperlink points to.
     * If this property is set, an anchor tag will be rendered.
     */
    href: string | undefined;
    /**
     * Specifies the relationship of the target object to the link object.
     * The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).
     */
    rel: string | undefined;
    /**
     * Set to `"round"` for a button with more rounded corners.
     */
    shape?: 'round';
    /**
     * Set to `"small"` for a button with less height and padding, to `"default"`
     * for a button with the default height and padding, or to `"large"` for a button
     * with more height and padding. By default the size is unset, unless the button
     * is inside of an item, where the size is `"small"` by default. Set the size to
     * `"default"` inside of an item to make it a standard size button.
     */
    size?: 'small' | 'default' | 'large';
    /**
     * If `true`, activates a button with a heavier font weight.
     */
    strong: boolean;
    /**
     * Specifies where to display the linked URL.
     * Only applies when an `href` is provided.
     * Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.
     */
    target: string | undefined;
    /**
     * The type of the button.
     */
    type: 'submit' | 'reset' | 'button';
    /**
     * The HTML form element or form element id. Used to submit a form when the button is not a child of the form.
     */
    form?: string | HTMLFormElement;
    /**
     * Emitted when the button has focus.
     */
    ionFocus: EventEmitter<void>;
    /**
     * Emitted when the button loses focus.
     */
    ionBlur: EventEmitter<void>;
    /**
     * This component is used within the `ion-input-password-toggle` component
     * to toggle the visibility of the password input.
     * These attributes need to update based on the state of the password input.
     * Otherwise, the values will be stale.
     *
     * @param newValue
     * @param _oldValue
     * @param propName
     */
    onAriaChanged(newValue: string, _oldValue: string, propName: string): void;
    /**
     * This is responsible for rendering a hidden native
     * button element inside the associated form. This allows
     * users to submit a form by pressing "Enter" when a text
     * field inside of the form is focused. The native button
     * rendered inside of `ion-button` is in the Shadow DOM
     * and therefore does not participate in form submission
     * which is why the following code is necessary.
     */
    private renderHiddenButton;
    componentWillLoad(): void;
    private get hasIconOnly();
    private get rippleType();
    /**
     * Finds the form element based on the provided `form` selector
     * or element reference provided.
     */
    private findForm;
    private submitForm;
    private handleClick;
    private onFocus;
    private onBlur;
    private slotChanged;
    render(): any;
}
