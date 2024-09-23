import { BezierCurve, effectControllers } from './effects'
import * as THREE from 'three'
import { useEditorState } from './state'
import { threeCanvas } from './canvas'

// Disable in production or non-Vite environments
if (import.meta.env.DEV) {
    // Development-only code
    function fetchVideo() {
        fetch('/video.mov')
            .then((response) => response.blob())
            .then(
                (blob) =>
                    new File([blob], 'video.mov', { type: 'video/quicktime' }),
            )
            .then((file) => {
                if (file) {
                    // useEditorState.setState({ mediaHandleId: file })
                }
            })
            .catch((error) => {
                console.error('Error fetching video file:', error)
                return null
            })
    }
    // useEditorState.setState({
    //     mediaHandleId:
    //         'media-4001858-Screen-Recording-2024-09-09-at-16.56.13.mov',
    // })

    // Subscribe to duration changes and scale effects accordingly
    // useEditorState.subscribe((state, prevState) => {
    //     if (state.duration !== prevState.duration) {
    //         const scaleFactor = state.duration / prevState.duration

    //         const scaleEffect = (effect: Effect) => {
    //             effect.start *= scaleFactor
    //             effect.end *= scaleFactor
    //             if (effect.children) {
    //                 effect.children.forEach(scaleEffect)
    //             }
    //         }

    //         const scaledEffects = state.effects.map((effect) => {
    //             const newEffect = { ...effect }
    //             scaleEffect(newEffect)
    //             return newEffect
    //         })

    //         useEditorState.setState({ effects: scaledEffects })
    //     }
    // })
    const deg = Math.PI / 180
    const camTarget = threeCanvas.controls.target.clone()
    const camPosition = threeCanvas.controls.object.position.clone()
    const duration = 3
}
