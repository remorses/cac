import { a as T, b as G, c as Q } from './chunk-B3HC5N2J.mjs'
import { a as j, b as D, c as Y, h as v, i as U } from './chunk-UGPE2PEY.mjs'
import './chunk-42U43NKG.mjs'
import {
    Bh as E,
    Fe as Z,
    Fg as x,
    Jh as M,
    Nc as q,
    Oi as w,
    Qg as _,
    Rh as z,
    Tg as P,
    Vg as m,
    Xg as R,
    c as g,
    g as b,
    gh as B,
    hh as d,
    je as H,
    jh as f,
    ld as L,
    lj as N,
    mh as V,
    mj as l,
    n as I,
    ne as S,
    nj as y,
    p as k,
    q as s,
    t as e,
    u as n,
    ve as A,
} from './chunk-LBGWTCIY.mjs'
import { a as O } from './chunk-CQBHYE7K.mjs'
import './chunk-M2F6JZKX.mjs'
import './chunk-HZL4YIMB.mjs'
import './chunk-A3IIQ6X3.mjs'
var c = await import('./framer.6RBAH774-MF7PPUUX.mjs')
console.log({
    framer: c,
})
function o(t) {
    let { tint: r } = t
    return e(c.motion.div, {
        style: {
            margin: 50,
            width: 100,
            height: 100,
            borderRadius: 25,
            backgroundColor: r,
        },
        animate: {
            scale: 1.5,
        },
        whileHover: {
            rotate: 90,
        },
    })
}
c.addPropertyControls(o, {
    tint: {
        title: 'Tint',
        type: c.ControlType.Color,
        defaultValue: '#09F',
    },
})
var me = l(v),
    de = l(o),
    fe = l(U),
    le = R(f),
    ce = {
        cxvf5lmUq: '(max-width: 809px)',
        U7KV1uaE6: '(min-width: 810px) and (max-width: 1199px)',
        vcYOISGrQ: '(min-width: 1200px)',
    }
