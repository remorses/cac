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

import {
    startTransition,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import { assert, bytesFromCanvas, sleep, useAsyncEffect } from './utils'
import { ThreeCanvas } from './canvas'
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

const threeCanvas = new ThreeCanvas(initialImageSize)

function CanvasComponent({ ...rest }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        // Append the canvas to the container when the component mounts
        if (containerRef.current) {
            containerRef.current.appendChild(threeCanvas.canvas)
        }

        // Clean up function to remove the canvas when the component unmounts
        return () => {
            if (containerRef.current) {
                containerRef.current.removeChild(threeCanvas.canvas)
            }
        }
    }, [])

    return <div {...rest} ref={containerRef}></div>
}

function RotationsImage() {
    const image = useSelectedImage()

    const [color, setColor] = useState('#000000')
    const [shadowIntensity, setIntensity] = useState(1)
    // const [focus, setFocus] = useState(0.6)
    const [aperture, setAperture] = useState(0.1)
    const [isLoading, setIsLoading] = useState(true)
    const [aspectRatio, setAspectRatio] = useState(() => {
        if (!initialImageSize) {
            return 1
        }
        return initialImageSize?.width / initialImageSize?.height
    })

    // Add RAF state and ref
    const [isAnimating, setIsAnimating] = useState(false)
    const frameRef = useRef<number>(null)
    const paramsRef = useRef({ aperture, color, shadowIntensity, focus })
    useEffect(() => {
        paramsRef.current = { aperture, color, shadowIntensity, focus }
    }, [aperture, color, shadowIntensity, focus])

    // Setup animation loop
    useEffect(() => {
        if (!image || isLoading) return

        const updateFrame = async () => {
            await threeCanvas.updateCanvas({
                ...paramsRef.current,
                isPreview: false,
            })
            frameRef.current = requestAnimationFrame(updateFrame)
        }

        // Start animation
        frameRef.current = requestAnimationFrame(updateFrame)
        setIsAnimating(true)

        // Cleanup
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current)
            }
            setIsAnimating(false)
        }
    }, [image, isLoading])

    const handleSaveImage = async () => {
        if (!image) {
            return
        }
        setIsLoading(true)

        await threeCanvas.updateCanvas({
            color,
            // shadowIntensity,
            aperture,
            focus,
            isPreview: false,
        })
        await sleep(20)
        const originalImage = await image.getData()

        const nextBytes = await bytesFromCanvas(threeCanvas.canvas)

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

        setIsLoading(false)

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
        threeCanvas.changeImage(bitmap)
        const img = threeCanvas.texture.image
        const aspectRatio = img.width / img.height
        setAspectRatio(aspectRatio)
        setIsLoading(false)
    }, [image])

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
            {/* <div className='shrink-0 flex flex-col w-full gap-3'>
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
            </div> */}
            <div className='text-center select-none text-balance text-[11px] my-1'>
                Drag to rotate, press shift and drag to pan, double click to focus
            </div>

            {/* <SliderAndNumber
                label='Focus'
                value={focus}
                onChange={(v) => {
                    setFocus(Number(v))
                }}
                rangeProps={{
                    min: '0.0',
                    max: '2',
                    step: '0.01',
                }}
            /> */}
            <SliderAndNumber
                label='Aperture'
                value={aperture}
                onChange={(v) => {
                    setAperture(Number(v))
                }}
                rangeProps={{
                    min: '0.01',
                    max: '0.5',
                    step: '0.001',
                }}
            />
            {/* <SliderAndNumber
                label='Shadow'
                value={shadowIntensity}
                onChange={(v) => {
                    setIntensity(Number(v))
                }}
                rangeProps={{
                    min: '0',
                    max: '1',
                    step: '0.01',
                }}
            /> */}
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
        <div ref={ref} className='select-none shrink-0 w-full flex flex-col gap-4 pt-0 p-3'>
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
