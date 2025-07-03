import { describe, it } from 'vitest'
import { resend, defaultResendOptions } from './resend'
import { marked } from 'marked'

describe.skip('resend', async () => {
    it('sends an email using resend', async () => {
        const markdown = `
# Hello from Vitest!

This is a test email sent via **Resend** using markdown rendered to HTML.

You can visit our site at [Unframer](${process.env.PUBLIC_URL}).

Tommy
        `
        const html = await marked.parse(markdown)
        const to = 't.de.rossi.01@gmail.com'
        await resend.emails.send({
            ...defaultResendOptions,
            to,
            subject: 'Vitest Resend Test',
            html,
        })
        console.log('Email sent successfully to', to)
    })
})
