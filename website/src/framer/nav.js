// @ts-nocheck
/* eslint-disable */
'use client';
import { stdin_default, } from './chunk-OEY7F3LW.js';
import './chunk-WNPAEZHB.js';
import { className, css, fonts, Icon, } from './chunk-KWNUSLWD.js';

// https :https://framerusercontent.com/modules/eybPXDR02454eT9wyvqB/AaTyUkZg9p96eZFyWIS0/z1yZy51UW.js
import { jsx as _jsx5, jsxs as _jsxs2, } from 'react/jsx-runtime';
import {
  addFonts as addFonts5,
  addPropertyControls as addPropertyControls4,
  ComponentViewportProvider as ComponentViewportProvider4,
  ControlType as ControlType4,
  cx as cx5,
  getFonts as getFonts4,
  getPropertyControls,
  useActiveVariantCallback as useActiveVariantCallback3,
  useComponentViewport as useComponentViewport5,
  useLocaleInfo as useLocaleInfo5,
  useVariantState as useVariantState5,
  withCSS as withCSS5,
} from 'unframer';
import { LayoutGroup as LayoutGroup5, motion as motion5, MotionConfigContext as MotionConfigContext5, } from 'unframer';
import * as React5 from 'react';

// https :https://framerusercontent.com/modules/kAkfnSOt04sdReKKUhIh/0u6hZosTUGFGO7PkZ5Zq/IV_7SD635.js
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
  useActiveVariantCallback,
  useComponentViewport,
  useLocaleInfo,
  useVariantState,
  withCSS,
} from 'unframer';
import { LayoutGroup, motion, MotionConfigContext, } from 'unframer';
import * as React from 'react';
var FeatherFonts = getFonts(Icon,);
var enabledGestures = { qoShHVBll: { hover: true, }, };
var cycleOrder = ['qoShHVBll',];
var serializationHash = 'framer-PaIEH';
var variantClassNames = { qoShHVBll: 'framer-v-1bo1b3n', };
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
var getProps = ({ height, hover, iconVisible, id, link, tap, title, width, ...props },) => {
  var _ref;
  return {
    ...props,
    cRqRWoih6: link !== null && link !== void 0 ? link : props.cRqRWoih6,
    Oc0fzh3x0: iconVisible !== null && iconVisible !== void 0 ? iconVisible : props.Oc0fzh3x0,
    okFfDCMAr: (_ref = title !== null && title !== void 0 ? title : props.okFfDCMAr) !== null && _ref !== void 0 ? _ref : 'Home',
    oxH5zj9aM: tap !== null && tap !== void 0 ? tap : props.oxH5zj9aM,
    Usq46WHfY: hover !== null && hover !== void 0 ? hover : props.Usq46WHfY,
  };
};
var createLayoutDependency = (props, variants,) => variants.join('-',) + props.layoutDependency;
var Component = /* @__PURE__ */ React.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo();
  const { style, className: className2, layoutId, variant, okFfDCMAr, cRqRWoih6, Oc0fzh3x0, oxH5zj9aM, Usq46WHfY, ...restProps } = getProps(
    props,
  );
  const { baseVariant, classNames, gestureVariant, setGestureState, setVariant, transition, variants, } = useVariantState({
    cycleOrder,
    defaultVariant: 'qoShHVBll',
    enabledGestures,
    transitions,
    variant,
    variantClassNames,
  },);
  const layoutDependency = createLayoutDependency(props, variants,);
  const { activeVariantCallback, delay, } = useActiveVariantCallback(baseVariant,);
  const onTap1k44oqp = activeVariantCallback(async (...args) => {
    setGestureState({ isPressed: false, },);
    if (oxH5zj9aM) {
      const res = await oxH5zj9aM(...args,);
      if (res === false) return false;
    }
  },);
  const onMouseEnter185usnc = activeVariantCallback(async (...args) => {
    if (Usq46WHfY) {
      const res = await Usq46WHfY(...args,);
      if (res === false) return false;
    }
  },);
  const ref1 = React.useRef(null,);
  const defaultLayoutId = React.useId();
  const sharedStyleClassNames = [className,];
  const componentViewport = useComponentViewport();
  return /* @__PURE__ */ _jsx(LayoutGroup, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx(Variants, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx(Transition, {
        value: transition,
        children: /* @__PURE__ */ _jsx(Link, {
          href: cRqRWoih6,
          openInNewTab: false,
          smoothScroll: true,
          children: /* @__PURE__ */ _jsxs(motion.a, {
            ...restProps,
            className: `${cx(serializationHash, ...sharedStyleClassNames, 'framer-1bo1b3n', className2, classNames,)} framer-13u7j1e`,
            'data-framer-name': 'Primary Navitem',
            'data-highlight': true,
            layoutDependency,
            layoutId: 'qoShHVBll',
            onHoverEnd: () => setGestureState({ isHovered: false, },),
            onHoverStart: () => setGestureState({ isHovered: true, },),
            onMouseEnter: onMouseEnter185usnc,
            onTap: onTap1k44oqp,
            onTapCancel: () => setGestureState({ isPressed: false, },),
            onTapStart: () => setGestureState({ isPressed: true, },),
            ref: ref !== null && ref !== void 0 ? ref : ref1,
            style: { ...style, },
            ...addPropertyOverrides({ 'qoShHVBll-hover': { 'data-framer-name': void 0, }, }, baseVariant, gestureVariant,),
            children: [
              /* @__PURE__ */ _jsx(RichText, {
                __fromCanvasComponent: true,
                children: /* @__PURE__ */ _jsx(React.Fragment, {
                  children: /* @__PURE__ */ _jsx(motion.p, {
                    className: 'framer-styles-preset-17ww93c',
                    'data-styles-preset': 'uMdppUE31',
                    style: {
                      '--framer-text-color':
                        'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                    },
                    children: 'Home',
                  },),
                },),
                className: 'framer-1qpi1eb',
                layoutDependency,
                layoutId: 'nFiAiLydr',
                style: {
                  '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                  '--framer-paragraph-spacing': '0px',
                },
                text: okFfDCMAr,
                variants: { 'qoShHVBll-hover': { '--extracted-r6o4lv': 'rgba(255, 255, 255, 0.6)', }, },
                verticalAlignment: 'top',
                withExternalLayout: true,
                ...addPropertyOverrides(
                  {
                    'qoShHVBll-hover': {
                      children: /* @__PURE__ */ _jsx(React.Fragment, {
                        children: /* @__PURE__ */ _jsx(motion.p, {
                          className: 'framer-styles-preset-17ww93c',
                          'data-styles-preset': 'uMdppUE31',
                          style: { '--framer-text-color': 'var(--extracted-r6o4lv, rgba(255, 255, 255, 0.6))', },
                          children: 'Home',
                        },),
                      },),
                    },
                  },
                  baseVariant,
                  gestureVariant,
                ),
              },),
              Oc0fzh3x0 && /* @__PURE__ */ _jsx(ComponentViewportProvider, {
                children: /* @__PURE__ */ _jsx(motion.div, {
                  className: 'framer-10aaz4-container',
                  layoutDependency,
                  layoutId: 'GP7VlGddj-container',
                  style: { rotate: 0, },
                  variants: { 'qoShHVBll-hover': { rotate: 180, }, },
                  children: /* @__PURE__ */ _jsx(Icon, {
                    color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                    height: '100%',
                    iconSearch: 'Home',
                    iconSelection: 'plus',
                    id: 'GP7VlGddj',
                    layoutId: 'GP7VlGddj',
                    mirrored: false,
                    selectByList: true,
                    style: { height: '100%', width: '100%', },
                    width: '100%',
                    ...addPropertyOverrides({ 'qoShHVBll-hover': { color: 'rgba(255, 255, 255, 0.6)', }, }, baseVariant, gestureVariant,),
                  },),
                },),
              },),
            ],
          },),
        },),
      },),
    },),
  },);
},);
var css2 = [
  '.framer-PaIEH[data-border="true"]::after, .framer-PaIEH [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-PaIEH.framer-13u7j1e, .framer-PaIEH .framer-13u7j1e { display: block; }',
  '.framer-PaIEH.framer-1bo1b3n { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: visible; padding: 0px 0px 0px 0px; position: relative; text-decoration: none; width: min-content; }',
  '.framer-PaIEH .framer-1qpi1eb { cursor: pointer; flex: none; height: auto; overflow: visible; position: relative; white-space: pre; width: auto; }',
  '.framer-PaIEH .framer-10aaz4-container { flex: none; height: 16px; position: relative; width: 16px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-PaIEH.framer-1bo1b3n { gap: 0px; } .framer-PaIEH.framer-1bo1b3n > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-PaIEH.framer-1bo1b3n > :first-child { margin-left: 0px; } .framer-PaIEH.framer-1bo1b3n > :last-child { margin-right: 0px; } }',
  ...css,
];
var FramerIV_7SD635 = withCSS(Component, css2, 'framer-PaIEH',);
var stdin_default2 = FramerIV_7SD635;
FramerIV_7SD635.displayName = 'Nav-item';
FramerIV_7SD635.defaultProps = { height: 27, width: 44, };
addPropertyControls(FramerIV_7SD635, {
  okFfDCMAr: { defaultValue: 'Home', displayTextArea: false, title: 'Title', type: ControlType.String, },
  cRqRWoih6: { title: 'Link', type: ControlType.Link, },
  Oc0fzh3x0: { defaultValue: false, title: 'Icon Visible', type: ControlType.Boolean, },
  oxH5zj9aM: { title: 'Tap', type: ControlType.EventHandler, },
  Usq46WHfY: { title: 'Hover', type: ControlType.EventHandler, },
},);
addFonts(FramerIV_7SD635, [...FeatherFonts, ...fonts,],);

