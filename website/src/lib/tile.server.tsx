import sharp from 'sharp'
import path from 'path'

export const targetWidth = 768
export const targetHeight = Math.round((targetWidth * 16) / 9) // 1365

// https://platform.openai.com/docs/guides/vision/calculating-costs
const parts = (targetHeight * targetWidth) / (512 * 512)
const openaiTokensCost = 85 + parts * 170
// console.log('openaiTokensCost per image piece', openaiTokensCost)

export async function splitImage({ imageBuffer, imageKey = '' }) {
    let buffers = [] as Buffer[]

    let image = sharp(imageBuffer)
    const metadata = await image.metadata()
    const totalHeight = metadata.height
    if (!totalHeight) {
        throw new Error('No height found')
    }
    const totalWidth = metadata.width
    if (!totalWidth) {
        throw new Error('No width found')
    }

    const numImages = Math.ceil(totalHeight / targetHeight)
    console.log(`splitting into ${numImages} images`)
    console.time(`splitter ${imageKey}`)

    for (let i = 0; i < numImages; i++) {
        if (i > 0) {
            image = sharp(imageBuffer)
        }
        const top = i * targetHeight
        const left = 0

        const height = Math.min(targetHeight, totalHeight - top - 1)

        // const outputImage = `output_${i + 1}.png`
        // const outputPath = path.join(outputDir, outputImage)
        const outBuffer = await image
            .extract({ left, top, width: totalWidth, height })
            // .resize({
            //     width: targetWidth,
            //     height: targetHeight,
            //     fit: 'contain',
            //     position: 'top',
            //     background: { r: 255, g: 255, b: 255, alpha: 1 },
            // })
            .toBuffer()
        buffers.push(outBuffer)
        image.destroy()

        // console.log(`Image ${outputImage} created successfully.`)
    }
    console.timeEnd(`splitter ${imageKey}`)

    return buffers
}

// splitImage()
