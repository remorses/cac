import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import * as THREE from 'three'
import { useEditorState } from './state'
import { bfs, Effect, filterEffectTree, updateEffectInTree } from './effects'
import { parseMedia } from '@remotion/media-parser'
import { webFileReader } from '@remotion/media-parser/web-file'
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

import { paneContainer, createThreeCanvas } from './canvas'
import {
    assert,
    bytesFromCanvas,
    sleep,
    useAsyncEffect,
    usePrevious,
} from './utils'
import { Scrubber } from './scrubber'
import { Pane } from 'tweakpane'

function useSelectedMedia() {
    const media = useEditorState((state) => state.media)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null

        useEditorState.setState({ media: file })
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

const threeCanvas = createThreeCanvas()

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

function startRenderLoop() {
    const { isPlaying, setIsPlaying } = useEditorState.getState()
    if (isPlaying) {
        return
    }
    setIsPlaying(true)
}

function stopRenderLoop() {
    const { setIsPlaying } = useEditorState.getState()
    setIsPlaying(false)
}

function render() {
    // effectApplier.render() // Convert deltaTime to seconds
    threeCanvas.render()
}

let prevTime = 0
let renderLoopId: number | undefined
function renderLoop() {
    const state = useEditorState.getState()
    const time = performance.now() / 1000
    const deltaTime = time - prevTime
    prevTime = time

    render()
    if (state.isPlaying) {
        state.setCurrentTime(state.currentTime + deltaTime)
    }
    renderLoopId = requestAnimationFrame(renderLoop)
}

renderLoop()

let video = document.createElement('video')
video.onloadedmetadata = () => {
    let duration = video.duration
    useEditorState.setState({ duration })
}

const unsubscribeIsPlaying = useEditorState.subscribe((state, prevState) => {
    const { isPlaying, currentTime } = state
    if (isPlaying && video.paused) {
        video.play().catch(console.error)
        video.currentTime = currentTime
    } else if (!isPlaying && !video.paused) {
        video.pause()
    }
    if (
        video &&
        video.duration &&
        currentTime >= 0 &&
        currentTime <= video.duration &&
        Math.abs(video.currentTime - currentTime) > 0.1
    ) {
        console.log('setting video current time', currentTime)
        video.currentTime = currentTime
    }
})

const cleanup = () => {
    console.log('cleanup for vite hmr')
    unsubscribeIsPlaying()
    threeCanvas.cleanup()
    if (renderLoopId !== undefined) {
        cancelAnimationFrame(renderLoopId)
    }
}

// Vite HMR cleanup
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        cleanup()
    })
}

