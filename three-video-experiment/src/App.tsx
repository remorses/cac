import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Button } from 'template-rewrite-framer/src/components/Button'
import {
    bezierControlBinding,
    bfs,
    EditorKeyframe,
    Effect,
    effectControllers,
    effectsParamsClone,
    updateEffectInTree,
} from './effects'
import {
    getKeyframeOnCurrentTime,
    snapToTimeGrid,
    useEditorState,
    useThrottledCurrentTime,
    useUndoRedo,
} from './state'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import classNames from 'classnames'
import { Pane } from 'tweakpane'
import { threeCanvas } from './canvas'
import { exportVideo } from './export'
import { getMediaHandleId, pickMediaHandle } from './files'
import { PauseIcon, PlayIcon } from './icons'
import { Scrubber } from './scrubber'
import { preparePane, useForceRender, useLatestValue } from './utils'
import useMeasure, { RectReadOnly } from 'react-use-measure'

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <EditorLayout />,
        },
    ],
    // { basename: basePath },
)

export function App() {
    useUndoRedo()
    return <RouterProvider router={router} />
}

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

function EditorLayout() {
    const mediaHandleId = useEditorState((state) => state.mediaHandleId)

    const isExporting = useEditorState((state) => state.isExporting)
    const size = useEditorState((state) => state.outputSize)

    if (!mediaHandleId) {
        return (
            <Container className='flex flex-col items-center justify-center'>
                <div className='flex flex-col gap-3 p-3 pt-0 min-h-[280px] items-center justify-center'>
                    <p>Select an Image or Video First</p>
                    {/* <input
                        type='file'
                        className='!bg-gray-50 !rounded-lg'
                        // accept='image/*,video/*'
                        onChange={handleFileChange}
                    /> */}
                    <Button
                        onClick={async () => {
                            const state = useEditorState.getState()
                            const mediaHandle = await pickMediaHandle()
                            if (!mediaHandle) {
                                console.log(`could not get media handle`)
                                useEditorState.setState({
                                    mediaHandleId: undefined,
                                })
                                return
                            }
                            useEditorState.setState({
                                mediaHandleId:
                                    await getMediaHandleId(mediaHandle),
                            })
                        }}
                    >
                        Open File
                    </Button>
                </div>
            </Container>
        )
    }

    return (
        <Container
            style={{
                '--padding': '16px',
            }}
            className=' bg-black grid grid-cols-[1fr_auto] gap-x-4 grid-rows-[40px_50%_50px_1fr] h-full pt-4 max-h-screen w-full max-w-full'
        >
            <div className='flex px-[--padding] flex-row col-span-3 gap-4 '>
                <Button
                    className='w-auto px-4 bg-gray-800'
                    onClick={async () => {
                        const state = useEditorState.getState()
                        const mediaHandle = await pickMediaHandle()
                        if (!mediaHandle) {
                            console.log(`could not get media handle`)
                            useEditorState.setState({
                                mediaHandleId: undefined,
                            })
                            return
                        }
                        useEditorState.setState({
                            mediaHandleId: await getMediaHandleId(mediaHandle),
                        })
                    }}
                >
                    Open File
                </Button>
                <div className='grow'></div>
                <Button
                    onClick={exportVideo}
                    isLoading={isExporting}
                    className='bg-blue-500 w-auto hover:bg-blue-700 text-white font-bold px-4 rounded'
                >
                    Export Video
                </Button>
            </div>
            {/* <div className='pl-[--padding] pb-[--padding] flex-shrink-0 grow overflow-y-auto max-h-full w-full flex flex-col gap-4 '>
                <Controls />
                <div className='grow'></div>
            </div> */}
            <div className='flex group relative overflow-hidden items-start pl-[--padding] pb-[--padding] justify-start row-span-1'>
                <CanvasComponent
                    style={{
                        aspectRatio: (size.width / size.height).toFixed(2),
                    }}
                    className='max-w-full max-h-full rounded-md overflow-hidden'
                />
            </div>
            <div className='w-[400px] flex flex-col pb-[--padding]'>
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
    const selectedEffectIds = useEditorState((state) => state.selectedEffectIds)

    return (
        <div
            style={{
                gap: clipSpacing,
            }}
            className='flex bg-gray-950 flex-col min-w-[160px] pr-6'
        >
            <div
                style={{
                    height: scrubBarHeight,
                }}
            ></div>
            {effects.map((effect, index) => {
                const isSelected = selectedEffectIds.includes(effect.id)
                return (
                    <div
                        key={effect.id}
                        className={classNames(
                            'overflow-hidden flex items-center justify-end text-xs cursor-pointer',
                            isSelected && 'text-yellow-200 font-bold',
                        )}
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

    const allEffects = bfs(effects)
    const setSelectedEffectIds = useEditorState(
        (state) => state.setSelectedEffectIds,
    )

    const [parentRef, containerRect] = useMeasure()

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
                ref={(elem) => {
                    parentRef(elem)
                    containerRef.current = elem
                }}
                style={{
                    paddingTop: scrubBarHeight + clipSpacing,
                }}
            >
                <div
                    onClick={(e) => {
                        scrub(e)
                        setSelectedEffectIds([])
                        setSelectedKeyframeIds([], [])
                    }}
                    className='inset-0 absolute'
                ></div>
                <DurationScrubber containerRef={containerRef} />
                <div className='relative overflow-x-visible '>
                    {allEffects.map(({ node: effect, parent }, index) => {
                        return (
                            <Clip
                                key={effect.id}
                                effect={effect}
                                index={index}
                                parent={parent || undefined}
                            />
                        )
                    })}
                </div>
                {/* <pre className='shrink-0'>
                    {JSON.stringify(effects, null, 2)}
                </pre> */}
                <ScrubBar containerRect={containerRect} />

                <Scrubber containerRef={containerRef} />
            </div>
        </div>
    )
}
function DurationScrubber({
    containerRef,
}: {
    containerRef: React.RefObject<HTMLDivElement>
}) {
    const duration = useEditorState((state) => state.duration)
    const start = useEditorState((state) => state.start)
    const timelineScale = useEditorState((state) => state.timelineScale)
    const visibleDuration = duration / timelineScale

    const [isDragging, setIsDragging] = useState<{
        dragging: boolean
        isStart: boolean
    }>({ dragging: false, isStart: false })
    const [tempDuration, setTempDuration] = useState(duration)
    const [tempStart, setTempStart] = useState(start)
    const lastTempDuration = useLatestValue(tempDuration)
    const lastTempStart = useLatestValue(tempStart)

    const handleMouseDown = (e: React.MouseEvent, isStart: boolean) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging({ dragging: true, isStart })
    }

    const handleMouseUp = () => {
        setIsDragging({ dragging: false, isStart: false })
        useEditorState.setState({
            duration: lastTempDuration.current,
            start: lastTempStart.current,
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.dragging && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const newTime = (x / rect.width) * visibleDuration
            if (isDragging.isStart) {
                setTempStart(
                    snapToTimeGrid(
                        Math.max(0, Math.min(newTime, tempDuration)),
                    ),
                )
            } else {
                setTempDuration(snapToTimeGrid(Math.max(tempStart, newTime)))
            }
        }
    }

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove as any)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove as any)
        }
    }, [isDragging, visibleDuration])

    const top = scrubBarHeight
    return (
        <>
            <div
                className='absolute top-0 pointer-events-none bottom-0 left-0 bg-gray-950'
                style={{
                    width: `${(tempStart / visibleDuration) * 100}%`,
                    top,
                }}
            />
            <div
                className='absolute w-1 top-0 bottom-0 left-0 bg-opacity-30 border-l border-gray-800 cursor-ew-resize'
                style={{
                    left: `${(tempStart / visibleDuration) * 100}%`,
                    top,
                }}
                onMouseDown={(e) => handleMouseDown(e, true)}
            />
            <div
                className='absolute top-0 bottom-0 right-0  border-l border-gray-800 bg-gray-950 cursor-ew-resize'
                style={{
                    left: `${(tempDuration / visibleDuration) * 100}%`,
                    top,
                }}
                onMouseDown={(e) => handleMouseDown(e, false)}
            />
        </>
    )
}

