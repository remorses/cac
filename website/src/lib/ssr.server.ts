import OpenAI from 'openai'

import crypto from 'crypto'



export function generatePassword(length = 18) {
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?~'
    return crypto
        .randomBytes(length)
        .reduce((acc, byte) => acc + charset[byte % charset.length], '')
}



// export const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// })