const handleSaveImage = async () => {
    const { media } = useEditorState.getState()
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

        const videoEncoder = new VideoEncoder({
            output: (chunk, meta) => {
                muxer.addVideoChunk(chunk, meta)
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
        let timestamp = 0
        const frameDuration = 1000000 / fps // in microseconds
        const videoDecoder = new VideoDecoder({
            output: (frame) => {
                threeCanvas.changeImage(frame)
                threeCanvas.render()
                // console.log('frame', frame.timestamp)
                const outputFrame = new VideoFrame(
                    threeCanvas.renderer.domElement,
                    {
                        timestamp,
                    },
                )
                videoEncoder.encode(outputFrame)
                outputFrame.close()
                frame.close()
                timestamp += frameDuration
                console.log(`Rendered frame: ${performance.now() * 1000}`)

                // if (elapsedTime > 6000) {
                //     console.warn(
                //         'Rendering took more than 2 seconds, stopping.',
                //     )
                //     stopRecording()
                //     return
                // }
            },
            error: console.error,
        })

        const result = await parseMedia({
            src: media,
            reader: webFileReader,
            onVideoTrack: async (track) => {
                console.log('onVideoTrack', track)
                await videoDecoder.configure(track)

                return async (sample) => {
                    if (videoDecoder.decodeQueueSize > 10) {
                        let resolve = () => {}

                        const cb = () => {
                            resolve()
                        }

                        await new Promise<void>((r) => {
                            resolve = r
                            videoDecoder.addEventListener('dequeue', cb)
                        })
                        videoDecoder.removeEventListener('dequeue', cb)
                    }

                    videoDecoder.decode(new EncodedVideoChunk(sample))
                }
            },
            // fields: {
            //     durationInSeconds: true,
            //     dimensions: true,
            // },
        })

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
                const bitmap = await createImageBitmap(media, {
                    imageOrientation: 'flipY',
                })
                if (!bitmap) {
                    return
                }
                threeCanvas.changeImage(bitmap)
                const img = threeCanvas.texture.image
                const aspectRatio = img.width / img.height
                setAspectRatio(aspectRatio)
            }
            threeCanvas.render()
            setIsLoading(false)
        }

        loadMedia()

        if (media.type.startsWith('video/')) {
            startRenderLoop()
        }
    }, [media])

    if (!media) {
        return (
            <Container className='flex flex-col items-center justify-center'>
                <div className='flex flex-col gap-3 p-3 pt-0 min-h-[280px] items-center justify-center'>
                    <p>Select an Image or Video First</p>
                    <input
                        type='file'
                        className='!bg-gray-50 !rounded-lg'
                        // accept='image/*,video/*'
                        onChange={handleFileChange}
                    />
                </div>
            </Container>
        )
    }

    return (
        <Container className='p-4 grid grid-cols-[300px_1fr] grid-rows-2 h-full pt-4 gap-4 max-h-screen w-full max-w-full'>
            <div className='hideScroll flex-shrink-0 grow bg-[color:var(--tweakpane-bg)] overflow-y-auto max-h-full w-full flex flex-col gap-4'>
                <input
                    type='file'
                    className='!bg-gray-50 !rounded-lg'
                    // accept='image/*,video/*'
                    onChange={handleFileChange}
                />
                <Controls />
                <Button
                    onClick={handleSaveImage}
                    isLoading={isLoading}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                >
                    Export
                </Button>
            </div>
            <div className='flex group relative overflow-hidden items-center justify-end'>
                <CanvasComponent
                    style={{ aspectRatio: aspectRatio.toFixed(2) }}
                    className='max-w-full max-h-full rounded-md'
                />
            </div>
            <div className='col-span-2 grow'>
                <Timeline />
            </div>
        </Container>
    )
}

function Controls() {
    const container = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (container.current) {
            container.current.appendChild(paneContainer)
        }

        return () => {
            if (container.current) {
                container.current.removeChild(paneContainer)
            }
        }
    }, [])
    return <div ref={container}></div>
}

type EffectState = {
    effects: Effect[]
    parent?: Effect
    type: 'start' | 'end' | 'both'
    initialXOffset: number
} | null

