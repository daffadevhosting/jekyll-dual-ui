/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { Host, h } from "@stencil/core";
import { findClosestIonContent, getScrollElement } from "../../utils/content/index";
import { raf } from "../../utils/helpers";
import { hapticSelectionChanged, hapticSelectionEnd, hapticSelectionStart } from "../../utils/native/haptic";
import { getIonMode } from "../../global/ionic-global";
export class ReorderGroup {
    constructor() {
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
        this.gesture = (await import('../../utils/gesture')).createGesture({
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
    static get is() { return "ion-reorder-group"; }
    static get originalStyleUrls() {
        return {
            "$": ["reorder-group.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["reorder-group.css"]
        };
    }
    static get properties() {
        return {
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
                    "text": "If `true`, the reorder will be hidden."
                },
                "attribute": "disabled",
                "reflect": false,
                "defaultValue": "true"
            }
        };
    }
    static get states() {
        return {
            "state": {}
        };
    }
    static get events() {
        return [{
                "method": "ionItemReorder",
                "name": "ionItemReorder",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Event that needs to be listened to in order to complete the reorder action.\nOnce the event has been emitted, the `complete()` method then needs\nto be called in order to finalize the reorder action."
                },
                "complexType": {
                    "original": "ItemReorderEventDetail",
                    "resolved": "ItemReorderEventDetail",
                    "references": {
                        "ItemReorderEventDetail": {
                            "location": "import",
                            "path": "./reorder-group-interface",
                            "id": "src/components/reorder-group/reorder-group-interface.ts::ItemReorderEventDetail"
                        }
                    }
                }
            }];
    }
    static get methods() {
        return {
            "complete": {
                "complexType": {
                    "signature": "(listOrReorder?: boolean | any[]) => Promise<any>",
                    "parameters": [{
                            "name": "listOrReorder",
                            "type": "boolean | any[] | undefined",
                            "docs": "A list of items to be sorted and returned in the new order or a\nboolean of whether or not the reorder should reposition the item."
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<any>"
                },
                "docs": {
                    "text": "Completes the reorder operation. Must be called by the `ionItemReorder` event.\n\nIf a list of items is passed, the list will be reordered and returned in the\nproper order.\n\nIf no parameters are passed or if `true` is passed in, the reorder will complete\nand the item will remain in the position it was dragged to. If `false` is passed,\nthe reorder will complete and the item will bounce back to its original position.",
                    "tags": [{
                            "name": "param",
                            "text": "listOrReorder A list of items to be sorted and returned in the new order or a\nboolean of whether or not the reorder should reposition the item."
                        }]
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "disabled",
                "methodName": "disabledChanged"
            }];
    }
}
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
