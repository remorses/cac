// @ts-nocheck
/* eslint-disable */
'use client';
import { stdin_default, } from './chunk-OEY7F3LW.js';
import './chunk-WNPAEZHB.js';
import './chunk-KWNUSLWD.js';

// https :https://framerusercontent.com/modules/A4cMUx8LtG8c2WGjeyfL/m3bgBEcS9iFJFApu0M0C/LirT6SjMX.js
import { jsx as _jsx, jsxs as _jsxs, } from 'react/jsx-runtime';
import {
  addFonts,
  addPropertyControls,
  ComponentViewportProvider,
  ControlType,
  cx,
  getFonts,
  getFontsFromSharedStyle,
  Image,
  RichText,
  useComponentViewport,
  useLocaleInfo,
  useVariantState,
  withCSS,
  withFX,
} from 'unframer';
import { LayoutGroup, motion, MotionConfigContext, } from 'unframer';
import * as React from 'react';

// https :https://framerusercontent.com/modules/pKJd0Qi3zdhzJ6E3DaKg/RJVldUObpL1nZxjjsr66/fCZWqKM9S.js
import { fontStore, } from 'unframer';
fontStore.loadFonts(['GF;Space Grotesk-700',],);
var fonts = [{
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
  weight: '700',
},];
var css = [
  '.framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 60px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -2px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; }',
  '@media (max-width: 1439px) and (min-width: 992px) { .framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 48px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -2px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 991px) and (min-width: 768px) { .framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 42px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -2px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 767px) and (min-width: 0px) { .framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
];
var className = 'framer-EyGGi';

// https :https://framerusercontent.com/modules/3CVRgXfu0IAd8i9kiAe7/Cy5hQfG8rq2ChkUqZ3LU/s9en4OXwY.js
import { fontStore as fontStore2, } from 'unframer';
fontStore2.loadFonts(['GF;Space Grotesk-regular', 'GF;Space Grotesk-700',],);
var fonts2 = [{
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsmNsFjTDJK.woff2',
  weight: '400',
}, {
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
  weight: '700',
},];
var css2 = [
  '.framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 18px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; }',
  '@media (max-width: 1439px) and (min-width: 992px) { .framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 991px) and (min-width: 768px) { .framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 767px) and (min-width: 0px) { .framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; } }',
];
var className2 = 'framer-jklmq';

// https :https://framerusercontent.com/modules/uDUxgNxnYMLGnyh9FDBL/oiuq245BO0ladIQocclL/uMdppUE31.js
import { fontStore as fontStore3, } from 'unframer';
fontStore3.loadFonts(['GF;Space Grotesk-regular', 'GF;Space Grotesk-700',],);
var fonts3 = [{
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsmNsFjTDJK.woff2',
  weight: '400',
}, {
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
  weight: '700',
},];
var css3 = [
  '.framer-ktWBo .framer-styles-preset-17ww93c:not(.rich-text-wrapper), .framer-ktWBo .framer-styles-preset-17ww93c.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; }',
];
var className3 = 'framer-ktWBo';

