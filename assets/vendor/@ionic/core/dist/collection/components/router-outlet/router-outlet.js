/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { h } from "@stencil/core";
import { getTimeGivenProgression } from "../../utils/animation/cubic-bezier";
import { attachComponent, detachComponent } from "../../utils/framework-delegate";
import { shallowEqualStringMap, hasLazyBuild } from "../../utils/helpers";
import { createLockController } from "../../utils/lock-controller";
import { printIonError } from "../../utils/logging/index";
import { transition } from "../../utils/transition/index";
import { config } from "../../global/config";
import { getIonMode } from "../../global/ionic-global";
export class RouterOutlet {
    constructor() {
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
        this.gesture = (await import('../../utils/gesture/swipe-back')).createSwipeBackGesture(this.el, () => !this.gestureOrAnimationInProgress && !!this.swipeHandler && this.swipeHandler.canStart(), () => onStart(), (step) => { var _a; return (_a = this.ani) === null || _a === void 0 ? void 0 : _a.progressStep(step); }, (shouldComplete, step, dur) => {
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
    static get is() { return "ion-router-outlet"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["router-outlet.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["router-outlet.css"]
        };
    }
    static get properties() {
        return {
            "mode": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "\"ios\" | \"md\"",
                    "resolved": "\"ios\" | \"md\"",
                    "references": {
                        "Mode": {
                            "location": "global",
                            "id": "global::Mode"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The mode determines which platform styles to use."
                },
                "attribute": "mode",
                "reflect": false,
                "defaultValue": "getIonMode(this)"
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
                    "text": "If `true`, the router-outlet should animate the transition of components."
                },
                "attribute": "animated",
                "reflect": false,
                "defaultValue": "true"
            },
            "animation": {
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
                    "text": "This property allows to create custom transition using AnimationBuilder functions."
                }
            },
            "swipeHandler": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "SwipeGestureHandler",
                    "resolved": "SwipeGestureHandler | undefined",
                    "references": {
                        "SwipeGestureHandler": {
                            "location": "import",
                            "path": "../nav/nav-interface",
                            "id": "src/components/nav/nav-interface.ts::SwipeGestureHandler"
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
            }
        };
    }
    static get events() {
        return [{
                "method": "ionNavWillLoad",
                "name": "ionNavWillLoad",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": ""
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "ionNavWillChange",
                "name": "ionNavWillChange",
                "bubbles": false,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": ""
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "ionNavDidChange",
                "name": "ionNavDidChange",
                "bubbles": false,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }],
                    "text": ""
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
            "commit": {
                "complexType": {
                    "signature": "(enteringEl: HTMLElement, leavingEl: HTMLElement | undefined, opts?: RouterOutletOptions) => Promise<boolean>",
                    "parameters": [{
                            "name": "enteringEl",
                            "type": "HTMLElement",
                            "docs": ""
                        }, {
                            "name": "leavingEl",
                            "type": "HTMLElement | undefined",
                            "docs": ""
                        }, {
                            "name": "opts",
                            "type": "RouterOutletOptions | undefined",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "HTMLElement": {
                            "location": "global",
                            "id": "global::HTMLElement"
                        },
                        "RouterOutletOptions": {
                            "location": "import",
                            "path": "../nav/nav-interface",
                            "id": "src/components/nav/nav-interface.ts::RouterOutletOptions"
                        }
                    },
                    "return": "Promise<boolean>"
                },
                "docs": {
                    "text": "",
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }]
                }
            },
            "setRouteId": {
                "complexType": {
                    "signature": "(id: string, params: ComponentProps | undefined, direction: RouterDirection, animation?: AnimationBuilder) => Promise<RouteWrite>",
                    "parameters": [{
                            "name": "id",
                            "type": "string",
                            "docs": ""
                        }, {
                            "name": "params",
                            "type": "ComponentProps | undefined",
                            "docs": ""
                        }, {
                            "name": "direction",
                            "type": "\"root\" | \"back\" | \"forward\"",
                            "docs": ""
                        }, {
                            "name": "animation",
                            "type": "AnimationBuilder | undefined",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "RouteWrite": {
                            "location": "import",
                            "path": "../router/utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouteWrite"
                        },
                        "ComponentProps": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::ComponentProps"
                        },
                        "RouterDirection": {
                            "location": "import",
                            "path": "../router/utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouterDirection"
                        },
                        "AnimationBuilder": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::AnimationBuilder"
                        }
                    },
                    "return": "Promise<RouteWrite>"
                },
                "docs": {
                    "text": "",
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }]
                }
            },
            "getRouteId": {
                "complexType": {
                    "signature": "() => Promise<RouteID | undefined>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "RouteID": {
                            "location": "import",
                            "path": "../router/utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouteID"
                        }
                    },
                    "return": "Promise<RouteID | undefined>"
                },
                "docs": {
                    "text": "",
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }]
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "swipeHandler",
                "methodName": "swipeHandlerChanged"
            }];
    }
}
