import { Endpoint, expose, transfer } from 'comlink'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const deg = Math.PI / 360

export const applyImageEffect = async ({
    imageBitmap,
    rotationX = deg * 10,
    rotationY = deg * 20,
    rotationZ = deg * 0,
}: {
    imageBitmap: ImageBitmap
    rotationX?: number
    rotationY?: number
    rotationZ?: number
}) => {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene()

    const renderer = new THREE.WebGLRenderer({ antialias: true })

    // Load image texture
    // const loader = new THREE.TextureLoader()
    // const texture = await new Promise<THREE.Texture>((resolve) => {
    //     loader.load(imageBitmap, resolve)
    // })

    const texture = new THREE.Texture()
    texture.image = imageBitmap
    texture.needsUpdate = true

    const aspectRatio = texture.image.width / texture.image.height
    console.log('texture size', texture.image.width, texture.image.height)

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
    // Make the camera look at the plane

    camera.lookAt(plane.position)

    // Set up post-processing
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    // Add Bokeh (depth of field) effect
    const bokehPass = new BokehPass(scene, camera, {
        focus: camera.position.z,
        aperture: 0.1,
        maxblur: 0.03,
    })
    composer.addPass(bokehPass)
    // Function to find the key of the maximum value in an object
    const maxKey = (obj: { [key: string]: number }) => {
        return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b))
    }

    // Determine the most prominent rotation axis
    const absRotations = {
        x: Math.abs(rotationX),
        y: Math.abs(rotationY),
        // z: Math.abs(rotationZ),
    }
    const prominentAxis = maxKey(absRotations)

    let edge = 0 // Default to right edge

    switch (prominentAxis) {
        case 'x':
            edge = rotationX > 0 ? 3 : 2 // Bottom if positive, top if negative
            break
        case 'y':
            edge = rotationY > 0 ? 0 : 1 // Right if positive, left if negative
            break
    }

    const vignetteShader = new VignetteShader(edge)
    const vignettePass = new ShaderPass(vignetteShader)
    composer.addPass(vignettePass)

    // Render the scene
    composer.render()

    // Return the canvas as a bitmap
    const bitmap = await createImageBitmap(renderer.domElement, {
        imageOrientation: 'flipY',
    })
    return bitmap
}

class VignetteShader {
    uniforms: {
        tDiffuse: { value?: THREE.Texture | null }
        offset: { value: number }
        darkness: { value: number }
        edge: { value: number }
    }
    vertexShader: string
    fragmentShader: string
    constructor(edge: number) {
        this.uniforms = {
            tDiffuse: { value: null },
            offset: { value: 1 },
            darkness: { value: 1 },
            edge: { value: edge }, // Parametrize edge
        }
        this.vertexShader = `
          varying vec2 vUv;
          void main() {
              vUv = uv; // Pass UV coordinates to the fragment shader
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Set the position of the vertex
          }
      `
        this.fragmentShader = `
          uniform sampler2D tDiffuse; // The texture to apply the vignette effect to
          uniform float offset; // The offset value for the vignette effect
          uniform float darkness; // The darkness value for the vignette effect
          uniform int edge; // The edge to apply the vignette effect to
          varying vec2 vUv; // The UV coordinates passed from the vertex shader
          void main() {
              vec4 texel = texture2D(tDiffuse, vUv); // Get the color of the current pixel
              vec2 uv = (vUv - 0.5) * 2.0; // Transform UV coordinates to range [-1, 1]
              float vignetteAmount;
              if (edge == 0) { // Apply vignette effect on the right edge
                  vignetteAmount = 1.0 - uv.x;
              } else if (edge == 1) { // Apply vignette effect on the left edge
                  vignetteAmount = 1.0 + uv.x;
              } else if (edge == 2) { // Apply vignette effect on the top edge
                  vignetteAmount = 1.0 - uv.y;
              } else if (edge == 3) { // Apply vignette effect on the bottom edge
                  vignetteAmount = 1.0 + uv.y;
              }
              vignetteAmount = min(vignetteAmount, smoothstep(0.0, offset, vignetteAmount)); // Apply only if it darkens the image
              texel.rgb = mix(texel.rgb, texel.rgb * vignetteAmount, darkness); // Mix the original color with the vignette effect
              gl_FragColor = texel; // Set the final color of the pixel
          }
      `
    }
}
