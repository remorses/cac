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
    const imageBitmap = await createImageBitmap(blob)
    const texture = new THREE.Texture(imageBitmap)
    texture.needsUpdate = true

    // Load the depth map
    const depthMapRes = await fetch('/depth.png')
    const depthBlob = await depthMapRes.blob()
    const depthImageBitmap = await createImageBitmap(depthBlob)
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
    // camera.position.z = 5

    // Create a scene (even though we're not using it for 3D objects, it's required for the RenderPass)
    const scene = new THREE.Scene()

    const size = new THREE.Vector2(1920, 1080)
    renderer.getSize(size)

    const bokehPass = new BokehPass({
        depthMap: depthTexture,
        camera,
        size,
        focus: 1.0,
        sensorHeight: 50,
        dofDebug: false,
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
        min: 1,
        max: 200,
        step: 1,
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
}

applyBokehEffect()
