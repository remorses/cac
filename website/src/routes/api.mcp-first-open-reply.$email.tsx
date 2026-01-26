import { href } from 'react-router'
import { prisma } from 'db'
import { env } from 'website/src/lib/env'
import type { Route } from './+types/api.mcp-first-open-reply.$email'
import dedent from 'string-dedent'

const html = dedent

export async function loader({ params }: Route.LoaderArgs) {
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
    const projectName = project.projectName || 'without name'

    const githubUrl = new URL(
        href('/api/react-export-plugin/github/repo/:projectId', {
            projectId,
        }),
        env.PUBLIC_URL,
    )
    const { 0: firstName } = ((user.raw_user_meta_data as any)?.full_name ?? "").split(" ")

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

    // HTML version with clickable "Here" link for rich text email clients like Spark
    const richTextContent = dedent`
        Here's the GitHub repo: <a href="${githubUrl.toString()}">Here</a>

        The repo includes:
        - Example code showing how to integrate the React components
        - Live preview URL

        Next time you want to export to React you can ask the MCP or use the React Export plugin: <a href="https://www.framer.com/marketplace/plugins/react-export/">Here</a>

        PS: Keep in mind this repo is just an example, the demo will not look great at first without updating App.tsx and exporting the components you want

        Best,
        Tommy
    `

    const htmlContent = html`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>MCP First Open Reply</title>
                <style>
                    body {
                        font-family:
                            -apple-system, BlinkMacSystemFont, 'Segoe UI',
                            Roboto, sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    pre {
                        background: #f5f5f5;
                        padding: 20px;
                        border-radius: 8px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    .status {
                        padding: 10px;
                        margin-bottom: 20px;
                        border-radius: 4px;
                        background: #4caf50;
                        color: white;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="status">✓ Copied to clipboard!</div>
                <pre id="content">
                    ${plainTextContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre
                >
                <script>
                    const plainText = ${JSON.stringify(plainTextContent)}
                    const richText = ${JSON.stringify(richTextContent)}
                    
                    // Copy both plain text and HTML so email clients like Spark render clickable links
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'text/plain': new Blob([plainText], { type: 'text/plain' }),
                            'text/html': new Blob([richText], { type: 'text/html' }),
                        })
                    ]).catch((err) => {
                        console.error('Failed to copy:', err)
                    })
                </script>
            </body>
        </html>
    `

    return new Response(htmlContent, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
