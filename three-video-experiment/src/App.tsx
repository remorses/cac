import { parseMedia } from '@remotion/media-parser'
import classnames from 'classnames'
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
    updateEffectInTree,
} from './effects'
import { useCurrentTime, useEditorState } from './state'

import { Ref, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Pane } from 'tweakpane'
import { createThreeCanvas, globalPaneContainer } from './canvas'
import { Scrubber } from './scrubber'
import { preparePane } from './utils'
import { motion } from 'framer-motion'

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
        <Container className='p-4 grid grid-cols-[300px_1fr_300px] grid-rows-[auto_40px_1fr] h-full pt-4 gap-4 max-h-screen w-full max-w-full'>
            <div className='hideScroll flex-shrink-0 grow bg-[color:var(--tweakpane-bg)] overflow-y-auto max-h-full w-full flex flex-col gap-4 '>
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
            <div className='flex group relative overflow-hidden items-center justify-center row-span-1'>
                <CanvasComponent
                    style={{
                        aspectRatio: (size.width / size.height).toFixed(2),
                    }}
                    className='max-w-full max-h-full rounded-md'
                />
            </div>
            <div className=''>
                <EffectsControls />
            </div>
            <div className='row-span-1 flex flex-col items-center justify-center col-span-3'>
                <VideoControls />
            </div>
            <div className='col-span-3 grow'>
                <Timeline />
            </div>
        </Container>
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
    const draggingEffect = useRef<EffectState>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const isPlaying = useEditorState((state) => state.isPlaying)
    const handleDrag = (e) => {
        // if (!draggingEffect) {
        //     scrub(e)
        //     return
        // }
        if (!draggingEffect.current || !containerRef.current) return

        const {
            effects: selectedEffects,
            parent,
            type,
            initialXOffset,
        } = draggingEffect.current
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
            className='h-full cursor-pointer relative grow flex flex-col gap-3  '
            ref={containerRef}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
        >
            <div
                onClick={(e) => {
                    scrub(e)
                    setSelectedEffectIds([])
                }}
                className='inset-0 absolute'
            ></div>
            <ScrubBar />
            <div className='relative '>
                {allEffects.map(({ node: effect, parent }, index) => {
                    return (
                        <Clip
                            key={effect.id}
                            effect={effect}
                            index={index}
                            duration={duration}
                            parent={parent || undefined}
                            draggingEffect={draggingEffect}
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
        console.log('mouse down')
        isDraggingRef.current = true
        wasPlaying.current = isPlaying
        setIsPlaying(false)
    }

    const handleMouseUp = (e: MouseEvent) => {
        if (!isDraggingRef.current) return
        handleGlobalMouseMove(e)
        isDraggingRef.current = false
        console.log('mouse up')
        setIsPlaying(wasPlaying.current)
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
    draggingEffect,
}: {
    effect: Effect<any>
    parent?: Effect<any>
    index: number
    duration: number
    draggingEffect: { current?: EffectState }
}) {
    const startPercent = (effect.start / duration) * 100
    const widthPercent = ((effect.end - effect.start) / duration) * 100

    const height = 34
    const spacing = 10
    let top = (height + spacing) * index
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedEffectIds = useEditorState((state) => state.selectedEffectIds)
    const setSelectedEffectId = useEditorState(
        (state) => state.setSelectedEffectIds,
    )

    const isSelected = selectedEffectIds.includes(effect.id)

    const handleKeyDown = (e: KeyboardEvent) => {
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
            className={`absolute  rounded-md overflow-hidden bg-blue-500 opacity-70 flex flex-row items-center justify-between text-white text-xs ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
            style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                height,
                top,
            }}
            ref={containerRef}
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
                const rect = containerRef.current!.getBoundingClientRect()
                const initialXOffset = (e.clientX - rect.left) / rect.width

                draggingEffect.current = {
                    effects: selectedEffects,
                    type: 'both',
                    initialXOffset,
                    parent,
                }
            }}
        >
            <div className='ml-3'>{effect.id}</div>

            <div className='w-full absolute inset-0 flex items-center justify-start rounded-t-md left-0 overflow-x-auto'>
                {effect.keyframes.map((keyframe, index) => (
                    <KeyframeComponent
                        containerRef={containerRef}
                        effect={effect}
                        key={keyframe.id}
                        keyframe={keyframe}
                    />
                ))}
            </div>
            {['start', 'end'].map((type) => {
                return (
                    <div
                        key={type}
                        className={`absolute flex flex-col py-1 ${type === 'start' ? 'left-0 pr-1' : 'right-0 pl-1'} cursor-ew-resize top-0 h-full`}
                        onMouseDown={(e) => {
                            e.stopPropagation()

                            draggingEffect.current = {
                                effects: selectedEffects,
                                type: type as 'start' | 'end',
                                initialXOffset: 0,
                                parent,
                            }
                        }}
                    >
                        <div
                            className={`bg-blue-700 w-1 ${type === 'start' ? 'ml-1' : 'mr-1'} rounded h-full `}
                        />
                    </div>
                )
            })}
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
    const duration = useEditorState((state) => state.duration)
    const clipDuration = effect.end - effect.start
    const positionPercentage = keyframe.time / duration
    const updateEffect = useEditorState((state) => state.updateEffect)
    const isDraggingRef = useRef(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        isDraggingRef.current = true
    }
    const setSelectedKeyframeIds = useEditorState(
        (state) => state.setSelectedKeyframeIds,
    )
    const selectedKeyframeIds = useEditorState(
        (state) => state.selectedKeyframeIds,
    )

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return

        isDraggingRef.current = false
        const containerRect = containerRef.current?.getBoundingClientRect()

        if (!containerRect) return

        const newPosition = e.clientX - containerRect.left
        const newTime = (newPosition / containerRect.width) * duration

        // Ensure newTime is within bounds
        const clampedNewTime = Math.max(0, Math.min(newTime, effect.end))
        const updatedKeyframes = effect.keyframes.map((kf) =>
            kf.id === keyframe.id ? { ...kf, time: clampedNewTime } : kf,
        )
        updateEffect(effect.id, {
            keyframes: updatedKeyframes,
        })
        setSelectedKeyframeIds([keyframe.id])
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return

            const containerRect = containerRef.current?.getBoundingClientRect()
            if (!containerRect) return

            const newPosition = e.clientX - containerRect.left
            const newTime = (newPosition / containerRect.width) * duration
            const clampedNewTime = Math.max(0, Math.min(newTime, effect.end))

            const updatedKeyframes = effect.keyframes.map((kf) =>
                kf.id === keyframe.id ? { ...kf, time: clampedNewTime } : kf,
            )
            updateEffect(effect.id, {
                keyframes: updatedKeyframes,
            })
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [effect, keyframe, duration, updateEffect])
    const isSelected = selectedKeyframeIds.includes(keyframe.id)
    return (
        <div
            className={classnames(
                'absolute mx-1',
                isSelected && 'text-blue-500',
            )}
            style={{
                left: `${positionPercentage * 100}%`,
                // height: '100%',
            }}
            onMouseDown={handleMouseDown}
        >
            <KeyframeIcon className='w-4' />
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

function VideoControls() {
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
        <div className='px-2 py-1 text-white rounded-lg m-3 flex gap-3 items-center'>
            <div className='flex gap-1 shrink-0 items-center'>
                <button
                    className='!bg-transparent w-[50px]'
                    type='button'
                    onClick={togglePlay}
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>
            <div className='text-[11px] shrink-0 font-mono'>
                {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
        </div>
    )
}

function EffectsControls() {
    const effects = useEditorState((state) => state.effects)
    const setEffects = useEditorState((state) => state.setEffects)
    const container = useRef<HTMLDivElement>(null)
    const selectedEffectIds = useEditorState((state) => state.selectedEffectIds)
    useEffect(() => {
        const pane = preparePane(
            new Pane({
                title: 'Effects',
                container: container.current || undefined,
            }),
        )

        const allEffects = bfs(effects)
        allEffects
            .filter((x) => selectedEffectIds.includes(x.node.id))
            .forEach((effect) => {
                if (effect.node.configure) {
                    effect.node.configure(pane)
                }
            })

        return () => {
            pane.dispose()
        }
    }, [selectedEffectIds])

    return <div ref={container} className='flex flex-col'></div>
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