var pe = 'framer-LZHmq',
    ue = {
        cxvf5lmUq: 'framer-v-dlrwir',
        U7KV1uaE6: 'framer-v-1ngg287',
        vcYOISGrQ: 'framer-v-127sfag',
    },
    he = {
        bounce: 0,
        delay: 0,
        duration: 1,
        type: 'spring',
    },
    ge = {
        opacity: 1,
        rotate: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        skewX: 0,
        skewY: 0,
        transition: he,
        x: 0,
        y: 0,
    },
    xe = {
        opacity: 0.001,
        rotate: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        skewX: 0,
        skewY: 0,
        x: 0,
        y: 0,
    },
    we = ({ value: t }) =>
        E()
            ? null
            : e('style', {
                  dangerouslySetInnerHTML: {
                      __html: t,
                  },
                  'data-framer-html-style': '',
              }),
    ye = {
        Desktop: 'vcYOISGrQ',
        Phone: 'cxvf5lmUq',
        Tablet: 'U7KV1uaE6',
    },
    ve = ({ height: t, id: r, width: C, ...a }) => ({
        ...a,
        variant: ye[a.variant] ?? a.variant ?? 'vcYOISGrQ',
    }),
    Ue = b(function (t, r) {
        let C = s(null),
            a = r ?? C,
            J = I(),
            { activeLocale: F, setLocale: Fe } = A(),
            i = B(),
            { style: W, className: K, layoutId: X, variant: $, ...ee } = ve(t),
            te = k(() => O(void 0, F), [void 0, F])
        Z(te)
        let [u, be] = z($, ce, !1),
            Ie = void 0,
            re = x(pe, ...[Q, Y]),
            ae = S('FZwfTUtBo'),
            ne = s(null),
            qe = H()
        return (
            V({}),
            e(_.Provider, {
                value: {
                    primaryVariantId: 'vcYOISGrQ',
                    variantClassNames: ue,
                },
                children: n(q, {
                    id: X ?? J,
                    children: [
                        e(we, {
                            value: 'html body { background: var(--token-de954fd2-a975-4916-8b85-2e5f2acf6b9e, rgb(255, 255, 255)); }',
                        }),
                        n(L.div, {
                            ...ee,
                            className: x(re, 'framer-127sfag', K),
                            ref: a,
                            style: {
                                ...W,
                            },
                            children: [
                                e('div', {
                                    className: 'framer-12a7ouz',
                                    'data-framer-name': 'Hero',
                                    id: ae,
                                    ref: ne,
                                    children: n('div', {
                                        className: 'framer-fpwe48',
                                        'data-framer-name': 'Container',
                                        children: [
                                            n('div', {
                                                className: 'framer-cjm7lx',
                                                'data-framer-name': 'Content',
                                                children: [
                                                    e(w, {
                                                        __fromCanvasComponent:
                                                            !0,
                                                        children: e(g, {
                                                            children: e('h1', {
                                                                className:
                                                                    'framer-styles-preset-1oqitgb',
                                                                'data-styles-preset':
                                                                    'KhK8sdpR3',
                                                                style: {
                                                                    '--framer-text-alignment':
                                                                        'center',
                                                                },
                                                                children:
                                                                    'Oops! Page Not Found',
                                                            }),
                                                        }),
                                                        className:
                                                            'framer-1q4kis7',
                                                        fonts: ['Inter'],
                                                        verticalAlignment:
                                                            'top',
                                                        withExternalLayout: !0,
                                                    }),
                                                    e(w, {
                                                        __fromCanvasComponent:
                                                            !0,
                                                        children: e(g, {
                                                            children: e('p', {
                                                                className:
                                                                    'framer-styles-preset-4mzurx',
                                                                'data-styles-preset':
                                                                    'C5Bqm4Y89',
                                                                style: {
                                                                    '--framer-text-alignment':
                                                                        'center',
                                                                },
                                                                children:
                                                                    "The page you are looking for doesn't exist or has been moved. ",
                                                            }),
                                                        }),
                                                        className:
                                                            'framer-dg152f',
                                                        'data-framer-name':
                                                            'Supporting text',
                                                        fonts: ['Inter'],
                                                        verticalAlignment:
                                                            'top',
                                                        withExternalLayout: !0,
                                                    }),
                                                ],
                                            }),
                                            e(M, {
                                                links: [
                                                    {
                                                        href: {
                                                            webPageId:
                                                                'augiA20Il',
                                                        },
                                                        implicitPathVariables:
                                                            void 0,
                                                    },
                                                    {
                                                        href: {
                                                            webPageId:
                                                                'augiA20Il',
                                                        },
                                                        implicitPathVariables:
                                                            void 0,
                                                    },
                                                    {
                                                        href: {
                                                            webPageId:
                                                                'augiA20Il',
                                                        },
                                                        implicitPathVariables:
                                                            void 0,
                                                    },
                                                ],
                                                children: (h) =>
                                                    e(m, {
                                                        breakpoint: u,
                                                        overrides: {
                                                            cxvf5lmUq: {
                                                                y:
                                                                    (i?.y ||
                                                                        0) +
                                                                    0 +
                                                                    0 +
                                                                    0 +
                                                                    370.5 +
                                                                    0 +
                                                                    219,
                                                            },
                                                        },
                                                        children: e(d, {
                                                            height: 40,
                                                            y:
                                                                (i?.y || 0) +
                                                                0 +
                                                                0 +
                                                                70 +
                                                                335.5 +
                                                                0 +
                                                                219,
                                                            children: e(f, {
                                                                className:
                                                                    'framer-dfro8w-container',
                                                                nodeId: 'JPAMIczQ8',
                                                                scopeId:
                                                                    'k9spuiW9M',
                                                                children: e(m, {
                                                                    breakpoint:
                                                                        u,
                                                                    overrides: {
                                                                        cxvf5lmUq:
                                                                            {
                                                                                gDhgzsvqf:
                                                                                    h[2],
                                                                                variant:
                                                                                    'h_czR0__J',
                                                                            },
                                                                        U7KV1uaE6:
                                                                            {
                                                                                gDhgzsvqf:
                                                                                    h[1],
                                                                                variant:
                                                                                    'h_czR0__J',
                                                                            },
                                                                    },
                                                                    children: e(
                                                                        v,
                                                                        {
                                                                            b7sws2Xmf:
                                                                                !1,
                                                                            gDhgzsvqf:
                                                                                h[0],
                                                                            height: '100%',
                                                                            id: 'JPAMIczQ8',
                                                                            layoutId:
                                                                                'JPAMIczQ8',
                                                                            nx2tuureE:
                                                                                'Back to home',
                                                                            variant:
                                                                                'z1bsEAxC0',
                                                                            width: '100%',
                                                                        },
                                                                    ),
                                                                }),
                                                            }),
                                                        }),
                                                    }),
                                            }),
                                        ],
                                    }),
                                }),
                                e(d, {
                                    children: e(f, {
                                        className: 'framer-1dzygam-container',
                                        isAuthoredByUser: !0,
                                        nodeId: 'MJBDxtZIG',
                                        scopeId: 'k9spuiW9M',
                                        children: e(o, {
                                            height: '100%',
                                            id: 'MJBDxtZIG',
                                            layoutId: 'MJBDxtZIG',
                                            tint: 'rgb(0, 153, 255)',
                                            width: '100%',
                                        }),
                                    }),
                                }),
                                e('div', {
                                    className: 'framer-1u7rvq8',
                                    'data-framer-name': 'Grid',
                                    children: e(d, {
                                        height: 1e3,
                                        width: i?.width || '100vw',
                                        y: (i?.y || 0) + 0 + 0,
                                        children: e(le, {
                                            animate: ge,
                                            className:
                                                'framer-1tadnpe-container',
                                            'data-framer-appear-id': '1tadnpe',
                                            initial: xe,
                                            nodeId: 'fhxPoCS3j',
                                            optimized: !0,
                                            rendersWithMotion: !0,
                                            scopeId: 'k9spuiW9M',
                                            children: e(m, {
                                                breakpoint: u,
                                                overrides: {
                                                    cxvf5lmUq: {
                                                        variant: 'LdpJM6G2s',
                                                    },
                                                    U7KV1uaE6: {
                                                        variant: 'X1CwKrPjM',
                                                    },
                                                },
                                                children: e(U, {
                                                    height: '100%',
                                                    id: 'fhxPoCS3j',
                                                    layoutId: 'fhxPoCS3j',
                                                    style: {
                                                        height: '100%',
                                                        width: '100%',
                                                    },
                                                    variant: 'hZMrdHfki',
                                                    width: '100%',
                                                }),
                                            }),
                                        }),
                                    }),
                                }),
                            ],
                        }),
                        e('div', {
                            id: 'overlay',
                        }),
                    ],
                }),
            })
        )
    }),
    Ce = [
        '@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }',
        '.framer-LZHmq.framer-14c7nnj, .framer-LZHmq .framer-14c7nnj { display: block; }',
        '.framer-LZHmq.framer-127sfag { align-content: center; align-items: center; background-color: var(--token-de954fd2-a975-4916-8b85-2e5f2acf6b9e, #ffffff); display: flex; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: flex-start; overflow: hidden; padding: 0px; position: relative; width: 1200px; }',
        '.framer-LZHmq .framer-12a7ouz { align-content: center; align-items: center; background: radial-gradient(50% 50% at 50% 50%, var(--token-18d2a01a-9676-41c1-bf6d-4772415cc68b, #3e2013) 0%, rgb(23, 23, 23) 100%); display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: 100vh; justify-content: center; overflow: hidden; padding: 70px 0px 0px 0px; position: relative; width: 100%; }',
        '.framer-LZHmq .framer-fpwe48 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 30px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 100%; z-index: 2; }',
        '.framer-LZHmq .framer-cjm7lx { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 10px; height: min-content; justify-content: center; overflow: hidden; padding: 0px; position: relative; width: 100%; }',
        '.framer-LZHmq .framer-1q4kis7 { --framer-link-text-color: #0099ff; --framer-link-text-decoration: underline; flex: none; height: auto; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }',
        '.framer-LZHmq .framer-dg152f { flex: none; height: auto; opacity: 0.8; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }',
        '.framer-LZHmq .framer-dfro8w-container, .framer-LZHmq .framer-1dzygam-container { flex: none; height: auto; position: relative; width: auto; }',
        '.framer-LZHmq .framer-1u7rvq8 { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 10px; height: 100vh; justify-content: center; overflow: hidden; padding: 0px; position: absolute; right: 0px; top: 0px; width: 100%; z-index: 1; }',
        '.framer-LZHmq .framer-1tadnpe-container { flex: none; height: 100vh; left: calc(50.00000000000002% - 100% / 2); position: absolute; top: 0px; width: 100%; will-change: var(--framer-will-change-effect-override, transform); z-index: 1; }',
        ...G,
        ...D,
        '@media (min-width: 810px) and (max-width: 1199px) { .framer-LZHmq.framer-127sfag { width: 810px; }}',
        '@media (max-width: 809px) { .framer-LZHmq.framer-127sfag { width: 390px; } .framer-LZHmq .framer-12a7ouz { padding: 0px; } .framer-LZHmq .framer-fpwe48 { padding: 0px 20px 0px 20px; } .framer-LZHmq .framer-1q4kis7 { max-width: 500px; } .framer-LZHmq .framer-dg152f { max-width: 90%; }}',
    ],
    p = P(Ue, Ce, 'framer-LZHmq'),
    je = p
