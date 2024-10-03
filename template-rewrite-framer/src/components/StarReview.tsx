import React, { useRef, useState } from 'react'

const Star = ({ filled, onClick }) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <path
                fill={filled ? '#FFD700' : '#D3D3D3'}
                d='M8.125 7.092L12 1.937l3.875 5.155l6.139 2.07l-3.941 5.336l.156 6.056L12 18.733l-6.229 1.82l.156-6.08l-3.915-5.312z'
                style={{ opacity: filled ? 1 : 0.5 }}
            />
        </svg>
    )
}

export function StarReview({
    value,
    onChange,
    ...otherProps
}: {
    value: number
    onChange: (star: number) => void
    [key: string]: any
}) {
    const handleStarClick = (star: number) => {
        onChange(star)
    }

    return (
        <div className='flex items-center gap-2' {...otherProps}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    filled={star <= value}
                    onClick={() => handleStarClick(star)}
                />
            ))}
        </div>
    )
}
