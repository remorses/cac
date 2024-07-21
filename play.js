/*
MIT License
Copyright © Joel Whitaker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software is provided "as is", without warranty of any kind, express or
implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the
authors or copyright holders be liable for any claim, damages or other
liability, whether in an action of contract, tort or otherwise, arising from,
out of or in connection with the Software or the use or other dealings in the
Software.
*/ import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
import { useCallback, useState } from 'react'
import {
    addPropertyControls,
    ControlType,
    withCSS,
    useRouter,
    inferInitialRouteFromPath,
} from 'framer'
import { motion, useAnimationControls } from 'framer-motion'
var FieldType
;(function (FieldType) {
    FieldType['Text'] = 'text'
    FieldType['Number'] = 'number'
    FieldType['Email'] = 'email'
    FieldType['Url'] = 'url'
    FieldType['Tel'] = 'tel'
    FieldType['TextArea'] = 'textarea'
    FieldType['Select'] = 'select'
    FieldType['Checkbox'] = 'checkbox'
    FieldType['Radio'] = 'radio'
    FieldType['Time'] = 'time'
    FieldType['Week'] = 'week'
    FieldType['Month'] = 'month'
    FieldType['Date'] = 'date'
    FieldType['DateTimeLocal'] = 'datetime-local'
    FieldType['Password'] = 'password'
    FieldType['Hidden'] = 'hidden'
})(FieldType || (FieldType = {}))
function isExternalURL(url) {
    try {
        return !!new URL(url)
    } catch {}
    try {
        return !!new URL(`https://${url}`)
    } catch {}
    return false
}
function hasMinMaxStep(type) {
    return [
        FieldType.Time,
        FieldType.Week,
        FieldType.Number,
        FieldType.Date,
        FieldType.DateTimeLocal,
    ].includes(type)
}
/**
 * Increment the number whenever shipping a new version to customers.
 * This will ensure that multiple versions of this component can exist
 * in the same project without css rules overlapping. Only use valid css class characters.
 */ const VERSION = 'v1'
