import { parseMedia } from '@remotion/media-parser'

import { webFileReader } from '@remotion/media-parser/web-file'
import { ArrayBufferTarget, Muxer as MP4Muxer } from 'mp4-muxer'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import useMeasure from 'react-use-measure'
import { Button } from 'template-rewrite-framer/src/components/Button'
import {
    bfs,
    EditorKeyframe,
    Effect,
    filterEffectTree,
    effectsParamsClone,
    updateEffectInTree,
    bezierControlBinding,
} from './effects'
import {
    getKeyframeOnCurrentTime,
    snapToTimeGrid,
    useCurrentTime,
    useEditorState,
} from './state'

import {
    cloneElement,
    Ref,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import { Pane } from 'tweakpane'
import {
    createThreeCanvas,
    getParamsForEffect,
    globalPaneContainer,
} from './canvas'
import { Scrubber } from './scrubber'
import { isTruthy, preparePane } from './utils'
import { motion } from 'framer-motion'
import classNames from 'classnames'
import { PauseIcon, PlayIcon } from './icons'

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

export const threeCanvas = createThreeCanvas()

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

video.autoplay = false

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
        // console.log('setting video current time', currentTime)
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

const exportVideo = async () => {
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

        let outFps = 60
        const muxer = new MP4Muxer({
            target: new ArrayBufferTarget(),
            fastStart: false,
            firstTimestampBehavior: 'offset',
            video: {
                codec: 'avc',

                width: width,
                height: height,
                frameRate: outFps,
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
            framerate: outFps,
        })

        // Stop recording and download video
        async function stopRecording() {
            threeCanvas.afterExport()
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

        let fps = 30

        const videoDecoder = new VideoDecoder({
            output: (frame) => {
                threeCanvas.changeImage(frame)
                useEditorState.setState({
                    currentTime: timestamp / 1000 / 1000,
                })
                threeCanvas.render({ isPreview: false })
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
                const frameDuration = 1000_000 / fps
                timestamp += frameDuration
                console.log(
                    `Rendered frame: ${(timestamp / 1000 / 1000).toFixed(2)}`,
                )

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
        threeCanvas.beforeExport()
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
            fields: {
                durationInSeconds: true,
                dimensions: true,
                fps: true,
            },
        })
        fps = result.fps || 30
        // if (result.durationInSeconds) {
        //     useEditorState.setState({ duration: result.durationInSeconds })
        // }

        await stopRecording()
    } else {
    }
}

function RotationsImage() {
    const { media, handleFileChange } = useSelectedMedia()

    const [isLoading, setIsLoading] = useState(true)
    const size = useEditorState((state) => state.outputSize)

    useEffect(() => {
        if (!media) {
            return
        }
        console.log('loading media into canvas')
        const loadMedia = async () => {
            if (media.type.startsWith('video/')) {
                video.src = URL.createObjectURL(media)
                video.muted = true
                video.loop = false
                video.addEventListener('loadedmetadata', () => {
                    video.play()
                    let duration = video.duration
                    console.log('duration', duration)
                    useEditorState.setState({ duration })
                })

                // Remove the 'playing' event listener after it's triggered once
                const playingHandler = () => {
                    video.removeEventListener('playing', playingHandler)
                    video.pause()
                }
                video.addEventListener('playing', playingHandler)
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
            }
            render()
            setIsLoading(false)
        }
        loadMedia()
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
        <Container className=' bg-black grid grid-cols-[300px_1fr_300px] gap-x-4 grid-rows-[50%_40px_1fr] h-full pt-4 max-h-screen w-full max-w-full'>
            <div className='hideScroll flex-shrink-0 grow overflow-y-auto max-h-full w-full flex flex-col gap-4 '>
                <input
                    type='file'
                    className='!bg-gray-50 !rounded-lg'
                    // accept='image/*,video/*'
                    onChange={handleFileChange}
                />
                <Controls />
                <div className='grow'></div>
                <Button
                    onClick={exportVideo}
                    isLoading={isLoading}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded'
                >
                    Export Video
                </Button>
            </div>
            <div className='flex group relative overflow-hidden items-start justify-center row-span-1'>
                <CanvasComponent
                    style={{
                        aspectRatio: (size.width / size.height).toFixed(2),
                    }}
                    className='max-w-full max-h-full '
                />
            </div>
            <div className=''>
                <EffectsControls />
            </div>
            <div className='row-span-1 bg-gray-900 flex flex-col items-center justify-center col-span-3'>
                <PlayControls />
            </div>

            <Timeline />
        </Container>
    )
}
function Entities() {
    const effects = useEditorState((state) => state.effects)
    const duration = useEditorState((state) => state.duration)
    const setSelectedEffectIds = useEditorState(
        (state) => state.setSelectedEffectIds,
    )

    return (
        <div
            style={{ paddingTop: scrubBarHeight + clipSpacing }}
            className='flex bg-gray-900 flex-col min-w-[120px] pr-6 gap-2'
        >
            {effects.map((effect, index) => {
                const startPercent = (effect.start / duration) * 100
                const widthPercent =
                    ((effect.end - effect.start) / duration) * 100

                return (
                    <div
                        key={effect.id}
                        className='overflow-hidden flex items-center justify-end text-xs cursor-pointer'
                        style={{
                            height: `${clipHeight}px`,
                        }}
                        onClick={() => {
                            setSelectedEffectIds([effect.id])
                        }}
                    >
                        <div className='ml-3'>{effect.name}</div>
                    </div>
                )
            })}
        </div>
    )
}

function Controls() {
    const container = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (container.current) {
            container.current.appendChild(globalPaneContainer)
        }

        return () => {
            if (container.current) {
                container.current.removeChild(globalPaneContainer)
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
    const timelineScale = useEditorState((state) => state.timelineScale)
    const draggingEffect = useRef<EffectState>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const isPlaying = useEditorState((state) => state.isPlaying)

    const visibleDuration = duration / timelineScale

    const handleDrag = (e) => {
        if (!draggingEffect.current || !containerRef.current) return

        const {
            effects: selectedEffects,
            parent,
            type,
            initialXOffset,
        } = draggingEffect.current
        const rect = containerRef.current?.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newTime = (x / rect.width) * visibleDuration

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
        draggingEffect.current = null
    }

    const allEffects = bfs(effects)
    const setSelectedEffectIds = useEditorState(
        (state) => state.setSelectedEffectIds,
    )

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault()
                const { isPlaying } = useEditorState.getState()
                setIsPlaying(!isPlaying)
            }
        }

        const handleScroll = (e: WheelEvent) => {
            if (e.metaKey) {
                e.preventDefault()
                const delta = e.deltaY > 0 ? 0.9 : 1.1
                useEditorState.setState((state) => {
                    return { timelineScale: state.timelineScale * delta }
                })
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        window.addEventListener('wheel', handleScroll, { passive: false })

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
            window.removeEventListener('wheel', handleScroll)
        }
    }, [])

    function scrub(e: { clientX: number }) {
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) {
            return
        }
        const newTime =
            ((e.clientX - containerRect.left) / containerRect.width) *
            visibleDuration
        useEditorState.setState({
            currentTime: Math.max(0, Math.min(newTime, duration)),
        })
    }
    const setSelectedKeyframeIds = useEditorState(
        (state) => state.setSelectedKeyframeIds,
    )
    return (
        <div className='col-span-3 overflow-y-auto row-span-1 cursor-pointer shrink-0 flex flex-row'>
            <Entities />
            <div
                className='grow bg-gray-900 relative h-full overflow-x-visible flex flex-col gap-3'
                ref={containerRef}
                style={{
                    paddingTop: scrubBarHeight + clipSpacing,
                }}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                <div
                    onClick={(e) => {
                        scrub(e)
                        setSelectedEffectIds([])
                        setSelectedKeyframeIds([], [])
                    }}
                    className='inset-0 absolute'
                ></div>
                <div className='relative overflow-x-visible '>
                    {allEffects.map(({ node: effect, parent }, index) => {
                        return (
                            <Clip
                                key={effect.id}
                                effect={effect}
                                index={index}
                                visibleDuration={visibleDuration}
                                parent={parent || undefined}
                            />
                        )
                    })}
                </div>
                <pre className='shrink-0'>
                    {JSON.stringify(effects, null, 2)}
                </pre>
                <ScrubBar parentRef={containerRef} />
                <Scrubber containerRef={containerRef} />
                <div
                    className='absolute top-0 bottom-0 right-0 bg-opacity-30 border-l border-gray-800 bg-black '
                    style={{
                        left: `${(duration / visibleDuration) * 100}%`,
                        pointerEvents: 'none',
                    }}
                />
            </div>
        </div>
    )
}

const scrubBarHeight = 30

function ScrubBar({
    parentRef,
}: {
    parentRef: React.RefObject<HTMLDivElement>
}) {
    const duration = useEditorState((state) => state.duration)
    const isDraggingRef = useRef(false)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const isPlaying = useEditorState((state) => state.isPlaying)
    const setCurrentTime = useEditorState((state) => state.setCurrentTime)
    const wasPlaying = useRef(isPlaying)
    const timelineScale = useEditorState((state) => state.timelineScale)
    const timeGridSize = useEditorState((state) => state.timeGridSize)

    const visibleDuration = duration / timelineScale

    const handleMouseDown = () => {
        isDraggingRef.current = true
        wasPlaying.current = isPlaying
        setIsPlaying(false)
    }

    const handleMouseUp = () => {
        if (!isDraggingRef.current) return
        isDraggingRef.current = false
        setIsPlaying(wasPlaying.current)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDraggingRef.current && parentRef.current) {
            const rect = parentRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const newTime = (x / rect.width) * visibleDuration
            setCurrentTime(Math.max(0, Math.min(newTime, duration)))
        }
    }

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove as any)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove as any)
        }
    }, [visibleDuration])

    const tickCount = Math.max(2, Math.floor(visibleDuration / timeGridSize))
    let step =
        Math.ceil(visibleDuration / tickCount / timeGridSize) * timeGridSize

    const containerRect = parentRef.current?.getBoundingClientRect()
    const w = containerRect?.width || 0
    const h = containerRect?.height || 0
    const left = containerRect?.left || 0
    const top = containerRect?.top || 0

    return (
        <div
            style={{
                top: top,
                left: 0,
                height: scrubBarHeight,
            }}
            className='fixed flex flex-col justify-center w-full h-full bg-gray-900'
        >
            <div
                style={{
                    width: `calc(100% - ${w}px)`,
                }}
                className='flex flex-col items-end px-3 pr-6'
            >
                {/* <VideoControls /> */}
            </div>

            <div
                className='absolute bg-gray-800 rounded-md h-full select-none cursor-pointer isolate'
                style={{
                    left: `${left}px`,
                    top: 0,
                    width: `${w}px`,
                }}
                onMouseDown={handleMouseDown}
                onClick={(e) => {
                    const x = e.clientX - left
                    const newTime = (x / w) * visibleDuration
                    setCurrentTime(Math.max(0, Math.min(newTime, duration)))
                }}
            >
                {Array.from({
                    length: Math.ceil(visibleDuration / step) + 1,
                }).map((_, index) => {
                    const time = index * step
                    const isSecond = time % 1 < 0.01

                    return (
                        <div
                            key={index}
                            className='absolute top-0 bottom-0 gap-1 flex flex-row'
                            style={{
                                left: `${(time / visibleDuration) * 100}%`,
                            }}
                        >
                            {!isSecond && (
                                <div
                                    className={`grow border-r-2 self-center ${
                                        isSecond ? 'opacity-70' : 'opacity-20'
                                    }`}
                                    style={{
                                        height: isSecond ? '100%' : '30%',
                                    }}
                                ></div>
                            )}
                            {isSecond && (
                                <div
                                    className={classNames(
                                        'text-xs h-full content-center text-gray-500 font-mono',
                                        index !== 0 && '-translate-x-1/2',
                                        index == 0 && 'pl-1',
                                    )}
                                >
                                    {time.toFixed(1)}s
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const clipHeight = 34
const clipSpacing = 10

function Clip({
    effect,
    parent,
    index,
    visibleDuration,
}: {
    effect: Effect<any>
    parent?: Effect<any>
    index: number
    visibleDuration: number
}) {
    const startPercent = (effect.start / visibleDuration) * 100
    const widthPercent = ((effect.end - effect.start) / visibleDuration) * 100

    let top = (clipHeight + clipSpacing) * index
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedEffectIds = useEditorState((state) => state.selectedEffectIds)

    return (
        <div
            className={classNames(
                'absolute rounded-md overflow-x-visible flex flex-row items-center justify-between text-white text-xs',
            )}
            style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                height: clipHeight,
                top,
            }}
            ref={containerRef}
        >
            <div className='absolute inset-x-0 w-full top-1/2 border-t-2 bg-gray-200 '></div>
            <div className='w-full absolute inset-0 flex items-center justify-start rounded-t-md left-0 overflow-x-visible'>
                {effect.keyframes.map((keyframe, index) => (
                    <KeyframeComponent
                        containerRef={containerRef}
                        effect={effect}
                        key={keyframe.id}
                        keyframe={keyframe}
                    />
                ))}
                <KeyframeAddButton
                    effect={effect}
                    containerRef={containerRef}
                />
            </div>
        </div>
    )
}

function KeyframeAddButton({
    containerRef,
    effect,
}: {
    containerRef: React.RefObject<HTMLDivElement>
    effect: Effect<any>
}) {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const buttonRef = useRef(null)

    useEffect(() => {
        const state = useEditorState.getState()
        const container = containerRef.current
        if (!container) return

        const handleMouseEnter = () => {
            setIsVisible(true)
        }
        const handleMouseLeave = () => setIsVisible(false)
        const handleMouseMove = (e) => {
            // Check if the current position is near an existing keyframe
            const containerWidth = container.clientWidth
            const rect = container.getBoundingClientRect()

            const time = getTime({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            })

            const nearbyKeyframe = effect.keyframes.find((keyframe) => {
                return Math.abs(keyframe.time - time) < 0.01
            })

            setIsVisible(!nearbyKeyframe)

            setPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            })
        }

        container.addEventListener('mouseenter', handleMouseEnter)
        container.addEventListener('mouseleave', handleMouseLeave)
        container.addEventListener('mousemove', handleMouseMove)

        return () => {
            container.removeEventListener('mouseenter', handleMouseEnter)
            container.removeEventListener('mouseleave', handleMouseLeave)
            container.removeEventListener('mousemove', handleMouseMove)
        }
    }, [containerRef, effect])

    const halfWidth = 24

    function getTime(position: { x: number; y: number }) {
        const time =
            effect.start +
            (position.x / containerRef.current!.clientWidth) *
                (effect.end - effect.start)
        const snappedTime = snapToTimeGrid(time)
        return snappedTime
    }
    const handleClick = () => {
        const time = getTime(position)
        const newKeyframe: EditorKeyframe = {
            id: crypto.randomUUID(),
            time,
            bezierCurve: [0, 0, 1, 1],
            params: effectsParamsClone(effect.params),
        }

        const updatedEffect = {
            ...effect,
            keyframes: [...effect.keyframes, newKeyframe].sort(
                (a, b) => a.time - b.time,
            ),
        }

        const state = useEditorState.getState()
        state.updateEffect(effect.id, updatedEffect)
        state.setCurrentTime(time)
        state.setSelectedKeyframeIds([newKeyframe.id], [effect.id])
    }

    if (!isVisible) return null

    return (
        <div
            ref={buttonRef}
            className='absolute z-10 cursor-pointer'
            style={{
                left: `${position.x}px`,
                width: `${halfWidth}px`,
            }}
            onClick={handleClick}
        >
            <KeyframeAddIcon className='w-full ' />
        </div>
    )
}

function KeyframeComponent({
    keyframe,
    effect,
    containerRef,
}: {
    keyframe: EditorKeyframe
    effect: Effect<any>
    containerRef: React.RefObject<HTMLDivElement>
}) {
    const halfWidth = 12
    const duration = useEditorState((state) => state.duration)
    const clipDuration = effect.end - effect.start
    const relativeKeyframeTime = keyframe.time - effect.start
    const positionPercentage = relativeKeyframeTime / clipDuration
    const updateEffect = useEditorState((state) => state.updateEffect)
    const isDraggingRef = useRef(false)
    const dragStartPosRef = useRef({ x: 0, y: 0 })

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        isDraggingRef.current = true
        dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    }
    const setSelectedKeyframeIds = useEditorState(
        (state) => state.setSelectedKeyframeIds,
    )
    const updateSelectedKeyframes = useEditorState(
        (state) => state.updateSelectedKeyframes,
    )
    const selectedKeyframeIds = useEditorState(
        (state) => state.selectedKeyframeIds,
    )

    const handleMouseUp = (e) => {
        if (!isDraggingRef.current) return
        e.stopPropagation()

        isDraggingRef.current = false
    }

    const handleMouseMove = (e: { clientX: number }) => {
        if (!isDraggingRef.current) return
        // Ignore if dragging distance is small
        const dragDistance = Math.abs(e.clientX - dragStartPosRef.current.x)
        if (dragDistance < 5) return // Adjust this threshold as needed

        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        const newPosition = e.clientX - containerRect.left
        const newRelativeTime =
            (newPosition / containerRect.width) * clipDuration
        const newAbsoluteTime = effect.start + newRelativeTime

        const snappedTime = snapToTimeGrid(newAbsoluteTime)

        const clampedNewTime = Math.max(
            effect.start,
            Math.min(snappedTime, effect.end),
        )

        if (!selectedKeyframeIds.includes(keyframe.id)) {
            setSelectedKeyframeIds([keyframe.id], [effect.id])
        }
        updateSelectedKeyframes({ time: clampedNewTime })
    }
    const isSelected = selectedKeyframeIds.includes(keyframe.id)
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Backspace' && isSelected) {
                e.preventDefault()
                e.stopPropagation()
                const updatedKeyframes = effect.keyframes.filter(
                    (kf) => kf.id !== keyframe.id,
                )
                updateEffect(effect.id, {
                    ...effect,
                    keyframes: updatedKeyframes,
                })
                setSelectedKeyframeIds([], [])
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [
        effect,
        keyframe,
        isSelected,
        duration,
        updateEffect,
        setSelectedKeyframeIds,
    ])

    return (
        <div
            className={classNames('absolute shrink-0')}
            style={{
                left: `calc(${positionPercentage * 100}% - ${halfWidth}px)`,
            }}
            onClick={(e) => {
                // Check if this is a drag event
                const dragThreshold = 5

                const dragDistance = distancePoint(
                    { x: e.clientX, y: e.clientY },
                    dragStartPosRef.current,
                )
                if (dragDistance > dragThreshold) {
                    // This is a drag event, so we ignore it
                    return
                }

                // selecting a keyframe MUST also select the effect
                e.stopPropagation()

                // Check if Shift or Cmd (Meta) key is pressed
                if (e.shiftKey || e.metaKey) {
                    // Add to selection
                    const { selectedKeyframeIds, selectedEffectIds } =
                        useEditorState.getState()
                    setSelectedKeyframeIds(
                        [...new Set([...selectedKeyframeIds, keyframe.id])],
                        [...new Set([...selectedEffectIds, effect.id])],
                    )
                } else {
                    // Replace selection
                    setSelectedKeyframeIds([keyframe.id], [effect.id])
                }
            }}
            onMouseDown={handleMouseDown}
        >
            <KeyframeIcon
                className={classNames(
                    'shrink-0 ',
                    isSelected ? 'text-yellow-200 scale-125' : 'text-gray-300',
                )}
                style={{ minWidth: `${halfWidth * 2}px` }}
            />
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

function PlayControls() {
    const isPlaying = useEditorState((state) => state.isPlaying)
    const currentTime = useCurrentTime()
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const duration = useEditorState((state) => state.duration)
    const setCurrentTime = useEditorState((state) => state.setCurrentTime)

    const togglePlay = () => {
        // if (renderLoopId) cancelAnimationFrame(renderLoopId)
        const { isPlaying } = useEditorState.getState()
        console.log('toggle play', isPlaying)
        setIsPlaying(!isPlaying)
    }

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value)
        setCurrentTime(time)
        render()
    }

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    return (
        <div className='px-2 py-1  text-white rounded-lg m-3 flex gap-3 items-center'>
            <div className='flex gap-1 shrink-0 items-center'>
                <button
                    className='!bg-transparent w-[20px]'
                    type='button'
                    onClick={togglePlay}
                >
                    {isPlaying ? (
                        <PauseIcon className='w-full' />
                    ) : (
                        <PlayIcon className='w-full' />
                    )}
                </button>
            </div>
            <div className='text-[11px] shrink-0 font-mono'>
                {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
        </div>
    )
}

function EffectsControls() {
    const effectsAll = useEditorState((state) => state.effects)
    const setEffects = useEditorState((state) => state.setEffects)
    const container = useRef<HTMLDivElement>(null)
    const selectedEffectIds = useEditorState((state) => state.selectedEffectIds)

    const selectedKeyframeIds = useEditorState(
        (state) => state.selectedKeyframeIds,
    )

    const selectedEffects = bfs(effectsAll).filter((x) =>
        selectedEffectIds.includes(x.node.id),
    )
    const setSelectedKeyframeIds = useEditorState(
        (state) => state.setSelectedKeyframeIds,
    )
    const selectedEffectsWithKeyframes = selectedEffects
        .map((effect) => {
            const keyframe = effect.node.keyframes.find((kf) =>
                selectedKeyframeIds.includes(kf.id),
            )
            return { effect: effect.node, keyframe }
        })
        .filter((item) => item.keyframe !== undefined)

    const currentKeyframes = selectedEffectsWithKeyframes

    useEffect(() => {
        const pane = preparePane(
            new Pane({
                title: '',
                container: container.current || undefined,
            }),
        )

        selectedEffects.forEach((effect) => {
            const keyframe = getKeyframeOnCurrentTime().find(
                (kf) => kf.effect.id === effect.node.id,
            )?.keyframe
            const params = (() => {
                const hasKeyframes = effect.node.keyframes.length > 0
                if (!hasKeyframes) {
                    return effect.node.params
                }

                if (!keyframe) {
                    return
                }
                return keyframe.params
            })()
            if (!params) {
                return
            }

            const folder = effect.node?.configure?.(pane, params)

            if (keyframe && folder) {
                bezierControlBinding({
                    folder,
                    bezierCurve: keyframe?.bezierCurve,
                })
            }
        })

        // Add event listener to threeCanvas.controls
        const refreshPane = () => {
            pane.refresh()
        }
        threeCanvas.controls.addEventListener('change', refreshPane)
        threeCanvas.transformControls.addEventListener(
            'objectChange',
            refreshPane,
        )

        pane.on('change', (e) => {
            const state = useEditorState.getState()
            if (state.isPlaying) {
                return
            }
            threeCanvas.applyAllEffects({ isUserChange: true })
            threeCanvas.render()
        })

        return () => {
            pane.dispose()
            threeCanvas.controls.removeEventListener('change', refreshPane)
        }
    }, [selectedEffectIds, currentKeyframes])

    const showKeyframeMode = currentKeyframes.length > 0
    const selectedEffect = selectedEffects[0]?.node

    const showKeyframeButton =
        currentKeyframes.length === 0 && !!selectedEffects.length
    return (
        <div className='flex flex-col max-h-full overflow-y-auto'>
            <div className='' ref={container}></div>

            {showKeyframeButton && (
                <button
                    className='flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    onClick={() => {
                        const currentTime = snapToTimeGrid(
                            useEditorState.getState().currentTime,
                        )
                        const newKeyframe: EditorKeyframe = {
                            id: generateId(),
                            time: currentTime,
                            bezierCurve: [0, 0, 1, 1],
                            params: effectsParamsClone(selectedEffect.params),
                        }
                        const updatedEffect = {
                            ...selectedEffect,
                            keyframes: [
                                ...selectedEffect.keyframes,
                                newKeyframe,
                            ],
                        }
                        const updatedEffects = updateEffectInTree(
                            effectsAll,
                            updatedEffect,
                        )
                        setSelectedKeyframeIds(
                            [newKeyframe.id],
                            [selectedEffect.id],
                        )
                        setEffects(updatedEffects)
                    }}
                >
                    <KeyframeAddIcon className='w-5 h-5 mr-2' />
                    Add Keyframe
                </button>
            )}
            {showKeyframeMode && (
                <div className='mt-4 p-2 bg-yellow-100 text-yellow-800 rounded-md'>
                    <span className='font-semibold'>Keyframe Mode</span>
                    <p className='text-xs text-current opacity-70 mt-1'>
                        You are currently editing keyframe properties. Any
                        changes made will affect the selected keyframe(s).
                    </p>
                </div>
            )}
        </div>
    )
}