// https :https://framerusercontent.com/modules/A4cMUx8LtG8c2WGjeyfL/m3bgBEcS9iFJFApu0M0C/LirT6SjMX.js
var MotionDivWithFX = withFX(motion.div,);
var RichTextWithFX = withFX(RichText,);
var ButtonFonts = getFonts(stdin_default,);
var ImageWithFX = withFX(Image,);
var cycleOrder = ['vRnRUmMJX', 'Cnq7mk0QR',];
var serializationHash = 'framer-cR9Hd';
var variantClassNames = { Cnq7mk0QR: 'framer-v-1two4n1', vRnRUmMJX: 'framer-v-1mb467i', };
function addPropertyOverrides(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transition1 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var animation = { opacity: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, skewX: 0, skewY: 0, transformPerspective: 1200, x: 0, y: 50, };
var transition2 = { damping: 40, delay: 0, mass: 1, stiffness: 400, type: 'spring', };
var transition3 = { damping: 40, delay: 0.2, mass: 1, stiffness: 400, type: 'spring', };
var transition4 = { damping: 40, delay: 0.4, mass: 1, stiffness: 400, type: 'spring', };
var animation1 = { opacity: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, skewX: 0, skewY: 0, transformPerspective: 1200, x: -50, y: 0, };
var transition5 = { damping: 60, delay: 0.4, mass: 1, stiffness: 400, type: 'spring', };
var Transition = ({ value, children, },) => {
  const config = React.useContext(MotionConfigContext,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx(MotionConfigContext.Provider, { value: contextValue, children, },);
};
var Variants = motion(React.Fragment,);
var humanReadableVariantMap = { desktop: 'vRnRUmMJX', mobile: 'Cnq7mk0QR', };
var getProps = ({ cta, height, id, secondButton, width, ...props },) => {
  var _humanReadableVariantMap_props_variant, _ref;
  return {
    ...props,
    jxBYhHGta: cta !== null && cta !== void 0 ? cta : props.jxBYhHGta,
    variant:
      (_ref =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref !== void 0
        ? _ref
        : 'vRnRUmMJX',
    Y1PuWnmSX: secondButton !== null && secondButton !== void 0 ? secondButton : props.Y1PuWnmSX,
  };
};
var createLayoutDependency = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component = /* @__PURE__ */ React.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo();
  const { style, className: className4, layoutId, variant, jxBYhHGta, Y1PuWnmSX, ...restProps } = getProps(props,);
  const {
    baseVariant,
    classNames,
    clearLoadingGesture,
    gestureHandlers,
    gestureVariant,
    isLoading,
    setGestureState,
    setVariant,
    variants,
  } = useVariantState({ cycleOrder, defaultVariant: 'vRnRUmMJX', variant, variantClassNames, },);
  const layoutDependency = createLayoutDependency(props, variants,);
  const ref1 = React.useRef(null,);
  const isDisplayed = () => {
    if (baseVariant === 'Cnq7mk0QR') return false;
    return true;
  };
  const defaultLayoutId = React.useId();
  const sharedStyleClassNames = [className3, className, className2,];
  const componentViewport = useComponentViewport();
  return /* @__PURE__ */ _jsx(LayoutGroup, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx(Variants, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx(Transition, {
        value: transition1,
        children: /* @__PURE__ */ _jsxs(motion.div, {
          ...restProps,
          ...gestureHandlers,
          className: cx(serializationHash, ...sharedStyleClassNames, 'framer-1mb467i', className4, classNames,),
          'data-framer-name': 'desktop',
          layoutDependency,
          layoutId: 'vRnRUmMJX',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          ...addPropertyOverrides({ Cnq7mk0QR: { 'data-framer-name': 'mobile', }, }, baseVariant, gestureVariant,),
          children: [
            /* @__PURE__ */ _jsxs(motion.div, {
              className: 'framer-1v6jdq1',
              'data-framer-name': 'Content Left',
              layoutDependency,
              layoutId: 'CMzuIjPM6',
              children: [
                /* @__PURE__ */ _jsxs(motion.div, {
                  className: 'framer-70n4j9',
                  'data-framer-name': 'Section Title',
                  layoutDependency,
                  layoutId: 'NOsb4Kt5H',
                  children: [
                    /* @__PURE__ */ _jsx(MotionDivWithFX, {
                      __framer__animate: { transition: transition2, },
                      __framer__animateOnce: true,
                      __framer__enter: animation,
                      __framer__styleAppearEffectEnabled: true,
                      __framer__threshold: 0.5,
                      __perspectiveFX: false,
                      __smartComponentFX: true,
                      __targetOpacity: 1,
                      className: 'framer-owqq5l',
                      'data-framer-name': 'Tagline',
                      layoutDependency,
                      layoutId: 'n2M9xO3ZH',
                      style: {
                        background:
                          'linear-gradient(90deg, rgb(193, 255, 86) 0%, rgb(100, 231, 78) 26.126126126126124%, rgb(167, 68, 202) 48.1981981981982%, rgb(60, 177, 170) 73.87387387387388%, rgb(193, 255, 86) 100%)',
                        borderBottomLeftRadius: 24,
                        borderBottomRightRadius: 24,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        transformPerspective: 1200,
                      },
                      children: /* @__PURE__ */ _jsx(motion.div, {
                        className: 'framer-ugtfhf',
                        'data-framer-name': 'Tagline Content',
                        layoutDependency,
                        layoutId: 'Raj9htkBA',
                        style: {
                          backgroundColor: 'rgb(18, 22, 11)',
                          borderBottomLeftRadius: 24,
                          borderBottomRightRadius: 24,
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                        },
                        children: /* @__PURE__ */ _jsx(RichText, {
                          __fromCanvasComponent: true,
                          children: /* @__PURE__ */ _jsx(React.Fragment, {
                            children: /* @__PURE__ */ _jsx(motion.p, {
                              className: 'framer-styles-preset-17ww93c',
                              'data-styles-preset': 'uMdppUE31',
                              style: {
                                '--framer-text-color':
                                  'var(--extracted-r6o4lv, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                              },
                              children: 'All your Crisp Conversation in Raycast',
                            },),
                          },),
                          className: 'framer-1kou8yj',
                          'data-framer-name': 'Systems and Building Web3',
                          fonts: ['Inter',],
                          layoutDependency,
                          layoutId: 'sDsPEaO0u',
                          style: {
                            '--extracted-r6o4lv': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                            '--framer-paragraph-spacing': '0px',
                          },
                          verticalAlignment: 'top',
                          withExternalLayout: true,
                        },),
                      },),
                    },),
                    /* @__PURE__ */ _jsxs(motion.div, {
                      className: 'framer-19v84o2',
                      'data-framer-name': 'title',
                      layoutDependency,
                      layoutId: 'GUSDT3XM4',
                      children: [
                        /* @__PURE__ */ _jsx(RichTextWithFX, {
                          __framer__animate: { transition: transition3, },
                          __framer__animateOnce: true,
                          __framer__enter: animation,
                          __framer__styleAppearEffectEnabled: true,
                          __framer__threshold: 0,
                          __fromCanvasComponent: true,
                          __perspectiveFX: false,
                          __smartComponentFX: true,
                          __targetOpacity: 1,
                          children: /* @__PURE__ */ _jsx(React.Fragment, {
                            children: /* @__PURE__ */ _jsx(motion.h1, {
                              className: 'framer-styles-preset-103wjsp',
                              'data-styles-preset': 'fCZWqKM9S',
                              style: {
                                '--framer-text-color':
                                  'var(--extracted-gdpscs, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                              },
                              children: 'Rewrite your Framer plugin content, in seconds',
                            },),
                          },),
                          className: 'framer-olsjb5',
                          'data-framer-name': 'Decentralizing Systems and Building Blockchain & Web3',
                          fonts: ['Inter',],
                          layoutDependency,
                          layoutId: 'NmwFtMats',
                          style: {
                            '--extracted-gdpscs': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                            '--framer-paragraph-spacing': '0px',
                            transformPerspective: 1200,
                          },
                          verticalAlignment: 'top',
                          withExternalLayout: true,
                        },),
                        /* @__PURE__ */ _jsx(RichTextWithFX, {
                          __framer__animate: { transition: transition4, },
                          __framer__animateOnce: true,
                          __framer__enter: animation,
                          __framer__styleAppearEffectEnabled: true,
                          __framer__threshold: 0,
                          __fromCanvasComponent: true,
                          __perspectiveFX: false,
                          __smartComponentFX: true,
                          __targetOpacity: 0.7,
                          children: /* @__PURE__ */ _jsx(React.Fragment, {
                            children: /* @__PURE__ */ _jsx(motion.p, {
                              className: 'framer-styles-preset-1kx6ka7',
                              'data-styles-preset': 's9en4OXwY',
                              style: {
                                '--framer-text-color':
                                  'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                              },
                              children:
                                'Keep all your customer support conversations in Raycast, easy to search, open and list, without battling with lost tabs and switching context',
                            },),
                          },),
                          className: 'framer-1h3q3sx',
                          'data-framer-name':
                            'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                          fonts: ['Inter',],
                          layoutDependency,
                          layoutId: 'YRi1pGk7N',
                          style: {
                            '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                            '--framer-paragraph-spacing': '0px',
                            opacity: 0.7,
                            transformPerspective: 1200,
                          },
                          verticalAlignment: 'top',
                          withExternalLayout: true,
                        },),
                      ],
                    },),
                  ],
                },),
                /* @__PURE__ */ _jsxs(motion.div, {
                  className: 'framer-32euzm',
                  'data-framer-name': 'Buttons',
                  layoutDependency,
                  layoutId: 'RvdNBivRW',
                  children: [
                    /* @__PURE__ */ _jsx(ComponentViewportProvider, {
                      children: /* @__PURE__ */ _jsx(MotionDivWithFX, {
                        __framer__animate: { transition: transition5, },
                        __framer__animateOnce: true,
                        __framer__enter: animation1,
                        __framer__styleAppearEffectEnabled: true,
                        __framer__threshold: 0.5,
                        __perspectiveFX: false,
                        __smartComponentFX: true,
                        __targetOpacity: 1,
                        className: 'framer-1bdptwc-container',
                        layoutDependency,
                        layoutId: 'RvYP8oKYm-container',
                        style: { transformPerspective: 1200, },
                        children: /* @__PURE__ */ _jsx(stdin_default, {
                          c0gn5OQjt: 'Install Crisp Plugin',
                          FDhu5wZJE: jxBYhHGta,
                          height: '100%',
                          id: 'RvYP8oKYm',
                          layoutId: 'RvYP8oKYm',
                          qyxXbxBX2: false,
                          variant: 'HpACQO_27',
                          width: '100%',
                        },),
                      },),
                    },),
                    /* @__PURE__ */ _jsx(ComponentViewportProvider, {
                      children: /* @__PURE__ */ _jsx(MotionDivWithFX, {
                        __framer__animate: { transition: transition5, },
                        __framer__animateOnce: true,
                        __framer__enter: animation1,
                        __framer__styleAppearEffectEnabled: true,
                        __framer__threshold: 0.5,
                        __perspectiveFX: false,
                        __smartComponentFX: true,
                        __targetOpacity: 1,
                        className: 'framer-1jfxqzy-container',
                        layoutDependency,
                        layoutId: 'NRjt9PlvN-container',
                        style: { transformPerspective: 1200, },
                        children: /* @__PURE__ */ _jsx(stdin_default, {
                          c0gn5OQjt: 'Install Raycast Extension',
                          FDhu5wZJE: Y1PuWnmSX,
                          height: '100%',
                          id: 'NRjt9PlvN',
                          layoutId: 'NRjt9PlvN',
                          qyxXbxBX2: true,
                          variant: 'B3GNqKG_s',
                          width: '100%',
                        },),
                      },),
                    },),
                  ],
                },),
              ],
            },),
            isDisplayed() && /* @__PURE__ */ _jsx(ImageWithFX, {
              __framer__animate: { transition: transition5, },
              __framer__animateOnce: true,
              __framer__enter: animation,
              __framer__styleAppearEffectEnabled: true,
              __framer__threshold: 0.5,
              __perspectiveFX: false,
              __smartComponentFX: true,
              __targetOpacity: 1,
              background: {
                alt: '',
                fit: 'fit',
                intrinsicHeight: 649,
                intrinsicWidth: 573,
                positionX: 'center',
                positionY: 'center',
                sizes: `calc(${
                  (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
                } * 0.5026)`,
                src: 'https://framerusercontent.com/images/jvEtQryJ5Ji9fmopJjRRqoYyg.svg',
                srcSet: 'https://framerusercontent.com/images/jvEtQryJ5Ji9fmopJjRRqoYyg.svg 573w',
              },
              className: 'framer-1los5q4',
              'data-framer-name': 'Hero Image',
              layoutDependency,
              layoutId: 'e4wYaHKXT',
              style: { transformPerspective: 1200, },
            },),
          ],
        },),
      },),
    },),
  },);
},);
var css4 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-cR9Hd.framer-1snacmi, .framer-cR9Hd .framer-1snacmi { display: block; }',
  '.framer-cR9Hd.framer-1mb467i { align-content: flex-start; align-items: flex-start; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 80px; height: min-content; justify-content: flex-start; max-width: 1140px; overflow: visible; padding: 0px; position: relative; width: 1140px; }',
  '.framer-cR9Hd .framer-1v6jdq1 { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 40px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 53%; }',
  '.framer-cR9Hd .framer-70n4j9 { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 14px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 100%; }',
  '.framer-cR9Hd .framer-owqq5l { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 37px; justify-content: center; overflow: hidden; padding: 1px; position: relative; width: min-content; will-change: var(--framer-will-change-override, transform); }',
  '.framer-cR9Hd .framer-ugtfhf { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 4px; height: 35px; justify-content: center; overflow: visible; padding: 4px 16px 6px 16px; position: relative; width: min-content; }',
  '.framer-cR9Hd .framer-1kou8yj { flex: none; height: auto; position: relative; white-space: pre; width: auto; }',
  '.framer-cR9Hd .framer-19v84o2 { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 20px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-cR9Hd .framer-olsjb5, .framer-cR9Hd .framer-1h3q3sx { flex: none; height: auto; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }',
  '.framer-cR9Hd .framer-32euzm { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-cR9Hd .framer-1bdptwc-container, .framer-cR9Hd .framer-1jfxqzy-container { flex: none; height: auto; position: relative; width: auto; }',
  '.framer-cR9Hd .framer-1los5q4 { aspect-ratio: 0.8911353032659409 / 1; bottom: -77px; flex: none; height: var(--framer-aspect-ratio-supported, 643px); position: absolute; right: -109px; top: -130px; width: 50%; z-index: 1; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-cR9Hd.framer-1mb467i, .framer-cR9Hd .framer-1v6jdq1, .framer-cR9Hd .framer-70n4j9, .framer-cR9Hd .framer-owqq5l, .framer-cR9Hd .framer-ugtfhf, .framer-cR9Hd .framer-19v84o2, .framer-cR9Hd .framer-32euzm { gap: 0px; } .framer-cR9Hd.framer-1mb467i > * { margin: 0px; margin-left: calc(80px / 2); margin-right: calc(80px / 2); } .framer-cR9Hd.framer-1mb467i > :first-child, .framer-cR9Hd .framer-owqq5l > :first-child, .framer-cR9Hd .framer-ugtfhf > :first-child, .framer-cR9Hd .framer-32euzm > :first-child { margin-left: 0px; } .framer-cR9Hd.framer-1mb467i > :last-child, .framer-cR9Hd .framer-owqq5l > :last-child, .framer-cR9Hd .framer-ugtfhf > :last-child, .framer-cR9Hd .framer-32euzm > :last-child { margin-right: 0px; } .framer-cR9Hd .framer-1v6jdq1 > * { margin: 0px; margin-bottom: calc(40px / 2); margin-top: calc(40px / 2); } .framer-cR9Hd .framer-1v6jdq1 > :first-child, .framer-cR9Hd .framer-70n4j9 > :first-child, .framer-cR9Hd .framer-19v84o2 > :first-child { margin-top: 0px; } .framer-cR9Hd .framer-1v6jdq1 > :last-child, .framer-cR9Hd .framer-70n4j9 > :last-child, .framer-cR9Hd .framer-19v84o2 > :last-child { margin-bottom: 0px; } .framer-cR9Hd .framer-70n4j9 > * { margin: 0px; margin-bottom: calc(14px / 2); margin-top: calc(14px / 2); } .framer-cR9Hd .framer-owqq5l > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-cR9Hd .framer-ugtfhf > * { margin: 0px; margin-left: calc(4px / 2); margin-right: calc(4px / 2); } .framer-cR9Hd .framer-19v84o2 > * { margin: 0px; margin-bottom: calc(20px / 2); margin-top: calc(20px / 2); } .framer-cR9Hd .framer-32euzm > * { margin: 0px; margin-left: calc(32px / 2); margin-right: calc(32px / 2); } }',
  '.framer-cR9Hd.framer-v-1two4n1.framer-1mb467i { width: 500px; }',
  '.framer-cR9Hd.framer-v-1two4n1 .framer-1v6jdq1 { width: 100%; }',
  ...css3,
  ...css,
  ...css2,
];
var FramerLirT6SjMX = withCSS(Component, css4, 'framer-cR9Hd',);
var stdin_default2 = FramerLirT6SjMX;
FramerLirT6SjMX.displayName = 'Hero';
FramerLirT6SjMX.defaultProps = { height: 465, width: 1140, };
addPropertyControls(FramerLirT6SjMX, {
  variant: { options: ['vRnRUmMJX', 'Cnq7mk0QR',], optionTitles: ['desktop', 'mobile',], title: 'Variant', type: ControlType.Enum, },
  jxBYhHGta: { title: 'cta', type: ControlType.Link, },
  Y1PuWnmSX: { title: 'secondButton', type: ControlType.Link, },
},);
addFonts(FramerLirT6SjMX, [
  {
    explicitInter: true,
    fonts: [{
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
      url: 'https://app.framerstatic.com/Inter-Regular.cyrillic-ext-CFTLRB35.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
      url: 'https://app.framerstatic.com/Inter-Regular.cyrillic-KKLZBALH.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+1F00-1FFF',
      url: 'https://app.framerstatic.com/Inter-Regular.greek-ext-ULEBLIFV.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0370-03FF',
      url: 'https://app.framerstatic.com/Inter-Regular.greek-IRHSNFQB.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
      url: 'https://app.framerstatic.com/Inter-Regular.latin-ext-VZDUGU3Q.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
      url: 'https://app.framerstatic.com/Inter-Regular.latin-JLQMKCHE.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
      url: 'https://app.framerstatic.com/Inter-Regular.vietnamese-QK7VSWXK.woff2',
      weight: '400',
    },],
  },
  ...ButtonFonts,
  ...getFontsFromSharedStyle(fonts3,),
  ...getFontsFromSharedStyle(fonts,),
  ...getFontsFromSharedStyle(fonts2,),
], { supportsExplicitInterCodegen: true, },);

// virtual:hero
import { WithFramerBreakpoints, } from 'unframer';
import { jsx, } from 'react/jsx-runtime';
stdin_default2.Responsive = (props,) => {
  return /* @__PURE__ */ jsx(WithFramerBreakpoints, { Component: stdin_default2, ...props, },);
};
var hero_default = stdin_default2;
export { hero_default as default, };
