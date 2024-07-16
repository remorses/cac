// @ts-nocheck
/* eslint-disable */
'use client';
import { className as className3, css as css3, fonts as fonts3, } from './chunk-VHAJRWMR.js';
import { className as className2, css as css2, fonts as fonts2, } from './chunk-W6H3PCSD.js';
import { className, css, fonts, Icon, } from './chunk-KWNUSLWD.js';

// https :https://framerusercontent.com/modules/q1D2sJbULK2vEKNABm4p/4oe8dVmmOUeHIFH61Xz3/NizLRy1Ia.js
import { jsx as _jsx3, jsxs as _jsxs2, } from 'react/jsx-runtime';
import {
  addFonts as addFonts3,
  addPropertyControls as addPropertyControls3,
  ComponentViewportProvider as ComponentViewportProvider3,
  ControlType as ControlType3,
  cx as cx3,
  getFonts as getFonts3,
  getFontsFromSharedStyle,
  ResolveLinks,
  RichText as RichText2,
  useComponentViewport as useComponentViewport3,
  useLocaleInfo as useLocaleInfo3,
  useRouter,
  useVariantState as useVariantState3,
  withCSS as withCSS3,
} from 'unframer';
import { LayoutGroup as LayoutGroup3, motion as motion3, MotionConfigContext as MotionConfigContext3, } from 'unframer';
import * as React3 from 'react';

