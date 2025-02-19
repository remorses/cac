import * as THREE from 'three'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
const deg = Math.PI / 180

export class ThreeCanvas {
    canvas: HTMLCanvasElement
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    texture: THREE.Texture
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh
    bokehPass: BokehPass
    private composer: EffectComposer
    private filmGrainPass: ShaderPass
    private controls: OrbitControls

    private animationFrameId: number | null = null

    startRenderLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
        }

        const animate = () => {
            this.updateCanvas()
            this.animationFrameId = requestAnimationFrame(animate)
        }

        this.animationFrameId = requestAnimationFrame(animate)
    }

    stopRender() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }
    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.className = 'rounded-md !max-w-full !max-h-full !h-auto'

        this.scene = new THREE.Scene()
        // this.scene.scale.y = -1 // TODO not sure why this is needed. the scene is flipped

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvas,
            preserveDrawingBuffer: true,
            // alpha: true,
            precision: 'highp',
            // logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
        })

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(1920, 1080)
        this.renderer.outputColorSpace = THREE.SRGBColorSpace

        this.texture = new THREE.Texture()
        this.texture.colorSpace = THREE.LinearSRGBColorSpace

        // this.texture.flipY = false

        this.camera = new THREE.PerspectiveCamera(75, 1920 / 1080, 0.1, 1000)
        this.camera.position.x = 0.2 // Add slight x offset
        this.camera.position.y = 0.1 // Add slight y offset

        this.camera.updateProjectionMatrix()

        const geometry = new THREE.PlaneGeometry(1, 1)

        const material = new THREE.MeshBasicMaterial({ map: this.texture })
        material.side = THREE.DoubleSide

        this.plane = new THREE.Mesh(geometry, material)

        this.scene.add(this.plane)
        this.camera.position.z = 0.6

        // Setup EffectComposer and passes
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        const size = new THREE.Vector2(1920, 1080)
        this.renderer.getSize(size)

        const aspectRatio = size.width / size.height
        // https://github.com/mrdoob/three.js/blob/79497a2c9b86036cfcc0c7ed448574f2d62de64d/examples/jsm/postprocessing/BokehPass.js#L53
        const bokehPass = new BokehPass(this.scene, this.camera, {
            focus: 0.6,
            aspect: aspectRatio,
            aperture: 0.5,
            maxblur: 0.12,
        })
        this.bokehPass = bokehPass
        this.composer.addPass(this.bokehPass)

        this.filmGrainPass = new ShaderPass(filmGrainShader)
        this.composer.addPass(this.filmGrainPass)

        // Add OrbitControls after camera setup
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.rotateSpeed = 0.1 // Lower rotation sensitivity
        this.controls.zoomSpeed = 0.5
        this.controls.enableDamping = false
        this.controls.dampingFactor = 0.05
        this.controls.maxDistance = 2
        this.controls.minDistance = 0.3
        this.controls.enablePan = true
        this.controls.maxPolarAngle = Math.PI / 2
        this.controls.minPolarAngle = 0

        // Replace click handlers with double click handler
        this.canvas.addEventListener(
            'dblclick',
            this.handleDoubleClick.bind(this),
        )
    }

    private handleDoubleClick(event: MouseEvent) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = this.canvas.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // Setup the raycaster
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)

        // Check for intersections with the plane
        const intersects = raycaster.intersectObject(this.plane)

        if (intersects.length > 0) {
            // Get the intersection point in world coordinates
            const point = intersects[0].point

            // Calculate vector from camera to intersection point
            const cameraToPoint = new THREE.Vector3()
            cameraToPoint.subVectors(point, this.camera.position)

            // Get the distance along camera's view direction
            const viewDirection = new THREE.Vector3(0, 0, -1)
            viewDirection.applyQuaternion(this.camera.quaternion)
            const distance = cameraToPoint.dot(viewDirection)

            console.log('setting focus distance', distance)
            this.bokehPass.uniforms['focus'].value = distance
        }
    }

    updateRendererSize({ isPreview = false }: { isPreview?: boolean } = {}) {
        const img = this.texture.image
        if (!img) {
            return
        }
        const minPixels = 1920 * 1080

        let targetWidth = img.width
        let targetHeight = img.height

        if (targetWidth * targetHeight < minPixels) {
            const scale = Math.sqrt(minPixels / (targetWidth * targetHeight))
            targetWidth = Math.ceil(targetWidth * scale)
            targetHeight = Math.ceil(targetHeight * scale)
        }

        let maxPixels = 3840 * 2160 * 2 // 4K resolution
        if (isPreview) {
            maxPixels = 1280 * 720
        }

        if (targetWidth * targetHeight > maxPixels) {
            const scale = Math.sqrt(maxPixels / (targetWidth * targetHeight))
            targetWidth = Math.ceil(targetWidth * scale)
            targetHeight = Math.ceil(targetHeight * scale)
        }

        console.log(`setting size to ${targetWidth}x${targetHeight}`)
        this.renderer.setSize(targetWidth, targetHeight, false)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setViewport(0, 0, targetWidth, targetHeight)
        
        this.camera.aspect = targetWidth / targetHeight
        this.camera.updateProjectionMatrix()
        
        this.bokehPass.needsSwap = true
        this.bokehPass.setSize(targetWidth, targetHeight)
        this.filmGrainPass.setSize(targetWidth, targetHeight)
        this.composer.setSize(targetWidth, targetHeight)
    }

    changeImage(bitmap: ImageBitmap) {
        this.texture.dispose()
        this.texture.image = bitmap
        this.texture.needsUpdate = true
        const img = this.texture.image
        const aspectRatio = img.width / img.height
        this.camera.aspect = aspectRatio
        this.camera.updateProjectionMatrix()

        this.bokehPass.uniforms['aspect'].value = aspectRatio
        this.plane.scale.set(aspectRatio, 1, 1)

        this.updateRendererSize({ isPreview: true })
        this.startRenderLoop()
    }

    shadowColor = '#000000'
    aperture = 0.07

    async updateCanvas() {
        const threeColor = new THREE.Color(this.shadowColor)
        const img: HTMLImageElement | null = this.texture.image
        this.scene.background = threeColor
        this.scene.fog = new THREE.Fog(
            threeColor,
            0,
            this.camera.position.z * 4,
        )

        // https://github.com/mrdoob/three.js/blob/79497a2c9b86036cfcc0c7ed448574f2d62de64d/examples/jsm/postprocessing/BokehPass.js#L53
        // this.bokehPass.uniforms['focus'].value = focus
        this.bokehPass.uniforms['aperture'].value = this.aperture
        // this.bokehPass.needsSwap = true

        // this.plane.rotation.set(0, 0, 0)

        this.camera.lookAt(
            this.plane.position.x,
            this.plane.position.y,
            this.plane.position.z,
        )
        // this.texture.needsUpdate = true

        // Update controls in the render loop
        this.controls.update()
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
        grainIntensity: { value: 0.02 },
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
