import * as THREE from 'three'
import { Pane } from 'tweakpane'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

// import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { getProject, types } from '@theatre/core'
import { BokehPass } from 'three-soft-depth-of-field/src'
import {
    getKeyframeOnCurrentTime,
    snapToTimeGrid,
    useEditorState,
} from './state'
import {
    CameraEffect,
    EditorKeyframe,
    Effect,
    evaluateBezier,
    MeshEffect,
    effectsParamsClone,
} from './effects'
import { createProxy, preparePane } from './utils'

export const deg = Math.PI / 180

export const globalPaneContainer = document.createElement('div')

export function createThreeCanvas({
    initialImageSize,
}: {
    initialImageSize?: { width: number; height: number } | undefined
} = {}) {
    const canvas = document.createElement('canvas')
    canvas.className = 'bg-black border-0 !max-w-full !max-h-full !h-auto'

    const pane = preparePane(
        new Pane({
            container: globalPaneContainer,
            title: 'Tweakpane',
        }),
    )

    const scene = new THREE.Scene()

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        preserveDrawingBuffer: true,
        alpha: true,
    })
    renderer.setClearColor(0x000000, 1)

    const { outputSize } = useEditorState.getState()
    const aspectRatio = outputSize.width / outputSize.height
    renderer.setSize(outputSize.width, outputSize.height)
    renderer.setViewport(0, 0, outputSize.width, outputSize.height)
    if (initialImageSize) {
        renderer.setSize(initialImageSize.width, initialImageSize.height)
        renderer.setViewport(
            0,
            0,
            initialImageSize.width,
            initialImageSize.height,
        )
    }

    let composer = new EffectComposer(renderer)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    let texture = new THREE.Texture()
    texture.colorSpace = THREE.LinearSRGBColorSpace

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()

    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
    })

    const plane = new THREE.Mesh(geometry, material)

    scene.add(plane)

    scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444))

    camera.position.z = 0.6

    // Add OrbitControls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.25

    // Add TransformControls
    const transformControls = new TransformControls(camera, canvas)
    // Set the mode to combined (rotation and position)
    transformControls.setMode('translate')

    // Show both rotation and position controls
    transformControls.showX = true
    transformControls.showY = true
    transformControls.showZ = true
    transformControls.attach(plane)
    scene.add(transformControls)

    let ignoreUpdate = false

    controls.addEventListener('change', (event) => {
        const state = useEditorState.getState()

        if (ignoreUpdate || state.isPlaying) {
            return
        }

        const params = getParamsForEffect('camera')
        params.position.copy(controls.object.position)
        params.target.copy(controls.target)
        params.zoom = camera.zoom
    })

    // Lock orbit controls when transform controls are being used
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value
    })

    transformControls.addEventListener('objectChange', (event) => {
        // console.log({ event })
        const state = useEditorState.getState()
        if (ignoreUpdate || state.isPlaying) {
            return
        }
        const params = getParamsForEffect('mesh')
        params.position.copy(plane.position)
        params.rotation.copy(plane.quaternion)
    })

    const img = texture.image

    renderer.setPixelRatio(1)

    camera.lookAt(plane.position.x, plane.position.y, plane.position.z)

    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const distance = camera.position.distanceTo(plane.position)

    const size = new THREE.Vector2(1920, 1080)
    renderer.getSize(size)
    const bokehPass = new BokehPass({
        scene,
        camera,
        focus: distance,
        focalLength: 30,
        fStops: 3,
        // sensorHeight: 25,
        size,
    })

    pane.addBinding({ value: 0 }, 'value', {
        min: -1,
        view: 'cameraring',
        max: 1,
        step: 0.01,
        label: 'Focus Distance',
        series: 2,
        unit: {
            pixels: 50,
            ticks: 10,
            value: 0.1,
        },
    }).on('change', (value) => {
        const distance = camera.position.distanceTo(plane.position)
        bokehPass.uniforms.focus.value = distance + value.value
    })

    pane.addBinding(bokehPass.uniforms.uDOFDebug, 'value', {
        label: 'Debug Bokeh',
    })
    pane.addBinding(bokehPass.uniforms.uFocalLength, 'value', {
        view: 'cameraring',
        min: 1,
        max: 300,
        step: 1,
        label: 'Focal Length (mm)',
        // unit: {
        //     pixels: 50,
        //     ticks: 40,
        //     value: 10,
        // },
    })
    pane.addBinding(bokehPass.uniforms.uFStop, 'value', {
        view: 'cameraring',
        min: 0.1,
        max: 26,
        step: 0.1,
        label: 'Aperture (f-stops)',
        unit: {
            pixels: 50,
            ticks: 20,
            value: 1,
        },
    })

    composer.addPass(bokehPass)
    const smaaPass = new SMAAPass(
        renderer.domElement.width * renderer.getPixelRatio(),
        renderer.domElement.height * renderer.getPixelRatio(),
    )
    composer.addPass(smaaPass)

    const vignettePass = new ShaderPass(vignetteShader)
    pane.addBinding(vignettePass.uniforms.intensity, 'value', {
        min: 1,
        max: 10,
        step: 0.01,
        label: 'Vignette Intensity',
    })

    pane.addBinding(
        createProxy({
            target: vignettePass.uniforms.color,
            setter(target, prop, value) {
                target.value = new THREE.Color(value)
                return true
            },
            getter(target, prop) {
                return target.value.getHex()
            },
        }),
        'value',
        {
            label: 'Vignette Color',
            view: 'color',
        },
    ).on('change', (value) => {
        scene.background = new THREE.Color(value.value)
    })

    // composer.addPass(vignettePass)

    composer.addPass(new ShaderPass(filmGrainShader))

    // Create an overlay scene and camera for the rectangle
    const overlayScene = new THREE.Scene()
    const overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Create a shape for the outer rectangle
    const outerShape = new THREE.Shape()
    outerShape.moveTo(-1, -1)
    outerShape.lineTo(1, -1)
    outerShape.lineTo(1, 1)
    outerShape.lineTo(-1, 1)
    outerShape.lineTo(-1, -1)

    // Create a shape for the inner rectangle (hole)
    const holeSize = 0.8 // Parametrized hole size (0 to 1)
    const holeShape = new THREE.Path()
    holeShape.moveTo(-holeSize, -holeSize)
    holeShape.lineTo(holeSize, -holeSize)
    holeShape.lineTo(holeSize, holeSize)
    holeShape.lineTo(-holeSize, holeSize)
    holeShape.lineTo(-holeSize, -holeSize)

    // Add the hole to the outer shape
    outerShape.holes.push(holeShape)
    let rectangleGeometry = new THREE.ShapeGeometry(outerShape)
    let rectangleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0x000000) },
            vignetteStrength: { value: 13 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float vignetteStrength;
            varying vec2 vUv;
            void main() {
                vec2 uv = vUv; // Transform UV to [-1, 1] range
                float dist = max(abs(uv.x), abs(uv.y)); // Use max for rectangular shape
                float percentage = 1.0;
                dist = dist * percentage;
                float vignette = smoothstep(0.0, 1.0, dist);
                float opacity = pow(vignette, vignetteStrength);
                
                gl_FragColor = vec4(color, opacity);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const rectangleLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(
            new THREE.ShapeGeometry(
                new THREE.Shape()
                    .moveTo(-holeSize, -holeSize)
                    .lineTo(holeSize, -holeSize)
                    .lineTo(holeSize, holeSize)
                    .lineTo(-holeSize, holeSize)
                    .lineTo(-holeSize, -holeSize),
            ),
        ),
        new THREE.LineBasicMaterial({
            color: 0xffff00,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 0.8,
        }),
    )
    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial)
    overlayScene.add(rectangle)
    overlayScene.add(rectangleLines)

    function applyAllEffects({ isUserChange }) {
        if (isUserChange) {
            console.log('applying all effects because isUserChange')
        }
        let prevIgnoreUpdate = ignoreUpdate
        ignoreUpdate = !isUserChange
        let res = _applyEffects(useEditorState.getState().effects)
        ignoreUpdate = prevIgnoreUpdate
        return res
    }

    function render({ isPreview = true } = {}) {
        const state = useEditorState.getState()
        if (isExporting) {
            isPreview = false
        }
        renderer.autoClear = false
        renderer.clear()

        if (!isPreview) {
            transformControls.enabled = false
            transformControls.visible = false
        } else {
            transformControls.enabled = true
            transformControls.visible = true
        }
        const rotationX = camera.rotation.x / 3
        const rotationY = camera.rotation.y
        let vignetteRotation = Math.atan2(-rotationX, -rotationY)

        vignettePass.uniforms.rotation.value = vignetteRotation

        if (state.isPlaying || isExporting) {
            applyAllEffects({ isUserChange: false })
        }
        composer.render()

        if (isPreview) {
            renderer.render(overlayScene, overlayCamera)
        }
    }

    function changeImage(bitmap: ImageBitmap | VideoFrame) {
        texture.dispose()
        texture.image = bitmap

        texture.needsUpdate = true

        const size = getDimensions(bitmap)
        const aspectRatio = size.width / size.height
        camera.updateProjectionMatrix()
        plane.scale.set(aspectRatio, 1, 1)

        renderer.setSize(size?.width, size?.height)
        renderer.setViewport(0, 0, size.width, size.height)
    }

    function changeVideo(video: HTMLVideoElement) {
        texture.dispose()
        texture.flipY = false
        texture = new THREE.VideoTexture(video)
        texture.colorSpace = THREE.LinearSRGBColorSpace
        texture.needsUpdate = true
        const aspectRatio = video.videoWidth / video.videoHeight || 1

        camera.updateProjectionMatrix()
        const newMaterial = new THREE.MeshBasicMaterial({ map: texture })

        plane.material = newMaterial
        plane.scale.set(aspectRatio, 1, 1)
    }

    function cleanup() {
        // Dispose of Three.js objects
        scene.remove(plane)
        geometry.dispose()
        material.dispose()
        texture.dispose()
        renderer.dispose()
        pane.dispose()
        // if (controls) controls.dispose()
        // if (transformControls) transformControls.dispose()
    }

    pane.on('change', () => {
        applyAllEffects({ isUserChange: true })
    })

    let isExporting = false

    function calculateScaleFactor(rectangleHeight) {
        // Convert FOV to radians
        const fovRadians = camera.fov * (Math.PI / 180)

        // Calculate the scale factor
        const scaleFactor = 1 / (2 * Math.tan(fovRadians / 2) * rectangleHeight)

        return scaleFactor
    }

    return {
        beforeExport() {
            isExporting = true
            const scaleMultiplier = 1 / calculateScaleFactor(holeSize)
            scene.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier)
            scene.updateMatrixWorld()
        },
        afterExport() {
            isExporting = false
            const scaleMultiplier = calculateScaleFactor(holeSize)
            scene.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier)
            scene.updateMatrixWorld()
        },
        canvas,
        camera,
        render,
        plane,
        renderer,
        texture,
        changeImage,
        changeVideo,
        cleanup,
        controls,
        transformControls,
        applyAllEffects,
    }
}