function generateId() {
    return Math.random().toString(36).substr(2, 9)
}

export function KeyframeAddIcon(props) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...props}>
            <g fill='currentColor' strokeWidth='1.5'>
                <path
                    fillRule='evenodd'
                    d='M19 1.25a.75.75 0 0 1 .75.75v2.25H22a.75.75 0 0 1 0 1.5h-2.25V8a.75.75 0 0 1-1.5 0V5.75H16a.75.75 0 0 1 0-1.5h2.25V2a.75.75 0 0 1 .75-.75'
                    clipRule='evenodd'
                ></path>
                <path d='M7.945 5.184a2.75 2.75 0 0 1 4.11 0l5.325 5.99a2.75 2.75 0 0 1 0 3.653l-5.324 5.99a2.75 2.75 0 0 1-4.111 0l-5.324-5.99a2.75 2.75 0 0 1 0-3.654z'></path>
            </g>
        </svg>
    )
}
export function KeyframeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                d='M12 4a2.6 2.6 0 0 0-2 .957l-4.355 5.24a2.85 2.85 0 0 0-.007 3.598l4.368 5.256c.499.6 1.225.949 1.994.949a2.6 2.6 0 0 0 2-.957l4.355-5.24a2.85 2.85 0 0 0 .007-3.598l-4.368-5.256A2.6 2.6 0 0 0 12 4'
            ></path>
        </svg>
    )
}

const distancePoint = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}
