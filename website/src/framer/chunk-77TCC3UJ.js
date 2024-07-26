// @ts-nocheck
/* eslint-disable */
import { Icon, } from './chunk-BXVXQGVE.js';
import { className, css, fonts, } from './chunk-CNV3GALY.js';

// https :https://framerusercontent.com/modules/4iYP09KuoUPLvHQplCiy/chFKEVHlZUmbFHOpcnPu/n_DVZNexF.js
import { jsx as _jsx, jsxs as _jsxs, } from 'react/jsx-runtime';
import {
  addFonts,
  addPropertyControls,
  ComponentViewportProvider,
  ControlType,
  cx,
  getFonts,
  getFontsFromSharedStyle,
  Link,
  RichText,
  useComponentViewport,
  useLocaleInfo,
  useVariantState,
  withCSS,
} from 'unframer';
import { LayoutGroup, motion, MotionConfigContext, } from 'unframer';
import * as React from 'react';

// https :https://framerusercontent.com/modules/j7icFaVeLgNEYkdv6UXW/5EVmg4HdKBDpAIaz2YRX/dNJjz5Q4p.js
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
  '.framer-B4h90 .framer-styles-preset-1dpymlu:not(.rich-text-wrapper), .framer-B4h90 .framer-styles-preset-1dpymlu.rich-text-wrapper p { --framer-font-family: "Space Grotesk", "Space Grotesk Placeholder", sans-serif; --framer-font-size: 16px; --framer-font-style: normal; --framer-font-weight: 700; --framer-letter-spacing: 0em; --framer-line-height: 1.7em; --framer-paragraph-spacing: 0px; --framer-text-alignment: start; --framer-text-color: var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, #e0e8d2); --framer-text-decoration: none; --framer-text-transform: none; }',
];
var className2 = 'framer-B4h90';

// https :https://framerusercontent.com/modules/4iYP09KuoUPLvHQplCiy/chFKEVHlZUmbFHOpcnPu/n_DVZNexF.js
var FeatherFonts = getFonts(Icon,);
var enabledGestures = {
  B3GNqKG_s: { hover: true, },
  BkIMK8jhq: { hover: true, },
  HpACQO_27: { hover: true, },
  ia7uVki50: { hover: true, },
  Ny0_HBScj: { hover: true, },
};
var cycleOrder = ['ia7uVki50', 'Ny0_HBScj', 'HpACQO_27', 'BkIMK8jhq', 'B3GNqKG_s',];
var serializationHash = 'framer-fZ6QA';
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
var transition1 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
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
var createLayoutDependency = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component = /* @__PURE__ */ React.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo();
  const { style, className: className3, layoutId, variant, c0gn5OQjt, qyxXbxBX2, FDhu5wZJE, ...restProps } = getProps(props,);
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
  } = useVariantState({ cycleOrder, defaultVariant: 'ia7uVki50', enabledGestures, variant, variantClassNames, },);
  const layoutDependency = createLayoutDependency(props, variants,);
  const ref1 = React.useRef(null,);
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
        children: /* @__PURE__ */ _jsx(Link, {
          href: FDhu5wZJE,
          children: /* @__PURE__ */ _jsxs(motion.a, {
            ...restProps,
            ...gestureHandlers,
            className: `${cx(serializationHash, ...sharedStyleClassNames, 'framer-16c9l7d', className3, classNames,)} framer-e7qqvm`,
            'data-border': true,
            'data-framer-name': 'Primary',
            layoutDependency,
            layoutId: 'ia7uVki50',
            ref: ref !== null && ref !== void 0 ? ref : ref1,
            style: {
              '--border-bottom-width': '1px',
              '--border-color': 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))',
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
                fonts: ['Inter',],
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
var css3 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-fZ6QA.framer-e7qqvm, .framer-fZ6QA .framer-e7qqvm { display: block; }',
  '.framer-fZ6QA.framer-16c9l7d { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 16px; height: min-content; justify-content: center; overflow: visible; padding: 7px 24px 7px 24px; position: relative; text-decoration: none; width: min-content; }',
  '.framer-fZ6QA .framer-1x0zoee { flex: none; height: auto; position: relative; white-space: pre; width: auto; }',
  '.framer-fZ6QA .framer-bvy246 { align-content: center; align-items: center; aspect-ratio: 1 / 1; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: var(--framer-aspect-ratio-supported, 16px); justify-content: flex-end; overflow: hidden; padding: 0px; position: relative; width: 16px; }',
  '.framer-fZ6QA .framer-g861do-container, .framer-fZ6QA .framer-17dk01k-container { flex: none; height: 16px; position: relative; width: 16px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-fZ6QA.framer-16c9l7d, .framer-fZ6QA .framer-bvy246 { gap: 0px; } .framer-fZ6QA.framer-16c9l7d > * { margin: 0px; margin-left: calc(16px / 2); margin-right: calc(16px / 2); } .framer-fZ6QA.framer-16c9l7d > :first-child, .framer-fZ6QA .framer-bvy246 > :first-child { margin-left: 0px; } .framer-fZ6QA.framer-16c9l7d > :last-child, .framer-fZ6QA .framer-bvy246 > :last-child { margin-right: 0px; } .framer-fZ6QA .framer-bvy246 > * { margin: 0px; margin-left: calc(0px / 2); margin-right: calc(0px / 2); } }',
  '.framer-fZ6QA.framer-v-1ik2naf.framer-16c9l7d, .framer-fZ6QA.framer-v-5n4rj3.framer-16c9l7d { padding: 14px 24px 14px 24px; }',
  '.framer-fZ6QA.framer-v-it02uf.framer-16c9l7d, .framer-fZ6QA.framer-v-vxw3cn.framer-16c9l7d { padding: 0px; }',
  '.framer-fZ6QA.framer-v-16c9l7d.hover .framer-bvy246, .framer-fZ6QA.framer-v-1ik2naf.hover .framer-bvy246, .framer-fZ6QA.framer-v-5n4rj3.hover .framer-bvy246, .framer-fZ6QA.framer-v-it02uf.hover .framer-bvy246, .framer-fZ6QA.framer-v-vxw3cn.hover .framer-bvy246 { justify-content: flex-start; }',
  ...css2,
  ...css,
  '.framer-fZ6QA[data-border="true"]::after, .framer-fZ6QA [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
];
var Framern_DVZNexF = withCSS(Component, css3, 'framer-fZ6QA',);
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
addFonts(Framern_DVZNexF, [
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
  ...FeatherFonts,
  ...getFontsFromSharedStyle(fonts2,),
  ...getFontsFromSharedStyle(fonts,),
], { supportsExplicitInterCodegen: true, },);

export { stdin_default, };
