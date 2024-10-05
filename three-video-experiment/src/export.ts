import { parseMedia } from '@remotion/media-parser'

import { webFileReader } from '@remotion/media-parser/web-file'
import { ArrayBufferTarget, Muxer as MP4Muxer } from 'mp4-muxer'
import { useEditorState } from './state'

import { threeCanvas } from './canvas'
import { getHandleForMediaId, getFileForMediaHandle } from './files'

export const exportVideo = async () => {
    const { mediaHandleId } = useEditorState.getState()
    if (!mediaHandleId) {
        console.log('no media handle id found')
        return
    }
    const mediaHandle = await getHandleForMediaId(mediaHandleId)
    if (!mediaHandle) {
        console.error('No media handle found')
        return
    }
    const media = await getFileForMediaHandle(mediaHandle)
    if (!media) {
        console.error('Failed to get file for media handle')
        return
    }

    const state = useEditorState.getState()
    if (!media.type.startsWith('video/')) {
        // TODO
        console.log('not a video')
        return
    }
    const { setIsPlaying } = useEditorState.getState()
    setIsPlaying(false)
    let maxHeight = 1080
    let maxWidth = 1920
    let width = state.outputSize.width || 1280
    let height = state.outputSize.height || 720
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

        bitrate: 4_000_000, // 5 Mbps for better quality
        framerate: outFps,
        hardwareAcceleration: 'prefer-hardware',
        // latencyMode: 'realtime',
        bitrateMode: 'variable',
    })

    // Stop recording and download video
    async function stopRecording() {
        console.log(`flushing video encoder`)
        await videoEncoder.flush()

        console.log(`finalizing muxer`)
        videoEncoder.close()
        muxer.finalize()

        console.log(`creating blob`)
        const arrayBuffer = muxer.target.buffer
        const blob = new Blob([arrayBuffer], { type: 'video/mp4' })

        console.log(`creating url`)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'recorded-video.mp4'
        console.log(`clicking download link`)
        a.click()
        URL.revokeObjectURL(url)
        threeCanvas.afterExport()
    }

    let timestamp = 0

    threeCanvas.beforeExport()
    let fps: number | null = null
    const result = await parseMedia({
        src: media,
        reader: webFileReader,
        onFps(_fps) {
            fps = _fps
        },
        onVideoTrack: async (track) => {
            console.log('onVideoTrack', track)

            const videoDecoder = new VideoDecoder({
                output: (frame) => {
                    const currentTime = timestamp / 1000 / 1000
                    useEditorState.setState({
                        currentTime,
                    })
                    const shouldRender =
                        currentTime >= state.start &&
                        currentTime <= state.duration
                    if (shouldRender) {
                        threeCanvas.changeImage(frame)
                        threeCanvas.render({ isPreview: false })

                        const outputFrame = new VideoFrame(
                            threeCanvas.renderer.domElement,
                            {
                                timestamp,
                            },
                        )
                        frame.close()

                        videoEncoder.encode(outputFrame)
                        outputFrame.close()
                    } else {
                        frame.close()
                    }
                    if (!fps) {
                        console.warn('no fps found')
                    }
                    const frameDuration = 1000_000 / (fps || 60)
                    timestamp += frameDuration
                },
                error: console.error,
            })
            await videoDecoder.configure(track)

            return async (sample) => {
                if (videoDecoder.decodeQueueSize > 1) {
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
    if (!result.fps) {
        console.warn('no fps in input video found')
    }
    // if (result.durationInSeconds) {
    //     useEditorState.setState({ duration: result.durationInSeconds })
    // }

    await stopRecording()
}
