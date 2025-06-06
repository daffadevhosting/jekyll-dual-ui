/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
'use strict';

const animation = require('./animation-ab2d3449.js');
const index = require('./index-1eff7149.js');
require('./index-cc858e97.js');
require('./index-c8d52405.js');
require('./index-2e236a04.js');
require('./helpers-8a48fdea.js');

const DURATION = 540;
// TODO(FW-2832): types
const getClonedElement = (tagName) => {
    return document.querySelector(`${tagName}.ion-cloned-element`);
};
const shadow = (el) => {
    return el.shadowRoot || el;
};
const getLargeTitle = (refEl) => {
    const tabs = refEl.tagName === 'ION-TABS' ? refEl : refEl.querySelector('ion-tabs');
    const query = 'ion-content ion-header:not(.header-collapse-condense-inactive) ion-title.title-large';
    if (tabs != null) {
        const activeTab = tabs.querySelector('ion-tab:not(.tab-hidden), .ion-page:not(.ion-page-hidden)');
        return activeTab != null ? activeTab.querySelector(query) : null;
    }
    return refEl.querySelector(query);
};
const getBackButton = (refEl, backDirection) => {
    const tabs = refEl.tagName === 'ION-TABS' ? refEl : refEl.querySelector('ion-tabs');
    let buttonsList = [];
    if (tabs != null) {
        const activeTab = tabs.querySelector('ion-tab:not(.tab-hidden), .ion-page:not(.ion-page-hidden)');
        if (activeTab != null) {
            buttonsList = activeTab.querySelectorAll('ion-buttons');
        }
    }
    else {
        buttonsList = refEl.querySelectorAll('ion-buttons');
    }
    for (const buttons of buttonsList) {
        const parentHeader = buttons.closest('ion-header');
        const activeHeader = parentHeader && !parentHeader.classList.contains('header-collapse-condense-inactive');
        const backButton = buttons.querySelector('ion-back-button');
        const buttonsCollapse = buttons.classList.contains('buttons-collapse');
        const startSlot = buttons.slot === 'start' || buttons.slot === '';
        if (backButton !== null && startSlot && ((buttonsCollapse && activeHeader && backDirection) || !buttonsCollapse)) {
            return backButton;
        }
    }
    return null;
};
const createLargeTitleTransition = (rootAnimation, rtl, backDirection, enteringEl, leavingEl) => {
    const enteringBackButton = getBackButton(enteringEl, backDirection);
    const leavingLargeTitle = getLargeTitle(leavingEl);
    const enteringLargeTitle = getLargeTitle(enteringEl);
    const leavingBackButton = getBackButton(leavingEl, backDirection);
    const shouldAnimationForward = enteringBackButton !== null && leavingLargeTitle !== null && !backDirection;
    const shouldAnimationBackward = enteringLargeTitle !== null && leavingBackButton !== null && backDirection;
    if (shouldAnimationForward) {
        const leavingLargeTitleBox = leavingLargeTitle.getBoundingClientRect();
        const enteringBackButtonBox = enteringBackButton.getBoundingClientRect();
        const enteringBackButtonTextEl = shadow(enteringBackButton).querySelector('.button-text');
        // Text element not rendered if developers pass text="" to the back button
        const enteringBackButtonTextBox = enteringBackButtonTextEl === null || enteringBackButtonTextEl === void 0 ? void 0 : enteringBackButtonTextEl.getBoundingClientRect();
        const leavingLargeTitleTextEl = shadow(leavingLargeTitle).querySelector('.toolbar-title');
        const leavingLargeTitleTextBox = leavingLargeTitleTextEl.getBoundingClientRect();
        animateLargeTitle(rootAnimation, rtl, backDirection, leavingLargeTitle, leavingLargeTitleBox, leavingLargeTitleTextBox, enteringBackButtonBox, enteringBackButtonTextEl, enteringBackButtonTextBox);
        animateBackButton(rootAnimation, rtl, backDirection, enteringBackButton, enteringBackButtonBox, enteringBackButtonTextEl, enteringBackButtonTextBox, leavingLargeTitle, leavingLargeTitleTextBox);
    }
    else if (shouldAnimationBackward) {
        const enteringLargeTitleBox = enteringLargeTitle.getBoundingClientRect();
        const leavingBackButtonBox = leavingBackButton.getBoundingClientRect();
        const leavingBackButtonTextEl = shadow(leavingBackButton).querySelector('.button-text');
        // Text element not rendered if developers pass text="" to the back button
        const leavingBackButtonTextBox = leavingBackButtonTextEl === null || leavingBackButtonTextEl === void 0 ? void 0 : leavingBackButtonTextEl.getBoundingClientRect();
        const enteringLargeTitleTextEl = shadow(enteringLargeTitle).querySelector('.toolbar-title');
        const enteringLargeTitleTextBox = enteringLargeTitleTextEl.getBoundingClientRect();
        animateLargeTitle(rootAnimation, rtl, backDirection, enteringLargeTitle, enteringLargeTitleBox, enteringLargeTitleTextBox, leavingBackButtonBox, leavingBackButtonTextEl, leavingBackButtonTextBox);
        animateBackButton(rootAnimation, rtl, backDirection, leavingBackButton, leavingBackButtonBox, leavingBackButtonTextEl, leavingBackButtonTextBox, enteringLargeTitle, enteringLargeTitleTextBox);
    }
    return {
        forward: shouldAnimationForward,
        backward: shouldAnimationBackward,
    };
};
const animateBackButton = (rootAnimation, rtl, backDirection, backButtonEl, backButtonBox, backButtonTextEl, backButtonTextBox, largeTitleEl, largeTitleTextBox) => {
    var _a, _b;
    const BACK_BUTTON_START_OFFSET = rtl ? `calc(100% - ${backButtonBox.right + 4}px)` : `${backButtonBox.left - 4}px`;
    const TEXT_ORIGIN_X = rtl ? 'right' : 'left';
    const ICON_ORIGIN_X = rtl ? 'left' : 'right';
    const CONTAINER_ORIGIN_X = rtl ? 'right' : 'left';
    let WIDTH_SCALE = 1;
    let HEIGHT_SCALE = 1;
    let TEXT_START_SCALE = `scale(${HEIGHT_SCALE})`;
    const TEXT_END_SCALE = 'scale(1)';
    if (backButtonTextEl && backButtonTextBox) {
        /**
         * When the title and back button texts match then they should overlap during the
         * page transition. If the texts do not match up then the back button text scale
         * adjusts to not perfectly match the large title text otherwise the proportions
         * will be incorrect. When the texts match we scale both the width and height to
         * account for font weight differences between the title and back button.
         */
        const doTitleAndButtonTextsMatch = ((_a = backButtonTextEl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === ((_b = largeTitleEl.textContent) === null || _b === void 0 ? void 0 : _b.trim());
        WIDTH_SCALE = largeTitleTextBox.width / backButtonTextBox.width;
        /**
         * Subtract an offset to account for slight sizing/padding differences between the
         * title and the back button.
         */
        HEIGHT_SCALE = (largeTitleTextBox.height - LARGE_TITLE_SIZE_OFFSET) / backButtonTextBox.height;
        /**
         * Even though we set TEXT_START_SCALE to HEIGHT_SCALE above, we potentially need
         * to re-compute this here since the HEIGHT_SCALE may have changed.
         */
        TEXT_START_SCALE = doTitleAndButtonTextsMatch ? `scale(${WIDTH_SCALE}, ${HEIGHT_SCALE})` : `scale(${HEIGHT_SCALE})`;
    }
    const backButtonIconEl = shadow(backButtonEl).querySelector('ion-icon');
    const backButtonIconBox = backButtonIconEl.getBoundingClientRect();
    /**
     * We need to offset the container by the icon dimensions
     * so that the back button text aligns with the large title
     * text. Otherwise, the back button icon will align with the
     * large title text but the back button text will not.
     */
    const CONTAINER_START_TRANSLATE_X = rtl
        ? `${backButtonIconBox.width / 2 - (backButtonIconBox.right - backButtonBox.right)}px`
        : `${backButtonBox.left - backButtonIconBox.width / 2}px`;
    const CONTAINER_END_TRANSLATE_X = rtl ? `-${window.innerWidth - backButtonBox.right}px` : `${backButtonBox.left}px`;
    /**
     * Back button container should be
     * aligned to the top of the title container
     * so the texts overlap as the back button
     * text begins to fade in.
     */
    const CONTAINER_START_TRANSLATE_Y = `${largeTitleTextBox.top}px`;
    /**
     * The cloned back button should align exactly with the
     * real back button on the entering page otherwise there will
     * be a layout shift.
     */
    const CONTAINER_END_TRANSLATE_Y = `${backButtonBox.top}px`;
    /**
     * In the forward direction, the cloned back button
     * container should translate from over the large title
     * to over the back button. In the backward direction,
     * it should translate from over the back button to over
     * the large title.
     */
    const FORWARD_CONTAINER_KEYFRAMES = [
        { offset: 0, transform: `translate3d(${CONTAINER_START_TRANSLATE_X}, ${CONTAINER_START_TRANSLATE_Y}, 0)` },
        { offset: 1, transform: `translate3d(${CONTAINER_END_TRANSLATE_X}, ${CONTAINER_END_TRANSLATE_Y}, 0)` },
    ];
    const BACKWARD_CONTAINER_KEYFRAMES = [
        { offset: 0, transform: `translate3d(${CONTAINER_END_TRANSLATE_X}, ${CONTAINER_END_TRANSLATE_Y}, 0)` },
        { offset: 1, transform: `translate3d(${CONTAINER_START_TRANSLATE_X}, ${CONTAINER_START_TRANSLATE_Y}, 0)` },
    ];
    const CONTAINER_KEYFRAMES = backDirection ? BACKWARD_CONTAINER_KEYFRAMES : FORWARD_CONTAINER_KEYFRAMES;
    /**
     * In the forward direction, the text in the cloned back button
     * should start to be (roughly) the size of the large title
     * and then scale down to be the size of the actual back button.
     * The text should also translate, but that translate is handled
     * by the container keyframes.
     */
    const FORWARD_TEXT_KEYFRAMES = [
        { offset: 0, opacity: 0, transform: TEXT_START_SCALE },
        { offset: 1, opacity: 1, transform: TEXT_END_SCALE },
    ];
    const BACKWARD_TEXT_KEYFRAMES = [
        { offset: 0, opacity: 1, transform: TEXT_END_SCALE },
        { offset: 1, opacity: 0, transform: TEXT_START_SCALE },
    ];
    const TEXT_KEYFRAMES = backDirection ? BACKWARD_TEXT_KEYFRAMES : FORWARD_TEXT_KEYFRAMES;
    /**
     * The icon should scale in/out in the second
     * half of the animation. The icon should also
     * translate, but that translate is handled by the
     * container keyframes.
     */
    const FORWARD_ICON_KEYFRAMES = [
        { offset: 0, opacity: 0, transform: 'scale(0.6)' },
        { offset: 0.6, opacity: 0, transform: 'scale(0.6)' },
        { offset: 1, opacity: 1, transform: 'scale(1)' },
    ];
    const BACKWARD_ICON_KEYFRAMES = [
        { offset: 0, opacity: 1, transform: 'scale(1)' },
        { offset: 0.2, opacity: 0, transform: 'scale(0.6)' },
        { offset: 1, opacity: 0, transform: 'scale(0.6)' },
    ];
    const ICON_KEYFRAMES = backDirection ? BACKWARD_ICON_KEYFRAMES : FORWARD_ICON_KEYFRAMES;
    const enteringBackButtonTextAnimation = animation.createAnimation();
    const enteringBackButtonIconAnimation = animation.createAnimation();
    const enteringBackButtonAnimation = animation.createAnimation();
    const clonedBackButtonEl = getClonedElement('ion-back-button');
    const clonedBackButtonTextEl = shadow(clonedBackButtonEl).querySelector('.button-text');
    const clonedBackButtonIconEl = shadow(clonedBackButtonEl).querySelector('ion-icon');
    clonedBackButtonEl.text = backButtonEl.text;
    clonedBackButtonEl.mode = backButtonEl.mode;
    clonedBackButtonEl.icon = backButtonEl.icon;
    clonedBackButtonEl.color = backButtonEl.color;
    clonedBackButtonEl.disabled = backButtonEl.disabled;
    clonedBackButtonEl.style.setProperty('display', 'block');
    clonedBackButtonEl.style.setProperty('position', 'fixed');
    enteringBackButtonIconAnimation.addElement(clonedBackButtonIconEl);
    enteringBackButtonTextAnimation.addElement(clonedBackButtonTextEl);
    enteringBackButtonAnimation.addElement(clonedBackButtonEl);
    enteringBackButtonAnimation
        .beforeStyles({
        position: 'absolute',
        top: '0px',
        [CONTAINER_ORIGIN_X]: '0px',
    })
        /**
         * The write hooks must be set on this animation as it is guaranteed to run. Other
         * animations such as the back button text animation will not run if the back button
         * has no visible text.
         */
        .beforeAddWrite(() => {
        backButtonEl.style.setProperty('display', 'none');
        clonedBackButtonEl.style.setProperty(TEXT_ORIGIN_X, BACK_BUTTON_START_OFFSET);
    })
        .afterAddWrite(() => {
        backButtonEl.style.setProperty('display', '');
        clonedBackButtonEl.style.setProperty('display', 'none');
        clonedBackButtonEl.style.removeProperty(TEXT_ORIGIN_X);
    })
        .keyframes(CONTAINER_KEYFRAMES);
    enteringBackButtonTextAnimation
        .beforeStyles({
        'transform-origin': `${TEXT_ORIGIN_X} top`,
    })
        .keyframes(TEXT_KEYFRAMES);
    enteringBackButtonIconAnimation
        .beforeStyles({
        'transform-origin': `${ICON_ORIGIN_X} center`,
    })
        .keyframes(ICON_KEYFRAMES);
    rootAnimation.addAnimation([
        enteringBackButtonTextAnimation,
        enteringBackButtonIconAnimation,
        enteringBackButtonAnimation,
    ]);
};
const animateLargeTitle = (rootAnimation, rtl, backDirection, largeTitleEl, largeTitleBox, largeTitleTextBox, backButtonBox, backButtonTextEl, backButtonTextBox) => {
    var _a, _b;
    /**
     * The horizontal transform origin for the large title
     */
    const ORIGIN_X = rtl ? 'right' : 'left';
    const TITLE_START_OFFSET = rtl ? `calc(100% - ${largeTitleBox.right}px)` : `${largeTitleBox.left}px`;
    /**
     * The cloned large should align exactly with the
     * real large title on the leaving page otherwise there will
     * be a layout shift.
     */
    const START_TRANSLATE_X = '0px';
    const START_TRANSLATE_Y = `${largeTitleBox.top}px`;
    /**
     * How much to offset the large title translation by.
     * This accounts for differences in sizing between the large
     * title and the back button due to padding and font weight.
     */
    const LARGE_TITLE_TRANSLATION_OFFSET = 8;
    let END_TRANSLATE_X = rtl
        ? `-${window.innerWidth - backButtonBox.right - LARGE_TITLE_TRANSLATION_OFFSET}px`
        : `${backButtonBox.x + LARGE_TITLE_TRANSLATION_OFFSET}px`;
    /**
     * How much to scale the large title up/down by.
     */
    let HEIGHT_SCALE = 0.5;
    /**
     * The large title always starts full size.
     */
    const START_SCALE = 'scale(1)';
    /**
     * By default, we don't worry about having the large title scaled to perfectly
     * match the back button because we don't know if the back button's text matches
     * the large title's text.
     */
    let END_SCALE = `scale(${HEIGHT_SCALE})`;
    // Text element not rendered if developers pass text="" to the back button
    if (backButtonTextEl && backButtonTextBox) {
        /**
         * The scaled title should (roughly) overlap the back button. This ensures that
         * the back button and title overlap during the animation. Note that since both
         * elements either fade in or fade out over the course of the animation, neither
         * element will be fully visible on top of the other. As a result, the overlap
         * does not need to be perfect, so approximate values are acceptable here.
         */
        END_TRANSLATE_X = rtl
            ? `-${window.innerWidth - backButtonTextBox.right - LARGE_TITLE_TRANSLATION_OFFSET}px`
            : `${backButtonTextBox.x - LARGE_TITLE_TRANSLATION_OFFSET}px`;
        /**
         * In the forward direction, the large title should start at its normal size and
         * then scale down to be (roughly) the size of the back button on the other view.
         * In the backward direction, the large title should start at (roughly) the size
         * of the back button and then scale up to its original size.
         * Note that since both elements either fade in or fade out over the course of the
         * animation, neither element will be fully visible on top of the other. As a result,
         * the overlap  does not need to be perfect, so approximate values are acceptable here.
         */
        /**
         * When the title and back button texts match then they should overlap during the
         * page transition. If the texts do not match up then the large title text scale
         * adjusts to not perfectly match the back button text otherwise the proportions
         * will be incorrect. When the texts match we scale both the width and height to
         * account for font weight differences between the title and back button.
         */
        const doTitleAndButtonTextsMatch = ((_a = backButtonTextEl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === ((_b = largeTitleEl.textContent) === null || _b === void 0 ? void 0 : _b.trim());
        const WIDTH_SCALE = backButtonTextBox.width / largeTitleTextBox.width;
        HEIGHT_SCALE = backButtonTextBox.height / (largeTitleTextBox.height - LARGE_TITLE_SIZE_OFFSET);
        /**
         * Even though we set TEXT_START_SCALE to HEIGHT_SCALE above, we potentially need
         * to re-compute this here since the HEIGHT_SCALE may have changed.
         */
        END_SCALE = doTitleAndButtonTextsMatch ? `scale(${WIDTH_SCALE}, ${HEIGHT_SCALE})` : `scale(${HEIGHT_SCALE})`;
    }
    /**
     * The midpoints of the back button and the title should align such that the back
     * button and title appear to be centered with each other.
     */
    const backButtonMidPoint = backButtonBox.top + backButtonBox.height / 2;
    const titleMidPoint = (largeTitleBox.height * HEIGHT_SCALE) / 2;
    const END_TRANSLATE_Y = `${backButtonMidPoint - titleMidPoint}px`;
    const BACKWARDS_KEYFRAMES = [
        { offset: 0, opacity: 0, transform: `translate3d(${END_TRANSLATE_X}, ${END_TRANSLATE_Y}, 0) ${END_SCALE}` },
        { offset: 0.1, opacity: 0 },
        { offset: 1, opacity: 1, transform: `translate3d(${START_TRANSLATE_X}, ${START_TRANSLATE_Y}, 0) ${START_SCALE}` },
    ];
    const FORWARDS_KEYFRAMES = [
        {
            offset: 0,
            opacity: 0.99,
            transform: `translate3d(${START_TRANSLATE_X}, ${START_TRANSLATE_Y}, 0) ${START_SCALE}`,
        },
        { offset: 0.6, opacity: 0 },
        { offset: 1, opacity: 0, transform: `translate3d(${END_TRANSLATE_X}, ${END_TRANSLATE_Y}, 0) ${END_SCALE}` },
    ];
    const KEYFRAMES = backDirection ? BACKWARDS_KEYFRAMES : FORWARDS_KEYFRAMES;
    const clonedTitleEl = getClonedElement('ion-title');
    const clonedLargeTitleAnimation = animation.createAnimation();
    clonedTitleEl.innerText = largeTitleEl.innerText;
    clonedTitleEl.size = largeTitleEl.size;
    clonedTitleEl.color = largeTitleEl.color;
    clonedLargeTitleAnimation.addElement(clonedTitleEl);
    clonedLargeTitleAnimation
        .beforeStyles({
        'transform-origin': `${ORIGIN_X} top`,
        /**
         * Since font size changes will cause
         * the dimension of the large title to change
         * we need to set the cloned title height
         * equal to that of the original large title height.
         */
        height: `${largeTitleBox.height}px`,
        display: '',
        position: 'relative',
        [ORIGIN_X]: TITLE_START_OFFSET,
    })
        .beforeAddWrite(() => {
        largeTitleEl.style.setProperty('opacity', '0');
    })
        .afterAddWrite(() => {
        largeTitleEl.style.setProperty('opacity', '');
        clonedTitleEl.style.setProperty('display', 'none');
    })
        .keyframes(KEYFRAMES);
    rootAnimation.addAnimation(clonedLargeTitleAnimation);
};
const iosTransitionAnimation = (navEl, opts) => {
    var _a;
    try {
        const EASING = 'cubic-bezier(0.32,0.72,0,1)';
        const OPACITY = 'opacity';
        const TRANSFORM = 'transform';
        const CENTER = '0%';
        const OFF_OPACITY = 0.8;
        const isRTL = navEl.ownerDocument.dir === 'rtl';
        const OFF_RIGHT = isRTL ? '-99.5%' : '99.5%';
        const OFF_LEFT = isRTL ? '33%' : '-33%';
        const enteringEl = opts.enteringEl;
        const leavingEl = opts.leavingEl;
        const backDirection = opts.direction === 'back';
        const contentEl = enteringEl.querySelector(':scope > ion-content');
        const headerEls = enteringEl.querySelectorAll(':scope > ion-header > *:not(ion-toolbar), :scope > ion-footer > *');
        const enteringToolBarEls = enteringEl.querySelectorAll(':scope > ion-header > ion-toolbar');
        const rootAnimation = animation.createAnimation();
        const enteringContentAnimation = animation.createAnimation();
        rootAnimation
            .addElement(enteringEl)
            .duration(((_a = opts.duration) !== null && _a !== void 0 ? _a : 0) || DURATION)
            .easing(opts.easing || EASING)
            .fill('both')
            .beforeRemoveClass('ion-page-invisible');
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (leavingEl && navEl !== null && navEl !== undefined) {
            const navDecorAnimation = animation.createAnimation();
            navDecorAnimation.addElement(navEl);
            rootAnimation.addAnimation(navDecorAnimation);
        }
        if (!contentEl && enteringToolBarEls.length === 0 && headerEls.length === 0) {
            enteringContentAnimation.addElement(enteringEl.querySelector(':scope > .ion-page, :scope > ion-nav, :scope > ion-tabs')); // REVIEW
        }
        else {
            enteringContentAnimation.addElement(contentEl); // REVIEW
            enteringContentAnimation.addElement(headerEls);
        }
        rootAnimation.addAnimation(enteringContentAnimation);
        if (backDirection) {
            enteringContentAnimation
                .beforeClearStyles([OPACITY])
                .fromTo('transform', `translateX(${OFF_LEFT})`, `translateX(${CENTER})`)
                .fromTo(OPACITY, OFF_OPACITY, 1);
        }
        else {
            // entering content, forward direction
            enteringContentAnimation
                .beforeClearStyles([OPACITY])
                .fromTo('transform', `translateX(${OFF_RIGHT})`, `translateX(${CENTER})`);
        }
        if (contentEl) {
            const enteringTransitionEffectEl = shadow(contentEl).querySelector('.transition-effect');
            if (enteringTransitionEffectEl) {
                const enteringTransitionCoverEl = enteringTransitionEffectEl.querySelector('.transition-cover');
                const enteringTransitionShadowEl = enteringTransitionEffectEl.querySelector('.transition-shadow');
                const enteringTransitionEffect = animation.createAnimation();
                const enteringTransitionCover = animation.createAnimation();
                const enteringTransitionShadow = animation.createAnimation();
                enteringTransitionEffect
                    .addElement(enteringTransitionEffectEl)
                    .beforeStyles({ opacity: '1', display: 'block' })
                    .afterStyles({ opacity: '', display: '' });
                enteringTransitionCover
                    .addElement(enteringTransitionCoverEl) // REVIEW
                    .beforeClearStyles([OPACITY])
                    .fromTo(OPACITY, 0, 0.1);
                enteringTransitionShadow
                    .addElement(enteringTransitionShadowEl) // REVIEW
                    .beforeClearStyles([OPACITY])
                    .fromTo(OPACITY, 0.03, 0.7);
                enteringTransitionEffect.addAnimation([enteringTransitionCover, enteringTransitionShadow]);
                enteringContentAnimation.addAnimation([enteringTransitionEffect]);
            }
        }
        const enteringContentHasLargeTitle = enteringEl.querySelector('ion-header.header-collapse-condense');
        const { forward, backward } = createLargeTitleTransition(rootAnimation, isRTL, backDirection, enteringEl, leavingEl);
        enteringToolBarEls.forEach((enteringToolBarEl) => {
            const enteringToolBar = animation.createAnimation();
            enteringToolBar.addElement(enteringToolBarEl);
            rootAnimation.addAnimation(enteringToolBar);
            const enteringTitle = animation.createAnimation();
            enteringTitle.addElement(enteringToolBarEl.querySelector('ion-title')); // REVIEW
            const enteringToolBarButtons = animation.createAnimation();
            const buttons = Array.from(enteringToolBarEl.querySelectorAll('ion-buttons,[menuToggle]'));
            const parentHeader = enteringToolBarEl.closest('ion-header');
            const inactiveHeader = parentHeader === null || parentHeader === void 0 ? void 0 : parentHeader.classList.contains('header-collapse-condense-inactive');
            let buttonsToAnimate;
            if (backDirection) {
                buttonsToAnimate = buttons.filter((button) => {
                    const isCollapseButton = button.classList.contains('buttons-collapse');
                    return (isCollapseButton && !inactiveHeader) || !isCollapseButton;
                });
            }
            else {
                buttonsToAnimate = buttons.filter((button) => !button.classList.contains('buttons-collapse'));
            }
            enteringToolBarButtons.addElement(buttonsToAnimate);
            const enteringToolBarItems = animation.createAnimation();
            enteringToolBarItems.addElement(enteringToolBarEl.querySelectorAll(':scope > *:not(ion-title):not(ion-buttons):not([menuToggle])'));
            const enteringToolBarBg = animation.createAnimation();
            enteringToolBarBg.addElement(shadow(enteringToolBarEl).querySelector('.toolbar-background')); // REVIEW
            const enteringBackButton = animation.createAnimation();
            const backButtonEl = enteringToolBarEl.querySelector('ion-back-button');
            if (backButtonEl) {
                enteringBackButton.addElement(backButtonEl);
            }
            enteringToolBar.addAnimation([
                enteringTitle,
                enteringToolBarButtons,
                enteringToolBarItems,
                enteringToolBarBg,
                enteringBackButton,
            ]);
            enteringToolBarButtons.fromTo(OPACITY, 0.01, 1);
            enteringToolBarItems.fromTo(OPACITY, 0.01, 1);
            if (backDirection) {
                if (!inactiveHeader) {
                    enteringTitle
                        .fromTo('transform', `translateX(${OFF_LEFT})`, `translateX(${CENTER})`)
                        .fromTo(OPACITY, 0.01, 1);
                }
                enteringToolBarItems.fromTo('transform', `translateX(${OFF_LEFT})`, `translateX(${CENTER})`);
                // back direction, entering page has a back button
                enteringBackButton.fromTo(OPACITY, 0.01, 1);
            }
            else {
                // entering toolbar, forward direction
                if (!enteringContentHasLargeTitle) {
                    enteringTitle
                        .fromTo('transform', `translateX(${OFF_RIGHT})`, `translateX(${CENTER})`)
                        .fromTo(OPACITY, 0.01, 1);
                }
                enteringToolBarItems.fromTo('transform', `translateX(${OFF_RIGHT})`, `translateX(${CENTER})`);
                enteringToolBarBg.beforeClearStyles([OPACITY, 'transform']);
                const translucentHeader = parentHeader === null || parentHeader === void 0 ? void 0 : parentHeader.translucent;
                if (!translucentHeader) {
                    enteringToolBarBg.fromTo(OPACITY, 0.01, 'var(--opacity)');
                }
                else {
                    enteringToolBarBg.fromTo('transform', isRTL ? 'translateX(-100%)' : 'translateX(100%)', 'translateX(0px)');
                }
                // forward direction, entering page has a back button
                if (!forward) {
                    enteringBackButton.fromTo(OPACITY, 0.01, 1);
                }
                if (backButtonEl && !forward) {
                    const enteringBackBtnText = animation.createAnimation();
                    enteringBackBtnText
                        .addElement(shadow(backButtonEl).querySelector('.button-text')) // REVIEW
                        .fromTo(`transform`, isRTL ? 'translateX(-100px)' : 'translateX(100px)', 'translateX(0px)');
                    enteringToolBar.addAnimation(enteringBackBtnText);
                }
            }
        });
        // setup leaving view
        if (leavingEl) {
            const leavingContent = animation.createAnimation();
            const leavingContentEl = leavingEl.querySelector(':scope > ion-content');
            const leavingToolBarEls = leavingEl.querySelectorAll(':scope > ion-header > ion-toolbar');
            const leavingHeaderEls = leavingEl.querySelectorAll(':scope > ion-header > *:not(ion-toolbar), :scope > ion-footer > *');
            if (!leavingContentEl && leavingToolBarEls.length === 0 && leavingHeaderEls.length === 0) {
                leavingContent.addElement(leavingEl.querySelector(':scope > .ion-page, :scope > ion-nav, :scope > ion-tabs')); // REVIEW
            }
            else {
                leavingContent.addElement(leavingContentEl); // REVIEW
                leavingContent.addElement(leavingHeaderEls);
            }
            rootAnimation.addAnimation(leavingContent);
            if (backDirection) {
                // leaving content, back direction
                leavingContent
                    .beforeClearStyles([OPACITY])
                    .fromTo('transform', `translateX(${CENTER})`, isRTL ? 'translateX(-100%)' : 'translateX(100%)');
                const leavingPage = index.getIonPageElement(leavingEl);
                rootAnimation.afterAddWrite(() => {
                    if (rootAnimation.getDirection() === 'normal') {
                        leavingPage.style.setProperty('display', 'none');
                    }
                });
            }
            else {
                // leaving content, forward direction
                leavingContent
                    .fromTo('transform', `translateX(${CENTER})`, `translateX(${OFF_LEFT})`)
                    .fromTo(OPACITY, 1, OFF_OPACITY);
            }
            if (leavingContentEl) {
                const leavingTransitionEffectEl = shadow(leavingContentEl).querySelector('.transition-effect');
                if (leavingTransitionEffectEl) {
                    const leavingTransitionCoverEl = leavingTransitionEffectEl.querySelector('.transition-cover');
                    const leavingTransitionShadowEl = leavingTransitionEffectEl.querySelector('.transition-shadow');
                    const leavingTransitionEffect = animation.createAnimation();
                    const leavingTransitionCover = animation.createAnimation();
                    const leavingTransitionShadow = animation.createAnimation();
                    leavingTransitionEffect
                        .addElement(leavingTransitionEffectEl)
                        .beforeStyles({ opacity: '1', display: 'block' })
                        .afterStyles({ opacity: '', display: '' });
                    leavingTransitionCover
                        .addElement(leavingTransitionCoverEl) // REVIEW
                        .beforeClearStyles([OPACITY])
                        .fromTo(OPACITY, 0.1, 0);
                    leavingTransitionShadow
                        .addElement(leavingTransitionShadowEl) // REVIEW
                        .beforeClearStyles([OPACITY])
                        .fromTo(OPACITY, 0.7, 0.03);
                    leavingTransitionEffect.addAnimation([leavingTransitionCover, leavingTransitionShadow]);
                    leavingContent.addAnimation([leavingTransitionEffect]);
                }
            }
            leavingToolBarEls.forEach((leavingToolBarEl) => {
                const leavingToolBar = animation.createAnimation();
                leavingToolBar.addElement(leavingToolBarEl);
                const leavingTitle = animation.createAnimation();
                leavingTitle.addElement(leavingToolBarEl.querySelector('ion-title')); // REVIEW
                const leavingToolBarButtons = animation.createAnimation();
                const buttons = leavingToolBarEl.querySelectorAll('ion-buttons,[menuToggle]');
                const parentHeader = leavingToolBarEl.closest('ion-header');
                const inactiveHeader = parentHeader === null || parentHeader === void 0 ? void 0 : parentHeader.classList.contains('header-collapse-condense-inactive');
                const buttonsToAnimate = Array.from(buttons).filter((button) => {
                    const isCollapseButton = button.classList.contains('buttons-collapse');
                    return (isCollapseButton && !inactiveHeader) || !isCollapseButton;
                });
                leavingToolBarButtons.addElement(buttonsToAnimate);
                const leavingToolBarItems = animation.createAnimation();
                const leavingToolBarItemEls = leavingToolBarEl.querySelectorAll(':scope > *:not(ion-title):not(ion-buttons):not([menuToggle])');
                if (leavingToolBarItemEls.length > 0) {
                    leavingToolBarItems.addElement(leavingToolBarItemEls);
                }
                const leavingToolBarBg = animation.createAnimation();
                leavingToolBarBg.addElement(shadow(leavingToolBarEl).querySelector('.toolbar-background')); // REVIEW
                const leavingBackButton = animation.createAnimation();
                const backButtonEl = leavingToolBarEl.querySelector('ion-back-button');
                if (backButtonEl) {
                    leavingBackButton.addElement(backButtonEl);
                }
                leavingToolBar.addAnimation([
                    leavingTitle,
                    leavingToolBarButtons,
                    leavingToolBarItems,
                    leavingBackButton,
                    leavingToolBarBg,
                ]);
                rootAnimation.addAnimation(leavingToolBar);
                // fade out leaving toolbar items
                leavingBackButton.fromTo(OPACITY, 0.99, 0);
                leavingToolBarButtons.fromTo(OPACITY, 0.99, 0);
                leavingToolBarItems.fromTo(OPACITY, 0.99, 0);
                if (backDirection) {
                    if (!inactiveHeader) {
                        // leaving toolbar, back direction
                        leavingTitle
                            .fromTo('transform', `translateX(${CENTER})`, isRTL ? 'translateX(-100%)' : 'translateX(100%)')
                            .fromTo(OPACITY, 0.99, 0);
                    }
                    leavingToolBarItems.fromTo('transform', `translateX(${CENTER})`, isRTL ? 'translateX(-100%)' : 'translateX(100%)');
                    leavingToolBarBg.beforeClearStyles([OPACITY, 'transform']);
                    // leaving toolbar, back direction, and there's no entering toolbar
                    // should just slide out, no fading out
                    const translucentHeader = parentHeader === null || parentHeader === void 0 ? void 0 : parentHeader.translucent;
                    if (!translucentHeader) {
                        leavingToolBarBg.fromTo(OPACITY, 'var(--opacity)', 0);
                    }
                    else {
                        leavingToolBarBg.fromTo('transform', 'translateX(0px)', isRTL ? 'translateX(-100%)' : 'translateX(100%)');
                    }
                    if (backButtonEl && !backward) {
                        const leavingBackBtnText = animation.createAnimation();
                        leavingBackBtnText
                            .addElement(shadow(backButtonEl).querySelector('.button-text')) // REVIEW
                            .fromTo('transform', `translateX(${CENTER})`, `translateX(${(isRTL ? -124 : 124) + 'px'})`);
                        leavingToolBar.addAnimation(leavingBackBtnText);
                    }
                }
                else {
                    // leaving toolbar, forward direction
                    if (!inactiveHeader) {
                        leavingTitle
                            .fromTo('transform', `translateX(${CENTER})`, `translateX(${OFF_LEFT})`)
                            .fromTo(OPACITY, 0.99, 0)
                            .afterClearStyles([TRANSFORM, OPACITY]);
                    }
                    leavingToolBarItems
                        .fromTo('transform', `translateX(${CENTER})`, `translateX(${OFF_LEFT})`)
                        .afterClearStyles([TRANSFORM, OPACITY]);
                    leavingBackButton.afterClearStyles([OPACITY]);
                    leavingTitle.afterClearStyles([OPACITY]);
                    leavingToolBarButtons.afterClearStyles([OPACITY]);
                }
            });
        }
        return rootAnimation;
    }
    catch (err) {
        throw err;
    }
};
/**
 * The scale of the back button during the animation
 * is computed based on the scale of the large title
 * and vice versa. However, we need to account for slight
 * variations in the size of the large title due to
 * padding and font weight. This value should be used to subtract
 * a small amount from the large title height when computing scales
 * to get more accurate scale results.
 */
const LARGE_TITLE_SIZE_OFFSET = 10;

exports.iosTransitionAnimation = iosTransitionAnimation;
exports.shadow = shadow;