// https :https://framerusercontent.com/modules/ncTpzEiw3qNOep3VTZcG/3aEAyRlZV6QPh0MaDd3X/IV_7SD635.js
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
  const { style, className: className4, layoutId, variant, okFfDCMAr, cRqRWoih6, Oc0fzh3x0, oxH5zj9aM, Usq46WHfY, ...restProps } = getProps(
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
            className: `${cx(serializationHash, ...sharedStyleClassNames, 'framer-1bo1b3n', className4, classNames,)} framer-13u7j1e`,
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
var css4 = [
  '.framer-PaIEH[data-border="true"]::after, .framer-PaIEH [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-PaIEH.framer-13u7j1e, .framer-PaIEH .framer-13u7j1e { display: block; }',
  '.framer-PaIEH.framer-1bo1b3n { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: visible; padding: 0px 0px 0px 0px; position: relative; text-decoration: none; width: min-content; }',
  '.framer-PaIEH .framer-1qpi1eb { cursor: pointer; flex: none; height: auto; overflow: visible; position: relative; white-space: pre; width: auto; }',
  '.framer-PaIEH .framer-10aaz4-container { flex: none; height: 16px; position: relative; width: 16px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-PaIEH.framer-1bo1b3n { gap: 0px; } .framer-PaIEH.framer-1bo1b3n > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-PaIEH.framer-1bo1b3n > :first-child { margin-left: 0px; } .framer-PaIEH.framer-1bo1b3n > :last-child { margin-right: 0px; } }',
  ...css,
];
var FramerIV_7SD635 = withCSS(Component, css4, 'framer-PaIEH',);
var stdin_default = FramerIV_7SD635;
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

// https :https://framerusercontent.com/modules/bJ4nouCX6S7ru7M3Mm9n/SL9GMj1xQQGeqnhpBgEj/jqK_GhKTO.js
import { jsx as _jsx2, } from 'react/jsx-runtime';
import {
  addFonts as addFonts2,
  addPropertyControls as addPropertyControls2,
  ComponentViewportProvider as ComponentViewportProvider2,
  ControlType as ControlType2,
  cx as cx2,
  getFonts as getFonts2,
  getPropertyControls,
  Link as Link2,
  useComponentViewport as useComponentViewport2,
  useLocaleInfo as useLocaleInfo2,
  useVariantState as useVariantState2,
  withCSS as withCSS2,
} from 'unframer';
import { LayoutGroup as LayoutGroup2, motion as motion2, MotionConfigContext as MotionConfigContext2, } from 'unframer';
import * as React2 from 'react';
var FeatherFonts2 = getFonts2(Icon,);
var FeatherControls = getPropertyControls(Icon,);
var enabledGestures2 = { Qt8uCYS0y: { hover: true, }, };
var cycleOrder2 = ['Qt8uCYS0y',];
var serializationHash2 = 'framer-Salbw';
var variantClassNames2 = { Qt8uCYS0y: 'framer-v-k4www4', };
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
var humanReadableEnumMap = {
  'Alert-circle': 'alert-circle',
  'Alert-octagon': 'alert-octagon',
  'Alert-triangle': 'alert-triangle',
  'Align-center': 'align-center',
  'Align-justify': 'align-justify',
  'Align-left': 'align-left',
  'Align-right': 'align-right',
  'Arrow-down-circle': 'arrow-down-circle',
  'Arrow-down-left': 'arrow-down-left',
  'Arrow-down-right': 'arrow-down-right',
  'Arrow-down': 'arrow-down',
  'Arrow-left-circle': 'arrow-left-circle',
  'Arrow-left': 'arrow-left',
  'Arrow-right-circle': 'arrow-right-circle',
  'Arrow-right': 'arrow-right',
  'Arrow-up-circle': 'arrow-up-circle',
  'Arrow-up-left': 'arrow-up-left',
  'Arrow-up-right': 'arrow-up-right',
  'Arrow-up': 'arrow-up',
  'At-sign': 'at-sign',
  'Bar-chart-2': 'bar-chart-2',
  'Bar-chart': 'bar-chart',
  'Battery-charging': 'battery-charging',
  'Bell-off': 'bell-off',
  'Book-open': 'book-open',
  'Camera-off': 'camera-off',
  'Check-circle': 'check-circle',
  'Check-square': 'check-square',
  'Chevron-down': 'chevron-down',
  'Chevron-left': 'chevron-left',
  'Chevron-right': 'chevron-right',
  'Chevron-up': 'chevron-up',
  'Chevrons-down': 'chevrons-down',
  'Chevrons-left': 'chevrons-left',
  'Chevrons-right': 'chevrons-right',
  'Chevrons-up': 'chevrons-up',
  'Cloud-drizzle': 'cloud-drizzle',
  'Cloud-lightning': 'cloud-lightning',
  'Cloud-off': 'cloud-off',
  'Cloud-rain': 'cloud-rain',
  'Cloud-snow': 'cloud-snow',
  'Corner-down-left': 'corner-down-left',
  'Corner-down-right': 'corner-down-right',
  'Corner-left-down': 'corner-left-down',
  'Corner-left-up': 'corner-left-up',
  'Corner-right-down': 'corner-right-down',
  'Corner-right-up': 'corner-right-up',
  'Corner-up-left': 'corner-up-left',
  'Corner-up-right': 'corner-up-right',
  'Credit-card': 'credit-card',
  'Divide-circle': 'divide-circle',
  'Divide-square': 'divide-square',
  'Dollar-sign': 'dollar-sign',
  'Download-cloud': 'download-cloud',
  'Edit-2': 'edit-2',
  'Edit-3': 'edit-3',
  'External-link': 'external-link',
  'Eye-off': 'eye-off',
  'Fast-forward': 'fast-forward',
  'File-minus': 'file-minus',
  'File-plus': 'file-plus',
  'File-text': 'file-text',
  'Folder-minus': 'folder-minus',
  'Folder-plus': 'folder-plus',
  'Git-branch': 'git-branch',
  'Git-commit': 'git-commit',
  'Git-merge': 'git-merge',
  'Git-pull-request': 'git-pull-request',
  'Hard-drive': 'hard-drive',
  'Help-circle': 'help-circle',
  'Life-buoy': 'life-buoy',
  'Link-2': 'link-2',
  'Log-in': 'log-in',
  'Log-out': 'log-out',
  'Map-pin': 'map-pin',
  'Maximize-2': 'maximize-2',
  'Message-circle': 'message-circle',
  'Message-square': 'message-square',
  'Mic-off': 'mic-off',
  'Minimize-2': 'minimize-2',
  'Minus-circle': 'minus-circle',
  'Minus-square': 'minus-square',
  'More-horizontal': 'more-horizontal',
  'More-vertical': 'more-vertical',
  'Mouse-pointer': 'mouse-pointer',
  'Navigation-2': 'navigation-2',
  'Pause-circle': 'pause-circle',
  'Pen-tool': 'pen-tool',
  'Phone-call': 'phone-call',
  'Phone-forwarded': 'phone-forwarded',
  'Phone-incoming': 'phone-incoming',
  'Phone-missed': 'phone-missed',
  'Phone-off': 'phone-off',
  'Phone-outgoing': 'phone-outgoing',
  'Pie-chart': 'pie-chart',
  'Play-circle': 'play-circle',
  'Plus-circle': 'plus-circle',
  'Plus-square': 'plus-square',
  'Refresh-ccw': 'refresh-ccw',
  'Refresh-cw': 'refresh-cw',
  'Rotate-ccw': 'rotate-ccw',
  'Rotate-cw': 'rotate-cw',
  'Share-2': 'share-2',
  'Shield-off': 'shield-off',
  'Shopping-bag': 'shopping-bag',
  'Shopping-cart': 'shopping-cart',
  'Skip-back': 'skip-back',
  'Skip-forward': 'skip-forward',
  'Stop-circle': 'stop-circle',
  'Thumbs-down': 'thumbs-down',
  'Thumbs-up': 'thumbs-up',
  'Toggle-left': 'toggle-left',
  'Toggle-right': 'toggle-right',
  'Trash-2': 'trash-2',
  'Trending-down': 'trending-down',
  'Trending-up': 'trending-up',
  'Upload-cloud': 'upload-cloud',
  'User-check': 'user-check',
  'User-minus': 'user-minus',
  'User-plus': 'user-plus',
  'User-x': 'user-x',
  'Video-off': 'video-off',
  'Volume-1': 'volume-1',
  'Volume-2': 'volume-2',
  'Volume-x': 'volume-x',
  'Wifi-off': 'wifi-off',
  'X-circle': 'x-circle',
  'X-octagon': 'x-octagon',
  'X-square': 'x-square',
  'Zap-off': 'zap-off',
  'Zoom-in': 'zoom-in',
  'Zoom-out': 'zoom-out',
  Activity: 'activity',
  Airplay: 'airplay',
  Anchor: 'anchor',
  Aperture: 'aperture',
  Archive: 'archive',
  Award: 'award',
  Battery: 'battery',
  Bell: 'bell',
  Bluetooth: 'bluetooth',
  Bold: 'bold',
  Book: 'book',
  Bookmark: 'bookmark',
  Box: 'box',
  Briefcase: 'briefcase',
  Calendar: 'calendar',
  Camera: 'camera',
  Cast: 'cast',
  Check: 'check',
  Chrome: 'chrome',
  Circle: 'circle',
  Clipboard: 'clipboard',
  Clock: 'clock',
  Cloud: 'cloud',
  Code: 'code',
  Codepen: 'codepen',
  Codesandbox: 'codesandbox',
  Coffee: 'coffee',
  Columns: 'columns',
  Command: 'command',
  Compass: 'compass',
  Copy: 'copy',
  Cpu: 'cpu',
  Crop: 'crop',
  Crosshair: 'crosshair',
  Database: 'database',
  Delete: 'delete',
  Disc: 'disc',
  Divide: 'divide',
  Download: 'download',
  Dribbble: 'dribbble',
  Droplet: 'droplet',
  Edit: 'edit',
  Eye: 'eye',
  Facebook: 'facebook',
  Feather: 'feather',
  Figma: 'figma',
  File: 'file',
  Film: 'film',
  Filter: 'filter',
  Flag: 'flag',
  Folder: 'folder',
  Framer: 'framer',
  Frown: 'frown',
  Gift: 'gift',
  Github: 'github',
  Gitlab: 'gitlab',
  Globe: 'globe',
  Grid: 'grid',
  Hash: 'hash',
  Headphones: 'headphones',
  Heart: 'heart',
  Hexagon: 'hexagon',
  Home: 'home',
  Image: 'image',
  Inbox: 'inbox',
  Info: 'info',
  Instagram: 'instagram',
  Italic: 'italic',
  Key: 'key',
  Layers: 'layers',
  Layout: 'layout',
  Link: 'link',
  Linkedin: 'linkedin',
  List: 'list',
  Loader: 'loader',
  Lock: 'lock',
  Mail: 'mail',
  Map: 'map',
  Maximize: 'maximize',
  Meh: 'meh',
  Menu: 'menu',
  Mic: 'mic',
  Minimize: 'minimize',
  Minus: 'minus',
  Monitor: 'monitor',
  Moon: 'moon',
  Move: 'move',
  Music: 'music',
  Navigation: 'navigation',
  Octagon: 'octagon',
  Package: 'package',
  Paperclip: 'paperclip',
  Pause: 'pause',
  Percent: 'percent',
  Phone: 'phone',
  Play: 'play',
  Plus: 'plus',
  Pocket: 'pocket',
  Power: 'power',
  Printer: 'printer',
  Radio: 'radio',
  Repeat: 'repeat',
  Rewind: 'rewind',
  Rss: 'rss',
  Save: 'save',
  Scissors: 'scissors',
  Search: 'search',
  Send: 'send',
  Server: 'server',
  Settings: 'settings',
  Share: 'share',
  Shield: 'shield',
  Shuffle: 'shuffle',
  Sidebar: 'sidebar',
  Slack: 'slack',
  Slash: 'slash',
  Sliders: 'sliders',
  Smartphone: 'smartphone',
  Smile: 'smile',
  Speaker: 'speaker',
  Square: 'square',
  Star: 'star',
  Sun: 'sun',
  Sunrise: 'sunrise',
  Sunset: 'sunset',
  Tablet: 'tablet',
  Tag: 'tag',
  Target: 'target',
  Terminal: 'terminal',
  Thermometer: 'thermometer',
  Tool: 'tool',
  Trash: 'trash',
  Trello: 'trello',
  Triangle: 'triangle',
  Truck: 'truck',
  Tv: 'tv',
  Twitch: 'twitch',
  Twitter: 'twitter',
  Type: 'type',
  Umbrella: 'umbrella',
  Underline: 'underline',
  Unlock: 'unlock',
  Upload: 'upload',
  User: 'user',
  Users: 'users',
  Video: 'video',
  Voicemail: 'voicemail',
  Volume: 'volume',
  Watch: 'watch',
  Wifi: 'wifi',
  Wind: 'wind',
  X: 'x',
  Youtube: 'youtube',
  Zap: 'zap',
};
var getProps2 = ({ height, id, link, name1, width, ...props },) => {
  var _humanReadableEnumMap_name1, _ref, _ref1;
  return {
    ...props,
    AtQ5PEj2x: link !== null && link !== void 0 ? link : props.AtQ5PEj2x,
    f6skm2rkz:
      (_ref1 = (_ref = (_humanReadableEnumMap_name1 = humanReadableEnumMap[name1]) !== null && _humanReadableEnumMap_name1 !== void 0
                  ? _humanReadableEnumMap_name1
                  : name1) !== null && _ref !== void 0
            ? _ref
            : props.f6skm2rkz) !== null && _ref1 !== void 0
        ? _ref1
        : 'facebook',
  };
};
var createLayoutDependency2 = (props, variants,) => variants.join('-',) + props.layoutDependency;
var Component2 = /* @__PURE__ */ React2.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo2();
  const { style, className: className4, layoutId, variant, f6skm2rkz, AtQ5PEj2x, ...restProps } = getProps2(props,);
  const { baseVariant, classNames, gestureVariant, setGestureState, setVariant, transition, variants, } = useVariantState2({
    cycleOrder: cycleOrder2,
    defaultVariant: 'Qt8uCYS0y',
    enabledGestures: enabledGestures2,
    transitions: transitions2,
    variant,
    variantClassNames: variantClassNames2,
  },);
  const layoutDependency = createLayoutDependency2(props, variants,);
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
        children: /* @__PURE__ */ _jsx2(Link2, {
          href: AtQ5PEj2x,
          children: /* @__PURE__ */ _jsx2(motion2.a, {
            ...restProps,
            className: `${cx2(serializationHash2, ...sharedStyleClassNames, 'framer-k4www4', className4, classNames,)} framer-1ft1x0s`,
            'data-framer-name': 'Variant 1',
            layoutDependency,
            layoutId: 'Qt8uCYS0y',
            onHoverEnd: () => setGestureState({ isHovered: false, },),
            onHoverStart: () => setGestureState({ isHovered: true, },),
            onTap: () => setGestureState({ isPressed: false, },),
            onTapCancel: () => setGestureState({ isPressed: false, },),
            onTapStart: () => setGestureState({ isPressed: true, },),
            ref: ref !== null && ref !== void 0 ? ref : ref1,
            style: { ...style, },
            ...addPropertyOverrides2({ 'Qt8uCYS0y-hover': { 'data-framer-name': void 0, }, }, baseVariant, gestureVariant,),
            children: /* @__PURE__ */ _jsx2(ComponentViewportProvider2, {
              children: /* @__PURE__ */ _jsx2(motion2.div, {
                className: 'framer-jrb1he-container',
                layoutDependency,
                layoutId: 'I4X5WKxaL-container',
                children: /* @__PURE__ */ _jsx2(Icon, {
                  color: 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                  height: '100%',
                  iconSearch: 'Home',
                  iconSelection: f6skm2rkz,
                  id: 'I4X5WKxaL',
                  layoutId: 'I4X5WKxaL',
                  mirrored: false,
                  selectByList: true,
                  style: { height: '100%', width: '100%', },
                  width: '100%',
                  ...addPropertyOverrides2(
                    { 'Qt8uCYS0y-hover': { color: 'var(--token-a05655a1-e6dd-4d69-a82a-f5054b601f79, rgb(193, 255, 86))', }, },
                    baseVariant,
                    gestureVariant,
                  ),
                },),
              },),
            },),
          },),
        },),
      },),
    },),
  },);
},);
var css5 = [
  '.framer-Salbw[data-border="true"]::after, .framer-Salbw [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
  '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
  '.framer-Salbw.framer-1ft1x0s, .framer-Salbw .framer-1ft1x0s { display: block; }',
  '.framer-Salbw.framer-k4www4 { align-content: center; align-items: center; cursor: pointer; display: flex; flex-direction: row; flex-wrap: nowrap; gap: 10px; height: 24px; justify-content: center; overflow: hidden; padding: 0px 0px 0px 0px; position: relative; text-decoration: none; width: 24px; }',
  '.framer-Salbw .framer-jrb1he-container { flex: 1 0 0px; height: 100%; position: relative; width: 1px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-Salbw.framer-k4www4 { gap: 0px; } .framer-Salbw.framer-k4www4 > * { margin: 0px; margin-left: calc(10px / 2); margin-right: calc(10px / 2); } .framer-Salbw.framer-k4www4 > :first-child { margin-left: 0px; } .framer-Salbw.framer-k4www4 > :last-child { margin-right: 0px; } }',
];
var FramerjqK_GhKTO = withCSS2(Component2, css5, 'framer-Salbw',);
var stdin_default2 = FramerjqK_GhKTO;
FramerjqK_GhKTO.displayName = 'Social icon';
FramerjqK_GhKTO.defaultProps = { height: 24, width: 24, };
addPropertyControls2(FramerjqK_GhKTO, {
  f6skm2rkz: (FeatherControls === null || FeatherControls === void 0 ? void 0 : FeatherControls['iconSelection']) &&
    { ...FeatherControls['iconSelection'], defaultValue: 'facebook', description: void 0, hidden: void 0, title: 'Name', },
  AtQ5PEj2x: { title: 'Link', type: ControlType2.Link, },
},);
addFonts2(FramerjqK_GhKTO, [...FeatherFonts2,],);

