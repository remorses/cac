import { createMeshEffect, createCameraEffect } from './effects'
import * as THREE from 'three'
import { useEditorState } from './state'
import { threeCanvas } from './App'

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
    const camTarget = threeCanvas.controls.target.clone()
    const camPosition = threeCanvas.controls.object.position.clone()
    const duration = 3
    const effects = [
        createMeshEffect({
            id: 'mesh',
            start: 0,
            end: duration,

            keyframes: [
                {
                    id: '0',
                    time: 0,
                    params: {
                        position: new THREE.Vector3(0, 0, 0),
                        rotation: new THREE.Quaternion(0, 0, 0),
                    },
                },
                {
                    id: '1',
                    time: 2,
                    params: {
                        position: new THREE.Vector3(0, 0.6, 0),
                        rotation: new THREE.Quaternion(0, 0, 0),
                    },
                },
            ],

            // bezierCurve: [0.25, 0.1, 0.25, 1],
        }),

        createCameraEffect({
            id: 'camera',
            start: 0,
            end: duration,
            keyframes: [
                {
                    id: '0cam',
                    time: 0,
                    params: {
                        position: camPosition,
                        target: camTarget,
                        zoom: 1,
                    },
                },
                {
                    id: '1cam',
                    time: 2,
                    params: {
                        position: new THREE.Vector3(0, -0.3, 1),
                        zoom: 1,
                        target: camTarget,
                    },
                },
            ],

            // bezierCurve: [0.25, 0.1, 0.25, 1],
        }),
    ]
    useEditorState.setState({ effects })
}
