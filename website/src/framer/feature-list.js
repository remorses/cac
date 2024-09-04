// @ts-nocheck
/* eslint-disable */
'use client';
import { className, css, fonts, } from './chunk-CNV3GALY.js';

// https :https://framerusercontent.com/modules/7wZWoOCa77PkUclivnMW/QD72WBtPgO5tkINJs1DG/jGfHTkNGC.js
import { jsx as _jsx, jsxs as _jsxs, } from 'react/jsx-runtime';
import {
  addFonts,
  addPropertyControls,
  ControlType,
  cx,
  getFontsFromSharedStyle,
  Image,
  RichText,
  useComponentViewport,
  useLocaleInfo,
  useVariantState,
  withCSS,
} from 'unframer';
import { LayoutGroup, motion, MotionConfigContext, } from 'unframer';
import * as React from 'react';

// https :https://framerusercontent.com/modules/vAjh6AAlRYSYj5CTuDFt/u9eUxHZUH7dGKsXMJn3t/Stp3cBHim.js
import { fontStore, } from 'unframer';
fontStore.loadFonts(['GF;Space Grotesk-700',],);
var fonts2 = [{
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
  weight: '700',
},];
var css2 = [
  '.framer-KXnUO .framer-styles-preset-g3fwcy:not(.rich-text-wrapper), .framer-KXnUO .framer-styles-preset-g3fwcy.rich-text-wrapper h3 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.4em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; }',
  '@media (max-width: 1439px) and (min-width: 992px) { .framer-KXnUO .framer-styles-preset-g3fwcy:not(.rich-text-wrapper), .framer-KXnUO .framer-styles-preset-g3fwcy.rich-text-wrapper h3 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.4em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 991px) and (min-width: 768px) { .framer-KXnUO .framer-styles-preset-g3fwcy:not(.rich-text-wrapper), .framer-KXnUO .framer-styles-preset-g3fwcy.rich-text-wrapper h3 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.4em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 767px) and (min-width: 0px) { .framer-KXnUO .framer-styles-preset-g3fwcy:not(.rich-text-wrapper), .framer-KXnUO .framer-styles-preset-g3fwcy.rich-text-wrapper h3 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.4em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
];
var className2 = 'framer-KXnUO';

