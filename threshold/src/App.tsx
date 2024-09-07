import { ImageAsset, framer } from 'framer-plugin'
import { Endpoint, expose, transfer } from 'comlink'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const deg = Math.PI / 360
import useMeasure from 'react-use-measure'
import { Button } from 'template-rewrite-framer/src/components/Button'

import {
    startTransition,
    useCallback,
    useDeferredValue,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import './App.css'

import { assert, bytesFromCanvas, maxKey, sleep, useAsyncEffect } from './utils'

import { applyImageEffect } from './canvas'

const width = 680
void framer.showUI({ position: 'top left', width, height: 360 })

function useSelectedImage() {
    const [image, setImage] = useState<ImageAsset | null>(null)

    useEffect(() => {
        return framer.subscribeToImage(setImage)
    }, [])

    return image
}

export function App() {
    const image = useSelectedImage()

    if (!image) {
        return (
            <div className='flex flex-col gap-3 grow p-3 pt-0 items-center justify-center'>
                <p>Select an Image First</p>
            </div>
        )
    }

    return <RotationsImage image={image} />
}

let canvas: HTMLCanvasElement = document.createElement('canvas')
canvas.className = 'rounded-md !max-w-full !h-auto'

const scene = new THREE.Scene()
scene.scale.y = -1 // TODO not sure why this is needed. the scene is flipped

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

const texture = new THREE.Texture()
texture.flipY = false

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
camera.updateProjectionMatrix()

const geometry = new THREE.PlaneGeometry(1, 1)
const material = new THREE.MeshBasicMaterial({ map: texture })
const plane = new THREE.Mesh(geometry, material)

scene.add(plane)
camera.position.z = 0.6

function CanvasComponent({ ...rest }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Append the canvas to the container when the component mounts
        if (containerRef.current) {
            containerRef.current.appendChild(canvas)
        }

        // Clean up function to remove the canvas when the component unmounts
        return () => {
            if (containerRef.current) {
                containerRef.current.removeChild(canvas)
            }
        }
    }, [])

    return <div {...rest} ref={containerRef}></div>
}

function RotationsImage({ image }: { image: ImageAsset }) {
    const [rotations, setRotations] = useState({ x: 0, y: 0, z: 0 })
    const [color, setColor] = useState('#000000')
    const [intensity, setIntensity] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const handleSaveImage = async () => {
        setIsLoading(true)
        await updateCanvas({ isPreview: false })

        const originalImage = await image.getData()

        const nextBytes = await bytesFromCanvas(canvas)
        assert(nextBytes)

        const start = performance.now()

        await framer.setImage({
            image: {
                bytes: nextBytes,
                mimeType: originalImage.mimeType,
            },
        })

        void framer.closePlugin('Image saved...')

        setIsLoading(false)
        framer.hideUI()
        console.log('total duration', performance.now() - start)
    }
    const [ref, { height }] = useMeasure()

    useLayoutEffect(() => {
        console.log('opening framer ui')
        framer.showUI({
            // title: (handle?.handle as any) || '',
            position: 'top left',
            width,
            height: height || 100,
        })
    }, [height])

    useAsyncEffect(async () => {
        if (!image) {
            return
        }
        console.log('loading image into canvas')
        const bitmap = await image.loadBitmap()
        texture.image = bitmap
        texture.needsUpdate = true
        await updateCanvas({ isPreview: true })
    }, [image])

    const updateCanvas = async ({ isPreview = false }) => {
        const { x: rotationX, y: rotationY, z: rotationZ } = rotations
        const threeColor = new THREE.Color(color)
        const img = texture.image
        const aspectRatio = img.width / img.height

        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
        plane.scale.set(aspectRatio, 1, 1)
        scene.background = threeColor
        console.log(
            'texture size',
            texture.image.width,
            texture.image.height,
            img.width,
            img.height,
        )
        renderer.setSize(img?.width, img?.height)
        if (isPreview) {
            renderer.setPixelRatio(1 / 4)
        } else {
            renderer.setPixelRatio(1)
        }
        renderer.setViewport(0, 0, img.width, img.height)
        plane.rotation.set(rotationX * deg, rotationY * deg, rotationZ * deg)

        camera.lookAt(plane.position)
        const composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))

        const bokehPass = new BokehPass(scene, camera, {
            focus: camera.position.z,
            aspect: aspectRatio,
            aperture: 0.12,
            maxblur: 0.05,
        })
        composer.addPass(bokehPass)

        const vignettePass = new ShaderPass(vignetteShader)

        let vignetteRotation = Math.atan2(-rotationX, rotationY)

        vignettePass.uniforms.rotation.value = vignetteRotation
        vignettePass.uniforms.color.value = threeColor
        vignettePass.uniforms.intensity.value = intensity
        composer.addPass(vignettePass)
        composer.render()
        if (isPreview) {
            setIsLoading(false)
        }
    }

    const handleRotationChange = useCallback(
        (axis: 'x' | 'y' | 'z', nextValue: number) => {
            startTransition(() => {
                setRotations((prev) => ({ ...prev, [axis]: nextValue }))
            })
        },
        [updateCanvas, rotations],
    )

    useAsyncEffect(
        async (controller) => {
            await sleep(50)
            if (controller.signal.aborted) {
                return
            }
            await updateCanvas({ isPreview: true })
        },
        [rotations, color, intensity],
    )

    return (
        <div
            ref={ref}
            className='shrink-0 w-full grow flex flex-col gap-3 pt-0 p-3'
        >
            <div className='flex flex-col items-center justify-center'>
                <CanvasComponent className='flex grow flex-col rounded-md' />
            </div>

            <div className='grow flex flex-row w-full gap-3'>
                {(['x', 'y', 'z'] as const).map((axis) => (
                    <label className='flex flex-col grow gap-2' key={axis}>
                        {axis.toUpperCase()}:
                        <input
                            type='range'
                            defaultValue={0}
                            min='-40'
                            max='40'
                            className='w-full'
                            value={rotations[axis]}
                            onChange={(event) =>
                                handleRotationChange(
                                    axis,
                                    Number(event.target.value),
                                )
                            }
                        />
                    </label>
                ))}
            </div>
            <label className='flex flex-col grow gap-2'>
                Color:
                <input
                    type='color'
                    className='w-full'
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                />
            </label>
            <label className='flex flex-col grow gap-2'>
                Intensity:
                <input
                    type='range'
                    defaultValue={0.5}
                    min='0'
                    max='2'
                    step='0.01'
                    className='w-full'
                    value={intensity}
                    onChange={(event) =>
                        setIntensity(Number(event.target.value))
                    }
                />
            </label>
            <Button
                isLoading={isLoading}
                variant='primary'
                onClick={handleSaveImage}
            >
                Save Image
            </Button>
        </div>
    )
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
        float vignette = smoothstep(1.0, 0.4, rotatedUv.x);
        vignette = pow(vignette, intensity);
        
        gl_FragColor = vec4(texel.rgb * mix(texel.rgb, color, 1.0 - vignette), texel.a);
      }
    `,
}
