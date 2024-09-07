import { ImageAsset, framer } from 'framer-plugin'
import { Endpoint, expose, transfer } from 'comlink'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const deg = Math.PI / 360
import useMeasure from 'react-use-measure'
import { Button } from 'template-rewrite-framer/src/components/Button'

import {
    startTransition,
    useCallback,
    useDeferredValue,
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

let canvas: HTMLCanvasElement = document.createElement('canvas')
canvas.className = 'rounded-md !max-w-full !h-auto'

const scene = new THREE.Scene()
scene.scale.y = -1 // TODO not sure why this is needed. the scene is flipped

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

const texture = new THREE.Texture()
texture.flipY = false

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
camera.updateProjectionMatrix()

const geometry = new THREE.PlaneGeometry(1, 1)
const material = new THREE.MeshBasicMaterial({ map: texture })
const plane = new THREE.Mesh(geometry, material)

scene.add(plane)
camera.position.z = 0.6

function CanvasComponent({ ...rest }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Append the canvas to the container when the component mounts
        if (containerRef.current) {
            containerRef.current.appendChild(canvas)
        }

        // Clean up function to remove the canvas when the component unmounts
        return () => {
            if (containerRef.current) {
                containerRef.current.removeChild(canvas)
            }
        }
    }, [])

    return <div {...rest} ref={containerRef}></div>
}

function RotationsImage({ image }: { image: ImageAsset }) {
    const [rotations, setRotations] = useState({ x: 0, y: 0, z: 0 })
    const canvasRef = useRef<HTMLCanvasElement>()
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
        const { x: rotationX, y: rotationY, z: rotationZ } = rotations
        texture.image = bitmap
        texture.needsUpdate = true
        const aspectRatio = bitmap.width / bitmap.height

        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
        plane.scale.set(aspectRatio, 1, 1)

        console.log(
            'texture size',
            texture.image.width,
            texture.image.height,
            bitmap.width,
            bitmap.height,
        )
        renderer.setSize(bitmap?.width, bitmap?.height)
        renderer.setViewport(0, 0, bitmap.width, bitmap.height)
        plane.rotation.set(rotationX * deg, rotationY * deg, rotationZ * deg)

        camera.lookAt(plane.position)
        const composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))

        const bokehPass = new BokehPass(scene, camera, {
            focus: camera.position.z,
            aperture: 0.1,
            maxblur: 0.03,
        })
        composer.addPass(bokehPass)

        // Determine the most prominent rotation axis
        const absRotations = {
            x: Math.abs(rotationX),
            y: Math.abs(rotationY),
            // z: Math.abs(rotationZ),
        }
        const prominentAxis = maxKey(absRotations)

        let edge = 0 // Default to right edge

        switch (prominentAxis) {
            case 'x':
                edge = rotationX > 0 ? 3 : 2 // Bottom if positive, top if negative
                break
            case 'y':
                edge = rotationY > 0 ? 0 : 1 // Right if positive, left if negative
                break
        }

        const vignetteShader = new VignetteShader(edge)
        const vignettePass = new ShaderPass(vignetteShader)
        composer.addPass(vignettePass)
        composer.render()

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

    useAsyncEffect(
        async (controller) => {
            await sleep(50)
            if (controller.signal.aborted) {
                return
            }
            await updateCanvas()
        },
        [image, rotations],
    )

    return (
        <div
            ref={ref}
            className='shrink-0 w-full grow flex flex-col gap-3 pt-0 p-3'
        >
            <div className='canvas-container'>
                <CanvasComponent className='flex flex-col rounded-md' />
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

class VignetteShader {
    uniforms: {
        tDiffuse: { value?: THREE.Texture | null }
        offset: { value: number }
        darkness: { value: number }
        edge: { value: number }
    }
    vertexShader: string
    fragmentShader: string
    constructor(edge: number) {
        this.uniforms = {
            tDiffuse: { value: null },
            offset: { value: 1 },
            darkness: { value: 1 },
            edge: { value: edge }, // Parametrize edge
        }
        this.vertexShader = `
          varying vec2 vUv;
          void main() {
              vUv = uv; // Pass UV coordinates to the fragment shader
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Set the position of the vertex
          }
      `
        this.fragmentShader = `
          uniform sampler2D tDiffuse; // The texture to apply the vignette effect to
          uniform float offset; // The offset value for the vignette effect
          uniform float darkness; // The darkness value for the vignette effect
          uniform int edge; // The edge to apply the vignette effect to
          varying vec2 vUv; // The UV coordinates passed from the vertex shader
          void main() {
              vec4 texel = texture2D(tDiffuse, vUv); // Get the color of the current pixel
              vec2 uv = (vUv - 0.5) * 2.0; // Transform UV coordinates to range [-1, 1]
              float vignetteAmount;
              if (edge == 0) { // Apply vignette effect on the right edge
                  vignetteAmount = 1.0 - uv.x;
              } else if (edge == 1) { // Apply vignette effect on the left edge
                  vignetteAmount = 1.0 + uv.x;
              } else if (edge == 2) { // Apply vignette effect on the top edge
                  vignetteAmount = 1.0 - uv.y;
              } else if (edge == 3) { // Apply vignette effect on the bottom edge
                  vignetteAmount = 1.0 + uv.y;
              }
              vignetteAmount = min(vignetteAmount, smoothstep(0.0, offset, vignetteAmount)); // Apply only if it darkens the image
              texel.rgb = mix(texel.rgb, texel.rgb * vignetteAmount, darkness); // Mix the original color with the vignette effect
              gl_FragColor = texel; // Set the final color of the pixel
          }
      `
    }
}

const maxKey = (obj: { [key: string]: number }) => {
    return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b))
}
