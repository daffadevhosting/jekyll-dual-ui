/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { c as createAnimation } from './animation-8b25e105.js';
import { g as getIonPageElement } from './index-68c0d151.js';
import './index-cfd9c1f2.js';
import './index-a5d50daf.js';
import './index-527b9e34.js';
import './helpers-d94bc8ad.js';

const mdTransitionAnimation = (_, opts) => {
    var _a, _b, _c;
    const OFF_BOTTOM = '40px';
    const CENTER = '0px';
    const backDirection = opts.direction === 'back';
    const enteringEl = opts.enteringEl;
    const leavingEl = opts.leavingEl;
    const ionPageElement = getIonPageElement(enteringEl);
    const enteringToolbarEle = ionPageElement.querySelector('ion-toolbar');
    const rootTransition = createAnimation();
    rootTransition.addElement(ionPageElement).fill('both').beforeRemoveClass('ion-page-invisible');
    // animate the component itself
    if (backDirection) {
        rootTransition.duration(((_a = opts.duration) !== null && _a !== void 0 ? _a : 0) || 200).easing('cubic-bezier(0.47,0,0.745,0.715)');
    }
    else {
        rootTransition
            .duration(((_b = opts.duration) !== null && _b !== void 0 ? _b : 0) || 280)
            .easing('cubic-bezier(0.36,0.66,0.04,1)')
            .fromTo('transform', `translateY(${OFF_BOTTOM})`, `translateY(${CENTER})`)
            .fromTo('opacity', 0.01, 1);
    }
    // Animate toolbar if it's there
    if (enteringToolbarEle) {
        const enteringToolBar = createAnimation();
        enteringToolBar.addElement(enteringToolbarEle);
        rootTransition.addAnimation(enteringToolBar);
    }
    // setup leaving view
    if (leavingEl && backDirection) {
        // leaving content
        rootTransition.duration(((_c = opts.duration) !== null && _c !== void 0 ? _c : 0) || 200).easing('cubic-bezier(0.47,0,0.745,0.715)');
        const leavingPage = createAnimation();
        leavingPage
            .addElement(getIonPageElement(leavingEl))
            .onFinish((currentStep) => {
            if (currentStep === 1 && leavingPage.elements.length > 0) {
                leavingPage.elements[0].style.setProperty('display', 'none');
            }
        })
            .fromTo('transform', `translateY(${CENTER})`, `translateY(${OFF_BOTTOM})`)
            .fromTo('opacity', 1, 0);
        rootTransition.addAnimation(leavingPage);
    }
    return rootTransition;
};

export { mdTransitionAnimation };