// https :https://framerusercontent.com/modules/5Rc4A3RzO15jP4nzpdGK/WfiHNmASBA7fnb58Gyss/KcSL_pfvh.js
import { jsx as _jsx2, } from 'react/jsx-runtime';
import {
  addFonts as addFonts2,
  addPropertyControls as addPropertyControls2,
  ComponentViewportProvider as ComponentViewportProvider2,
  ControlType as ControlType2,
  cx as cx2,
  getFonts as getFonts2,
  useActiveVariantCallback as useActiveVariantCallback2,
  useComponentViewport as useComponentViewport2,
  useLocaleInfo as useLocaleInfo2,
  useVariantState as useVariantState2,
  withCSS as withCSS2,
} from 'unframer';
import { LayoutGroup as LayoutGroup2, motion as motion2, MotionConfigContext as MotionConfigContext2, } from 'unframer';
import * as React2 from 'react';
var FeatherFonts2 = getFonts2(Icon,);
var cycleOrder2 = ['iAP2FH3x9', 'IDm9Bjzb4',];
var serializationHash2 = 'framer-AIwoe';
var variantClassNames2 = { iAP2FH3x9: 'framer-v-1ri84p4', IDm9Bjzb4: 'framer-v-dimqrm', };
function addPropertyOverrides2(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transitions2 = { default: { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', }, };
var Transition2 = ({ value, children, },) => {
  const config = React2.useContext(MotionConfigContext2,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React2.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx2(MotionConfigContext2.Provider, { value: contextValue, children, },);
};
var Variants2 = motion2(React2.Fragment,);
var humanReadableVariantMap = { Humburger: 'iAP2FH3x9', x: 'IDm9Bjzb4', };
var getProps2 = ({ height, id, tap, width, ...props },) => {
  var _humanReadableVariantMap_props_variant, _ref;
  return {
    ...props,
    njNJdZBy3: tap !== null && tap !== void 0 ? tap : props.njNJdZBy3,
    variant:
      (_ref =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref !== void 0
        ? _ref
        : 'iAP2FH3x9',
  };
};
var createLayoutDependency2 = (props, variants,) => variants.join('-',) + props.layoutDependency;
var Component2 = /* @__PURE__ */ React2.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo2();
  const { style, className: className2, layoutId, variant, njNJdZBy3, ...restProps } = getProps2(props,);
  const { baseVariant, classNames, gestureVariant, setGestureState, setVariant, transition, variants, } = useVariantState2({
    cycleOrder: cycleOrder2,
    defaultVariant: 'iAP2FH3x9',
    transitions: transitions2,
    variant,
    variantClassNames: variantClassNames2,
  },);
  const layoutDependency = createLayoutDependency2(props, variants,);
  const { activeVariantCallback, delay, } = useActiveVariantCallback2(baseVariant,);
  const onTap1vty52i = activeVariantCallback(async (...args) => {
    setGestureState({ isPressed: false, },);
    if (njNJdZBy3) {
      const res = await njNJdZBy3(...args,);
      if (res === false) return false;
    }
  },);
  const ref1 = React2.useRef(null,);
  const defaultLayoutId = React2.useId();
  const sharedStyleClassNames = [];
  const componentViewport = useComponentViewport2();
  return /* @__PURE__ */ _jsx2(LayoutGroup2, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx2(Variants2, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx2(Transition2, {
        value: transition,
        children: /* @__PURE__ */ _jsx2(motion2.div, {
          ...restProps,
          className: cx2(serializationHash2, ...sharedStyleClassNames, 'framer-1ri84p4', className2, classNames,),
          'data-framer-name': 'Humburger',
          'data-highlight': true,
          layoutDependency,
          layoutId: 'iAP2FH3x9',
          onHoverEnd: () => setGestureState({ isHovered: false, },),
          onHoverStart: () => setGestureState({ isHovered: true, },),
          onTap: onTap1vty52i,
          onTapCancel: () => setGestureState({ isPressed: false, },),
          onTapStart: () => setGestureState({ isPressed: true, },),
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          ...addPropertyOverrides2({ IDm9Bjzb4: { 'data-framer-name': 'x', }, }, baseVariant, gestureVariant,),
          children: /* @__PURE__ */ _jsx2(ComponentViewportProvider2, {
            children: /* @__PURE__ */ _jsx2(motion2.div, {
              className: 'framer-1tu957g-container',
              layoutDependency,
              layoutId: 'tCFR1Cqhd-container',
              children: /* @__PURE__ */ _jsx2(Icon, {
                color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                height: '100%',
                iconSearch: 'Home',
                iconSelection: 'menu',
                id: 'tCFR1Cqhd',
                layoutId: 'tCFR1Cqhd',
                mirrored: false,
                selectByList: true,
                style: { height: '100%', width: '100%', },
                width: '100%',
                ...addPropertyOverrides2({ IDm9Bjzb4: { iconSelection: 'x', }, }, baseVariant, gestureVariant,),
              },),
            },),
          },),
        },),
      },),
    },),
  },);
},);
var css3 = [
  '.framer-AIwoe[data-border="true"]::after, .framer-AIwoe [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-AIwoe.framer-12zeeso, .framer-AIwoe .framer-12zeeso { display: block; }',
  '.framer-AIwoe.framer-1ri84p4 { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 30px; justify-content: center; overflow: hidden; padding: 0px 0px 0px 0px; position: relative; width: 30px; }',
  '.framer-AIwoe .framer-1tu957g-container { flex: 1 0 0px; height: 100%; position: relative; width: 1px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-AIwoe.framer-1ri84p4 { gap: 0px; } .framer-AIwoe.framer-1ri84p4 > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-AIwoe.framer-1ri84p4 > :first-child { margin-left: 0px; } .framer-AIwoe.framer-1ri84p4 > :last-child { margin-right: 0px; } }',
];
var FramerKcSL_pfvh = withCSS2(Component2, css3, 'framer-AIwoe',);
var stdin_default3 = FramerKcSL_pfvh;
FramerKcSL_pfvh.displayName = 'Humburger';
FramerKcSL_pfvh.defaultProps = { height: 30, width: 30, };
addPropertyControls2(FramerKcSL_pfvh, {
  variant: { options: ['iAP2FH3x9', 'IDm9Bjzb4',], optionTitles: ['Humburger', 'x',], title: 'Variant', type: ControlType2.Enum, },
  njNJdZBy3: { title: 'Tap', type: ControlType2.EventHandler, },
},);
addFonts2(FramerKcSL_pfvh, [...FeatherFonts2,],);

// https :https://framerusercontent.com/modules/rsqzAe9J1k1nyPS6N5KP/91RtidN3J7cJm1w6cSTH/QLknypMkX.js
import { jsx as _jsx4, } from 'react/jsx-runtime';
import {
  addFonts as addFonts4,
  addPropertyControls as addPropertyControls3,
  ComponentViewportProvider as ComponentViewportProvider3,
  ControlType as ControlType3,
  cx as cx4,
  getFonts as getFonts3,
  useComponentViewport as useComponentViewport4,
  useLocaleInfo as useLocaleInfo4,
  useVariantState as useVariantState4,
  withCSS as withCSS4,
} from 'unframer';
import { LayoutGroup as LayoutGroup4, motion as motion4, MotionConfigContext as MotionConfigContext4, } from 'unframer';
import * as React4 from 'react';

// https :https://framerusercontent.com/modules/dKg5rDbayEktdJbCwuB1/r0p3rFHc4mjwL7KQFCYm/CvbbKj53l.js
import { jsx as _jsx3, } from 'react/jsx-runtime';
import {
  addFonts as addFonts3,
  cx as cx3,
  RichText as RichText2,
  useComponentViewport as useComponentViewport3,
  useLocaleInfo as useLocaleInfo3,
  useVariantState as useVariantState3,
  withCSS as withCSS3,
} from 'unframer';
import { LayoutGroup as LayoutGroup3, motion as motion3, MotionConfigContext as MotionConfigContext3, } from 'unframer';
import * as React3 from 'react';
var cycleOrder3 = ['Uxpzy5_xX',];
var serializationHash3 = 'framer-hgfcA';
var variantClassNames3 = { Uxpzy5_xX: 'framer-v-pqqyrd', };
var transition1 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var transformTemplate1 = (_, t,) => `translate(-50%, -50%) ${t}`;
var Transition3 = ({ value, children, },) => {
  const config = React3.useContext(MotionConfigContext3,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React3.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx3(MotionConfigContext3.Provider, { value: contextValue, children, },);
};
var Variants3 = motion3(React3.Fragment,);
var getProps3 = ({ height, id, width, ...props },) => {
  return { ...props, };
};
var createLayoutDependency3 = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component3 = /* @__PURE__ */ React3.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo3();
  const { style, className: className2, layoutId, variant, ...restProps } = getProps3(props,);
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
  } = useVariantState3({ cycleOrder: cycleOrder3, defaultVariant: 'Uxpzy5_xX', variant, variantClassNames: variantClassNames3, },);
  const layoutDependency = createLayoutDependency3(props, variants,);
  const ref1 = React3.useRef(null,);
  const defaultLayoutId = React3.useId();
  const sharedStyleClassNames = [];
  const componentViewport = useComponentViewport3();
  return /* @__PURE__ */ _jsx3(LayoutGroup3, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx3(Variants3, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx3(Transition3, {
        value: transition1,
        children: /* @__PURE__ */ _jsx3(motion3.div, {
          ...restProps,
          ...gestureHandlers,
          className: cx3(serializationHash3, ...sharedStyleClassNames, 'framer-pqqyrd', className2, classNames,),
          'data-framer-name': 'Variant 1',
          layoutDependency,
          layoutId: 'Uxpzy5_xX',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          children: /* @__PURE__ */ _jsx3(RichText2, {
            __fromCanvasComponent: true,
            children: /* @__PURE__ */ _jsx3(React3.Fragment, {
              children: /* @__PURE__ */ _jsx3(motion3.p, {
                style: {
                  '--font-selector': 'SW50ZXItQm9sZA==',
                  '--framer-font-family': '"Inter", "Inter Placeholder", sans-serif',
                  '--framer-font-size': '32px',
                  '--framer-font-weight': '700',
                  '--framer-text-color': 'var(--extracted-r6o4lv, rgb(255, 255, 255))',
                },
                children: 'Unframer',
              },),
            },),
            className: 'framer-12m4vis',
            fonts: ['Inter-Bold',],
            layoutDependency,
            layoutId: 'JOhEsiuEK',
            style: {
              '--extracted-r6o4lv': 'rgb(255, 255, 255)',
              '--framer-link-text-color': 'rgb(0, 153, 255)',
              '--framer-link-text-decoration': 'underline',
            },
            transformTemplate: transformTemplate1,
            verticalAlignment: 'top',
            withExternalLayout: true,
          },),
        },),
      },),
    },),
  },);
},);
var css4 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-hgfcA.framer-96ueo9, .framer-hgfcA .framer-96ueo9 { display: block; }',
  '.framer-hgfcA.framer-pqqyrd { align-content: center; align-items: center; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; min-height: 38px; min-width: 227px; overflow: visible; padding: 0px; position: relative; width: min-content; }',
  '.framer-hgfcA .framer-12m4vis { flex: none; height: auto; left: 50%; position: absolute; top: 50%; white-space: pre; width: auto; z-index: 1; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-hgfcA.framer-pqqyrd { gap: 0px; } .framer-hgfcA.framer-pqqyrd > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-hgfcA.framer-pqqyrd > :first-child { margin-left: 0px; } .framer-hgfcA.framer-pqqyrd > :last-child { margin-right: 0px; } }',
];
var FramerCvbbKj53l = withCSS3(Component3, css4, 'framer-hgfcA',);
var stdin_default4 = FramerCvbbKj53l;
FramerCvbbKj53l.displayName = 'logo for export';
FramerCvbbKj53l.defaultProps = { height: 38, width: 227, };
addFonts3(FramerCvbbKj53l, [{
  explicitInter: true,
  fonts: [{
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange: 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    url: 'https://app.framerstatic.com/Inter-Bold.cyrillic-ext-XOTVL7ZR.woff2',
    weight: '700',
  }, {
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    url: 'https://app.framerstatic.com/Inter-Bold.cyrillic-6LOMBC2V.woff2',
    weight: '700',
  }, {
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange: 'U+1F00-1FFF',
    url: 'https://app.framerstatic.com/Inter-Bold.greek-ext-WXWSJXLB.woff2',
    weight: '700',
  }, {
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange: 'U+0370-03FF',
    url: 'https://app.framerstatic.com/Inter-Bold.greek-YRST7ODZ.woff2',
    weight: '700',
  }, {
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange: 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    url: 'https://app.framerstatic.com/Inter-Bold.latin-ext-BASA5UL3.woff2',
    weight: '700',
  }, {
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange:
      'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    url: 'https://app.framerstatic.com/Inter-Bold.latin-UCM45LQF.woff2',
    weight: '700',
  }, {
    family: 'Inter',
    source: 'framer',
    style: 'normal',
    unicodeRange: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    url: 'https://app.framerstatic.com/Inter-Bold.vietnamese-OEVJMXEP.woff2',
    weight: '700',
  },],
},], { supportsExplicitInterCodegen: true, },);

