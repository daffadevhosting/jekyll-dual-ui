/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { r as registerInstance, h, e as Host, f as getElement, c as createEvent } from './index-527b9e34.js';
import { j as reorderThreeOutline, k as reorderTwoSharp } from './index-e2cf2ceb.js';
import { b as getIonMode } from './ionic-global-b26f573e.js';
import { f as findClosestIonContent, g as getScrollElement } from './index-9a17db3d.js';
import { r as raf } from './helpers-d94bc8ad.js';
import { a as hapticSelectionStart, b as hapticSelectionChanged, h as hapticSelectionEnd } from './haptic-ac164e4c.js';
import './index-cfd9c1f2.js';
import './capacitor-59395cbd.js';
import './index-a5d50daf.js';

const reorderIosCss = ":host([slot]){display:none;line-height:0;z-index:100}.reorder-icon{display:block}::slotted(ion-icon){font-size:dynamic-font(16px)}.reorder-icon{font-size:2.125rem;opacity:0.4}";
const IonReorderIosStyle0 = reorderIosCss;

const reorderMdCss = ":host([slot]){display:none;line-height:0;z-index:100}.reorder-icon{display:block}::slotted(ion-icon){font-size:dynamic-font(16px)}.reorder-icon{font-size:1.9375rem;opacity:0.3}";
const IonReorderMdStyle0 = reorderMdCss;

const Reorder = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    onClick(ev) {
        const reorderGroup = this.el.closest('ion-reorder-group');
        ev.preventDefault();
        // Only stop event propagation if the reorder is inside of an enabled
        // reorder group. This allows interaction with clickable children components.
        if (!reorderGroup || !reorderGroup.disabled) {
            ev.stopImmediatePropagation();
        }
    }
    render() {
        const mode = getIonMode(this);
        const reorderIcon = mode === 'ios' ? reorderThreeOutline : reorderTwoSharp;
        return (h(Host, { key: '17adf3165f4e09283d5d6434d7cd47bd23519048', class: mode }, h("slot", { key: 'd00d1cd97c689fc5c7b7175a2051cf697fe22871' }, h("ion-icon", { key: 'eec219aebde6083de98358be3e75965c5a5dc3d0', icon: reorderIcon, lazy: false, class: "reorder-icon", part: "icon", "aria-hidden": "true" }))));
    }
    get el() { return getElement(this); }
};
Reorder.style = {
    ios: IonReorderIosStyle0,
    md: IonReorderMdStyle0
};

const reorderGroupCss = ".reorder-list-active>*{display:block;-webkit-transition:-webkit-transform 300ms;transition:-webkit-transform 300ms;transition:transform 300ms;transition:transform 300ms, -webkit-transform 300ms;will-change:transform}.reorder-enabled{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.reorder-enabled ion-reorder{display:block;cursor:-webkit-grab;cursor:grab;pointer-events:all;-ms-touch-action:none;touch-action:none}.reorder-selected,.reorder-selected ion-reorder{cursor:-webkit-grabbing;cursor:grabbing}.reorder-selected{position:relative;-webkit-transition:none !important;transition:none !important;-webkit-box-shadow:0 0 10px rgba(0, 0, 0, 0.4);box-shadow:0 0 10px rgba(0, 0, 0, 0.4);opacity:0.8;z-index:100}.reorder-visible ion-reorder .reorder-icon{-webkit-transform:translate3d(0,  0,  0);transform:translate3d(0,  0,  0)}";
const IonReorderGroupStyle0 = reorderGroupCss;

