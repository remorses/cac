import { Effect } from './effects'
import { useEditorState } from './state'

// Disable in production or non-Vite environments
if (import.meta.env.DEV) {
    // Development-only code
    fetch('/video.mov')
        .then((response) => response.blob())
        .then(
            (blob) =>
                new File([blob], 'video.mov', { type: 'video/quicktime' }),
        )
        .then((file) => {
            if (file) {
                useEditorState.setState({ media: file })
            }
        })
        .catch((error) => {
            console.error('Error fetching video file:', error)
            return null
        })

    // Subscribe to duration changes and scale effects accordingly
    useEditorState.subscribe((state, prevState) => {
        if (state.duration !== prevState.duration) {
            const scaleFactor = state.duration / prevState.duration

            const scaleEffect = (effect: Effect) => {
                effect.start *= scaleFactor
                effect.end *= scaleFactor
                if (effect.children) {
                    effect.children.forEach(scaleEffect)
                }
            }

            const scaledEffects = state.effects.map((effect) => {
                const newEffect = { ...effect }
                scaleEffect(newEffect)
                return newEffect
            })

            useEditorState.setState({ effects: scaledEffects })
        }
    })
}
