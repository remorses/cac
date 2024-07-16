// @ts-nocheck
/* eslint-disable */
import { className, css, fonts, } from './chunk-WNPAEZHB.js';
import { className as className2, css as css2, fonts as fonts2, Icon, } from './chunk-KWNUSLWD.js';

// https :https://framerusercontent.com/modules/4iYP09KuoUPLvHQplCiy/Puwg7Zy4LlKgQLP75nhM/n_DVZNexF.js
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
  const { style, className: className3, layoutId, variant, c0gn5OQjt, qyxXbxBX2, FDhu5wZJE, ...restProps } = getProps(props,);
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
            className: `${cx(serializationHash, ...sharedStyleClassNames, 'framer-16c9l7d', className3, classNames,)} framer-e7qqvm`,
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
var css3 = [
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
var Framern_DVZNexF = withCSS(Component, css3, 'framer-nyuCL',);
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

export { stdin_default, };