// https :https://framerusercontent.com/modules/rsqzAe9J1k1nyPS6N5KP/91RtidN3J7cJm1w6cSTH/QLknypMkX.js
var LogoForExportFonts = getFonts3(stdin_default4,);
var cycleOrder4 = ['r7yJpDHnU', 'RZ0MIa4cE',];
var serializationHash4 = 'framer-QhBny';
var variantClassNames4 = { r7yJpDHnU: 'framer-v-1qy582a', RZ0MIa4cE: 'framer-v-1pwnl9k', };
function addPropertyOverrides3(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transition12 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var Transition4 = ({ value, children, },) => {
  const config = React4.useContext(MotionConfigContext4,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React4.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx4(MotionConfigContext4.Provider, { value: contextValue, children, },);
};
var Variants4 = motion4(React4.Fragment,);
var humanReadableVariantMap2 = { ' Main Logo': 'r7yJpDHnU', 'Footer Logo': 'RZ0MIa4cE', };
var getProps4 = ({ height, id, width, ...props },) => {
  var _humanReadableVariantMap_props_variant, _ref;
  return {
    ...props,
    variant:
      (_ref =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap2[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref !== void 0
        ? _ref
        : 'r7yJpDHnU',
  };
};
var createLayoutDependency4 = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component4 = /* @__PURE__ */ React4.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo4();
  const { style, className: className2, layoutId, variant, ...restProps } = getProps4(props,);
  const { baseVariant, classNames, gestureHandlers, gestureVariant, setGestureState, setVariant, variants, } = useVariantState4({
    cycleOrder: cycleOrder4,
    defaultVariant: 'r7yJpDHnU',
    variant,
    variantClassNames: variantClassNames4,
  },);
  const layoutDependency = createLayoutDependency4(props, variants,);
  const ref1 = React4.useRef(null,);
  const defaultLayoutId = React4.useId();
  const sharedStyleClassNames = [];
  const componentViewport = useComponentViewport4();
  return /* @__PURE__ */ _jsx4(LayoutGroup4, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx4(Variants4, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx4(Transition4, {
        value: transition12,
        children: /* @__PURE__ */ _jsx4(motion4.div, {
          ...restProps,
          ...gestureHandlers,
          background: { alt: '', fit: 'fill', intrinsicHeight: 41, intrinsicWidth: 157, },
          className: cx4(serializationHash4, ...sharedStyleClassNames, 'framer-1qy582a', className2, classNames,),
          'data-framer-name': ' Main Logo',
          layoutDependency,
          layoutId: 'r7yJpDHnU',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          ...addPropertyOverrides3(
            {
              RZ0MIa4cE: {
                'data-framer-name': 'Footer Logo',
                background: {
                  alt: '',
                  fit: 'fill',
                  intrinsicHeight: 49,
                  intrinsicWidth: 182,
                  pixelHeight: 49,
                  pixelWidth: 182,
                  src: 'https://framerusercontent.com/images/OsC9H711Vwl2gg8Ui39OXQ97hGE.svg',
                },
              },
            },
            baseVariant,
            gestureVariant,
          ),
          children: /* @__PURE__ */ _jsx4(ComponentViewportProvider3, {
            width: '227px',
            children: /* @__PURE__ */ _jsx4(motion4.div, {
              className: 'framer-103kglx-container',
              layoutDependency,
              layoutId: 'TQ9EoWeEd-container',
              children: /* @__PURE__ */ _jsx4(stdin_default4, {
                height: '100%',
                id: 'TQ9EoWeEd',
                layoutId: 'TQ9EoWeEd',
                style: { height: '100%', width: '100%', },
                width: '100%',
              },),
            },),
          },),
        },),
      },),
    },),
  },);
},);
var css5 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-QhBny.framer-cqg0gv, .framer-QhBny .framer-cqg0gv { display: block; }',
  '.framer-QhBny.framer-1qy582a { align-content: center; align-items: center; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: min-content; }',
  '.framer-QhBny .framer-103kglx-container { flex: none; height: 38px; position: relative; width: 227px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-QhBny.framer-1qy582a { gap: 0px; } .framer-QhBny.framer-1qy582a > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-QhBny.framer-1qy582a > :first-child { margin-left: 0px; } .framer-QhBny.framer-1qy582a > :last-child { margin-right: 0px; } }',
  '.framer-QhBny.framer-v-1pwnl9k.framer-1qy582a { height: 49px; }',
];
var FramerQLknypMkX = withCSS4(Component4, css5, 'framer-QhBny',);
var stdin_default5 = FramerQLknypMkX;
FramerQLknypMkX.displayName = 'Logo';
FramerQLknypMkX.defaultProps = { height: 38, width: 227, };
addPropertyControls3(FramerQLknypMkX, {
  variant: {
    options: ['r7yJpDHnU', 'RZ0MIa4cE',],
    optionTitles: [' Main Logo', 'Footer Logo',],
    title: 'Variant',
    type: ControlType3.Enum,
  },
},);
addFonts4(FramerQLknypMkX, [{ explicitInter: true, fonts: [], }, ...LogoForExportFonts,], { supportsExplicitInterCodegen: true, },);

