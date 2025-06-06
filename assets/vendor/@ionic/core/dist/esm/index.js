/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
export { c as createAnimation } from './animation-8b25e105.js';
export { a as LIFECYCLE_DID_ENTER, c as LIFECYCLE_DID_LEAVE, L as LIFECYCLE_WILL_ENTER, b as LIFECYCLE_WILL_LEAVE, d as LIFECYCLE_WILL_UNLOAD, g as getIonPageElement } from './index-68c0d151.js';
export { iosTransitionAnimation } from './ios.transition-4047cb68.js';
export { mdTransitionAnimation } from './md.transition-30ce8d1b.js';
export { g as getTimeGivenProgression } from './cubic-bezier-fe2083dc.js';
export { createGesture } from './index-39782642.js';
export { g as getPlatforms, i as initialize, a as isPlatform } from './ionic-global-b26f573e.js';
export { c as componentOnReady } from './helpers-d94bc8ad.js';
export { L as LogLevel } from './index-cfd9c1f2.js';
export { I as IonicSafeString, g as getMode, s as setupConfig } from './config-9898ed97.js';
export { o as openURL } from './theme-01f3f29c.js';
export { m as menuController } from './index-18f31305.js';
export { b as actionSheetController, a as alertController, l as loadingController, m as modalController, p as pickerController, c as popoverController, t as toastController } from './overlays-d99dcb0a.js';
import './index-a5d50daf.js';
import './index-527b9e34.js';
import './gesture-controller-314a54f6.js';
import './hardware-back-button-a7eb8233.js';
import './framework-delegate-56b467ad.js';

const IonicSlides = (opts) => {
    const { swiper, extendParams } = opts;
    const slidesParams = {
        effect: undefined,
        direction: 'horizontal',
        initialSlide: 0,
        loop: false,
        parallax: false,
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 300,
        slidesPerColumn: 1,
        slidesPerColumnFill: 'column',
        slidesPerGroup: 1,
        centeredSlides: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        touchEventsTarget: 'container',
        freeMode: false,
        freeModeMomentum: true,
        freeModeMomentumRatio: 1,
        freeModeMomentumBounce: true,
        freeModeMomentumBounceRatio: 1,
        freeModeMomentumVelocityRatio: 1,
        freeModeSticky: false,
        freeModeMinimumVelocity: 0.02,
        autoHeight: false,
        setWrapperSize: false,
        zoom: {
            maxRatio: 3,
            minRatio: 1,
            toggle: false,
        },
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        touchStartPreventDefault: false,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: 0.5,
        longSwipesMs: 300,
        followFinger: true,
        threshold: 0,
        touchMoveStopPropagation: true,
        touchReleaseOnEdges: false,
        iOSEdgeSwipeDetection: false,
        iOSEdgeSwipeThreshold: 20,
        resistance: true,
        resistanceRatio: 0.85,
        watchSlidesProgress: false,
        watchSlidesVisibility: false,
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        loopAdditionalSlides: 0,
        noSwiping: true,
        runCallbacksOnInit: true,
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        flipEffect: {
            slideShadows: true,
            limitRotation: true,
        },
        cubeEffect: {
            slideShadows: true,
            shadow: true,
            shadowOffset: 20,
            shadowScale: 0.94,
        },
        fadeEffect: {
            crossFade: false,
        },
        a11y: {
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
            firstSlideMessage: 'This is the first slide',
            lastSlideMessage: 'This is the last slide',
        },
    };
    if (swiper.pagination) {
        slidesParams.pagination = {
            type: 'bullets',
            clickable: false,
            hideOnClick: false,
        };
    }
    if (swiper.scrollbar) {
        slidesParams.scrollbar = {
            hide: true,
        };
    }
    extendParams(slidesParams);
};

export { IonicSlides };
