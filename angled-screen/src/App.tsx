import { validateLicense } from '@lemonsqueezy/lemonsqueezy.js'
import { ImageAsset, framer } from 'framer-plugin'
import {
    Form,
    RouterProvider,
    createBrowserRouter,
    redirect,
    useActionData,
    useNavigate,
    useNavigation,
} from 'react-router-dom'
import useMeasure from 'react-use-measure'
import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import { basePath, withMode } from 'template-rewrite-framer/src/lib/utils'
import * as THREE from 'three'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import {
    startTransition,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import { assert, bytesFromCanvas, sleep, useAsyncEffect } from './utils'
enum PluginDataKeys {
    licenseKey = 'licenseKey',
    imagesGenerated = 'imagesGenerated',
}

enum Paths {
    root = '/',
    license = '/license',
}

const freeImageGenerations = 10

const lemonProductId = 348518

const buyUrl = `https://unframer.lemonsqueezy.com/checkout/buy/86b8fa59-f649-4250-aa24-6bfcd3c64f13`

const deg = Math.PI / 180

const width = 300
const initialImage = await framer.getImage()

await framer.showUI({ position: 'top left', width, height: 0 })
const initialImageSize = await initialImage?.measure()

function useSelectedImage() {
    const [image, setImage] = useState<ImageAsset | null>(initialImage)

    useEffect(() => {
        return framer.subscribeToImage(setImage)
    }, [])

    return image
}

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RotationsImage />,
            loader: async () => {
                const [license, imagesGenerated] = await Promise.all([
                    framer.getPluginData(PluginDataKeys.licenseKey),
                    framer
                        .getPluginData(PluginDataKeys.imagesGenerated)
                        .then((data) => Number(data) || 0),
                ])
                if (!license && imagesGenerated >= freeImageGenerations) {
                    console.log('redirecting to license')
                    return redirect(withMode(Paths.license))
                }
                console.log('not redirecting to license')
                return {}
            },
        },
        {
            path: Paths.license,
            element: <LicenseComponent />,
            action: async ({ request }) => {
                const formData = await request.formData()
                const licenseKey = formData.get('licenseKey')?.toString()

                if (!licenseKey) {
                    return { error: 'License key is required' }
                }

                try {
                    const { data, error } = await validateLicense(
                        licenseKey || '',
                    )
                    if (error) {
                        return { error: error.message || 'Invalid license key' }
                    }
                    if (data.valid) {
                        if (data.meta?.product_id !== lemonProductId) {
                            return {
                                error: 'License is for another product, contact support at tommy@unframer.co',
                            }
                        }
                        await framer.setPluginData(
                            PluginDataKeys.licenseKey,
                            licenseKey,
                        )
                        return redirect(withMode(Paths.root))
                    }
                    if (!data.valid) {
                        return {
                            error: data.error || 'License is invalid',
                        }
                    }
                    return {
                        error: 'Unknown error validating license',
                    }
                } catch (error) {
                    notifyError(error, 'Error validating license')
                    return { error: error.message }
                }
            },
        },
    ],
    { basename: basePath },
)

function LicenseComponent() {
    const actionData = useActionData() as any

    const navigation = useNavigation()
    const isLoading =
        navigation.state !== 'idle' && Boolean(navigation.formData)
    const navigate = useNavigate()
    return (
        <Container>
            <Form
                method='POST'
                className='flex shrink-0 w-full items-start flex-col justify-between gap-4'
            >
                <div className='flex flex-col text-center justify-center py-[30px] items-center text-balance gap-2 grow'>
                    <a href={buyUrl} target='_blank' className='font-semibold'>
                        Get a License Key
                    </a>
                    <div className='opacity-60'>
                        To create more than {freeImageGenerations} images, you
                        need a license key.{' '}
                        <a className='underline' href={buyUrl} target='_blank'>
                            Buy one here
                        </a>
                        .
                    </div>
                </div>

                <div className='flex shrink-0 items-stretch w-full flex-col gap-3'>
                    <input
                        required
                        placeholder='License Key'
                        type='text'
                        name='licenseKey'
                        className='rounded-md p-2 w-full bg-framer-tertiary'
                    />
                    {actionData?.error && (
                        <div className='text-red-400'>{actionData.error}</div>
                    )}
                    {actionData?.message && (
                        <div className=''>{actionData.message}</div>
                    )}
                    <div className='flex gap-3 w-full'>
                        <Button
                            variant='primary'
                            type='submit'
                            // disabled={isLoading}
                            isLoading={isLoading}
                            className='w-auto grow'
                        >
                            Activate Key
                        </Button>
                    </div>
                </div>
            </Form>
        </Container>
    )
}

