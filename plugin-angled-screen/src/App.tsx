import { Suspense } from 'react'
import heroImage from './angled screen hero image@4x.png'

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
import { Button } from 'plugin-migrate/src/components/Button'
import { notifyError } from 'plugin-migrate/src/lib/errors'
import { basePath, withMode } from 'plugin-migrate/src/lib/utils'

import { use, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { flushSync } from 'react-dom'
import {
    LoaderFunctionArgs,
    useRevalidator,
    useRouteLoaderData,
} from 'react-router'
import { ThreeCanvas } from './canvas'
import {
    assert,
    bytesFromCanvas,
    pluginApiClient,
    sleep,
    useAsyncEffect,
} from './utils'
import { createBuyAngledScreenUrl } from 'website/src/lib/env'

enum Paths {
    root = '/',
    license = '/license',
}

const defaultWith = 340

await framer.showUI({ position: 'top left', width: defaultWith, height: 0 })


function useSelectedImage() {
    const [image, setImage] = useState<ImageAsset | null>(null)

    useEffect(() => {
        return framer.subscribeToImage(setImage)
    }, [])

    return image
}
const router = createBrowserRouter(
    [
        {
            path: '/',
            loader,
            id: 'root',
            shouldRevalidate: () => {
                return true
            },
            children: [
                {
                    path: '',
                    element: <RotationsImage />,
                },
                {
                    path: Paths.license,
                    element: <LicenseComponent />,
                    action: async ({ request }) => {
                        const formData = await request.formData()
                        const licenseKey = formData
                            .get('licenseKey')
                            ?.toString()
                        const { id: framerUserId, name: userName } =
                            await framer.getCurrentUser()
                        if (!licenseKey) {
                            return { error: 'License key is required' }
                        }

                        const { data, error } =
                            await pluginApiClient.api.plugins.angledScreen.activate.post(
                                {
                                    framerUserId,
                                    userName,
                                    licenseKey,
                                },
                            )

                        if (error) {
                            notifyError(error, 'Error validating license')
                            return { error: error.message }
                        }
                        if (data.error) {
                            return data
                        }
                        return redirect(withMode(Paths.root))
                    },
                },
            ],
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
    const { deferred } = useRouteLoaderData<typeof loader>('root')!

    const data = use(deferred)

    const buyUrl = createBuyAngledScreenUrl({
        framerUserId: data.framerUserId,
    })

    return (
        <Container width={260}>
            <Form
                method='POST'
                className='flex shrink-0 w-full items-start flex-col justify-between gap-4'
            >
                <div className='flex flex-col text-center justify-center py-[30px] items-center text-balance gap-2 grow'>
                    <a href={buyUrl} target='_blank' className='font-semibold'>
                        Get a License Key
                    </a>
                    <div className='opacity-60'>
                        to create more than{' '}
                        <Suspense>{use(deferred)?.maxFreeGenerations}</Suspense>{' '}
                        images, you need a license key.{' '}
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

async function loader({ request }: LoaderFunctionArgs) {
    // if (new URL(request.url).pathname === '/') {
    //     throw redirect(withMode(Paths.license))
    // }

    const deferred = async () => {
        const { id: framerUserId } = await framer.getCurrentUser()
        const { data, error } =
            await pluginApiClient.api.plugins.angledScreen.generationsForUser.get(
                {
                    query: { framerUserId },
                },
            )
        if (error) {
            notifyError(error, 'get angled screen user generations')
            return {} as never
        }
        return data
    }
    return {
        deferred: deferred(),
    }
}

function RotationsImage() {
    const image = useSelectedImage()
    const { deferred } = useRouteLoaderData<typeof loader>('root')!
    const [color, setColor] = useState('#000000')

    const [aperture, setAperture] = useState(0.07)
    const [isLoading, setIsLoading] = useState(true)
    const [aspectRatio, setAspectRatio] = useState(16/9)

    useEffect(() => {
        threeCanvas.shadowColor = color
        threeCanvas.aperture = aperture
    }, [aperture, color])

    const navigate = useNavigate()
    // Setup animation loop

    const revalidator = useRevalidator()

    const handleSaveImage = async () => {
        if (!image) {
            return
        }
        flushSync(() => setIsLoading(true))
        threeCanvas.stopRender()
        await threeCanvas.updateRendererSize({ isPreview: false })
        await sleep(100)
        await threeCanvas.updateCanvas()
        await sleep(20)
        if (!deferred) {
            console.warn('no deferred')
        }
        const { shouldBuyLicense } = (await deferred) || {}
        if (shouldBuyLicense) {
            console.log('redirecting to license')
            return await navigate(withMode(Paths.license))
        }
        const [
            { bytes: nextBytes, mimeType },
            { id: framerUserId, name: userName },
        ] = await Promise.all([
            bytesFromCanvas(threeCanvas.canvas),
            framer.getCurrentUser(),
        ])

        // const img = document.createElement('img')
        // img.src = URL.createObjectURL(new Blob([nextBytes!]))
        // document.body.appendChild(img)
        assert(nextBytes)

        console.log(
            'saving image with type',
            mimeType,
            formatBytes(nextBytes.length || 0),
        )
        const start = performance.now()
        await Promise.all([
            framer.setImage({
                image: {
                    bytes: nextBytes,
                    mimeType,
                },
            }),
            pluginApiClient.api.plugins.angledScreen.incrementGenerations.post({
                framerUserId,
                userName,
            }),
        ])
        revalidator.revalidate()
        await threeCanvas.updateRendererSize({ isPreview: true })
        setIsLoading(false)
        console.log('total duration', performance.now() - start)
        if (framer.mode !== 'canvas') {
            await framer.closePlugin()
            return
        }

        threeCanvas.startRenderLoop()
    }

    useAsyncEffect(async () => {
        if (!image) {
            return
        }
        console.log('loading image into canvas')
        const imgEl = await image.loadImage()
        const bitmap = await createImageBitmap(imgEl, {
            imageOrientation: 'flipY',
        })
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
            <Container width={220}>
                <div className='flex flex-col grow items-center gap-4'>
                    <hr className='w-full shrink-0 h-px mt-1' />
                    <div className='flex flex-col items-center justify-center grow '>
                        <img
                            src={heroImage}
                            className='opacity-90 select-none pointer-events-none invert dark:invert-0 object-contain overflow-hidden w-full rounded-md'
                        />
                    </div>
                    <div className='flex flex-col gap-3 p-3 pt-0 items-center justify-center'>
                        <h1>Select an Image to Start</h1>
                    </div>
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
                Drag to rotate, press shift and drag to pan,
                <br />
                double click to focus
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
                    max: '0.2',
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

const Container = ({ children, width = defaultWith, ...rest }) => {
    const [ref, { height }] = useMeasure()
    useLayoutEffect(() => {
        framer.showUI({
            // title: (handle?.handle as any) || '',
            position: 'top left',
            width,
            height: height || 100,
        })
    }, [height])
    return (
        <div
            ref={ref}
            className='select-none shrink-0 w-full flex flex-col gap-4 pt-0 p-3'
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
            <div className=''>{label}</div>
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

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
