import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three-soft-depth-of-field/src'
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js'

import { Pane } from 'tweakpane'

async function applyBokehEffect() {
    const pane = new Pane({})
    // Create renderer

    const renderer = new THREE.WebGLRenderer()

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // Fetch the image and create a texture
    const imageRes = await fetch('/image.png')
    const blob = await imageRes.blob()
    const imageBitmap = await createImageBitmap(blob, {
        imageOrientation: 'flipY',
    })
    const texture = new THREE.Texture(imageBitmap)

    texture.needsUpdate = true

    // Load the depth map
    const depthMapRes = await fetch('/depth.png')
    const depthBlob = await depthMapRes.blob()
    const depthImageBitmap = await createImageBitmap(depthBlob, {
        imageOrientation: 'flipY',
    })
    const depthTexture = new THREE.Texture(depthImageBitmap)
    depthTexture.needsUpdate = true

    // Create EffectComposer and passes
    const composer = new EffectComposer(renderer)
    const texturePass = new TexturePass(texture)
    // Create a camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    )

    const size = new THREE.Vector2(1920, 1080)
    renderer.getSize(size)

    const bokehPass = new BokehPass({
        depthMap: depthTexture,
        camera,
        size,
        focus: 1.0,
        fStops: 10,
        // sensorHeight: 50,
        focalLength: 6,
        dofDebug: true,
    })

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