const scrubBarHeight = 30

function ScrubBar({ containerRect }: { containerRect: RectReadOnly }) {
    const duration = useEditorState((state) => state.duration)
    const isDraggingRef = useRef(false)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const isPlaying = useEditorState((state) => state.isPlaying)
    const setCurrentTime = useEditorState((state) => state.setCurrentTime)
    const wasPlaying = useRef(isPlaying)
    const timelineScale = useEditorState((state) => state.timelineScale)
    const timeGridSize = useEditorState((state) => state.timeGridTick)

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
        if (isDraggingRef.current && containerRect) {
            const x = e.clientX - containerRect.left
            const newTime = (x / containerRect.width) * visibleDuration
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

    const tickCount = Math.min(
        50,
        Math.max(2, Math.floor(visibleDuration / timeGridSize)),
    )
    let step =
        Math.ceil(visibleDuration / tickCount / timeGridSize) * timeGridSize

    // const containerRect = parentRef.current?.getBoundingClientRect()
    const w = containerRect?.width || 0
    const left = containerRect?.left || 0
    const top = containerRect?.top || 0

    return (
        <div
            style={{
                top: top,
                left: 0,
                height: scrubBarHeight,
            }}
            className='fixed flex flex-col justify-center w-full h-full bg-gray-800'
        >
            <div
                style={{
                    width: `calc(100% - ${w}px)`,
                }}
                className='flex flex-col  items-end px-3 pr-6'
            ></div>

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
}: {
    effect: Effect
    parent?: Effect
    index: number
}) {
    let start = 0
    const duration = useEditorState((state) => state.duration)
    const timelineScale = useEditorState((state) => state.timelineScale)
    let end = duration
    const visibleDuration = duration / timelineScale
    const startPercent = (start / visibleDuration) * 100
    const widthPercent = Math.max(0, ((end - start) / visibleDuration) * 100)

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
            <div
                className={classNames(
                    'absolute inset-x-0 w-full top-1/2 border-t-2',
                    selectedEffectIds.includes(effect.id) &&
                        'border-yellow-200',
                    !selectedEffectIds.includes(effect.id) && 'border-gray-300',
                )}
            ></div>
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
    effect: Effect
}) {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const buttonRef = useRef(null)
    let start = 0
    const duration = useEditorState((state) => state.duration)
    let end = duration

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
    }, [containerRef, effect, start, end])

    const halfWidth = 24

    function getTime(position: { x: number; y: number }) {
        const time =
            start +
            (position.x / containerRef.current!.clientWidth) * (end - start)
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
    effect: Effect
    containerRef: React.RefObject<HTMLDivElement>
}) {
    const halfWidth = 12
    const duration = useEditorState((state) => state.duration)
    const timelineScale = useEditorState((state) => state.timelineScale)
    let start = 0
    let end = duration
    const clipDuration = end - start
    const relativeKeyframeTime = keyframe.time - start
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
        const newAbsoluteTime = start + newRelativeTime

        const snappedTime = snapToTimeGrid(newAbsoluteTime)

        const clampedNewTime = Math.max(start, Math.min(snappedTime, end))

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
                const updatedKeyframes: EditorKeyframe[] =
                    effect.keyframes.filter((kf) => kf.id !== keyframe.id)
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
    return (
        <div
            {...rest}
            style={{ ...rest.style }}
            className={`shrink-0 w-full flex flex-col ${rest.className || ''}`}
        >
            {children}
        </div>
    )
}

