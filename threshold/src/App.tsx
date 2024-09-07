import { ImageAsset, framer } from 'framer-plugin'
import useMeasure from 'react-use-measure'
import { Button } from 'template-rewrite-framer/src/components/Button'
import * as THREE from 'three'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const deg = Math.PI / 180

import {
    startTransition,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import './App.css'

import { assert, bytesFromCanvas, sleep, useAsyncEffect } from './utils'

const width = 300
const initialImage = await framer.getImage()
void framer.showUI({ position: 'top left', width, height: 360 })

function useSelectedImage() {
    const [image, setImage] = useState<ImageAsset | null>(initialImage)

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

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    preserveDrawingBuffer: true,
    alpha: true,
})
renderer.outputColorSpace = THREE.SRGBColorSpace

const texture = new THREE.Texture()
texture.colorSpace = THREE.LinearSRGBColorSpace

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

    useLayoutEffect(() => {
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
    const [rotations, setRotations] = useState({ x: 0, y: 10 })
    const [color, setColor] = useState('#000000')
    const [intensity, setIntensity] = useState(1)
    const [focus, setFocus] = useState(0.6)
    const [isLoading, setIsLoading] = useState(true)
    const handleSaveImage = async () => {
        setIsLoading(true)
        await sleep(20)
        await updateCanvas({ isPreview: false })
        await sleep(20)
        const originalImage = await image.getData()

        const nextBytes = await bytesFromCanvas(canvas)

        // const img = document.createElement('img')
        // img.src = URL.createObjectURL(new Blob([nextBytes!]))
        // document.body.appendChild(img)
        assert(nextBytes)

        console.log(
            'saving image with type',
            originalImage.mimeType,
            nextBytes.length,
        )
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
        if (!bitmap) {
            return
        }
        texture.dispose()
        texture.image = bitmap
        texture.needsUpdate = true
        const img = texture.image
        const aspectRatio = img.width / img.height
        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
        plane.scale.set(aspectRatio, 1, 1)
        renderer.setSize(img?.width, img?.height)
        renderer.setViewport(0, 0, img.width, img.height)
        await updateCanvas({ isPreview: true })
    }, [image])

    const updateCanvas = async ({ isPreview = false }) => {
        const { x: rotationX, y: rotationY } = rotations
        const threeColor = new THREE.Color(color)
        const img: HTMLImageElement | null = texture.image
        scene.background = threeColor
        let aspectRatio = 1
        if (img) {
            aspectRatio = img.width / img.height
        } else {
            console.log('no image found in texture!')
        }
        if (isPreview) {
            renderer.setPixelRatio(1 / 4)
        } else {
            renderer.setPixelRatio(1)
        }

        plane.rotation.set(rotationX * deg, rotationY * deg, 0)

        const offset = (angle: number) =>
            -0.2 * (angle / (45 + Math.abs(angle)))
        camera.lookAt(
            plane.position.x + offset(rotationY),
            plane.position.y + offset(rotationX),
            plane.position.z,
        )
        const composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))
        const bokehPass = new BokehPass(scene, camera, {
            focus: focus,
            aspect: aspectRatio,
            aperture: 0.16,
            maxblur: 0.2,
        })
        composer.addPass(bokehPass)
        const vignettePass = new ShaderPass(vignetteShader)

        let vignetteRotation = Math.atan2(-rotationX, rotationY)

        vignettePass.uniforms.rotation.value = vignetteRotation
        vignettePass.uniforms.color.value = threeColor
        vignettePass.uniforms.intensity.value = intensity
        composer.addPass(vignettePass)

        composer.addPass(new ShaderPass(filmGrainShader))
        composer.render()

        if (isPreview) {
            setIsLoading(false)
        }
    }

    const handleRotationChange = useCallback(
        (axis: 'x' | 'y', nextValue: number) => {
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
            if (!image) {
                return
            }
            await updateCanvas({ isPreview: true })
        },
        [rotations, color, intensity, focus],
    )

    return (
        <div ref={ref} className='shrink-0 w-full flex flex-col gap-4 pt-0 p-4'>
            <div className='flex flex-col items-center justify-center'>
                <CanvasComponent className='flex flex-col rounded-md' />
            </div>
            <div className=' flex flex-col w-full gap-3'>
                {(['x', 'y'] as const).map((axis) => (
                    <SliderAndNumber
                        key={axis}
                        label={axis}
                        value={rotations[axis]}
                        onChange={(v) => {
                            handleRotationChange(axis, Number(v))
                        }}
                        rangeProps={{
                            min: '-40',
                            max: '40',
                        }}
                    />
                ))}
            </div>

            <SliderAndNumber
                label='Intensity'
                value={intensity}
                onChange={(v) => {
                    setIntensity(Number(v))
                }}
                rangeProps={{
                    min: '0',
                    max: '2',
                    step: '0.01',
                }}
            />
            <SliderAndNumber
                label='Focus'
                value={focus}
                onChange={(v) => {
                    setFocus(Number(v))
                }}
                rangeProps={{
                    min: '0.4',
                    max: '0.8',
                    step: '0.01',
                }}
            />
            <div className='grid w-full grid-cols-[1fr_80px_80px] gap-4 items-center'>
                <div>Background</div>

                <input
                    type='color'
                    className='w-auto ml-0'
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                />
                <div className=''></div>
            </div>

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
const SliderAndNumber = ({
    label,
    value,
    onChange,
    rangeProps, // Added rangeProps
}: {
    label: string
    value: number
    onChange: (value: number) => void
    rangeProps: React.InputHTMLAttributes<HTMLInputElement> // Added rangeProps type
}) => {
    return (
        <div className='grid w-full grid-cols-[1fr_80px_80px] gap-4 items-center'>
            <div>{label}</div>
            <input
                type='number'
                value={value}
                onChange={(event) => {
                    onChange(Number(event.target.value))
                }}
                className=' w-auto'
            />
            <input
                type='range'
                defaultValue={0}
                className='w-auto'
                ref={(el) => {
                    setRangeProgress(el)
                }}
                value={value}
                onChange={(event) => {
                    setRangeProgress(event.target)
                    onChange(Number(event.target.value))
                }}
                {...rangeProps} // Spread rangeProps
            />
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

function setRangeProgress(el?: HTMLInputElement | null) {
    if (!el) {
        return
    }
    const range = el
    const min = range.min ? parseFloat(range.min) : 0
    const max = range.max ? parseFloat(range.max) : 100
    const value = parseFloat(range.value)

    const progress = ((value - min) / (max - min)) * 100
    range.style.setProperty('--progress', `${progress}%`)
}