function getDimensions(image) {
    if (
        typeof HTMLImageElement !== 'undefined' &&
        image instanceof HTMLImageElement
    ) {
        return {
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
        }
    } else if (
        typeof VideoFrame !== 'undefined' &&
        image instanceof VideoFrame
    ) {
        return {
            width: image.displayWidth,
            height: image.displayHeight,
        }
    } else {
        return {
            width: image.width,
            height: image.height,
        }
    }
}

export function getParamsForEffect(type: string) {
    const state = useEditorState.getState()

    const thisEffect: MeshEffect | undefined = state.effects.find(
        (x) => x.type === type,
    )

    if (!thisEffect) {
        throw new Error('No mesh effect found')
    }
    const hasKeyframes = thisEffect.keyframes.length > 0
    if (!hasKeyframes) {
        return thisEffect.params
    }
    const keyframe = getKeyframeOnCurrentTime().find(
        (x) => x.effect.id === thisEffect.id,
    )?.keyframe

    if (!keyframe) {
        // Create a new keyframe at the current time
        const currentTime = state.currentTime
        console.log('creating new keyframe at', currentTime)
        let params = effectsParamsClone(thisEffect.params)

        const newKeyframe = {
            id: crypto.randomUUID(),
            time: snapToTimeGrid(currentTime),
            params,
        }

        // Mutate the current effect by adding the new keyframe
        thisEffect.keyframes.push(newKeyframe)

        // Sort the keyframes by time
        thisEffect.keyframes.sort((a, b) => a.time - b.time)

        // Select the newly created keyframe
        state.setSelectedKeyframeIds([newKeyframe.id], [thisEffect.id])
        state.setEffects([...state.effects])

        // Return the params of the new keyframe
        return newKeyframe.params
    }
    const params = keyframe?.params || thisEffect.params

    return params
}