// https :https://framerusercontent.com/modules/eybPXDR02454eT9wyvqB/AaTyUkZg9p96eZFyWIS0/z1yZy51UW.js
var LogoFonts = getFonts4(stdin_default5,);
var ButtonFonts = getFonts4(stdin_default,);
var HumburgerFonts = getFonts4(stdin_default3,);
var NavItemFonts = getFonts4(stdin_default2,);
var ButtonControls = getPropertyControls(stdin_default,);
var cycleOrder5 = ['PIJxfYPv6', 'SfXEEgt7N', 'lysKx_KqM', 'cA5Gc6Uvb', 'bhi1WOHr4', 'svojC3A6f',];
var serializationHash5 = 'framer-bEk07';
var variantClassNames5 = {
  bhi1WOHr4: 'framer-v-mr7jln',
  cA5Gc6Uvb: 'framer-v-36d0y8',
  lysKx_KqM: 'framer-v-1jl5n4c',
  PIJxfYPv6: 'framer-v-rby1wd',
  SfXEEgt7N: 'framer-v-142awqt',
  svojC3A6f: 'framer-v-1pxpfor',
};
function addPropertyOverrides4(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transition13 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var Transition5 = ({ value, children, },) => {
  const config = React5.useContext(MotionConfigContext5,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React5.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx5(MotionConfigContext5.Provider, { value: contextValue, children, },);
};
var Variants5 = motion5(React5.Fragment,);
var humanReadableEnumMap = {
  ' Login button': 'BkIMK8jhq',
  'Button text': 'B3GNqKG_s',
  Primary: 'ia7uVki50',
  Secondary: 'Ny0_HBScj',
  Tertiary: 'HpACQO_27',
};
var humanReadableVariantMap3 = {
  'Mobile Open': 'svojC3A6f',
  'Tablet Open': 'bhi1WOHr4',
  Desktop: 'PIJxfYPv6',
  Laptop: 'SfXEEgt7N',
  Mobile: 'cA5Gc6Uvb',
  Tablet: 'lysKx_KqM',
};
var getProps5 = ({ crispPlugin, ctaVariant, height, id, raycastUrl, width, ...props },) => {
  var _humanReadableVariantMap_props_variant, _ref, _humanReadableEnumMap_ctaVariant, _ref1, _ref2;
  return {
    ...props,
    J_QbTJlEC: crispPlugin !== null && crispPlugin !== void 0 ? crispPlugin : props.J_QbTJlEC,
    sCRIQGxNC: raycastUrl !== null && raycastUrl !== void 0 ? raycastUrl : props.sCRIQGxNC,
    variant:
      (_ref =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap3[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref !== void 0
        ? _ref
        : 'PIJxfYPv6',
    XulbJsERc:
      (_ref2 =
            (_ref1 =
                  (_humanReadableEnumMap_ctaVariant = humanReadableEnumMap[ctaVariant]) !== null &&
                    _humanReadableEnumMap_ctaVariant !== void 0
                    ? _humanReadableEnumMap_ctaVariant
                    : ctaVariant) !== null && _ref1 !== void 0
              ? _ref1
              : props.XulbJsERc) !== null && _ref2 !== void 0
        ? _ref2
        : 'ia7uVki50',
  };
};
var createLayoutDependency5 = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component5 = /* @__PURE__ */ React5.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo5();
  const { style, className: className2, layoutId, variant, sCRIQGxNC, J_QbTJlEC, XulbJsERc, ...restProps } = getProps5(props,);
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
  } = useVariantState5({ cycleOrder: cycleOrder5, defaultVariant: 'PIJxfYPv6', variant, variantClassNames: variantClassNames5, },);
  const layoutDependency = createLayoutDependency5(props, variants,);
  const { activeVariantCallback, delay, } = useActiveVariantCallback3(baseVariant,);
  const njNJdZBy3erovxf = activeVariantCallback(async (...args) => {
    setVariant('bhi1WOHr4',);
  },);
  const njNJdZBy3kj9xvl = activeVariantCallback(async (...args) => {
    setVariant('svojC3A6f',);
  },);
  const njNJdZBy31e2fd7j = activeVariantCallback(async (...args) => {
    setVariant('lysKx_KqM',);
  },);
  const njNJdZBy31ykmy3a = activeVariantCallback(async (...args) => {
    setVariant('cA5Gc6Uvb',);
  },);
  const ref1 = React5.useRef(null,);
  const isDisplayed = () => {
    if (['lysKx_KqM', 'cA5Gc6Uvb', 'bhi1WOHr4', 'svojC3A6f',].includes(baseVariant,)) return true;
    return false;
  };
  const isDisplayed1 = () => {
    if (['cA5Gc6Uvb', 'svojC3A6f',].includes(baseVariant,)) return false;
    return true;
  };
  const isDisplayed2 = () => {
    if (['lysKx_KqM', 'cA5Gc6Uvb',].includes(baseVariant,)) return false;
    return true;
  };
  const isDisplayed3 = () => {
    if (['lysKx_KqM', 'cA5Gc6Uvb', 'bhi1WOHr4', 'svojC3A6f',].includes(baseVariant,)) return false;
    return true;
  };
  const defaultLayoutId = React5.useId();
  const sharedStyleClassNames = [];
  const componentViewport = useComponentViewport5();
  return /* @__PURE__ */ _jsx5(LayoutGroup5, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx5(Variants5, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx5(Transition5, {
        value: transition13,
        children: /* @__PURE__ */ _jsxs2(motion5.div, {
          ...restProps,
          ...gestureHandlers,
          className: cx5(serializationHash5, ...sharedStyleClassNames, 'framer-rby1wd', className2, classNames,),
          'data-framer-name': 'Desktop',
          layoutDependency,
          layoutId: 'PIJxfYPv6',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { backgroundColor: 'var(--token-ff9d48bd-ec1e-45fc-b308-fcfb34b4089f, rgb(8, 8, 7))', ...style, },
          ...addPropertyOverrides4(
            {
              bhi1WOHr4: { 'data-framer-name': 'Tablet Open', },
              cA5Gc6Uvb: { 'data-framer-name': 'Mobile', },
              lysKx_KqM: { 'data-framer-name': 'Tablet', },
              SfXEEgt7N: { 'data-framer-name': 'Laptop', },
              svojC3A6f: { 'data-framer-name': 'Mobile Open', },
            },
            baseVariant,
            gestureVariant,
          ),
          children: [
            /* @__PURE__ */ _jsxs2(motion5.div, {
              className: 'framer-ngvcdi',
              'data-framer-name': 'Brand Logo',
              layoutDependency,
              layoutId: 'JJ1eSMPFM',
              children: [
                /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                  children: /* @__PURE__ */ _jsx5(motion5.div, {
                    className: 'framer-77vk0l-container',
                    layoutDependency,
                    layoutId: 'AtKOstdKS-container',
                    children: /* @__PURE__ */ _jsx5(stdin_default5, {
                      height: '100%',
                      id: 'AtKOstdKS',
                      layoutId: 'AtKOstdKS',
                      variant: 'r7yJpDHnU',
                      width: '100%',
                    },),
                  },),
                },),
                isDisplayed() && /* @__PURE__ */ _jsxs2(motion5.div, {
                  className: 'framer-1anabdq',
                  'data-framer-name': 'Button & Burger',
                  layoutDependency,
                  layoutId: 'sa2WG7w_F',
                  style: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, },
                  children: [
                    isDisplayed1() && /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                      children: /* @__PURE__ */ _jsx5(motion5.div, {
                        className: 'framer-gisono-container',
                        layoutDependency,
                        layoutId: 'z9Zab0lRw-container',
                        children: /* @__PURE__ */ _jsx5(stdin_default, {
                          c0gn5OQjt: 'Create Free Account',
                          height: '100%',
                          id: 'z9Zab0lRw',
                          layoutId: 'z9Zab0lRw',
                          qyxXbxBX2: true,
                          variant: 'ia7uVki50',
                          width: '100%',
                          ...addPropertyOverrides4(
                            {
                              bhi1WOHr4: { c0gn5OQjt: 'Install Crisp Plugin', FDhu5wZJE: J_QbTJlEC, },
                              lysKx_KqM: { c0gn5OQjt: 'Install Crisp Plugin', FDhu5wZJE: J_QbTJlEC, },
                            },
                            baseVariant,
                            gestureVariant,
                          ),
                        },),
                      },),
                    },),
                    isDisplayed() && /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                      ...addPropertyOverrides4(
                        {
                          bhi1WOHr4: { width: '30px', },
                          cA5Gc6Uvb: { width: '30px', },
                          lysKx_KqM: { width: '30px', },
                          svojC3A6f: { width: '30px', },
                        },
                        baseVariant,
                        gestureVariant,
                      ),
                      children: /* @__PURE__ */ _jsx5(motion5.div, {
                        className: 'framer-tkwaqo-container',
                        layoutDependency,
                        layoutId: 'PyUIDTbLw-container',
                        children: /* @__PURE__ */ _jsx5(stdin_default3, {
                          height: '100%',
                          id: 'PyUIDTbLw',
                          layoutId: 'PyUIDTbLw',
                          style: { height: '100%', width: '100%', },
                          variant: 'iAP2FH3x9',
                          width: '100%',
                          ...addPropertyOverrides4(
                            {
                              bhi1WOHr4: { njNJdZBy3: njNJdZBy31e2fd7j, variant: 'IDm9Bjzb4', },
                              cA5Gc6Uvb: { njNJdZBy3: njNJdZBy3kj9xvl, },
                              lysKx_KqM: { njNJdZBy3: njNJdZBy3erovxf, },
                              svojC3A6f: { njNJdZBy3: njNJdZBy31ykmy3a, variant: 'IDm9Bjzb4', },
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
            isDisplayed2() && /* @__PURE__ */ _jsxs2(motion5.div, {
              className: 'framer-ax9b8j',
              'data-framer-name': 'Menu',
              layoutDependency,
              layoutId: 'WvJJy7sE2',
              style: { backgroundColor: 'rgba(25, 23, 30, 0)', },
              variants: {
                bhi1WOHr4: { backgroundColor: 'var(--token-4bd7eeba-669e-49ab-85d5-91da45add9b3, rgb(21, 21, 20))', },
                svojC3A6f: { backgroundColor: 'var(--token-4bd7eeba-669e-49ab-85d5-91da45add9b3, rgb(21, 21, 20))', },
              },
              children: [
                /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                  children: /* @__PURE__ */ _jsx5(motion5.div, {
                    className: 'framer-2t7uhd-container',
                    layoutDependency,
                    layoutId: 'Q8utu2XNO-container',
                    children: /* @__PURE__ */ _jsx5(stdin_default2, {
                      cRqRWoih6: sCRIQGxNC,
                      height: '100%',
                      id: 'Q8utu2XNO',
                      layoutId: 'Q8utu2XNO',
                      Oc0fzh3x0: false,
                      okFfDCMAr: 'Raycast Extension',
                      width: '100%',
                    },),
                  },),
                },),
                /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                  children: /* @__PURE__ */ _jsx5(motion5.div, {
                    className: 'framer-1ve9mmr-container',
                    layoutDependency,
                    layoutId: 'O4xaKWzz3-container',
                    children: /* @__PURE__ */ _jsx5(stdin_default2, {
                      cRqRWoih6: J_QbTJlEC,
                      height: '100%',
                      id: 'O4xaKWzz3',
                      layoutId: 'O4xaKWzz3',
                      Oc0fzh3x0: false,
                      okFfDCMAr: 'Crisp Plugin',
                      width: '100%',
                    },),
                  },),
                },),
                /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                  children: /* @__PURE__ */ _jsx5(motion5.div, {
                    className: 'framer-1noh2l7-container',
                    layoutDependency,
                    layoutId: 'OKoJyaxGH-container',
                    children: /* @__PURE__ */ _jsx5(stdin_default2, {
                      cRqRWoih6: 'mailto:tommy@holocron.so',
                      height: '100%',
                      id: 'OKoJyaxGH',
                      layoutId: 'OKoJyaxGH',
                      Oc0fzh3x0: false,
                      okFfDCMAr: 'Contact',
                      width: '100%',
                    },),
                  },),
                },),
              ],
            },),
            isDisplayed3() && /* @__PURE__ */ _jsx5(motion5.div, {
              className: 'framer-f0sqla',
              'data-framer-name': 'Button & Burger',
              layoutDependency,
              layoutId: 'Ipz1EhCDB',
              style: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, },
              children: /* @__PURE__ */ _jsx5(ComponentViewportProvider4, {
                children: /* @__PURE__ */ _jsx5(motion5.div, {
                  className: 'framer-y3oc9a-container',
                  layoutDependency,
                  layoutId: 'ggwuhATBf-container',
                  children: /* @__PURE__ */ _jsx5(stdin_default, {
                    c0gn5OQjt: 'Install Crisp Plugin',
                    FDhu5wZJE: J_QbTJlEC,
                    height: '100%',
                    id: 'ggwuhATBf',
                    layoutId: 'ggwuhATBf',
                    qyxXbxBX2: true,
                    variant: XulbJsERc,
                    width: '100%',
                  },),
                },),
              },),
            },),
          ],
        },),
      },),
    },),
  },);
},);
var css6 = [
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-bEk07.framer-13ww7nw, .framer-bEk07 .framer-13ww7nw { display: block; }',
  '.framer-bEk07.framer-rby1wd { align-content: center; align-items: center; display: flex; flex-direction: row; flex-wrap: nowrap; height: min-content; justify-content: space-between; padding: 22px 0px 22px 0px; position: relative; width: 1296px; }',
  '.framer-bEk07 .framer-ngvcdi { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: min-content; }',
  '.framer-bEk07 .framer-77vk0l-container, .framer-bEk07 .framer-gisono-container, .framer-bEk07 .framer-2t7uhd-container, .framer-bEk07 .framer-1ve9mmr-container, .framer-bEk07 .framer-1noh2l7-container, .framer-bEk07 .framer-y3oc9a-container { flex: none; height: auto; position: relative; width: auto; }',
  '.framer-bEk07 .framer-1anabdq, .framer-bEk07 .framer-f0sqla { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: min-content; }',
  '.framer-bEk07 .framer-tkwaqo-container { flex: none; height: 30px; position: relative; width: 30px; }',
  '.framer-bEk07 .framer-ax9b8j { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: min-content; z-index: 6; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-bEk07 .framer-ngvcdi, .framer-bEk07 .framer-1anabdq, .framer-bEk07 .framer-ax9b8j, .framer-bEk07 .framer-f0sqla { gap: 0px; } .framer-bEk07 .framer-ngvcdi > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-bEk07 .framer-ngvcdi > :first-child, .framer-bEk07 .framer-1anabdq > :first-child, .framer-bEk07 .framer-ax9b8j > :first-child, .framer-bEk07 .framer-f0sqla > :first-child { margin-left: 0px; } .framer-bEk07 .framer-ngvcdi > :last-child, .framer-bEk07 .framer-1anabdq > :last-child, .framer-bEk07 .framer-ax9b8j > :last-child, .framer-bEk07 .framer-f0sqla > :last-child { margin-right: 0px; } .framer-bEk07 .framer-1anabdq > *, .framer-bEk07 .framer-ax9b8j > *, .framer-bEk07 .framer-f0sqla > * { margin: 0px; margin-left: calc(32px / 2); margin-right: calc(32px / 2); } }',
  '.framer-bEk07.framer-v-142awqt.framer-rby1wd { padding: 22px 30px 22px 30px; width: 1000px; }',
  '.framer-bEk07.framer-v-142awqt .framer-ax9b8j { gap: 27px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-bEk07.framer-v-142awqt .framer-ax9b8j { gap: 0px; } .framer-bEk07.framer-v-142awqt .framer-ax9b8j > * { margin: 0px; margin-left: calc(27px / 2); margin-right: calc(27px / 2); } .framer-bEk07.framer-v-142awqt .framer-ax9b8j > :first-child { margin-left: 0px; } .framer-bEk07.framer-v-142awqt .framer-ax9b8j > :last-child { margin-right: 0px; } }',
  '.framer-bEk07.framer-v-1jl5n4c.framer-rby1wd { flex-direction: column; gap: 24px; justify-content: center; padding: 15px 30px 15px 30px; width: 810px; }',
  '.framer-bEk07.framer-v-1jl5n4c .framer-ngvcdi, .framer-bEk07.framer-v-36d0y8 .framer-ngvcdi, .framer-bEk07.framer-v-mr7jln .framer-ngvcdi { gap: unset; justify-content: space-between; width: 100%; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-bEk07.framer-v-1jl5n4c.framer-rby1wd, .framer-bEk07.framer-v-1jl5n4c .framer-ngvcdi { gap: 0px; } .framer-bEk07.framer-v-1jl5n4c.framer-rby1wd > * { margin: 0px; margin-bottom: calc(24px / 2); margin-top: calc(24px / 2); } .framer-bEk07.framer-v-1jl5n4c.framer-rby1wd > :first-child { margin-top: 0px; } .framer-bEk07.framer-v-1jl5n4c.framer-rby1wd > :last-child { margin-bottom: 0px; } .framer-bEk07.framer-v-1jl5n4c .framer-ngvcdi > *, .framer-bEk07.framer-v-1jl5n4c .framer-ngvcdi > :first-child, .framer-bEk07.framer-v-1jl5n4c .framer-ngvcdi > :last-child { margin: 0px; } }',
  '.framer-bEk07.framer-v-36d0y8.framer-rby1wd { flex-direction: column; gap: 24px; justify-content: center; padding: 15px 20px 15px 20px; width: 527px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-bEk07.framer-v-36d0y8.framer-rby1wd, .framer-bEk07.framer-v-36d0y8 .framer-ngvcdi { gap: 0px; } .framer-bEk07.framer-v-36d0y8.framer-rby1wd > * { margin: 0px; margin-bottom: calc(24px / 2); margin-top: calc(24px / 2); } .framer-bEk07.framer-v-36d0y8.framer-rby1wd > :first-child { margin-top: 0px; } .framer-bEk07.framer-v-36d0y8.framer-rby1wd > :last-child { margin-bottom: 0px; } .framer-bEk07.framer-v-36d0y8 .framer-ngvcdi > *, .framer-bEk07.framer-v-36d0y8 .framer-ngvcdi > :first-child, .framer-bEk07.framer-v-36d0y8 .framer-ngvcdi > :last-child { margin: 0px; } }',
  '.framer-bEk07.framer-v-mr7jln.framer-rby1wd { flex-direction: column; gap: 24px; justify-content: center; padding: 15px 30px 0px 30px; width: 810px; }',
  '.framer-bEk07.framer-v-mr7jln .framer-ax9b8j { align-content: flex-start; align-items: flex-start; flex-direction: column; gap: 12px; padding: 32px; width: 108%; z-index: 1; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-bEk07.framer-v-mr7jln.framer-rby1wd, .framer-bEk07.framer-v-mr7jln .framer-ngvcdi, .framer-bEk07.framer-v-mr7jln .framer-ax9b8j { gap: 0px; } .framer-bEk07.framer-v-mr7jln.framer-rby1wd > * { margin: 0px; margin-bottom: calc(24px / 2); margin-top: calc(24px / 2); } .framer-bEk07.framer-v-mr7jln.framer-rby1wd > :first-child, .framer-bEk07.framer-v-mr7jln .framer-ax9b8j > :first-child { margin-top: 0px; } .framer-bEk07.framer-v-mr7jln.framer-rby1wd > :last-child, .framer-bEk07.framer-v-mr7jln .framer-ax9b8j > :last-child { margin-bottom: 0px; } .framer-bEk07.framer-v-mr7jln .framer-ngvcdi > *, .framer-bEk07.framer-v-mr7jln .framer-ngvcdi > :first-child, .framer-bEk07.framer-v-mr7jln .framer-ngvcdi > :last-child { margin: 0px; } .framer-bEk07.framer-v-mr7jln .framer-ax9b8j > * { margin: 0px; margin-bottom: calc(12px / 2); margin-top: calc(12px / 2); } }',
  '.framer-bEk07.framer-v-1pxpfor.framer-rby1wd { flex-direction: column; gap: 24px; justify-content: center; padding: 15px 0px 0px 0px; width: 390px; }',
  '.framer-bEk07.framer-v-1pxpfor .framer-ngvcdi { gap: unset; justify-content: space-between; padding: 0px 20px 0px 20px; width: 100%; }',
  '.framer-bEk07.framer-v-1pxpfor .framer-ax9b8j { align-content: flex-start; align-items: flex-start; flex-direction: column; gap: 12px; padding: 20px 15px 20px 15px; width: 100%; z-index: 1; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-bEk07.framer-v-1pxpfor.framer-rby1wd, .framer-bEk07.framer-v-1pxpfor .framer-ngvcdi, .framer-bEk07.framer-v-1pxpfor .framer-ax9b8j { gap: 0px; } .framer-bEk07.framer-v-1pxpfor.framer-rby1wd > * { margin: 0px; margin-bottom: calc(24px / 2); margin-top: calc(24px / 2); } .framer-bEk07.framer-v-1pxpfor.framer-rby1wd > :first-child, .framer-bEk07.framer-v-1pxpfor .framer-ax9b8j > :first-child { margin-top: 0px; } .framer-bEk07.framer-v-1pxpfor.framer-rby1wd > :last-child, .framer-bEk07.framer-v-1pxpfor .framer-ax9b8j > :last-child { margin-bottom: 0px; } .framer-bEk07.framer-v-1pxpfor .framer-ngvcdi > *, .framer-bEk07.framer-v-1pxpfor .framer-ngvcdi > :first-child, .framer-bEk07.framer-v-1pxpfor .framer-ngvcdi > :last-child { margin: 0px; } .framer-bEk07.framer-v-1pxpfor .framer-ax9b8j > * { margin: 0px; margin-bottom: calc(12px / 2); margin-top: calc(12px / 2); } }',
];
var Framerz1yZy51UW = withCSS5(Component5, css6, 'framer-bEk07',);
var stdin_default6 = Framerz1yZy51UW;
Framerz1yZy51UW.displayName = 'Navigation';
Framerz1yZy51UW.defaultProps = { height: 85, width: 1296, };
addPropertyControls4(Framerz1yZy51UW, {
  variant: {
    options: ['PIJxfYPv6', 'SfXEEgt7N', 'lysKx_KqM', 'cA5Gc6Uvb', 'bhi1WOHr4', 'svojC3A6f',],
    optionTitles: ['Desktop', 'Laptop', 'Tablet', 'Mobile', 'Tablet Open', 'Mobile Open',],
    title: 'Variant',
    type: ControlType4.Enum,
  },
  sCRIQGxNC: { title: 'raycastUrl', type: ControlType4.Link, },
  J_QbTJlEC: { title: 'crispPlugin', type: ControlType4.Link, },
  XulbJsERc: (ButtonControls === null || ButtonControls === void 0 ? void 0 : ButtonControls['variant']) &&
    { ...ButtonControls['variant'], defaultValue: 'ia7uVki50', description: void 0, hidden: void 0, title: 'ctaVariant', },
},);
addFonts5(Framerz1yZy51UW, [{ explicitInter: true, fonts: [], }, ...LogoFonts, ...ButtonFonts, ...HumburgerFonts, ...NavItemFonts,], {
  supportsExplicitInterCodegen: true,
},);

// virtual:nav
import { WithFramerBreakpoints, } from 'unframer';
import { jsx, } from 'react/jsx-runtime';
stdin_default6.Responsive = (props,) => {
  return /* @__PURE__ */ jsx(WithFramerBreakpoints, { Component: stdin_default6, ...props, },);
};
var nav_default = stdin_default6;
export { nav_default as default, };
