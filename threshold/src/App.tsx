import { ImageAsset, framer } from 'framer-plugin'
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
import './App.css'

import { assert, bytesFromCanvas, sleep, useAsyncEffect } from './utils'

import { applyImageEffect } from './canvas'

const width = 680
void framer.showUI({ position: 'top left', width, height: 360 })

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
            <div className='flex flex-col gap-3 grow p-3 pt-0 items-center justify-center'>
                <p>Select an Image First</p>
            </div>
        )
    }

    return <RotationsImage image={image} />
}

function RotationsImage({ image }: { image: ImageAsset }) {
    const [rotations, setRotations] = useState({ x: 0, y: 0, z: 0 })
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
    const [ref, { height }] = useMeasure()

    useLayoutEffect(() => {
        console.log('opening framer ui')
        framer.showUI({
            // title: (handle?.handle as any) || '',
            position: 'top left',
            width,
            height: height || 100,
        })
    }, [height])

    const updateCanvas = async () => {
        const bitmap = await image.loadBitmap()

        const canvasPreview = canvasRef.current

        const deg = Math.PI / 180
        let imageBitmap = await applyImageEffect({
            imageBitmap: bitmap,
            rotationX: rotations.x * deg,
            rotationY: rotations.y * deg,
            rotationZ: rotations.z * deg,
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
    }

    const handleRotationChange = useCallback(
        (axis: 'x' | 'y' | 'z', nextValue: number) => {
            startTransition(() => {
                setRotations((prev) => ({ ...prev, [axis]: nextValue }))
            })
        },
        [updateCanvas, rotations],
    )

    useAsyncEffect(async () => {
        await sleep(20)
        await updateCanvas()
    }, [image, rotations])

    return (
        <div
            ref={ref}
            className='shrink-0 w-full grow flex flex-col gap-3 pt-0 p-3'
        >
            <div className='canvas-container'>
                <canvas className='w-full h-full rounded-md' ref={canvasRef} />
                {!hasPainted && <div className='framer-spinner' />}
            </div>

            <div className='grow flex flex-row w-full gap-3'>
                {(['x', 'y', 'z'] as const).map((axis) => (
                    <label className='flex flex-col grow gap-2' key={axis}>
                        {axis.toUpperCase()}:
                        <input
                            type='range'
                            defaultValue={0}
                            min='-20'
                            max='20'
                            className='w-full'
                            value={rotations[axis]}
                            onChange={(event) =>
                                handleRotationChange(
                                    axis,
                                    Number(event.target.value),
                                )
                            }
                        />
                    </label>
                ))}
            </div>

            <Button variant='primary' onClick={handleSaveImage}>
                Save Image
            </Button>
        </div>
    )
}
