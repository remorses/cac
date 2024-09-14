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
import { BokehPass } from './blur'
import { useEditorState } from './state'
import { Effect, evaluateBezier } from './effects'
import { createProxy, preparePane } from './utils'

export const deg = Math.PI / 180

export const globalPaneContainer = document.createElement('div')

export function createThreeCanvas({
    initialImageSize,
    isPreview = true,
}: {
    initialImageSize?: { width: number; height: number } | undefined
    isPreview?: boolean
} = {}) {
    const canvas = document.createElement('canvas')
    canvas.className = 'rounded-md !max-w-full !max-h-full !h-auto'

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

    // Disable orbit controls when using transform controls
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value
    })

    // Add event listeners for controls changes
    controls.addEventListener('change', () => {
        const distance = camera.position.distanceTo(plane.position)
        bokehPass.uniforms.focus.value = distance
        render()
    })

    transformControls.addEventListener('change', () => {
        const distance = camera.position.distanceTo(plane.position)
        bokehPass.uniforms.focus.value = distance
        render()
    })

    const img = texture.image
    camera.position.z = 0.6

    renderer.setPixelRatio(1)

    camera.lookAt(plane.position.x, plane.position.y, plane.position.z)

    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const distance = camera.position.distanceTo(plane.position)

    const size = new THREE.Vector2(1920, 1080)
    renderer.getSize(size)
    const bokehPass = new BokehPass(scene, camera, {
        focus: distance,
        focalLength: 50,
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

    pane.controller.document

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

    composer.addPass(vignettePass)

    composer.addPass(new ShaderPass(filmGrainShader))

    function applyEffects(effects: Effect<any>[]) {
        for (const effect of effects) {
            const absoluteStart = effect.start
            const absoluteEnd = effect.end

            const { currentTime } = useEditorState.getState()
            if (currentTime >= absoluteStart && currentTime <= absoluteEnd) {
                const rawProgress =
                    (currentTime - absoluteStart) /
                    (absoluteEnd - absoluteStart)
                const easedProgress = evaluateBezier(
                    rawProgress,
                    effect.bezierCurve,
                )
                // console.log('progress', rawProgress, easedProgress)

                if (effect.children) {
                    applyEffects(effect.children)
                } else {
                    effect.apply(plane, easedProgress)
                }
            }
        }
    }

    function render({ isPreview = true } = {}) {
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
        const { effects } = useEditorState.getState()
        let prevPost = plane.position.clone()
        let prevRot = plane.rotation.clone()
        let prevScale = plane.scale.clone()
        applyEffects(effects)
        composer.render()
        plane.position.copy(prevPost)
        plane.rotation.copy(prevRot)
        plane.scale.copy(prevScale)
    }

    pane.on('change', () => {
        render()
    })

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

    return {
        canvas,
        render,
        plane,
        renderer,
        texture,
        changeImage,
        changeVideo,
        cleanup,
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
        grainIntensity: { value: 0.03 },
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
        float grain = random(vUv + time) * grainIntensity;
        gl_FragColor = vec4(texel.rgb + grain, texel.a);
      }
    `,
}
