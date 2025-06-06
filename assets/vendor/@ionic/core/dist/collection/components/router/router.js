import { debounce } from "../../utils/helpers";
import { printIonError, printIonWarning } from "../../utils/logging/index";
import { ROUTER_INTENT_BACK, ROUTER_INTENT_FORWARD, ROUTER_INTENT_NONE } from "./utils/constants";
import { printRedirects, printRoutes } from "./utils/debug";
import { readNavState, waitUntilNavNode, writeNavState } from "./utils/dom";
import { findChainForIDs, findChainForSegments, findRouteRedirect } from "./utils/matching";
import { readRedirects, readRoutes } from "./utils/parser";
import { chainToSegments, generatePath, parsePath, readSegments, writeSegments } from "./utils/path";
export class Router {
    constructor() {
        this.previousPath = null;
        this.busy = false;
        this.state = 0;
        this.lastState = 0;
        this.root = '/';
        this.useHash = true;
    }
    async componentWillLoad() {
        await waitUntilNavNode();
        const canProceed = await this.runGuards(this.getSegments());
        if (canProceed !== true) {
            if (typeof canProceed === 'object') {
                const { redirect } = canProceed;
                const path = parsePath(redirect);
                this.setSegments(path.segments, ROUTER_INTENT_NONE, path.queryString);
                await this.writeNavStateRoot(path.segments, ROUTER_INTENT_NONE);
            }
        }
        else {
            await this.onRoutesChanged();
        }
    }
    componentDidLoad() {
        window.addEventListener('ionRouteRedirectChanged', debounce(this.onRedirectChanged.bind(this), 10));
        window.addEventListener('ionRouteDataChanged', debounce(this.onRoutesChanged.bind(this), 100));
    }
    async onPopState() {
        const direction = this.historyDirection();
        let segments = this.getSegments();
        const canProceed = await this.runGuards(segments);
        if (canProceed !== true) {
            if (typeof canProceed === 'object') {
                segments = parsePath(canProceed.redirect).segments;
            }
            else {
                return false;
            }
        }
        return this.writeNavStateRoot(segments, direction);
    }
    onBackButton(ev) {
        ev.detail.register(0, (processNextHandler) => {
            this.back();
            processNextHandler();
        });
    }
    /** @internal */
    async canTransition() {
        const canProceed = await this.runGuards();
        if (canProceed !== true) {
            if (typeof canProceed === 'object') {
                return canProceed.redirect;
            }
            else {
                return false;
            }
        }
        return true;
    }
    /**
     * Navigate to the specified path.
     *
     * @param path The path to navigate to.
     * @param direction The direction of the animation. Defaults to `"forward"`.
     */
    async push(path, direction = 'forward', animation) {
        var _a;
        if (path.startsWith('.')) {
            const currentPath = (_a = this.previousPath) !== null && _a !== void 0 ? _a : '/';
            // Convert currentPath to an URL by pre-pending a protocol and a host to resolve the relative path.
            const url = new URL(path, `https://host/${currentPath}`);
            path = url.pathname + url.search;
        }
        let parsedPath = parsePath(path);
        const canProceed = await this.runGuards(parsedPath.segments);
        if (canProceed !== true) {
            if (typeof canProceed === 'object') {
                parsedPath = parsePath(canProceed.redirect);
            }
            else {
                return false;
            }
        }
        this.setSegments(parsedPath.segments, direction, parsedPath.queryString);
        return this.writeNavStateRoot(parsedPath.segments, direction, animation);
    }
    /** Go back to previous page in the window.history. */
    back() {
        window.history.back();
        return Promise.resolve(this.waitPromise);
    }
    /** @internal */
    async printDebug() {
        printRoutes(readRoutes(this.el));
        printRedirects(readRedirects(this.el));
    }
    /** @internal */
    async navChanged(direction) {
        if (this.busy) {
            printIonWarning('[ion-router] - Router is busy, navChanged was cancelled.');
            return false;
        }
        const { ids, outlet } = await readNavState(window.document.body);
        const routes = readRoutes(this.el);
        const chain = findChainForIDs(ids, routes);
        if (!chain) {
            printIonWarning('[ion-router] - No matching URL for', ids.map((i) => i.id));
            return false;
        }
        const segments = chainToSegments(chain);
        if (!segments) {
            printIonWarning('[ion-router] - Router could not match path because some required param is missing.');
            return false;
        }
        this.setSegments(segments, direction);
        await this.safeWriteNavState(outlet, chain, ROUTER_INTENT_NONE, segments, null, ids.length);
        return true;
    }
    /** This handler gets called when a `ion-route-redirect` component is added to the DOM or if the from or to property of such node changes. */
    onRedirectChanged() {
        const segments = this.getSegments();
        if (segments && findRouteRedirect(segments, readRedirects(this.el))) {
            this.writeNavStateRoot(segments, ROUTER_INTENT_NONE);
        }
    }
    /** This handler gets called when a `ion-route` component is added to the DOM or if the from or to property of such node changes. */
    onRoutesChanged() {
        return this.writeNavStateRoot(this.getSegments(), ROUTER_INTENT_NONE);
    }
    historyDirection() {
        var _a;
        const win = window;
        if (win.history.state === null) {
            this.state++;
            win.history.replaceState(this.state, win.document.title, (_a = win.document.location) === null || _a === void 0 ? void 0 : _a.href);
        }
        const state = win.history.state;
        const lastState = this.lastState;
        this.lastState = state;
        if (state > lastState || (state >= lastState && lastState > 0)) {
            return ROUTER_INTENT_FORWARD;
        }
        if (state < lastState) {
            return ROUTER_INTENT_BACK;
        }
        return ROUTER_INTENT_NONE;
    }
    async writeNavStateRoot(segments, direction, animation) {
        if (!segments) {
            printIonError('[ion-router] - URL is not part of the routing set.');
            return false;
        }
        // lookup redirect rule
        const redirects = readRedirects(this.el);
        const redirect = findRouteRedirect(segments, redirects);
        let redirectFrom = null;
        if (redirect) {
            const { segments: toSegments, queryString } = redirect.to;
            this.setSegments(toSegments, direction, queryString);
            redirectFrom = redirect.from;
            segments = toSegments;
        }
        // lookup route chain
        const routes = readRoutes(this.el);
        const chain = findChainForSegments(segments, routes);
        if (!chain) {
            printIonError('[ion-router] - The path does not match any route.');
            return false;
        }
        // write DOM give
        return this.safeWriteNavState(document.body, chain, direction, segments, redirectFrom, 0, animation);
    }
    async safeWriteNavState(node, chain, direction, segments, redirectFrom, index = 0, animation) {
        const unlock = await this.lock();
        let changed = false;
        try {
            changed = await this.writeNavState(node, chain, direction, segments, redirectFrom, index, animation);
        }
        catch (e) {
            printIonError('[ion-router] - Exception in safeWriteNavState:', e);
        }
        unlock();
        return changed;
    }
    async lock() {
        const p = this.waitPromise;
        let resolve;
        this.waitPromise = new Promise((r) => (resolve = r));
        if (p !== undefined) {
            await p;
        }
        return resolve;
    }
    /**
     * Executes the beforeLeave hook of the source route and the beforeEnter hook of the target route if they exist.
     *
     * When the beforeLeave hook does not return true (to allow navigating) then that value is returned early and the beforeEnter is executed.
     * Otherwise the beforeEnterHook hook of the target route is executed.
     */
    async runGuards(to = this.getSegments(), from) {
        if (from === undefined) {
            from = parsePath(this.previousPath).segments;
        }
        if (!to || !from) {
            return true;
        }
        const routes = readRoutes(this.el);
        const fromChain = findChainForSegments(from, routes);
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const beforeLeaveHook = fromChain && fromChain[fromChain.length - 1].beforeLeave;
        const canLeave = beforeLeaveHook ? await beforeLeaveHook() : true;
        if (canLeave === false || typeof canLeave === 'object') {
            return canLeave;
        }
        const toChain = findChainForSegments(to, routes);
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const beforeEnterHook = toChain && toChain[toChain.length - 1].beforeEnter;
        return beforeEnterHook ? beforeEnterHook() : true;
    }
    async writeNavState(node, chain, direction, segments, redirectFrom, index = 0, animation) {
        if (this.busy) {
            printIonWarning('[ion-router] - Router is busy, transition was cancelled.');
            return false;
        }
        this.busy = true;
        // generate route event and emit will change
        const routeEvent = this.routeChangeEvent(segments, redirectFrom);
        if (routeEvent) {
            this.ionRouteWillChange.emit(routeEvent);
        }
        const changed = await writeNavState(node, chain, direction, index, false, animation);
        this.busy = false;
        // emit did change
        if (routeEvent) {
            this.ionRouteDidChange.emit(routeEvent);
        }
        return changed;
    }
    setSegments(segments, direction, queryString) {
        this.state++;
        writeSegments(window.history, this.root, this.useHash, segments, direction, this.state, queryString);
    }
    getSegments() {
        return readSegments(window.location, this.root, this.useHash);
    }
    routeChangeEvent(toSegments, redirectFromSegments) {
        const from = this.previousPath;
        const to = generatePath(toSegments);
        this.previousPath = to;
        if (to === from) {
            return null;
        }
        const redirectedFrom = redirectFromSegments ? generatePath(redirectFromSegments) : null;
        return {
            from,
            redirectedFrom,
            to,
        };
    }
    static get is() { return "ion-router"; }
    static get properties() {
        return {
            "root": {
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
                    "text": "The root path to use when matching URLs. By default, this is set to \"/\", but you can specify\nan alternate prefix for all URL paths."
                },
                "attribute": "root",
                "reflect": false,
                "defaultValue": "'/'"
            },
            "useHash": {
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
                    "text": "The router can work in two \"modes\":\n- With hash: `/index.html#/path/to/page`\n- Without hash: `/path/to/page`\n\nUsing one or another might depend in the requirements of your app and/or where it's deployed.\n\nUsually \"hash-less\" navigation works better for SEO and it's more user friendly too, but it might\nrequires additional server-side configuration in order to properly work.\n\nOn the other side hash-navigation is much easier to deploy, it even works over the file protocol.\n\nBy default, this property is `true`, change to `false` to allow hash-less URLs."
                },
                "attribute": "use-hash",
                "reflect": false,
                "defaultValue": "true"
            }
        };
    }
    static get events() {
        return [{
                "method": "ionRouteWillChange",
                "name": "ionRouteWillChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Event emitted when the route is about to change"
                },
                "complexType": {
                    "original": "RouterEventDetail",
                    "resolved": "RouterEventDetail",
                    "references": {
                        "RouterEventDetail": {
                            "location": "import",
                            "path": "./utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouterEventDetail"
                        }
                    }
                }
            }, {
                "method": "ionRouteDidChange",
                "name": "ionRouteDidChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the route had changed"
                },
                "complexType": {
                    "original": "RouterEventDetail",
                    "resolved": "RouterEventDetail",
                    "references": {
                        "RouterEventDetail": {
                            "location": "import",
                            "path": "./utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouterEventDetail"
                        }
                    }
                }
            }];
    }
    static get methods() {
        return {
            "canTransition": {
                "complexType": {
                    "signature": "() => Promise<string | boolean>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<string | boolean>"
                },
                "docs": {
                    "text": "",
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }]
                }
            },
            "push": {
                "complexType": {
                    "signature": "(path: string, direction?: RouterDirection, animation?: AnimationBuilder) => Promise<boolean>",
                    "parameters": [{
                            "name": "path",
                            "type": "string",
                            "docs": "The path to navigate to."
                        }, {
                            "name": "direction",
                            "type": "\"root\" | \"back\" | \"forward\"",
                            "docs": "The direction of the animation. Defaults to `\"forward\"`."
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
                        "RouterDirection": {
                            "location": "import",
                            "path": "./utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouterDirection"
                        },
                        "AnimationBuilder": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::AnimationBuilder"
                        }
                    },
                    "return": "Promise<boolean>"
                },
                "docs": {
                    "text": "Navigate to the specified path.",
                    "tags": [{
                            "name": "param",
                            "text": "path The path to navigate to."
                        }, {
                            "name": "param",
                            "text": "direction The direction of the animation. Defaults to `\"forward\"`."
                        }]
                }
            },
            "back": {
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
                    "text": "Go back to previous page in the window.history.",
                    "tags": []
                }
            },
            "printDebug": {
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
                    "text": "",
                    "tags": [{
                            "name": "internal",
                            "text": undefined
                        }]
                }
            },
            "navChanged": {
                "complexType": {
                    "signature": "(direction: RouterDirection) => Promise<boolean>",
                    "parameters": [{
                            "name": "direction",
                            "type": "\"root\" | \"back\" | \"forward\"",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "RouterDirection": {
                            "location": "import",
                            "path": "./utils/interface",
                            "id": "src/components/router/utils/interface.ts::RouterDirection"
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
            }
        };
    }
    static get elementRef() { return "el"; }
    static get listeners() {
        return [{
                "name": "popstate",
                "method": "onPopState",
                "target": "window",
                "capture": false,
                "passive": false
            }, {
                "name": "ionBackButton",
                "method": "onBackButton",
                "target": "document",
                "capture": false,
                "passive": false
            }];
    }
}