function Timeline() {
    const effects = useEditorState((state) => state.effects)
    const duration = useEditorState((state) => state.duration)
    const [draggingEffect, setDraggingEffect] = useState<EffectState>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const isPlaying = useEditorState((state) => state.isPlaying)
    const handleDrag = (e) => {
        // if (!draggingEffect) {
        //     scrub(e)
        //     return
        // }
        if (!draggingEffect || !containerRef.current) return

        const {
            effects: selectedEffects,
            parent,
            type,
            initialXOffset,
        } = draggingEffect
        const rect = containerRef.current?.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newTime = (x / rect.width) * duration

        const minDuration = 0.2
        let effectsNew = effects as Effect[]
        for (const effect of selectedEffects) {
            const updatedEffect = { ...effect }
            if (type === 'start') {
                updatedEffect.start = Math.max(
                    0,
                    Math.min(newTime, effect.end - minDuration),
                )
            }
            if (type === 'end') {
                updatedEffect.end = Math.min(
                    duration,
                    Math.max(newTime, effect.start + minDuration),
                )
            }
            if (type === 'both') {
                // console.log('both', initialXOffset)
                let clipDur = effect.end - effect.start
                const newStart = newTime - clipDur * initialXOffset
                updatedEffect.start = Math.max(
                    0,
                    Math.min(newStart, duration - (effect.end - effect.start)),
                    parent?.start || 0,
                )
                updatedEffect.end = Math.min(
                    duration,
                    updatedEffect.start + (effect.end - effect.start),
                    parent?.end || Infinity,
                )
            }
            // Ensure the updated effect stays within its parent's bounds
            if (parent) {
                updatedEffect.start = Math.max(
                    parent.start,
                    updatedEffect.start,
                )
                updatedEffect.end = Math.min(parent.end, updatedEffect.end)
            }

            effectsNew = updateEffectInTree(effectsNew, updatedEffect)
        }
        if (effectsNew.length) {
            useEditorState.setState({ effects: effectsNew })
        }
    }

    const handleDragEnd = () => {
        setDraggingEffect(null)
    }

    const allEffects = bfs(effects)
    const setSelectedEffectIds = useEditorState(
        (state) => state.setSelectedEffectIds,
    )

    const scale = useEditorState((x) => x.scale)
    const scrubTo = useEditorState((x) => x.setCurrentTime)

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault()
                const { isPlaying } = useEditorState.getState()
                setIsPlaying(!isPlaying)
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    function scrub(e: { clientX: number }) {
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) {
            return
        }
        const newTime =
            ((e.clientX - containerRect.left) / containerRect.width) * duration
        useEditorState.setState({
            currentTime: Math.max(0, Math.min(newTime, duration)),
        })
    }
    return (
        <div
            className='h-full  cursor-pointer relative grow flex flex-col gap-3  '
            ref={containerRef}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onClick={(e) => {
                scrub(e)
                setSelectedEffectIds([])
            }}
        >
            <ScrubBar />
            <div className='relative mx-2'>
                {allEffects.map(({ node: effect, parent }, index) => {
                    return (
                        <Clip
                            key={effect.id}
                            effect={effect}
                            index={index}
                            duration={duration}
                            parent={parent || undefined}
                            setDraggingEffect={setDraggingEffect}
                        />
                    )
                })}
            </div>
            <Scrubber
                containerRef={containerRef}
                timelineHeight={containerRef.current?.clientHeight || 200}
            />
        </div>
    )
}
function ScrubBar() {
    const duration = useEditorState((state) => state.duration)
    const isDraggingRef = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const isPlaying = useEditorState((state) => state.isPlaying)
    const wasPlaying = useRef(isPlaying)

    const handleMouseDown = () => {
        // console.log('mouse down')
        isDraggingRef.current = true
        wasPlaying.current = isPlaying
        setIsPlaying(false)
    }

    const handleMouseUp = (e: MouseEvent) => {
        isDraggingRef.current = false
        // console.log('mouse up')
        setIsPlaying(wasPlaying.current)
        // handleGlobalMouseMove(e)
    }
    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDraggingRef.current && containerRef.current) {
            // console.log('mouse move')
            const rect = containerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const newTime = (x / rect.width) * duration
            useEditorState.setState({
                currentTime: Math.max(0, Math.min(newTime, duration)),
            })
        }
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleGlobalMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [duration])

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className='w-full select-none cursor-pointer isolate h-[16px] bg-gray-800 relative'
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
                e.stopPropagation()
                handleGlobalMouseMove(e as any)
            }}
            onMouseUp={(e) => {
                e.stopPropagation()
                handleMouseUp(e as any)
            }}
            // onClick={(e) => {
            //     e.stopPropagation()
            //     handleGlobalMouseMove(e as any)
            // }}
        >
            {Array.from({ length: Math.ceil(duration * 10) + 1 }).map(
                (_, index) => {
                    const isSecond = index % 10 === 0
                    return (
                        <div
                            key={index}
                            className='absolute top-0 bottom-0 gap-1 flex flex-row'
                            style={{
                                left: `${(index / (duration * 10)) * 100}%`,
                            }}
                        >
                            <div
                                className={`w-[1px] h-full grow self-stretch ${
                                    isSecond
                                        ? 'bg-gray-700'
                                        : 'bg-gray-400 opacity-50'
                                }`}
                                style={{
                                    height: isSecond ? '100%' : '50%',
                                }}
                            ></div>
                            {isSecond && (
                                <span className='text-xs text-gray-500 font-mono'>
                                    {index / 10}s
                                </span>
                            )}
                        </div>
                    )
                },
            )}
        </div>
    )
}

