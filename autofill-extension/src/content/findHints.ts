import {
    DATA_LLM_ID,
    PRESET_ID_LEN,
    generateRandomString,
    isTruthy,
} from '@/lib/utils'

let detectByCursorStyle = false

export function setHintFindSettings(settings) {
    detectByCursorStyle = settings.hintDetectByCursorStyle
}

/** @type {WeakMap<HTMLElement, CSSStyleDeclaration>} */
let computedStyles

function demandComputedStyle(element) {
    if (computedStyles.has(element)) {
        return computedStyles.get(element)
    } else {
        const computedStyle = getComputedStyle(element)
        computedStyles.set(element, computedStyle)
        return computedStyle
    }
}

export type Hint = {
    element: Element
    rect: {
        // x: number
        // y: number
        left: number
        right: number
        top: number
        bottom: number
        width: number
        height: number
    }
    label: string
    prevBackgroundColor: string
    // hintString?: string
    computedStyle: CSSStyleDeclaration
}

let hintChars = 'ADSFGHJKLZXCVBNM'

function permutations(chars: string, length: number) {
    if (length === 1) {
        return chars.split('')
    }
    const result = [] as string[]
    for (const char of chars) {
        const tails = permutations(chars, length - 1)
        for (const tail of tails) {
            result.push(char + tail)
        }
    }
    return result
}
const all2Permutations = permutations(hintChars, 2)

/**
 * Finds hints
 * @param {string} hintType - the type of elements to find (currently unused)
 */
export function findHints(hintType = 'input, textarea, select') {
    // on Firefox, getComputedStyle() may return null for conditions I don't fully understand
    // try-catch block prevents link hints generation from breaking.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    try {
        // 1. getComputedStyle for every element
        const allElements = document.querySelectorAll(hintType)
        computedStyles = new WeakMap()
        // allElements.forEach((element) => computedStyles.set(element, getComputedStyle(element)));
        // 2. find hintable elements

        let index = 0
        let hints = [...allElements]
            .map((element: Element) => {
                if (!isClickable(element)) {
                    return
                }
                index += 1
                const rect = firstVisibleRect(element)
                if (!rect) {
                    return
                }
                const label = all2Permutations[index - 1]
                const computedStyle = demandComputedStyle(element)
                let hint: Hint = {
                    element,
                    rect: removeRectPaddingAndBorders(
                        element,
                        rect,
                        computedStyle,
                    ),
                    label,
                    prevBackgroundColor: (element as any).style
                        ?.backgroundColor,
                    computedStyle,
                }
                return hint
            })
            .filter(isTruthy)
        for (let hint of hints) {
            const el = hint.element
            el.setAttribute(DATA_LLM_ID, hint.label)
            console.log('found visible element, setting llm id', el)
        }
        computedStyles = undefined
        return hints
        // if (SAKA_DEBUG) console.log(hintableElements)
    } catch (e) {
        console.error(e)
        return []
    }
}

// based on https://github.com/guyht/vimari/blob/master/vimari.safariextension/linkHints.js
function isClickable(element: Element) {
    // clickable html elements
    switch (element.nodeName) {
        // case 'A':
        // case 'BUTTON':
        case 'SELECT':
        case 'TEXTAREA':
            return true
        case 'INPUT': {
            let el = element as HTMLInputElement
            if (el.type === 'hidden') {
                return false
            }
            if (el.type === 'file') {
                return false
            }
            if (el.readOnly) {
                return false
            }
            // if (el.disabled) {
            //     return false
            // }
            return true
        }
    }
    // ARIA roles implying clickability
    switch (element.getAttribute('role')) {
        // case 'button':
        case 'checkbox':
        case 'combobox':
        // case 'link':
        case 'menuitem':
        case 'menuitemcheckbox':
        case 'menuitemradio':
        case 'radio':
        // case 'tab':
        case 'textbox':
            return true
    }
    // other clickable conditions
    if (element.hasAttribute('onclick')) return true
    if (detectByCursorStyle) {
        const computedStyle = demandComputedStyle(element)
        if (
            computedStyle.cursor === 'pointer' &&
            (!element.parentElement ||
                demandComputedStyle(element.parentElement).cursor !== 'pointer')
        ) {
            return true
        }
    }
    return false
}

// based on https://github.com/guyht/vimari/blob/master/vimari.safariextension/linkHints.js
function isVisible(element, clientRect) {
    return true
}

/**
 * Given an element, returns its first bounding rectangle, if any.
 * Inline elements can have multiple bounding rectangles,
 * e.g. a paragraph that wraps to the next line.
 * @param {HTMLElement} element
 * @returns {rect?: ClientRect}
 */
function firstVisibleRect(element) {
    // Case 1. the element itself is visible
    for (const rect of element.getClientRects()) {
        if (isVisible(element, rect)) {
            return rect
        }
    }
    // Case 2. a child of the element is visible
    for (const child of element.children) {
        const childRect = firstVisibleRect(child)
        if (childRect) {
            return childRect
        }
    }
    // Case 3. there is no bounding rectangle
    return undefined
}

/**
 * Given an element, its ClientRect, and its computed style,
 * returns a ClientRect with padding and borders removed
 * @param {HTMLElement} element
 * @param {ClientRect} rect
 * @param {CSSStyleDeclaration} computedStyle
 * @returns {ClientRect}
 */
function removeRectPaddingAndBorders(element, rect, computedStyle) {
    const left =
        rect.left +
        parseFloat(computedStyle.paddingLeft) +
        parseFloat(computedStyle.borderLeftWidth)
    const right =
        rect.right -
        parseFloat(computedStyle.paddingRight) -
        parseFloat(computedStyle.borderRightWidth)
    const top =
        rect.top +
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.borderTopWidth)
    const bottom =
        rect.bottom -
        parseFloat(computedStyle.paddingBottom) -
        parseFloat(computedStyle.borderBottomWidth)
    return {
        x: left,
        y: right,
        left,
        right,
        top,
        bottom,
        width: right - left,
        height: bottom - top,
    }
}
