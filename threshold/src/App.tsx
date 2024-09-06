import { ImageAsset, framer } from 'framer-plugin'
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import './App.css'

import { assert, bytesFromCanvas } from './utils'

import Worker from './worker/worker?worker'
import { applyImageEffect } from './canvas'

void framer.showUI({ position: 'top left', width: 480, height: 360 })

function useSelectedImage() {
    const [image, setImage] = useState<ImageAsset | null>(null)

    useEffect(() => {
        return framer.subscribeToImage(setImage)
    }, [])

    return image
}

export function App() {
    const image = useSelectedImage()

    if (!image) {
        return (
            <div className='error-container'>
                <p>Select an Image</p>
            </div>
        )
    }

    return <ThresholdImage image={image} maxWidth={248} maxHeight={400} />
}

const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

function ThresholdImage({
    image,
    maxWidth,
    maxHeight,
}: {
    image: ImageAsset
    maxWidth: number
    maxHeight: number
}) {
    const [threshold, setThreshold] = useState(127)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [hasPainted, setHasPainted] = useState(false)

    const handleSaveImage = async () => {
        const ctx = canvasRef.current?.getContext('2d')
        assert(ctx)

        const originalImage = await image.getData()

        assert(canvasRef.current)
        const nextBytes = await bytesFromCanvas(canvasRef.current)
        assert(nextBytes)

        const start = performance.now()

        framer.hideUI()
        await framer.setImage({
            image: {
                bytes: nextBytes,
                mimeType: originalImage.mimeType,
            },
        })

        void framer.closePlugin('Image saved...')

        console.log('total duration', performance.now() - start)
    }

    const updateCanvas = useMemo(
        () =>
            debounce(async (nextThreshold: number) => {
                const bitmap = await image.loadBitmap()

                const canvasPreview = canvasRef.current

                let imageBitmap = await applyImageEffect({
                    // canvas: canvasPreview,
                    imageBitmap: bitmap,
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                })
                if (canvasPreview) {
                    canvasPreview.width = imageBitmap.width
                    canvasPreview.height = imageBitmap.height
                    const ctx = canvasPreview.getContext('2d')

                    if (ctx) {
                        ctx.drawImage(imageBitmap, 0, 0)
                    } else {
                        console.error('No context found')
                    }
                }

                setHasPainted(true)
            }, 20),
        [image],
    )

    const handleThresholdChange = useCallback(
        (nextValue: number) => {
            startTransition(() => {
                setThreshold(nextValue)
                void updateCanvas(nextValue)
            })
        },
        [updateCanvas],
    )

    useEffect(() => {
        // Start in the middle between 0-255
        void updateCanvas(127)
    }, [image])

    return (
        <div className='container'>
            <div className='canvas-container'>
                <canvas ref={canvasRef} />
                {!hasPainted && <div className='framer-spinner' />}
            </div>

            <input
                type='range'
                min='0'
                max='255'
                value={threshold}
                onChange={(event) =>
                    handleThresholdChange(Number(event.target.value))
                }
            />

            <button onClick={handleSaveImage}>Save Image</button>
        </div>
    )
}