export function App() {
    return <RouterProvider router={router} />
}

let canvas: HTMLCanvasElement = document.createElement('canvas')
canvas.className = 'rounded-md !max-w-full !max-h-full !h-auto'

const scene = new THREE.Scene()
scene.scale.y = -1 // TODO not sure why this is needed. the scene is flipped

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    preserveDrawingBuffer: true,
    alpha: true,
})
if (initialImageSize) {
    renderer.setSize(initialImageSize.width, initialImageSize.height)
    renderer.setViewport(0, 0, initialImageSize.width, initialImageSize.height)
}

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
function RotationsImage() {
    const image = useSelectedImage()
    const [rotations, setRotations] = useState({ x: 0, y: 10 })
    const [color, setColor] = useState('#000000')
    const [intensity, setIntensity] = useState(1)
    const [focus, setFocus] = useState(0.6)
    const [isLoading, setIsLoading] = useState(true)
    const [aspectRatio, setAspectRatio] = useState(() => {
        if (!initialImageSize) {
            return 1
        }
        return initialImageSize?.width / initialImageSize?.height
    })
    const handleSaveImage = async () => {
        if (!image) {
            return
        }
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
        const imagesGenerated = await framer
            .getPluginData(PluginDataKeys.imagesGenerated)
            .then((data) => Number(data) || 0)
        await Promise.all([
            framer.setImage({
                image: {
                    bytes: nextBytes,
                    mimeType: originalImage.mimeType,
                },
            }),
            framer.setPluginData(
                PluginDataKeys.imagesGenerated,
                String(imagesGenerated + 1),
            ),
        ])

        void framer.closePlugin('Image saved...')

        setIsLoading(false)
        framer.hideUI()
        console.log('total duration', performance.now() - start)
    }

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
        setAspectRatio(aspectRatio)
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
            if (img) {
                const perfectPixels = 600 * 600
                const imagePixels = img.width * img.height
                const scaleDownFactor = Math.sqrt(perfectPixels / imagePixels)
                console.log('scale down factor', scaleDownFactor)
                if (scaleDownFactor < 1) {
                    renderer.setPixelRatio(scaleDownFactor)
                }
            }
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

    if (!image) {
        return (
            <Container>
                <div className='flex flex-col gap-3 p-3 pt-0 min-h-[280px] items-center justify-center'>
                    <p>Select an Image First</p>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className='flex shrink-0 flex-col max-h-[280px] overflow-hidden items-center justify-center'>
                <CanvasComponent
                    style={{ aspectRatio: aspectRatio.toFixed(2) }}
                    className='flex flex-col items-center max-w-full max-h-full justify-center rounded-md'
                />
            </div>
            <div className='shrink-0 flex flex-col w-full gap-3'>
                {(['x', 'y'] as const).map((axis) => (
                    <SliderAndNumber
                        key={axis}
                        label={`Angle on ${axis}`}
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
            <SliderAndNumber
                label='Shadow'
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
            <div className='grid shrink-0 w-full grid-cols-[1fr_80px_80px] gap-4 items-center'>
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
        </Container>
    )
}

const Container = ({ children, ...rest }) => {
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
    return (
        <div ref={ref} className='shrink-0 w-full flex flex-col gap-4 pt-0 p-3'>
            {children}
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
        <div className='grid shrink-0 w-full grid-cols-[1fr_80px_80px] gap-4 items-center'>
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
                {...rangeProps} // Spread rangeProps
                className='w-auto slider'
                ref={(el) => {
                    setRangeProgress(el)
                }}
                value={value}
                onChange={(event) => {
                    setRangeProgress(event.target)
                    onChange(Number(event.target.value))
                }}
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
