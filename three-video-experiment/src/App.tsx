import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import { ArrayBufferTarget, Muxer as MP4Muxer } from 'mp4-muxer'
import useMeasure from 'react-use-measure'
import { Button } from 'template-rewrite-framer/src/components/Button'

import {
    startTransition,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import { ThreeCanvas } from './canvas'
import { assert, bytesFromCanvas, sleep, useAsyncEffect } from './utils'

const width = 600

function useSelectedMedia() {
    const [media, setMedia] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setMedia(file)
    }

    return { media, handleFileChange }
}

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RotationsImage />,
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

let isStopped = true
const renderLoop = () => {
    if (isStopped) {
        return
    }
    threeCanvas.render()
    requestAnimationFrame(renderLoop)
}

function startRenderLoop() {
    if (!isStopped) {
        return
    }
    isStopped = false
    renderLoop()
}

function stopRenderLoop() {
    isStopped = true
}

let video = null as HTMLVideoElement | null

const handleSaveImage = async ({ media }: { media: File | null }) => {
    if (!media) {
        return
    }

    if (media.type.startsWith('video/')) {
        stopRenderLoop()
        let maxHeight = 1080
        let maxWidth = 1920
        let width = video?.videoWidth || 1280
        let height = video?.videoHeight || 720
        if (height > maxHeight) {
            width = Math.round((maxHeight / height) * width)
            height = Math.round(maxHeight)
        }
        if (width > maxWidth) {
            height = Math.round((maxWidth / width) * height)
            width = Math.round(maxWidth)
        }
        let fps = 30

        const muxer = new MP4Muxer({
            target: new ArrayBufferTarget(),
            fastStart: false,
            firstTimestampBehavior: 'offset',
            video: {
                codec: 'avc',

                width: width,
                height: height,
                frameRate: fps,
            },
        })

        let timestamp = 0
        const frameDuration = 1000000 / fps // in microseconds

        const videoEncoder = new VideoEncoder({
            output: (chunk, meta) => {
                muxer.addVideoChunk(chunk, meta)
                timestamp += frameDuration
            },
            error: (e) => {
                console.error(e)
            },
        })
        await videoEncoder.configure({
            codec: 'avc1.4D0028', // Updated to a higher AVC level
            width,
            height,
            bitrate: 5_000_000, // 5 Mbps for better quality
            framerate: fps,
        })

        // Stop recording and download video
        async function stopRecording() {
            await videoEncoder.flush()

            muxer.finalize()
            videoEncoder.close()

            const arrayBuffer = muxer.target.buffer
            const blob = new Blob([arrayBuffer], { type: 'video/mp4' })

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'recorded-video.mp4'
            a.click()
            URL.revokeObjectURL(url)
        }
        if (!video) {
            console.error('No video element found')
            return
        }
        video.currentTime = 0
        video.loop = false
        video.pause()

        video.currentTime = 0
        video.play()
        await new Promise<void>((resolve) => {
            video!.addEventListener('play', function handlePlay() {
                video!.removeEventListener('play', handlePlay)
                resolve()
            })
        })
        const startTime = performance.now()
        while (!video!.paused && !video!.ended) {
            threeCanvas.render()
            const frame = new VideoFrame(threeCanvas.renderer.domElement, {
                timestamp: performance.now() * 1000,
            })
            videoEncoder.encode(frame)
            frame.close()
            console.log(`Rendered frame: ${performance.now() * 1000}`)
            const elapsedTime = performance.now() - startTime
            // if (elapsedTime > 6000) {
            //     console.warn(
            //         'Rendering took more than 2 seconds, stopping.',
            //     )
            //     stopRecording()
            //     return
            // }
            await new Promise(requestAnimationFrame)
        }
        await stopRecording()
    } else {
    }
}

function RotationsImage() {
    const { media, handleFileChange } = useSelectedMedia()
    const [rotations, setRotations] = useState({ x: 0, y: 10 })
    const [color, setColor] = useState('#000000')
    const [intensity, setIntensity] = useState(1)
    const [focus, setFocus] = useState(0)
    const [z, setZ] = useState(0.6)
    const [isLoading, setIsLoading] = useState(true)
    const [aspectRatio, setAspectRatio] = useState(1)

    useEffect(() => {
        if (!media) {
            return
        }
        console.log('loading media into canvas')
        const loadMedia = async () => {
            if (media.type.startsWith('video/')) {
                video = document.createElement('video')
                video.src = URL.createObjectURL(media)
                video.muted = true
                video.loop = true
                video.play()
                await new Promise((resolve) => {
                    video!.addEventListener('playing', () => {
                        resolve(null)
                    })
                })
                if (!video.videoWidth) {
                    video.width = 1280 // 16:9 aspect ratio
                    video.height = 720
                }
                // document.body.appendChild(video)
                threeCanvas.changeVideo(video)
                const aspectRatio = video.videoWidth / video.videoHeight || 1
                console.log('aspect ratio', aspectRatio)
                setAspectRatio(aspectRatio)
            } else {
                const bitmap = await createImageBitmap(media)
                if (!bitmap) {
                    return
                }
                threeCanvas.changeImage(bitmap)
                const img = threeCanvas.texture.image
                const aspectRatio = img.width / img.height
                setAspectRatio(aspectRatio)
            }
            threeCanvas.update({
                rotations,
                color,
                intensity,
                focus,
                z,
                isPreview: true,
            })
            setIsLoading(false)
        }

        loadMedia()

        if (media.type.startsWith('video/')) {
            startRenderLoop()
        }
    }, [media])

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
            if (!media) {
                return
            }
            await threeCanvas.update({
                rotations,
                color,
                intensity,
                focus,
                z,
                isPreview: true,
            })
            setIsLoading(false)
        },
        [rotations, color, intensity, focus, z],
    )

    if (!media) {
        return (
            <Container>
                <div className='flex flex-col gap-3 p-3 pt-0 min-h-[280px] items-center justify-center'>
                    <p>Select an Image or Video First</p>
                    <input
                        type='file'
                        // accept='image/*,video/*'
                        onChange={handleFileChange}
                    />
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className='flex shrink-0 flex-col overflow-hidden items-center justify-center'>
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
                label='Zoom'
                value={z}
                onChange={(v) => {
                    setZ(Number(v))
                }}
                rangeProps={{
                    min: '0.5',
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
                    min: '-0.3',
                    max: '0.3',
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
                onClick={async () => {
                    setIsLoading(true)
                    await threeCanvas.update({
                        rotations,
                        color,
                        intensity,
                        focus,
                        z,
                        isPreview: false,
                    })
                    await handleSaveImage({ media })
                    setIsLoading(false)
                }}
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
