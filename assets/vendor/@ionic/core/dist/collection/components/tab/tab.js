/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { Build, Host, h } from "@stencil/core";
import { attachComponent } from "../../utils/framework-delegate";
import { printIonError } from "../../utils/logging/index";
export class Tab {
    constructor() {
        this.loaded = false;
        this.active = false;
        this.delegate = undefined;
        this.tab = undefined;
        this.component = undefined;
    }
    async componentWillLoad() {
        if (Build.isDev) {
            if (this.component !== undefined && this.el.childElementCount > 0) {
                printIonError('[ion-tab] - You can not use a lazy-loaded component in a tab and inlined content at the same time.' +
                    `- Remove the component attribute in: <ion-tab component="${this.component}">` +
                    ` or` +
                    `- Remove the embedded content inside the ion-tab: <ion-tab></ion-tab>`);
            }
        }
        if (this.active) {
            await this.setActive();
        }
    }
    /** Set the active component for the tab */
    async setActive() {
        await this.prepareLazyLoaded();
        this.active = true;
    }
    changeActive(isActive) {
        if (isActive) {
            this.prepareLazyLoaded();
        }
    }
    prepareLazyLoaded() {
        if (!this.loaded && this.component != null) {
            this.loaded = true;
            try {
                return attachComponent(this.delegate, this.el, this.component, ['ion-page']);
            }
            catch (e) {
                printIonError('[ion-tab] - Exception in prepareLazyLoaded:', e);
            }
        }
        return Promise.resolve(undefined);
    }
    render() {
        const { tab, active, component } = this;
        return (h(Host, { key: 'c36c113e74e12b58459df9e3b546ad4856187e90', role: "tabpanel", "aria-hidden": !active ? 'true' : null, "aria-labelledby": `tab-button-${tab}`, class: {
                'ion-page': component === undefined,
                'tab-hidden': !active,
            } }, h("slot", { key: '0d7821dac70ba7a12edfb3331988f3df1566cc1a' })));
    }
    static get is() { return "ion-tab"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["tab.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["tab.css"]
        };
    }
    static get properties() {
        return {
            "active": {
                "type": "boolean",
                "mutable": true,
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
                "attribute": "active",
                "reflect": false,
                "defaultValue": "false"
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
            "tab": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "A tab id must be provided for each `ion-tab`. It's used internally to reference\nthe selected tab or by the router to switch between them."
                },
                "attribute": "tab",
                "reflect": false
            },
            "component": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ComponentRef",
                    "resolved": "Function | HTMLElement | null | string | undefined",
                    "references": {
                        "ComponentRef": {
                            "location": "import",
                            "path": "../../interface",
                            "id": "src/interface.d.ts::ComponentRef"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The component to display inside of the tab."
                },
                "attribute": "component",
                "reflect": false
            }
        };
    }
    static get methods() {
        return {
            "setActive": {
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
                    "text": "Set the active component for the tab",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "active",
                "methodName": "changeActive"
            }];
    }
}
