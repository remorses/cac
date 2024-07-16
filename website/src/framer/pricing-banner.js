// @ts-nocheck
/* eslint-disable */
'use client';
import { className as className4, css as css4, fonts as fonts4, } from './chunk-VHAJRWMR.js';
import { className as className3, css as css3, fonts as fonts3, } from './chunk-W6H3PCSD.js';
import { className, css, fonts, } from './chunk-WNPAEZHB.js';
import { className as className2, css as css2, fonts as fonts2, Icon, } from './chunk-KWNUSLWD.js';

// https :https://framerusercontent.com/modules/8iwmN4zvKpQDKQOhKPP5/lWog152Dw6rMbrCUv91N/FF233TYmj.js
import { jsx as _jsx3, jsxs as _jsxs3, } from 'react/jsx-runtime';
import {
  addFonts as addFonts3,
  addPropertyControls as addPropertyControls3,
  ComponentViewportProvider as ComponentViewportProvider3,
  ControlType as ControlType3,
  cx as cx3,
  getFonts as getFonts3,
  getFontsFromSharedStyle as getFontsFromSharedStyle2,
  Image,
  RichText as RichText3,
  useComponentViewport as useComponentViewport3,
  useLocaleInfo as useLocaleInfo3,
  useVariantState as useVariantState3,
  withCSS as withCSS3,
  withFX as withFX2,
} from 'unframer';
import { LayoutGroup as LayoutGroup3, motion as motion3, MotionConfigContext as MotionConfigContext3, } from 'unframer';
import * as React3 from 'react';