// https :https://framerusercontent.com/modules/7wZWoOCa77PkUclivnMW/QD72WBtPgO5tkINJs1DG/jGfHTkNGC.js
var cycleOrder = ['cIqlKiy6o', 'feyXzLrKB',];
var serializationHash = 'framer-wg1bb';
var variantClassNames = { cIqlKiy6o: 'framer-v-1wvkhzp', feyXzLrKB: 'framer-v-mvjmwc', };
function addPropertyOverrides(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transition1 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var Transition = ({ value, children, },) => {
  const config = React.useContext(MotionConfigContext,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx(MotionConfigContext.Provider, { value: contextValue, children, },);
};
var Variants = motion(React.Fragment,);
var humanReadableVariantMap = { desktop: 'cIqlKiy6o', mobile: 'feyXzLrKB', };
var getProps = ({ height, id, width, ...props },) => {
  var _humanReadableVariantMap_props_variant, _ref;
  return {
    ...props,
    variant:
      (_ref =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref !== void 0
        ? _ref
        : 'cIqlKiy6o',
  };
};
var createLayoutDependency = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component = /* @__PURE__ */ React.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo();
  const { style, className: className3, layoutId, variant, ...restProps } = getProps(props,);
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
  } = useVariantState({ cycleOrder, defaultVariant: 'cIqlKiy6o', variant, variantClassNames, },);
  const layoutDependency = createLayoutDependency(props, variants,);
  const ref1 = React.useRef(null,);
  const isDisplayed = () => {
    if (baseVariant === 'feyXzLrKB') return false;
    return true;
  };
  const defaultLayoutId = React.useId();
  const sharedStyleClassNames = [className2, className,];
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
          className: cx(serializationHash, ...sharedStyleClassNames, 'framer-1wvkhzp', className3, classNames,),
          'data-framer-name': 'desktop',
          layoutDependency,
          layoutId: 'cIqlKiy6o',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          ...addPropertyOverrides({ feyXzLrKB: { 'data-framer-name': 'mobile', }, }, baseVariant, gestureVariant,),
          children: [
            /* @__PURE__ */ _jsxs(motion.div, {
              className: 'framer-1y6vtzo',
              'data-framer-name': 'Feature Card',
              layoutDependency,
              layoutId: 'PeBp7KjIO',
              style: {
                backgroundColor: 'rgb(11, 11, 11)',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
              children: [
                /* @__PURE__ */ _jsxs(motion.div, {
                  className: 'framer-1e6nlc1',
                  'data-framer-name': 'Text',
                  layoutDependency,
                  layoutId: 'oVo07iLDu',
                  children: [
                    /* @__PURE__ */ _jsx(RichText, {
                      __fromCanvasComponent: true,
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.ol, {
                          style: {
                            '--font-selector': 'R0Y7U3BhY2UgR3JvdGVzay03MDA=',
                            '--framer-font-family': '"Space Grotesk", "Space Grotesk Placeholder", sans-serif',
                            '--framer-font-size': '60px',
                            '--framer-font-weight': '700',
                            '--framer-letter-spacing': '-2px',
                            '--framer-line-height': '115%',
                            '--framer-text-color': 'var(--extracted-gjwowx, rgb(193, 255, 86))',
                          },
                          children: /* @__PURE__ */ _jsx(motion.li, {
                            children: /* @__PURE__ */ _jsx(motion.p, { children: 'Buy a template', },),
                          },),
                        },),
                      },),
                      className: 'framer-1kc41ev',
                      'data-framer-name': 'Smart Contract Automation',
                      fonts: ['GF;Space Grotesk-700',],
                      layoutDependency,
                      layoutId: 'EET3qI0XT',
                      style: { '--extracted-gjwowx': 'rgb(193, 255, 86)', '--framer-paragraph-spacing': '0px', },
                      verticalAlignment: 'top',
                      withExternalLayout: true,
                    },),
                    /* @__PURE__ */ _jsx(RichText, {
                      __fromCanvasComponent: true,
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          style: {
                            '--font-selector': 'R0Y7U3BhY2UgR3JvdGVzay1yZWd1bGFy',
                            '--framer-font-family': '"Space Grotesk", "Space Grotesk Placeholder", sans-serif',
                            '--framer-letter-spacing': '0px',
                            '--framer-line-height': '170%',
                            '--framer-text-color': 'var(--extracted-r6o4lv, rgb(222, 228, 210))',
                          },
                          children:
                            'This Framer plugin allows you to migrate templates to Framer quickly and efficiently, saving you the hassle of manual adjustments. Ideal for designers working with multiple projects.',
                        },),
                      },),
                      className: 'framer-1a3bv6h',
                      'data-framer-name':
                        'Discover the efficiency gains through automated, self-executing contracts. We enable trustless transactions and automate complex processes securely.',
                      fonts: ['GF;Space Grotesk-regular',],
                      layoutDependency,
                      layoutId: 'n6aLLCBEI',
                      style: { '--extracted-r6o4lv': 'rgb(222, 228, 210)', '--framer-paragraph-spacing': '0px', },
                      verticalAlignment: 'top',
                      withExternalLayout: true,
                    },),
                  ],
                },),
                isDisplayed() && /* @__PURE__ */ _jsx(Image, {
                  background: {
                    alt: '',
                    fit: 'fit',
                    intrinsicHeight: 968,
                    intrinsicWidth: 1008,
                    pixelHeight: 968,
                    pixelWidth: 1008,
                    positionX: 'center',
                    positionY: 'center',
                    sizes: `calc(${
                      (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
                    } / 1.516 - 236px)`,
                    src: 'https://framerusercontent.com/images/Vkprh8B871fl31CzIrogpL9On6U.png',
                    srcSet:
                      'https://framerusercontent.com/images/Vkprh8B871fl31CzIrogpL9On6U.png?scale-down-to=512 512w,https://framerusercontent.com/images/Vkprh8B871fl31CzIrogpL9On6U.png 1008w',
                  },
                  className: 'framer-vc6p6',
                  'data-framer-name': 'image',
                  layoutDependency,
                  layoutId: 'DmXvlGTtl',
                },),
              ],
            },),
            /* @__PURE__ */ _jsxs(motion.div, {
              className: 'framer-c1wiul',
              'data-framer-name': 'Feature Card',
              layoutDependency,
              layoutId: 'c426HPcdX',
              style: {
                backgroundColor: 'rgb(11, 11, 11)',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
              children: [
                /* @__PURE__ */ _jsx(RichText, {
                  __fromCanvasComponent: true,
                  children: /* @__PURE__ */ _jsx(React.Fragment, {
                    children: /* @__PURE__ */ _jsx(motion.ol, {
                      className: 'framer-styles-preset-g3fwcy',
                      'data-styles-preset': 'Stp3cBHim',
                      start: '2',
                      style: {
                        '--framer-text-color':
                          'var(--extracted-gjwowx, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                      },
                      children: /* @__PURE__ */ _jsx(motion.li, {
                        children: /* @__PURE__ */ _jsx(motion.h3, {
                          style: {
                            '--framer-text-color':
                              'var(--extracted-1bn47p8, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                          },
                          children: 'Use Template Rewrite to migrate the content',
                        },),
                      },),
                    },),
                  },),
                  className: 'framer-12ubw8n',
                  'data-framer-name': 'Decentralized Security',
                  fonts: ['Inter',],
                  layoutDependency,
                  layoutId: 'FlUpg5EFB',
                  style: {
                    '--extracted-1bn47p8': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                    '--extracted-gjwowx': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                    '--framer-paragraph-spacing': '0px',
                  },
                  verticalAlignment: 'top',
                  withExternalLayout: true,
                },),
                /* @__PURE__ */ _jsx(RichText, {
                  __fromCanvasComponent: true,
                  children: /* @__PURE__ */ _jsx(React.Fragment, {
                    children: /* @__PURE__ */ _jsx(motion.p, {
                      style: {
                        '--font-selector': 'R0Y7U3BhY2UgR3JvdGVzay1yZWd1bGFy',
                        '--framer-font-family': '"Space Grotesk", "Space Grotesk Placeholder", sans-serif',
                        '--framer-letter-spacing': '0px',
                        '--framer-line-height': '170%',
                        '--framer-text-color': 'var(--extracted-r6o4lv, rgb(222, 228, 210))',
                      },
                      children: 'Effortlessly migrate templates to Framer with our powerful plugin.',
                    },),
                  },),
                  className: 'framer-1s1373j',
                  'data-framer-name':
                    'Discover the efficiency gains through automated, self-executing contracts. We enable trustless transactions and automate complex processes securely.',
                  fonts: ['GF;Space Grotesk-regular',],
                  layoutDependency,
                  layoutId: 'L_YFAMV10',
                  style: { '--extracted-r6o4lv': 'rgb(222, 228, 210)', '--framer-paragraph-spacing': '0px', },
                  verticalAlignment: 'top',
                  withExternalLayout: true,
                },),
                /* @__PURE__ */ _jsx(Image, {
                  background: {
                    alt: '',
                    fit: 'fill',
                    intrinsicHeight: 674,
                    intrinsicWidth: 383,
                    pixelHeight: 674,
                    pixelWidth: 383,
                    sizes: `calc((${
                      (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
                    } * 0.3193 - 30px) * 0.57)`,
                    src: 'https://framerusercontent.com/images/TcgRSagCdEhO9ykaYZ5oq5tQQyA.png',
                    srcSet: 'https://framerusercontent.com/images/TcgRSagCdEhO9ykaYZ5oq5tQQyA.png 383w',
                  },
                  className: 'framer-dv3cbr',
                  'data-framer-name': 'Image',
                  layoutDependency,
                  layoutId: 'W3SvkaFHb',
                  ...addPropertyOverrides(
                    {
                      feyXzLrKB: {
                        background: {
                          alt: '',
                          fit: 'fill',
                          intrinsicHeight: 674,
                          intrinsicWidth: 383,
                          pixelHeight: 674,
                          pixelWidth: 383,
                          sizes: `calc((${
                            (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
                          } - 30px) * 0.57)`,
                          src: 'https://framerusercontent.com/images/TcgRSagCdEhO9ykaYZ5oq5tQQyA.png',
                          srcSet: 'https://framerusercontent.com/images/TcgRSagCdEhO9ykaYZ5oq5tQQyA.png 383w',
                        },
                      },
                    },
                    baseVariant,
                    gestureVariant,
                  ),
                },),
              ],
            },),
            /* @__PURE__ */ _jsxs(motion.div, {
              className: 'framer-1m6hmr4',
              'data-framer-name': 'Feature Card',
              layoutDependency,
              layoutId: 'EjxgLms0M',
              style: {
                backgroundColor: 'rgb(11, 11, 11)',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
              children: [
                /* @__PURE__ */ _jsx(Image, {
                  background: {
                    alt: '',
                    fit: 'fill',
                    intrinsicHeight: 464,
                    intrinsicWidth: 650,
                    pixelHeight: 464,
                    pixelWidth: 650,
                    sizes: '325px',
                    src: 'https://framerusercontent.com/images/HNOes3DDLYqzTLYH3UZqF3UFM.png',
                    srcSet:
                      'https://framerusercontent.com/images/HNOes3DDLYqzTLYH3UZqF3UFM.png?scale-down-to=512 512w,https://framerusercontent.com/images/HNOes3DDLYqzTLYH3UZqF3UFM.png 650w',
                  },
                  className: 'framer-c0bec0',
                  'data-framer-name': 'image',
                  layoutDependency,
                  layoutId: 'y_qWOiaBg',
                },),
                /* @__PURE__ */ _jsxs(motion.div, {
                  className: 'framer-dskjyd',
                  'data-framer-name': 'Text',
                  layoutDependency,
                  layoutId: 'bwNSuOndd',
                  children: [
                    /* @__PURE__ */ _jsx(RichText, {
                      __fromCanvasComponent: true,
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.h3, {
                          className: 'framer-styles-preset-g3fwcy',
                          'data-styles-preset': 'Stp3cBHim',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                          },
                          children: '3. Make small adjustements',
                        },),
                      },),
                      className: 'framer-1une4sw',
                      'data-framer-name': 'Interoperable DApps',
                      fonts: ['Inter',],
                      layoutDependency,
                      layoutId: 'kZyyZAa8n',
                      style: {
                        '--extracted-a0htzi': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                        '--framer-paragraph-spacing': '0px',
                      },
                      verticalAlignment: 'top',
                      withExternalLayout: true,
                    },),
                    /* @__PURE__ */ _jsx(RichText, {
                      __fromCanvasComponent: true,
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-17ww93c',
                          'data-styles-preset': 'uMdppUE31',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-r6o4lv, var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, rgb(224, 232, 210)))',
                          },
                          children:
                            'The Framer plugin will streamline your workflow by allowing rapid template migration. You can easily adapt designs and ensure consistency across projects.',
                        },),
                      },),
                      className: 'framer-1mvf3aw',
                      'data-framer-name': 'Experience seamless integration with decentralized applications (DApps).',
                      fonts: ['Inter',],
                      layoutDependency,
                      layoutId: 'GjpT0DO8M',
                      style: {
                        '--extracted-r6o4lv': 'var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, rgb(224, 232, 210))',
                        '--framer-paragraph-spacing': '0px',
                      },
                      verticalAlignment: 'top',
                      withExternalLayout: true,
                    },),
                  ],
                },),
              ],
            },),
            /* @__PURE__ */ _jsxs(motion.div, {
              className: 'framer-1m60r5d',
              'data-framer-name': 'Feature Card',
              layoutDependency,
              layoutId: 'Mz0QQWzRa',
              style: {
                backgroundColor: 'rgb(11, 11, 11)',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
              children: [
                /* @__PURE__ */ _jsxs(motion.div, {
                  className: 'framer-ego1bl',
                  'data-framer-name': 'Text',
                  layoutDependency,
                  layoutId: 'fkm18jib9',
                  children: [
                    /* @__PURE__ */ _jsx(RichText, {
                      __fromCanvasComponent: true,
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.h3, {
                          className: 'framer-styles-preset-g3fwcy',
                          'data-styles-preset': 'Stp3cBHim',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                          },
                          children: '4. Your website is live',
                        },),
                      },),
                      className: 'framer-112mwu5',
                      'data-framer-name': 'Interoperable DApps',
                      fonts: ['Inter',],
                      layoutDependency,
                      layoutId: 'blFv7K04e',
                      style: {
                        '--extracted-a0htzi': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                        '--framer-paragraph-spacing': '0px',
                      },
                      verticalAlignment: 'top',
                      withExternalLayout: true,
                    },),
                    /* @__PURE__ */ _jsx(RichText, {
                      __fromCanvasComponent: true,
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-17ww93c',
                          'data-styles-preset': 'uMdppUE31',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-r6o4lv, var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, rgb(224, 232, 210)))',
                          },
                          children: 'Easily import and customize your templates',
                        },),
                      },),
                      className: 'framer-1rtjf36',
                      'data-framer-name': 'Experience seamless integration with decentralized applications (DApps).',
                      fonts: ['Inter',],
                      layoutDependency,
                      layoutId: 'UfapcI4sP',
                      style: {
                        '--extracted-r6o4lv': 'var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, rgb(224, 232, 210))',
                        '--framer-paragraph-spacing': '0px',
                      },
                      verticalAlignment: 'top',
                      withExternalLayout: true,
                    },),
                  ],
                },),
                /* @__PURE__ */ _jsx(Image, {
                  background: {
                    alt: '',
                    fit: 'fill',
                    intrinsicHeight: 529,
                    intrinsicWidth: 601,
                    pixelHeight: 529,
                    pixelWidth: 601,
                    sizes: '325px',
                    src: 'https://framerusercontent.com/images/OQMHrbIHRDGt0MKfl0wm58YBJyY.png',
                    srcSet:
                      'https://framerusercontent.com/images/OQMHrbIHRDGt0MKfl0wm58YBJyY.png?scale-down-to=512 512w,https://framerusercontent.com/images/OQMHrbIHRDGt0MKfl0wm58YBJyY.png 601w',
                  },
                  className: 'framer-pdfif9',
                  'data-framer-name': 'image',
                  layoutDependency,
                  layoutId: 'kO009p4_I',
                },),
              ],
            },),
          ],
        },),
      },),
    },),
  },);
},);
var css3 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-wg1bb.framer-1s2bef1, .framer-wg1bb .framer-1s2bef1 { display: block; }',
  '.framer-wg1bb.framer-1wvkhzp { align-content: center; align-items: center; display: flex; flex-direction: row; flex-wrap: wrap; gap: 22px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 1140px; }',
  '.framer-wg1bb .framer-1y6vtzo { align-content: center; align-items: center; align-self: stretch; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 9px; height: auto; justify-content: center; overflow: hidden; padding: 124px 271px 48px 48px; position: relative; width: 66%; will-change: var(--framer-will-change-override, transform); z-index: 0; }',
  '.framer-wg1bb .framer-1e6nlc1 { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 24px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-wg1bb .framer-1kc41ev, .framer-wg1bb .framer-1a3bv6h, .framer-wg1bb .framer-12ubw8n, .framer-wg1bb .framer-1s1373j, .framer-wg1bb .framer-1une4sw, .framer-wg1bb .framer-1mvf3aw, .framer-wg1bb .framer-112mwu5, .framer-wg1bb .framer-1rtjf36 { flex: none; height: auto; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }',
  '.framer-wg1bb .framer-vc6p6 { bottom: -54px; flex: none; left: 246px; position: absolute; right: -10px; top: -54px; z-index: -1; }',
  '.framer-wg1bb .framer-c1wiul { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 19px; height: min-content; justify-content: center; overflow: hidden; padding: 24px 15px 46px 15px; position: relative; width: 32%; will-change: var(--framer-will-change-override, transform); }',
  '.framer-wg1bb .framer-dv3cbr { align-content: center; align-items: center; aspect-ratio: 0.5710059171597633 / 1; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: var(--framer-aspect-ratio-supported, 333px); justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 57%; }',
  '.framer-wg1bb .framer-1m6hmr4 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 52px; height: min-content; justify-content: center; overflow: hidden; padding: 48px; position: relative; width: 49%; will-change: var(--framer-will-change-override, transform); }',
  '.framer-wg1bb .framer-c0bec0, .framer-wg1bb .framer-pdfif9 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 232px; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 325px; }',
  '.framer-wg1bb .framer-dskjyd, .framer-wg1bb .framer-ego1bl { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 16px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-wg1bb .framer-1m60r5d { align-content: center; align-items: center; align-self: stretch; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 52px; height: auto; justify-content: center; overflow: hidden; padding: 48px; position: relative; width: 49%; will-change: var(--framer-will-change-override, transform); }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-wg1bb.framer-1wvkhzp, .framer-wg1bb .framer-1y6vtzo, .framer-wg1bb .framer-1e6nlc1, .framer-wg1bb .framer-c1wiul, .framer-wg1bb .framer-dv3cbr, .framer-wg1bb .framer-1m6hmr4, .framer-wg1bb .framer-c0bec0, .framer-wg1bb .framer-dskjyd, .framer-wg1bb .framer-1m60r5d, .framer-wg1bb .framer-ego1bl, .framer-wg1bb .framer-pdfif9 { gap: 0px; } .framer-wg1bb.framer-1wvkhzp > * { margin: 0px; margin-left: calc(22px / 2); margin-right: calc(22px / 2); } .framer-wg1bb.framer-1wvkhzp > :first-child, .framer-wg1bb .framer-1y6vtzo > :first-child, .framer-wg1bb .framer-dv3cbr > :first-child, .framer-wg1bb .framer-c0bec0 > :first-child, .framer-wg1bb .framer-pdfif9 > :first-child { margin-left: 0px; } .framer-wg1bb.framer-1wvkhzp > :last-child, .framer-wg1bb .framer-1y6vtzo > :last-child, .framer-wg1bb .framer-dv3cbr > :last-child, .framer-wg1bb .framer-c0bec0 > :last-child, .framer-wg1bb .framer-pdfif9 > :last-child { margin-right: 0px; } .framer-wg1bb .framer-1y6vtzo > * { margin: 0px; margin-left: calc(9px / 2); margin-right: calc(9px / 2); } .framer-wg1bb .framer-1e6nlc1 > * { margin: 0px; margin-bottom: calc(24px / 2); margin-top: calc(24px / 2); } .framer-wg1bb .framer-1e6nlc1 > :first-child, .framer-wg1bb .framer-c1wiul > :first-child, .framer-wg1bb .framer-1m6hmr4 > :first-child, .framer-wg1bb .framer-dskjyd > :first-child, .framer-wg1bb .framer-1m60r5d > :first-child, .framer-wg1bb .framer-ego1bl > :first-child { margin-top: 0px; } .framer-wg1bb .framer-1e6nlc1 > :last-child, .framer-wg1bb .framer-c1wiul > :last-child, .framer-wg1bb .framer-1m6hmr4 > :last-child, .framer-wg1bb .framer-dskjyd > :last-child, .framer-wg1bb .framer-1m60r5d > :last-child, .framer-wg1bb .framer-ego1bl > :last-child { margin-bottom: 0px; } .framer-wg1bb .framer-c1wiul > * { margin: 0px; margin-bottom: calc(19px / 2); margin-top: calc(19px / 2); } .framer-wg1bb .framer-dv3cbr > *, .framer-wg1bb .framer-c0bec0 > *, .framer-wg1bb .framer-pdfif9 > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-wg1bb .framer-1m6hmr4 > *, .framer-wg1bb .framer-1m60r5d > * { margin: 0px; margin-bottom: calc(52px / 2); margin-top: calc(52px / 2); } .framer-wg1bb .framer-dskjyd > *, .framer-wg1bb .framer-ego1bl > * { margin: 0px; margin-bottom: calc(16px / 2); margin-top: calc(16px / 2); } }',
  '.framer-wg1bb.framer-v-mvjmwc.framer-1wvkhzp { flex-direction: column; width: 471px; }',
  '.framer-wg1bb.framer-v-mvjmwc .framer-1y6vtzo { align-self: unset; flex-direction: column; height: 400px; padding: 20px; width: 100%; }',
  '.framer-wg1bb.framer-v-mvjmwc .framer-c1wiul { padding: 24px 15px 22px 15px; width: 100%; }',
  '.framer-wg1bb.framer-v-mvjmwc .framer-dv3cbr { height: var(--framer-aspect-ratio-supported, 440px); }',
  '.framer-wg1bb.framer-v-mvjmwc .framer-1m6hmr4 { width: 100%; }',
  '.framer-wg1bb.framer-v-mvjmwc .framer-1m60r5d { align-self: unset; height: min-content; width: 100%; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-wg1bb.framer-v-mvjmwc.framer-1wvkhzp, .framer-wg1bb.framer-v-mvjmwc .framer-1y6vtzo { gap: 0px; } .framer-wg1bb.framer-v-mvjmwc.framer-1wvkhzp > * { margin: 0px; margin-bottom: calc(22px / 2); margin-top: calc(22px / 2); } .framer-wg1bb.framer-v-mvjmwc.framer-1wvkhzp > :first-child, .framer-wg1bb.framer-v-mvjmwc .framer-1y6vtzo > :first-child { margin-top: 0px; } .framer-wg1bb.framer-v-mvjmwc.framer-1wvkhzp > :last-child, .framer-wg1bb.framer-v-mvjmwc .framer-1y6vtzo > :last-child { margin-bottom: 0px; } .framer-wg1bb.framer-v-mvjmwc .framer-1y6vtzo > * { margin: 0px; margin-bottom: calc(9px / 2); margin-top: calc(9px / 2); } }',
  ...css2,
  ...css,
];
var FramerjGfHTkNGC = withCSS(Component, css3, 'framer-wg1bb',);
var stdin_default = FramerjGfHTkNGC;
FramerjGfHTkNGC.displayName = 'FeatureList';
FramerjGfHTkNGC.defaultProps = { height: 1247, width: 1140, };
addPropertyControls(FramerjGfHTkNGC, {
  variant: { options: ['cIqlKiy6o', 'feyXzLrKB',], optionTitles: ['desktop', 'mobile',], title: 'Variant', type: ControlType.Enum, },
},);
addFonts(FramerjGfHTkNGC, [
  {
    explicitInter: true,
    fonts: [{
      family: 'Space Grotesk',
      source: 'google',
      style: 'normal',
      url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
      weight: '700',
    }, {
      family: 'Space Grotesk',
      source: 'google',
      style: 'normal',
      url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsmNsFjTDJK.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
      url: 'https://framerusercontent.com/assets/5vvr9Vy74if2I6bQbJvbw7SY1pQ.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
      url: 'https://framerusercontent.com/assets/EOr0mi4hNtlgWNn9if640EZzXCo.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+1F00-1FFF',
      url: 'https://framerusercontent.com/assets/Y9k9QrlZAqio88Klkmbd8VoMQc.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0370-03FF',
      url: 'https://framerusercontent.com/assets/OYrD2tBIBPvoJXiIHnLoOXnY9M.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
      url: 'https://framerusercontent.com/assets/JeYwfuaPfZHQhEG8U5gtPDZ7WQ.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
      url: 'https://framerusercontent.com/assets/vQyevYAyHtARFwPqUzQGpnDs.woff2',
      weight: '400',
    }, {
      family: 'Inter',
      source: 'framer',
      style: 'normal',
      unicodeRange: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
      url: 'https://framerusercontent.com/assets/b6Y37FthZeALduNqHicBT6FutY.woff2',
      weight: '400',
    },],
  },
  ...getFontsFromSharedStyle(fonts2,),
  ...getFontsFromSharedStyle(fonts,),
], { supportsExplicitInterCodegen: true, },);

// virtual:feature-list
import { WithFramerBreakpoints, } from 'unframer';
import { jsx, } from 'react/jsx-runtime';
stdin_default.Responsive = (props,) => {
  return /* @__PURE__ */ jsx(WithFramerBreakpoints, { Component: stdin_default, ...props, },);
};
var feature_list_default = stdin_default;
export { feature_list_default as default, };
