import * as THREE from 'three'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
const deg = Math.PI / 180

export class ThreeCanvas {
    canvas: HTMLCanvasElement
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    texture: THREE.Texture
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh
    composer: EffectComposer
    constructor(
        initialImageSize?: { width: number; height: number } | undefined,
    ) {
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
        this.texture.flipY = false

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        this.camera.updateProjectionMatrix()

        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicMaterial({ map: this.texture })
        this.plane = new THREE.Mesh(geometry, material)

        this.scene.add(this.plane)
        this.camera.position.z = 0.6
    }

    render() {
        this.composer.render()
    }

    changeImage(bitmap: ImageBitmap) {
        this.texture.dispose()
        this.texture.image = bitmap
        this.texture.needsUpdate = true
        const img = this.texture.image
        const aspectRatio = img.width / img.height
        this.camera.aspect = aspectRatio
        this.camera.updateProjectionMatrix()
        this.plane.scale.set(aspectRatio, 1, 1)
        this.renderer.setSize(img?.width, img?.height)
        this.renderer.setViewport(0, 0, img.width, img.height)
    }
    changeVideo(video: HTMLVideoElement) {
        this.texture.dispose()
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
                    this.renderer.setPixelRatio(scaleDownFactor)
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
            aspect: aspectRatio,
            aperture: 0.16,
            maxblur: 0.2,
        })
        this.composer.addPass(bokehPass)
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
        grainIntensity: { value: 0.06 },
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
