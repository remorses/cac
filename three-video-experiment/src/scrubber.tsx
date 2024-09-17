import * as React from 'react'
import { useCurrentTime, useEditorState } from './state'

export const scrubberHalfWidth = 16

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
export function Scrubber({ containerRef }) {
    const currentTime = useCurrentTime()
    const visibleDuration = useEditorState(
        (state) => state.duration / state.timelineScale,
    )
    const containerRect = containerRef.current?.getBoundingClientRect()
    const w = containerRect?.width || 0
    const h = containerRect?.height || 0

    const left = ((currentTime / visibleDuration) * w) + (containerRect?.left || 0) - scrubberHalfWidth
    const top = containerRect?.top || 0

    return (
        <>
            <div
                className='fixed pointer-events-none'
                style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    height: `${h}px`,
                    width: scrubberHalfWidth * 2,
                }}
            >
                <div className='relative w-full flex flex-col items-center'>
                    <ScrubberIcon />
                </div>
                <div
                    className='w-[1px] bg-white absolute top-0 h-full left-0 pointer-events-none'
                    style={{
                        left: scrubberHalfWidth,
                    }}
                />
            </div>
        </>
    )
}