/**
 * BASEFORM
 * By Joel Whitaker (Alphi.dev)
 * Based on INPUT by Benjamin den Boer
 *
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 300
 * @framerIntrinsicHeight 40
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight any
 */ const BaseForm = withCSS(
    function BaseForm({
        url,
        method,
        contentType,
        redirectAs,
        link,
        inputs,
        button,
        styles,
        extraHeaders,
        extraFields,
        style,
        onSubmit,
    }) {
        const [isError, setError] = useState(false)
        const [isLoading, setLoading] = useState(false)
        const [getFocus, setFocus] = useState(null)
        const {
            paddingPerSide: labelPaddingPerSide,
            paddingTop: labelPaddingTop,
            paddingRight: labelPaddingRight,
            paddingBottom: labelPaddingBottom,
            paddingLeft: labelPaddingLeft,
            padding: labelPadding,
            borderRadius: labelBorderRadius,
            borderObject: labelBorderObject,
            shadowObject: labelShadowObject,
        } = styles.label
        const {
            paddingPerSide: inputPaddingPerSide,
            paddingTop: inputPaddingTop,
            paddingRight: inputPaddingRight,
            paddingBottom: inputPaddingBottom,
            paddingLeft: inputPaddingLeft,
            padding: inputPadding,
            borderRadius: inputBorderRadius,
            borderObject: inputBorderObject,
            focusObject: inputFocusObject,
            shadowObject: inputShadowObject,
        } = styles.input
        const {
            paddingPerSide: buttonPaddingPerSide,
            paddingTop: buttonPaddingTop,
            paddingRight: buttonPaddingRight,
            paddingBottom: buttonPaddingBottom,
            paddingLeft: buttonPaddingLeft,
            padding: buttonPadding,
            borderRadius: buttonBorderRadius,
            borderObject: buttonBorderObject,
            shadowObject: buttonShadowObject,
        } = styles.button
        const labelPaddingValue = labelPaddingPerSide
            ? `${labelPaddingTop}px ${labelPaddingRight}px ${labelPaddingBottom}px ${labelPaddingLeft}px`
            : `${labelPadding}px ${labelPadding}px ${labelPadding}px ${labelPadding}px`
        const inputPaddingValue = inputPaddingPerSide
            ? `${inputPaddingTop}px ${inputPaddingRight}px ${inputPaddingBottom}px ${inputPaddingLeft}px`
            : `${inputPadding}px ${inputPadding}px ${inputPadding}px ${inputPadding}px`
        const buttonPaddingValue = buttonPaddingPerSide
            ? `${buttonPaddingTop}px ${buttonPaddingRight}px ${buttonPaddingBottom}px ${buttonPaddingLeft}px`
            : `${buttonPadding}px ${buttonPadding}px ${buttonPadding}px ${buttonPadding}px`
        const router = useRouter()
        const onSuccess = () => {
            /* Reset */ setLoading(false)
            setFocus(null)
            if (redirectAs === 'link' && link && !isError) {
                const [path, hash] = link.split('#')
                const { routeId, pathVariables } = inferInitialRouteFromPath(
                    router.routes,
                    path,
                )
                if (routeId) {
                    router.navigate(routeId, hash, pathVariables)
                }
                if (isExternalURL(link)) {
                    setError(true)
                    formControls.start('error')
                    return false
                }
            }
            return
        }
        const handleChange = useCallback((event) => {
            setError(false)
        }, [])
        const handleFocus = useCallback((event, input) => {
            setFocus(input.name)
        }, [])
        const handleBlur = useCallback((event) => {
            setFocus(null)
            setError(false)
        }, [])
        const handleSubmit = useCallback(
            (event) => {
                event.preventDefault() // Prevent submitting while submitting
                if (isLoading) return
                setLoading(true)
                setError(false)
                const headers = new Headers()
                if (extraHeaders) {
                    for (const [key, value] of Object.entries(extraHeaders)) {
                        headers.append(key, value)
                    }
                }
                const formData = new FormData(event.target)
                let requestOptions = { method: method, headers: headers }
                if (method === 'get') {
                    // Add form fields to URL for GET requests
                    const urlSearchParams = new URLSearchParams()
                    for (const [name, value1] of formData) {
                        urlSearchParams.append(name, value1.toString())
                    }
                    const queryString = urlSearchParams.toString()
                    url += queryString ? `?${queryString}` : ''
                } else {
                    headers.append('Content-Type', contentType)
                    if (contentType === 'application/json') {
                        headers.append('accept', 'application/json')
                    }
                    if (contentType === 'application/x-www-form-urlencoded') {
                        const urlSearchParams1 = new URLSearchParams()
                        for (const [name1, value2] of formData) {
                            urlSearchParams1.append(name1, value2.toString())
                        }
                        if (extraFields) {
                            for (const [key1, value3] of Object.entries(
                                extraFields,
                            )) {
                                urlSearchParams1.append(key1, value3.toString())
                            }
                        }
                        requestOptions['body'] = urlSearchParams1.toString()
                    } else if (contentType === 'application/json') {
                        const bodyObject = {}
                        for (const [name2, value4] of formData) {
                            bodyObject[name2] = value4
                        }
                        if (extraFields) {
                            for (const [key2, value5] of Object.entries(
                                extraFields,
                            )) {
                                bodyObject[key2] = value5
                            }
                        }
                        requestOptions['body'] = JSON.stringify(bodyObject)
                    }
                }
                fetch(url, requestOptions)
                    .then((response) => {
                        const statusCode = response.status
                        const contentType = response.headers.get('content-type')
                        if (
                            contentType &&
                            contentType.includes('application/json')
                        ) {
                            return response
                                .json()
                                .then((data) => ({ statusCode, data }))
                        } else if (
                            contentType &&
                            contentType.includes('text/plain')
                        ) {
                            return response
                                .text()
                                .then((data) => ({ statusCode, data }))
                        } else {
                            throw new Error('Unsupported response type')
                        }
                    })
                    .then(({ statusCode, data }) => {
                        if (statusCode >= 200 && statusCode < 300) {
                            // Reset state
                            setLoading(false)
                            event.target.reset() // Handle success
                            onSuccess()
                            if (redirectAs === 'overlay')
                                onSubmit === null || onSubmit === void 0
                                    ? void 0
                                    : onSubmit()
                        } else {
                            // Handle errors
                            let errorMessage =
                                'An error occurred submitting the form'
                            throw new Error(errorMessage)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                        setError(true)
                        setLoading(false)
                        formControls.start('error')
                    })
            },
            [onSubmit, isLoading],
        ) // Animation
        const formControls = useAnimationControls() // Label Box Shadow Styles
        const labelShadowStyles = styles.label.shadowObject
            ? `${labelShadowObject.shadowX}px ${labelShadowObject.shadowY}px ${labelShadowObject.shadowBlur}px ${labelShadowObject.shadowColor}`
            : null
        const labelBorderStyles = styles.label.borderObject
            ? `inset 0 0 0 ${labelBorderObject.borderWidth}px ${labelBorderObject.borderColor}`
            : null // Input Box Shadow Styles
        const inputFocusStylesFrom = styles.input.focusObject
            ? `inset 0 0 0 ${inputFocusObject.focusWidthFrom}px ${inputFocusObject.focusColor}`
            : null
        const inputFocusStylesTo = styles.input.focusObject
            ? `inset 0 0 0 ${inputFocusObject.focusWidthTo}px ${inputFocusObject.focusColor}`
            : null
        const inputShadowStyles = styles.input.shadowObject
            ? `${inputShadowObject.shadowX}px ${inputShadowObject.shadowY}px ${inputShadowObject.shadowBlur}px ${inputShadowObject.shadowColor}`
            : null
        const inputBorderStyles = styles.input.borderObject
            ? `inset 0 0 0 ${inputBorderObject.borderWidth}px ${inputBorderObject.borderColor}`
            : null // Button Box Shadow Styles
        const buttonShadowStyles = styles.button.shadowObject
            ? `${buttonShadowObject.shadowX}px ${buttonShadowObject.shadowY}px ${buttonShadowObject.shadowBlur}px ${buttonShadowObject.shadowColor}`
            : null
        const buttonBorderStyles = styles.button.borderObject
            ? `inset 0 0 0 ${buttonBorderObject.borderWidth}px ${buttonBorderObject.borderColor}`
            : null // Shake or wiggle as error
        const formVariants = {
            default: { x: 0 },
            error: { x: [0, -4, 4, 0], transition: { duration: 0.2 } },
        }
        const inputVariants = {
            default: {
                boxShadow: dynamicBoxShadow(
                    inputFocusStylesFrom,
                    inputShadowStyles,
                    inputBorderStyles,
                ),
            },
            focused: {
                boxShadow: dynamicBoxShadow(
                    inputFocusStylesTo,
                    inputShadowStyles,
                    inputBorderStyles,
                ),
            },
        }
        const label = (input) => {
            if (!input.label) {
                return null
            }
            return /*#__PURE__*/ _jsxs('label', {
                htmlFor: input.name,
                style: {
                    marginBottom: '0.375rem',
                    alignSelf: 'flex-start',
                    padding: labelPaddingValue,
                    borderRadius: labelBorderRadius,
                    fontSize: 16,
                    ...styles.label.font,
                    background: styles.label.fill,
                    color: styles.label.color,
                    boxShadow: dynamicBoxShadow(
                        labelShadowStyles,
                        labelBorderStyles,
                    ),
                },
                children: [input.label, requiredFlag(input.required)],
            })
        }
        const getInputSpan = (input) => {
            return input.gridColumn > styles.form.columns
                ? styles.form.columns
                : input.gridColumn
        }
        const getButtonSpan = () => {
            const totalSpan = inputs.reduce(
                (sum, input) => sum + Number(input.gridColumn),
                0,
            )
            const shouldBeInline = totalSpan === styles.form.columns - 1
            return shouldBeInline ? 1 : styles.form.columns
        }
        const baseInput = (input) => {
            return /*#__PURE__*/ _jsxs('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gridColumn: `span ${getInputSpan(input)}`,
                },
                children: [
                    label(input),
                    /*#__PURE__*/ _jsx(motion.input, {
                        name: input.name,
                        type: input.type,
                        defaultValue: input.value,
                        placeholder: input.placeholder,
                        className: `${VERSION} framer-custom-input`,
                        onChange: handleChange,
                        onFocus: (event) => handleFocus(event, input),
                        onBlur: handleBlur,
                        autoComplete: 'off',
                        autoCapitalize: 'off',
                        autoCorrect: 'off',
                        spellCheck: 'false',
                        required: input.required,
                        style: {
                            ...defaultStyle,
                            padding: inputPaddingValue,
                            borderRadius: inputBorderRadius,
                            fontSize: 16,
                            ...styles.input.font,
                            background: styles.input.fill,
                            color: styles.input.color,
                            boxShadow: dynamicBoxShadow(
                                inputFocusStylesFrom,
                                inputShadowStyles,
                                inputBorderStyles,
                            ),
                        },
                        variants: inputVariants,
                        initial: false,
                        animate:
                            getFocus === input.name ? 'focused' : 'default',
                        transition: { duration: 0.3 },
                        min: input.min,
                        max: input.max,
                        step: input.step,
                    }),
                ],
            })
        }
        const textareaInput = (input) => {
            return /*#__PURE__*/ _jsxs('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gridColumn: `span ${getInputSpan(input)}`,
                },
                children: [
                    label(input),
                    /*#__PURE__*/ _jsx(motion.textarea, {
                        name: input.name,
                        defaultValue: input.value,
                        placeholder: input.placeholder,
                        className: `${VERSION} framer-custom-input`,
                        onChange: handleChange,
                        onFocus: (event) => handleFocus(event, input),
                        onBlur: handleBlur,
                        autoComplete: 'off',
                        autoCapitalize: 'off',
                        autoCorrect: 'off',
                        spellCheck: 'false',
                        required: input.required,
                        style: {
                            ...defaultStyle,
                            padding: inputPaddingValue,
                            borderRadius: inputBorderRadius,
                            fontSize: 16,
                            ...styles.input.font,
                            background: styles.input.fill,
                            color: styles.input.color,
                            boxShadow: dynamicBoxShadow(
                                inputFocusStylesFrom,
                                inputShadowStyles,
                                inputBorderStyles,
                            ),
                        },
                        variants: inputVariants,
                        initial: false,
                        animate:
                            getFocus === input.name ? 'focused' : 'default',
                        transition: { duration: 0.3 },
                    }),
                ],
            })
        }
        const optionsHMTL = (options) => {
            return options.map((option) => {
                return /*#__PURE__*/ _jsx('option', {
                    value: option.value,
                    children: option.text,
                })
            })
        }
        const selectInput = (input) => {
            let options = []
            if (input.placeholder) {
                options.push({ text: input.placeholder, value: '' })
            }
            options = options.concat(input.options)
            return /*#__PURE__*/ _jsxs('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gridColumn: `span ${getInputSpan(input)}`,
                },
                children: [
                    label(input),
                    /*#__PURE__*/ _jsxs('div', {
                        style: {
                            position: 'relative',
                            display: 'inline-block',
                        },
                        children: [
                            /*#__PURE__*/ _jsx('div', {
                                style: {
                                    ...selectChevron,
                                    borderColor: `${styles.input.color} transparent transparent transparent`,
                                },
                            }),
                            /*#__PURE__*/ _jsx(motion.select, {
                                name: input.name,
                                placeholder: input.placeholder,
                                className: `${VERSION} framer-custom-input`,
                                onChange: handleChange,
                                onFocus: (event) => handleFocus(event, input),
                                onBlur: handleBlur,
                                autoComplete: 'off',
                                autoCapitalize: 'off',
                                autoCorrect: 'off',
                                spellCheck: 'false',
                                required: input.required,
                                style: {
                                    ...defaultStyle,
                                    padding: inputPaddingValue,
                                    borderRadius: inputBorderRadius,
                                    fontSize: 16,
                                    ...styles.input.font,
                                    background: styles.input.fill,
                                    color: styles.input.color,
                                    boxShadow: dynamicBoxShadow(
                                        inputFocusStylesFrom,
                                        inputShadowStyles,
                                        inputBorderStyles,
                                    ),
                                },
                                variants: inputVariants,
                                initial: false,
                                animate:
                                    getFocus === input.name
                                        ? 'focused'
                                        : 'default',
                                transition: { duration: 0.3 },
                                disabled: isLoading,
                                children: optionsHMTL(options),
                            }),
                        ],
                    }),
                ],
            })
        }
        function checkboxInput(input) {
            return /*#__PURE__*/ _jsx('div', {
                style: { gridColumn: `span ${getInputSpan(input)}` },
                children: /*#__PURE__*/ _jsxs('label', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 16,
                        ...styles.label.font,
                        background: styles.label.fill,
                        color: styles.label.color,
                    },
                    children: [
                        /*#__PURE__*/ _jsx(motion.input, {
                            name: input.name,
                            type: 'checkbox',
                            value: input.value || 'on',
                            required: input.required,
                            style: { margin: '0px 8px 0px 4px' },
                        }),
                        input.label,
                    ],
                }),
            })
        }
        function radioInput(input) {
            return /*#__PURE__*/ _jsx('div', {
                style: { gridColumn: `span ${getInputSpan(input)}` },
                children: /*#__PURE__*/ _jsxs('label', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 16,
                        ...styles.label.font,
                        background: styles.label.fill,
                        color: styles.label.color,
                    },
                    children: [
                        /*#__PURE__*/ _jsx(motion.input, {
                            name: input.name,
                            type: 'radio',
                            value: input.value || 'on',
                            required: input.required,
                            style: { margin: '0px 8px 0px 4px' },
                        }),
                        input.label,
                    ],
                }),
            })
        }
        const inputsHTML = inputs.map((input) => {
            let inputElement = null
            if (input.type === FieldType.Select) {
                inputElement = selectInput(input)
            } else if (input.type === FieldType.TextArea) {
                inputElement = textareaInput(input)
            } else if (input.type === FieldType.Checkbox) {
                inputElement = checkboxInput(input)
            } else if (input.type === FieldType.Radio) {
                inputElement = radioInput(input)
            } else {
                inputElement = baseInput(input)
            }
            return inputElement
        })
        return /*#__PURE__*/ _jsx(motion.div, {
            style: {
                ...style,
                ...containerStyles,
                '--framer-custom-placeholder-color':
                    styles.input.placeholderColor,
            },
            variants: formVariants,
            animate: formControls,
            children: /*#__PURE__*/ _jsxs('form', {
                style: {
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns:
                        styles.form.columns > 1 && getButtonSpan() === 1
                            ? '1fr auto'
                            : `repeat(${styles.form.columns}, 1fr)`,
                    gap: `${styles.form.rowGap}px ${styles.form.columnGap}px`,
                    background: styles.form.fill,
                },
                onSubmit: handleSubmit,
                method: 'POST',
                children: [
                    inputsHTML,
                    /*#__PURE__*/ _jsxs('div', {
                        style: {
                            display: 'flex',
                            gridColumn: `span ${getButtonSpan()}`,
                        },
                        children: [
                            !button.shouldAppear &&
                                isLoading &&
                                /*#__PURE__*/ _jsx(Spinner, {
                                    shouldAppear: button.shouldAppear,
                                    paddingPerSide: buttonPaddingPerSide,
                                    paddingTop: buttonPaddingTop,
                                    paddingRight: buttonPaddingRight,
                                    padding: buttonPadding,
                                    color: styles.input.color,
                                }),
                            button.shouldAppear &&
                                /*#__PURE__*/ _jsx('div', {
                                    style: {
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    },
                                    children: /*#__PURE__*/ _jsxs('div', {
                                        style: {
                                            height: '100%',
                                            display: 'flex',
                                            position: 'relative',
                                            alignSelf: styles.button.align,
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsx(motion.input, {
                                                type: 'submit',
                                                value: button.label,
                                                style: {
                                                    ...defaultStyle,
                                                    width: '100%',
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    padding: buttonPaddingValue,
                                                    borderRadius:
                                                        buttonBorderRadius,
                                                    fontWeight:
                                                        styles.button
                                                            .fontWeight,
                                                    fontSize: 16,
                                                    ...styles.button.font,
                                                    background:
                                                        styles.button.fill,
                                                    color: styles.button.color,
                                                    zIndex: 1,
                                                    boxShadow: dynamicBoxShadow(
                                                        buttonShadowStyles,
                                                        buttonBorderStyles,
                                                    ),
                                                },
                                            }),
                                            isLoading &&
                                                /*#__PURE__*/ _jsx('div', {
                                                    style: {
                                                        borderRadius:
                                                            buttonBorderRadius,
                                                        position: 'absolute',
                                                        display: 'flex',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        height: '100%',
                                                        inset: 0,
                                                        zIndex: 2,
                                                        color: styles.button
                                                            .color,
                                                        background:
                                                            styles.button.fill,
                                                        boxShadow:
                                                            dynamicBoxShadow(
                                                                buttonShadowStyles,
                                                                buttonBorderStyles,
                                                            ),
                                                    },
                                                    children:
                                                        /*#__PURE__*/ _jsx(
                                                            Spinner,
                                                            {
                                                                color: styles
                                                                    .button
                                                                    .color,
                                                            },
                                                        ),
                                                }),
                                        ],
                                    }),
                                }),
                        ],
                    }),
                ],
            }),
        })
    },
    [
        `.${VERSION}.framer-custom-input::placeholder { color: var(--framer-custom-placeholder-color) !important; }`,
    ],
)
const Spinner = (props) => {
    const noButtonStyles = !props.shouldAppear
        ? {
              position: 'absolute',
              top: `calc(50% - 8px)`,
              right: props.inputPaddingPerSide
                  ? props.inputPaddingRight
                  : props.inputPadding,
          }
        : {}
    return /*#__PURE__*/ _jsx(motion.div, {
        style: { height: 16, width: 16, ...noButtonStyles },
        initial: { rotate: 0 },
        animate: { rotate: 360 },
        transition: { duration: 1, repeat: Infinity },
        children: /*#__PURE__*/ _jsx(motion.div, {
            initial: { scale: 0 },
            animate: { scale: 1 },
            children: /*#__PURE__*/ _jsxs('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                style: { fill: 'currentColor', color: props.color },
                children: [
                    /*#__PURE__*/ _jsx('path', {
                        d: 'M 8 0 C 3.582 0 0 3.582 0 8 C 0 12.419 3.582 16 8 16 C 12.418 16 16 12.419 16 8 C 15.999 3.582 12.418 0 8 0 Z M 8 14 C 4.687 14 2 11.314 2 8 C 2 4.687 4.687 2 8 2 C 11.314 2 14 4.687 14 8 C 14 11.314 11.314 14 8 14 Z',
                        fill: 'currentColor',
                        opacity: '0.2',
                    }),
                    /*#__PURE__*/ _jsx('path', {
                        d: 'M 8 0 C 12.418 0 15.999 3.582 16 8 C 16 8 16 9 15 9 C 14 9 14 8 14 8 C 14 4.687 11.314 2 8 2 C 4.687 2 2 4.687 2 8 C 2 8 2 9 1 9 C 0 9 0 8 0 8 C 0 3.582 3.582 0 8 0 Z',
                        fill: 'currentColor',
                    }),
                ],
            }),
        }),
    })
}
const basePropertyControls = {
    url: { title: 'Url', type: ControlType.String },
    method: {
        type: ControlType.Enum,
        defaultValue: 'post',
        options: ['get', 'post', 'put', 'patch', 'delete'],
        optionTitles: ['Get', 'Post', 'Put', 'Patch', 'Delete'],
    },
    contentType: {
        type: ControlType.Enum,
        defaultValue: 'application/json',
        options: ['application/json', 'application/x-www-form-urlencoded'],
        optionTitles: ['json', 'x-www-form-urlencoded'],
        hidden: (props) => props.method === 'get',
    },
    inputs: {
        title: 'Inputs',
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                label: { title: 'Label', type: ControlType.String },
                name: { title: 'Name', type: ControlType.String },
                placeholder: {
                    title: 'Placeholder',
                    type: ControlType.String,
                    hidden: (props) => props.type === 'checkbox',
                },
                type: {
                    type: ControlType.Enum,
                    options: Object.values(FieldType),
                    optionTitles: Object.keys(FieldType),
                },
                options: {
                    type: ControlType.Array,
                    title: 'Options',
                    control: {
                        type: ControlType.Object,
                        title: 'Option',
                        controls: {
                            text: { type: ControlType.String, title: 'Text' },
                            value: { type: ControlType.String, title: 'Value' },
                        },
                    },
                    hidden: (props) => props.type !== 'select',
                },
                min: {
                    type: ControlType.String,
                    hidden: (props) => !hasMinMaxStep(props.type),
                },
                max: {
                    type: ControlType.String,
                    hidden: (props) => !hasMinMaxStep(props.type),
                },
                step: {
                    type: ControlType.Number,
                    hidden: (props) => !hasMinMaxStep(props.type),
                },
                value: { type: ControlType.String },
                required: { type: ControlType.Boolean },
                gridColumn: {
                    title: 'Grid Col',
                    type: ControlType.Enum,
                    defaultValue: 1,
                    displaySegmentedControl: true,
                    segmentedControlDirection: 'horizontal',
                    options: ['1', '2', '3'],
                    optionTitles: ['1', '2', '3'],
                },
            },
        },
    },
    button: {
        title: 'Button',
        type: ControlType.Object,
        controls: {
            shouldAppear: {
                title: 'Show',
                type: ControlType.Boolean,
                defaultValue: true,
            },
            label: {
                title: 'Label',
                type: ControlType.String,
                defaultValue: 'Submit',
            },
        },
    },
    redirectAs: {
        title: 'Success',
        type: ControlType.Enum,
        options: ['link', 'overlay'],
        optionTitles: ['Open Link', 'Show Overlay'],
        defaultValue: 'link',
    },
    link: {
        title: 'Redirect',
        type: ControlType.Link,
        hidden: (props) => props.redirectAs === 'overlay',
    },
    onSubmit: {
        title: 'Submit',
        type: ControlType.EventHandler,
        hidden: (props) => props.redirectAs === 'link',
    },
    styles: {
        type: ControlType.Object,
        controls: {
            form: {
                type: ControlType.Object,
                controls: {
                    fill: {
                        title: 'Fill',
                        type: ControlType.Color,
                        defaultValue: '#fff',
                    },
                    columns: {
                        title: 'Columns',
                        type: ControlType.Enum,
                        options: ['1', '2', '3'],
                        displaySegmentedControl: true,
                    },
                    rowGap: {
                        title: 'Row gap',
                        type: ControlType.Number,
                        displayStepper: true,
                        min: 0,
                        defaultValue: 8,
                    },
                    columnGap: {
                        title: 'Col Gap',
                        type: ControlType.Number,
                        displayStepper: true,
                        min: 0,
                        defaultValue: 8,
                    },
                },
            },
            label: {
                type: ControlType.Object,
                controls: {
                    font: {
                        type: ControlType.Font,
                        title: 'Font',
                        controls: 'extended',
                    },
                    fill: {
                        title: 'Fill',
                        type: ControlType.Color,
                        defaultValue: 'transparent',
                    },
                    color: {
                        title: 'Text',
                        type: ControlType.Color,
                        defaultValue: '#000',
                    },
                    padding: {
                        title: 'Padding',
                        type: ControlType.FusedNumber,
                        toggleKey: 'paddingPerSide',
                        toggleTitles: ['Padding', 'Padding per side'],
                        defaultValue: 0,
                        valueKeys: [
                            'paddingTop',
                            'paddingRight',
                            'paddingBottom',
                            'paddingLeft',
                        ],
                        valueLabels: ['T', 'R', 'B', 'L'],
                        min: 0,
                    },
                    borderRadius: {
                        title: 'Radius',
                        type: ControlType.Number,
                        displayStepper: true,
                        min: 0,
                        defaultValue: 8,
                    },
                    borderObject: {
                        type: ControlType.Object,
                        title: 'Border',
                        optional: true,
                        controls: {
                            borderWidth: {
                                title: 'Width',
                                type: ControlType.Number,
                                displayStepper: true,
                                defaultValue: 1,
                            },
                            borderColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: 'rgba(200,200,200,0.5)',
                            },
                        },
                    },
                    shadowObject: {
                        type: ControlType.Object,
                        title: 'Shadow',
                        optional: true,
                        controls: {
                            shadowColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: 'rgba(0,0,0,0.25)',
                            },
                            shadowX: {
                                title: 'Shadow X',
                                type: ControlType.Number,
                                min: -100,
                                max: 100,
                                defaultValue: 0,
                            },
                            shadowY: {
                                title: 'Shadow Y',
                                type: ControlType.Number,
                                min: -100,
                                max: 100,
                                defaultValue: 2,
                            },
                            shadowBlur: {
                                title: 'Shadow B',
                                type: ControlType.Number,
                                min: 0,
                                max: 100,
                                defaultValue: 4,
                            },
                        },
                    },
                },
            },
            input: {
                type: ControlType.Object,
                controls: {
                    font: {
                        type: ControlType.Font,
                        title: 'Font',
                        controls: 'extended',
                    },
                    placeholderColor: {
                        title: 'Placeholder',
                        type: ControlType.Color,
                        defaultValue: 'rgba(0, 0, 0, 0.3)',
                    },
                    fill: {
                        title: 'Fill',
                        type: ControlType.Color,
                        defaultValue: '#EBEBEB',
                    },
                    color: {
                        title: 'Text',
                        type: ControlType.Color,
                        defaultValue: '#000',
                    },
                    padding: {
                        title: 'Padding',
                        type: ControlType.FusedNumber,
                        toggleKey: 'paddingPerSide',
                        toggleTitles: ['Padding', 'Padding per side'],
                        defaultValue: 12,
                        valueKeys: [
                            'paddingTop',
                            'paddingRight',
                            'paddingBottom',
                            'paddingLeft',
                        ],
                        valueLabels: ['T', 'R', 'B', 'L'],
                        min: 0,
                    },
                    borderRadius: {
                        title: 'Radius',
                        type: ControlType.Number,
                        displayStepper: true,
                        min: 0,
                        defaultValue: 8,
                    },
                    focusObject: {
                        type: ControlType.Object,
                        title: 'Focus',
                        optional: true,
                        controls: {
                            focusWidthFrom: {
                                title: 'From',
                                type: ControlType.Number,
                                displayStepper: true,
                                defaultValue: 0,
                            },
                            focusWidthTo: {
                                title: 'To',
                                type: ControlType.Number,
                                displayStepper: true,
                                defaultValue: 2,
                            },
                            focusColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: '#09F',
                            },
                        },
                    },
                    borderObject: {
                        type: ControlType.Object,
                        title: 'Border',
                        optional: true,
                        controls: {
                            borderWidth: {
                                title: 'Width',
                                type: ControlType.Number,
                                displayStepper: true,
                                defaultValue: 1,
                            },
                            borderColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: 'rgba(200,200,200,0.5)',
                            },
                        },
                    },
                    shadowObject: {
                        type: ControlType.Object,
                        title: 'Shadow',
                        optional: true,
                        controls: {
                            shadowColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: 'rgba(0,0,0,0.25)',
                            },
                            shadowX: {
                                title: 'Shadow X',
                                type: ControlType.Number,
                                min: -100,
                                max: 100,
                                defaultValue: 0,
                            },
                            shadowY: {
                                title: 'Shadow Y',
                                type: ControlType.Number,
                                min: -100,
                                max: 100,
                                defaultValue: 2,
                            },
                            shadowBlur: {
                                title: 'Shadow B',
                                type: ControlType.Number,
                                min: 0,
                                max: 100,
                                defaultValue: 4,
                            },
                        },
                    },
                },
            },
            button: {
                type: ControlType.Object,
                controls: {
                    font: {
                        type: ControlType.Font,
                        title: 'Font',
                        controls: 'extended',
                    },
                    fill: {
                        title: 'Fill',
                        type: ControlType.Color,
                        defaultValue: '#333',
                    },
                    color: {
                        title: 'Text',
                        type: ControlType.Color,
                        defaultValue: '#FFF',
                    },
                    align: {
                        title: 'Align',
                        type: ControlType.Enum,
                        segmentedControlDirection: 'vertical',
                        options: [
                            'flex-start',
                            'center',
                            'flex-end',
                            'stretch',
                        ],
                        optionTitles: ['Start', 'Center', 'End', 'Stretch'],
                        defaultValue: 'stretch',
                    },
                    padding: {
                        title: 'Padding',
                        type: ControlType.FusedNumber,
                        toggleKey: 'paddingPerSide',
                        toggleTitles: ['Padding', 'Padding per side'],
                        defaultValue: 15,
                        valueKeys: [
                            'paddingTop',
                            'paddingRight',
                            'paddingBottom',
                            'paddingLeft',
                        ],
                        valueLabels: ['T', 'R', 'B', 'L'],
                        min: 0,
                    },
                    borderRadius: {
                        title: 'Radius',
                        type: ControlType.Number,
                        displayStepper: true,
                        min: 0,
                        defaultValue: 8,
                    },
                    borderObject: {
                        type: ControlType.Object,
                        title: 'Border',
                        optional: true,
                        controls: {
                            borderWidth: {
                                title: 'Width',
                                type: ControlType.Number,
                                displayStepper: true,
                                defaultValue: 1,
                            },
                            borderColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: 'rgba(200,200,200,0.5)',
                            },
                        },
                    },
                    shadowObject: {
                        type: ControlType.Object,
                        title: 'Shadow',
                        optional: true,
                        controls: {
                            shadowColor: {
                                title: 'Color',
                                type: ControlType.Color,
                                defaultValue: 'rgba(0,0,0,0.25)',
                            },
                            shadowX: {
                                title: 'Shadow X',
                                type: ControlType.Number,
                                min: -100,
                                max: 100,
                                defaultValue: 0,
                            },
                            shadowY: {
                                title: 'Shadow Y',
                                type: ControlType.Number,
                                min: -100,
                                max: 100,
                                defaultValue: 2,
                            },
                            shadowBlur: {
                                title: 'Shadow B',
                                type: ControlType.Number,
                                min: 0,
                                max: 100,
                                defaultValue: 4,
                            },
                        },
                    },
                },
            },
        },
    },
}
addPropertyControls(BaseForm, basePropertyControls)
const defaultStyle = {
    WebkitAppearance: 'none',
    width: '100%',
    height: 'auto',
    outline: 'none',
    border: 'none',
}
const containerStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}
const selectChevron = {
    position: 'absolute',
    top: '50%',
    right: '12px',
    transform: 'translateY(-50%)',
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth: '5px 5px 0 5px',
    pointerEvents: 'none',
}
function dynamicBoxShadow(...shadows) {
    const output = []
    shadows.forEach((shadow) => shadow && output.push(shadow))
    return output.join(', ')
}
function requiredFlag(isRequired) {
    if (isRequired) {
        return /*#__PURE__*/ _jsx('span', { children: '*' })
    }
    return null
}
BaseForm.defaultProps = {
    url: '',
    styles: {
        form: { columns: 1, rowGap: 8, columnGap: 8 },
        label: { color: '#000' },
        input: { borderObject: { borderColor: '#ccc' } },
        button: {},
    },
    inputs: [
        {
            name: 'name',
            label: 'Name',
            placeholder: 'Jane',
            type: FieldType.Text,
            required: false,
        },
        {
            name: 'email',
            label: 'Email',
            placeholder: 'jane@example.com',
            type: FieldType.Email,
            required: false,
        },
        {
            name: 'service',
            label: 'Service',
            placeholder: '- select -',
            type: FieldType.Select,
            required: false,
            options: [],
        },
        {
            name: 'message',
            label: 'Message',
            placeholder: '',
            type: FieldType.TextArea,
            required: false,
        },
        {
            name: 'terms',
            label: 'I accept the terms & conditions',
            type: FieldType.Checkbox,
            required: false,
        },
    ],
}
export default BaseForm
export { basePropertyControls }
export const __FramerMetadata__ = {
    exports: {
        default: {
            type: 'reactComponent',
            name: 'BaseForm',
            slots: [],
            annotations: {
                framerIntrinsicHeight: '40',
                framerIntrinsicWidth: '300',
                framerContractVersion: '1',
                framerDisableUnlink: '*',
                framerSupportedLayoutHeight: 'any',
                framerSupportedLayoutWidth: 'fixed',
            },
        },
        basePropertyControls: {
            type: 'variable',
            annotations: { framerContractVersion: '1' },
        },
        __FramerMetadata__: { type: 'variable' },
    },
}
//# sourceMappingURL=./BaseForm.map
