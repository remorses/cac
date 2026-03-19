import { href } from 'react-router'
import { prisma } from 'db'
import { env } from 'website/src/lib/env'
import type { Route } from './+types/api.mcp-first-open-reply.$email'
import dedent from 'string-dedent'

const html = dedent

export async function loader({ params, request }: Route.LoaderArgs) {
    const { email } = params

    const user = await prisma.users.findFirst({
        where: { email },
    })

    if (!user) {
        throw new Response('User not found', { status: 404 })
    }

    const project = await prisma.reactExportProject.findFirst({
        where: {
            orgId: user.id,
            creationReason: 'MCP_FIRST_OPEN',
        },
        orderBy: {
            createdAt: 'asc',
        },
    })

    if (!project) {
        throw new Response('No MCP project found for this user', {
            status: 404,
        })
    }

    const projectId = project.projectId

    const githubUrl = new URL(
        href('/api/react-export-plugin/github/repo/:projectId', {
            projectId,
        }),
        env.PUBLIC_URL,
    )

    // HTML version with clickable links for email clients like Spark
    const richTextContent = [
        `You can access the Framer example repo <a href="${githubUrl.toString()}">here</a>`,
        ``,
        `The repo includes:`,
        `- Example code showing how to integrate the React components`,
        `- Live preview URL`,
        ``,
        `Next time you want to export to React you can ask the MCP or use the <a href="https://www.framer.com/marketplace/plugins/react-export/">React Export plugin</a>`,
        ``,
        `PS: Keep in mind this repo is just an example, the demo will not look great at first without updating App.tsx and exporting the components you want`,
        ``,
        `Let me know if you have feedback!`,
        ``,
        `Best,`,
        `Tommy`,
    ].join('<br>')

    // Non-browser clients (curl, agents) get just the raw email HTML body
    const accept = request.headers.get('accept') || ''
    if (!accept.includes('text/html')) {
        return new Response(richTextContent, {
            headers: { 'Content-Type': 'text/html' },
        })
    }

    // Browser: show page that copies content to clipboard
    const plainTextContent = dedent`
        Here's the GitHub repo:

        ${githubUrl.toString()}

        The repo includes:
        - Example code showing how to integrate the React components
        - Live preview URL

        Next time you want to export to React you can ask the MCP or use the React Export plugin: https://www.framer.com/marketplace/plugins/react-export/

        PS: Keep in mind this repo is just an example, the demo will not look great at first without updating App.tsx and exporting the components you want

        Best,
        Tommy
    `

    const htmlContent = html`
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>MCP Reply</title>
                <style>
                    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; line-height: 1.6; }
                    pre { background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
                    .ok { padding: 10px; margin-bottom: 20px; border-radius: 4px; background: #4caf50; color: white; text-align: center; }
                </style>
            </head>
            <body>
                <div class="ok">Copied to clipboard</div>
                <pre>${plainTextContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <script>
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'text/plain': new Blob([${JSON.stringify(plainTextContent)}], { type: 'text/plain' }),
                            'text/html': new Blob([${JSON.stringify(richTextContent)}], { type: 'text/html' }),
                        })
                    ]).catch(console.error)
                </script>
            </body>
        </html>
    `

    return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
    })
}