// https :https://framerusercontent.com/modules/q1D2sJbULK2vEKNABm4p/4oe8dVmmOUeHIFH61Xz3/NizLRy1Ia.js
var SocialIconFonts = getFonts3(stdin_default2,);
var NavItemFonts = getFonts3(stdin_default,);
var cycleOrder3 = ['LcFGzA6Cy', 'okOucRnTS', 'EDqkOxN5j', 'P8LJEKwZo',];
var serializationHash3 = 'framer-1ZAOz';
var variantClassNames3 = {
  EDqkOxN5j: 'framer-v-163tj9z',
  LcFGzA6Cy: 'framer-v-10kulsv',
  okOucRnTS: 'framer-v-de92ag',
  P8LJEKwZo: 'framer-v-1g7b3d3',
};
function addPropertyOverrides3(overrides, ...variants) {
  const nextOverrides = {};
  variants === null || variants === void 0
    ? void 0
    : variants.forEach((variant,) => variant && Object.assign(nextOverrides, overrides[variant],));
  return nextOverrides;
}
var transition1 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: 'spring', };
var Transition3 = ({ value, children, },) => {
  const config = React3.useContext(MotionConfigContext3,);
  const transition = value !== null && value !== void 0 ? value : config.transition;
  const contextValue = React3.useMemo(() => ({ ...config, transition, }), [JSON.stringify(transition,),],);
  return /* @__PURE__ */ _jsx3(MotionConfigContext3.Provider, { value: contextValue, children, },);
};
var Variants3 = motion3(React3.Fragment,);
var humanReadableVariantMap = { Desktop: 'LcFGzA6Cy', Laptop: 'okOucRnTS', Mobile: 'P8LJEKwZo', Tablet: 'EDqkOxN5j', };
var getProps3 = ({ height, id, login, policy, terms, width, year, ...props },) => {
  var _ref, _humanReadableVariantMap_props_variant, _ref1;
  return {
    ...props,
    burzVaCmv: (_ref = year !== null && year !== void 0 ? year : props.burzVaCmv) !== null && _ref !== void 0 ? _ref : '2024',
    CdD29hsWO: policy !== null && policy !== void 0 ? policy : props.CdD29hsWO,
    JQRTkRRgY: terms !== null && terms !== void 0 ? terms : props.JQRTkRRgY,
    KsiLB1lNU: login !== null && login !== void 0 ? login : props.KsiLB1lNU,
    variant:
      (_ref1 =
            (_humanReadableVariantMap_props_variant = humanReadableVariantMap[props.variant]) !== null &&
              _humanReadableVariantMap_props_variant !== void 0
              ? _humanReadableVariantMap_props_variant
              : props.variant) !== null && _ref1 !== void 0
        ? _ref1
        : 'LcFGzA6Cy',
  };
};
var createLayoutDependency3 = (props, variants,) => {
  if (props.layoutDependency) return variants.join('-',) + props.layoutDependency;
  return variants.join('-',);
};
var Component3 = /* @__PURE__ */ React3.forwardRef(function (props, ref,) {
  const { activeLocale, setLocale, } = useLocaleInfo3();
  const { style, className: className4, layoutId, variant, JQRTkRRgY, CdD29hsWO, KsiLB1lNU, burzVaCmv, ...restProps } = getProps3(props,);
  const { baseVariant, classNames, gestureHandlers, gestureVariant, setGestureState, setVariant, variants, } = useVariantState3({
    cycleOrder: cycleOrder3,
    defaultVariant: 'LcFGzA6Cy',
    variant,
    variantClassNames: variantClassNames3,
  },);
  const layoutDependency = createLayoutDependency3(props, variants,);
  const ref1 = React3.useRef(null,);
  const router = useRouter();
  const defaultLayoutId = React3.useId();
  const sharedStyleClassNames = [className2, className3,];
  const componentViewport = useComponentViewport3();
  return /* @__PURE__ */ _jsx3(LayoutGroup3, {
    id: layoutId !== null && layoutId !== void 0 ? layoutId : defaultLayoutId,
    children: /* @__PURE__ */ _jsx3(Variants3, {
      animate: variants,
      initial: false,
      children: /* @__PURE__ */ _jsx3(Transition3, {
        value: transition1,
        children: /* @__PURE__ */ _jsxs2(motion3.div, {
          ...restProps,
          ...gestureHandlers,
          className: cx3(serializationHash3, ...sharedStyleClassNames, 'framer-10kulsv', className4, classNames,),
          'data-framer-name': 'Desktop',
          layoutDependency,
          layoutId: 'LcFGzA6Cy',
          ref: ref !== null && ref !== void 0 ? ref : ref1,
          style: { ...style, },
          ...addPropertyOverrides3(
            {
              EDqkOxN5j: { 'data-framer-name': 'Tablet', },
              okOucRnTS: { 'data-framer-name': 'Laptop', },
              P8LJEKwZo: { 'data-framer-name': 'Mobile', },
            },
            baseVariant,
            gestureVariant,
          ),
          children: [
            /* @__PURE__ */ _jsxs2(motion3.div, {
              className: 'framer-1t8q56g',
              'data-framer-name': 'Top content',
              layoutDependency,
              layoutId: 'LHEaET6Ge',
              children: [
                /* @__PURE__ */ _jsxs2(motion3.div, {
                  className: 'framer-tkxg9t',
                  'data-framer-name': 'Left',
                  layoutDependency,
                  layoutId: 'On_KhSG44',
                  children: [
                    /* @__PURE__ */ _jsx3(motion3.div, {
                      className: 'framer-vvnw7g',
                      'data-framer-name': 'Logo & Text',
                      layoutDependency,
                      layoutId: 'O5yHotilr',
                      children: /* @__PURE__ */ _jsx3(RichText2, {
                        __fromCanvasComponent: true,
                        children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                          children: /* @__PURE__ */ _jsx3(motion3.p, {
                            className: 'framer-styles-preset-17ww93c',
                            'data-styles-preset': 'uMdppUE31',
                            style: {
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                            },
                            children: 'Control Crisp in the most powerful productivity at your disposal: Raycast',
                          },),
                        },),
                        className: 'framer-11uc3cc',
                        'data-framer-name':
                          'Secure, transparent transfer of data and value without centralized control. Building blocks for Web3 and metaverse',
                        fonts: ['Inter',],
                        layoutDependency,
                        layoutId: 'R_AHSwUS3',
                        style: {
                          '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: 0.6,
                        },
                        verticalAlignment: 'top',
                        withExternalLayout: true,
                        ...addPropertyOverrides3(
                          {
                            EDqkOxN5j: {
                              children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                                children: /* @__PURE__ */ _jsx3(motion3.p, {
                                  className: 'framer-styles-preset-17ww93c',
                                  'data-styles-preset': 'uMdppUE31',
                                  style: {
                                    '--framer-text-alignment': 'center',
                                    '--framer-text-color':
                                      'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                                  },
                                  children: 'Control Crisp in the most powerful productivity at your disposal: Raycast',
                                },),
                              },),
                            },
                            P8LJEKwZo: {
                              children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                                children: /* @__PURE__ */ _jsx3(motion3.p, {
                                  className: 'framer-styles-preset-17ww93c',
                                  'data-styles-preset': 'uMdppUE31',
                                  style: {
                                    '--framer-text-alignment': 'center',
                                    '--framer-text-color':
                                      'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                                  },
                                  children: 'Control Crisp in the most powerful productivity at your disposal: Raycast',
                                },),
                              },),
                            },
                          },
                          baseVariant,
                          gestureVariant,
                        ),
                      },),
                    },),
                    /* @__PURE__ */ _jsxs2(motion3.div, {
                      className: 'framer-16ottiv',
                      'data-framer-name': 'Social',
                      layoutDependency,
                      layoutId: 'Aeqj2cLDD',
                      children: [
                        /* @__PURE__ */ _jsx3(RichText2, {
                          __fromCanvasComponent: true,
                          children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                            children: /* @__PURE__ */ _jsx3(motion3.p, {
                              className: 'framer-styles-preset-15m69fh',
                              'data-styles-preset': 'DrH7EbF3F',
                              style: {
                                '--framer-text-color':
                                  'var(--extracted-r6o4lv, var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, rgb(224, 232, 210)))',
                              },
                              children: 'Connect with:',
                            },),
                          },),
                          className: 'framer-xgpiv2',
                          'data-framer-name': 'Connect with:',
                          fonts: ['Inter',],
                          layoutDependency,
                          layoutId: 'vp8M9A8cF',
                          style: {
                            '--extracted-r6o4lv': 'var(--token-c46c0c2d-e53e-42e7-8f54-be852f62337f, rgb(224, 232, 210))',
                            '--framer-paragraph-spacing': '0px',
                          },
                          verticalAlignment: 'top',
                          withExternalLayout: true,
                        },),
                        /* @__PURE__ */ _jsx3(motion3.div, {
                          className: 'framer-1d7rv5i',
                          'data-framer-name': 'Social Links',
                          layoutDependency,
                          layoutId: 'VuqbTgMkC',
                          children: /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                            width: '24px',
                            children: /* @__PURE__ */ _jsx3(motion3.div, {
                              className: 'framer-10w3aw9-container',
                              layoutDependency,
                              layoutId: 'xSrysx4rj-container',
                              children: /* @__PURE__ */ _jsx3(stdin_default2, {
                                AtQ5PEj2x: 'https://twitter.com/__morse',
                                f6skm2rkz: 'twitter',
                                height: '100%',
                                id: 'xSrysx4rj',
                                layoutId: 'xSrysx4rj',
                                style: { height: '100%', width: '100%', },
                                width: '100%',
                              },),
                            },),
                          },),
                        },),
                      ],
                    },),
                  ],
                },),
                /* @__PURE__ */ _jsxs2(motion3.div, {
                  className: 'framer-nrbx7e',
                  'data-framer-name': 'Texts',
                  layoutDependency,
                  layoutId: 'I8s2E5CGI',
                  children: [
                    /* @__PURE__ */ _jsxs2(motion3.div, {
                      className: 'framer-1h627ls',
                      'data-framer-name': 'Linkes',
                      layoutDependency,
                      layoutId: 'ZZk05NvHO',
                      children: [
                        /* @__PURE__ */ _jsx3(ResolveLinks, {
                          links: [
                            { href: { webPageId: 'augiA20Il', }, implicitPathVariables: void 0, },
                            { href: { webPageId: 'augiA20Il', }, implicitPathVariables: void 0, },
                            { href: { webPageId: 'augiA20Il', }, implicitPathVariables: void 0, },
                            { href: { webPageId: 'augiA20Il', }, implicitPathVariables: void 0, },
                          ],
                          children: (resolvedLinks,) =>
                            /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                              children: /* @__PURE__ */ _jsx3(motion3.div, {
                                className: 'framer-5s2zpt-container',
                                layoutDependency,
                                layoutId: 'W3Pt1AQuM-container',
                                children: /* @__PURE__ */ _jsx3(stdin_default, {
                                  cRqRWoih6: resolvedLinks[0],
                                  height: '100%',
                                  id: 'W3Pt1AQuM',
                                  layoutId: 'W3Pt1AQuM',
                                  Oc0fzh3x0: false,
                                  okFfDCMAr: 'Features',
                                  width: '100%',
                                  ...addPropertyOverrides3(
                                    {
                                      EDqkOxN5j: { cRqRWoih6: resolvedLinks[2], },
                                      okOucRnTS: { cRqRWoih6: resolvedLinks[1], },
                                      P8LJEKwZo: { cRqRWoih6: resolvedLinks[3], },
                                    },
                                    baseVariant,
                                    gestureVariant,
                                  ),
                                },),
                              },),
                            },),
                        },),
                        /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                          children: /* @__PURE__ */ _jsx3(motion3.div, {
                            className: 'framer-q2b9c8-container',
                            layoutDependency,
                            layoutId: 'adb51YeSr-container',
                            children: /* @__PURE__ */ _jsx3(stdin_default, {
                              cRqRWoih6: 'https://twitter.com/__morse',
                              height: '100%',
                              id: 'adb51YeSr',
                              layoutId: 'adb51YeSr',
                              Oc0fzh3x0: false,
                              okFfDCMAr: 'About',
                              width: '100%',
                            },),
                          },),
                        },),
                      ],
                    },),
                    /* @__PURE__ */ _jsxs2(motion3.div, {
                      className: 'framer-xc5ux6',
                      'data-framer-name': 'Linkes',
                      layoutDependency,
                      layoutId: 'yy2nZv8PI',
                      children: [
                        /* @__PURE__ */ _jsx3(ResolveLinks, {
                          links: [
                            { href: { webPageId: 'A2nW9HZFd', }, implicitPathVariables: void 0, },
                            { href: { webPageId: 'A2nW9HZFd', }, implicitPathVariables: void 0, },
                            { href: { webPageId: 'A2nW9HZFd', }, implicitPathVariables: void 0, },
                            { href: { webPageId: 'A2nW9HZFd', }, implicitPathVariables: void 0, },
                          ],
                          children: (resolvedLinks1,) =>
                            /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                              children: /* @__PURE__ */ _jsx3(motion3.div, {
                                className: 'framer-u6uihn-container',
                                layoutDependency,
                                layoutId: 'C2BNni_OY-container',
                                children: /* @__PURE__ */ _jsx3(stdin_default, {
                                  cRqRWoih6: resolvedLinks1[0],
                                  height: '100%',
                                  id: 'C2BNni_OY',
                                  layoutId: 'C2BNni_OY',
                                  Oc0fzh3x0: false,
                                  okFfDCMAr: 'Contact Us',
                                  width: '100%',
                                  ...addPropertyOverrides3(
                                    {
                                      EDqkOxN5j: { cRqRWoih6: resolvedLinks1[2], },
                                      okOucRnTS: { cRqRWoih6: resolvedLinks1[1], },
                                      P8LJEKwZo: { cRqRWoih6: resolvedLinks1[3], },
                                    },
                                    baseVariant,
                                    gestureVariant,
                                  ),
                                },),
                              },),
                            },),
                        },),
                        /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                          children: /* @__PURE__ */ _jsx3(motion3.div, {
                            className: 'framer-jpjda5-container',
                            layoutDependency,
                            layoutId: 'QiWtD7wWc-container',
                            children: /* @__PURE__ */ _jsx3(stdin_default, {
                              cRqRWoih6: JQRTkRRgY,
                              height: '100%',
                              id: 'QiWtD7wWc',
                              layoutId: 'QiWtD7wWc',
                              Oc0fzh3x0: false,
                              okFfDCMAr: 'Terms & Conditions',
                              width: '100%',
                            },),
                          },),
                        },),
                        /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                          children: /* @__PURE__ */ _jsx3(motion3.div, {
                            className: 'framer-1ol8nkd-container',
                            layoutDependency,
                            layoutId: 'Gyz_dz7t6-container',
                            children: /* @__PURE__ */ _jsx3(stdin_default, {
                              cRqRWoih6: CdD29hsWO,
                              height: '100%',
                              id: 'Gyz_dz7t6',
                              layoutId: 'Gyz_dz7t6',
                              Oc0fzh3x0: false,
                              okFfDCMAr: 'Privacy Policy',
                              width: '100%',
                            },),
                          },),
                        },),
                      ],
                    },),
                    /* @__PURE__ */ _jsxs2(motion3.div, {
                      className: 'framer-1bshpxx',
                      'data-framer-name': 'Linkes',
                      layoutDependency,
                      layoutId: 'puAAvkqT0',
                      children: [
                        /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                          children: /* @__PURE__ */ _jsx3(motion3.div, {
                            className: 'framer-yzx545-container',
                            layoutDependency,
                            layoutId: 'di1tH_SuU-container',
                            children: /* @__PURE__ */ _jsx3(stdin_default, {
                              cRqRWoih6: KsiLB1lNU,
                              height: '100%',
                              id: 'di1tH_SuU',
                              layoutId: 'di1tH_SuU',
                              Oc0fzh3x0: false,
                              okFfDCMAr: 'Create Account',
                              width: '100%',
                            },),
                          },),
                        },),
                        /* @__PURE__ */ _jsx3(ComponentViewportProvider3, {
                          children: /* @__PURE__ */ _jsx3(motion3.div, {
                            className: 'framer-1lf0zg7-container',
                            layoutDependency,
                            layoutId: 'AxHcJq8B5-container',
                            children: /* @__PURE__ */ _jsx3(stdin_default, {
                              cRqRWoih6: KsiLB1lNU,
                              height: '100%',
                              id: 'AxHcJq8B5',
                              layoutId: 'AxHcJq8B5',
                              Oc0fzh3x0: false,
                              okFfDCMAr: 'Login',
                              width: '100%',
                            },),
                          },),
                        },),
                      ],
                    },),
                  ],
                },),
              ],
            },),
            /* @__PURE__ */ _jsx3(motion3.div, {
              className: 'framer-mxhw0e',
              'data-border': true,
              'data-framer-name': 'Bottom Content',
              layoutDependency,
              layoutId: 'kSJdbAFx5',
              style: {
                '--border-bottom-width': '0px',
                '--border-color': 'rgba(255, 255, 255, 0.1)',
                '--border-left-width': '0px',
                '--border-right-width': '0px',
                '--border-style': 'solid',
                '--border-top-width': '1px',
              },
              children: /* @__PURE__ */ _jsxs2(motion3.div, {
                className: 'framer-1pnztwb',
                layoutDependency,
                layoutId: 'UCTMKLQ8K',
                children: [
                  /* @__PURE__ */ _jsx3(RichText2, {
                    __fromCanvasComponent: true,
                    children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                      children: /* @__PURE__ */ _jsx3(motion3.p, {
                        style: {
                          '--font-selector': 'R0Y7U3BhY2UgR3JvdGVzay1yZWd1bGFy',
                          '--framer-font-family': '"Space Grotesk", "Space Grotesk Placeholder", sans-serif',
                          '--framer-font-size': '13px',
                          '--framer-line-height': '1.7em',
                          '--framer-text-alignment': 'center',
                          '--framer-text-color':
                            'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                        },
                        children: '2024',
                      },),
                    },),
                    className: 'framer-46b76x',
                    'data-framer-name': '2024 \xA9 WebChain Copyright',
                    fonts: ['GF;Space Grotesk-regular',],
                    layoutDependency,
                    layoutId: 'EnOmXbquR',
                    style: {
                      '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                      '--framer-paragraph-spacing': '0px',
                    },
                    text: burzVaCmv,
                    verticalAlignment: 'top',
                    withExternalLayout: true,
                  },),
                  /* @__PURE__ */ _jsx3(RichText2, {
                    __fromCanvasComponent: true,
                    children: /* @__PURE__ */ _jsx3(React3.Fragment, {
                      children: /* @__PURE__ */ _jsx3(motion3.p, {
                        style: {
                          '--font-selector': 'R0Y7U3BhY2UgR3JvdGVzay1yZWd1bGFy',
                          '--framer-font-family': '"Space Grotesk", "Space Grotesk Placeholder", sans-serif',
                          '--framer-font-size': '13px',
                          '--framer-line-height': '1.7em',
                          '--framer-text-alignment': 'center',
                          '--framer-text-color':
                            'var(--extracted-r6o4lv, var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255)))',
                        },
                        children: '\xA9 CrispyRaycast Copyright',
                      },),
                    },),
                    className: 'framer-2yct98',
                    'data-framer-name': '2024 \xA9 WebChain Copyright',
                    fonts: ['GF;Space Grotesk-regular',],
                    layoutDependency,
                    layoutId: 'YR1fff5x3',
                    style: {
                      '--extracted-r6o4lv': 'var(--token-b50174c0-f355-49d1-a882-48c9e51b5466, rgb(255, 255, 255))',
                      '--framer-paragraph-spacing': '0px',
                    },
                    verticalAlignment: 'top',
                    withExternalLayout: true,
                  },),
                ],
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
  '.framer-1ZAOz.framer-8umwtl, .framer-1ZAOz .framer-8umwtl { display: block; }',
  '.framer-1ZAOz.framer-10kulsv { align-content: center; align-items: center; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 17px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 1140px; }',
  '.framer-1ZAOz .framer-1t8q56g { align-content: flex-end; align-items: flex-end; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; height: min-content; justify-content: space-between; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-1ZAOz .framer-tkxg9t { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 32%; }',
  '.framer-1ZAOz .framer-vvnw7g { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 24px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '.framer-1ZAOz .framer-11uc3cc { flex: none; height: auto; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }',
  '.framer-1ZAOz .framer-16ottiv { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 8px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: min-content; }',
  '.framer-1ZAOz .framer-xgpiv2, .framer-1ZAOz .framer-46b76x, .framer-1ZAOz .framer-2yct98 { flex: none; height: auto; position: relative; white-space: pre; width: auto; }',
  '.framer-1ZAOz .framer-1d7rv5i { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 32px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: min-content; }',
  '.framer-1ZAOz .framer-10w3aw9-container { flex: none; height: 24px; position: relative; width: 24px; }',
  '.framer-1ZAOz .framer-nrbx7e { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; height: min-content; justify-content: space-between; overflow: visible; padding: 0px; position: relative; width: 52%; }',
  '.framer-1ZAOz .framer-1h627ls, .framer-1ZAOz .framer-xc5ux6, .framer-1ZAOz .framer-1bshpxx { align-content: flex-start; align-items: flex-start; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 24px; height: min-content; justify-content: flex-start; overflow: visible; padding: 0px; position: relative; width: min-content; }',
  '.framer-1ZAOz .framer-5s2zpt-container, .framer-1ZAOz .framer-q2b9c8-container, .framer-1ZAOz .framer-u6uihn-container, .framer-1ZAOz .framer-jpjda5-container, .framer-1ZAOz .framer-1ol8nkd-container, .framer-1ZAOz .framer-yzx545-container, .framer-1ZAOz .framer-1lf0zg7-container { flex: none; height: auto; position: relative; width: auto; }',
  '.framer-1ZAOz .framer-mxhw0e { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; overflow: hidden; padding: 11px 0px 17px 0px; position: relative; width: 100%; }',
  '.framer-1ZAOz .framer-1pnztwb { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 5px; height: 27px; justify-content: center; overflow: visible; padding: 0px; position: relative; width: 100%; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-1ZAOz.framer-10kulsv, .framer-1ZAOz .framer-tkxg9t, .framer-1ZAOz .framer-vvnw7g, .framer-1ZAOz .framer-16ottiv, .framer-1ZAOz .framer-1d7rv5i, .framer-1ZAOz .framer-1h627ls, .framer-1ZAOz .framer-xc5ux6, .framer-1ZAOz .framer-1bshpxx, .framer-1ZAOz .framer-mxhw0e, .framer-1ZAOz .framer-1pnztwb { gap: 0px; } .framer-1ZAOz.framer-10kulsv > * { margin: 0px; margin-bottom: calc(17px / 2); margin-top: calc(17px / 2); } .framer-1ZAOz.framer-10kulsv > :first-child, .framer-1ZAOz .framer-tkxg9t > :first-child, .framer-1ZAOz .framer-vvnw7g > :first-child, .framer-1ZAOz .framer-16ottiv > :first-child, .framer-1ZAOz .framer-1h627ls > :first-child, .framer-1ZAOz .framer-xc5ux6 > :first-child, .framer-1ZAOz .framer-1bshpxx > :first-child, .framer-1ZAOz .framer-mxhw0e > :first-child { margin-top: 0px; } .framer-1ZAOz.framer-10kulsv > :last-child, .framer-1ZAOz .framer-tkxg9t > :last-child, .framer-1ZAOz .framer-vvnw7g > :last-child, .framer-1ZAOz .framer-16ottiv > :last-child, .framer-1ZAOz .framer-1h627ls > :last-child, .framer-1ZAOz .framer-xc5ux6 > :last-child, .framer-1ZAOz .framer-1bshpxx > :last-child, .framer-1ZAOz .framer-mxhw0e > :last-child { margin-bottom: 0px; } .framer-1ZAOz .framer-tkxg9t > * { margin: 0px; margin-bottom: calc(32px / 2); margin-top: calc(32px / 2); } .framer-1ZAOz .framer-vvnw7g > *, .framer-1ZAOz .framer-1h627ls > *, .framer-1ZAOz .framer-xc5ux6 > *, .framer-1ZAOz .framer-1bshpxx > * { margin: 0px; margin-bottom: calc(24px / 2); margin-top: calc(24px / 2); } .framer-1ZAOz .framer-16ottiv > * { margin: 0px; margin-bottom: calc(8px / 2); margin-top: calc(8px / 2); } .framer-1ZAOz .framer-1d7rv5i > * { margin: 0px; margin-left: calc(32px / 2); margin-right: calc(32px / 2); } .framer-1ZAOz .framer-1d7rv5i > :first-child, .framer-1ZAOz .framer-1pnztwb > :first-child { margin-left: 0px; } .framer-1ZAOz .framer-1d7rv5i > :last-child, .framer-1ZAOz .framer-1pnztwb > :last-child { margin-right: 0px; } .framer-1ZAOz .framer-mxhw0e > * { margin: 0px; margin-bottom: calc(0px / 2); margin-top: calc(0px / 2); } .framer-1ZAOz .framer-1pnztwb > * { margin: 0px; margin-left: calc(5px / 2); margin-right: calc(5px / 2); } }',
  '.framer-1ZAOz.framer-v-de92ag.framer-10kulsv { gap: 80px; width: 932px; }',
  '.framer-1ZAOz.framer-v-de92ag .framer-nrbx7e { width: 53%; }',
  '.framer-1ZAOz.framer-v-de92ag .framer-mxhw0e { padding: 50px 0px 65px 0px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-1ZAOz.framer-v-de92ag.framer-10kulsv { gap: 0px; } .framer-1ZAOz.framer-v-de92ag.framer-10kulsv > * { margin: 0px; margin-bottom: calc(80px / 2); margin-top: calc(80px / 2); } .framer-1ZAOz.framer-v-de92ag.framer-10kulsv > :first-child { margin-top: 0px; } .framer-1ZAOz.framer-v-de92ag.framer-10kulsv > :last-child { margin-bottom: 0px; } }',
  '.framer-1ZAOz.framer-v-163tj9z.framer-10kulsv { gap: 65px; width: 708px; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-1t8q56g { flex-direction: column; gap: 60px; justify-content: center; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-tkxg9t, .framer-1ZAOz.framer-v-1g7b3d3 .framer-tkxg9t { align-content: center; align-items: center; gap: 40px; justify-content: center; width: 100%; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-vvnw7g, .framer-1ZAOz.framer-v-1g7b3d3 .framer-vvnw7g { align-content: center; align-items: center; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-11uc3cc { width: 75%; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-16ottiv, .framer-1ZAOz.framer-v-1g7b3d3 .framer-16ottiv { align-content: center; align-items: center; gap: 20px; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-nrbx7e { width: 100%; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-1h627ls, .framer-1ZAOz.framer-v-163tj9z .framer-xc5ux6, .framer-1ZAOz.framer-v-163tj9z .framer-1bshpxx, .framer-1ZAOz.framer-v-1g7b3d3 .framer-1h627ls, .framer-1ZAOz.framer-v-1g7b3d3 .framer-xc5ux6, .framer-1ZAOz.framer-v-1g7b3d3 .framer-1bshpxx { align-content: center; align-items: center; justify-content: center; }',
  '.framer-1ZAOz.framer-v-163tj9z .framer-mxhw0e { padding: 40px 0px 40px 0px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-1ZAOz.framer-v-163tj9z.framer-10kulsv, .framer-1ZAOz.framer-v-163tj9z .framer-1t8q56g, .framer-1ZAOz.framer-v-163tj9z .framer-tkxg9t, .framer-1ZAOz.framer-v-163tj9z .framer-16ottiv { gap: 0px; } .framer-1ZAOz.framer-v-163tj9z.framer-10kulsv > * { margin: 0px; margin-bottom: calc(65px / 2); margin-top: calc(65px / 2); } .framer-1ZAOz.framer-v-163tj9z.framer-10kulsv > :first-child, .framer-1ZAOz.framer-v-163tj9z .framer-1t8q56g > :first-child, .framer-1ZAOz.framer-v-163tj9z .framer-tkxg9t > :first-child, .framer-1ZAOz.framer-v-163tj9z .framer-16ottiv > :first-child { margin-top: 0px; } .framer-1ZAOz.framer-v-163tj9z.framer-10kulsv > :last-child, .framer-1ZAOz.framer-v-163tj9z .framer-1t8q56g > :last-child, .framer-1ZAOz.framer-v-163tj9z .framer-tkxg9t > :last-child, .framer-1ZAOz.framer-v-163tj9z .framer-16ottiv > :last-child { margin-bottom: 0px; } .framer-1ZAOz.framer-v-163tj9z .framer-1t8q56g > * { margin: 0px; margin-bottom: calc(60px / 2); margin-top: calc(60px / 2); } .framer-1ZAOz.framer-v-163tj9z .framer-tkxg9t > * { margin: 0px; margin-bottom: calc(40px / 2); margin-top: calc(40px / 2); } .framer-1ZAOz.framer-v-163tj9z .framer-16ottiv > * { margin: 0px; margin-bottom: calc(20px / 2); margin-top: calc(20px / 2); } }',
  '.framer-1ZAOz.framer-v-1g7b3d3.framer-10kulsv { gap: 50px; width: 350px; }',
  '.framer-1ZAOz.framer-v-1g7b3d3 .framer-1t8q56g { flex-direction: column; gap: 35px; justify-content: center; }',
  '.framer-1ZAOz.framer-v-1g7b3d3 .framer-nrbx7e { align-content: center; align-items: center; flex-direction: column; gap: 30px; justify-content: center; width: 100%; }',
  '.framer-1ZAOz.framer-v-1g7b3d3 .framer-mxhw0e { padding: 30px 0px 30px 0px; }',
  '@supports (background: -webkit-named-image(i)) and (not (font-palette:dark)) { .framer-1ZAOz.framer-v-1g7b3d3.framer-10kulsv, .framer-1ZAOz.framer-v-1g7b3d3 .framer-1t8q56g, .framer-1ZAOz.framer-v-1g7b3d3 .framer-tkxg9t, .framer-1ZAOz.framer-v-1g7b3d3 .framer-16ottiv, .framer-1ZAOz.framer-v-1g7b3d3 .framer-nrbx7e { gap: 0px; } .framer-1ZAOz.framer-v-1g7b3d3.framer-10kulsv > * { margin: 0px; margin-bottom: calc(50px / 2); margin-top: calc(50px / 2); } .framer-1ZAOz.framer-v-1g7b3d3.framer-10kulsv > :first-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-1t8q56g > :first-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-tkxg9t > :first-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-16ottiv > :first-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-nrbx7e > :first-child { margin-top: 0px; } .framer-1ZAOz.framer-v-1g7b3d3.framer-10kulsv > :last-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-1t8q56g > :last-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-tkxg9t > :last-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-16ottiv > :last-child, .framer-1ZAOz.framer-v-1g7b3d3 .framer-nrbx7e > :last-child { margin-bottom: 0px; } .framer-1ZAOz.framer-v-1g7b3d3 .framer-1t8q56g > * { margin: 0px; margin-bottom: calc(35px / 2); margin-top: calc(35px / 2); } .framer-1ZAOz.framer-v-1g7b3d3 .framer-tkxg9t > * { margin: 0px; margin-bottom: calc(40px / 2); margin-top: calc(40px / 2); } .framer-1ZAOz.framer-v-1g7b3d3 .framer-16ottiv > * { margin: 0px; margin-bottom: calc(20px / 2); margin-top: calc(20px / 2); } .framer-1ZAOz.framer-v-1g7b3d3 .framer-nrbx7e > * { margin: 0px; margin-bottom: calc(30px / 2); margin-top: calc(30px / 2); } }',
  ...css2,
  ...css3,
  '.framer-1ZAOz[data-border="true"]::after, .framer-1ZAOz [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; pointer-events: none; }',
];
var FramerNizLRy1Ia = withCSS3(Component3, css6, 'framer-1ZAOz',);
var stdin_default3 = FramerNizLRy1Ia;
FramerNizLRy1Ia.displayName = 'Footer';
FramerNizLRy1Ia.defaultProps = { height: 218, width: 1140, };
addPropertyControls3(FramerNizLRy1Ia, {
  variant: {
    options: ['LcFGzA6Cy', 'okOucRnTS', 'EDqkOxN5j', 'P8LJEKwZo',],
    optionTitles: ['Desktop', 'Laptop', 'Tablet', 'Mobile',],
    title: 'Variant',
    type: ControlType3.Enum,
  },
  JQRTkRRgY: { title: 'terms', type: ControlType3.Link, },
  CdD29hsWO: { title: 'policy', type: ControlType3.Link, },
  KsiLB1lNU: { title: 'login', type: ControlType3.Link, },
  burzVaCmv: { defaultValue: '2024', displayTextArea: false, title: 'year', type: ControlType3.String, },
},);
addFonts3(FramerNizLRy1Ia, [
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
    }, {
      family: 'Space Grotesk',
      source: 'google',
      style: 'normal',
      url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsmNsFjTDJK.woff2',
      weight: '400',
    },],
  },
  ...SocialIconFonts,
  ...NavItemFonts,
  ...getFontsFromSharedStyle(fonts2,),
  ...getFontsFromSharedStyle(fonts3,),
], { supportsExplicitInterCodegen: true, },);

// virtual:footer
import { WithFramerBreakpoints, } from 'unframer';
import { jsx, } from 'react/jsx-runtime';
stdin_default3.Responsive = (props,) => {
  return /* @__PURE__ */ jsx(WithFramerBreakpoints, { Component: stdin_default3, ...props, },);
};
var footer_default = stdin_default3;
export { footer_default as default, };