function Clip({
    effect,
    parent,
    index,
    duration,
    setDraggingEffect,
}: {
    effect: Effect<any>
    parent?: Effect<any>
    index: number
    duration: number
    setDraggingEffect: (effect: EffectState) => void
}) {
    const startPercent = (effect.start / duration) * 100
    const widthPercent = ((effect.end - effect.start) / duration) * 100

    const height = 34
    const spacing = 10
    let top = (height + spacing) * index
    const dragRef = useRef<HTMLDivElement>(null)

    const selectedEffectIds = useEditorState((state) => state.selectedEffectIds)
    const setSelectedEffectId = useEditorState(
        (state) => state.setSelectedEffectIds,
    )

    const isSelected = selectedEffectIds.includes(effect.id)

    const handleKeyDown = (e: KeyboardEvent) => {
        console.log(e.key)
        const { effects, selectedEffectIds } = useEditorState.getState()
        if (e.key === 'Backspace' && isSelected) {
            e.preventDefault()
            const newEffects = filterEffectTree(
                effects,
                (ef) => ef.id !== effect.id,
            )
            useEditorState.setState({
                effects: newEffects,
                selectedEffectIds: [],
            })
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isSelected])

    const effects = useEditorState((state) => state.effects)
    const selectedEffects =
        selectedEffectIds.length > 1
            ? effects.filter((e) => selectedEffectIds.includes(e.id))
            : [effect]

    return (
        <div
            className={`absolute rounded-md overflow-hidden bg-blue-500 opacity-70 flex items-center justify-between px-2 text-white text-xs ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
            style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                height,
                top,
            }}
            ref={dragRef}
            onClick={(e) => {
                e.stopPropagation()
                const prevSelected = useEditorState.getState().selectedEffectIds
                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                    // Add to selection if Ctrl/Cmd/Shift is pressed
                    setSelectedEffectId(
                        prevSelected.includes(effect.id)
                            ? prevSelected.filter((id) => id !== effect.id) // Remove if already selected
                            : [...prevSelected, effect.id], // Add if not selected
                    )
                } else {
                    // Replace selection if no modifier key is pressed
                    setSelectedEffectId([effect.id])
                }
            }}
            onMouseDown={(e) => {
                const rect = dragRef.current!.getBoundingClientRect()
                const initialXOffset = (e.clientX - rect.left) / rect.width

                setDraggingEffect({
                    effects: selectedEffects,
                    type: 'both',
                    initialXOffset,
                    parent,
                })
            }}
        >
            <div className='ml-3'>{effect.id}</div>

            {['start', 'end'].map((type) => {
                return (
                    <div
                        key={type}
                        className={`absolute flex flex-col py-1  ${type === 'start' ? 'left-0 pr-1' : 'right-0 pl-1'} cursor-ew-resize top-0 h-full`}
                        onMouseDown={(e) => {
                            e.stopPropagation()

                            setDraggingEffect({
                                effects: selectedEffects,
                                type: type as 'start' | 'end',
                                initialXOffset: 0,
                                parent,
                            })
                        }}
                    >
                        <div
                            className={`bg-blue-700 w-2 ${type === 'start' ? 'ml-1' : 'mr-1'} rounded h-full `}
                        />
                    </div>
                )
            })}
        </div>
    )
}

const Container = ({ children, ...rest }) => {
    const [ref, { height }] = useMeasure()
    return (
        <div
            {...rest}
            ref={ref}
            style={{ ...rest.style }}
            className={`shrink-0 w-full flex flex-col ${rest.className || ''}`}
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

// const useVideoControls = (videoElement: HTMLVideoElement | null) => {
//     const { isPlaying, currentTime, setIsPlaying, duration, setCurrentTime } =
//         useEditorState()

//     const togglePlay = () => {
//         render()
//         setIsPlaying(!isPlaying)
//     }

//     const handleSeek = (e) => {
//         const time = parseFloat(e.target.value)
//         setCurrentTime(time)
//         render()
//     }

//     const formatTime = (time) => {
//         const minutes = Math.floor(time / 60)
//         const seconds = Math.floor(time % 60)
//         return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
//     }
//     const slider = useRef<HTMLInputElement>(null)

//     const controlsElement = (
//         <div className='px-2 py-1 group-hover:opacity-100 lg:opacity-0 transition-all text-white bg-gray-100 bg-opacity-10 rounded-lg m-3 flex gap-3 items-center backdrop-blur'>
//             <div className='flex  gap-1 shrink-0 items-center'>
//                 <button
//                     className='!bg-transparent w-[50px]'
//                     onClick={togglePlay}
//                 >
//                     {isPlaying ? 'Pause' : 'Play'}
//                 </button>
//             </div>
//             <input
//                 type='range'
//                 min='0'
//                 step={0.001}
//                 max={duration || 0}
//                 ref={slider}
//                 style={{
//                     // @ts-ignore
//                     '--progress': `${(currentTime / (videoElement?.duration || 1)) * 100}%`,
//                 }}
//                 value={currentTime}
//                 onChange={handleSeek}
//                 className='grow slider'
//             />
//             <div className='text-[11px] shrink-0 font-mono'>
//                 {formatTime(currentTime)} / {formatTime(duration || 0)}
//             </div>
//         </div>
//     )

//     return { controlsElement, togglePlay, handleSeek }
// }
