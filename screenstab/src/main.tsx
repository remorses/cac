import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

/*
This function should apply a screenstab like effect to an image.
- rotate it in 3 dimensions
- apply a vignette effect to the edge where the image is rotated and is further away from the user (it should apply this effect only to one edge, not 4 like typical vignette effect)
- apply a realistic depth of field effect, where blur is more intense where the image is further away from the camera
*/

export const applyImageEffect = async (
    imageUrl: string,
    rotationX: number = Math.PI / 36,
    rotationY: number = Math.PI / 36,
    rotationZ: number = Math.PI / 36,
): Promise<string> => {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    // Load image texture
    const loader = new THREE.TextureLoader()
    const texture = await new Promise<THREE.Texture>((resolve) => {
        loader.load(imageUrl, resolve)
    })
    const aspectRatio = texture.image.width / texture.image.height

    renderer.setSize(texture.image.width, texture.image.height)
    renderer.setViewport(0, 0, texture.image.width, texture.image.height)
    // camera.aspect = aspectRatio
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000)
    camera.updateProjectionMatrix()

    // Create a plane with the image texture
    const geometry = new THREE.PlaneGeometry(aspectRatio, 1)
    const material = new THREE.MeshBasicMaterial({ map: texture })
    const plane = new THREE.Mesh(geometry, material)

    // Apply rotation
    plane.rotation.set(rotationX, rotationY, rotationZ)

    scene.add(plane)
    camera.position.z = 0.6

    // Set up post-processing
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    // Add Bokeh (depth of field) effect
    const bokehPass = new BokehPass(scene, camera, {
        focus: camera.position.z,
        aperture: 0.16,
        maxblur: 0.04,
    })
    composer.addPass(bokehPass)

    // Add vignette effect
    const vignetteShader = {
        uniforms: {
            tDiffuse: { value: null },
            offset: { value: 0.95 },
            darkness: { value: 1.6 },
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
      uniform float offset;
      uniform float darkness;
      varying vec2 vUv;
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec2 uv = (vUv - 0.5) * 2.0;
        float vignetteAmount = 1.0 - uv.x * uv.x; // Apply vignette effect only on the left edge
        vignetteAmount = smoothstep(0.0, offset, vignetteAmount);
        texel.rgb = mix(texel.rgb, texel.rgb * vignetteAmount, darkness);
        gl_FragColor = texel;
      }
    `,
    }
    const vignettePass = new ShaderPass(vignetteShader)
    composer.addPass(vignettePass)

    // Render the scene
    composer.render()

    // Get the rendered image as a data URL
    const dataUrl = renderer.domElement.toDataURL()

    return dataUrl
}
