import { createPositionEffect, createRotationEffect, Effect } from './effects'
import * as THREE from 'three'
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
    const effects = [
        createPositionEffect({
            id: '2',
            start: 0,
            end: 3,
            params: { position: new THREE.Vector3(0.01, 0, 0) },
            keyframes: [
                { id: '2-0', time: 0, params: { position: new THREE.Vector3(0, 0, 0) } },
                {
                    id: '2-1',
                    time: 2.5,
                    params: { position: new THREE.Vector3(0.02, 0.01, 0) },
                },
                { id: '2-2', time: 3, params: { position: new THREE.Vector3(0.01, 0, 0) } },
            ],
            // bezierCurve: [0.25, 0.1, 0.25, 1],
        }),
    ]
    useEditorState.setState({ effects })
}