function serializeParams(params: any) {
    return JSON.stringify(params, (key, value) => {
        if (value instanceof THREE.Vector2) {
            return { x: value.x, y: value.y }
        }
        if (value instanceof THREE.Vector3) {
            return { x: value.x, y: value.y, z: value.z }
        }
        if (value instanceof THREE.Quaternion) {
            return { x: value.x, y: value.y, z: value.z, w: value.w }
        }
        if (value instanceof THREE.Euler) {
            return { x: value.x, y: value.y, z: value.z }
        }
        if (value instanceof THREE.Color) {
            return { r: value.r, g: value.g, b: value.b }
        }
        return value
    })
}

const vignetteShader = {
    uniforms: {
        tDiffuse: { value: null },
        rotation: { value: 0 },
        intensity: { value: 0.5 },
        color: { value: new THREE.Color(0x000000) }, // Added color parameter
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float rotation;
      uniform float intensity;
      uniform vec3 color; // Added color uniform
      varying vec2 vUv;
      
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        
        // Rotate UV coordinates
        vec2 rotatedUv = vUv - 0.5;
        float s = sin(rotation);
        float c = cos(rotation);
        rotatedUv = vec2(rotatedUv.x * c - rotatedUv.y * s, rotatedUv.x * s + rotatedUv.y * c);
        rotatedUv += 0.5;
        
        // Calculate vignette
        float vignette = smoothstep(1.1, 0.4, rotatedUv.x);
        vignette = pow(vignette, intensity);
        gl_FragColor = vec4(mix(texel.rgb, color, 1.0 - vignette), texel.a);
        
      }
    `,
}

const filmGrainShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 1.0 },
        grainIntensity: { value: 0.05 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float grainIntensity;
      varying vec2 vUv;
      
      float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float grain = (random(vUv + time) - 0.5) * grainIntensity;
        // add the grain with a multiply blending mode, so black remains black
        gl_FragColor = vec4(texel.rgb + texel.rgb * grain, texel.a);
      }
    `,
}