p.displayName = 'Page'
p.defaultProps = {
    height: 1635,
    width: 1200,
}
N(
    p,
    [
        {
            explicitInter: !0,
            fonts: [
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange:
                        'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
                    url: 'https://framerusercontent.com/assets/5vvr9Vy74if2I6bQbJvbw7SY1pQ.woff2',
                    weight: '400',
                },
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange:
                        'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
                    url: 'https://framerusercontent.com/assets/EOr0mi4hNtlgWNn9if640EZzXCo.woff2',
                    weight: '400',
                },
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange: 'U+1F00-1FFF',
                    url: 'https://framerusercontent.com/assets/Y9k9QrlZAqio88Klkmbd8VoMQc.woff2',
                    weight: '400',
                },
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange: 'U+0370-03FF',
                    url: 'https://framerusercontent.com/assets/OYrD2tBIBPvoJXiIHnLoOXnY9M.woff2',
                    weight: '400',
                },
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange:
                        'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
                    url: 'https://framerusercontent.com/assets/JeYwfuaPfZHQhEG8U5gtPDZ7WQ.woff2',
                    weight: '400',
                },
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange:
                        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
                    url: 'https://framerusercontent.com/assets/vQyevYAyHtARFwPqUzQGpnDs.woff2',
                    weight: '400',
                },
                {
                    family: 'Inter',
                    source: 'framer',
                    style: 'normal',
                    unicodeRange:
                        'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
                    url: 'https://framerusercontent.com/assets/b6Y37FthZeALduNqHicBT6FutY.woff2',
                    weight: '400',
                },
            ],
        },
        ...me,
        ...de,
        ...fe,
        ...y(T),
        ...y(j),
    ],
    {
        supportsExplicitInterCodegen: !0,
    },
)
var De = {
    exports: {
        default: {
            type: 'reactComponent',
            name: 'Framerk9spuiW9M',
            slots: [],
            annotations: {
                framerAcceptsLayoutTemplate: 'true',
                framerResponsiveScreen: '',
                framerScrollSections:
                    '{"FZwfTUtBo":{"pattern":":FZwfTUtBo","name":"hero"}}',
                framerAutoSizeImages: 'true',
                framerIntrinsicWidth: '1200',
                framerCanvasComponentVariantDetails:
                    '{"propertyName":"variant","data":{"default":{"layout":["fixed","auto"]},"U7KV1uaE6":{"layout":["fixed","auto"]},"cxvf5lmUq":{"layout":["fixed","auto"]}}}',
                framerContractVersion: '1',
                framerComponentViewportWidth: 'true',
                framerColorSyntax: 'true',
                framerIntrinsicHeight: '1635',
                framerImmutableVariables: 'true',
                framerDisplayContentsDiv: 'false',
            },
        },
        Props: {
            type: 'tsType',
            annotations: {
                framerContractVersion: '1',
            },
        },
        __FramerMetadata__: {
            type: 'variable',
        },
    },
}
export { De as __FramerMetadata__, je as default }
//# sourceMappingURL=PrVBYMFunmgF1ZIgrRHbnQLKvPbaDM0fLSPCjjYBy_Y.7OXQ34UX.mjs.map
