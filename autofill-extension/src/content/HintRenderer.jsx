import { Component, render, h } from 'preact'
import { guiRoot } from './gui'
// import { activate } from './activate'

export let showHints
export let hideHints
export let advanceHints

let fontSize = 11
let useTargetSize = false
let horizontalPlacement = 'left'
let verticalPlacement = 'top'

let hintRenderOptions = {
    hintUseTargetSize: false,
    hintHorizontalPlacement: 'left',
    hintVerticalPlacement: 'top',
    hintHorizontalTranslation: 0,
    hintVerticalTranslation: 0,
    hintUseCustomCSS: true,
    hintTextColor: '#ff4081',
    hintBackgroundColor: '#ffffff',
    hintBorderColor: '#ff4081',
    hintOpacity: '1',
    hintFontFamily: 'Roboto, sans-serif',
    hintFontSize: 11,
    hintFontWeight: '500',
    hintHorizontalPadding: 0.25,
    hintVerticalPadding: 0.15,
    hintBorderWidth: 1,
    hintBorderRadius: 4,
    hintShadow: true,
    hintCSS:
        'font-family: Helvetica, Arial, sans-serif;\nfont-weight: 100;\nfont-size: 12px;\npadding: 0px 2px;\nbackground: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#FFF785), color-stop(100%,#FFC542));\nborder: 1px solid #E3BE23;\nborder-radius: 4px;\ncolor: black;\nfont-weight: bold;\ntext-align: center;\ntext-decoration: none;\ntext-transform: uppercase;\nvertical-align: middle;\ntext-shadow: rgba(255, 255, 255, 0.6) 0px 1px 0px;\nfont-weight: bold;',
    hintNormalCharCSS: '',
    hintActiveCharCSS: 'opacity: 0.5;',
}

export function setHintRenderSettings({
    hintFontSize,
    hintUseTargetSize,
    hintCSS,
    hintNormalCharCSS,
    hintActiveCharCSS,
    hintHorizontalPlacement,
    hintVerticalPlacement,
} = hintRenderOptions) {
    fontSize = hintFontSize
    horizontalPlacement = hintHorizontalPlacement
    verticalPlacement = hintVerticalPlacement
    useTargetSize = hintUseTargetSize
    hintStyle.textContent = `
@font-face {
  font-family: Roboto; -moz-osx-font-smoothing: grayscale; -webkit-font-smoothing: antialiased;
  font-style: normal; font-weight: normal; src: url(${chrome.runtime.getURL(
      'Roboto-Regular.ttf',
  )}) format('ttf');
}
.saka-hint-body {
  ${hintCSS}
}
.saka-hint-normal-char {
  ${hintNormalCharCSS}
}
.saka-hint-active-char {
  ${hintActiveCharCSS}
}`
}

class HintRenderer extends Component {
    constructor() {
        super()
        this.state = {
            hints: [],
            filteredHints: [],
            inputKeys: [],
        }
    }

    componentDidMount() {
        showHints = (hints, hintStrings) => {
            const labeledHints = hints.map((hint, i) =>
                Object.assign(hint, { hintString: hintStrings[i] }),
            )
            this.setState({
                hints: labeledHints,
                filteredHints: labeledHints,
                inputKeys: '',
            })
        }

        advanceHints = (event) => {
            const hints = this.state.hints
            const inputKeys = this.state.inputKeys + event.key
            const filteredHints = this.state.hints.filter((hint) => {
                return hint.hintString.startsWith(inputKeys)
            })
            this.setState({
                hints,
                filteredHints,
                inputKeys,
            })
            return filteredHints.length === 1 &&
                inputKeys === filteredHints[0].hintString
                ? activate(event, filteredHints[0].element)
                : filteredHints.length === 0
                  ? 'Filtered'
                  : 'Same'
        }
        hideHints = () => {
            this.setState({
                hints: [],
                filteredHints: [],
                inputKeys: '',
            })
        }
    }

    render() {
        return h(
            'div',
            {
                style: {
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    right: 0,
                    bottom: 0,
                },
            },
            this.state.filteredHints.map((hint) =>
                h(Hint, {
                    hintString: hint.hintString,
                    rect: hint.rect,
                    computedStyle: hint.computedStyle,
                    horizontalPlacement: horizontalPlacement,
                    verticalPlacement: verticalPlacement,
                    seen: this.state.inputKeys.length,
                }),
            ),
        )
    }
}

function generateFontSize(computedStyle) {
    const computedFontSize = parseFloat(computedStyle.fontSize)
    return useTargetSize && computedFontSize > 5 ? computedFontSize : fontSize
}

const Hint = ({
    hintString,
    rect,
    computedStyle,
    horizontalPlacement,
    verticalPlacement,
    seen,
}) =>
    h(
        'div',
        {
            className: 'saka-hint-body',
            style: {
                position: 'absolute',
                left: `${
                    horizontalPlacement === 'left'
                        ? window.scrollX + rect.left
                        : horizontalPlacement === 'right'
                          ? window.scrollX + rect.left + rect.width
                          : window.scrollX + rect.left + rect.width / 2
                }px`,
                top: `${
                    verticalPlacement === 'top'
                        ? window.scrollY + rect.top
                        : verticalPlacement === 'bottom'
                          ? window.scrollY + rect.top + rect.height
                          : window.scrollY + rect.top + rect.height / 2
                }px`,
                fontSize: generateFontSize(computedStyle),
            },
        },
        hintString.split('').map((char, i) =>
            h(
                'span',
                {
                    className:
                        i >= seen
                            ? 'saka-hint-normal-char'
                            : 'saka-hint-active-char',
                },
                char,
            ),
        ),
    )

const hostElement = document.createElement('div')
guiRoot.appendChild(hostElement)

let SAKA_PLATFORM = 'chrome'

const hintContainer =
    SAKA_PLATFORM === 'chrome'
        ? hostElement.attachShadow({ mode: 'open' })
        : hostElement.appendChild(document.createElement('div'))
const hintStyle = document.createElement('style')
hintContainer.appendChild(hintStyle)
setHintRenderSettings()
render(h(HintRenderer, null), hintContainer)