const ReorderGroup = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.ionItemReorder = createEvent(this, "ionItemReorder", 7);
        this.lastToIndex = -1;
        this.cachedHeights = [];
        this.scrollElTop = 0;
        this.scrollElBottom = 0;
        this.scrollElInitial = 0;
        this.containerTop = 0;
        this.containerBottom = 0;
        this.state = 0 /* ReorderGroupState.Idle */;
        this.disabled = true;
    }
    disabledChanged() {
        if (this.gesture) {
            this.gesture.enable(!this.disabled);
        }
    }
    async connectedCallback() {
        const contentEl = findClosestIonContent(this.el);
        if (contentEl) {
            this.scrollEl = await getScrollElement(contentEl);
        }
        this.gesture = (await import('./index-39782642.js')).createGesture({
            el: this.el,
            gestureName: 'reorder',
            gesturePriority: 110,
            threshold: 0,
            direction: 'y',
            passive: false,
            canStart: (detail) => this.canStart(detail),
            onStart: (ev) => this.onStart(ev),
            onMove: (ev) => this.onMove(ev),
            onEnd: () => this.onEnd(),
        });
        this.disabledChanged();
    }
    disconnectedCallback() {
        this.onEnd();
        if (this.gesture) {
            this.gesture.destroy();
            this.gesture = undefined;
        }
    }
    /**
     * Completes the reorder operation. Must be called by the `ionItemReorder` event.
     *
     * If a list of items is passed, the list will be reordered and returned in the
     * proper order.
     *
     * If no parameters are passed or if `true` is passed in, the reorder will complete
     * and the item will remain in the position it was dragged to. If `false` is passed,
     * the reorder will complete and the item will bounce back to its original position.
     *
     * @param listOrReorder A list of items to be sorted and returned in the new order or a
     * boolean of whether or not the reorder should reposition the item.
     */
    complete(listOrReorder) {
        return Promise.resolve(this.completeReorder(listOrReorder));
    }
    canStart(ev) {
        if (this.selectedItemEl || this.state !== 0 /* ReorderGroupState.Idle */) {
            return false;
        }
        const target = ev.event.target;
        const reorderEl = target.closest('ion-reorder');
        if (!reorderEl) {
            return false;
        }
        const item = findReorderItem(reorderEl, this.el);
        if (!item) {
            return false;
        }
        ev.data = item;
        return true;
    }
    onStart(ev) {
        ev.event.preventDefault();
        const item = (this.selectedItemEl = ev.data);
        const heights = this.cachedHeights;
        heights.length = 0;
        const el = this.el;
        const children = el.children;
        if (!children || children.length === 0) {
            return;
        }
        let sum = 0;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            sum += child.offsetHeight;
            heights.push(sum);
            child.$ionIndex = i;
        }
        const box = el.getBoundingClientRect();
        this.containerTop = box.top;
        this.containerBottom = box.bottom;
        if (this.scrollEl) {
            const scrollBox = this.scrollEl.getBoundingClientRect();
            this.scrollElInitial = this.scrollEl.scrollTop;
            this.scrollElTop = scrollBox.top + AUTO_SCROLL_MARGIN;
            this.scrollElBottom = scrollBox.bottom - AUTO_SCROLL_MARGIN;
        }
        else {
            this.scrollElInitial = 0;
            this.scrollElTop = 0;
            this.scrollElBottom = 0;
        }
        this.lastToIndex = indexForItem(item);
        this.selectedItemHeight = item.offsetHeight;
        this.state = 1 /* ReorderGroupState.Active */;
        item.classList.add(ITEM_REORDER_SELECTED);
        hapticSelectionStart();
    }
    onMove(ev) {
        const selectedItem = this.selectedItemEl;
        if (!selectedItem) {
            return;
        }
        // Scroll if we reach the scroll margins
        const scroll = this.autoscroll(ev.currentY);
        // // Get coordinate
        const top = this.containerTop - scroll;
        const bottom = this.containerBottom - scroll;
        const currentY = Math.max(top, Math.min(ev.currentY, bottom));
        const deltaY = scroll + currentY - ev.startY;
        const normalizedY = currentY - top;
        const toIndex = this.itemIndexForTop(normalizedY);
        if (toIndex !== this.lastToIndex) {
            const fromIndex = indexForItem(selectedItem);
            this.lastToIndex = toIndex;
            hapticSelectionChanged();
            this.reorderMove(fromIndex, toIndex);
        }
        // Update selected item position
        selectedItem.style.transform = `translateY(${deltaY}px)`;
    }
    onEnd() {
        const selectedItemEl = this.selectedItemEl;
        this.state = 2 /* ReorderGroupState.Complete */;
        if (!selectedItemEl) {
            this.state = 0 /* ReorderGroupState.Idle */;
            return;
        }
        const toIndex = this.lastToIndex;
        const fromIndex = indexForItem(selectedItemEl);
        if (toIndex === fromIndex) {
            this.completeReorder();
        }
        else {
            this.ionItemReorder.emit({
                from: fromIndex,
                to: toIndex,
                complete: this.completeReorder.bind(this),
            });
        }
        hapticSelectionEnd();
    }
    completeReorder(listOrReorder) {
        const selectedItemEl = this.selectedItemEl;
        if (selectedItemEl && this.state === 2 /* ReorderGroupState.Complete */) {
            const children = this.el.children;
            const len = children.length;
            const toIndex = this.lastToIndex;
            const fromIndex = indexForItem(selectedItemEl);
            /**
             * insertBefore and setting the transform
             * needs to happen in the same frame otherwise
             * there will be a duplicate transition. This primarily
             * impacts Firefox where insertBefore and transform operations
             * are happening in two separate frames.
             */
            raf(() => {
                if (toIndex !== fromIndex && (listOrReorder === undefined || listOrReorder === true)) {
                    const ref = fromIndex < toIndex ? children[toIndex + 1] : children[toIndex];
                    this.el.insertBefore(selectedItemEl, ref);
                }
                for (let i = 0; i < len; i++) {
                    children[i].style['transform'] = '';
                }
            });
            if (Array.isArray(listOrReorder)) {
                listOrReorder = reorderArray(listOrReorder, fromIndex, toIndex);
            }
            selectedItemEl.style.transition = '';
            selectedItemEl.classList.remove(ITEM_REORDER_SELECTED);
            this.selectedItemEl = undefined;
            this.state = 0 /* ReorderGroupState.Idle */;
        }
        return listOrReorder;
    }
    itemIndexForTop(deltaY) {
        const heights = this.cachedHeights;
        for (let i = 0; i < heights.length; i++) {
            if (heights[i] > deltaY) {
                return i;
            }
        }
        return heights.length - 1;
    }
    /********* DOM WRITE ********* */
    reorderMove(fromIndex, toIndex) {
        const itemHeight = this.selectedItemHeight;
        const children = this.el.children;
        for (let i = 0; i < children.length; i++) {
            const style = children[i].style;
            let value = '';
            if (i > fromIndex && i <= toIndex) {
                value = `translateY(${-itemHeight}px)`;
            }
            else if (i < fromIndex && i >= toIndex) {
                value = `translateY(${itemHeight}px)`;
            }
            style['transform'] = value;
        }
    }
    autoscroll(posY) {
        if (!this.scrollEl) {
            return 0;
        }
        let amount = 0;
        if (posY < this.scrollElTop) {
            amount = -SCROLL_JUMP;
        }
        else if (posY > this.scrollElBottom) {
            amount = SCROLL_JUMP;
        }
        if (amount !== 0) {
            this.scrollEl.scrollBy(0, amount);
        }
        return this.scrollEl.scrollTop - this.scrollElInitial;
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '6ca009dd65302a914d459aec638e62977440db20', class: {
                [mode]: true,
                'reorder-enabled': !this.disabled,
                'reorder-list-active': this.state !== 0 /* ReorderGroupState.Idle */,
            } }));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "disabled": ["disabledChanged"]
    }; }
};
const indexForItem = (element) => {
    return element['$ionIndex'];
};
const findReorderItem = (node, container) => {
    let parent;
    while (node) {
        parent = node.parentElement;
        if (parent === container) {
            return node;
        }
        node = parent;
    }
    return undefined;
};
const AUTO_SCROLL_MARGIN = 60;
const SCROLL_JUMP = 10;
const ITEM_REORDER_SELECTED = 'reorder-selected';
const reorderArray = (array, from, to) => {
    const element = array[from];
    array.splice(from, 1);
    array.splice(to, 0, element);
    return array.slice();
};
ReorderGroup.style = IonReorderGroupStyle0;

export { Reorder as ion_reorder, ReorderGroup as ion_reorder_group };
