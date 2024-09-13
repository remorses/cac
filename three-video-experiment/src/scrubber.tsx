import * as React from 'react'
import { useCurrentTime, useEditorState } from './state'

export const scrubberHalfWidth = 16

interface Props {
    timelineHeight: number
    containerRef: React.RefObject<HTMLElement>
}

export interface DragOrigin {
    pointerX: number
    time: number
}

export function ScrubberIcon() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='10' height='20'>
            <path
                d='M 0 2.25 C 0 1.145 0.895 0.25 2 0.25 L 9 0.25 C 10.105 0.25 11 1.145 11 2.25 L 11 14.997 C 11 15.721 10.609 16.388 9.977 16.742 L 5.5 19.25 L 1.023 16.742 C 0.391 16.388 0 15.721 0 14.997 Z'
                fill='currentColor'
            ></path>
        </svg>
    )
}
export function Scrubber({ timelineHeight, containerRef }: Props) {
    const scale = useEditorState((state) => state.scale)
    const currentTime = useCurrentTime()
    const duration = useEditorState((state) => state.duration)
    const setIsPlaying = useEditorState((state) => state.setIsPlaying)
    const [dragging, setDragging] = React.useState(false)
    const w = containerRef.current?.clientWidth || 0

    return (
        <>
            <div
                className='absolute pointer-events-none bottom-0 min-h-full top-0'
                style={{
                    left: `${(currentTime / duration) * w - scrubberHalfWidth}px`,
                    cursor: dragging ? 'grabbing' : 'grab',
                    width: scrubberHalfWidth * 2,
                }}
            >
                <div className='relative w-full flex flex-col items-center top-0 '>
                    <ScrubberIcon />
                </div>
                <div
                    className='w-[1px] bg-white absolute top-0 h-full left-0 pointer-events-none'
                    style={{
                        left: scrubberHalfWidth,
                    }}
                    // onPointerDown={(e) => e.stopPropagation()}
                />
            </div>
        </>
    )
}