// https :https://framerusercontent.com/modules/bB0biUaiQyPLYVvd9nIy/gEnhxoygtFxPWCDzCRgP/n_DVZNexF.js
import { jsx as _jsx, jsxs as _jsxs, } from 'react/jsx-runtime';
import {
  addFonts,
  addPropertyControls,
  ComponentViewportProvider,
  ControlType,
  cx,
  getFonts,
  Link,
  RichText,
  useComponentViewport,
  useLocaleInfo,
  useVariantState,
  withCSS,
} from 'unframer';
import { LayoutGroup, motion, MotionConfigContext, } from 'unframer';
import * as React from 'react';
var FeatherFonts = getFonts(Icon,);
var enabledGestures = {
  B3GNqKG_s: { hover: true, },
  BkIMK8jhq: { hover: true, },
  HpACQO_27: { hover: true, },
  ia7uVki50: { hover: true, },
  Ny0_HBScj: { hover: true, },
};
var cycleOrder = ['ia7uVki50', 'Ny0_HBScj', 'HpACQO_27', 'BkIMK8jhq', 'B3GNqKG_s',];
var serializationHash = 'framer-nyuCL';
var variantClassNames = {
  B3GNqKG_s: 'framer-v-vxw3cn',
  BkIMK8jhq: 'framer-v-it02uf',
  HpACQO_27: 'framer-v-5n4rj3',
  ia7uVki50: 'framer-v-16c9l7d',
  Ny0_HBScj: 'framer-v-1ik2naf',
};
function addPropertyOverrides(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transitions = { default: { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', }, };
var Transition = ({ value, children, },) => {
  const config = React.useContext(MotionConfigContext,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx(MotionConfigContext.Provider, { value: contextValue, children, },);
};
var Variants = motion(React.Fragment,);
var humanReadableVariantMap = {
  ' Login button': 'BkIMK8jhq',
  'Button text': 'B3GNqKG_s',
  Primary: 'ia7uVki50',
  Secondary: 'Ny0_HBScj',
  Tertiary: 'HpACQO_27',
};
var getProps = ({ buttonTitle, height, iconVisibility, id, link, width, ...props },) => {
  var _ref, _ref1, _humanReadableVariantMap_props_variant, _ref2;
  return {
    ...props,
    c0gn5OQjt: (_ref = buttonTitle !== null && buttonTitle !== void 0 ? buttonTitle : props.c0gn5OQjt) !== null && _ref !== void 0
      ? _ref
      : 'Create Free Account',
    FDhu5wZJE: link !== null && link !== void 0 ? link : props.FDhu5wZJE,
    qyxXbxBX2:
      (_ref1 = iconVisibility !== null && iconVisibility !== void 0 ? iconVisibility : props.qyxXbxBX2) !== null && _ref1 !== void 0
        ? _ref1
        : true,
    variant:
      (_ref2 =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref2 !== void 0
        ? _ref2
        : 'ia7uVki50',
  };
};
var createLayoutDependency = (props, variants,) => variants.join('-',) + props.layoutDependency;
var Component = /* @__PURE__ */ React.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo();
  const { style, className: className8, layoutId, variant, c0gn5OQjt, qyxXbxBX2, FDhu5wZJE, ...restProps } = getProps(props,);
  const { baseVariant, classNames, gestureVariant, setGestureState, setVariant, transition, variants, } = useVariantState({
    cycleOrder,
    defaultVariant: 'ia7uVki50',
    enabledGestures,
    transitions,
    variant,
    variantClassNames,
  },);
  const layoutDependency = createLayoutDependency(props, variants,);
  const ref1 = React.useRef(null,);
  const defaultLayoutId = React.useId();
  const sharedStyleClassNames = [className, className2,];
  const componentViewport = useComponentViewport();
  return /* @__PURE__ */ _jsx(LayoutGroup, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx(Variants, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx(Transition, {
        value: transition,
        children: /* @__PURE__ */ _jsx(Link, {
          href: FDhu5wZJE,
          children: /* @__PURE__ */ _jsxs(motion.a, {
            ...restProps,
            className: `${cx(serializationHash, ...sharedStyleClassNames, 'framer-16c9l7d', className8, classNames,)} framer-e7qqvm`,
            'data-border': true,
            'data-framer-name': 'Primary',
            layoutDependency,
            layoutId: 'ia7uVki50',
            onHoverEnd: () => setGestureState({ isHovered: false, },),
            onHoverStart: () => setGestureState({ isHovered: true, },),
            onTap: () => setGestureState({ isPressed: false, },),
            onTapCancel: () => setGestureState({ isPressed: false, },),
            onTapStart: () => setGestureState({ isPressed: true, },),
            ref: ref !== null && ref !== void 0 ? ref : ref1,
            style: {
              '--border-bottom-width': '1px',
              '--border-color': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)) /* {"name":"Theme Color 01"} */',
              '--border-left-width': '1px',
              '--border-right-width': '1px',
              '--border-style': 'solid',
              '--border-top-width': '1px',
              backgroundColor: 'rgb(11, 11, 11)',
              borderBottomLeftRadius: 58,
              borderBottomRightRadius: 58,
              borderTopLeftRadius: 58,
              borderTopRightRadius: 58,
              ...style,
            },
            variants: {
              'B3GNqKG_s-hover': {
                '--border-bottom-width': '0px',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-top-width': '0px',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              },
              'BkIMK8jhq-hover': {
                '--border-bottom-width': '0px',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-top-width': '0px',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              },
              'HpACQO_27-hover': {
                '--border-bottom-width': '0px',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-top-width': '0px',
                backgroundColor: 'rgba(193, 255, 86, 0.7)',
              },
              'ia7uVki50-hover': { '--border-color': 'rgba(193, 255, 86, 0.7)', },
              'Ny0_HBScj-hover': { '--border-color': 'rgba(193, 255, 86, 0.7)', },
              B3GNqKG_s: {
                '--border-bottom-width': '0px',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-top-width': '0px',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              },
              BkIMK8jhq: {
                '--border-bottom-width': '0px',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-top-width': '0px',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              },
              HpACQO_27: {
                '--border-bottom-width': '0px',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-top-width': '0px',
                backgroundColor: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
              },
            },
            ...addPropertyOverrides(
              {
                'B3GNqKG_s-hover': { 'data-framer-name': void 0, },
                'BkIMK8jhq-hover': { 'data-framer-name': void 0, },
                'HpACQO_27-hover': { 'data-framer-name': void 0, },
                'ia7uVki50-hover': { 'data-framer-name': void 0, },
                'Ny0_HBScj-hover': { 'data-framer-name': void 0, },
                B3GNqKG_s: { 'data-framer-name': 'Button text', },
                BkIMK8jhq: { 'data-framer-name': ' Login button', },
                HpACQO_27: { 'data-framer-name': 'Tertiary', },
                Ny0_HBScj: { 'data-framer-name': 'Secondary', },
              },
              baseVariant,
              gestureVariant,
            ),
            children: [
              /* @__PURE__ */ _jsx(RichText, {
                __fromCanvasComponent: true,
                children: /* @__PURE__ */ _jsx(React.Fragment, {
                  children: /* @__PURE__ */ _jsx(motion.p, {
                    className: 'framer-styles-preset-1dpymlu',
                    'data-styles-preset': 'dNJjz5Q4p',
                    style: {
                      '--framer-text-color':
                        'var(--extracted-r6o4lv, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                    },
                    children: 'Create Free Account',
                  },),
                },),
                className: 'framer-1x0zoee',
                'data-framer-name': 'Get Started Now',
                layoutDependency,
                layoutId: 'I10802:4495;10706:1364',
                style: {
                  '--extracted-r6o4lv': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                  '--framer-paragraph-spacing': '0px',
                },
                text: c0gn5OQjt,
                variants: {
                  'B3GNqKG_s-hover': { '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                  'BkIMK8jhq-hover': { '--extracted-r6o4lv': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))', },
                  'HpACQO_27-hover': { '--extracted-r6o4lv': 'rgb(8, 8, 7)', },
                  'ia7uVki50-hover': { '--extracted-r6o4lv': 'rgba(193, 255, 86, 0.7)', },
                  'Ny0_HBScj-hover': { '--extracted-r6o4lv': 'rgba(193, 255, 86, 0.7)', },
                  BkIMK8jhq: { '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                  HpACQO_27: { '--extracted-r6o4lv': 'var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, rgb(8, 8, 7))', },
                },
                verticalAlignment: 'center',
                withExternalLayout: true,
                ...addPropertyOverrides(
                  {
                    'B3GNqKG_s-hover': {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-1dpymlu',
                          'data-styles-preset': 'dNJjz5Q4p',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                          },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                    'BkIMK8jhq-hover': {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-17ww93c',
                          'data-styles-preset': 'uMdppUE31',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-r6o4lv, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                          },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                    'HpACQO_27-hover': {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-1dpymlu',
                          'data-styles-preset': 'dNJjz5Q4p',
                          style: { '--framer-text-color': 'var(--extracted-r6o4lv, rgb(8, 8, 7))', },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                    'ia7uVki50-hover': {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-1dpymlu',
                          'data-styles-preset': 'dNJjz5Q4p',
                          style: { '--framer-text-color': 'var(--extracted-r6o4lv, rgba(193, 255, 86, 0.7))', },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                    'Ny0_HBScj-hover': {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-1dpymlu',
                          'data-styles-preset': 'dNJjz5Q4p',
                          style: { '--framer-text-color': 'var(--extracted-r6o4lv, rgba(193, 255, 86, 0.7))', },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                    BkIMK8jhq: {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-17ww93c',
                          'data-styles-preset': 'uMdppUE31',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                          },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                    HpACQO_27: {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-1dpymlu',
                          'data-styles-preset': 'dNJjz5Q4p',
                          style: {
                            '--framer-text-color':
                              'var(--extracted-r6o4lv, var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, rgb(8, 8, 7)))',
                          },
                          children: 'Create Free Account',
                        },),
                      },),
                    },
                  },
                  baseVariant,
                  gestureVariant,
                ),
              },),
              qyxXbxBX2 && /* @__PURE__ */ _jsxs(motion.div, {
                className: 'framer-bvy246',
                'data-framer-name': 'Icon',
                layoutDependency,
                layoutId: 'I10802:4495;10706:1365',
                children: [
                  /* @__PURE__ */ _jsx(ComponentViewportProvider, {
                    children: /* @__PURE__ */ _jsx(motion.div, {
                      className: 'framer-g861do-container',
                      'data-framer-name': 'Arrow-right',
                      layoutDependency,
                      layoutId: 'Tq68oXgPW-container',
                      name: 'Arrow-right',
                      children: /* @__PURE__ */ _jsx(Icon, {
                        color: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                        height: '100%',
                        iconSearch: 'Home',
                        iconSelection: 'arrow-right',
                        id: 'Tq68oXgPW',
                        layoutId: 'Tq68oXgPW',
                        mirrored: false,
                        name: 'Arrow-right',
                        selectByList: true,
                        style: { height: '100%', width: '100%', },
                        width: '100%',
                        ...addPropertyOverrides(
                          {
                            'B3GNqKG_s-hover': { color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                            'BkIMK8jhq-hover': { color: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))', },
                            'ia7uVki50-hover': { color: 'rgba(193, 255, 86, 0.7)', },
                            'Ny0_HBScj-hover': { color: 'rgba(193, 255, 86, 0.7)', },
                            BkIMK8jhq: { color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                            HpACQO_27: { color: 'var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, rgb(8, 8, 7))', },
                          },
                          baseVariant,
                          gestureVariant,
                        ),
                      },),
                    },),
                  },),
                  /* @__PURE__ */ _jsx(ComponentViewportProvider, {
                    children: /* @__PURE__ */ _jsx(motion.div, {
                      className: 'framer-17dk01k-container',
                      'data-framer-name': 'Arrow-right',
                      layoutDependency,
                      layoutId: 'UcMyTf8p_-container',
                      name: 'Arrow-right',
                      children: /* @__PURE__ */ _jsx(Icon, {
                        color: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                        height: '100%',
                        iconSearch: 'Home',
                        iconSelection: 'arrow-right',
                        id: 'UcMyTf8p_',
                        layoutId: 'UcMyTf8p_',
                        mirrored: false,
                        name: 'Arrow-right',
                        selectByList: true,
                        style: { height: '100%', width: '100%', },
                        width: '100%',
                        ...addPropertyOverrides(
                          {
                            'B3GNqKG_s-hover': { color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                            'BkIMK8jhq-hover': { color: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))', },
                            'ia7uVki50-hover': { color: 'rgba(193, 255, 86, 0.7)', },
                            'Ny0_HBScj-hover': { color: 'rgba(193, 255, 86, 0.7)', },
                            BkIMK8jhq: { color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                            HpACQO_27: { color: 'var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, rgb(8, 8, 7))', },
                          },
                          baseVariant,
                          gestureVariant,
                        ),
                      },),
                    },),
                  },),
                ],
              },),
            ],
          },),
        },),
      },),
    },),
  },);
},);
var css5 = [
  '.framer-nyuCL[data-border="true"]::after, .framer-nyuCL [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-nyuCL.framer-e7qqvm, .framer-nyuCL .framer-e7qqvm { display: block; }',
  '.framer-nyuCL.framer-16c9l7d { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 16px; height: min-content; justify-content: center; overflow: visible; padding: 7px 24px 7px 24px; position: relative; text-decoration: none; width: min-content; }',
  '.framer-nyuCL .framer-1x0zoee { flex: none; height: auto; position: relative; white-space: pre; width: auto; }',
  '.framer-nyuCL .framer-bvy246 { align-content: center; align-items: center; aspect-ratio: 1 / 1; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: var(--framer-aspect-ratio-supported, 16px); justify-content: flex-end; overflow: hidden; padding: 0px 0px 0px 0px; position: relative; width: 16px; }',
  '.framer-nyuCL .framer-g861do-container, .framer-nyuCL .framer-17dk01k-container { flex: none; height: 16px; position: relative; width: 16px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-nyuCL.framer-16c9l7d, .framer-nyuCL .framer-bvy246 { gap: 0px; } .framer-nyuCL.framer-16c9l7d > * { margin: 0px; margin-left: calc(16px / 2); margin-right: calc(16px / 2); } .framer-nyuCL.framer-16c9l7d > :first-child, .framer-nyuCL .framer-bvy246 > :first-child { margin-left: 0px; } .framer-nyuCL.framer-16c9l7d > :last-child, .framer-nyuCL .framer-bvy246 > :last-child { margin-right: 0px; } .framer-nyuCL .framer-bvy246 > * { margin: 0px; margin-left: calc(0px / 2); margin-right: calc(0px / 2); } }',
  '.framer-nyuCL.framer-v-1ik2naf.framer-16c9l7d, .framer-nyuCL.framer-v-5n4rj3.framer-16c9l7d { padding: 14px 24px 14px 24px; }',
  '.framer-nyuCL.framer-v-it02uf.framer-16c9l7d, .framer-nyuCL.framer-v-vxw3cn.framer-16c9l7d { padding: 0px 0px 0px 0px; }',
  '.framer-nyuCL.framer-v-16c9l7d.hover .framer-bvy246, .framer-nyuCL.framer-v-1ik2naf.hover .framer-bvy246, .framer-nyuCL.framer-v-5n4rj3.hover .framer-bvy246, .framer-nyuCL.framer-v-it02uf.hover .framer-bvy246, .framer-nyuCL.framer-v-vxw3cn.hover .framer-bvy246 { justify-content: flex-start; }',
  ...css,
  ...css2,
];
var Framern_DVZNexF = withCSS(Component, css5, 'framer-nyuCL',);
var stdin_default = Framern_DVZNexF;
Framern_DVZNexF.displayName = 'Button';
Framern_DVZNexF.defaultProps = { height: 41, width: 237, };
addPropertyControls(Framern_DVZNexF, {
  variant: {
    options: ['ia7uVki50', 'Ny0_HBScj', 'HpACQO_27', 'BkIMK8jhq', 'B3GNqKG_s',],
    optionTitles: ['Primary', 'Secondary', 'Tertiary', ' Login button', 'Button text',],
    title: 'Variant',
    type: ControlType.Enum,
  },
  c0gn5OQjt: { defaultValue: 'Create Free Account', displayTextArea: false, title: 'Button Title', type: ControlType.String, },
  qyxXbxBX2: { defaultValue: true, title: 'Icon Visibility', type: ControlType.Boolean, },
  FDhu5wZJE: { title: 'Link', type: ControlType.Link, },
},);
addFonts(Framern_DVZNexF, [...FeatherFonts, ...fonts, ...fonts2,],);

// https :https://framerusercontent.com/modules/lSrPguuOrsW4P1B2lEy1/MJE2sX4BnWUCxn6ZpnVu/THPkjzinl.js
import { jsx as _jsx2, jsxs as _jsxs2, } from 'react/jsx-runtime';
import {
  addFonts as addFonts2,
  addPropertyControls as addPropertyControls2,
  ComponentViewportProvider as ComponentViewportProvider2,
  ControlType as ControlType2,
  cx as cx2,
  getFonts as getFonts2,
  getFontsFromSharedStyle,
  RichText as RichText2,
  useComponentViewport as useComponentViewport2,
  useLocaleInfo as useLocaleInfo2,
  useVariantState as useVariantState2,
  withCSS as withCSS2,
  withFX,
} from 'unframer';
import { LayoutGroup as LayoutGroup2, motion as motion2, MotionConfigContext as MotionConfigContext2, } from 'unframer';
import * as React2 from 'react';

// https :https://framerusercontent.com/modules/4NqcKosvMypnbqlUnR3G/HiBJMUaumlb0qheFrcIP/fCZWqKM9S.js
import { fontStore, } from 'unframer';
fontStore.loadFonts(['GF;Space Grotesk-700',],);
var fonts5 = [{
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
  weight: '700',
},];
var css6 = [
  '.framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 60px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -2px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; }',
  '@media (max-width: 1439px) and (min-width: 992px) { .framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 48px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -2px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 991px) and (min-width: 768px) { .framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 42px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -2px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 767px) and (min-width: 0px) { .framer-EyGGi .framer-styles-preset-103wjsp:not(.rich-text-wrapper), .framer-EyGGi .framer-styles-preset-103wjsp.rich-text-wrapper h1 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.15em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, #080807); --framer-text-decoration: none; --framer-text-transform: none; } }',
];
var className5 = 'framer-EyGGi';

// https :https://framerusercontent.com/modules/ra7z0x7nlqigYbtDhvch/vfdPRWNijyX5SBpnfPsH/s9en4OXwY.js
import { fontStore as fontStore2, } from 'unframer';
fontStore2.loadFonts(['GF;Space Grotesk-regular', 'GF;Space Grotesk-700',],);
var fonts6 = [{
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
var css7 = [
  '.framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 18px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; }',
  '@media (max-width: 1439px) and (min-width: 992px) { .framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 991px) and (min-width: 768px) { .framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 767px) and (min-width: 0px) { .framer-jklmq .framer-styles-preset-1kx6ka7:not(.rich-text-wrapper), .framer-jklmq .framer-styles-preset-1kx6ka7.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-family-bold: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-style-bold: normal; --framer-font-weight: 400; --framer-font-weight-bold: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; } }',
];
var className6 = 'framer-jklmq';

// https :https://framerusercontent.com/modules/1kgOPaSMvyliLSK49PCs/6SB4wnHvwwrEGryspEpL/XDdZznbn8.js
import { fontStore as fontStore3, } from 'unframer';
fontStore3.loadFonts(['GF;Space Grotesk-700',],);
var fonts7 = [{
  family: 'Space Grotesk',
  source: 'google',
  style: 'normal',
  url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksmNsFjTDJK.woff2',
  weight: '700',
},];
var css8 = [
  '.framer-qthLV .framer-styles-preset-1ue4n2o:not(.rich-text-wrapper), .framer-qthLV .framer-styles-preset-1ue4n2o.rich-text-wrapper h2 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 48px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1.5px; --framer-line-height: 1.2em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, #ffffff); --framer-text-decoration: none; --framer-text-transform: none; }',
  '@media (max-width: 1439px) and (min-width: 992px) { .framer-qthLV .framer-styles-preset-1ue4n2o:not(.rich-text-wrapper), .framer-qthLV .framer-styles-preset-1ue4n2o.rich-text-wrapper h2 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 45px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1.5px; --framer-line-height: 1.2em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, #ffffff); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 991px) and (min-width: 768px) { .framer-qthLV .framer-styles-preset-1ue4n2o:not(.rich-text-wrapper), .framer-qthLV .framer-styles-preset-1ue4n2o.rich-text-wrapper h2 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 40px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1.5px; --framer-line-height: 1.2em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, #ffffff); --framer-text-decoration: none; --framer-text-transform: none; } }',
  '@media (max-width: 767px) and (min-width: 0px) { .framer-qthLV .framer-styles-preset-1ue4n2o:not(.rich-text-wrapper), .framer-qthLV .framer-styles-preset-1ue4n2o.rich-text-wrapper h2 { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 36px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: -1px; --framer-line-height: 1.2em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, #ffffff); --framer-text-decoration: none; --framer-text-transform: none; } }',
];
var className7 = 'framer-qthLV';

// https :https://framerusercontent.com/modules/lSrPguuOrsW4P1B2lEy1/MJE2sX4BnWUCxn6ZpnVu/THPkjzinl.js
var FeatherFonts2 = getFonts2(Icon,);
var MotionDivWithFX = withFX(motion2.div,);
var RichTextWithFX = withFX(RichText2,);
var cycleOrder2 = ['xNkBnT7Cc', 'ldIilTyE_', 'qXdVD633r', 'zrydQfKFZ',];
var serializationHash2 = 'framer-eAda1';
var variantClassNames2 = {
  ldIilTyE_: 'framer-v-1tq21ma',
  qXdVD633r: 'framer-v-1qbynle',
  xNkBnT7Cc: 'framer-v-19ocl1v',
  zrydQfKFZ: 'framer-v-o4rghs',
};
function addPropertyOverrides2(overrides, ...variants) {
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
var Transition2 = ({ value, children, },) => {
  const config = React2.useContext(MotionConfigContext2,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React2.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx2(MotionConfigContext2.Provider, { value: contextValue, children, },);
};
var Variants2 = motion2(React2.Fragment,);
var humanReadableVariantMap2 = {
  'H1 Center Align': 'ldIilTyE_',
  'H1 Left Align': 'xNkBnT7Cc',
  'H2 Center Align': 'zrydQfKFZ',
  'H2 Left Align': 'qXdVD633r',
};
var getProps2 = ({ height, iconVisible, id, tagline, text, textVisible, title, width, ...props },) => {
  var _ref, _ref1, _ref2, _ref3, _humanReadableVariantMap_props_variant, _ref4, _ref5;
  return {
    ...props,
    cASqLqJU3: (_ref = textVisible !== null && textVisible !== void 0 ? textVisible : props.cASqLqJU3) !== null && _ref !== void 0
      ? _ref
      : true,
    CUE0ztma1: (_ref1 = title !== null && title !== void 0 ? title : props.CUE0ztma1) !== null && _ref1 !== void 0
      ? _ref1
      : 'Decentralizing Systems and Building Blockchain & Web3',
    MtTJpx7dZ: (_ref2 = tagline !== null && tagline !== void 0 ? tagline : props.MtTJpx7dZ) !== null && _ref2 !== void 0
      ? _ref2
      : 'Systems and Building Web3',
    nG9I1sRlG: (_ref3 = iconVisible !== null && iconVisible !== void 0 ? iconVisible : props.nG9I1sRlG) !== null && _ref3 !== void 0
      ? _ref3
      : true,
    variant:
      (_ref4 =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap2[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref4 !== void 0
        ? _ref4
        : 'xNkBnT7Cc',
    zzNuawToN: (_ref5 = text !== null && text !== void 0 ? text : props.zzNuawToN) !== null && _ref5 !== void 0
      ? _ref5
      : 'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
  };
};
var createLayoutDependency2 = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component2 = /* @__PURE__ */ React2.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo2();
  const { style, className: className8, layoutId, variant, MtTJpx7dZ, CUE0ztma1, zzNuawToN, cASqLqJU3, nG9I1sRlG, ...restProps } =
    getProps2(props,);
  const { baseVariant, classNames, gestureHandlers, gestureVariant, setGestureState, setVariant, variants, } = useVariantState2({
    cycleOrder: cycleOrder2,
    defaultVariant: 'xNkBnT7Cc',
    variant,
    variantClassNames: variantClassNames2,
  },);
  const layoutDependency = createLayoutDependency2(props, variants,);
  const ref1 = React2.useRef(null,);
  const defaultLayoutId = React2.useId();
  const sharedStyleClassNames = [className3, className5, className7, className6,];
  const componentViewport = useComponentViewport2();
  return /* @__PURE__ */ _jsx2(LayoutGroup2, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx2(Variants2, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx2(Transition2, {
        value: transition1,
        children: /* @__PURE__ */ _jsxs2(motion2.div, {
          ...restProps,
          ...gestureHandlers,
          className: cx2(serializationHash2, ...sharedStyleClassNames, 'framer-19ocl1v', className8, classNames,),
          'data-framer-name': 'H1 Left Align',
          layoutDependency,
          layoutId: 'xNkBnT7Cc',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          ...addPropertyOverrides2(
            {
              ldIilTyE_: { 'data-framer-name': 'H1 Center Align', },
              qXdVD633r: { 'data-framer-name': 'H2 Left Align', },
              zrydQfKFZ: { 'data-framer-name': 'H2 Center Align', },
            },
            baseVariant,
            gestureVariant,
          ),
          children: [
            /* @__PURE__ */ _jsx2(MotionDivWithFX, {
              __framer__animate: { transition: transition2, },
              __framer__animateOnce: true,
              __framer__enter: animation,
              __framer__styleAppearEffectEnabled: true,
              __framer__threshold: 0.5,
              __perspectiveFX: false,
              __smartComponentFX: true,
              __targetOpacity: 1,
              className: 'framer-1yamqg4',
              'data-framer-name': 'Tagline',
              layoutDependency,
              layoutId: 'FgHb6hcD4',
              style: {
                background:
                  'linear-gradient(90deg, rgb(193, 255, 86) 0%, rgb(100, 231, 78) 26.126126126126124%, rgb(167, 68, 202) 48.1981981981982%, rgb(60, 177, 170) 73.87387387387388%, rgb(193, 255, 86) 100%)',
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                transformPerspective: 1200,
              },
              children: /* @__PURE__ */ _jsxs2(motion2.div, {
                className: 'framer-19eh289',
                'data-framer-name': 'Tagline Content',
                layoutDependency,
                layoutId: 'Pl15YSypg',
                style: {
                  backgroundColor: 'rgb(18, 22, 11)',
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                },
                children: [
                  /* @__PURE__ */ _jsx2(RichText2, {
                    __fromCanvasComponent: true,
                    children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                      children: /* @__PURE__ */ _jsx2(motion2.p, {
                        className: 'framer-styles-preset-17ww93c',
                        'data-styles-preset': 'uMdppUE31',
                        style: {
                          '--framer-text-color':
                            'var(--extracted-r6o4lv, var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86)))',
                        },
                        children: 'Systems and Building Web3',
                      },),
                    },),
                    className: 'framer-1d6oxq0',
                    'data-framer-name': 'Systems and Building Web3',
                    fonts: ['Inter',],
                    layoutDependency,
                    layoutId: 'sZl3PsRfD',
                    style: {
                      '--extracted-r6o4lv': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                      '--framer-paragraph-spacing': '0px',
                    },
                    text: MtTJpx7dZ,
                    verticalAlignment: 'top',
                    withExternalLayout: true,
                  },),
                  nG9I1sRlG && /* @__PURE__ */ _jsx2(motion2.div, {
                    className: 'framer-c32kkv',
                    'data-framer-name': 'chevron-right',
                    layoutDependency,
                    layoutId: 'bJmV6nSFv',
                    children: /* @__PURE__ */ _jsx2(ComponentViewportProvider2, {
                      children: /* @__PURE__ */ _jsx2(motion2.div, {
                        className: 'framer-1d19sdp-container',
                        layoutDependency,
                        layoutId: 'EeQA1D4zF-container',
                        children: /* @__PURE__ */ _jsx2(Icon, {
                          color: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
                          height: '100%',
                          iconSearch: 'Home',
                          iconSelection: 'chevron-right',
                          id: 'EeQA1D4zF',
                          layoutId: 'EeQA1D4zF',
                          mirrored: false,
                          selectByList: true,
                          style: { height: '100%', width: '100%', },
                          width: '100%',
                        },),
                      },),
                    },),
                  },),
                ],
              },),
            },),
            /* @__PURE__ */ _jsxs2(motion2.div, {
              className: 'framer-1fiuvmr',
              'data-framer-name': 'title',
              layoutDependency,
              layoutId: 'UKgn38cNJ',
              children: [
                /* @__PURE__ */ _jsx2(RichTextWithFX, {
                  __framer__animate: { transition: transition3, },
                  __framer__animateOnce: true,
                  __framer__enter: animation,
                  __framer__styleAppearEffectEnabled: true,
                  __framer__threshold: 0,
                  __fromCanvasComponent: true,
                  __perspectiveFX: false,
                  __smartComponentFX: true,
                  __targetOpacity: 1,
                  children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                    children: /* @__PURE__ */ _jsx2(motion2.h1, {
                      className: 'framer-styles-preset-103wjsp',
                      'data-styles-preset': 'fCZWqKM9S',
                      style: {
                        '--framer-text-color':
                          'var(--extracted-gdpscs, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                      },
                      children: 'Decentralizing Systems and Building Blockchain & Web3',
                    },),
                  },),
                  className: 'framer-1bh5qzz',
                  'data-framer-name': 'Decentralizing Systems and Building Blockchain & Web3',
                  fonts: ['Inter',],
                  layoutDependency,
                  layoutId: 'CA1bDZ6F1',
                  style: {
                    '--extracted-gdpscs': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                    '--framer-paragraph-spacing': '0px',
                    transformPerspective: 1200,
                  },
                  text: CUE0ztma1,
                  variants: {
                    qXdVD633r: { '--extracted-1of0zx5': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                    zrydQfKFZ: { '--extracted-1of0zx5': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))', },
                  },
                  verticalAlignment: 'top',
                  withExternalLayout: true,
                  ...addPropertyOverrides2(
                    {
                      ldIilTyE_: {
                        children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                          children: /* @__PURE__ */ _jsx2(motion2.h1, {
                            className: 'framer-styles-preset-103wjsp',
                            'data-styles-preset': 'fCZWqKM9S',
                            style: {
                              '--framer-text-alignment': 'center',
                              '--framer-text-color':
                                'var(--extracted-gdpscs, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                            },
                            children: 'Decentralizing Systems and Building Blockchain & Web3',
                          },),
                        },),
                      },
                      qXdVD633r: {
                        children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                          children: /* @__PURE__ */ _jsx2(motion2.h2, {
                            className: 'framer-styles-preset-1ue4n2o',
                            'data-styles-preset': 'XDdZznbn8',
                            style: {
                              '--framer-text-color':
                                'var(--extracted-1of0zx5, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                            },
                            children: 'Decentralizing Systems and Building Blockchain & Web3',
                          },),
                        },),
                      },
                      zrydQfKFZ: {
                        children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                          children: /* @__PURE__ */ _jsx2(motion2.h2, {
                            className: 'framer-styles-preset-1ue4n2o',
                            'data-styles-preset': 'XDdZznbn8',
                            style: {
                              '--framer-text-alignment': 'center',
                              '--framer-text-color':
                                'var(--extracted-1of0zx5, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                            },
                            children: 'Decentralizing Systems and Building Blockchain & Web3',
                          },),
                        },),
                      },
                    },
                    baseVariant,
                    gestureVariant,
                  ),
                },),
                cASqLqJU3 && /* @__PURE__ */ _jsx2(RichTextWithFX, {
                  __framer__animate: { transition: transition4, },
                  __framer__animateOnce: true,
                  __framer__enter: animation,
                  __framer__styleAppearEffectEnabled: true,
                  __framer__threshold: 0,
                  __fromCanvasComponent: true,
                  __perspectiveFX: false,
                  __smartComponentFX: true,
                  __targetOpacity: 0.7,
                  children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                    children: /* @__PURE__ */ _jsx2(motion2.p, {
                      className: 'framer-styles-preset-1kx6ka7',
                      'data-styles-preset': 's9en4OXwY',
                      style: {
                        '--framer-text-color':
                          'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                      },
                      children:
                        'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                    },),
                  },),
                  className: 'framer-1goerhh',
                  'data-framer-name':
                    'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                  fonts: ['Inter',],
                  layoutDependency,
                  layoutId: 'wT_QGpOTc',
                  style: {
                    '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                    '--framer-paragraph-spacing': '0px',
                    opacity: 0.7,
                    transformPerspective: 1200,
                  },
                  text: zzNuawToN,
                  verticalAlignment: 'top',
                  withExternalLayout: true,
                  ...addPropertyOverrides2(
                    {
                      ldIilTyE_: {
                        children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                          children: /* @__PURE__ */ _jsx2(motion2.p, {
                            className: 'framer-styles-preset-1kx6ka7',
                            'data-styles-preset': 's9en4OXwY',
                            style: {
                              '--framer-text-alignment': 'center',
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                            },
                            children:
                              'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                          },),
                        },),
                      },
                      zrydQfKFZ: {
                        children: /* @__PURE__ */ _jsx2(React2.Fragment, {
                          children: /* @__PURE__ */ _jsx2(motion2.p, {
                            className: 'framer-styles-preset-1kx6ka7',
                            'data-styles-preset': 's9en4OXwY',
                            style: {
                              '--framer-text-alignment': 'center',
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                            },
                            children:
                              'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                          },),
                        },),
                      },
                    },
                    baseVariant,
                    gestureVariant,
                  ),
                },),
              ],
            },),
          ],
        },),
      },),
    },),
  },);
},);
var css9 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-eAda1.framer-eh9olz, .framer-eAda1 .framer-eh9olz { display: block; }',
  '.framer-eAda1.framer-19ocl1v { align-content: flex-start; align-items: flex-start; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 14px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 601px; }',
  '.framer-eAda1 .framer-1yamqg4 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 37px; justify-content: center; overflow: hidden; padding: 1px; position: relative; width: min-content; will-change: var(--framer-will-change-override, transform); }',
  '.framer-eAda1 .framer-19eh289 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 4px; height: 35px; justify-content: center; overflow: visible; padding: 4px 16px 6px 16px; position: relative; width: min-content; }',
  '.framer-eAda1 .framer-1d6oxq0 { flex: none; height: auto; position: relative; white-space: pre; width: auto; }',
  '.framer-eAda1 .framer-c32kkv { aspect-ratio: 1 / 1; flex: none; height: var(--framer-aspect-ratio-supported, 16px); overflow: hidden; position: relative; width: 16px; }',
  '.framer-eAda1 .framer-1d19sdp-container { bottom: 2px; flex: none; left: 5px; position: absolute; right: 3px; top: 2px; }',
  '.framer-eAda1 .framer-1fiuvmr { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 20px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-eAda1 .framer-1bh5qzz, .framer-eAda1 .framer-1goerhh { flex: none; height: auto; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-eAda1.framer-19ocl1v, .framer-eAda1 .framer-1yamqg4, .framer-eAda1 .framer-19eh289, .framer-eAda1 .framer-1fiuvmr { gap: 0px; } .framer-eAda1.framer-19ocl1v > * { margin: 0px; margin-bottom: calc(14px / 2); margin-top: calc(14px / 2); } .framer-eAda1.framer-19ocl1v > :first-child, .framer-eAda1 .framer-1fiuvmr > :first-child { margin-top: 0px; } .framer-eAda1.framer-19ocl1v > :last-child, .framer-eAda1 .framer-1fiuvmr > :last-child { margin-bottom: 0px; } .framer-eAda1 .framer-1yamqg4 > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-eAda1 .framer-1yamqg4 > :first-child, .framer-eAda1 .framer-19eh289 > :first-child { margin-left: 0px; } .framer-eAda1 .framer-1yamqg4 > :last-child, .framer-eAda1 .framer-19eh289 > :last-child { margin-right: 0px; } .framer-eAda1 .framer-19eh289 > * { margin: 0px; margin-left: calc(4px / 2); margin-right: calc(4px / 2); } .framer-eAda1 .framer-1fiuvmr > * { margin: 0px; margin-bottom: calc(20px / 2); margin-top: calc(20px / 2); } }',
  '.framer-eAda1.framer-v-1tq21ma.framer-19ocl1v, .framer-eAda1.framer-v-1tq21ma .framer-1fiuvmr, .framer-eAda1.framer-v-o4rghs.framer-19ocl1v, .framer-eAda1.framer-v-o4rghs .framer-1fiuvmr { align-content: center; align-items: center; }',
  ...css3,
  ...css6,
  ...css8,
  ...css7,
];
var FramerTHPkjzinl = withCSS2(Component2, css9, 'framer-eAda1',);
var stdin_default2 = FramerTHPkjzinl;
FramerTHPkjzinl.displayName = 'Section Title';
FramerTHPkjzinl.defaultProps = { height: 339, width: 601, };
addPropertyControls2(FramerTHPkjzinl, {
  variant: {
    options: ['xNkBnT7Cc', 'ldIilTyE_', 'qXdVD633r', 'zrydQfKFZ',],
    optionTitles: ['H1 Left Align', 'H1 Center Align', 'H2 Left Align', 'H2 Center Align',],
    title: 'Variant',
    type: ControlType2.Enum,
  },
  MtTJpx7dZ: { defaultValue: 'Systems and Building Web3', displayTextArea: false, title: 'Tagline', type: ControlType2.String, },
  CUE0ztma1: {
    defaultValue: 'Decentralizing Systems and Building Blockchain & Web3',
    displayTextArea: false,
    title: 'Title',
    type: ControlType2.String,
  },
  zzNuawToN: {
    defaultValue: 'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
    displayTextArea: false,
    title: 'Text',
    type: ControlType2.String,
  },
  cASqLqJU3: { defaultValue: true, title: 'Text Visible', type: ControlType2.Boolean, },
  nG9I1sRlG: { defaultValue: true, title: 'Icon Visible', type: ControlType2.Boolean, },
},);
addFonts2(FramerTHPkjzinl, [
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
  ...FeatherFonts2,
  ...getFontsFromSharedStyle(fonts3,),
  ...getFontsFromSharedStyle(fonts5,),
  ...getFontsFromSharedStyle(fonts7,),
  ...getFontsFromSharedStyle(fonts6,),
], { supportsExplicitInterCodegen: true, },);

// https :https://framerusercontent.com/modules/8iwmN4zvKpQDKQOhKPP5/lWog152Dw6rMbrCUv91N/FF233TYmj.js
var SectionTitleFonts = getFonts3(stdin_default2,);
var ButtonFonts = getFonts3(stdin_default,);
var MotionDivWithFX2 = withFX2(motion3.div,);
var ImageWithFX = withFX2(Image,);
var cycleOrder3 = ['FZPxxJjOq', 'OStzbM18C', 'RuodeXOmu', 'yVtgPmqxI',];
var serializationHash3 = 'framer-ZLRxz';
var variantClassNames3 = {
  FZPxxJjOq: 'framer-v-1usrhsu',
  OStzbM18C: 'framer-v-sitpyi',
  RuodeXOmu: 'framer-v-1ybeht9',
  yVtgPmqxI: 'framer-v-7efl8s',
};
function addPropertyOverrides3(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transition12 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var animation2 = { opacity: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, skewX: 0, skewY: 0, transformPerspective: 1200, x: 0, y: 50, };
var transition22 = { damping: 40, delay: 0.4, mass: 1, stiffness: 400, type: 'spring', };
var animation1 = { opacity: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, skewX: 0, skewY: 0, transformPerspective: 1200, x: 0, y: 0, };
var transition32 = { damping: 30, delay: 0.3, mass: 1, stiffness: 400, type: 'spring', };
var transition42 = { damping: 30, delay: 0.5, mass: 1, stiffness: 400, type: 'spring', };
var Transition3 = ({ value, children, },) => {
  const config = React3.useContext(MotionConfigContext3,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React3.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx3(MotionConfigContext3.Provider, { value: contextValue, children, },);
};
var Variants3 = motion3(React3.Fragment,);
var humanReadableVariantMap3 = { Desktop: 'FZPxxJjOq', Laptop: 'OStzbM18C', Mobile: 'yVtgPmqxI', Tablet: 'RuodeXOmu', };
var getProps3 = ({ crispUrl, height, id, width, ...props },) => {
  var _humanReadableVariantMap_props_variant, _ref;
  return {
    ...props,
    Dm4Edjd64: crispUrl !== null && crispUrl !== void 0 ? crispUrl : props.Dm4Edjd64,
    variant:
      (_ref =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap3[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref !== void 0
        ? _ref
        : 'FZPxxJjOq',
  };
};
var createLayoutDependency3 = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component3 = /* @__PURE__ */ React3.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo3();
  const { style, className: className8, layoutId, variant, Dm4Edjd64, ...restProps } = getProps3(props,);
  const { baseVariant, classNames, gestureHandlers, gestureVariant, setGestureState, setVariant, variants, } = useVariantState3({
    cycleOrder: cycleOrder3,
    defaultVariant: 'FZPxxJjOq',
    variant,
    variantClassNames: variantClassNames3,
  },);
  const layoutDependency = createLayoutDependency3(props, variants,);
  const ref1 = React3.useRef(null,);
  const defaultLayoutId = React3.useId();
  const sharedStyleClassNames = [className4,];
  const componentViewport = useComponentViewport3();
  return /* @__PURE__ */ _jsx3(LayoutGroup3, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx3(Variants3, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx3(Transition3, {
        value: transition12,
        children: /* @__PURE__ */ _jsxs3(motion3.div, {
          ...restProps,
          ...gestureHandlers,
          className: cx3(serializationHash3, ...sharedStyleClassNames, 'framer-1usrhsu', className8, classNames,),
          'data-framer-name': 'Desktop',
          layoutDependency,
          layoutId: 'FZPxxJjOq',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { backgroundColor: 'var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, rgb(8, 8, 7))', ...style, },
          ...addPropertyOverrides3(
            {
              OStzbM18C: { 'data-framer-name': 'Laptop', },
              RuodeXOmu: { 'data-framer-name': 'Tablet', },
              yVtgPmqxI: { 'data-framer-name': 'Mobile', },
            },
            baseVariant,
            gestureVariant,
          ),
          children: [
            /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
              width: `calc(${
                (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
              } * 0.56)`,
              ...addPropertyOverrides3(
                {
                  OStzbM18C: {
                    width: `calc(${
                      (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
                    } * 0.53)`,
                  },
                  RuodeXOmu: {
                    width: `calc(${
                      (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw'
                    } * 0.57)`,
                  },
                  yVtgPmqxI: {
                    width: (componentViewport === null || componentViewport === void 0 ? void 0 : componentViewport.width) || '100vw',
                  },
                },
                baseVariant,
                gestureVariant,
              ),
              children: /* @__PURE__ */ _jsx3(motion3.div, {
                className: 'framer-1a199pe-container',
                layoutDependency,
                layoutId: 'WrsYPAnA5-container',
                children: /* @__PURE__ */ _jsx3(stdin_default2, {
                  cASqLqJU3: false,
                  CUE0ztma1: 'Use Crisp in Raycast for only  $19/month',
                  height: '100%',
                  id: 'WrsYPAnA5',
                  layoutId: 'WrsYPAnA5',
                  MtTJpx7dZ: 'Get Started',
                  nG9I1sRlG: false,
                  style: { width: '100%', },
                  variant: 'ldIilTyE_',
                  width: '100%',
                  zzNuawToN:
                    'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                },),
              },),
            },),
            /* @__PURE__ */ _jsx3(RichText3, {
              __fromCanvasComponent: true,
              children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                children: /* @__PURE__ */ _jsx3(motion3.p, {
                  className: 'framer-styles-preset-15m69fh',
                  'data-styles-preset': 'DrH7EbF3F',
                  children: 'Payment is per site, unlimited operators',
                },),
              },),
              className: 'framer-10e2ga6',
              fonts: ['Inter',],
              layoutDependency,
              layoutId: 'GG3fLUy4C',
              style: { '--framer-link-text-color': 'rgb(0, 153, 255)', '--framer-link-text-decoration': 'underline', },
              verticalAlignment: 'top',
              withExternalLayout: true,
            },),
            /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
              children: /* @__PURE__ */ _jsx3(MotionDivWithFX2, {
                __framer__animate: { transition: transition22, },
                __framer__animateOnce: true,
                __framer__enter: animation2,
                __framer__styleAppearEffectEnabled: true,
                __framer__threshold: 0.5,
                __perspectiveFX: false,
                __smartComponentFX: true,
                __targetOpacity: 1,
                className: 'framer-yhwl67-container',
                layoutDependency,
                layoutId: 'WHz9rXbAH-container',
                style: { transformPerspective: 1200, },
                children: /* @__PURE__ */ _jsx3(stdin_default, {
                  c0gn5OQjt: 'Install Crisp Plugin',
                  FDhu5wZJE: Dm4Edjd64,
                  height: '100%',
                  id: 'WHz9rXbAH',
                  layoutId: 'WHz9rXbAH',
                  qyxXbxBX2: true,
                  variant: 'HpACQO_27',
                  width: '100%',
                },),
              },),
            },),
            /* @__PURE__ */ _jsx3(ImageWithFX, {
              __framer__animate: { transition: transition32, },
              __framer__animateOnce: true,
              __framer__enter: animation1,
              __framer__styleAppearEffectEnabled: true,
              __framer__threshold: 0.5,
              __perspectiveFX: false,
              __smartComponentFX: true,
              __targetOpacity: 1,
              background: {
                alt: '',
                fit: 'fill',
                intrinsicHeight: 243,
                intrinsicWidth: 179,
                pixelHeight: 243,
                pixelWidth: 179,
                src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
              },
              className: 'framer-15iblgi',
              'data-framer-name': 'Left Image',
              layoutDependency,
              layoutId: 'GfE4HEQ02',
              style: { transformPerspective: 1200, },
              ...addPropertyOverrides3(
                {
                  OStzbM18C: {
                    background: {
                      alt: '',
                      fit: 'fit',
                      intrinsicHeight: 243,
                      intrinsicWidth: 179,
                      pixelHeight: 243,
                      pixelWidth: 179,
                      positionX: 'center',
                      positionY: 'center',
                      src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
                    },
                  },
                  RuodeXOmu: {
                    background: {
                      alt: '',
                      fit: 'fit',
                      intrinsicHeight: 243,
                      intrinsicWidth: 179,
                      pixelHeight: 243,
                      pixelWidth: 179,
                      positionX: 'center',
                      positionY: 'center',
                      src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
                    },
                  },
                  yVtgPmqxI: {
                    background: {
                      alt: '',
                      fit: 'fit',
                      intrinsicHeight: 243,
                      intrinsicWidth: 179,
                      pixelHeight: 243,
                      pixelWidth: 179,
                      positionX: 'center',
                      positionY: 'center',
                      src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
                    },
                  },
                },
                baseVariant,
                gestureVariant,
              ),
            },),
            /* @__PURE__ */ _jsx3(ImageWithFX, {
              __framer__animate: { transition: transition42, },
              __framer__animateOnce: true,
              __framer__enter: animation1,
              __framer__styleAppearEffectEnabled: true,
              __framer__threshold: 0.5,
              __perspectiveFX: false,
              __smartComponentFX: true,
              __targetOpacity: 1,
              background: {
                alt: '',
                fit: 'fill',
                intrinsicHeight: 243,
                intrinsicWidth: 179,
                pixelHeight: 243,
                pixelWidth: 179,
                src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
              },
              className: 'framer-qtiat9',
              'data-framer-name': 'Right Image',
              layoutDependency,
              layoutId: 'y3RpJ0Mam',
              style: { transformPerspective: 1200, },
              ...addPropertyOverrides3(
                {
                  OStzbM18C: {
                    background: {
                      alt: '',
                      fit: 'fit',
                      intrinsicHeight: 243,
                      intrinsicWidth: 179,
                      pixelHeight: 243,
                      pixelWidth: 179,
                      positionX: 'center',
                      positionY: 'center',
                      src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
                    },
                  },
                  RuodeXOmu: {
                    background: {
                      alt: '',
                      fit: 'fit',
                      intrinsicHeight: 243,
                      intrinsicWidth: 179,
                      pixelHeight: 243,
                      pixelWidth: 179,
                      positionX: 'center',
                      positionY: 'center',
                      src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
                    },
                  },
                  yVtgPmqxI: {
                    background: {
                      alt: '',
                      fit: 'fit',
                      intrinsicHeight: 243,
                      intrinsicWidth: 179,
                      pixelHeight: 243,
                      pixelWidth: 179,
                      positionX: 'center',
                      positionY: 'center',
                      src: 'https://framerusercontent.com/images/qxQZwttXswm8z64MAq3dvPKpo.svg',
                    },
                  },
                },
                baseVariant,
                gestureVariant,
              ),
            },),
          ],
        },),
      },),
    },),
  },);
},);
var css10 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-ZLRxz.framer-1378plg, .framer-ZLRxz .framer-1378plg { display: block; }',
  '.framer-ZLRxz.framer-1usrhsu { align-content: center; align-items: center; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: center; overflow: hidden; padding: 140px 0px 140px 0px; position: relative; width: 1140px; }',
  '.framer-ZLRxz .framer-1a199pe-container { flex: none; height: auto; position: relative; width: 56%; }',
  '.framer-ZLRxz .framer-10e2ga6 { flex: none; height: auto; position: relative; white-space: pre; width: auto; }',
  '.framer-ZLRxz .framer-yhwl67-container { flex: none; height: auto; position: relative; width: auto; }',
  '.framer-ZLRxz .framer-15iblgi { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 243px; justify-content: center; left: 0px; overflow: hidden; padding: 0px; position: absolute; top: 18px; width: 16%; z-index: 1; }',
  '.framer-ZLRxz .framer-qtiat9 { align-content: center; align-items: center; bottom: 57px; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 243px; justify-content: center; overflow: hidden; padding: 0px; position: absolute; right: 0px; width: 16%; z-index: 1; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-ZLRxz.framer-1usrhsu, .framer-ZLRxz .framer-15iblgi, .framer-ZLRxz .framer-qtiat9 { gap: 0px; } .framer-ZLRxz.framer-1usrhsu > * { margin: 0px; margin-bottom: calc(32px / 2); margin-top: calc(32px / 2); } .framer-ZLRxz.framer-1usrhsu > :first-child { margin-top: 0px; } .framer-ZLRxz.framer-1usrhsu > :last-child { margin-bottom: 0px; } .framer-ZLRxz .framer-15iblgi > *, .framer-ZLRxz .framer-qtiat9 > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-ZLRxz .framer-15iblgi > :first-child, .framer-ZLRxz .framer-qtiat9 > :first-child { margin-left: 0px; } .framer-ZLRxz .framer-15iblgi > :last-child, .framer-ZLRxz .framer-qtiat9 > :last-child { margin-right: 0px; } }',
  '.framer-ZLRxz.framer-v-sitpyi.framer-1usrhsu { padding: 100px 0px 100px 0px; width: 992px; }',
  '.framer-ZLRxz.framer-v-sitpyi .framer-1a199pe-container { width: 53%; }',
  '.framer-ZLRxz.framer-v-sitpyi .framer-15iblgi { top: 0px; width: 16%; }',
  '.framer-ZLRxz.framer-v-sitpyi .framer-qtiat9 { bottom: 0px; width: 16%; }',
  '.framer-ZLRxz.framer-v-1ybeht9.framer-1usrhsu { padding: 80px 0px 80px 0px; width: 708px; }',
  '.framer-ZLRxz.framer-v-1ybeht9 .framer-1a199pe-container { width: 57%; }',
  '.framer-ZLRxz.framer-v-1ybeht9 .framer-15iblgi { height: 170px; top: 0px; width: 18%; }',
  '.framer-ZLRxz.framer-v-1ybeht9 .framer-qtiat9 { bottom: 0px; height: 170px; width: 18%; }',
  '.framer-ZLRxz.framer-v-7efl8s.framer-1usrhsu { padding: 60px 0px 60px 0px; width: 350px; }',
  '.framer-ZLRxz.framer-v-7efl8s .framer-1a199pe-container { width: 100%; }',
  '.framer-ZLRxz.framer-v-7efl8s .framer-15iblgi { height: 60px; top: 20px; width: 18%; }',
  '.framer-ZLRxz.framer-v-7efl8s .framer-qtiat9 { bottom: 0px; height: 60px; width: 18%; }',
  ...css4,
];
var FramerFF233TYmj = withCSS3(Component3, css10, 'framer-ZLRxz',);
var stdin_default3 = FramerFF233TYmj;
FramerFF233TYmj.displayName = 'PricingBanner';
FramerFF233TYmj.defaultProps = { height: 615, width: 1140, };
addPropertyControls3(FramerFF233TYmj, {
  variant: {
    options: ['FZPxxJjOq', 'OStzbM18C', 'RuodeXOmu', 'yVtgPmqxI',],
    optionTitles: ['Desktop', 'Laptop', 'Tablet', 'Mobile',],
    title: 'Variant',
    type: ControlType3.Enum,
  },
  Dm4Edjd64: { title: 'crispUrl', type: ControlType3.Link, },
},);
addFonts3(FramerFF233TYmj, [
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
  ...SectionTitleFonts,
  ...ButtonFonts,
  ...getFontsFromSharedStyle2(fonts4,),
], { supportsExplicitInterCodegen: true, },);

// virtual:pricing-banner
import { WithFramerBreakpoints, } from 'unframer';
import { jsx, } from 'react/jsx-runtime';
stdin_default3.Responsive = (props,) => {
  return /* @__PURE__ */ jsx(WithFramerBreakpoints, { Component: stdin_default3, ...props, },);
};
var pricing_banner_default = stdin_default3;
export { pricing_banner_default as default, };