// Function to merge different parameter types
const mergeParamType = (start, end, progress) => {
    if (typeof start === 'number' && typeof end === 'number') {
        return start + (end - start) * progress
    }
    if (start instanceof THREE.Vector3 && end instanceof THREE.Vector3) {
        return new THREE.Vector3().lerpVectors(start, end, progress)
    }
    if (start instanceof THREE.Quaternion && end instanceof THREE.Quaternion) {
        return new THREE.Quaternion(
            start.x + (end.x - start.x) * progress,
            start.y + (end.y - start.y) * progress,
            start.z + (end.z - start.z) * progress,
        )
    }
    if (start instanceof THREE.Quaternion && end instanceof THREE.Quaternion) {
        return new THREE.Quaternion().slerpQuaternions(start, end, progress)
    }
    if (start instanceof THREE.Color && end instanceof THREE.Color) {
        return new THREE.Color().lerpColors(start, end, progress)
    }
    if (Array.isArray(start) && Array.isArray(end)) {
        return start.map((s, i) => mergeParamType(s, end[i], progress))
    }
    if (typeof start === 'object' && typeof end === 'object') {
        const result = {}
        for (const key in start) {
            if (key in end) {
                result[key] = mergeParamType(start[key], end[key], progress)
            } else {
                result[key] = start[key]
            }
        }
        return result
    }
    if (start instanceof THREE.Vector2 && end instanceof THREE.Vector2) {
        return new THREE.Vector2().lerpVectors(start, end, progress)
    }
    return start
}

function _applyEffects(effects: Effect<any>[]) {
    for (const effect of effects) {
        const absoluteStart = effect.start
        const absoluteEnd = effect.end

        const { currentTime } = useEditorState.getState()
        if (currentTime >= absoluteStart && currentTime <= absoluteEnd) {
            const rawProgress =
                (currentTime - absoluteStart) / (absoluteEnd - absoluteStart)
            const easedProgress = evaluateBezier(
                rawProgress,
                effect.bezierCurve,
            )

            function getPreviousKeyframe(time: number) {
                for (let i = effect.keyframes.length - 1; i >= 0; i--) {
                    if (effect.keyframes[i].time <= time) {
                        return effect.keyframes[i]
                    }
                }
                return null
            }
            function getNextKeyframe(time: number) {
                for (let i = 0; i < effect.keyframes.length; i++) {
                    if (effect.keyframes[i].time > time) {
                        return effect.keyframes[i]
                    }
                }
                return null
            }
            const prevKeyframe = getPreviousKeyframe(currentTime)
            const nextKeyframe = getNextKeyframe(currentTime)

            const params = effect.params
            // console.log(currentTime, prevKeyframe, nextKeyframe)

            // Handle different keyframe scenarios
            if (prevKeyframe && nextKeyframe) {
                if (prevKeyframe === nextKeyframe) {
                    // At the first or last keyframe
                    Object.assign(params, prevKeyframe.params)
                } else {
                    // Interpolate between keyframes
                    const keyframeProgress =
                        (currentTime - prevKeyframe.time) /
                        (nextKeyframe.time - prevKeyframe.time)
                    const interpolatedParams = {}

                    // Interpolate each parameter using mergeParamType
                    for (const key in prevKeyframe.params) {
                        interpolatedParams[key] = mergeParamType(
                            prevKeyframe.params[key],
                            nextKeyframe.params[key],
                            keyframeProgress,
                        )
                    }

                    // Update the effect's params with the interpolated values
                    Object.assign(params, interpolatedParams)
                }
            }
            // console.log('progress', rawProgress, easedProgress)

            if (effect.children) {
                _applyEffects(effect.children)
            } else {
                effect.apply(params)
            }
        }
    }
}
