import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three-soft-depth-of-field/src'
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js'

import { Pane } from 'tweakpane'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js'

async function applyBokehEffect() {
    const pane = new Pane({})
    // Create renderer

    const renderer = new THREE.WebGLRenderer({
        alpha: false,
        stencil: false,
        precision: 'highp',
    })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    renderer.outputColorSpace = THREE.SRGBColorSpace

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const size = new THREE.Vector2(1920, 1080)
    renderer.getSize(size)

    // Fetch the image and create a texture
    const imageRes = await fetch('/image.png')
    const blob = await imageRes.blob()
    const imageBitmap = await createImageBitmap(blob, {
        imageOrientation: 'flipY',
    })
    const texture = new THREE.Texture(imageBitmap)
    // texture.colorSpace = THREE.LinearSRGBColorSpace

    texture.needsUpdate = true

    // Load the depth map
    const depthMapRes = await fetch('/depth.png')
    const depthBlob = await depthMapRes.blob()
    const depthImageBitmap = await createImageBitmap(depthBlob, {
        imageOrientation: 'flipY',
    })
    let depthTexture_ = new THREE.Texture(depthImageBitmap)
    depthTexture_.needsUpdate = true

    let { composer: depthComposer, resultTexture: depthTexture } =
        await applyPostProcessingEffect(depthTexture_, (composer) => {
            
            // Create and add the RedChannelPass
            const redChannelPass = new RedChannelPass()
            composer.addPass(redChannelPass)


            const maxFilterPass = new MaxFilterPass(size)

            // Add Tweakpane control for max filter radius
            pane.addBinding(maxFilterPass.uniforms.radius, 'value', {
                label: 'Max Filter Radius',
                min: 0,
                max: 10,
                step: 1,
            })

            // Add the max filter pass to the composer
            composer.addPass(maxFilterPass)

            // Create Horizontal and Vertical Blur Passes
            const effectHBlur = new ShaderPass(HorizontalBlurShader)
            const effectVBlur = new ShaderPass(VerticalBlurShader)
            effectHBlur.uniforms['h'].value = 1 / (size.width / 2)
            effectVBlur.uniforms['v'].value = 1 / (size.height / 2)

            // Add the Blur Passes to the composer
            composer.addPass(effectHBlur)
            composer.addPass(effectVBlur)

            // Add Tweakpane controls for Blur strength
            pane.addBinding(effectHBlur.uniforms['h'], 'value', {
                label: 'Horizontal Blur',
                min: 0,
                max: 0.01,
                step: 0.0001,
            })
            pane.addBinding(effectVBlur.uniforms['v'], 'value', {
                label: 'Vertical Blur',
                min: 0,
                max: 0.01,
                step: 0.0001,
            })

            // Add Tweakpane control for max filter radius
            pane.addBinding(maxFilterPass.material.uniforms.radius, 'value', {
                label: 'Max Filter Radius',
                min: 0,
                max: 10,
                step: 1,
            })

            // Return the processed depth texture
        })

    // depthTexture = depthTexture_
    // Create EffectComposer and passes
    const composer = new EffectComposer(renderer)
    const texturePass = new TexturePass(texture)
    // Create a camera
    const camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    )

    const bokehPass = new BokehPass({
        depthMap: depthTexture,
        camera,
        size,
        // focus: 1.0,
        focus: 1,
        fStops: 10,
        // sensorHeight: 50,
        focalLength: 6,
        // dofDebug: true,
    })
    // bokehPass.enabled = false

    pane.addBinding(bokehPass, 'enabled', {
        label: 'Enable Bokeh',
    })

    // Add Tweakpane controls for bokeh effect
    pane.addBinding(bokehPass.uniforms.focus, 'value', {
        label: 'Focus',
        min: 0,
        max: 2,
        step: 0.01,
    })

    pane.addBinding(bokehPass.uniforms.uFStop, 'value', {
        label: 'F-Stop',
        min: 0.1,
        max: 22,
        step: 0.1,
    })
    pane.addBinding(bokehPass.uniforms.uSensorHeight, 'value', {
        label: 'Sensor Height',
        min: 1,
        max: 100,
        step: 1,
    })

    pane.addBinding(bokehPass.uniforms.uFocalLength, 'value', {
        label: 'Focal Length',
        min: 0,
        max: 20,
        step: 1,
    })

    pane.addBinding(bokehPass.uniforms.uDOFDebug, 'value', {
        label: 'Debug Mode',
        type: 'boolean',
    })

    composer.addPass(texturePass)
    composer.addPass(bokehPass)

    // Render function
    function animate() {
        requestAnimationFrame(animate)

        depthComposer.render()
        depthTexture.needsUpdate = true
        composer.render()
    }

    // Start animation
    animate()

    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        composer.setSize(window.innerWidth, window.innerHeight)
    })

    // Add click handler to set focus based on depth
    renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const pixelX = Math.floor((x / rect.width) * depthTexture.image.width)
        const pixelY = Math.floor(
            (1 - y / rect.height) * depthTexture.image.height,
        )

        // Create a temporary canvas to read pixel data
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = depthTexture.image.width
        canvas.height = depthTexture.image.height
        ctx.drawImage(depthTexture.image, 0, 0)

        const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data

        const v = readDepth(pixelData[0], camera.near, camera.far)

        // Set the focus based on the depth value
        bokehPass.uniforms.focus.value = v
        pane.refresh()
    })
}
async function applyPostProcessingEffect(
    texture: THREE.Texture,
    effect: (composer: EffectComposer) => void,
) {
    // Create a new WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true })
    renderer.setSize(texture.image.width, texture.image.height)

    // Create a new scene and camera
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Create a new EffectComposer
    const composer = new EffectComposer(renderer)

    // Add a TexturePass with the input texture
    const texturePass = new TexturePass(texture)
    composer.addPass(texturePass)

    // Call the effect callback to add custom effects
    effect(composer)

    // // Create a new WebGLRenderTarget to render the result
    // const renderTarget = new THREE.WebGLRenderTarget(
    //     texture.image.width,
    //     texture.image.height,
    // )

    // Render the composition to the render target
    composer.render()

    let resultTexture = new THREE.Texture(renderer.domElement)
    resultTexture.needsUpdate = true
    return { composer, resultTexture }
}

