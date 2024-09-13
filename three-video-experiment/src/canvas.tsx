import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { getProject, types } from '@theatre/core'

export const deg = Math.PI / 180
export class ThreeCanvas {
    canvas: HTMLCanvasElement
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    texture: THREE.Texture
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh
    composer: EffectComposer
    controls: OrbitControls
    transformControls: TransformControls
    constructor({
        initialImageSize,
        isPreview = true,
    }: {
        initialImageSize?: { width: number; height: number } | undefined
        isPreview?: boolean
    }) {
        this.canvas = document.createElement('canvas')
        this.canvas.className = 'rounded-md !max-w-full !max-h-full !h-auto'

        this.scene = new THREE.Scene()
        // this.scene.scale.y = -1 // TODO not sure why this is needed. the scene is flipped

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvas,
            preserveDrawingBuffer: true,
            alpha: true,
        })
        if (initialImageSize) {
            this.renderer.setSize(
                initialImageSize.width,
                initialImageSize.height,
            )
            this.renderer.setViewport(
                0,
                0,
                initialImageSize.width,
                initialImageSize.height,
            )
        }

        this.composer = new EffectComposer(this.renderer)
        this.renderer.outputColorSpace = THREE.SRGBColorSpace

        this.texture = new THREE.Texture()
        this.texture.colorSpace = THREE.LinearSRGBColorSpace

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        this.camera.updateProjectionMatrix()

        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
        })

        this.plane = new THREE.Mesh(geometry, material)

        this.scene.add(this.plane)
        if (isPreview) {
            this.scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444))

            this.camera.position.z = 0.6

            // Add OrbitControls
            this.controls = new OrbitControls(this.camera, this.canvas)
            this.controls.enableDamping = true
            this.controls.dampingFactor = 0.25

            // Add TransformControls
            this.transformControls = new TransformControls(
                this.camera,
                this.canvas,
            )
            // Set the mode to combined (rotation and position)
            this.transformControls.setMode('translate')

            // Show both rotation and position controls
            this.transformControls.showX = true
            this.transformControls.showY = true
            this.transformControls.showZ = true
            this.transformControls.attach(this.plane)
            this.scene.add(this.transformControls)

            // Disable orbit controls when using transform controls
            this.transformControls.addEventListener(
                'dragging-changed',
                (event) => {
                    this.controls.enabled = !event.value
                },
            )

            // Add event listeners for controls changes
            this.controls.addEventListener('change', () => {
                this.render()
            })

            this.transformControls.addEventListener('change', () => {
                this.render()
            })
        }
    }

    render() {
        this.composer.render()
    }

    changeImage(bitmap: ImageBitmap | VideoFrame) {
        this.texture.dispose()
        this.texture.image = bitmap

        this.texture.needsUpdate = true

        const size = getDimensions(bitmap)
        const aspectRatio = size.width / size.height
        this.camera.aspect = aspectRatio
        this.camera.updateProjectionMatrix()
        this.plane.scale.set(aspectRatio, 1, 1)

        this.renderer.setSize(size?.width, size?.height)
        this.renderer.setViewport(0, 0, size.width, size.height)
    }
    changeVideo(video: HTMLVideoElement) {
        this.texture.dispose()
        this.texture.flipY = false
        this.texture = new THREE.VideoTexture(video)
        this.texture.colorSpace = THREE.LinearSRGBColorSpace
        this.texture.needsUpdate = true
        const aspectRatio = video.videoWidth / video.videoHeight || 1
        this.camera.aspect = aspectRatio
        this.camera.updateProjectionMatrix()
        const material = new THREE.MeshBasicMaterial({ map: this.texture })

        this.plane.material = material
        this.plane.scale.set(aspectRatio, 1, 1)
        this.renderer.setSize(video.videoWidth, video.videoHeight)
        this.renderer.setViewport(0, 0, video.videoWidth, video.videoHeight)
    }

    update({ rotations, color, intensity, focus, z, isPreview = false }) {
        const { x: rotationX, y: rotationY } = rotations
        const threeColor = new THREE.Color(color)
        const img = this.texture.image
        this.camera.position.z = z || 0.6

        this.scene.background = threeColor
        let aspectRatio = 1
        if (img) {
            aspectRatio =
                (img.videoWidth || img.width) / (img.videoHeight || img.height)
        } else {
            console.log('no image found in texture!')
        }
        if (isPreview) {
            if (img?.width) {
                const perfectPixels = 600 * 600
                const imagePixels = img.width * img.height
                const scaleDownFactor = Math.sqrt(perfectPixels / imagePixels)
                console.log('scale down factor', scaleDownFactor)
                if (scaleDownFactor < 1) {
                    // this.renderer.setPixelRatio(scaleDownFactor)
                }
            }
        } else {
            this.renderer.setPixelRatio(1)
        }

        this.plane.rotation.set(rotationX * deg, rotationY * deg, 0)

        const offset = (angle: number) =>
            -0.2 * (angle / (45 + Math.abs(angle)))
        this.camera.lookAt(
            this.plane.position.x + offset(rotationY),
            this.plane.position.y + offset(rotationX),
            this.plane.position.z,
        )

        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        const bokehPass = new BokehPass(this.scene, this.camera, {
            focus: z + focus,
            // aspect: aspectRatio,
            aperture: 0.1,
            maxblur: 0.5,
        })
        this.composer.addPass(bokehPass)
        const smaaPass = new SMAAPass(
            this.renderer.domElement.width * this.renderer.getPixelRatio(),
            this.renderer.domElement.height * this.renderer.getPixelRatio(),
        )
        this.composer.addPass(smaaPass)

        // this.composer.addPass(new BokehPass(this.scene, this.camera, {
        //     focus: z + focus,
        //     // aspect: aspectRatio,
        //     // aperture: 0.16,
        //     maxblur: 0.01,
        // }))
        const vignettePass = new ShaderPass(vignetteShader)

        let vignetteRotation = Math.atan2(-rotationX, rotationY)

        vignettePass.uniforms.rotation.value = vignetteRotation
        vignettePass.uniforms.color.value = threeColor
        vignettePass.uniforms.intensity.value = intensity
        this.composer.addPass(vignettePass)

        this.composer.addPass(new ShaderPass(filmGrainShader))
        this.composer.render()
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