function PlayControls() {
    const isPlaying = useEditorState((state) => state.isPlaying)
    const currentTime = useThrottledCurrentTime()
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const duration = useEditorState((state) => state.duration)
    const setCurrentTime = useEditorState((state) => state.setCurrentTime)

    const togglePlay = () => {
        // if (renderLoopId) cancelAnimationFrame(renderLoopId)
        const { isPlaying } = useEditorState.getState()
        console.log('toggle play', isPlaying)
        setIsPlaying(!isPlaying)
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

    const { count, forceRender } = useForceRender()

    useEffect(() => {
        const pane = preparePane(
            new Pane({
                title: '',
                container: container.current || undefined,
            }),
        )

        selectedEffects
            .map((x) => x.node)
            .forEach((effect) => {
                const keyframe = getKeyframeOnCurrentTime().find(
                    (kf) => kf.effect.id === effect.id,
                )?.keyframe
                const params = (() => {
                    const hasKeyframes = effect.keyframes.length > 0
                    if (!hasKeyframes) {
                        return effect.params
                    }

                    if (!keyframe) {
                        return
                    }
                    return keyframe.params
                })()
                if (!params) {
                    return
                }

                const controller = effectControllers[effect.type]
                if (!controller) {
                    console.warn(
                        'No controller found for effect type',
                        effect.type,
                    )
                    return
                }
                const folder = controller.configure({
                    effect,
                    pane,
                    params: params,
                    forceRender,
                })

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

        if (!pane.children.length) {
            pane.dispose()
            return
        }

        return () => {
            pane.dispose()
            threeCanvas.controls.removeEventListener('change', refreshPane)
        }
    }, [selectedEffectIds, currentKeyframes, count])

    const showKeyframeMode = currentKeyframes.length > 0
    const selectedEffect = selectedEffects[0]?.node

    const showKeyframeButton =
        currentKeyframes.length === 0 && !!selectedEffects.length
    return (
        <div className='flex w-full flex-col max-h-full overflow-y-auto'>
            <div className='w-full' ref={container}></div>

            {showKeyframeButton && (
                <button
                    className='flex items-center justify-center mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
