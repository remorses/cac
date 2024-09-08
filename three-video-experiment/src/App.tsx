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

function useSelectedImage() {
    const [image, setImage] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setImage(file)
    }

    return { image, handleFileChange }
}

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RotationsImage />,
            loader: async () => {
                const imagesGenerated =
                    Number(
                        localStorage.getItem(PluginDataKeys.imagesGenerated),
                    ) || 0
                if (imagesGenerated >= freeImageGenerations) {
                    console.log('redirecting to license')
                    return redirect(Paths.license)
                }
                console.log('not redirecting to license')
                return {}
            },
        },
    ],
    // { basename: basePath },
)

export function App() {
    return <RouterProvider router={router} />
}

const threeCanvas = new ThreeCanvas()

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
    const { image, handleFileChange } = useSelectedImage()
    const [rotations, setRotations] = useState({ x: 0, y: 10 })
    const [color, setColor] = useState('#000000')
    const [intensity, setIntensity] = useState(1)
    const [focus, setFocus] = useState(0.6)
    const [isLoading, setIsLoading] = useState(true)
    const [aspectRatio, setAspectRatio] = useState(1)

    const handleSaveImage = async () => {
        if (!image) {
            return
        }
        setIsLoading(true)
        await sleep(20)
        await threeCanvas.updateCanvas({
            rotations,
            color,
            intensity,
            focus,
            isPreview: false,
        })
        await sleep(20)

        const nextBytes = await bytesFromCanvas(threeCanvas.canvas)

        assert(nextBytes)

        console.log('saving image with type', image.type, nextBytes.length)
        const start = performance.now()
        const imagesGenerated =
            Number(localStorage.getItem(PluginDataKeys.imagesGenerated)) || 0
        localStorage.setItem(
            PluginDataKeys.imagesGenerated,
            String(imagesGenerated + 1),
        )

        setIsLoading(false)
        console.log('total duration', performance.now() - start)
    }

    useAsyncEffect(async () => {
        if (!image) {
            return
        }
        console.log('loading image into canvas')
        const bitmap = await createImageBitmap(image)
        if (!bitmap) {
            return
        }
        threeCanvas.changeImage(bitmap)
        const img = threeCanvas.texture.image
        const aspectRatio = img.width / img.height
        setAspectRatio(aspectRatio)
        await threeCanvas.updateCanvas({
            rotations,
            color,
            intensity,
            focus,
            isPreview: true,
        })
        setIsLoading(false)
    }, [image])

    const handleRotationChange = useCallback(
        (axis: 'x' | 'y', nextValue: number) => {
            startTransition(() => {
                setRotations((prev) => ({ ...prev, [axis]: nextValue }))
            })
        },
        [rotations],
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
            await threeCanvas.updateCanvas({
                rotations,
                color,
                intensity,
                focus,
                isPreview: true,
            })
            setIsLoading(false)
        },
        [rotations, color, intensity, focus],
    )

    if (!image) {
        return (
            <Container>
                <div className='flex flex-col gap-3 p-3 pt-0 min-h-[280px] items-center justify-center'>
                    <p>Select an Image First</p>
                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                    />
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
    return (
        <div
            ref={ref}
            style={{ width, height }}
            className='shrink-0 w-full flex flex-col gap-4 pt-0 p-3 m-12'
        >
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
