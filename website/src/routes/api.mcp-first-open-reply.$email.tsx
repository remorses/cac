import { href } from 'react-router'
import { prisma } from 'db'
import { env } from 'website/src/lib/env'
import type { Route } from './+types/api.mcp-first-open-reply.$email'
import dedent from 'dedent'

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
        throw new Response('No MCP project found for this user', { status: 404 })
    }

    const projectId = project.projectId
    const projectName = project.projectName || 'without name'

    const githubUrl = new URL(
        href('/api/react-export-plugin/github/repo/:projectId', {
            projectId,
        }),
        env.PUBLIC_URL,
    )

    const markdown = dedent`
    Hey,

    Here's the GitHub repo with your Framer components in "${projectName}":

    ${githubUrl.toString()}

    The repo includes:
    - Example code showing how to integrate the React components
    - Live preview URL (link in the README)

    Tommy
    `

    return new Response(markdown, {
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}