function readDepth(pixel, near: number, far: number): number {
    // 'near' and 'far' represent the near and far clipping planes of the camera
    // They are used to convert the depth value from normalized device coordinates
    // back to view space (eye space) coordinates

    let z_b = pixel / 255

    // Convert from [0,1] range to [-1,1] range
    const z_n = 2.0 * z_b - 1.0

    // Convert from normalized device coordinates to view space
    // This formula reverses the perspective projection
    const z_e = (2.0 * near * far) / (far + near - z_n * (far - near))

    // Return the depth in view space units
    return z_e
}

applyBokehEffect()

// Create a custom pass for min filter
class MinFilterPass extends Pass {
    material: THREE.ShaderMaterial
    fsQuad: FullScreenQuad
    uniforms: {
        tDiffuse: THREE.IUniform<THREE.Texture | null>
        resolution: THREE.IUniform<THREE.Vector2>
        radius: THREE.IUniform<number>
    }

    constructor(size: THREE.Vector2) {
        super()

        this.uniforms = {
            tDiffuse: { value: null },
            resolution: {
                value: new THREE.Vector2(size.x, size.y),
            },
            radius: { value: 6 },
        }

        const minFilterShader = {
            uniforms: this.uniforms,
            vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
            fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float radius;
        varying vec2 vUv;

        void main() {
            vec2 texelSize = 1.0 / resolution;
            float minValue = 1.0;

            for (float x = -radius; x <= radius; x++) {
                for (float y = -radius; y <= radius; y++) {
                    vec2 offset = vec2(x, y) * texelSize;
                    minValue = min(minValue, texture2D(tDiffuse, vUv + offset).r);
                }
            }

            gl_FragColor = vec4(minValue, minValue, minValue, 1.0);
        }
    `,
        }

        this.material = new THREE.ShaderMaterial(minFilterShader)
        this.fsQuad = new FullScreenQuad(this.material)
        this.renderToScreen = false
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget,
    ) {
        this.uniforms.tDiffuse.value = readBuffer.texture
        if (this.renderToScreen) {
            renderer.setRenderTarget(null)
            this.fsQuad.render(renderer)
        } else {
            renderer.setRenderTarget(writeBuffer)
            if (this.clear) renderer.clear()
            this.fsQuad.render(renderer)
        }
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
    }
}

// Create a custom pass for keeping only the red channel
class RedChannelPass extends Pass {
    material: THREE.ShaderMaterial
    fsQuad: FullScreenQuad
    uniforms: {
        tDiffuse: THREE.IUniform<THREE.Texture | null>
    }

    constructor() {
        super()

        this.uniforms = {
            tDiffuse: { value: null },
        }

        const redChannelShader = {
            uniforms: this.uniforms,
            vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
            fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            gl_FragColor = vec4(texel.r, 0.0, 0.0, 1.0);
        }
    `,
        }

        this.material = new THREE.ShaderMaterial(redChannelShader)
        this.fsQuad = new FullScreenQuad(this.material)
        this.renderToScreen = false
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget,
    ) {
        this.uniforms.tDiffuse.value = readBuffer.texture
        if (this.renderToScreen) {
            renderer.setRenderTarget(null)
            this.fsQuad.render(renderer)
        } else {
            renderer.setRenderTarget(writeBuffer)
            if (this.clear) renderer.clear()
            this.fsQuad.render(renderer)
        }
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
    }
}

// Create a custom pass for max filter
class MaxFilterPass extends Pass {
    material: THREE.ShaderMaterial
    fsQuad: FullScreenQuad
    uniforms: {
        tDiffuse: THREE.IUniform<THREE.Texture | null>
        resolution: THREE.IUniform<THREE.Vector2>
        radius: THREE.IUniform<number>
    }

    constructor(size: THREE.Vector2) {
        super()

        this.uniforms = {
            tDiffuse: { value: null },
            resolution: {
                value: new THREE.Vector2(size.x, size.y),
            },
            radius: { value: 3 },
        }

        const maxFilterShader = {
            uniforms: this.uniforms,
            vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
            fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float radius;
        varying vec2 vUv;

        void main() {
            vec2 texelSize = 1.0 / resolution;
            float maxValue = 0.0;

            for (float x = -radius; x <= radius; x++) {
                for (float y = -radius; y <= radius; y++) {
                    vec2 offset = vec2(x, y) * texelSize;
                    maxValue = max(maxValue, texture2D(tDiffuse, vUv + offset).r);
                }
            }

            gl_FragColor = vec4(maxValue, maxValue, maxValue, 1.0);
        }
    `,
        }

        this.material = new THREE.ShaderMaterial(maxFilterShader)
        this.fsQuad = new FullScreenQuad(this.material)
        this.renderToScreen = false
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget,
    ) {
        this.uniforms.tDiffuse.value = readBuffer.texture
        if (this.renderToScreen) {
            renderer.setRenderTarget(null)
            this.fsQuad.render(renderer)
        } else {
            renderer.setRenderTarget(writeBuffer)
            if (this.clear) renderer.clear()
            this.fsQuad.render(renderer)
        }
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
    }
}
